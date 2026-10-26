import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { handlePurchaseOrders } from "../src/server/purchase-orders.js";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveRequestPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes("\\") || decoded.split("/").some((part) => part === ".." || part === ".")) return null;

  const relativePath = decoded.replace(/^\/+/, "");
  if (relativePath.split("/").some((part) => part.startsWith("."))) return null;
  const candidate = resolve(root, relativePath || "index.html");
  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) return null;
  return candidate;
}

async function serve(request, response) {
  const protocol = request.headers["x-forwarded-proto"] || "http";
  const requestUrl = new URL(request.url || "/", `${protocol}://${request.headers.host || `${host}:${port}`}`);

  if (requestUrl.pathname === "/api/purchase-orders") {
    if (request.method !== "GET" && request.method !== "POST") {
      response.writeHead(405, { Allow: "GET, POST" }).end();
      return;
    }
    try {
      const hasBody = request.method !== "GET" && request.method !== "HEAD";
      const headers = new Headers();
      for (const name of ["content-type", "content-length", "origin"]) {
        const value = request.headers[name];
        if (typeof value === "string") headers.set(name, value);
      }
      const apiRequest = new Request(requestUrl, {
        method: request.method,
        headers,
        ...(hasBody ? { body: Readable.toWeb(request), duplex: "half" } : {}),
      });
      const apiResponse = await handlePurchaseOrders(apiRequest);
      const body = Buffer.from(await apiResponse.arrayBuffer());
      response.writeHead(apiResponse.status, Object.fromEntries(apiResponse.headers));
      response.end(body);
    } catch (error) {
      process.stderr.write(`Local test-order API error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ error: "The test-order service is unavailable." }));
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let filePath = resolveRequestPath(requestUrl.pathname);
  if (!filePath) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" }).end("Bad request");
    return;
  }

  try {
    if (statSync(filePath).isDirectory()) filePath = resolve(filePath, "index.html");
    statSync(filePath);
  } catch {
    if (extname(requestUrl.pathname)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    filePath = resolve(root, "index.html");
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
}

createServer(serve).listen(port, host, () => {
  process.stdout.write(`Kayus Autos concept preview: http://${host}:${port}\n`);
});
