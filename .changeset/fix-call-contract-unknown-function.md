---
'base-mcp': patch
---

Fix `call_contract` crashing with a cryptic error when the given `functionName` is not present in the supplied ABI. The tool now throws a clear `Function "<name>" not found in the provided ABI` error, and also validates that the parsed ABI is a JSON array.
