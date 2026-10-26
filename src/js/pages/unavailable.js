import { escapeHTML } from "../components/html.js";

export function render(route) {
  const title = route.title || "Page not found";
  const detail = route.detail || "This route is not part of the current implementation.";
  const service = route.service ? `<p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> ${escapeHTML(route.service.toUpperCase())}</p>` : "";
  return {
    title,
    description: detail,
    activePath: "",
    html: `<section class="status-page section-wrap">${service}<span class="status-badge">NOT IMPLEMENTED</span><h1 tabindex="-1">${escapeHTML(title)}</h1><p>${escapeHTML(detail)}</p><p>This independent concept does not collect customer information. No request, appointment, offer, or transaction has been created.</p><div class="status-page__actions"><a class="button button--dark" href="/" data-router-link>Back to home <span aria-hidden="true">↗</span></a><a class="text-link text-link--ink" href="/buy" data-router-link>Browse sample vehicles</a></div></section>`,
  };
}
