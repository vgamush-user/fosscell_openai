# Level 2 changes
The README refers to a missing local `data_processor.py`; the supplied file is
in Level 1. Its added numerical API shares number validation and empty-data
handling, uses snake_case, and validates batches/CSV/transformations before
mutation. The existing unrelated log-processing algorithm remains intact.

The supplied `quicksort.c` now uses snake_case consistently, checks allocation,
frees its array, and removes unused constants/includes. Average time remains
O(n log n), worst-case O(n²); recursion can reach O(n) with this pivot strategy.
