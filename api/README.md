# Buy test-order API

`purchase-orders.js` exposes the server-side Buy test flow on Vercel and through the local preview server. It stores only fictional customer details in `purchase_order_test_records`, returns an opaque tracking link, and can update a test-only payment status. It never calls a payment provider or charges money.

## Enable for an authorized test environment

1. Select a dedicated, active Supabase test project. Do not use a dealership production database for this test flow.
2. Apply and review [`../supabase/schema-drafts/purchase-order-test-records.sql`](../supabase/schema-drafts/purchase-order-test-records.sql). This file is a schema draft, not an applied migration.
3. Set `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `PURCHASE_CHECKOUT_MODE=test`, and `PURCHASE_CHECKOUT_ENABLED=true` in Vercel Preview or local development only. The API refuses to enable this flow in Vercel Production, even if its other variables are set. Never add a secret key to browser configuration or source control.
4. Keep `PURCHASE_CHECKOUT_ENABLED=false` everywhere else. The checkout page checks the API before enabling its form.

`SUPABASE_SECRET_KEY` is sent only as the Supabase `apikey` header from the server. The public browser never receives the key. The order table has RLS enabled and grants no table access to `anon` or `authenticated`; only the server secret role can access it. The API validates the selected vehicle against server-side sample data, validates contact fields and explicit fictional-data consent, limits JSON body size, checks the request origin, uses a honeypot, stores only a hash of the private tracking key, and never logs customer payloads.

The page asks for fictional contact details only. No card number, billing data, address, financing information, or live vehicle price is accepted. Simulated payment changes only the test record status. Do not enable real customer data, payment processing, or public orders until the business has authorized the site, approved privacy and retention terms, supplied verified vehicle data, and selected its payment provider and process.

## API operations

- `GET /api/purchase-orders?operation=readiness` — returns only whether test storage is configured and reachable.
- `POST /api/purchase-orders` with `operation: "create"` — creates a test-only order using a sample vehicle slug and fictional contact details.
- `POST /api/purchase-orders` with `operation: "track"` — returns status for the reference plus private access key; no customer details are returned.
- `POST /api/purchase-orders` with `operation: "simulate"` — changes a pending test record to `test_payment_simulated`; no provider is contacted.

The API is intentionally unavailable until the test database, schema, and server-side flags are all configured. A disabled or failed setup does not store submitted order data.
