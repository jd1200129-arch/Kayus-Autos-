import { config as order } from "./order.js";
import { config as sell } from "./sell.js";
import { config as swap } from "./swap.js";
import { config as vehicleImport } from "./import.js";
import { renderServiceRequestState } from "./workflow.js";

const configs = { order, sell, swap, import: vehicleImport };

export function render(route) {
  return renderServiceRequestState(route, configs);
}
