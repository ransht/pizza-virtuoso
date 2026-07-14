import { BUSINESS_CONFIG } from "./config.js";

const measurementId = BUSINESS_CONFIG.googleAnalyticsMeasurementId?.trim();
let isGoogleAnalyticsReady = false;

function isLocalhost() {
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function loadGoogleAnalytics() {
  if (!measurementId || isLocalhost()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_title: document.title,
    page_location: window.location.href
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);

  isGoogleAnalyticsReady = true;
}

export function trackEvent(eventName, eventData = {}) {
  if (isLocalhost()) {
    console.info("[Analytics]", eventName, eventData);
  }

  if (!isGoogleAnalyticsReady || typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    event_category: "engagement",
    event_label: eventData.label,
    link_url: eventData.href
  });
}

export function initAnalytics() {
  loadGoogleAnalytics();

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-track-event]");
    if (!target) return;
    trackEvent(target.dataset.trackEvent, {
      label: target.textContent.trim(),
      href: target.getAttribute("href")
    });
  });
}
