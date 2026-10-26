import { escapeHTML } from "../../components/html.js";

function amountLabel(order) {
  const amount = Number(order.amountMinor);
  const currency = /^[A-Z]{3}$/.test(order.currencyCode) ? order.currencyCode : "USD";
  if (!Number.isSafeInteger(amount) || amount < 0) return "Sample amount unavailable";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount / 100);
}

function orderMarkup(order, isConfirmation, accessKey) {
  const vehicle = order.vehicle || {};
  const label = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Demonstration vehicle";
  const simulated = order.status === "test_payment_simulated";
  const badge = simulated ? "TEST PAYMENT SIMULATED · NO CHARGE" : "TEST ORDER · NOT PAID";
  const heading = simulated ? "Simulation complete." : "Your test order is saved.";
  const details = simulated
    ? "The test record was updated successfully. No payment processor was contacted and no money moved."
    : "The order is stored as a test record only. No vehicle has been reserved and no payment has been taken.";
  const trackHref = `/buy/requests/${encodeURIComponent(order.reference)}/track#key=${encodeURIComponent(accessKey)}`;
  const simulateAction = isConfirmation && !simulated
    ? `<button class="button button--dark" id="simulate-test-payment" type="button">Simulate test payment <span aria-hidden="true">↗</span></button><p class="checkout-small-note">This only changes the test record. It never contacts a payment provider.</p>`
    : "";
  return `<span class="status-badge">${badge}</span><h1 tabindex="-1">${heading}</h1><p>${details}</p><div class="request-context"><span>TEST ORDER REFERENCE</span><strong><code>${escapeHTML(order.reference)}</code></strong><small>${escapeHTML(label)} · Demonstration listing</small></div><dl class="checkout-receipt"><div><dt>Sample amount</dt><dd>${escapeHTML(amountLabel(order))}</dd></div><div><dt>Order status</dt><dd>${simulated ? "Test payment simulated" : "Awaiting test simulation"}</dd></div><div><dt>Real payment</dt><dd>None · no charge</dd></div></dl>${simulateAction}<div class="status-page__actions"><a class="button button--outline" href="${trackHref}" data-router-link>Track test order <span aria-hidden="true">↗</span></a><a class="text-link text-link--ink" href="/buy" data-router-link>Return to sample inventory</a></div>`;
}

export function render(route) {
  const isConfirmation = route.params.state === "confirmation";
  const title = isConfirmation ? "Test order confirmation" : "Track test order";
  return {
    title,
    description: "Private tracking for a test-only vehicle order. No real payment or vehicle reservation is created.",
    activePath: "/buy",
    html: `<section class="status-page section-wrap purchase-state-page"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> BUY A CAR · ${isConfirmation ? "TEST CONFIRMATION" : "TEST TRACKING"}</p><div id="purchase-order-state" role="status" aria-live="polite"><h1 tabindex="-1">Checking test order…</h1><p>Loading the private test-order status. No customer details are displayed.</p></div></section>`,
    mount() {
      const panel = document.querySelector("#purchase-order-state");
      if (!panel) return;
      const controller = new AbortController();
      const query = new URLSearchParams(window.location.hash.slice(1));
      const accessKey = query.get("key") || "";
      const reference = route.params.requestId;
      let orderState;

      function showMessage(heading, message) {
        panel.innerHTML = `<span class="status-badge">TEST ORDER STATUS</span><h1 tabindex="-1">${escapeHTML(heading)}</h1><p>${escapeHTML(message)}</p><div class="status-page__actions"><a class="button button--outline" href="/buy" data-router-link>Return to sample inventory <span aria-hidden="true">↗</span></a></div>`;
      }

      async function send(operation) {
        const response = await fetch("/api/purchase-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
          body: JSON.stringify({ operation, reference, accessKey }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "The test order status could not be loaded.");
        return result.order;
      }

      async function loadOrder() {
        if (!/^KA-[A-F0-9]{8}$/.test(reference) || accessKey.length < 40 || accessKey.length > 100) {
          showMessage("Private tracking link required.", "Use the private link shown when the test order was created. This page does not look up an order from its reference alone.");
          return;
        }
        try {
          orderState = await send("track");
          if (!orderState) throw new Error("No test order matches this private link.");
          panel.innerHTML = orderMarkup(orderState, isConfirmation, accessKey);
          panel.querySelector("#simulate-test-payment")?.addEventListener("click", simulatePayment, { once: true });
        } catch (cause) {
          if (controller.signal.aborted) return;
          showMessage("Test order status unavailable.", cause instanceof Error ? cause.message : "The private test-order status could not be loaded.");
        }
      }

      async function simulatePayment(event) {
        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = "Updating test record…";
        try {
          orderState = await send("simulate");
          panel.innerHTML = orderMarkup(orderState, isConfirmation, accessKey);
        } catch (cause) {
          if (controller.signal.aborted) return;
          button.disabled = false;
          button.textContent = "Try test simulation again";
          const note = panel.querySelector(".checkout-small-note");
          if (note) note.textContent = cause instanceof Error ? cause.message : "The test record could not be updated. No payment was taken.";
        }
      }

      loadOrder();
      return () => controller.abort();
    },
  };
}
