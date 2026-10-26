import { sampleVehicles } from "../../../data/sample-vehicles.js";
import { escapeHTML, formatCurrency } from "../../components/html.js";

export function render(route) {
  const vehicle = sampleVehicles.find((item) => item.slug === route.params.vehicleSlug);
  if (!vehicle) {
    return {
      title: "Sample vehicle not found",
      description: "This demonstration vehicle route does not match a sample listing.",
      activePath: "/buy",
      html: `<section class="status-page section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> SAMPLE LISTING</p><h1 tabindex="-1">Vehicle not found</h1><p>This test checkout is only available for a demonstration listing.</p><a class="button button--dark" href="/buy" data-router-link>Return to sample inventory <span aria-hidden="true">↗</span></a></section>`,
    };
  }

  return {
    title: "Test checkout",
    description: "A no-charge demonstration checkout. Use fictional contact details only; this is not a real order or vehicle listing.",
    activePath: "/buy",
    html: `
      <section class="page-hero page-hero--dark"><div class="section-wrap page-hero__inner"><p class="eyebrow"><span class="eyebrow__rule"></span> BUY A CAR · TEST MODE</p><h1 tabindex="-1">A clear next step.<br /><em>No real charge.</em></h1><p>Try the customer and order flow with fictional details. This sample vehicle is not dealership stock.</p><div class="page-disclaimer">DEMONSTRATION ONLY · NO LIVE PAYMENT · NO VEHICLE RESERVATION</div></div></section>
      <section class="checkout-section section-wrap" aria-labelledby="checkout-title">
        <div class="checkout-layout">
          <div class="checkout-card">
            <p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> TEST CHECKOUT</p>
            <h2 id="checkout-title">Customer details</h2>
            <p class="checkout-intro">Use fictional contact details only. There are no card fields, and this test does not take payment.</p>
            <div class="checkout-status" id="checkout-setup-status" role="status" aria-live="polite">Checking the test-order service…</div>
            <form id="purchase-checkout-form">
              <fieldset class="checkout-fieldset" id="purchase-checkout-fields">
                <legend class="visually-hidden">Fictional customer details for the test order</legend>
                <div class="checkout-fields">
                  <label class="checkout-field" for="customer-name"><span>Full name <span aria-hidden="true">*</span></span><input id="customer-name" name="name" type="text" autocomplete="name" minlength="2" maxlength="80" required /></label>
                  <label class="checkout-field" for="customer-email"><span>Email address <span aria-hidden="true">*</span></span><input id="customer-email" name="email" type="email" autocomplete="email" maxlength="254" required /></label>
                  <label class="checkout-field" for="customer-phone"><span>Phone number <span aria-hidden="true">*</span></span><input id="customer-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" minlength="7" maxlength="24" pattern="[+()0-9 .-]{7,24}" required /><small>Use 7–24 digits and standard phone punctuation.</small></label>
                </div>
                <div class="checkout-honeypot" aria-hidden="true"><label for="company-website">Leave this field empty<input id="company-website" name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>
                <label class="checkout-consent" for="test-data-consent"><input id="test-data-consent" name="consentTestData" type="checkbox" required /><span>I confirm these details are fictional and understand this creates only a test record. No real order, reservation, or payment will result.</span></label>
                <p class="checkout-error" id="checkout-error" role="alert" hidden></p>
                <button class="button button--dark" id="checkout-submit" type="submit" disabled>Checking test setup… <span aria-hidden="true">↗</span></button>
              </fieldset>
            </form>
            <a class="text-link text-link--ink checkout-back" href="/buy/${escapeHTML(vehicle.slug)}" data-router-link>← Back to the sample vehicle</a>
          </div>
          <aside class="checkout-summary" aria-label="Test order summary">
            <p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> SELECTED SAMPLE</p>
            <span class="status-badge">DEMONSTRATION VEHICLE</span>
            <h2>${escapeHTML(vehicle.year)} ${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)}</h2>
            <dl><div><dt>Sample price</dt><dd>${formatCurrency(vehicle.price)}</dd></div><div><dt>Checkout mode</dt><dd>Test · no charge</dd></div><div><dt>Stock status</dt><dd>Not verified</dd></div></dl>
            <p>Vehicle, price, and specifications are illustrative data only. No card information is requested or stored. A simulated test payment only updates the clearly marked test record.</p>
          </aside>
        </div>
      </section>`,
    mount() {
      const form = document.querySelector("#purchase-checkout-form");
      const fieldset = document.querySelector("#purchase-checkout-fields");
      const status = document.querySelector("#checkout-setup-status");
      const button = document.querySelector("#checkout-submit");
      const error = document.querySelector("#checkout-error");
      if (!form || !fieldset || !status || !button || !error) return;

      const controller = new AbortController();
      let ready = false;

      async function checkSetup() {
        try {
          const response = await fetch("/api/purchase-orders?operation=readiness", {
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          });
          const result = await response.json();
          ready = response.ok && result.ready === true;
          fieldset.disabled = false;
          button.disabled = !ready;
          if (ready) {
            status.textContent = "Test storage is ready. Fictional details will be saved to the connected test database only.";
            button.innerHTML = 'Create test order <span aria-hidden="true">↗</span>';
          } else {
            status.textContent = "You can fill these fields with fictional details, but test submission is unavailable until a dedicated Supabase test database and server-side settings are configured. Nothing you type here is sent or saved.";
            button.textContent = "Test checkout unavailable";
          }
        } catch {
          if (controller.signal.aborted) return;
          ready = false;
          fieldset.disabled = false;
          button.disabled = true;
          button.textContent = "Test checkout unavailable";
          status.textContent = "We could not check the test-order service. No details have been sent. Refresh to try again.";
        }
      }

      async function submit(event) {
        event.preventDefault();
        error.hidden = true;
        if (!ready) {
          error.textContent = "Test submission is unavailable, so nothing was sent or saved. Please try again after the test database is configured.";
          error.hidden = false;
          return;
        }
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        button.disabled = true;
        button.textContent = "Saving test order…";
        status.textContent = "Saving your fictional test details securely…";
        try {
          const response = await fetch("/api/purchase-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
            body: JSON.stringify({
              operation: "create",
              vehicleSlug: vehicle.slug,
              customer: { name: data.get("name"), email: data.get("email"), phone: data.get("phone") },
              consentTestData: data.get("consentTestData") === "on",
              website: data.get("website"),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "The test order could not be saved. No payment was taken.");
          window.location.assign(result.confirmationPath);
        } catch (cause) {
          if (controller.signal.aborted) return;
          error.textContent = cause instanceof Error ? cause.message : "The test order could not be saved. No payment was taken.";
          error.hidden = false;
          status.textContent = "Test order not completed.";
          button.disabled = false;
          button.innerHTML = 'Try again <span aria-hidden="true">↗</span>';
          button.focus();
        }
      }

      form.addEventListener("submit", submit);
      checkSetup();
      return () => {
        controller.abort();
        form.removeEventListener("submit", submit);
      };
    },
  };
}
