# Kayus Autos concept platform

An independent, unofficial concept demonstration by **Junior Dev Tech Solutions**. It is not an authorized Kayus Autos website. Do not connect it to `kayusautos.com` or represent it as official without approval.

## Current implementation status

The app is a path-based multi-page concept. The route map is in [`docs/ROUTES.md`](docs/ROUTES.md), and the updated delivery sequence is in [`docs/PHASES.md`](docs/PHASES.md). The homepage and Buy discovery flow are implemented, with interactive browser-only previews for Order, Sell, Swap, and Import plus an About page. Sell and Swap include a filterable catalog model picker that fills the manufacturer, plus a selectable year list. These previews do not submit or save requests; selected photos remain local to the tab. Sample vehicles, prices, and remote placeholder photography are illustrative only.

## Run locally

Requirements: Node.js 18+ for the local route-aware preview server and built-in test runner. No third-party package installation is needed.

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

Copy `.env.example` to `.env` only when a later phase requires configuration. Phase 1 does not read environment variables. Supabase credentials, Resend, and analytics are not connected. Service-role keys and mail API keys must remain server-side. Add only the public Supabase URL and anon key to browser configuration after RLS is implemented and reviewed.

## Approval and security boundary

This concept does not collect live customer data. Purchase enquiries, inspection bookings, payments, trade-in offers, financing decisions, and request tracking remain unavailable until company authorization and the required backend/privacy controls are in place. Admin access will be enforced server-side and by Supabase RLS. Service-role and mail credentials must never ship to browser code.

No production domain, official contact details, analytics property, or email sender has been configured.
