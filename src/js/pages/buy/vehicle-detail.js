import { sampleVehicles } from "../../../data/sample-vehicles.js";
import { escapeHTML, formatCurrency } from "../../components/html.js";

export function render(route) {
  const vehicle = sampleVehicles.find((item) => item.slug === route.params.vehicleSlug);
  if (!vehicle) {
    return {
      title: "Sample vehicle not found",
      description: "This demonstration vehicle route does not match a sample listing.",
      activePath: "/buy",
      html: `<section class="status-page section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> SAMPLE LISTING</p><h1 tabindex="-1">Vehicle not found</h1><p>This sample vehicle route does not match a demonstration listing.</p><a class="button button--dark" href="/buy" data-router-link>Return to sample inventory <span aria-hidden="true">↗</span></a></section>`,
    };
  }

  const specs = [
    ["Year", vehicle.year], ["Mileage", `${vehicle.mileage.toLocaleString("en-US")} mi`], ["Transmission", vehicle.transmission], ["Fuel", vehicle.fuelType], ["Condition", vehicle.condition], ["Availability", vehicle.status],
    ["Body style", vehicle.bodyStyle], ["Color", vehicle.color], ["Engine", vehicle.engine], ["Drivetrain", vehicle.drivetrain],
  ];

  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} sample`,
    description: `${vehicle.description} Demonstration listing only; no actual stock or availability is represented.`,
    activePath: "/buy",
    html: `
      <section class="detail-page section-wrap">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/" data-router-link>Home</a><span aria-hidden="true">/</span><a href="/buy" data-router-link>Buy a car</a><span aria-hidden="true">/</span><span>${escapeHTML(vehicle.model)} sample</span></nav>
        <div class="detail-layout">
          <div class="detail-photo"><img src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.alt)}" /><span class="vehicle-card__sample">DEMONSTRATION VEHICLE · NOT STOCK</span></div>
          <div class="detail-summary"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> SAMPLE VEHICLE PROFILE</p><h1 tabindex="-1">${escapeHTML(vehicle.year)} ${escapeHTML(vehicle.make)}<br /><em>${escapeHTML(vehicle.model)}</em></h1><p class="detail-summary__description">${escapeHTML(vehicle.description)}</p><p class="detail-summary__price">Illustrative price <strong>${formatCurrency(vehicle.price)}</strong></p><p class="detail-summary__note">Price and specifications are demonstration data. No availability is confirmed.</p><div class="detail-summary__actions"><a class="button button--dark" href="/buy/${escapeHTML(vehicle.slug)}/checkout" data-router-link>Open test checkout <span aria-hidden="true">↗</span></a><a class="button button--outline" href="/buy/${escapeHTML(vehicle.slug)}/inspection" data-router-link>Inspection booking status <span aria-hidden="true">↗</span></a></div><p class="checkout-demo-inline">Test flow only · No real order or payment</p></div>
        </div>
        <section class="detail-specs" aria-labelledby="specs-title"><div class="detail-specs__heading"><div><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> VEHICLE DETAILS</p><h2 id="specs-title">Specifications</h2></div><p>All values below are illustrative placeholders.</p></div><dl>${specs.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}</dl><ul class="detail-features">${vehicle.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join("")}</ul></section>
        <div class="detail-back"><a class="text-link text-link--ink" href="/buy" data-router-link>← Back to sample inventory</a></div>
      </section>`,
  };
}
