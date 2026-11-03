# Fix CMS search highlighting of HTML special characters

Searching for `amp` in `A & B` previously highlighted part of the generated
`&amp;` entity, corrupting the displayed text. Searching for `&` similarly split
an entity instead of highlighting the actual ampersand.

Match against the original text, then escape both unmatched segments and matched
segments before wrapping matches in `<mark>`. This preserves case-insensitive,
literal matching and safely displays HTML-like product text. No dependencies
or public APIs change.

Validation: `node --experimental-strip-types --test tests/search-highlight.test.mjs`
passes three regression tests covering entities, HTML-like input, case,
repeated matches, regex punctuation, blank queries, and missing matches.
Node 22.6+ is needed for this standalone TypeScript test command.
