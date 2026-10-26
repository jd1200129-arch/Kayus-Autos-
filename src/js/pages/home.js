import { sampleVehicles } from "../../data/sample-vehicles.js";
import { vehicleCard } from "../components/vehicle-card.js";

export function render() {
  return {
    title: "Find your next way forward",
    description: "Discover a considered way to explore illustrative vehicles and the future Kayus Autos experience.",
    activePath: "/",
    html: `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__copy">
          <p class="eyebrow"><span class="eyebrow__rule"></span> YOUR NEXT CHAPTER, IN MOTION</p>
          <h1 id="hero-title" tabindex="-1">Find your<br /><em>way forward.</em></h1>
          <p class="hero__intro">A more considered way to find the car that fits your life. Explore a sample of what the Kayus Autos experience could become.</p>
          <div class="hero__actions"><a class="button button--gold" href="/buy" data-router-link>Explore sample vehicles <span aria-hidden="true">↗</span></a><a class="text-link" href="#services">Explore our services <span aria-hidden="true">↓</span></a></div>
          <div class="hero__note"><span aria-hidden="true">✳</span> Thoughtful journeys start with the right drive.</div>
        </div>
        <div class="hero__visual"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=88" alt="Illustrative sports car viewed from the front on a quiet road" fetchpriority="high" /><div class="hero__visual-shade" aria-hidden="true"></div><div class="hero__image-caption"><span>AN INDEPENDENT CONCEPT</span><span>01 / 04</span></div><div class="hero__vertical" aria-hidden="true">KAYUS AUTOS&nbsp; — &nbsp;MOVE WITH INTENTION</div></div>
      </section>

      <section class="collection section-wrap" id="featured" aria-labelledby="collection-title">
        <div class="section-heading"><div><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> A FIRST LOOK</p><h2 id="collection-title">Made for the<br /><em>moments ahead.</em></h2></div><div class="section-heading__aside"><p>Every detail begins with what matters to you. Explore a demonstration of the vehicle discovery experience.</p><span class="sample-note"><span aria-hidden="true">✳</span> All vehicles shown are demonstration samples</span></div></div>
        <div class="vehicle-grid">${sampleVehicles.map(vehicleCard).join("")}</div>
        <div class="collection__footer"><p>Sample vehicles, prices, specifications, and images are illustrative only. No stock or pricing is represented.</p><a class="button button--outline" href="/buy" data-router-link>View sample inventory <span aria-hidden="true">↗</span></a></div>
      </section>

      <section class="service-band" id="services" aria-labelledby="services-title"><div class="service-band__inner section-wrap"><div class="service-band__intro"><p class="eyebrow"><span class="eyebrow__rule"></span> MORE THAN THE DRIVE</p><h2 id="services-title">Your journey,<br /><em>your way.</em></h2><p>Explore interactive browser-only service previews. They do not accept or send customer requests.</p></div><div class="service-list">
        <a class="service-card" href="/order" data-router-link><span class="service-card__number">01</span><span class="service-card__body"><strong>Order a vehicle</strong><small>Describe the vehicle you have in mind.</small></span><span class="service-card__arrow" aria-hidden="true">↗</span></a>
        <a class="service-card" href="/sell" data-router-link><span class="service-card__number">02</span><span class="service-card__body"><strong>Sell your car</strong><small>Preview a vehicle sale journey.</small></span><span class="service-card__arrow" aria-hidden="true">↗</span></a>
        <a class="service-card" href="/swap" data-router-link><span class="service-card__number">03</span><span class="service-card__body"><strong>Swap your car</strong><small>Compare a current car and a next choice.</small></span><span class="service-card__arrow" aria-hidden="true">↗</span></a>
        <a class="service-card" href="/import" data-router-link><span class="service-card__number">04</span><span class="service-card__body"><strong>Import a vehicle</strong><small>Outline an illustrative import idea.</small></span><span class="service-card__arrow" aria-hidden="true">↗</span></a>
      </div></div></section>

      <section class="statement section-wrap" id="about" aria-labelledby="statement-title"><div class="statement__mark" aria-hidden="true">K<span>.</span></div><div class="statement__copy"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> THE IDEA</p><h2 id="statement-title">Good things happen<br />when the <em>journey feels right.</em></h2><p>This independent concept explores a thoughtful way to discover vehicles and plan a next move. It is a design demonstration by Junior Dev Tech Solutions, not an official or approved Kayus Autos website.</p><a class="text-link text-link--ink" href="/about" data-router-link>About this concept <span aria-hidden="true">↗</span></a></div></section>

      <section class="contact-cta" aria-labelledby="contact-title"><div class="contact-cta__inner section-wrap"><div><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> THE NEXT STEP</p><h2 id="contact-title">Something good<br />is <em>on the horizon.</em></h2></div><div class="contact-cta__aside"><p>This concept does not collect enquiries. Official contact details and enquiry forms will be added only after approval.</p><a class="button button--dark" href="/contact" data-router-link>Contact page status <span aria-hidden="true">↗</span></a></div><span class="contact-cta__ornament" aria-hidden="true">K</span></div></section>`,
  };
}
