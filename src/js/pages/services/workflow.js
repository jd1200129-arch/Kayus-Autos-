import { escapeHTML } from "../../components/html.js";
import { loadVehicleCatalog, vehicleCatalogSource } from "../../data/vehicle-catalog.js";

const drafts = new Map();
function makeDraft() {
  return { values: {}, photos: [], photoError: "", catalogQueries: {}, step: 0, finished: false };
}

function optionsMarkup(options = [], selectedValue = "") {
  return options.map((option) => {
    const value = typeof option === "string" ? option : option.value;
    const label = typeof option === "string" ? option : option.label;
    return `<option value="${escapeHTML(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHTML(label)}</option>`;
  }).join("");
}

function catalogModelMarkup(field, selectedValue, catalogState, searchQuery = "") {
  if (catalogState.status === "loading") {
    return `<select id="${field.name}" name="${field.name}" disabled><option>Loading the vehicle catalog…</option></select><small class="workflow-field__help" role="status">Loading the vehicle make and model choices.</small>`;
  }
  if (catalogState.status === "error") {
    return `<select id="${field.name}" name="${field.name}" disabled><option>Catalog unavailable</option></select><p class="workflow-field__error" role="alert">The model list could not be loaded. Check your connection and retry.</p><button class="filter-clear" type="button" data-retry-catalog>Retry vehicle list</button>`;
  }

  const groups = catalogOptionGroups(field, catalogState, selectedValue, searchQuery);
  const cleanQuery = searchQuery.trim();
  const prompt = cleanQuery.length >= 2
    ? groups ? "Choose a model" : "No matches. Refine your filter."
    : "Filter by make or model to show choices";
  return `<label class="workflow-field__filter" for="${field.name}-filter">Filter the list <input id="${field.name}-filter" type="search" data-model-filter="${field.name}" value="${escapeHTML(searchQuery)}" placeholder="Optional make or model search" autocomplete="off" /></label><select id="${field.name}" name="${field.name}" aria-labelledby="${field.name}-label" aria-describedby="${field.name}-help" required><option value="">${prompt}</option>${groups}<option value="__not_listed__" ${selectedValue === "__not_listed__" ? "selected" : ""}>My vehicle isn’t listed</option></select><small class="workflow-field__help" id="${field.name}-help">Filter to narrow the catalog, then select a model from the choices. Filter text is never used as the model. The manufacturer fills automatically.</small>`;
}

function catalogOptionGroups(field, catalogState, selectedValue, query = "") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const selectedModel = catalogState.byId.get(selectedValue);
  let matches = terms.length
    ? catalogState.makes.flatMap((make) => make.models.filter((model) => terms.every((term) => `${make.name} ${model.name}`.toLocaleLowerCase().includes(term))))
      .filter((model) => query.trim().length >= 2)
    : selectedModel ? [selectedModel] : [];
  const maximumOptions = 250;
  if (selectedModel && matches.includes(selectedModel)) {
    matches = [selectedModel, ...matches.filter((model) => model !== selectedModel)];
  }
  const truncated = matches.length > maximumOptions;
  matches = matches.slice(0, maximumOptions);
  const grouped = new Map();
  for (const model of matches) {
    const group = grouped.get(model.makeName) || [];
    group.push(model);
    grouped.set(model.makeName, group);
  }
  const options = [...grouped].map(([makeName, models]) => `<optgroup label="${escapeHTML(makeName)}">${models.map((model) => `<option value="${escapeHTML(model.id)}" ${model.id === selectedValue ? "selected" : ""}>${escapeHTML(model.name)}</option>`).join("")}</optgroup>`).join("");
  return `${options}${truncated ? '<option value="" disabled>More matches available — refine your filter</option>' : ""}`;
}

