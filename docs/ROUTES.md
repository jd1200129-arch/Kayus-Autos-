# Route map and page architecture

Routes use path segments and dedicated page components. The client router resolves the pathname on both initial load and in-app navigation. Vercel and the dependency-free local preview server serve the app shell for extensionless routes, so direct navigation and refresh load the same page. Query parameters are reserved for non-sensitive filters; customer data and request payloads must never go into URLs.

## Public routes

| Route | Page | Current state |
| --- | --- | --- |
| `/` | Homepage | Implemented; independent concept notice is visible |
| `/buy` | Demonstration inventory with collapsible search and filters | All sample listings display by default; search filters are hidden until opened and run in the browser |
| `/buy/:vehicleSlug` | Vehicle detail and next-step selection | Implemented for the three sample vehicles |
| `/buy/:vehicleSlug/enquiry` | Purchase enquiry | Explicitly closed; no customer details are accepted |
| `/buy/:vehicleSlug/inspection` | Inspection booking | Explicitly closed; no appointments are accepted |
| `/buy/requests/:requestId/confirmation` | Request confirmation | Direct route explains that no request was submitted |
| `/buy/requests/:requestId/track` | Purchase/inspection status | Direct route explains that tracking is not active |
| `/order` | Manufacturer, model, year, condition, specifications, budget, destination | Interactive validated preview; values remain in page memory only |
| `/order/review` | Review vehicle sourcing preview | Review works in the current tab; direct refresh has no draft; no submission |
| `/order/requests/:requestId/confirmation` | Sourcing request confirmation | Route explains that no request record exists |
| `/order/requests/:requestId/track` | Sourcing status | Route explains that real tracking is inactive |
| `/swap` | Current vehicle, local photos, desired vehicle, budget difference, inspection preferences | Interactive validated preview; catalog-backed current and desired model selectors fill manufacturer automatically; model year is a selectable year list; photos are local only; no valuation or submission |
| `/swap/review` | Review swap preview | Review works in the current tab; direct refresh has no draft; no submission |
| `/swap/requests/:requestId/confirmation` | Swap request confirmation | Route explains that no request record exists |
| `/swap/requests/:requestId/track` | Valuation and approval status | Route explains that real tracking is inactive |
| `/sell` | Vehicle, ownership status, condition, local photos, asking price, inspection availability | Interactive validated preview; catalog-backed model selector fills manufacturer automatically; model year is a selectable year list; no offer or submission |
| `/sell/review` | Review selling preview | Review works in the current tab; direct refresh has no draft; no submission |
| `/sell/requests/:requestId/confirmation` | Selling request confirmation | Route explains that no request record exists |
| `/sell/requests/:requestId/track` | Offer status | Route explains that real tracking is inactive |
| `/import` | Origin, vehicle, shipping preference, budget, destination | Interactive validated quote preview; no quote or submission |
| `/import/review` | Review import preview | Review works in the current tab; direct refresh has no draft; no submission |
| `/import/requests/:requestId/confirmation` | Import request confirmation | Route explains that no request record exists |
| `/import/requests/:requestId/track` | Import request status | Route explains that real tracking is inactive |
| `/inspection` | General inspection booking | Workflow not implemented; explicit status page |
| `/inspection/review` | Review inspection appointment | Workflow not implemented; explicit status page |
| `/inspection/appointments/:appointmentId/confirmation` | Appointment confirmation | Workflow not implemented; no appointment record |
| `/about` | Independent concept information | Implemented; explains concept authorship and boundaries without claiming Kayus Autos facts |
| `/contact`, `/privacy`, `/terms` | Dedicated public information pages | Explicit status pages; no invented company facts or contact information |

## Customer and staff routes

| Route | Page | Access |
| --- | --- | --- |
| `/account/sign-in` | Customer sign-in | Not implemented; route reports unavailable |
| `/account/requests` | Customer request history and status | Not implemented; route reports unavailable |
| `/admin/sign-in` | Staff sign-in | Not implemented; no sign-in form is exposed |
| `/admin/inventory` | Listing management | Not implemented; no data is exposed |
| `/admin/orders` | Vehicle order requests | Not implemented; no data is exposed |
| `/admin/swaps` | Swap requests | Not implemented; no data is exposed |
| `/admin/sell` | Selling requests | Not implemented; no data is exposed |
| `/admin/imports` | Import enquiries | Not implemented; no data is exposed |
| `/admin/inspections` | Inspection appointments | Not implemented; no data is exposed |
| `/admin/enquiries` | Customer enquiries | Not implemented; no data is exposed |
| `/admin/staff` | Staff permissions | Not implemented; no permission management is exposed |
| `/admin/content` | Website content | Not implemented; no content management is exposed |
| `/admin/analytics` | Lead analytics | Not implemented; no analytics are exposed |

## Source layout

```text
index.html
src/
  css/styles.css
  js/
    app.js                  # Bootstrap, shared shell, branded initial and route loading state
    route-map.js            # Route definitions and safe parameter parsing
    data/vehicle-catalog.js # Pinned, attributed VehiclesDB model reference used by Sell and Swap
    components/             # Navigation, footer, status and form primitives
    pages/
      home.js
      buy/inventory.js
      buy/vehicle-detail.js
      buy/request-gate.js
      about.js
      services/             # Dedicated Order/Sell/Swap/Import components and shared preview flow
      unavailable.js        # Explicit status for unavailable routes
  data/sample-vehicles.js   # Clearly marked demonstration-only listings
api/                         # Approved Vercel server endpoints, later phase
supabase/migrations/         # Ordered SQL migrations, later phase
tests/
```

## Access boundary

Public inventory reads use only a Supabase publishable key after RLS is enabled and reviewed. Service-role/secret keys remain in server-side functions. Customer submission endpoints must validate input, rate-limit requests, and enforce ownership/role checks on the server and in RLS. Administrative permissions must not use user-editable metadata. See [Supabase secure data guidance](https://supabase.com/docs/guides/database/secure-data), [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Auth guidance](https://supabase.com/docs/guides/auth).

## Vehicle selector scope

Sell and Swap use the pinned VehiclesDB v2026.10.4 catalog. A filter narrows actual selectable models; typed filter text is not submitted as a model. Selecting a catalog model fills its manufacturer. The release describes broad cross-market coverage (5,541 car-model entries across 18 countries) and is not exhaustive. Year options are selectable from 1900 through the current year, but the reference does not verify a year/model pairing. The UI credits VehiclesDB and links its [full source notices](https://github.com/vehiclesdb/vehiclesdb/blob/v2026.10.4/ATTRIBUTION.md).
