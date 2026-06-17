## Goal

Fix the bug where the phone (hitting the deployed site) shows 0 packages while the laptop (hitting the dev sandbox) shows 2.

## Root cause (recap)

The deployed Worker is missing the Supabase env vars that auth + server functions read at request time. `.env` is only loaded in the dev sandbox, so the laptop works and the phone doesn't.

## Values collected from your project

I read these from `.env` myself:

- `SUPABASE_URL` = `https://kfxparmwqnncqpioudkq.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...EXog` (the anon JWT in `.env`)

The **service role key** is not stored in project files on Lovable Cloud and cannot be read by me. The good news: the admin packages list page uses `requireSupabaseAuth` (publishable key + your user token), not the service role key — so we don't need it to fix the "0 packages on phone" bug.

## Changes

1. Add secret `SUPABASE_URL` = the URL above.
2. Add secret `SUPABASE_PUBLISHABLE_KEY` = the publishable key above.
3. (Skip `SUPABASE_SERVICE_ROLE_KEY` for now — only needed if/when a feature uses the admin client. We can add it later if a specific feature breaks.)

## Verification

- After secrets are added, reload the admin packages page on your phone.
- Expect to see the same 2 packages as on the laptop.
- If any other server function fails later with an error mentioning admin/service role, we'll wire that key in as a follow-up.
