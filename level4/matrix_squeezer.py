"""Fold a letter grid, retaining bottom-to-top stacks internally."""


def squeeze_matrix(grid, directions):
    """Return top-view rows as strings; do not mutate the input.

    Odd middle rows/columns stay at the crease. Interactions are
    case-insensitive: identical letters fuse to uppercase; vowel/consonant
    pairs vanish. Resolve contacts bottom-to-top, including chain reactions.
    Empty cells are underscores. Only ASCII letters are accepted as input.
    """
    rows = [list(row) for row in grid]
    if not rows:
        return []
    width = len(rows[0])
    if width == 0 or any(len(row) != width for row in rows):
        raise ValueError("Grid must be rectangular and have nonempty rows")
    if any(not isinstance(c, str) or len(c) != 1 or
           c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
           for row in rows for c in row):
        raise ValueError("Cells must be single ASCII letters")
    board = [[[c] for c in row] for row in rows]

    def merge(target, moving):
        for letter in reversed(moving):
            while target:
                top = target[-1]
                if top.lower() == letter.lower():
                    target.pop()
                    letter = letter.upper()
                elif (top.lower() in "aeiou") != (letter.lower() in "aeiou"):
                    target.pop()
                    break
                else:
                    target.append(letter)
                    break
            else:
                target.append(letter)
        return target

    for direction in directions:
        if direction not in ("left", "right", "up", "down"):
            raise ValueError("Unknown fold direction: %r" % (direction,))
        vertical = direction in ("up", "down")
        if vertical:
            board = [list(column) for column in zip(*board)]
        length = len(board[0])
        half = length // 2
        kept = (length + 1) // 2
        toward_start = direction in ("left", "up")
        folded = []
        for row in board:
            if toward_start:
                result = [pile[:] for pile in row[:kept]]
                for i in range(half):
                    merge(result[i], row[length - 1 - i])
            else:
                result = [pile[:] for pile in row[half:]]
                for i in range(half):
                    merge(result[kept - 1 - i], row[i])
            folded.append(result)
        board = folded
        if vertical:
            board = [list(column) for column in zip(*board)]
    return ["".join(pile[-1] if pile else "_" for pile in row) for row in board]


if __name__ == "__main__":
    print(squeeze_matrix(["abc", "def"], ["left", "up"]))
