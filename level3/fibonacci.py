"""Iterative Fibonacci: O(n) additions, O(1) integer variables.

Arbitrary precision means bit storage grows with n; this is not O(1) bits.
Naive recursive Fibonacci instead makes O(phi**n) calls.
"""


def fibonacci(n: int) -> int:
    """Return F(n), with F(0)=0 and F(1)=1."""
    if isinstance(n, bool) or not isinstance(n, int):
        raise TypeError("n must be an integer")
    if n < 0:
        raise ValueError("n must be nonnegative")
    previous, current = 0, 1
    for _ in range(n):
        previous, current = current, previous + current
    return previous


if __name__ == "__main__":
    print(fibonacci(100))
