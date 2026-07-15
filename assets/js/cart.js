import { BUSINESS_CONFIG } from "./config.js";
import { trackEvent } from "./analytics.js";

const STORAGE_KEY = "pizzaVirtuosoCart:v1";
const TOPPINGS = [
  "זיתים ירוקים",
  "זיתים שחורים",
  "פטריות",
  "בצל",
  "תירס",
  "עגבניות",
  "עגבניות שרי",
  "פלפל חריף",
  "בולגרית",
  "טונה",
  "אקסטרה גבינה"
];

let cart = [];
let cartButton;
let cartPanel;
let cartList;
let cartSummary;
let cartCheckout;
let cartStatus;
let customizer;

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    cart = Array.isArray(stored) ? stored : [];
  } catch {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    announce("לא ניתן לשמור את הסל בדפדפן הזה");
  }
}

function parsePrice(text = "") {
  const match = text.replace(/,/g, "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function getItemFromCard(card) {
  const title = card.querySelector("h3, h4")?.textContent.trim();
  if (!title) return null;

  const priceText = card.querySelector(".price")?.textContent.trim() || "";
  const category = card.closest(".menu-group")?.id || card.closest("section")?.id || "featured";
  const isDeal = title.includes("דיל");
  const isPizza = title.includes("פיצה") || isDeal;

  return {
    name: title,
    price: parsePrice(priceText),
    category,
    requiresToppings: isPizza,
    toppingsLabel: isDeal ? "תוספות לדיל" : "תוספות לפיצה"
  };
}

function getDrinkItem(listItem) {
  const name = listItem.textContent.trim();
  if (!name) return null;

  return {
    name,
    price: null,
    category: "drinks",
    requiresToppings: false,
    toppingsLabel: ""
  };
}

function formatPrice(price) {
  return Number.isFinite(price) ? `${price} ₪` : "מחיר לפי המסעדה";
}

function getTotal() {
  return cart.reduce((sum, item) => {
    if (!Number.isFinite(item.price)) return sum;
    return sum + item.price * item.quantity;
  }, 0);
}

function getCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function buildWhatsAppMessage() {
  const lines = ["אני רוצה להזמין מפיצה וירטואוז:", ""];

  cart.forEach((item, index) => {
    const price = Number.isFinite(item.price) ? ` - ${item.price * item.quantity} ₪` : "";
    lines.push(`${index + 1}. ${item.name} x${item.quantity}${price}`);

    if (item.toppings?.length) {
      lines.push(`   תוספות: ${item.toppings.join(", ")}`);
    }

    if (item.note) {
      lines.push(`   הערות: ${item.note}`);
    }
  });

  const total = getTotal();
  if (total > 0) {
    lines.push("", `סה"כ משוער: ${total} ₪`);
  }

  lines.push("", "שם:", "משלוח / איסוף עצמי:", "כתובת אם משלוח:", "הערות:");

  return lines.join("\n");
}

function getWhatsAppUrl() {
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
}

function createButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function addItem(baseItem, options = {}) {
  cart.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: baseItem.name,
    price: baseItem.price,
    category: baseItem.category,
    quantity: 1,
    toppings: options.toppings || [],
    note: options.note?.trim() || ""
  });

  saveCart();
  renderCart();
  openCart();
  announce(`${baseItem.name} נוסף לסל`);
  trackEvent("cart_add", { label: baseItem.name });
}

function removeItem(id) {
  const item = cart.find((cartItem) => cartItem.id === id);
  cart = cart.filter((cartItem) => cartItem.id !== id);
  saveCart();
  renderCart();
  if (item) announce(`${item.name} הוסר מהסל`);
}

function updateQuantity(id, change) {
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeItem(id);
    return;
  }

  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  announce("הסל נוקה");
}

function announce(message) {
  if (!cartStatus) return;
  cartStatus.textContent = message;
}

function openCart() {
  cartPanel.hidden = false;
  cartButton.setAttribute("aria-expanded", "true");
}

function closeCart() {
  cartPanel.hidden = true;
  cartButton.setAttribute("aria-expanded", "false");
}

function closeCustomizer() {
  customizer.hidden = true;
}

function renderCart() {
  const count = getCount();
  cartButton.querySelector("[data-cart-count]").textContent = count;
  cartButton.classList.toggle("has-items", count > 0);

  cartList.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "הסל ריק. הוסיפו פיצה, דיל או שתייה מהתפריט.";
    cartList.append(empty);
    cartCheckout.setAttribute("aria-disabled", "true");
    cartCheckout.removeAttribute("href");
  } else {
    cart.forEach((item) => cartList.append(createCartItem(item)));
    cartCheckout.href = getWhatsAppUrl();
    cartCheckout.removeAttribute("aria-disabled");
  }

  const total = getTotal();
  cartSummary.textContent = total > 0
    ? `סה"כ משוער: ${total} ₪`
    : "המחיר הסופי יאושר בוואטסאפ";
}

function createCartItem(item) {
  const row = document.createElement("article");
  row.className = "cart-item";

  const copy = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.name;
  const meta = document.createElement("p");
  meta.textContent = `${formatPrice(item.price)} · כמות ${item.quantity}`;
  copy.append(title, meta);

  if (item.toppings?.length) {
    const toppings = document.createElement("p");
    toppings.textContent = `תוספות: ${item.toppings.join(", ")}`;
    copy.append(toppings);
  }

  if (item.note) {
    const note = document.createElement("p");
    note.textContent = `הערות: ${item.note}`;
    copy.append(note);
  }

  const actions = document.createElement("div");
  actions.className = "cart-item__actions";

  const decrease = createButton("−", "cart-qty");
  decrease.setAttribute("aria-label", `הפחתת כמות עבור ${item.name}`);
  decrease.addEventListener("click", () => updateQuantity(item.id, -1));

  const increase = createButton("+", "cart-qty");
  increase.setAttribute("aria-label", `הגדלת כמות עבור ${item.name}`);
  increase.addEventListener("click", () => updateQuantity(item.id, 1));

  const remove = createButton("מחיקה", "cart-remove");
  remove.addEventListener("click", () => removeItem(item.id));

  actions.append(decrease, increase, remove);
  row.append(copy, actions);
  return row;
}

