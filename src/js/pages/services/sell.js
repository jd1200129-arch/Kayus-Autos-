import { renderServicePage } from "./workflow.js";

export const config = {
  key: "sell",
  title: "Sell your car",
  description: "Prepare a temporary vehicle sale preview without collecting ownership documents or contact details.",
  eyebrow: "SELL YOUR VEHICLE",
  heading: "A considered way<br /><em>to move on.</em>",
  lead: "Describe the car and preview the information a future selling journey may need. Nothing is submitted or valued here.",
  reviewNoun: "vehicle sale details",
  vehicleCatalog: true,
  steps: [
    {
      title: "Tell us about the car",
      shortTitle: "Vehicle",
      intro: "Enter non-identifying vehicle details. Do not enter a VIN, plate number, or document number.",
      fields: [
        { name: "year", label: "Year", type: "year-select", required: true, help: "Choose the model year shown for the vehicle. The catalog does not verify year availability for each model." },
        { name: "vehicleModelId", label: "Model", type: "catalog-model", required: true, manufacturerField: "manufacturer", modelNameField: "modelName" },
        { name: "manufacturer", label: "Manufacturer", type: "catalog-make", required: true },
        { name: "mileage", label: "Approximate mileage", type: "number", min: 0, step: 100, required: true },
      ],
    },
    {
      title: "Ownership and condition",
      shortTitle: "Ownership",
      intro: "Share broad ownership and condition details. This preview does not verify ownership or set an offer.",
      fields: [
        { name: "ownership", label: "Your relationship to the vehicle", type: "select", required: true, options: ["I own it", "I am authorized to act for the owner", "Business or fleet vehicle", "Other / prefer not to say"] },
        { name: "titleStatus", label: "Ownership document status", type: "select", required: true, options: ["Available", "In progress", "Not sure", "Prefer not to say"] },
        { name: "condition", label: "Overall condition", type: "select", required: true, options: ["Excellent", "Good", "Fair", "Needs repair", "Not sure"] },
        { name: "knownIssues", label: "Known issues or notes", type: "textarea", placeholder: "Optional general description; no serial or document numbers" },
      ],
    },
    {
      title: "Photos, asking price, and inspection",
      shortTitle: "Price & inspection",
      intro: "For this local preview, selected pictures stay in this tab and are never uploaded.",
      fields: [
        { name: "photos", label: "Vehicle photos", type: "photos", required: true, help: "Up to 6 JPG, PNG, or WebP images; 5 MB each. Avoid people, plates, documents, or location details." },
        { name: "askingPrice", label: "Asking price", type: "number", min: 0, step: 100, required: true, money: true, currencyField: "currency" },
        { name: "currency", label: "Price currency", type: "select", required: true, options: ["USD", "CAD", "GBP", "EUR", "Other"] },
        { name: "inspectionArea", label: "Preferred inspection city or region", required: true, placeholder: "City or region only" },
        { name: "inspectionWindow", label: "General availability", type: "select", required: true, options: ["Weekday mornings", "Weekday afternoons", "Weekends", "Flexible"] },
      ],
    },
  ],
};

export function render() {
  return renderServicePage(config);
}