function fieldMarkup(field, value, photos, photoError, catalogState, catalogQueries) {
  const required = field.required ? "required" : "";
  const requiredLabel = field.required ? " <span aria-hidden=\"true\">*</span>" : "";
  const helpId = `${field.name}-help`;
  const help = field.help ? `<small class="workflow-field__help" id="${helpId}">${escapeHTML(field.help)}</small>` : "";
  let control;

  if (field.type === "catalog-model") {
    return `<div class="workflow-field"><span class="workflow-field__label" id="${field.name}-label">${escapeHTML(field.label)}${requiredLabel}</span>${catalogModelMarkup(field, value, catalogState, catalogQueries[field.name] || "")}</div>`;
  } else if (field.type === "catalog-make") {
    control = `<input id="${field.name}" name="${field.name}" type="text" value="${escapeHTML(value || "")}" placeholder="Choose a model first" readonly aria-readonly="true" ${required} />`;
  } else if (field.type === "select" || field.type === "year-select") {
    const options = field.type === "year-select" ? Array.from({ length: new Date().getFullYear() - 1899 }, (_, index) => String(new Date().getFullYear() - index)) : field.options;
    control = `<select id="${field.name}" name="${field.name}" ${required}><option value="">Choose ${field.type === "year-select" ? "a year" : "one"}</option>${optionsMarkup(options, value)}</select>`;
  } else if (field.type === "textarea") {
    control = `<textarea id="${field.name}" name="${field.name}" rows="${field.rows || 4}" maxlength="${field.maxlength || 500}" placeholder="${escapeHTML(field.placeholder || "")}" ${required}>${escapeHTML(value || "")}</textarea>`;
  } else if (field.type === "photos") {
    const names = photos.map((photo) => `<span class="workflow-photo-chip"><img src="${escapeAttr(photo.url)}" alt="" />${escapeHTML(photo.file.name)}</span>`).join("");
    const clearButton = photos.length ? '<button class="filter-clear" type="button" data-clear-photos>Remove selected photos</button>' : "";
    control = `<input id="${field.name}" name="${field.name}" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="${helpId}" /><div class="workflow-photo-list" aria-live="polite">${names}</div>${clearButton}<p class="workflow-field__error" data-photo-error role="alert" ${photoError ? "" : "hidden"}>${escapeHTML(photoError || "")}</p>`;
  } else {
    const constraints = [field.min !== undefined ? `min="${field.min}"` : "", field.max !== undefined ? `max="${field.max}"` : "", field.step !== undefined ? `step="${field.step}"` : ""].filter(Boolean).join(" ");
    const inputmode = field.type === "number" ? "inputmode=\"decimal\"" : "";
    control = `<input id="${field.name}" name="${field.name}" type="${field.type || "text"}" value="${escapeHTML(value || "")}" placeholder="${escapeHTML(field.placeholder || "")}" ${constraints} ${inputmode} ${required} />`;
  }

  return `<label class="workflow-field" for="${field.name}"><span class="workflow-field__label">${escapeHTML(field.label)}${requiredLabel}</span>${control}${help}</label>`;
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, "&#96;");
}

function formatValue(field, value, values) {
  if (!value) return "Not provided";
  if (field.type === "catalog-model") return values[field.modelNameField] || (value === "__not_listed__" ? "Not listed in the vehicle catalog" : "Not provided");
  if (field.type === "number" && field.money) {
    const currency = field.currencyField ? values[field.currencyField] : "USD";
    const amount = Number(value);
    return Number.isFinite(amount) ? `${currency || "USD"} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)}` : String(value);
  }
  const option = field.options?.find((item) => (typeof item === "string" ? item : item.value) === value);
  return option ? (typeof option === "string" ? option : option.label) : String(value);
}

