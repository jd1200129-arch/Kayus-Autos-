import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { filterAndSortVehicles } from "../src/js/buy-logic.js";
import { sampleVehicles } from "../src/data/sample-vehicles.js";
import { resolveRoute } from "../src/js/route-map.js";
import { render as renderHome } from "../src/js/pages/home.js";
import { render as renderInventory } from "../src/js/pages/buy/inventory.js";
import { render as renderVehicleDetail } from "../src/js/pages/buy/vehicle-detail.js";

const root = new URL("../", import.meta.url);
const readProjectFile = (path) => readFile(new URL(path, root), "utf8");

test("path router resolves homepage, inventory, vehicle, and gated request routes", () => {
  assert.equal(resolveRoute("https://kayus.test/").type, "home");
  assert.equal(resolveRoute("https://kayus.test/buy/").type, "buy-inventory");

  const detail = resolveRoute("https://kayus.test/buy/2022-porsche-911-carrera-sample/");
  assert.equal(detail.type, "buy-vehicle");
  assert.equal(detail.params.vehicleSlug, "2022-porsche-911-carrera-sample");

  const enquiry = resolveRoute("https://kayus.test/buy/2022-porsche-911-carrera-sample/enquiry");
  assert.equal(enquiry.type, "buy-request-gate");
  assert.equal(enquiry.params.action, "enquiry");

  const tracking = resolveRoute("https://kayus.test/buy/requests/demo-123/track");
  assert.equal(tracking.type, "buy-request-state");
  assert.equal(tracking.params.requestId, "demo-123");
});

test("service previews and About have dedicated routes while admin remains protected", () => {
  assert.equal(resolveRoute("https://kayus.test/sell").type, "service-sell");
  assert.equal(resolveRoute("https://kayus.test/order").type, "service-order");
  assert.equal(resolveRoute("https://kayus.test/swap").type, "service-swap");
  assert.equal(resolveRoute("https://kayus.test/import").type, "service-import");
  assert.equal(resolveRoute("https://kayus.test/about").type, "about");
  assert.equal(resolveRoute("https://kayus.test/order/review").type, "service-review");
  assert.equal(resolveRoute("https://kayus.test/admin/inventory").type, "admin-unavailable");
  assert.equal(resolveRoute("https://kayus.test/unknown-page").type, "not-found");
  assert.equal(resolveRoute("https://kayus.test/buy/%252e%252e/admin").type, "not-found");
});

test("inventory search, filters, and sorting operate on sample data", () => {
  assert.equal(filterAndSortVehicles(sampleVehicles, { make: "Land Rover" }).length, 1);
  assert.equal(filterAndSortVehicles(sampleVehicles, { query: "g-class" })[0].make, "Mercedes-Benz");
  assert.equal(filterAndSortVehicles(sampleVehicles, { maxPrice: "80000" }).length, 1);
  assert.equal(filterAndSortVehicles(sampleVehicles, { year: "2022", transmission: "Automatic" }).length, 1);
  assert.deepEqual(
    filterAndSortVehicles(sampleVehicles, { sort: "price-low" }).map((vehicle) => vehicle.price),
    [74900, 98500, 142000],
  );
  assert.equal(filterAndSortVehicles(sampleVehicles, { maxMileage: "1" }).length, 0);
});

test("all rendered sample listings are explicitly illustrative and have image alternatives", () => {
  for (const vehicle of sampleVehicles) {
    assert.equal(vehicle.status, "Sample only");
    assert.match(vehicle.alt, /^Illustrative/);
    assert.match(vehicle.image, /^https:\/\//);
  }
});

test("home, inventory, and vehicle pages render distinct route content", () => {
  const home = renderHome();
  const inventory = renderInventory(resolveRoute("https://kayus.test/buy"));
  const vehicle = renderVehicleDetail(resolveRoute("https://kayus.test/buy/2022-porsche-911-carrera-sample"));
  assert.match(home.html, /Find your<br \/><em>way forward/);
  assert.match(home.html, /href="\/buy"/);
  assert.match(inventory.html, /id="inventory-filters"/);
  assert.match(inventory.html, /Maximum price/);
  assert.match(vehicle.html, /Porsche/);
  assert.match(vehicle.html, /VEHICLE DETAILS/);
});

test("shell and request gates disclose the concept and disable live data collection", async () => {
  const [shell, requestGate, index, styles, routeDocs, plan] = await Promise.all([
    readProjectFile("src/js/components/site-shell.js"),
    readProjectFile("src/js/pages/buy/request-gate.js"),
    readProjectFile("index.html"),
    readProjectFile("src/css/styles.css"),
    readProjectFile("docs/ROUTES.md"),
    readProjectFile("docs/PHASES.md"),
  ]);
  assert.match(shell, /Independent concept demonstration by Junior Dev Tech Solutions/);
  assert.match(requestGate, /No request has been made/);
  assert.match(requestGate, /before this step can collect information/);
  assert.match(shell, /aria-label="Primary navigation"/);
  assert.match(shell, /class="skip-link"/);
  assert.match(index, /type="module"/);
  assert.match(styles, /@media \(max-width: 599px\)/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(routeDocs, /`\/buy`/);
  assert.match(plan, /No customer contact information is requested/);
});
