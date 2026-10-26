# Kayus Autos implementation plan

This plan supersedes the earlier one-page Phase 1 roadmap. The target is a path-based, multi-page dealership platform with distinct public, customer, and protected staff routes. A route is only marked complete after its real behavior and required security controls are implemented and verified.

## Development sequence and status

1. **Shared navigation and route architecture — complete.** The route map, reusable page shell, branded initial and in-app loading screen, direct-navigation behavior, responsive navigation, and local/Vercel route fallback are implemented.
2. **Homepage and public pages — in progress.** The homepage, About page, Buy pages, and dedicated Order/Sell/Swap/Import preview pages exist. Contact, Privacy, Terms, and Inspection still need their approved content and journeys.
3. **Buy inventory and vehicle details — in progress.** Implement sample inventory search, filters, sorting, direct vehicle detail routes, and the selection into purchase enquiry or inspection.
4. **Customer workflows — in progress (preview only).** Order, Swap, Sell, and Import have separate validated multi-step browser previews and review screens. Preview completion does not submit or save a request; local photos are not uploaded. Inspection, approved confirmation, and real tracking remain unimplemented.
5. **Supabase and server-side services — in progress.** A Buy test-only server endpoint, secure tracking key, input validation, test payment simulator, and RLS schema draft exist. The Kayus Autos Supabase project is visible in the dashboard, but this session cannot access its SQL Editor or database connector, and no project credentials are configured in this codebase. Test submissions are disabled until access is restored, the schema is reviewed and applied as a migration, and server-side Vercel Preview settings are configured. Other public request data remains closed.
6. **Customer account — not started.** Add secure sign-in and a customer-only request history/status view.
7. **Administration — not started.** Add protected, role-checked pages for inventory, orders, swap, sell, import, inspections, enquiries, staff, website content, and analytics.
8. **Approved integrations — not started.** Add Resend communications and analytics only after sender/domain, privacy, and company approval are confirmed.
9. **Verification and launch readiness — not started.** Expand automated route, form, authorization, security, accessibility, and responsive coverage; document and verify deployment without using an unapproved dealership domain.

## Current implementation boundary

The implementation includes route architecture, homepage, Buy discovery, and interactive Order/Sell/Swap/Import preview flows with separate page components and review routes. Sell and Swap draw model choices from the pinned, attributed VehiclesDB v2026.10.4 catalog; selecting a model fills its manufacturer, and year is selected from a year list without claiming that the model/year combination is validated. The catalog is broad but not exhaustive. These previews accept non-identifying demonstration preferences in memory only. Selected photos are previewed with browser-local object URLs and are not uploaded. The Buy test checkout requests fictional name, email, and phone details only after a dedicated test database is ready; its API and schema draft exist, but the form remains disabled until configured. A simulation updates only a test status and never contacts a payment provider. Real customer data, payments, enquiries, inspection bookings, quotes, valuations, and offers remain unavailable. Sample stock and image content remain illustrative. About describes the independent concept without inventing Kayus Autos history or credentials.

## Approval gate

Before customer data is accepted or stored, the company must authorize the site and the privacy requirements must be completed. Before any trade-in offer, financing approval, or payment flow is active, the corresponding authorized business process must be defined. A planned or visually represented feature is not complete functionality.
