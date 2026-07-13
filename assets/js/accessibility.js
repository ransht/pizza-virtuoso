export function initAccessibility() {
  document.body.classList.add("has-mobile-action");
  document.querySelector("[data-current-year]").textContent = new Date().getFullYear();
}
