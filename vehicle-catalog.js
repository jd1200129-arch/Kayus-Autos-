export const vehicleCatalogSource = {
  name: "VehiclesDB",
  version: "2026.10.4",
  url: "https://vehiclesdb.com",
  attributionUrl: "https://github.com/vehiclesdb/vehiclesdb/blob/v2026.10.4/ATTRIBUTION.md",
  dataUrl: "https://cdn.jsdelivr.net/gh/vehiclesdb/vehiclesdb@v2026.10.4/dist/vehicles.json",
  license: "CC BY 4.0",
  carCount: 5541,
  makeCount: 315,
  countryCount: 18,
};

let catalogRequest;

function normalizeCatalog(payload) {
  if (!Array.isArray(payload?.makes)) throw new Error("The vehicle catalog response is invalid.");

  const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
  const makes = payload.makes.map((make) => ({
    name: String(make?.name || "").trim(),
    slug: String(make?.slug || "").trim(),
    models: (Array.isArray(make?.models) ? make.models : [])
      .filter((model) => model?.kind === "car" && String(model?.name || "").trim() && String(model?.slug || "").trim())
      .map((model) => ({
        id: `${String(make.slug).trim()}/${String(model.slug).trim()}`,
        name: String(model.name).trim(),
        slug: String(model.slug).trim(),
        makeName: String(make.name).trim(),
      }))
      .sort((left, right) => collator.compare(left.name, right.name)),
  }))
    .filter((make) => make.name && make.slug && make.models.length)
    .sort((left, right) => collator.compare(left.name, right.name));

  const byId = new Map(makes.flatMap((make) => make.models.map((model) => [model.id, model])));
  if (byId.size === 0) throw new Error("The vehicle catalog did not contain any car models.");
  return { makes, byId, modelCount: byId.size, version: payload.version || vehicleCatalogSource.version };
}

export function loadVehicleCatalog() {
  if (!catalogRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    catalogRequest = fetch(vehicleCatalogSource.dataUrl, { headers: { Accept: "application/json" }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Vehicle catalog request failed with ${response.status}.`);
        return response.json();
      })
      .then(normalizeCatalog)
      .catch((error) => {
        catalogRequest = undefined;
        throw error;
      }).finally(() => clearTimeout(timeout));
  }
  return catalogRequest;
}