function createCartUi() {
  const root = document.createElement("aside");
  root.className = "cart-shell";
  root.setAttribute("aria-label", "סל הזמנה");

  cartButton = createButton("סל", "cart-button");
  cartButton.setAttribute("aria-controls", "cart-panel");
  cartButton.setAttribute("aria-expanded", "false");
  cartButton.innerHTML = `<span class="cart-button__icon" aria-hidden="true"></span><strong>סל</strong><span data-cart-count>0</span>`;
  cartButton.addEventListener("click", () => {
    if (cartPanel.hidden) openCart();
    else closeCart();
  });

  cartPanel = document.createElement("section");
  cartPanel.className = "cart-panel";
  cartPanel.id = "cart-panel";
  cartPanel.hidden = true;

  const header = document.createElement("div");
  header.className = "cart-panel__header";
  header.innerHTML = "<div><p>הזמנה מהירה</p><h2>הסל שלכם</h2></div>";

  const close = createButton("סגירה", "cart-panel__close");
  close.addEventListener("click", closeCart);
  header.append(close);

  cartList = document.createElement("div");
  cartList.className = "cart-list";

  cartSummary = document.createElement("p");
  cartSummary.className = "cart-summary";

  const footer = document.createElement("div");
  footer.className = "cart-panel__footer";

  cartCheckout = document.createElement("a");
  cartCheckout.className = "button button--primary cart-checkout";
  cartCheckout.target = "_blank";
  cartCheckout.rel = "noopener noreferrer";
  cartCheckout.textContent = "שליחת הזמנה בוואטסאפ";
  cartCheckout.dataset.trackEvent = "cart_whatsapp_click";

  const clear = createButton("נקה את כל הסל", "cart-clear");
  clear.addEventListener("click", clearCart);

  cartStatus = document.createElement("p");
  cartStatus.className = "sr-only";
  cartStatus.setAttribute("aria-live", "polite");

  footer.append(cartSummary, cartCheckout, clear);
  cartPanel.append(header, cartList, footer, cartStatus);
  root.append(cartButton, cartPanel);
  document.body.append(root);
}

function createCustomizer() {
  customizer = document.createElement("div");
  customizer.className = "cart-customizer";
  customizer.hidden = true;
  document.body.append(customizer);
}

function openCustomizer(item) {
  const titleId = "cart-customizer-title";
  customizer.innerHTML = `
    <div class="cart-customizer__dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
      <div class="cart-customizer__header">
        <div>
          <p>${item.toppingsLabel}</p>
          <h2 id="${titleId}">${item.name}</h2>
        </div>
        <button type="button" class="cart-panel__close" data-close-customizer>סגירה</button>
      </div>
      <fieldset class="topping-grid">
        <legend>בחרו תוספות</legend>
        ${TOPPINGS.map((topping) => `
          <label>
            <input type="checkbox" value="${topping}">
            <span>${topping}</span>
          </label>
        `).join("")}
      </fieldset>
      <label class="cart-note">
        <span>הערות להזמנה</span>
        <textarea rows="3" placeholder="לדוגמה: בלי חריף, חצי זיתים חצי פטריות, או תוספות לפי מגשים בדיל"></textarea>
      </label>
      <div class="cart-customizer__actions">
        <button type="button" class="button button--primary" data-confirm-customizer>הוסף לסל</button>
        <button type="button" class="button button--ghost" data-close-customizer>ביטול</button>
      </div>
    </div>
  `;

  customizer.hidden = false;
  customizer.querySelector("[data-close-customizer]").focus();

  customizer.addEventListener("click", (event) => {
    if (event.target === customizer) closeCustomizer();
  }, { once: true });

  customizer.querySelectorAll("[data-close-customizer]").forEach((button) => {
    button.addEventListener("click", closeCustomizer);
  });

  customizer.querySelector("[data-confirm-customizer]").addEventListener("click", () => {
    const toppings = [...customizer.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
    const note = customizer.querySelector("textarea").value;
    customizer.hidden = true;
    addItem(item, { toppings, note });
  });
}

function attachCartControls() {
  document.querySelectorAll(".menu-row, .featured-item, .deal-card").forEach((card) => {
    const item = getItemFromCard(card);
    if (!item || card.querySelector("[data-add-to-cart]")) return;

    const button = createButton("הוסף לסל", "cart-add");
    button.dataset.addToCart = "";
    button.addEventListener("click", () => {
      if (item.requiresToppings) openCustomizer(item);
      else addItem(item);
    });

    const target = card.classList.contains("featured-item")
      ? card.querySelector(":scope > div")
      : card;
    target.append(button);
  });

  document.querySelectorAll(".drink-list li").forEach((listItem) => {
    const item = getDrinkItem(listItem);
    if (!item || listItem.querySelector("[data-add-to-cart]")) return;

    const label = document.createElement("span");
    label.textContent = item.name;
    listItem.textContent = "";

    const button = createButton("הוסף", "cart-add cart-add--small");
    button.dataset.addToCart = "";
    button.addEventListener("click", () => addItem(item));
    listItem.append(label, button);
  });
}

export function initCart() {
  if (!("localStorage" in window)) return;

  loadCart();
  createCartUi();
  createCustomizer();
  attachCartControls();
  renderCart();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeCustomizer();
    }
  });
}
