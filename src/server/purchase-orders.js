import { createHash, randomBytes } from "node:crypto";
import { sampleVehicles } from "../data/sample-vehicles.js";

const TABLE = "purchase_order_test_records";
const MAX_BODY_BYTES = 8 * 1024;
const referencePattern = /^KA-[A-F0-9]{8}$/;
const accessKeyPattern = /^[A-Za-z0-9_-]{40,100}$/;

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function settings() {
  let projectUrl;
  try {
    projectUrl = new URL(process.env.SUPABASE_URL || "");
  } catch {
    projectUrl = null;
  }
  const testMode = process.env.PURCHASE_CHECKOUT_MODE === "test";
  const enabled = process.env.PURCHASE_CHECKOUT_ENABLED?.toLowerCase() === "true";
  const environment = process.env.VERCEL_ENV || "development";
  const secretKey = process.env.SUPABASE_SECRET_KEY || "";
  return {
    projectUrl: projectUrl?.protocol === "https:" ? projectUrl : null,
    secretKey,
    enabled: Boolean(projectUrl?.protocol === "https:" && secretKey && enabled && testMode && environment !== "production"),
    testMode,
    environment,
  };
}

function databaseUrl(projectUrl, params = {}) {
  const url = new URL(`/rest/v1/${TABLE}`, projectUrl);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

async function databaseRequest(config, { method = "GET", params, body, representation = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const headers = { apikey: config.secretKey, Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (body !== undefined) headers.Prefer = representation ? "return=representation" : "return=minimal";
    const response = await fetch(databaseUrl(config.projectUrl, params), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Database service returned ${response.status}`);
    if (response.status === 204) return [];
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  } finally {
    clearTimeout(timeout);
  }
}

async function readiness() {
  const config = settings();
  if (!config.testMode || !config.enabled) {
    return { ready: false, reason: "Test checkout is disabled or not configured." };
  }
  try {
    await databaseRequest(config, { params: { select: "reference", limit: "0" } });
    return { ready: true, mode: "test" };
  } catch {
    return { ready: false, reason: "The test-order database is not ready." };
  }
}

async function readJson(request) {
  if (!(request.headers.get("content-type") || "").toLowerCase().includes("application/json")) {
    throw new RequestError(415, "Send the test order as JSON.");
  }
  const declaredSize = Number(request.headers.get("content-length") || 0);
  if (declaredSize > MAX_BODY_BYTES) throw new RequestError(413, "The request is too large.");
  if (!request.body) throw new RequestError(400, "The test order is incomplete.");

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RequestError(413, "The request is too large.");
    }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid JSON object");
    return value;
  } catch {
    throw new RequestError(400, "Enter valid test-order details.");
  }
}

function validatedCustomer(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new RequestError(400, "Enter the fictional customer details.");
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) throw new RequestError(400, "Enter a name between 2 and 80 characters.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError(400, "Enter a valid email address.");
  if (!/^[+()0-9 .-]{7,24}$/.test(phone) || phone.replace(/\D/g, "").length < 7) throw new RequestError(400, "Enter a valid phone number.");
  return { name, email, phone };
}

function verifiedAccess(reference, accessKey) {
  if (typeof reference !== "string" || !referencePattern.test(reference)) throw new RequestError(404, "No test order matches this private link.");
  if (typeof accessKey !== "string" || !accessKeyPattern.test(accessKey)) throw new RequestError(404, "No test order matches this private link.");
  return createHash("sha256").update(accessKey).digest("hex");
}

async function getOrder(config, reference, accessKeyHash) {
  const rows = await databaseRequest(config, {
    params: {
      select: "reference,vehicle_snapshot,amount_minor,currency_code,status,created_at,payment_simulated_at",
      reference: `eq.${reference}`,
      access_key_hash: `eq.${accessKeyHash}`,
      limit: "1",
    },
  });
  if (!Array.isArray(rows) || !rows[0]) throw new RequestError(404, "No test order matches this private link.");
  const row = rows[0];
  return {
    reference: row.reference,
    vehicle: row.vehicle_snapshot,
    amountMinor: Number(row.amount_minor),
    currencyCode: row.currency_code,
    status: row.status,
    createdAt: row.created_at,
    paymentSimulatedAt: row.payment_simulated_at,
  };
}

async function createTestOrder(config, body) {
  if (body.website) throw new RequestError(400, "The test order could not be accepted.");
  if (body.consentTestData !== true) throw new RequestError(400, "Confirm that the contact details are fictional before continuing.");
  const vehicle = sampleVehicles.find((item) => item.slug === body.vehicleSlug);
  if (!vehicle) throw new RequestError(400, "Choose a valid demonstration vehicle.");
  const customer = validatedCustomer(body.customer);
  const accessKey = randomBytes(32).toString("base64url");
  const reference = `KA-${randomBytes(4).toString("hex").toUpperCase()}`;
  const priceMinor = Math.round(vehicle.price * 100);
  const now = new Date().toISOString();

  await databaseRequest(config, {
    method: "POST",
    body: {
      reference,
      access_key_hash: createHash("sha256").update(accessKey).digest("hex"),
      vehicle_slug: vehicle.slug,
      vehicle_snapshot: { make: vehicle.make, model: vehicle.model, year: vehicle.year, demonstration: true },
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      amount_minor: priceMinor,
      currency_code: "USD",
      status: "test_pending_payment",
      payment_simulated_at: null,
      checkout_mode: "test",
      created_at: now,
    },
  });

  return {
    reference,
    confirmationPath: `/buy/requests/${reference}/confirmation#key=${encodeURIComponent(accessKey)}`,
  };
}

async function simulateTestPayment(config, reference, accessKeyHash) {
  const current = await getOrder(config, reference, accessKeyHash);
  if (current.status !== "test_pending_payment") return current;
  const now = new Date().toISOString();
  await databaseRequest(config, {
    method: "PATCH",
    params: {
      reference: `eq.${reference}`,
      access_key_hash: `eq.${accessKeyHash}`,
      status: "eq.test_pending_payment",
      checkout_mode: "eq.test",
    },
    body: { status: "test_payment_simulated", payment_simulated_at: now },
  });
  return getOrder(config, reference, accessKeyHash);
}

export async function handlePurchaseOrders(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return json({ error: "Cross-site requests are not accepted." }, 403);

  if (request.method === "GET" && url.searchParams.get("operation") === "readiness") {
    const state = await readiness();
    return json(state, state.ready ? 200 : 503);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const config = settings();
  if (!config.enabled || !config.testMode) {
    return json({ error: "Test checkout is not configured. No test order was saved." }, 503);
  }

  try {
    const body = await readJson(request);
    if (body.operation === "create") {
      const state = await readiness();
      if (!state.ready) return json({ error: "The test-order database is not ready. No test order was saved." }, 503);
      return json(await createTestOrder(config, body), 201);
    }
    if (body.operation === "track" || body.operation === "simulate") {
      const accessKeyHash = verifiedAccess(body.reference, body.accessKey);
      const order = body.operation === "simulate"
        ? await simulateTestPayment(config, body.reference, accessKeyHash)
        : await getOrder(config, body.reference, accessKeyHash);
      return json({ order });
    }
    throw new RequestError(400, "Choose a supported test-order action.");
  } catch (error) {
    if (error instanceof RequestError) return json({ error: error.message }, error.status);
    console.error("Purchase test-order service failed", error instanceof Error ? error.message : "Unknown service error");
    return json({ error: "The test-order service is unavailable. No payment was taken." }, 503);
  }
}

export default { fetch: handlePurchaseOrders };
