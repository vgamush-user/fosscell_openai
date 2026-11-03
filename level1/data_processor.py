import gc
import marshal
import os
import sys
from array import array
from bisect import bisect_left, bisect_right
from itertools import compress

INPUT_NAME = "requests.log"
OUTPUT_NAME = "summary.txt"
TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S.%f%z"   # only used by the fallback

CHUNK = int(os.environ.get("A_INGEST_CHUNK", 256 * 1024))   # bytes per cache-sized chunk
PIECE = 1 << 20          # max elements sorted at once inside one group
MAX_TASKS = 8192         # the task queue is a pipe; 8192 * 4 bytes fits its 64 KiB buffer

HOUR_LEN = 13            # len("YYYY-MM-DDTHH")
HOUR_END = b"\x7f"       # sorts after every byte that can follow the hour prefix

# status first-digit -> 1 for '5', else 0
_T5 = bytes(1 if i == 53 else 0 for i in range(256))


class Fallback(Exception):
    """The input is not what the fast path assumes; use the reference algorithm."""


class WorkerFailed(Exception):
    """A child process died for a reason unrelated to the data (e.g. out of memory)."""


# --------------------------------------------------------------------------- #
# phase 1: parsing                                                            #
# --------------------------------------------------------------------------- #

def _ts_ok(t):
    # "YYYY-MM-DDTHH:MM:SS.f...Z"  (the reference requires a fraction)
    return (len(t) >= 22 and t[-1] == 90 and t[10] == 84 and t[4] == 45
            and t[7] == 45 and t[13] == 58)


def _count_errors(eps, sts, m):
    """Return {endpoint: number of 5xx} for one hour-segment of m lines."""
    js = b"".join(sts)
    if len(js) == 3 * m:                       # every status is exactly 3 bytes
        first = js[0::3]
        c = first.count(b"5")
        if not c:
            return {}
        sel = first.translate(_T5)
    else:                                      # unusual widths: exact int() semantics
        s5 = {s for s in set(sts) if 500 <= int(s) <= 599}
        if not s5:
            return {}
        sel = bytes(map(s5.__contains__, sts))
        c = sel.count(1)
        if not c:
            return {}
    errs = {}
    get = errs.get
    if c * 6 < m:
        k = sel.find(1)
        while k >= 0:
            e = eps[k]
            errs[e] = get(e, 0) + 1
            k = sel.find(1, k + 1)
    else:
        for e in compress(eps, sel):
            errs[e] = get(e, 0) + 1
    return errs


def _add_segment(h, eps, sts, lats, acc):
    """All lines share the hour label h."""
    d = {}
    for e, l in zip(eps, lats):
        try:
            d[e].append(l)
        except KeyError:
            d[e] = [l]
    errs = _count_errors(eps, sts, len(eps))
    eget = errs.get
    for e, toks in d.items():
        key = (h, e)
        try:
            arr = array("I", map(int, toks))
        except (OverflowError, ValueError):
            raise Fallback
        a = acc.get(key)
        if a is None:
            acc[key] = [eget(e, 0), arr]
        else:
            a[0] += eget(e, 0)
            a[1].extend(arr)


def _add_general(ts, eps, sts, lats, acc):
    """Arbitrary hour mix inside the chunk: key every line."""
    s5 = {s for s in set(sts) if 500 <= int(s) <= 599}
    d = {}
    for t, e, s, l in zip(ts, eps, sts, lats):
        k = (t[:HOUR_LEN], e)
        try:
            r = d[k]
        except KeyError:
            r = d[k] = [[], 0]
        r[0].append(l)
        if s in s5:
            r[1] += 1
    for key, (toks, n5) in d.items():
        try:
            arr = array("I", map(int, toks))
        except (OverflowError, ValueError):
            raise Fallback
        a = acc.get(key)
        if a is None:
            acc[key] = [n5, arr]
        else:
            a[0] += n5
            a[1].extend(arr)


