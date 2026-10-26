import { sampleVehicles } from "../../../data/sample-vehicles.js";
import { filterAndSortVehicles } from "../../buy-logic.js";
import { vehicleCard } from "../../components/vehicle-card.js";
import { escapeHTML } from "../../components/html.js";

const uniqueValues = (field) => [...new Set(sampleVehicles.map((vehicle) => vehicle[field]))].sort();

function selected(value, current) {
  return value === current ? "selected" : "";
}

function queryFilters(searchParams) {
  return {
    query: searchParams.get("q") || "",
    make: searchParams.get("make") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    year: searchParams.get("year") || "",
    maxMileage: searchParams.get("maxMileage") || "",
    transmission: searchParams.get("transmission") || "",
    fuelType: searchParams.get("fuelType") || "",
    condition: searchParams.get("condition") || "",
    status: searchParams.get("status") || "",
    sort: searchParams.get("sort") || "recommended",
  };
}

function cardGrid(vehicles) {
  if (vehicles.length === 0) {
    return `<div class="empty-state"><span class="empty-state__mark" aria-hidden="true">⌕</span><h2>No sample vehicles match</h2><p>Try adjusting the filters. Remember, every listing on this page is demonstration data.</p><button class="button button--outline" type="button" data-reset-filters>Clear filters</button></div>`;
  }
  return vehicles.map(vehicleCard).join("");
}

