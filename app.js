import { resolveRoute } from "./route-map.js";
import { renderSiteShell } from "./components/site-shell.js";

const app = document.querySelector("#app");
const routeLoader = document.querySelector("#route-loader");
let renderVersion = 0;
let lastPath = window.location.pathname;
let activePageCleanup;
const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const minimumLoaderDuration = reducedMotion ? 140 : 240;

function showRouteLoader() {
  if (!routeLoader) return performance.now();
  routeLoader.hidden = false;
  routeLoader.classList.remove("is-leaving");
  routeLoader.classList.add("is-active");
  return performance.now();
}

function hideRouteLoader(version, shownAt) {
  if (!routeLoader) return;
  const minimumWait = Math.max(0, minimumLoaderDuration - (performance.now() - shownAt));
  window.setTimeout(() => {
    if (version !== renderVersion) return;
    routeLoader.classList.add("is-leaving");
    window.setTimeout(() => {
      if (version !== renderVersion) return;
      routeLoader.hidden = true;
      routeLoader.classList.remove("is-leaving");
    }, reducedMotion ? 0 : 220);
  }, minimumWait);
}

const pageLoaders = {
  home: () => import("./pages/home.js"),
  about: () => import("./pages/about.js"),
  "buy-inventory": () => import("./pages/buy/inventory.js"),
  "buy-vehicle": () => import("./pages/buy/vehicle-detail.js"),
  "buy-request-gate": () => import("./pages/buy/request-gate.js"),
  "buy-request-state": () => import("./pages/buy/request-state.js"),
  "service-order": () => import("./pages/services/order.js"),
  "service-sell": () => import("./pages/services/sell.js"),
  "service-swap": () => import("./pages/services/swap.js"),
  "service-import": () => import("./pages/services/import.js"),
  "service-review": () => import("./pages/services/review.js"),
  "service-request-state": () => import("./pages/services/request-state.js"),
  unavailable: () => import("./pages/unavailable.js"),
  "admin-unavailable": () => import("./pages/admin-unavailable.js"),
  "not-found": () => import("./pages/not-found.js"),
};

async function renderCurrentRoute() {
  if (!app) return;
  const version = ++renderVersion;
  const loaderShownAt = showRouteLoader();
  const route = resolveRoute(window.location.href);
  activePageCleanup?.(route);
  activePageCleanup = undefined;
  const loadPage = pageLoaders[route.type] || pageLoaders["not-found"];
  app.setAttribute("aria-busy", "true");

  try {
    const pageModule = await loadPage();
    if (version !== renderVersion) return;
    const page = pageModule.render(route);
    renderSiteShell({ ...page, content: page.html });
    activePageCleanup = page.mount?.() || undefined;
    app.setAttribute("aria-busy", "false");

    if (lastPath !== window.location.pathname) window.scrollTo(0, 0);
    lastPath = window.location.pathname;
    document.querySelector("#main h1")?.focus({ preventScroll: true });
    hideRouteLoader(version, loaderShownAt);
  } catch (error) {
    if (version !== renderVersion) return;
    console.error("Page could not be rendered", error);
    app.innerHTML = `<main class="status-page section-wrap"><h1>Page unavailable</h1><p>We could not load this page. Please try again.</p><a href="/" data-router-link>Return home</a></main>`;
    app.setAttribute("aria-busy", "false");
    hideRouteLoader(version, loaderShownAt);
  }
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;

  event.preventDefault();
  if (destination.pathname !== window.location.pathname || destination.search !== window.location.search) {
    window.history.pushState({}, "", destination);
  }
  renderCurrentRoute();
});

window.addEventListener("popstate", renderCurrentRoute);
window.addEventListener("resize", () => {
  if (window.innerWidth >= 900) document.body.classList.remove("menu-open");
});

renderCurrentRoute();
