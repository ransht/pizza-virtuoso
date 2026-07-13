const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function initNavigation() {
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!header || !toggle || !nav) return;

  const setScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.hidden = true;
    document.body.classList.remove("is-nav-open");
    header.classList.remove("is-open");
  };
  const openMenu = () => {
    toggle.setAttribute("aria-expanded", "true");
    nav.hidden = false;
    document.body.classList.add("is-nav-open");
    header.classList.add("is-open");
    nav.querySelector(focusableSelector)?.focus();
  };

  toggle.addEventListener("click", () => {
    toggle.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
    if (event.key !== "Tab" || nav.hidden) return;
    const focusable = [...nav.querySelectorAll(focusableSelector)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.addEventListener("scroll", setScrolled, { passive: true });
  setScrolled();
}
