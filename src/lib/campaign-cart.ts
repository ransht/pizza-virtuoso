import type { Promotion } from '../content/campaign/love';

type Cart = Record<string, number>;
const STORAGE_KEY = 'pizza-virtuoso-love-cart-v1';

function readCart(): Cart {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function track(event: string, parameters: Record<string, string | number> = {}) {
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
  analyticsWindow.gtag?.('event', event, parameters);
}

export function buildWhatsAppCheckoutUrl(promotions: Promotion[], cart: Cart, notes: string) {
  const promotionMap = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  let total = 0;
  const lines = Object.entries(cart).flatMap(([id, quantity]) => {
    const promotion = promotionMap.get(id);
    if (!promotion || quantity < 1) return [];
    const lineTotal = promotion.price * quantity;
    total += lineTotal;
    return [`• ${promotion.name} — ${promotion.product} × ${quantity} — ${lineTotal} ₪`];
  });
  const cleanNotes = notes.replace(/[<>]/g, '').trim();
  const message = [
    'היי פיצה וירטואוז ❤️',
    '',
    'אני רוצה להזמין ממבצעי יום האהבה:',
    '',
    ...lines,
    '',
    `סה״כ: ${total} ₪`,
    '',
    'הערות:',
    cleanNotes || 'ללא',
    '',
    'שם:',
    'שעת איסוף מועדפת:',
    '',
    'תודה ❤️',
  ].join('\n');
  return { total, url: `https://wa.me/972542537257?text=${encodeURIComponent(message)}` };
}

export function initCampaignCart(promotions: Promotion[]) {
  const promotionMap = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  const dialog = document.querySelector<HTMLDialogElement>('[data-cart-dialog]');
  const list = document.querySelector<HTMLElement>('[data-cart-list]');
  const empty = document.querySelector<HTMLElement>('[data-cart-empty]');
  const totalNodes = document.querySelectorAll<HTMLElement>('[data-cart-total]');
  const countNodes = document.querySelectorAll<HTMLElement>('[data-cart-count]');
  const live = document.querySelector<HTMLElement>('[data-cart-live]');
  const notes = document.querySelector<HTMLTextAreaElement>('[data-cart-notes]');
  let cart = readCart();
  let lastTrigger: HTMLElement | null = null;

  if (!dialog || !list || !empty || !notes) return;

  const summary = () => {
    let count = 0;
    let total = 0;
    for (const [id, quantity] of Object.entries(cart)) {
      const promotion = promotionMap.get(id);
      if (!promotion || quantity < 1) continue;
      count += quantity;
      total += promotion.price * quantity;
    }
    return { count, total };
  };

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  };

  const announce = (message: string) => {
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  };

  const render = () => {
    const { count, total } = summary();
    countNodes.forEach((node) => { node.textContent = String(count); });
    totalNodes.forEach((node) => { node.textContent = `${total} ₪`; });
    document.body.classList.toggle('has-cart-items', count > 0);
    list.replaceChildren();

    const entries = Object.entries(cart).filter(([id, quantity]) => promotionMap.has(id) && quantity > 0);
    empty.hidden = entries.length > 0;
    list.hidden = entries.length === 0;

    entries.forEach(([id, quantity]) => {
      const promotion = promotionMap.get(id)!;
      const item = document.createElement('li');
      item.className = 'cart-line';
      item.innerHTML = `
        <div class="cart-line-copy">
          <strong>${promotion.name}</strong>
          <span>${promotion.size} · ${promotion.price * quantity} ₪</span>
        </div>
        <div class="quantity-control" aria-label="כמות עבור ${promotion.name}">
          <button type="button" data-cart-action="decrease" data-id="${id}" aria-label="הפחתת ${promotion.name}">−</button>
          <b aria-live="off">${quantity}</b>
          <button type="button" data-cart-action="increase" data-id="${id}" aria-label="הוספת ${promotion.name}">+</button>
        </div>
        <button class="remove-line" type="button" data-cart-action="remove" data-id="${id}" aria-label="הסרת ${promotion.name}">הסרה</button>`;
      list.append(item);
    });
    persist();
  };

  const openCart = (trigger?: HTMLElement) => {
    if (trigger) lastTrigger = trigger;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('cart-open');
    track('cart_opened');
    dialog.querySelector<HTMLElement>('[data-cart-close]')?.focus();
  };

  const closeCart = () => {
    dialog.close();
    document.body.classList.remove('cart-open');
    lastTrigger?.focus();
  };

  document.querySelectorAll<HTMLElement>('[data-open-cart]').forEach((button) => {
    button.addEventListener('click', () => openCart(button));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-add-promotion]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.addPromotion;
      const promotion = id ? promotionMap.get(id) : undefined;
      if (!id || !promotion) return;
      cart[id] = (cart[id] || 0) + 1;
      button.classList.remove('is-added');
      requestAnimationFrame(() => button.classList.add('is-added'));
      render();
      announce(`${promotion.name} נוסף לעגלה`);
      track('promotion_added', { item_id: id, value: promotion.price });
    });
  });

  list.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-cart-action]');
    const id = button?.dataset.id;
    const action = button?.dataset.cartAction;
    if (!id || !action || !promotionMap.has(id)) return;
    if (action === 'increase') cart[id] = (cart[id] || 0) + 1;
    if (action === 'decrease') cart[id] = Math.max(0, (cart[id] || 0) - 1);
    if (action === 'remove') cart[id] = 0;
    if (cart[id] === 0) {
      delete cart[id];
      track('promotion_removed', { item_id: id });
    }
    render();
    announce('העגלה עודכנה');
  });

  dialog.querySelector('[data-cart-close]')?.addEventListener('click', closeCart);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeCart();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('cart-open'));
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeCart();
  });

  dialog.querySelector('[data-clear-cart]')?.addEventListener('click', () => {
    cart = {};
    render();
    announce('העגלה נוקתה');
  });

  dialog.querySelector('[data-checkout]')?.addEventListener('click', () => {
    const { count, total } = summary();
    if (!count) {
      announce('העגלה עדיין ריקה');
      empty.focus();
      return;
    }
    track('checkout_initiated', { value: total, items: count });
    const checkout = buildWhatsAppCheckoutUrl(promotions, cart, notes.value);
    window.open(checkout.url, '_blank', 'noopener,noreferrer');
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-track]').forEach((link) => {
    link.addEventListener('click', () => track(link.dataset.track || 'navigation_click', { link_url: link.href }));
  });

  const pizza = document.querySelector<HTMLButtonElement>('[data-pizza]');
  pizza?.addEventListener('click', () => {
    pizza.classList.remove('is-boosted');
    requestAnimationFrame(() => pizza.classList.add('is-boosted'));
    window.setTimeout(() => pizza.classList.remove('is-boosted'), 900);
  });

  render();
}