function progressMarkup(steps, currentStep) {
  return `<ol class="workflow-progress" aria-label="Form progress" style="grid-template-columns: repeat(${steps.length}, minmax(0, 1fr))">${steps.map((step, index) => `<li class="${index === currentStep ? "is-current" : index < currentStep ? "is-complete" : ""}" ${index === currentStep ? 'aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span><small>${escapeHTML(step.shortTitle || step.title)}</small></li>`).join("")}</ol>`;
}

function stepMarkup(config, draft, catalogState) {
  const step = config.steps[draft.step];
  return `${progressMarkup(config.steps, draft.step)}<header class="workflow-step__heading"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> STEP ${String(draft.step + 1).padStart(2, "0")} / ${String(config.steps.length).padStart(2, "0")}</p><h2 id="workflow-step-title" tabindex="-1">${escapeHTML(step.title)}</h2><p>${escapeHTML(step.intro)}</p></header><form id="service-step-form" class="workflow-form" ${catalogState.status === "loading" ? 'aria-busy="true"' : ""}><div class="workflow-fields">${step.fields.map((field) => fieldMarkup(field, draft.values[field.name], draft.photos, draft.photoError, catalogState, draft.catalogQueries)).join("")}</div><p class="workflow-error" data-form-error role="alert" hidden></p><div class="workflow-actions">${draft.step > 0 ? '<button class="button button--outline" type="button" data-previous>Back</button>' : '<a class="text-link text-link--ink" href="/buy" data-router-link>Browse sample vehicles</a>'}<button class="button button--dark" type="submit">${draft.step === config.steps.length - 1 ? "Review preview" : "Continue"}<span aria-hidden="true">↗</span></button></div></form>`;
}

function clearDraft(draft) {
  draft?.photos.forEach((photo) => URL.revokeObjectURL(photo.url));
}

function routeBelongsToService(route, serviceKey) {
  return route?.serviceKey === serviceKey && ["service-review", `service-${serviceKey}`].includes(route.type);
}

export function renderServicePage(config) {
  const catalogNotice = config.vehicleCatalog
    ? `<p class="workflow-catalog-note"><a href="${vehicleCatalogSource.url}" target="_blank" rel="noopener noreferrer">Vehicle data by VehiclesDB</a> · CC BY 4.0 · ${vehicleCatalogSource.modelCount || vehicleCatalogSource.carCount.toLocaleString("en-US")} car models across ${vehicleCatalogSource.countryCount} countries, version ${vehicleCatalogSource.version}. This broad catalog is not exhaustive; year choices are not matched to individual models. <a href="${vehicleCatalogSource.attributionUrl}" target="_blank" rel="noopener noreferrer">View full source notices</a>.</p>`
    : "";
  return {
    title: config.title,
    description: config.description,
    activePath: `/${config.key}`,
    html: `<section class="page-hero page-hero--dark"><div class="section-wrap page-hero__inner"><p class="eyebrow"><span class="eyebrow__rule"></span> ${escapeHTML(config.eyebrow)}</p><h1 tabindex="-1">${config.heading}</h1><p>${escapeHTML(config.lead)}</p><div class="page-disclaimer">Independent concept · Preview only · Nothing is sent or saved</div></div></section><section class="workflow-section section-wrap" aria-label="${escapeAttr(config.title)} preview"><div class="workflow-layout"><div class="workflow-card" id="service-workflow" aria-live="polite"></div><aside class="workflow-aside"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> BEFORE YOU BEGIN</p><h2>Explore the process<br /><em>without sending a request.</em></h2><ul><li>Use demonstration details only; no name, email, phone, address, or account fields are requested.</li><li>Your entries stay in this browser tab and are cleared when you leave this service.</li><li>Photos are previewed locally and are never uploaded.</li></ul><p class="workflow-aside__notice">A reviewed privacy notice, company authorization, and secure request service are required before real requests can be accepted.</p>${catalogNotice}</aside></div></section>`,
    mount() {
      const panel = document.querySelector("#service-workflow");
      if (!panel) return;
      const modelFields = config.steps.flatMap((step) => step.fields).filter((field) => field.type === "catalog-model");
      const modelFieldsByName = new Map(modelFields.map((field) => [field.name, field]));
      const needsCatalog = modelFields.length > 0;
      let mounted = true;
      let catalogState = { status: needsCatalog ? "loading" : "ready", makes: [], byId: new Map() };
      let draft = drafts.get(config.key);
      if (!draft) {
        draft = makeDraft();
        drafts.set(config.key, draft);
      }

      function capture(form) {
        for (const [name, value] of new FormData(form).entries()) {
          if (typeof value === "string") draft.values[name] = value.trim();
        }
      }

      function draw() {
        const currentForm = panel.querySelector("#service-step-form");
        if (currentForm) capture(currentForm);
        panel.innerHTML = stepMarkup(config, draft, catalogState);
        panel.querySelector("#workflow-step-title")?.focus({ preventScroll: true });
      }

      function refreshCatalog() {
        if (!needsCatalog) return;
        catalogState = { status: "loading", makes: [], byId: new Map() };
        draw();
        loadVehicleCatalog().then((catalog) => {
          if (!mounted) return;
          catalogState = { status: "ready", ...catalog };
          draw();
        }).catch(() => {
          if (!mounted) return;
          catalogState = { status: "error", makes: [], byId: new Map() };
          draw();
        });
      }

      const onPhotoChange = (event) => {
        const selectedModelField = event.target instanceof HTMLSelectElement ? modelFieldsByName.get(event.target.name) : null;
        if (selectedModelField && catalogState.status === "ready") {
          const selected = event.target.value;
          const item = catalogState.byId.get(selected);
          const notListed = selected === "__not_listed__";
          const makeName = item?.makeName || (notListed ? "Not listed in catalog" : "");
          draft.values[selectedModelField.name] = selected;
          draft.values[selectedModelField.modelNameField] = item?.name || (notListed ? "Not listed in catalog" : "");
          draft.values[selectedModelField.manufacturerField] = makeName;
          const manufacturer = panel.querySelector(`#${selectedModelField.manufacturerField}`);
          if (manufacturer) manufacturer.value = makeName;
          return;
        }
        if (!(event.target instanceof HTMLInputElement) || event.target.type !== "file") return;
        const error = panel.querySelector("[data-photo-error]");
        const picked = [...(event.target.files || [])];
        const valid = picked.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024);
        const tooMany = picked.length > 6;
        clearDraft({ photos: draft.photos });
        draft.photos = valid.slice(0, 6).map((file) => ({ file, url: URL.createObjectURL(file) }));
        draft.photoError = tooMany ? "Choose up to 6 images." : valid.length !== picked.length ? "Use JPG, PNG, or WebP images up to 5 MB each." : "";
        if (error) {
          error.hidden = !draft.photoError;
          error.textContent = draft.photoError;
        }
        const list = panel.querySelector(".workflow-photo-list");
        if (list) list.innerHTML = draft.photos.map((photo) => `<span class="workflow-photo-chip"><img src="${escapeAttr(photo.url)}" alt="" />${escapeHTML(photo.file.name)}</span>`).join("");
        const clearButton = panel.querySelector("[data-clear-photos]");
        if (draft.photos.length && !clearButton && list) {
          const button = document.createElement("button");
          button.className = "filter-clear";
          button.type = "button";
          button.dataset.clearPhotos = "";
          button.textContent = "Remove selected photos";
          list.after(button);
        } else if (!draft.photos.length) {
          clearButton?.remove();
        }
      };

      const onModelFilter = (event) => {
        const input = event.target instanceof HTMLInputElement && event.target.dataset.modelFilter ? event.target : null;
        if (!input || catalogState.status !== "ready") return;
        const field = modelFieldsByName.get(input.dataset.modelFilter);
        if (!field) return;
        const select = panel.querySelector(`#${CSS.escape(field.name)}`);
        if (!select) return;
        const query = input.value;
        draft.catalogQueries[field.name] = query;
        const selected = select.value || draft.values[field.name] || "";
        const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const selectedModel = catalogState.byId.get(selected);
        const selectedText = selectedModel ? `${selectedModel.makeName} ${selectedModel.name}`.toLocaleLowerCase() : "";
        const selectedMatches = !terms.length || selected === "__not_listed__" || Boolean(selectedModel && terms.every((term) => selectedText.includes(term)));
        const keptSelection = selectedMatches ? selected : "";
        const groups = catalogOptionGroups(field, catalogState, keptSelection, query);
        const prompt = query.trim().length >= 2 ? groups ? "Choose a model" : "No matches. Refine your filter." : "Filter by make or model to show choices";
        select.innerHTML = `<option value="">${prompt}</option>${groups}<option value="__not_listed__" ${keptSelection === "__not_listed__" ? "selected" : ""}>My vehicle isn’t listed</option>`;
        select.value = keptSelection;
        if (!selectedMatches) {
          draft.values[field.name] = "";
          draft.values[field.modelNameField] = "";
          draft.values[field.manufacturerField] = "";
          const manufacturer = panel.querySelector(`#${CSS.escape(field.manufacturerField)}`);
          if (manufacturer) manufacturer.value = "";
        }
      };

      const onSubmit = (event) => {
        if (!(event.target instanceof HTMLFormElement) || event.target.id !== "service-step-form") return;
        event.preventDefault();
        const form = event.target;
        const error = panel.querySelector("[data-form-error]");
        capture(form);
        const currentCatalogField = config.steps[draft.step].fields.find((field) => field.type === "catalog-model");
        if (currentCatalogField && catalogState.status !== "ready") {
          if (error) {
            error.hidden = false;
            error.textContent = catalogState.status === "loading" ? "The model list is still loading. Please wait a moment." : "The model list is unavailable. Retry loading it before continuing.";
          }
          return;
        }
        const photoField = config.steps[draft.step].fields.find((field) => field.type === "photos");
        if (!form.reportValidity()) return;
        if (photoField && draft.photoError) {
          panel.querySelector("[data-photo-error]")?.removeAttribute("hidden");
          panel.querySelector(`#${photoField.name}`)?.focus();
          return;
        }
        if (photoField?.required && draft.photos.length === 0) {
          const photoError = panel.querySelector("[data-photo-error]");
          if (photoError) {
            photoError.hidden = false;
            photoError.textContent = "Choose at least one image for this preview.";
            panel.querySelector(`#${photoField.name}`)?.focus();
          }
          return;
        }
        if (error) error.hidden = true;
        if (draft.step < config.steps.length - 1) {
          draft.step += 1;
          draw();
          return;
        }
        window.history.pushState({}, "", `/${config.key}/review`);
        window.dispatchEvent(new PopStateEvent("popstate"));
      };

      const onClick = (event) => {
        if (event.target.closest("[data-retry-catalog]")) {
          refreshCatalog();
          return;
        }
        if (event.target.closest("[data-clear-photos]")) {
          const form = panel.querySelector("#service-step-form");
          if (form) capture(form);
          clearDraft({ photos: draft.photos });
          draft.photos = [];
          draft.photoError = "";
          draw();
          return;
        }
        const previous = event.target.closest("[data-previous]");
        if (previous) {
          const form = panel.querySelector("#service-step-form");
          if (form) capture(form);
          draft.step = Math.max(0, draft.step - 1);
          draw();
          return;
        }
        if (event.target.closest("[data-start-over]")) {
          clearDraft(draft);
          drafts.delete(config.key);
          return;
        }
      };

      panel.addEventListener("change", onPhotoChange);
      panel.addEventListener("input", onModelFilter);
      panel.addEventListener("submit", onSubmit);
      panel.addEventListener("click", onClick);
      if (needsCatalog) refreshCatalog();
      else draw();
      return (nextRoute) => {
        mounted = false;
        panel.removeEventListener("change", onPhotoChange);
        panel.removeEventListener("input", onModelFilter);
        panel.removeEventListener("submit", onSubmit);
        panel.removeEventListener("click", onClick);
        if (!routeBelongsToService(nextRoute, config.key)) {
          clearDraft(draft);
          drafts.delete(config.key);
        }
      };
    },
  };
}

