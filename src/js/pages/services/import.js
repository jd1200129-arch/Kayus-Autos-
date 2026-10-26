import { renderServicePage } from "./workflow.js";

export const config = {
  key: "import",
  title: "Import a vehicle",
  description: "Explore an illustrative vehicle import journey. No quote, shipping booking, or request is created.",
  eyebrow: "BRING IT CLOSER",
  heading: "The world is wide.<br /><em>So is your search.</em>",
  lead: "Outline a vehicle import idea, your preferred shipping approach, budget, and destination in a browser-only preview.",
  reviewNoun: "vehicle import",
  steps: [
    {
      title: "Choose a vehicle and origin",
      shortTitle: "Origin & vehicle",
      intro: "Describe the vehicle you are considering and where it would come from.",
      fields: [
        { name: "originCountry", label: "Origin country", required: true, placeholder: "Country" },
        { name: "manufacturer", label: "Manufacturer", required: true, placeholder: "Manufacturer" },
        { name: "model", label: "Model", required: true, placeholder: "Model and trim" },
        { name: "year", label: "Year", type: "number", min: 1950, max: 2030, step: 1, required: true },
        { name: "condition", label: "Condition", type: "select", required: true, options: ["New", "Used", "Not sure"] },
        { name: "specifications", label: "Specifications", type: "textarea", placeholder: "Optional vehicle requirements" },
      ],
    },
    {
      title: "Plan shipping, budget, and destination",
      shortTitle: "Shipping & budget",
      intro: "Choose a shipping preference and provide a destination at country and city or region level only.",
      fields: [
        { name: "shippingMethod", label: "Shipping preference", type: "select", required: true, options: ["Container shipping", "Roll-on / roll-off", "Not sure yet"] },
        { name: "budget", label: "Approximate total budget", type: "number", min: 0, step: 100, required: true, money: true, currencyField: "currency" },
        { name: "currency", label: "Budget currency", type: "select", required: true, options: ["USD", "CAD", "GBP", "EUR", "Other"] },
        { name: "destinationCountry", label: "Destination country", required: true, placeholder: "Country" },
        { name: "destinationRegion", label: "Destination city or region", required: true, placeholder: "City or region only" },
      ],
    },
  ],
};

export function render() {
  return renderServicePage(config);
}
