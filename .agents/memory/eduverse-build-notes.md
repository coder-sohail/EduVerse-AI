---
name: EduVerse build notes
description: Durable implementation constraints discovered while bootstrapping the EduVerse MVP.
---

The workspace's installed Zod version is not compatible with Orval's generated `zod.int()` output. API schemas that need whole-number values should use OpenAPI `number` types unless the generator/runtime pairing is upgraded together.

**Why:** The first contract generation succeeded but the chained library typecheck failed on every generated integer validator.

**How to apply:** When extending the EduVerse OpenAPI contract, prefer `number` for numeric fields and enforce whole-number semantics in request handlers if that becomes important.