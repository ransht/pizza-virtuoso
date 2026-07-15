import { initNavigation } from "./navigation.js";
import { initMenuNavigation } from "./menu-navigation.js";
import { initAnimations } from "./animations.js";
import { initAccessibility } from "./accessibility.js";
import { initAnalytics } from "./analytics.js";
import { initCart } from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initMenuNavigation();
  initAnimations();
  initAccessibility();
  initAnalytics();
  initCart();
});
