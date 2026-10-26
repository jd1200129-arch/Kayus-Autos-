export function render() {
  return {
    title: "Page not found",
    description: "This route does not exist in the Kayus Autos concept.",
    activePath: "",
    html: `<section class="status-page section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> 404</p><h1 tabindex="-1">We can’t find that page.</h1><p>The address may be incomplete or the page may not exist in this concept yet.</p><div class="status-page__actions"><a class="button button--dark" href="/" data-router-link>Back to home <span aria-hidden="true">↗</span></a><a class="text-link text-link--ink" href="/buy" data-router-link>Browse sample inventory</a></div></section>`,
  };
}
