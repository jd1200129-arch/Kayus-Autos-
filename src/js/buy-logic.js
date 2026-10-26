export function filterAndSortVehicles(vehicles, filters = {}) {
  const query = String(filters.query || "").trim().toLowerCase();
  const maxPrice = filters.maxPrice === "" || filters.maxPrice == null ? Infinity : Number(filters.maxPrice);
  const maxMileage = filters.maxMileage === "" || filters.maxMileage == null ? Infinity : Number(filters.maxMileage);

  const filtered = vehicles.filter((vehicle) => {
    const searchable = [vehicle.make, vehicle.model, vehicle.name, vehicle.bodyStyle].join(" ").toLowerCase();
    return (!query || searchable.includes(query))
      && (!filters.make || vehicle.make === filters.make)
      && vehicle.price <= maxPrice
      && (!filters.year || String(vehicle.year) === String(filters.year))
      && vehicle.mileage <= maxMileage
      && (!filters.transmission || vehicle.transmission === filters.transmission)
      && (!filters.fuelType || vehicle.fuelType === filters.fuelType)
      && (!filters.condition || vehicle.condition === filters.condition)
      && (!filters.status || vehicle.status === filters.status);
  });

  const comparators = {
    "price-low": (a, b) => a.price - b.price,
    "price-high": (a, b) => b.price - a.price,
    "year-new": (a, b) => b.year - a.year,
    "mileage-low": (a, b) => a.mileage - b.mileage,
  };

  return filtered.sort(comparators[filters.sort] || (() => 0));
}
