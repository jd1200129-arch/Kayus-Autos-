import { renderServicePage } from "./workflow.js";

export const config = {
  key: "swap",
  title: "Swap your car",
  description: "Compare your current car and preferred next vehicle in a temporary swap preview. No valuation or offer is made.",
  eyebrow: "CHANGE YOUR DRIVE",
  heading: "One car out.<br /><em>A new direction.</em>",
  lead: "Share the broad details of your current vehicle and the vehicle you would like next. This preview does not make a trade-in offer.",
  reviewNoun: "vehicle swap",
  vehicleCatalog: true,
  steps: [
    {
      title: "Your current vehicle",
      shortTitle: "Current car",
      intro: "Use broad vehicle details only. Do not enter a VIN, registration, or owner identity.",
      fields: [
        { name: "currentYear", label: "Year", type: "year-select", required: true, help: "Choose the model year shown for the vehicle. The catalog does not verify year availability for each model." },
        { name: "currentModelId", label: "Current model", type: "catalog-model", required: true, manufacturerField: "currentManufacturer", modelNameField: "currentModelName" },
        { name: "currentManufacturer", label: "Current manufacturer", type: "catalog-make", required: true },
        { name: "currentMileage", label: "Approximate mileage", type: "number", min: 0, step: 100, required: true },
        { name: "currentCondition", label: "Overall condition", type: "select", required: true, options: ["Excellent", "Good", "Fair", "Needs repair", "Not sure"] },
        { name: "ownership", label: "Ownership status", type: "select", required: true, options: ["I own it", "I am authorized to act for the owner", "Not sure / prefer not to say"] },
      ],
    },
    {
      title: "Add photos and choose your next car",
      shortTitle: "Photos & next car",
      intro: "Photos remain local to this browser tab. Then describe the kind of vehicle you hope to swap into.",
      fields: [
        { name: "photos", label: "Current vehicle photos", type: "photos", required: true, help: "Up to 6 JPG, PNG, or WebP images; 5 MB each. Local preview only; avoid people, plates, documents, or location details." },
        { name: "desiredModelId", label: "Desired model", type: "catalog-model", required: true, manufacturerField: "desiredManufacturer", modelNameField: "desiredModelName" },
        { name: "desiredManufacturer", label: "Desired manufacturer", type: "catalog-make", required: true },
        { name: "desiredYear", label: "Earliest preferred year", type: "year-select", required: true, help: "Choose the earliest model year you would consider. The catalog does not verify year availability for each model." },
        { name: "desiredCondition", label: "Preferred condition", type: "select", required: true, options: ["New", "Used", "No preference"] },
      ],
    },
    {
      title: "Difference and inspection preferences",
      shortTitle: "Difference & inspection",
      intro: "Indicate a broad budget direction and where an inspection could be considered. No value or approval is generated.",
      fields: [
        { name: "differenceDirection", label: "Proposed budget difference", type: "select", required: true, options: ["I may add money", "I may receive a difference", "Not sure yet"] },
        { name: "differenceAmount", label: "Approximate difference amount", type: "number", min: 0, step: 100, placeholder: "Optional estimate", money: true, currencyField: "currency" },
        { name: "currency", label: "Amount currency", type: "select", required: true, options: ["USD", "CAD", "GBP", "EUR", "Other"] },
        { name: "inspectionArea", label: "Inspection city or region", required: true, placeholder: "City or region only" },
        { name: "inspectionWindow", label: "General availability", type: "select", required: true, options: ["Weekday mornings", "Weekday afternoons", "Weekends", "Flexible"] },
      ],
    },
  ],
};

export function render() {
  return renderServicePage(config);
}
