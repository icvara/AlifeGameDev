// Shared settings and small helpers used on every page.

// ---- Put your survey link here ----
const SURVEY_URL = "#";
const DEADLINE = new Date("2026-11-27T23:59:59");

// Every "Take the survey" button (class js-survey) points to the survey.
document.querySelectorAll(".js-survey").forEach(a => {
  a.href = SURVEY_URL;
  if (SURVEY_URL !== "#") { a.target = "_blank"; a.rel = "noopener"; }
});

// "N days left" text, wherever an element with class js-days-left exists.
(function () {
  const days = Math.ceil((DEADLINE - new Date()) / 864e5);
  const text = days > 1 ? days + " days left" : days === 1 ? "last day!" : "now closed";
  document.querySelectorAll(".js-days-left").forEach(el => { el.textContent = text; });
})();
