---
name: Supabase connector
description: Environment-specific routing behavior for the managed Replit Supabase connection.
---

The managed Supabase connector is configured with a PostgREST-rooted API base. Its proxy requests use paths such as `/profiles?...`; adding `/rest/v1` produces a provider `PGRST125` invalid-path response.

**Why:** The connector setup documentation describes paths relative to the Supabase project URL, but this attached connection resolves the proxy against the PostgREST base itself.

**How to apply:** When using the managed connector for database requests, start at the table or RPC path and keep authentication headers separate from the connector’s injected credentials.