function reviewMarkup(config, draft) {
  if (!draft) {
    return `<div class="workflow-result"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> NO PREVIEW IN THIS TAB</p><h1 tabindex="-1">No draft to review.</h1><p>Start the ${escapeHTML(config.title.toLowerCase())} journey to create a temporary preview. Nothing has been sent or saved.</p><a class="button button--dark" href="/${config.key}" data-router-link>Start preview <span aria-hidden="true">↗</span></a></div>`;
  }
  if (draft.finished) {
    return `<div class="workflow-result workflow-result--success"><span class="status-badge">PREVIEW COMPLETE</span><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> NOTHING WAS SUBMITTED</p><h1 tabindex="-1">Your preview is complete.</h1><p>This was only a browser preview. No customer request, quote, inspection, valuation, offer, or tracking record was created.</p><div class="workflow-actions"><a class="button button--dark" href="/${config.key}" data-router-link data-start-over>Start another preview <span aria-hidden="true">↗</span></a><a class="button button--outline" href="/" data-router-link>Return home</a></div></div>`;
  }

  const rows = config.steps.flatMap((step) => step.fields.filter((field) => field.type !== "photos").map((field) => `<div><dt>${escapeHTML(field.label)}</dt><dd>${escapeHTML(formatValue(field, draft.values[field.name], draft.values))}</dd></div>`)).join("");
  const photos = config.steps.some((step) => step.fields.some((field) => field.type === "photos"))
    ? `<div class="workflow-review-photos"><strong>Selected photos (local preview only)</strong><span>${draft.photos.length ? `${draft.photos.length} image${draft.photos.length === 1 ? "" : "s"} selected` : "No images selected"}</span><div>${draft.photos.map((photo) => `<figure><img src="${escapeAttr(photo.url)}" alt="Local preview of ${escapeAttr(photo.file.name)}" /><figcaption>${escapeHTML(photo.file.name)}</figcaption></figure>`).join("")}</div></div>`
    : "";
  return `<div class="workflow-result"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> REVIEW YOUR PREVIEW</p><h1 tabindex="-1">A clear view of your ${escapeHTML(config.reviewNoun)}.</h1><p>Check the details below. This preview remains in this browser tab and is not sent to Kayus Autos or stored.</p><dl class="workflow-review-list">${rows}</dl>${photos}<p class="workflow-aside__notice">This concept cannot accept or track real requests. Do not use real customer, vehicle-owner, or contact information.</p><div class="workflow-actions"><a class="button button--outline" href="/${config.key}" data-router-link>Edit details</a><button class="button button--dark" type="button" data-finish-preview>Finish preview <span aria-hidden="true">↗</span></button></div></div>`;
}

