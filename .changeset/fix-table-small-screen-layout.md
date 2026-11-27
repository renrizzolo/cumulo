---
'@cumulo/core': patch
---

Fix `Table` layout on small screens by resetting `word-break` and `overflow-wrap` for nested `<code>` elements, constraining the horizontal scroll wrapper and keeping the `bordered` frame on the wrapper, keeping table headers unwrapped, and tightening mobile cell padding.
