import { renderServicePage } from "./workflow.js";

export const config = {
  key: "order",
  title: "Order a vehicle",
  description: "Shape a temporary vehicle sourcing preview without submitting personal information or a request.",
  eyebrow: "SOURCE A VEHICLE",
  heading: "The right car,<br /><em>on your terms.</em>",
  lead: "Tell us what you are looking for and review a browser-only sourcing preview. No request is sent or saved.",
  reviewNoun: "vehicle search",
  steps: [
    {
      title: "Describe the vehicle",
      shortTitle: "Vehicle",
      intro: "Start with the manufacturer, model, year, and condition you have in mind.",
      fields: [
        { name: "manufacturer", label: "Manufacturer", required: true, placeholder: "For example, Toyota" },
        { name: "model", label: "Model", required: true, placeholder: "For example, Land Cruiser" },
        { name: "year", label: "Preferred year", type: "number", min: 1950, max: 2030, step: 1, required: true },
        { name: "condition", label: "Condition", type: "select", required: true, options: ["New", "Used", "No preference"] },
        { name: "specifications", label: "Specifications or options", type: "textarea", placeholder: "Trim, engine, colour, or other preferences", help: "Do not include personal or confidential information." },
      ],
    },
    {
      title: "Set your budget and destination",
      shortTitle: "Budget & delivery",
      intro: "Share an approximate budget and a broad delivery area. A street address is not requested.",
      fields: [
        { name: "budget", label: "Maximum budget", type: "number", min: 0, step: 100, required: true, placeholder: "Amount", money: true, currencyField: "currency" },
        { name: "currency", label: "Budget currency", type: "select", required: true, options: ["USD", "CAD", "GBP", "EUR", "Other"] },
        { name: "deliveryCountry", label: "Delivery country", required: true, placeholder: "Country" },
        { name: "deliveryRegion", label: "City or region", required: true, placeholder: "City or region only" },
      ],
    },
  ],
};

export function render() {
  return renderServicePage(config);
}
