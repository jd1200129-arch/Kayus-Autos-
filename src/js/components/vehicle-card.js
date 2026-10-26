import { escapeHTML, formatCurrency } from "./html.js";

export function vehicleCard(vehicle) {
  return `
    <article class="vehicle-card">
      <a class="vehicle-card__media" href="/buy/${escapeHTML(vehicle.slug)}" aria-label="View sample ${escapeHTML(vehicle.year)} ${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}">
        <img src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.alt)}" loading="lazy" />
        <span class="vehicle-card__sample">DEMONSTRATION DATA</span>
      </a>
      <div class="vehicle-card__content">
        <div class="vehicle-card__topline"><span>${escapeHTML(vehicle.bodyStyle)} · SAMPLE</span><span aria-hidden="true">✳</span></div>
        <h2><a href="/buy/${escapeHTML(vehicle.slug)}">${escapeHTML(vehicle.year)} ${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}</a></h2>
        <ul class="vehicle-card__specs" aria-label="Demonstration specifications">
          <li>${escapeHTML(vehicle.mileage.toLocaleString("en-US"))} mi</li>
          <li>${escapeHTML(vehicle.transmission)}</li>
          <li>${escapeHTML(vehicle.fuelType)}</li>
        </ul>
        <div class="vehicle-card__bottom"><span>Illustrative price · ${formatCurrency(vehicle.price)}</span><span class="vehicle-card__arrow" aria-hidden="true">↗</span></div>
      </div>
    </article>`;
}
