# Shipment Tracking + Admin Panel

Build real tracking on the homepage and a full admin panel, backed by Lovable Cloud (Postgres + Auth + Storage). Tech note: the project uses TanStack Start (not Node/MySQL); Lovable Cloud gives us the same capabilities with zero setup. If you specifically need Node/MySQL, tell me and I'll switch approach.

## 1. Backend (Lovable Cloud)

Enable Lovable Cloud, then create:

**Tables**
- `packages` — all fields you listed (name, tracking_number unique, reference_id, sender/receiver name+email+phone, origin, destination, current_location, fee, currency, weight, type, method, eta_days, description, status enum, dispatch_date, expected_delivery_date, notes, image_urls[], document_urls[], timestamps).
- `tracking_events` — package_id, status, location, note, event_time. Powers tracking history + customs/delivery notices.
- `customers` — auto-upserted from sender/receiver on package create; editable/deletable.
- `user_roles` + `app_role` enum (`admin`) + `has_role()` security-definer fn (per project standards — roles never on profiles).

**Storage buckets**: `package-images` (public), `package-documents` (private, signed URLs).

**RLS**
- `packages`, `tracking_events`, `customers`: SELECT for tracking is done via a public server function (admin client, safe column projection by tracking_number). All writes require `has_role(auth.uid(),'admin')`.
- `user_roles`: read self + admin manage.

**Server functions** (`createServerFn`)
- Public: `trackPackage({ trackingNumber })` → returns package + ordered events.
- Admin (guarded by `requireSupabaseAuth` + `has_role` check):
  `listPackages`, `getPackage`, `createPackage` (auto-generates tracking# `SHIPEVA-XXXXXXXX` and ref ID, upserts customers, sends creation email), `updatePackage`, `deletePackage`, `addTrackingEvent` (sends status email), `listCustomers`, `updateCustomer`, `deleteCustomer`, `dashboardStats`.
- Emails via Lovable Emails (will prompt for email domain setup on first send).

## 2. Homepage tracking

Wire existing `TrackingBar.tsx` to `trackPackage`. Add `/track/:trackingNumber` route showing:
- Header card: status badge, tracking #, route (origin → destination), ETA, current location, sender/receiver summary.
- Vertical timeline of `tracking_events` (newest first), with location + note + timestamp.
- Package images gallery.
- Loading / not-found / error states.

## 3. Admin panel (`/admin/*`, gated)

- `/auth` — email+password sign-in (admins only; non-admins see "not authorized").
- `_authenticated/admin/route.tsx` — sidebar layout, checks `has_role admin` in `beforeLoad`, else redirect.
- `/admin` Dashboard — 4 stat cards (total/active/delivered/pending), recent activities feed (latest tracking_events), quick search.
- `/admin/packages` — sortable/filterable table (status, method, search by tracking#/name/email), pagination.
- `/admin/packages/new` and `/admin/packages/$id` — full form with all fields you listed, currency selector (USD/EUR/GBP/NGN/CAD/AUD/BTC/ETH/USDT), status dropdown (Pending/Processing/In Transit/Arrived/Delivered/Held by Customs), image + document uploads to Storage, notes.
- `/admin/packages/$id` also has **Tracking History** panel: add event (status, location, note) → one-click status update + appends to timeline + triggers email.
- `/admin/customers` — list, search by name/email, edit, delete.
- Dark/light mode toggle in header (already have tokens).

## 4. Seeding & first admin

After Cloud is enabled I'll ask you to sign up once at `/auth`, then run a one-time SQL to grant your user the `admin` role (safer than a public bootstrap endpoint).

## Out of scope
- Real payments/crypto checkout (currency is metadata only).
- Customer-facing accounts (only admins log in).
- Multi-tenant / multiple admin roles beyond `admin`.

## Approve to proceed
Reply "go" and I'll enable Cloud and start building. If you want Node.js + MySQL instead of Lovable Cloud, say so now.