export function renderServiceReview(route, configs) {
  const config = configs[route.serviceKey];
  const draft = drafts.get(route.serviceKey);
  return {
    title: `${config.title} preview review`,
    description: "Review a temporary browser-only concept preview. No request is submitted or stored.",
    activePath: `/${config.key}`,
    html: `<section class="workflow-section section-wrap workflow-review-page"><div class="workflow-card" id="service-review">${reviewMarkup(config, draft)}</div><p class="workflow-return"><a class="text-link text-link--ink" href="/${config.key}" data-router-link data-start-over>Start over</a></p></section>`,
    mount() {
      const panel = document.querySelector("#service-review");
      const root = panel?.closest(".workflow-review-page");
      if (!panel || !root) return;
      const onClick = (event) => {
        const finish = event.target.closest("[data-finish-preview]");
        if (finish) {
          const activeDraft = drafts.get(route.serviceKey);
          if (!activeDraft) return;
          activeDraft.finished = true;
          panel.innerHTML = reviewMarkup(config, activeDraft);
          panel.querySelector("h1")?.focus({ preventScroll: true });
        }
        if (event.target.closest("[data-start-over]")) {
          clearDraft(drafts.get(route.serviceKey));
          drafts.delete(route.serviceKey);
        }
      };
      root.addEventListener("click", onClick);
      return (nextRoute) => {
        root.removeEventListener("click", onClick);
        if (!routeBelongsToService(nextRoute, route.serviceKey)) {
          clearDraft(drafts.get(route.serviceKey));
          drafts.delete(route.serviceKey);
        }
      };
    },
  };
}

export function renderServiceRequestState(route, configs) {
  const config = configs[route.serviceKey];
  const state = route.params.state === "track" ? "tracking" : "confirmation";
  return {
    title: `${config.title} ${state}`,
    description: "Real customer requests and tracking are not active in this independent concept.",
    activePath: `/${config.key}`,
    html: `<section class="status-page status-page--gold section-wrap"><p class="eyebrow eyebrow--ink"><span class="eyebrow__rule"></span> ${state === "tracking" ? "TRACKING NOT ACTIVE" : "NO REQUEST RECORD"}</p><h1 tabindex="-1">${state === "tracking" ? "No request to track." : "No request was submitted."}</h1><p>This demonstration route does not represent a real request. There is no database record or status available for this reference. The request service is not active.</p><div class="request-context"><span>Demonstration route reference</span><strong><code>${escapeHTML(route.params.requestId)}</code></strong><small>No customer or request data is associated with this identifier.</small></div><div class="status-page__actions"><a class="button button--dark" href="/${config.key}" data-router-link>Explore the ${escapeHTML(config.key)} preview <span aria-hidden="true">↗</span></a><a class="text-link text-link--ink" href="/" data-router-link>Return home</a></div></section>`,
  };
}
