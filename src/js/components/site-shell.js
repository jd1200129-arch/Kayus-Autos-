const navigationLinks = [
  ["Buy a car", "/buy"],
  ["Order", "/order"],
  ["Sell", "/sell"],
  ["Swap", "/swap"],
  ["Imports", "/import"],
  ["About", "/about"],
];

export function renderSiteShell({ content, title, description, activePath = "" }) {
  const app = document.querySelector("#app");
  if (!app) return;

  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="concept-bar" role="note">
      <span class="concept-bar__dot" aria-hidden="true"></span>
      Independent concept demonstration by Junior Dev Tech Solutions
      <span class="concept-bar__divider" aria-hidden="true">/</span>
      Not an official Kayus Autos website
    </div>
    <header class="site-header" id="top">
      <div class="site-header__inner">
        <a class="wordmark" href="/" data-router-link aria-label="Kayus Autos home">
          <span class="wordmark__icon" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M7 28V8h4.7v8.1L19.3 8h5.8l-8.1 8.4L25.8 28h-5.7l-6.4-8.3-2 2.1V28H7Z" fill="currentColor"/><path d="M25.1 8h4v20h-4z" fill="currentColor"/></svg></span>
          <span class="wordmark__type">KAYUS<span>AUTOS</span></span>
        </a>
        <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span></button>
        <nav class="primary-navigation" id="primary-navigation" aria-label="Primary navigation">
          ${navigationLinks.map(([label, href]) => `<a href="${href}" data-router-link ${activePath === href ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="nav-contact" href="/contact" data-router-link ${activePath === "/contact" ? 'aria-current="page"' : ""}>Contact <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
    <main id="main" tabindex="-1">${content}</main>
    <footer class="site-footer">
      <div class="site-footer__main section-wrap">
        <div class="footer-brand">
          <a class="wordmark wordmark--light" href="/" data-router-link aria-label="Kayus Autos, home"><span class="wordmark__icon" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M7 28V8h4.7v8.1L19.3 8h5.8l-8.1 8.4L25.8 28h-5.7l-6.4-8.3-2 2.1V28H7Z" fill="currentColor"/><path d="M25.1 8h4v20h-4z" fill="currentColor"/></svg></span><span class="wordmark__type">KAYUS<span>AUTOS</span></span></a>
          <p>A thoughtful drive starts here.<br />An independent concept by Junior Dev Tech Solutions.</p>
        </div>
        <div class="footer-links">
          <div><span class="footer-links__title">EXPLORE</span><a href="/buy" data-router-link>Buy a car</a><a href="/sell" data-router-link>Sell your car</a><a href="/swap" data-router-link>Swap your car</a><a href="/import" data-router-link>Import a vehicle</a></div>
          <div><span class="footer-links__title">INFORMATION</span><a href="/about" data-router-link>About</a><a href="/contact" data-router-link>Contact</a><a href="/privacy" data-router-link>Privacy</a><a href="/terms" data-router-link>Terms</a></div>
        </div>
      </div>
      <div class="site-footer__bottom section-wrap"><span>© ${new Date().getFullYear()} Kayus Autos concept</span><span class="footer-disclaimer">Independent concept demonstration · Not an official or approved Kayus Autos website</span><a href="#top">Back to top ↑</a></div>
    </footer>`;

  document.title = `${title} — Kayus Autos`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) metaDescription.content = description;
  app.setAttribute("aria-busy", "false");

  const toggle = app.querySelector(".menu-toggle");
  const nav = app.querySelector("#primary-navigation");
  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }));
  document.onkeydown = (event) => {
    if (event.key === "Escape") {
      toggle?.setAttribute("aria-expanded", "false");
      toggle?.setAttribute("aria-label", "Open navigation");
      nav?.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
  };
}
