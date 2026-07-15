import { initNavigation } from "./navigation.js";
import { initMenu } from "./menu-renderer.js";
import { initMenuNavigation } from "./menu-navigation.js";
import { initAnimations } from "./animations.js";
import { initAccessibility } from "./accessibility.js";
import { initAnalytics } from "./analytics.js";
import { initCart } from "./cart.js";

document.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  initAnimations();
  initAccessibility();
  initAnalytics();

  try {
    const menu = await initMenu();
    initMenuNavigation();
    initCart(menu);
  } catch (error) {
    console.error("Could not load menu", error);
    initMenuNavigation();
    initCart();
  }
});
