# Data processor

## Overview
`DataProcessor` ingests finite numerical datasets, computes statistics, filters
values, applies linear transformations, and persists data in CSV files.
The supplied file originally contained a separate HTTP request-log processor,
not the class named in the assignment. That command-line processor is preserved;
the numerical API has been added without replacing it.

## Requirements & setup
Python 3.7+; no third-party packages. The numerical API uses `math`, `csv`, and
`typing`. The existing log processor also uses standard-library modules including
`gc`, `marshal`, `os`, `sys`, `array`, `bisect`, `itertools`, and `datetime`.
From this directory, import with `from data_processor import DataProcessor`.
Running `python data_processor.py --data INPUT_DIR --out OUTPUT_DIR` runs the
**log processor**, reading `requests.log` and writing `summary.txt`.
Its fast path uses POSIX facilities; other platforms use the reference fallback.

## API reference
`Number` means `int` or `float`, excluding booleans; floats must be finite.
`data` is the stored list; use the API to preserve validation.

| Method signature | Parameters | Return value | Exceptions |
| --- | --- | --- | --- |
| `__init__(initial_data: Optional[Iterable[Number]] = None)` | Optional initial numbers | New processor | `TypeError` for invalid types/noniterable input; `ValueError` for nonfinite floats |
| `add_data(item: Number) -> None` | One number | Appends in place | `TypeError`, `ValueError` as above |
| `batch_add(items: Iterable[Number]) -> None` | Iterable of numbers | Appends all, after validation | `TypeError`, `ValueError`; no partial additions |
| `calculate_mean() -> float` | None | Arithmetic mean | `ValueError` if empty |
| `calculate_median() -> float` | None | Middle value, or mean of middle two (may return an integer for odd count) | `ValueError` if empty |
| `calculate_variance() -> float` | None | Population variance, denominator N | `ValueError` if empty |
| `calculate_std_dev() -> float` | None | Square root of population variance | `ValueError` if empty |
| `get_summary_statistics() -> dict` | None | `count`, `mean`, `median`, `variance`, `std_dev`, `min`, `max` | `ValueError` if empty |
| `filter_data(min_val: Number, max_val: Number) -> list` | Inclusive bounds | New list; dataset unchanged | `TypeError` for invalid bounds; `ValueError` for nonfinite/reversed bounds |
| `transform_data(factor: Number, offset: Number = 0) -> None` | Multiplier and offset | Replaces values with `value * factor + offset` | `TypeError`, `ValueError`; validates before mutation |
| `export_to_csv(filepath: str) -> None` | Output path | Writes UTF-8 CSV with single `value` header; overwrites file | `OSError`/subclasses, `TypeError` for invalid path |
| `load_from_csv(filepath: str) -> None` | Input path | Replaces dataset after complete validation | `OSError`, `UnicodeError`, `csv.Error`, `ValueError` for malformed header/rows/numbers, `TypeError` for invalid path |

## Runnable example
Run from `level1`:

```python
from data_processor import DataProcessor
from tempfile import TemporaryDirectory
from pathlib import Path

processor = DataProcessor([1, 2, 3])
processor.add_data(4)
processor.batch_add([5, 6])
print(processor.get_summary_statistics())
print(processor.filter_data(2, 4))  # [2, 3, 4]
processor.transform_data(2, 1)
assert processor.data == [3, 5, 7, 9, 11, 13]
with TemporaryDirectory() as directory:
    path = Path(directory) / "numbers.csv"
    processor.export_to_csv(path)
    restored = DataProcessor()
    restored.load_from_csv(path)
    assert restored.data == processor.data
```

## Error handling & edge cases
Empty datasets reject statistical queries with `ValueError`; filtering returns
`[]`, transformation does nothing, and exporting writes just the header. A
singleton has variance and standard deviation zero. Invalid strings, booleans,
NaN, and infinities are rejected. Batch ingestion, transformation, and CSV
loading validate before changing the dataset. CSV loading replaces, rather than
appends. Empty files and blank rows are malformed; a header-only file loads an
empty dataset. File errors propagate to the caller and handles close reliably.
Export is not an atomic file replacement. Large arithmetic can raise
`OverflowError` or exceed floating-point precision; arbitrary-magnitude exact
statistics are not promised. Direct modification of `data` bypasses validation.
