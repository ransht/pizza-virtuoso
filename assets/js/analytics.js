export function trackEvent(eventName, eventData = {}) {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    console.info("[Analytics]", eventName, eventData);
  }
}

export function initAnalytics() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-track-event]");
    if (!target) return;
    trackEvent(target.dataset.trackEvent, {
      label: target.textContent.trim(),
      href: target.getAttribute("href")
    });
  });
}
