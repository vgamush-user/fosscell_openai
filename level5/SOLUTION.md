# Level 5 contribution

Reviewed the supplied repository using the code-review skill. The focused fix
is in the local `Plastopol-Website` checkout on `fix/search-highlight-escaping`.
It corrects raw-text highlighting versus HTML entity matching in the CMS;
see PR_DESCRIPTION.md for the problem, behavior, and validation.

Other review candidates deferred to separate work: CMS random five-character
IDs can collide despite a comment claiming uniqueness; website and CMS slug
normalization differ on ampersands. These are not bundled into this change.

The three Node regression tests pass. Full application build/UI checks were
not run; dependencies were not installed. GitHub CLI reports an invalid login,
so no remote branch or pull request has been published. After signing in,
push the branch (or a fork if required) and create the PR using the supplied
PR_DESCRIPTION.md. No PR URL is claimed.