def parse_chunk(buf, acc):
    """buf holds whole lines."""
    tok = buf.split()
    ntok = len(tok)
    if not ntok:
        return
    n = buf.count(b"\n")
    if buf[-1] != 10:
        n += 1
    if ntok != 5 * n:
        raise Fallback
    ts = tok[0::5]
    if not (_ts_ok(ts[0]) and _ts_ok(ts[-1]) and _ts_ok(ts[n >> 1])):
        raise Fallback
    eps = tok[2::5]
    sts = tok[3::5]
    lats = tok[4::5]
    del tok

    if ts == sorted(ts):
        # time ordered: one segment per hour, found by bisection
        i = 0
        while i < n:
            h = ts[i][:HOUR_LEN]
            if ts[-1][:HOUR_LEN] == h:
                j = n
            else:
                j = bisect_left(ts, h + HOUR_END, i, n)
            if i == 0 and j == n:
                _add_segment(h, eps, sts, lats, acc)
            else:
                _add_segment(h, eps[i:j], sts[i:j], lats[i:j], acc)
            i = j
        return

    # not ordered; if the whole chunk is inside one hour, one segment is still enough
    h = ts[0][:HOUR_LEN]
    q = n >> 2
    if (ts[q][:HOUR_LEN] == h and ts[n >> 1][:HOUR_LEN] == h
            and ts[n - 1 - q][:HOUR_LEN] == h and ts[-1][:HOUR_LEN] == h
            and min(ts)[:HOUR_LEN] == h and max(ts)[:HOUR_LEN] == h):
        _add_segment(h, eps, sts, lats, acc)
        return
    _add_general(ts, eps, sts, lats, acc)


def process_range(fd, a, b, acc):
    """Parse the whole lines in bytes [a, b)."""
    pos = a
    while pos < b:
        rem = b - pos
        if rem <= CHUNK + (CHUNK >> 1):
            buf = os.pread(fd, rem, pos)
            if len(buf) != rem:
                raise Fallback          # file changed under us
        else:
            size = CHUNK
            while True:
                buf = os.pread(fd, size, pos)
                cut = buf.rfind(b"\n") + 1
                if cut:
                    break
                if size >= rem:
                    raise Fallback
                size = min(size * 2, rem)
            if cut != len(buf):
                buf = buf[:cut]
        pos += len(buf)
        parse_chunk(buf, acc)


# --------------------------------------------------------------------------- #
# plumbing: CPUs, tasks, fork helpers                                         #
# --------------------------------------------------------------------------- #

_CPUS = None


def cpu_budget():
    global _CPUS
    if _CPUS is None:
        _CPUS = _cpu_budget()
    return _CPUS


