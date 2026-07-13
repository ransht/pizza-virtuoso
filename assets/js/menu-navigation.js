export function initMenuNavigation() {
  const tabs = document.querySelector("[data-menu-tabs]");
  if (!tabs) return;
  const links = [...tabs.querySelectorAll("a[href^='#']")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((item) => item.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "true");
    });
  });

  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.2, 0.5, 0.8] });
  sections.forEach((section) => observer.observe(section));
}
