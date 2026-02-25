export function loadAnalytics() {
  if ((window as any).__analytics_loaded__) return;

  (window as any).__analytics_loaded__ = true;

  const script = document.createElement("script");
  script.src = "/analytics.js";
  script.defer = true;
  document.body.appendChild(script);
}
