const requests = document.querySelector("#rq");
const fillRate = document.querySelector("#fr");
const ecpm = document.querySelector("#ec");
const pageViews = document.querySelector("#pv");
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const rpmNote = document.querySelector("#rpm-note");

function validate(field, message, optional = false) {
  const valid = field.validity.valid && (optional || field.value !== "");
  field.setAttribute("aria-invalid", String(!valid));
  const error = document.getElementById(`${field.id}-error`);
  error.textContent = valid ? "" : message;
  return valid;
}

function show(id, value, format) {
  const output = document.getElementById(id);
  const text = Number.isFinite(value) ? format.format(value) : "—";
  if (output.value !== text) output.value = text;
}

function update() {
  const requestsValid = validate(requests, "Enter a whole number of ad requests, 0 or greater.");
  const fillValid = validate(fillRate, "Enter a fill rate from 0 to 100%.");
  const ecpmValid = validate(ecpm, "Enter an eCPM of $0 or more.");
  const viewsValid = validate(pageViews, "Enter a whole number of page views, 0 or greater.", true);
  const fill = fillRate.valueAsNumber / 100;
  const impressions = requestsValid && fillValid ? requests.valueAsNumber * fill : NaN;
  const revenue = ecpmValid ? impressions * ecpm.valueAsNumber / 1000 : NaN;
  const views = viewsValid ? pageViews.valueAsNumber : NaN;
  const fillGain = requestsValid && fillValid && ecpmValid
    ? requests.valueAsNumber * Math.min(.01, 1 - fill) * ecpm.valueAsNumber / 1000
    : NaN;

  show("impressions", Math.round(impressions), number);
  show("revenue", revenue, currency);
  show("rpm", views > 0 ? revenue / views * 1000 : NaN, currency);
  show("fill-gain", fillGain, currency);
  const note = viewsValid && !(views > 0) ? "Enter page views greater than 0 to calculate page RPM." : "";
  if (rpmNote.textContent !== note) rpmNote.textContent = note;
}

[requests, fillRate, ecpm, pageViews].forEach(field => field.addEventListener("input", update));
update();
