# Matrix squeezer
Use `from matrix_squeezer import squeeze_matrix` and call
`squeeze_matrix(["abc", "def"], ["left", "up"])`.
The return value is a list of strings, with `_` for empty piles.

Directions name the destination side. Odd creases remain on that side; a
one-cell dimension is unchanged. Stacks are stored bottom-to-top and reversed
on a physical fold. New letters contact the exposed stack top. We interpret
identical letters case-insensitively and recheck a fused letter against the
newly exposed top; annihilation consumes both contacting letters. These choices
resolve details left implicit in Task.md. Inputs are rectangular ASCII letter
grids, not prebuilt stacks. Empty input returns `[]`; malformed grids and
unknown directions raise `ValueError`. Input is never modified.

Space is O(R*C). Each letter can be removed only once; stack work across folds
is O(R*C*F) in a conservative bound for F folds, including no-op folds.
