# Kayus Autos concept platform

An independent, unofficial concept demonstration by **Junior Dev Tech Solutions**. It is not an authorized Kayus Autos website. Do not connect it to `kayusautos.com` or represent it as official without approval.

## Current implementation status

The app is a path-based multi-page concept. The route map is in [`docs/ROUTES.md`](docs/ROUTES.md), and the updated delivery sequence is in [`docs/PHASES.md`](docs/PHASES.md). The homepage and Buy discovery flow are implemented, with interactive browser-only previews for Order, Sell, Swap, and Import plus an About page. Sell and Swap include a filterable catalog model picker that fills the manufacturer, plus a selectable year list. A Buy checkout now has a server-side, no-charge test flow with fictional customer details, private test-order tracking, and a simulated payment status. It remains disabled until a dedicated Supabase test project and server-only Vercel settings are configured. No real customer data or payment is accepted. Selected service photos remain local to the tab. Sample vehicles, prices, and remote placeholder photography are illustrative only.

## Run locally

Requirements: Node.js 18+ for the local route-aware preview server and built-in test runner. No third-party package installation is needed. The Buy test API is served locally by the same server; it stays disabled unless its test database and explicit environment flags are configured.

```sh
npm run dev
```

Open `http://localhost:4173`. Direct route refreshes are supported by the local server. Run the project checks with:

```sh
npm test
```

## Project structure

```text
.
├── api/                 # Reserved for approved server-side Vercel functions
├── docs/                # Route map, architecture, and implementation plan
├── src/
│   ├── css/              # Responsive design system and page styles
│   └── js/               # Browser ES modules, route pages, and sample data
├── supabase/             # Reserved for Phase 3 migrations and policies
├── tests/                # Dependency-free Node test suite
├── index.html
├── package.json
└── vercel.json
```

## Configuration plan

The Supabase schema draft is in [`supabase/schema-drafts/purchase-order-test-records.sql`](supabase/schema-drafts/purchase-order-test-records.sql); access to the existing Kayus Autos Supabase project's SQL Editor must be restored before the draft can be applied, so checkout stays disabled. To enable a private test environment, create a timestamped migration from the reviewed draft, apply it, then add `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `PURCHASE_CHECKOUT_MODE=test`, and `PURCHASE_CHECKOUT_ENABLED=true` as server-side Preview variables. The API refuses to enable this flow on Vercel Production. Never expose the secret key in browser code. The `.env.example` file is a template; the dependency-free local server reads variables from its process environment.

## Approval and security boundary

The test checkout is limited to fictional contact details and does not call a payment provider. The public form remains disabled until its dedicated test database is configured. Live customer collection, real payments, purchase enquiries, inspection bookings, trade-in offers, and financing decisions remain unavailable until company authorization and reviewed privacy, payment, and backend controls are in place. Admin access will be enforced server-side and by Supabase RLS. Secret and mail credentials must never ship to browser code.

No production domain, official contact details, analytics property, or email sender has been configured.