export function render(route) {
  const current = queryFilters(route.searchParams);
  const makes = uniqueValues("make");
  const years = uniqueValues("year").sort((a, b) => b - a);
  const hasActiveFilters = Object.entries(current).some(([key, value]) => key === "sort" ? value !== "recommended" : Boolean(value));

  return {
    title: "Sample vehicle inventory",
    description: "Search and filter illustrative Kayus Autos vehicle listings. All listings and prices are demonstration data, not dealership stock.",
    activePath: "/buy",
    html: `
      <section class="page-hero page-hero--dark"><div class="section-wrap page-hero__inner"><p class="eyebrow"><span class="eyebrow__rule"></span> THE SAMPLE COLLECTION</p><h1 tabindex="-1">Find your<br /><em>next way forward.</em></h1><p>Search an illustrative catalogue built to demonstrate how vehicle discovery could work.</p><div class="page-disclaimer">Demonstration listings only · No actual stock or availability represented</div></div></section>
      <section class="inventory-page section-wrap" aria-labelledby="inventory-heading">
        <div class="inventory-page__heading"><div><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> BUY A CAR</p><h2 id="inventory-heading">Browse the collection</h2></div><p>All sample listings appear below. Open search and filters to narrow the collection.</p></div>
        <div class="inventory-tools"><p>Demonstration listings only · No actual stock or availability represented</p><button class="inventory-filter-toggle" id="inventory-filter-toggle" type="button" aria-controls="inventory-filters" aria-expanded="${hasActiveFilters}"><span data-filter-toggle-label>${hasActiveFilters ? "Hide search & filters" : "Show search & filters"}</span><span class="inventory-filter-toggle__icon" data-filter-toggle-icon aria-hidden="true">${hasActiveFilters ? "−" : "+"}</span></button></div>
        <form class="filter-panel" id="inventory-filters" ${hasActiveFilters ? "" : "hidden"}>
          <div class="filter-panel__top"><strong>Find a vehicle</strong><button class="filter-clear" type="button" data-clear-filters>Clear all</button></div>
          <div class="filter-grid">
            <label class="filter-field filter-field--search">Search<input name="q" type="search" value="${escapeHTML(current.query)}" placeholder="Make, model, or body style" /></label>
            <label class="filter-field">Make<select name="make"><option value="">Any make</option>${makes.map((value) => `<option value="${escapeHTML(value)}" ${selected(value, current.make)}>${escapeHTML(value)}</option>`).join("")}</select></label>
            <label class="filter-field">Maximum price<input name="maxPrice" type="number" min="0" step="1000" inputmode="numeric" value="${escapeHTML(current.maxPrice)}" placeholder="No maximum" /></label>
            <label class="filter-field">Year<select name="year"><option value="">Any year</option>${years.map((value) => `<option value="${value}" ${selected(String(value), current.year)}>${value}</option>`).join("")}</select></label>
            <label class="filter-field">Maximum mileage<input name="maxMileage" type="number" min="0" step="1000" inputmode="numeric" value="${escapeHTML(current.maxMileage)}" placeholder="No maximum" /></label>
            <label class="filter-field">Transmission<select name="transmission"><option value="">Any transmission</option>${uniqueValues("transmission").map((value) => `<option value="${escapeHTML(value)}" ${selected(value, current.transmission)}>${escapeHTML(value)}</option>`).join("")}</select></label>
            <label class="filter-field">Fuel type<select name="fuelType"><option value="">Any fuel type</option>${uniqueValues("fuelType").map((value) => `<option value="${escapeHTML(value)}" ${selected(value, current.fuelType)}>${escapeHTML(value)}</option>`).join("")}</select></label>
            <label class="filter-field">Condition<select name="condition"><option value="">Any condition</option>${uniqueValues("condition").map((value) => `<option value="${escapeHTML(value)}" ${selected(value, current.condition)}>${escapeHTML(value)}</option>`).join("")}</select></label>
            <label class="filter-field">Availability<select name="status"><option value="">Any status</option>${uniqueValues("status").map((value) => `<option value="${escapeHTML(value)}" ${selected(value, current.status)}>${escapeHTML(value)}</option>`).join("")}</select></label>
            <label class="filter-field">Sort by<select name="sort"><option value="recommended" ${selected("recommended", current.sort)}>Recommended</option><option value="price-low" ${selected("price-low", current.sort)}>Price: low to high</option><option value="price-high" ${selected("price-high", current.sort)}>Price: high to low</option><option value="year-new" ${selected("year-new", current.sort)}>Year: newest</option><option value="mileage-low" ${selected("mileage-low", current.sort)}>Mileage: lowest</option></select></label>
          </div>
          <div class="filter-panel__actions"><p>Sample data only · Filter values are illustrative</p><button class="button button--dark" type="submit">Apply filters <span aria-hidden="true">↗</span></button></div>
        </form>
        <div class="inventory-results"><p class="inventory-results__count" id="inventory-count" aria-live="polite"></p><div class="vehicle-grid" id="inventory-grid">${cardGrid(filterAndSortVehicles(sampleVehicles, current))}</div></div>
      </section>`,
    mount() {
      const form = document.querySelector("#inventory-filters");
      const grid = document.querySelector("#inventory-grid");
      const count = document.querySelector("#inventory-count");
      const filterToggle = document.querySelector("#inventory-filter-toggle");
      if (!form || !grid || !count || !filterToggle) return;

      filterToggle.addEventListener("click", (event) => {
        const isExpanded = filterToggle.getAttribute("aria-expanded") === "true";
        const nextExpanded = !isExpanded;
        form.hidden = !nextExpanded;
        filterToggle.setAttribute("aria-expanded", String(nextExpanded));
        filterToggle.querySelector("[data-filter-toggle-label]").textContent = nextExpanded ? "Hide search & filters" : "Show search & filters";
        filterToggle.querySelector("[data-filter-toggle-icon]").textContent = nextExpanded ? "−" : "+";
        if (nextExpanded && event.detail === 0) form.querySelector('input[type="search"]')?.focus({ preventScroll: true });
      });

      const readValues = () => Object.fromEntries(new FormData(form).entries());
      const update = (pushHistory = false) => {
        const filters = readValues();
        const results = filterAndSortVehicles(sampleVehicles, filters);
        grid.innerHTML = cardGrid(results);
        count.textContent = `${results.length} demonstration vehicle${results.length === 1 ? "" : "s"}`;

        const url = new URL(window.location.href);
        url.search = "";
        for (const [key, value] of Object.entries(filters)) {
          if (String(value).trim() && !(key === "sort" && value === "recommended")) url.searchParams.set(key, String(value).trim());
        }
        if (pushHistory) window.history.pushState({}, "", url);
        else window.history.replaceState({}, "", url);
      };

      update();
      form.addEventListener("submit", (event) => { event.preventDefault(); update(true); });
      grid.addEventListener("click", (event) => {
        if (event.target.closest("[data-clear-filters]")) clearFilters();
      });
      form.querySelector("[data-clear-filters]")?.addEventListener("click", clearFilters);

      function clearFilters() {
        for (const field of form.elements) {
          if (!field.name) continue;
          field.value = field.name === "sort" ? "recommended" : "";
        }
        update(true);
      }
    },
  };
}
