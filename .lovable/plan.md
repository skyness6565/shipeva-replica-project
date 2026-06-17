## Problem

`alaye@gmail.com` has the `admin` role in the database, but the admin panel shows "Not authorized" after sign-in.

Root cause: `src/lib/admin.functions.ts` uses `supabaseAdmin` (service-role client) for all Data API reads/writes, including the `assertAdmin` role check. On Lovable Cloud the service-role key is the new `sb_secret_*` format, which PostgREST rejects with `Expected 3 parts in JWT; got 1`. The `user_roles` query throws, `checkIsAdmin` catches it and returns `isAdmin: false` — so every signed-in user sees "Not authorized", and a real admin can't get in.

(The "anybody with this details can access" phrasing is misleading — nobody can currently get in, including the legit admin. The DB still enforces the role; this is purely a server-fn client mismatch.)

## Fix

Switch `admin.functions.ts` from `supabaseAdmin` (Data API) to `context.supabase` (the user-scoped client from `requireSupabaseAuth`). The existing RLS policies already gate every table with `has_role(auth.uid(), 'admin')`, so an admin user reaches the rows and a non-admin gets blocked by Postgres — same security boundary, without the broken JWT path.

### Changes in `src/lib/admin.functions.ts`

1. Replace `assertAdmin` with a `has_role` RPC check via `context.supabase`:
   ```ts
   async function assertAdmin(context: Ctx) {
     const { data, error } = await context.supabase.rpc("has_role", {
       _user_id: context.userId, _role: "admin",
     });
     if (error) throw new Error(error.message);
     if (!data) throw new Error("Forbidden: admin role required");
     return context.supabase;
   }
   ```
2. In every handler, use the returned `context.supabase` (rename local var from `admin` → `db`) for `packages`, `tracking_events`, `customers`, `user_roles` reads/writes. RLS will enforce admin-only access.
3. Keep `supabaseAdmin` ONLY inside `signedUrlForUpload` (Storage signed URLs are fine with the service-role key and don't go through PostgREST). Import it lazily inside that handler.

No DB migration, no UI changes, no auth flow changes. `admin.tsx`, `route.tsx`, and the attacher middleware stay as-is.

## Verification

- Sign in as `alaye@gmail.com` → admin layout renders, sidebar + dashboard load.
- Sign in as any non-admin user → still sees "Not authorized" (RLS blocks `has_role` returning true).
- Package list / customer list / create / update / delete all work for admin.
