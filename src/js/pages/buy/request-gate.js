import { sampleVehicles } from "../../../data/sample-vehicles.js";
import { escapeHTML } from "../../components/html.js";

export function render(route) {
  const vehicle = sampleVehicles.find((item) => item.slug === route.params.vehicleSlug);
  const inspection = route.params.action === "inspection";
  const title = inspection ? "Inspection booking is not open" : "Purchase enquiries are not open";
  const description = inspection
    ? "Inspection dates and appointments cannot be requested through this concept."
    : "This concept does not accept purchase enquiries or collect customer information.";

  return {
    title,
    description,
    activePath: "/buy",
    html: `<section class="status-page status-page--gold section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> CUSTOMER REQUESTS CLOSED</p><h1 tabindex="-1">${title}</h1><p>${description} Company authorization and the secure request backend are required before this step can collect information. No request has been made, and no appointment or vehicle availability is confirmed.</p>${vehicle ? `<div class="request-context"><span>Selected demonstration vehicle</span><strong>${escapeHTML(vehicle.year)} ${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}</strong><small>Sample data only · Not dealership stock</small></div>` : ""}<div class="status-page__actions"><a class="button button--dark" href="${vehicle ? `/buy/${escapeHTML(vehicle.slug)}` : "/buy"}" data-router-link>${vehicle ? "Back to vehicle" : "Browse sample inventory"} <span aria-hidden="true">↗</span></a><a class="text-link text-link--ink" href="/buy" data-router-link>Return to sample inventory</a></div></section>`,
  };
}