def _cpu_budget():
    n = os.environ.get("A_INGEST_WORKERS")
    if n:
        return max(1, int(n))
    f = getattr(os, "process_cpu_count", None)
    if f is not None:
        n = f() or 1
    else:
        try:
            n = len(os.sched_getaffinity(0))
        except AttributeError:
            n = os.cpu_count() or 1
    # honour a cgroup CPU quota (containers)
    try:
        with open("/sys/fs/cgroup/cpu.max") as fh:
            quota, period = fh.read().split()[:2]
        if quota != "max":
            n = min(n, max(1, -(-int(quota) // int(period))))
    except (OSError, ValueError):
        try:
            with open("/sys/fs/cgroup/cpu/cpu.cfs_quota_us") as fh:
                quota = int(fh.read())
            with open("/sys/fs/cgroup/cpu/cpu.cfs_period_us") as fh:
                period = int(fh.read())
            if quota > 0 and period > 0:
                n = min(n, max(1, -(-quota // period)))
        except (OSError, ValueError):
            pass
    return max(1, n)


def _advise(fd):
    try:
        os.posix_fadvise(fd, 0, 0, os.POSIX_FADV_SEQUENTIAL)
    except (AttributeError, OSError):
        pass


def line_bounds(fd, size, ntasks):
    """ntasks+1 increasing offsets; every inner one is the start of a line."""
    bounds = [0]
    for k in range(1, ntasks):
        p = max(size * k // ntasks - 1, bounds[-1])
        while True:
            buf = os.pread(fd, 65536, p)
            if not buf:
                p = size
                break
            i = buf.find(b"\n")
            if i >= 0:
                p += i + 1
                break
            p += len(buf)
        bounds.append(min(p, size))
    bounds.append(size)
    return bounds


def spawn(fn):
    """Fork; the child runs fn() and writes its bytes to a pipe.  -> (pid, read_fd)."""
    r, w = os.pipe()
    pid = os.fork()
    if pid:
        os.close(w)
        return pid, r
    code = 1
    try:
        os.close(r)
        blob = fn()
        view = memoryview(blob)
        while len(view):
            view = view[os.write(w, view):]
        code = 0
    except Fallback:
        code = 3
    except BaseException:
        pass
    finally:
        os._exit(code)


def collect(children):
    """children: [(pid, fd)] -> [bytes]; raises Fallback if any child failed."""
    out = []
    codes = []
    for pid, fd in children:
        with os.fdopen(fd, "rb", buffering=0) as fh:
            out.append(fh.read())
        _, status = os.waitpid(pid, 0)
        codes.append(os.waitstatus_to_exitcode(status))
    if 3 in codes:
        raise Fallback
    if any(codes):
        raise WorkerFailed
    return out


# --------------------------------------------------------------------------- #
# phase 2: ranks                                                              #
# --------------------------------------------------------------------------- #

def ranks_of(pieces):
    """pieces: list of bytes-like uint32 buffers of one group -> (n, p50, p95, p99)."""
    arr = array("I")
    for p in pieces:
        arr.frombytes(p)
    n = len(arr)
    rk = ((50 * n + 99) // 100, (95 * n + 99) // 100, (99 * n + 99) // 100)

    if n <= PIECE:
        if n >= 20000 and len(set(arr[:4096])) * 5 < 2 * 4096:
            res = _histogram_ranks(arr, rk)
            if res is not None:
                return (n,) + res
        v = arr.tolist()
        v.sort()
        return n, v[rk[0] - 1], v[rk[1] - 1], v[rk[2] - 1]

    if len(set(arr[:4096])) * 5 < 2 * 4096:
        res = _histogram_ranks(arr, rk)
        if res is not None:
            return (n,) + res
    # big group: sort PIECE elements at a time, then find each rank by bisecting the value
    runs = []
    for i in range(0, n, PIECE):
        v = arr[i:i + PIECE].tolist()
        v.sort()
        runs.append(array("I", v))
    del arr
    lo0 = min(r[0] for r in runs)
    hi0 = max(r[-1] for r in runs)
    out = []
    for r in rk:
        lo, hi = lo0, hi0
        while lo < hi:
            mid = (lo + hi) >> 1
            cnt = 0
            for run in runs:
                cnt += bisect_right(run, mid)
            if cnt >= r:
                hi = mid
            else:
                lo = mid + 1
        out.append(lo)
    return (n,) + tuple(out)


def _histogram_ranks(arr, rk):
    """Counting version for groups with few distinct values; None if it gets too big."""
    from collections import Counter
    c = Counter()
    step = 1 << 21
    for i in range(0, len(arr), step):
        c.update(arr[i:i + step])
        if len(c) > 2_000_000:
            return None
    out = []
    cum = 0
    t = 0
    for k in sorted(c):
        cum += c[k]
        while t < 3 and cum >= rk[t]:
            out.append(k)
            t += 1
        if t == 3:
            break
    return tuple(out)


# --------------------------------------------------------------------------- #
# driver                                                                      #
# --------------------------------------------------------------------------- #

def fast_main(data_dir, out_dir, single=False):
    path = os.path.join(data_dir, INPUT_NAME)
    fd = os.open(path, os.O_RDONLY)
    _advise(fd)
    try:
        size = os.fstat(fd).st_size
        groups = {}                      # (hour, endpoint) -> [errs, [buffers]]
        if size:
            workers = 1 if single else cpu_budget()
            if size < (1 << 21):
                workers = 1
            task = max(1 << 21, min(64 << 20, size // (workers * 8)))
            ntasks = max(1, min(MAX_TASKS, -(-size // task)))
            bounds = line_bounds(fd, size, ntasks)
            tasks = [(bounds[i], bounds[i + 1]) for i in range(ntasks) if bounds[i + 1] > bounds[i]]
            workers = min(workers, len(tasks))

            if workers == 1:
                acc = {}
                for a, b in tasks:
                    process_range(fd, a, b, acc)
                for key, (errs, arr) in acc.items():
                    groups[key] = [errs, [arr.tobytes()]]
            else:
                qr, qw = os.pipe()
                os.write(qw, b"".join(i.to_bytes(4, "little") for i in range(len(tasks))))
                os.close(qw)

                def work():
                    wfd = os.open(path, os.O_RDONLY)     # own descriptor: own readahead state
                    _advise(wfd)
                    acc = {}
                    while True:
                        t = os.read(qr, 4)
                        if len(t) < 4:
                            break
                        a, b = tasks[int.from_bytes(t, "little")]
                        process_range(wfd, a, b, acc)
                    return marshal.dumps({k: (v[0], v[1].tobytes()) for k, v in acc.items()})

                children = [spawn(work) for _ in range(workers)]
                os.close(qr)
                for blob in collect(children):
                    for key, (errs, data) in marshal.loads(blob).items():
                        g = groups.get(key)
                        if g is None:
                            groups[key] = [errs, [data]]
                        else:
                            g[0] += errs
                            g[1].append(data)
                    del blob
    finally:
        os.close(fd)

    # ---- phase 2: ranks, in parallel, biggest groups first ----
    keys = sorted(groups)
    total = sum(len(p) for g in groups.values() for p in g[1])
    results = {}
    nproc = 1 if single else min(cpu_budget(), len(keys))
    if nproc <= 1 or total < (1 << 20):
        for key in keys:
            results[key] = ranks_of(groups[key][1])
    else:
        order = sorted(keys, key=lambda k: -sum(len(p) for p in groups[k][1]))
        bins = [[] for _ in range(nproc)]
        load = [0] * nproc
        for key in order:                                   # longest-processing-time first
            i = load.index(min(load))
            bins[i].append(key)
            load[i] += sum(len(p) for p in groups[key][1]) or 1

        def make(mine):
            def run():
                return marshal.dumps({k: ranks_of(groups[k][1]) for k in mine})
            return run
        children = [spawn(make(b)) for b in bins]
        for blob in collect(children):
            results.update(marshal.loads(blob))

    lines = []
    for key in keys:
        h, e = key
        errs = groups[key][0]
        n, p50, p95, p99 = results[key]
        lines.append(b"%b:00:00Z %b %d %d %d %d %d %d\n"
                     % (h, e, n, p50, p95, p99, errs, errs * 1_000_000 // n))
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, OUTPUT_NAME), "wb") as f:
        f.write(b"".join(lines))


# --------------------------------------------------------------------------- #
# reference algorithm (fallback, byte-for-byte the original behaviour)        #
# --------------------------------------------------------------------------- #

def _percentile(sorted_values, p):
    n = len(sorted_values)
    rank = (p * n + 99) // 100
    return sorted_values[rank - 1]


def reference_main(data_dir, out_dir):
    from datetime import datetime
    latencies = {}
    errors = {}
    with open(os.path.join(data_dir, INPUT_NAME), encoding="utf-8") as f:
        for line in f:
            ts, method, endpoint, status, latency_us = line.rstrip("\n").split(" ")
            when = datetime.strptime(ts, TIMESTAMP_FORMAT)
            hour = when.replace(minute=0, second=0, microsecond=0)
            key = (hour, endpoint)
            if key not in latencies:
                latencies[key] = []
                errors[key] = 0
            latencies[key].append(int(latency_us))
            if 500 <= int(status) <= 599:
                errors[key] += 1
    lines = []
    for key in sorted(latencies):
        hour, endpoint = key
        values = sorted(latencies[key])
        count = len(values)
        errs = errors[key]
        ppm = errs * 1_000_000 // count
        lines.append(
            f"{hour.strftime('%Y-%m-%dT%H:00:00Z')} {endpoint} {count} "
            f"{_percentile(values, 50)} {_percentile(values, 95)} {_percentile(values, 99)} "
            f"{errs} {ppm}\n"
        )
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, OUTPUT_NAME), "w", encoding="utf-8", newline="\n") as f:
        f.write("".join(lines))


def main(data_dir, out_dir):
    gc.disable()
    try:
        fast_main(data_dir, out_dir)
    except Fallback:                     # input is not what the fast path assumes
        reference_main(data_dir, out_dir)
    except Exception:                    # fork/OOM/etc.: retry without processes first
        try:
            fast_main(data_dir, out_dir, single=True)
        except Exception:
            reference_main(data_dir, out_dir)


def _parse_args(argv):
    data, out = "/data", "/out"
    it = iter(argv)
    for a in it:
        if a in ("--data", "--out"):
            try:
                v = next(it)
            except StopIteration:
                sys.exit("error: argument %s: expected one argument" % a)
            if a == "--data":
                data = v
            else:
                out = v
        elif a.startswith("--data="):
            data = a[7:]
        elif a.startswith("--out="):
            out = a[6:]
        elif a in ("-h", "--help"):
            print("usage: a_ingest_fast.py [--data DATA] [--out OUT]")
            sys.exit(0)
        else:
            sys.exit("error: unrecognized argument: %s" % a)
    return data, out


# Numerical dataset API required by the Level 1/2 exercises.
import csv
import math
from typing import Iterable, Optional, Union

Number = Union[int, float]


class DataProcessor:
    """Store finite numbers and compute population statistics.

    Batch additions and CSV imports validate every item before changing data.
    """

    def __init__(self, initial_data: Optional[Iterable[Number]] = None):
        self.data = []
        if initial_data is not None:
            self.batch_add(initial_data)

    @staticmethod
    def _number(item: Number) -> Number:
        if isinstance(item, bool) or not isinstance(item, (int, float)):
            raise TypeError("Expected an int or float (not bool)")
        if isinstance(item, float) and not math.isfinite(item):
            raise ValueError("Numbers must be finite")
        return item

    def _require_data(self):
        if not self.data:
            raise ValueError("Dataset is empty")

    def add_data(self, item: Number) -> None:
        self.data.append(self._number(item))

    def batch_add(self, items: Iterable[Number]) -> None:
        values = [self._number(item) for item in items]
        self.data.extend(values)

    def calculate_mean(self) -> float:
        self._require_data()
        return math.fsum(self.data) / len(self.data)

    def calculate_median(self) -> float:
        self._require_data()
        values = sorted(self.data)
        middle = len(values) // 2
        if len(values) % 2:
            return values[middle]
        return values[middle - 1] / 2 + values[middle] / 2

    def calculate_variance(self) -> float:
        mean = self.calculate_mean()
        return math.fsum((value - mean) ** 2 for value in self.data) / len(self.data)

    def calculate_std_dev(self) -> float:
        return math.sqrt(self.calculate_variance())

    def get_summary_statistics(self) -> dict:
        self._require_data()
        variance = self.calculate_variance()
        return dict(count=len(self.data), mean=self.calculate_mean(),
                    median=self.calculate_median(), variance=variance,
                    std_dev=math.sqrt(variance), min=min(self.data), max=max(self.data))

    def filter_data(self, min_val: Number, max_val: Number) -> list:
        self._number(min_val)
        self._number(max_val)
        if min_val > max_val:
            raise ValueError("min_val must not exceed max_val")
        return [value for value in self.data if min_val <= value <= max_val]

    def transform_data(self, factor: Number, offset: Number = 0) -> None:
        self._number(factor)
        self._number(offset)
        values = [self._number(value * factor + offset) for value in self.data]
        self.data[:] = values

    def export_to_csv(self, filepath: str) -> None:
        with open(filepath, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["value"])
            writer.writerows([value] for value in self.data)

    def load_from_csv(self, filepath: str) -> None:
        values = []
        with open(filepath, newline="", encoding="utf-8") as handle:
            reader = csv.reader(handle)
            if next(reader, None) != ["value"]:
                raise ValueError("CSV must have a single 'value' header")
            for row in reader:
                if len(row) != 1:
                    raise ValueError("Each CSV row must contain one number")
                try:
                    value = int(row[0])
                except ValueError:
                    value = float(row[0])
                values.append(self._number(value))
        self.data[:] = values


if __name__ == "__main__":
    main(*_parse_args(sys.argv[1:]))
    sys.exit(0)