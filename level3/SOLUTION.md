# Optimization
`fibonacci.py` was missing, so an iterative implementation was added: O(n)
additions and two persistent integer accumulators versus O(phi^n) recursive
calls. Big-integer cost and storage grow with n.

Bellman–Ford was already O(VE), not exponential. It now stops after a pass with
no changes (best case O(E), worst case O(VE)), retains negative-edge and reachable
negative-cycle detection, checks allocations, uses heap distances and `long long`
accumulation rather than overflowing `int`, prints unreachable nodes explicitly,
and releases distances on success and negative-cycle exit. Auxiliary space is
O(V), graph storage O(E). The supplied example distances are 0, -1, 2, -2, 1.
A Fibonacci heap would imply Dijkstra and would not preserve negative weights.
