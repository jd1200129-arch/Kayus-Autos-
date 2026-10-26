import { escapeHTML } from "../components/html.js";

export function render(route) {
  return {
    title: route.title,
    description: "Staff administration is not configured. No protected data is displayed.",
    activePath: "",
    html: `<section class="status-page status-page--dark section-wrap"><p class="eyebrow"><span class="eyebrow__rule"></span> STAFF AREA</p><span class="status-badge status-badge--light">ACCESS NOT CONFIGURED</span><h1 tabindex="-1">${escapeHTML(route.title)}</h1><p>Supabase Auth and server-side role checks must be implemented before staff tools can be opened. No dashboard data or sign-in form is available in this concept phase.</p><a class="button button--gold" href="/" data-router-link>Return to the public site <span aria-hidden="true">↗</span></a></section>`,
  };
}
