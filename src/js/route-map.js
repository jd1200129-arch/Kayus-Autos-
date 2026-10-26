const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const requestIdPattern = /^[a-z0-9_-]{1,80}$/i;

const servicePages = new Map([
  ["/order", { key: "order", type: "service-order", title: "Order a vehicle" }],
  ["/swap", { key: "swap", type: "service-swap", title: "Swap your car" }],
  ["/sell", { key: "sell", type: "service-sell", title: "Sell your car" }],
  ["/import", { key: "import", type: "service-import", title: "Import a vehicle" }],
]);

const futurePublicPages = new Map([
  ["/inspection", { title: "Book an inspection", service: "Inspection", detail: "Vehicle selection, date, appointment slot, and contact steps are planned." }],
  ["/inspection/review", { title: "Review inspection appointment", service: "Inspection", detail: "Inspection review is not implemented yet." }],
  ["/contact", { title: "Contact", service: "Contact", detail: "Official contact details have not been provided. This concept does not accept enquiries." }],
  ["/privacy", { title: "Privacy", service: "Privacy", detail: "A reviewed privacy notice is required before customer information can be collected." }],
  ["/terms", { title: "Terms", service: "Terms", detail: "Approved terms and conditions have not been provided." }],
]);

const adminPages = new Map([
  ["/admin/sign-in", "Staff sign-in"],
  ["/admin/inventory", "Inventory administration"],
  ["/admin/orders", "Vehicle orders"],
  ["/admin/swaps", "Swap requests"],
  ["/admin/sell", "Selling requests"],
  ["/admin/imports", "Import enquiries"],
  ["/admin/inspections", "Inspection appointments"],
  ["/admin/enquiries", "Customer enquiries"],
  ["/admin/staff", "Staff permissions"],
  ["/admin/content", "Website content"],
  ["/admin/analytics", "Lead analytics"],
]);

function canonicalPath(pathname) {
  let segments;
  try {
    segments = pathname.split("/").map((segment) => decodeURIComponent(segment));
  } catch {
    return null;
  }

  if (segments.some((segment) => segment.includes("/") || segment.includes("\\") || segment === "." || segment === "..")) return null;
  const decoded = segments.join("/");
  const trimmed = decoded.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return trimmed || "/";
}

export function resolveRoute(input) {
  const url = input instanceof URL ? input : new URL(input, "http://localhost");
  const path = canonicalPath(url.pathname);
  if (!path) return { type: "not-found", path: url.pathname, searchParams: url.searchParams };

  if (path === "/") return { type: "home", path, searchParams: url.searchParams };
  if (path === "/buy") return { type: "buy-inventory", path, searchParams: url.searchParams };

  const servicePage = servicePages.get(path);
  if (servicePage) return { type: servicePage.type, path, serviceKey: servicePage.key, searchParams: url.searchParams };
  const serviceReview = path.match(/^\/(order|swap|sell|import)\/review$/);
  if (serviceReview) {
    return { type: "service-review", path, serviceKey: serviceReview[1], searchParams: url.searchParams };
  }
  const serviceRequestState = path.match(/^\/(order|swap|sell|import)\/requests\/([^/]+)\/(confirmation|track)$/);
  if (serviceRequestState && requestIdPattern.test(serviceRequestState[2])) {
    return { type: "service-request-state", path, serviceKey: serviceRequestState[1], params: { requestId: serviceRequestState[2], state: serviceRequestState[3] }, searchParams: url.searchParams };
  }
  if (path === "/about") return { type: "about", path, searchParams: url.searchParams };

  const requestState = path.match(/^\/buy\/requests\/([^/]+)\/(confirmation|track)$/);
  if (requestState && requestIdPattern.test(requestState[1])) {
    return { type: "buy-request-state", path, params: { requestId: requestState[1], state: requestState[2] }, searchParams: url.searchParams };
  }

  const buyAction = path.match(/^\/buy\/([^/]+)\/(enquiry|inspection)$/);
  if (buyAction && slugPattern.test(buyAction[1])) {
    return { type: "buy-request-gate", path, params: { vehicleSlug: buyAction[1], action: buyAction[2] }, searchParams: url.searchParams };
  }

  const vehicle = path.match(/^\/buy\/([^/]+)$/);
  if (vehicle && slugPattern.test(vehicle[1]) && vehicle[1] !== "requests") {
    return { type: "buy-vehicle", path, params: { vehicleSlug: vehicle[1] }, searchParams: url.searchParams };
  }

  const customer = path.match(/^\/account\/(sign-in|requests)$/);
  if (customer) return { type: "unavailable", path, title: customer[1] === "sign-in" ? "Customer sign-in" : "Your requests", detail: "Customer accounts and request history are not implemented yet." };

  const adminTitle = adminPages.get(path);
  if (adminTitle) return { type: "admin-unavailable", path, title: adminTitle, searchParams: url.searchParams };

  const future = futurePublicPages.get(path);
  if (future) return { type: "unavailable", path, ...future, searchParams: url.searchParams };

  const inspectionAppointment = path.match(/^\/inspection\/appointments\/([^/]+)\/confirmation$/);
  if (inspectionAppointment && requestIdPattern.test(inspectionAppointment[1])) {
    return { type: "unavailable", path, title: "Inspection appointment", service: "Inspection", detail: "Inspection bookings are not active. No appointment has been made." };
  }

  return { type: "not-found", path, searchParams: url.searchParams };
}
