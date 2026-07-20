const MENU_URL = "assets/data/menu.json";

function formatPrice(price) {
  return `${price} ₪`;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function findMenuEntry(menu, categoryId, itemId, variantId) {
  const category = menu.categories.find((candidate) => candidate.id === categoryId);
  const item = category?.items?.find((candidate) => candidate.id === itemId);
  const variant = item?.variants?.find((candidate) => candidate.id === variantId);
  return { category, item, variant };
}

function getCartPayload(category, item, variant = null, extra = {}) {
  const name = variant ? `${item.name} ${variant.label}` : item.name;
  return {
    name,
    price: variant?.price ?? item.price ?? extra.price,
    category: category.id,
    type: item.type || extra.type || "item",
    size: variant?.size || "",
    itemId: variant?.id || item.id
  };
}

function applyCartData(element, payload) {
  element.dataset.cartName = payload.name;
  element.dataset.cartPrice = String(payload.price ?? "");
  element.dataset.cartCategory = payload.category;
  element.dataset.cartType = payload.type;
  element.dataset.cartSize = payload.size || "";
  element.dataset.cartItemId = payload.itemId;
}

function createOrderButton(label = "הוסף לסל") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "cart-add";
  button.dataset.addToCart = "";
  button.textContent = label;
  return button;
}

function createVariantButton(category, item, variant) {
  const button = createOrderButton(`הוסף ${variant.label}`);
  button.classList.add("cart-add--variant");
  applyCartData(button, getCartPayload(category, item, variant));
  return button;
}

function createPizzaCard(category, item) {
  const card = createElement("article", "menu-product menu-product--pizza");

  if (item.image) {
    const media = createElement("div", "menu-product__media");
    const image = document.createElement("img");
    image.src = item.image;
    image.width = 720;
    image.height = 405;
    image.loading = "lazy";
    image.alt = item.imageAlt || item.name;
    media.append(image);
    card.append(media);
  }

  const copy = createElement("div", "menu-product__copy");
  const title = createElement("h4", "", item.name);
  copy.append(title);

  if (item.description) {
    copy.append(createElement("p", "", item.description));
  }

  const variants = createElement("div", "pizza-size-grid");
  item.variants.forEach((variant) => {
    const option = createElement("div", "pizza-size-option");
    const size = createElement("span", "pizza-size-option__size", variant.label);
    const price = createElement("strong", "", formatPrice(variant.price));
    const button = createVariantButton(category, item, variant);
    option.append(size, price, button);
    variants.append(option);
  });

  card.append(copy, variants);
  return card;
}

function createMenuRow(category, item) {
  const row = createElement("article", "menu-row");
  const copy = document.createElement("div");
  const title = createElement("h4", "", item.name);
  copy.append(title);

  if (item.description) {
    copy.append(createElement("p", "", item.description));
  }

  const price = createElement("p", "price", formatPrice(item.price));
  const button = createOrderButton();
  applyCartData(button, getCartPayload(category, item));

  row.append(copy, price, button);
  return row;
}

function renderPizzaToppings(container, menu) {
  const note = createElement("div", "menu-note menu-note--toppings");
  const title = createElement("p");
  title.innerHTML = "<strong>תוספות לפיצה:</strong> בחרו תוספות אחרי לחיצה על הוסף לסל.";
  note.append(title);

  Object.values(menu.pizzaToppings).forEach((group) => {
    const line = createElement("p");
    line.innerHTML = `<strong>${group.label}:</strong> M ${formatPrice(group.pricesBySize.M)}, L ${formatPrice(group.pricesBySize.L)}, XL ${formatPrice(group.pricesBySize.XL)}. ${group.items.join(", ")}`;
    note.append(line);
  });

  container.append(note);
}

function renderCategory(category, menu) {
  const section = createElement("section", "menu-group");
  section.id = category.id;
  section.setAttribute("aria-labelledby", `${category.id}-title`);

  const title = createElement("h3", "", category.title);
  title.id = `${category.id}-title`;
  section.append(title);

  if (category.description) {
    section.append(createElement("p", "menu-help", category.description));
  }

  if (category.id === "pizzas") {
    renderPizzaToppings(section, menu);
  }

  if (category.groups) {
    category.groups.forEach((group) => section.append(renderDrinkGroup(category, group)));
    return section;
  }

  const list = createElement("div", "menu-list");
  category.items.forEach((item) => {
    if (item.variants) {
      list.append(createPizzaCard(category, item));
    } else {
      list.append(createMenuRow(category, item));
    }
  });

  section.append(list);
  return section;
}

function renderDrinkGroup(category, group) {
  const section = createElement("section", "drink-group");
  const header = createElement("div", "drink-group__header");
  const title = createElement("h4", "", group.title);
  header.append(title);
  if (group.price) {
    header.append(createElement("span", "drink-group__price", formatPrice(group.price)));
  }
  const list = createElement("ul", "drink-list");

  group.items.forEach((entry) => {
    const item = typeof entry === "string"
      ? { id: `${group.id}-${entry}`, name: entry, price: group.price }
      : entry;

    const row = document.createElement("li");
    const label = createElement("span", "", item.name);
    const price = createElement("strong", "", formatPrice(item.price));
    const button = createOrderButton("הוסף");
    button.classList.add("cart-add--small");
    applyCartData(button, {
      name: `${item.name} (${group.title})`,
      price: item.price,
      category: category.id,
      type: "drink",
      itemId: item.id
    });

    row.append(label, price, button);
    list.append(row);
  });

  section.append(header, list);
  return section;
}

function renderTabs(menu) {
  const tabs = document.querySelector("[data-menu-tabs]");
  if (!tabs) return;

  tabs.replaceChildren();
  menu.categories.forEach((category) => {
    const link = document.createElement("a");
    link.href = `#${category.id}`;
    link.dataset.trackEvent = "menu_category_click";
    link.textContent = category.title;
    tabs.append(link);
  });
}

function renderMenu(menu) {
  const groups = document.querySelector("[data-menu-groups]");
  if (!groups) return;

  groups.replaceChildren();
  menu.categories.forEach((category) => {
    groups.append(renderCategory(category, menu));
  });
}

function renderFeatured(menu) {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;

  grid.replaceChildren();
  menu.featured.forEach((featured) => {
    const { category, item, variant } = findMenuEntry(menu, featured.categoryId, featured.itemId, featured.variantId);
    if (!category || !item || !variant) return;

    const card = createElement("article", "featured-item");
    const image = document.createElement("img");
    image.src = featured.image;
    image.width = 720;
    image.height = 540;
    image.loading = "lazy";
    image.alt = featured.imageAlt;

    const content = document.createElement("div");
    content.append(createElement("span", "badge", featured.badge));
    content.append(createElement("h3", "", `${item.name} ${variant.label}`));
    content.append(createElement("p", "", item.description));
    content.append(createElement("p", "price", formatPrice(variant.price)));

    const button = createOrderButton();
    applyCartData(button, getCartPayload(category, item, variant));
    content.append(button);

    card.append(image, content);
    grid.append(card);
  });
}

export async function initMenu() {
  const response = await fetch(MENU_URL);
  if (!response.ok) throw new Error(`Menu load failed: ${response.status}`);

  const menu = await response.json();
  window.PIZZA_VIRTUOSO_MENU = menu;
  renderTabs(menu);
  renderFeatured(menu);
  renderMenu(menu);
  document.dispatchEvent(new CustomEvent("pizza-virtuoso:menu-ready", { detail: menu }));
  return menu;
}
