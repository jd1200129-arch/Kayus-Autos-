import { escapeHTML } from "../../components/html.js";

export function render(route) {
  const isConfirmation = route.params.state === "confirmation";
  const title = isConfirmation ? "No request has been submitted" : "Request tracking is not active";
  const detail = isConfirmation
    ? "A confirmation can appear only after an authorized request has been safely submitted. This concept did not create a request."
    : "A tracking page can show a status only when a real request record exists. This demonstration has no request records.";

  return {
    title,
    description: detail,
    activePath: "/buy",
    html: `<section class="status-page section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> BUY A CAR · ${isConfirmation ? "CONFIRMATION" : "TRACKING"}</p><span class="status-badge">NOT ACTIVE</span><h1 tabindex="-1">${escapeHTML(title)}</h1><p>${escapeHTML(detail)}</p><p>Reference in URL: <code>${escapeHTML(route.params.requestId)}</code>. No personal details are displayed or stored.</p><div class="status-page__actions"><a class="button button--dark" href="/buy" data-router-link>Return to sample inventory <span aria-hidden="true">↗</span></a></div></section>`,
  };
}
