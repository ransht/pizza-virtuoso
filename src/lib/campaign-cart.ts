import type { Promotion } from '../content/campaign/love';
import type { CampaignTopping, ToppingPlacement } from '../content/campaign/toppings';

type SelectedTopping = {
  id: string;
  name: string;
  pizzaIndex: number;
  placement: ToppingPlacement;
  unitPrice: number;
};
type CartLine = {
  key: string;
  promotionId: string;
  quantity: number;
  toppings: SelectedTopping[];
};
export type CartState = {
  lines: CartLine[];
  fulfillment: 'pickup' | 'delivery';
  address: string;
};

const STORAGE_KEY = 'pizza-virtuoso-love-cart-v3';
const PREVIOUS_KEY = 'pizza-virtuoso-love-cart-v2';
const LEGACY_KEY = 'pizza-virtuoso-love-cart-v1';
const DELIVERY_PRICE = 25;
const placementLabels: Record<ToppingPlacement, string> = {
  whole: 'מגש שלם',
  right: 'חצי ימין',
  left: 'חצי שמאל',
};

function readState(promotions: Promotion[]): CartState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(PREVIOUS_KEY) || 'null');
    if (saved?.lines && Array.isArray(saved.lines)) {
      return {
        lines: saved.lines
          .filter((line: CartLine) => promotions.some((promotion) => promotion.id === line.promotionId) && line.quantity > 0)
          .map((line: CartLine) => ({
            ...line,
            toppings: (line.toppings || []).map((topping) => ({ ...topping, pizzaIndex: topping.pizzaIndex || 1 })),
          })),
        fulfillment: saved.fulfillment === 'delivery' ? 'delivery' : 'pickup',
        address: typeof saved.address === 'string' ? saved.address : '',
      };
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}') as Record<string, number>;
    const lines = Object.entries(legacy).flatMap(([promotionId, quantity]) => {
      if (!promotions.some((promotion) => promotion.id === promotionId) || quantity < 1) return [];
      return [{ key: promotionId, promotionId, quantity, toppings: [] }];
    });
    return { lines, fulfillment: 'pickup', address: '' };
  } catch {
    return { lines: [], fulfillment: 'pickup', address: '' };
  }
}

function track(event: string, parameters: Record<string, string | number> = {}) {
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
  analyticsWindow.gtag?.('event', event, parameters);
}

function lineUnitTotal(line: CartLine, promotion: Promotion) {
  const toppingsTotal = line.toppings.reduce((sum, topping) => sum + topping.unitPrice, 0);
  return promotion.price + toppingsTotal;
}

function stateSummary(promotions: Promotion[], state: CartState) {
  const promotionMap = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  let count = 0;
  let itemsSubtotal = 0;
  state.lines.forEach((line) => {
    const promotion = promotionMap.get(line.promotionId);
    if (!promotion) return;
    count += line.quantity;
    itemsSubtotal += lineUnitTotal(line, promotion) * line.quantity;
  });
  const delivery = state.fulfillment === 'delivery' && count > 0 ? DELIVERY_PRICE : 0;
  return { count, itemsSubtotal, delivery, total: itemsSubtotal + delivery };
}

export function buildWhatsAppCheckoutUrl(promotions: Promotion[], state: CartState, notes: string) {
  const promotionMap = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  const { itemsSubtotal, delivery, total } = stateSummary(promotions, state);
  const lines = state.lines.flatMap((line) => {
    const promotion = promotionMap.get(line.promotionId);
    if (!promotion || line.quantity < 1) return [];
    const unitTotal = lineUnitTotal(line, promotion);
    const toppingText = promotion.pizzas > 1
      ? Array.from({ length: promotion.pizzas }, (_, index) => {
          const pizzaToppings = line.toppings.filter((topping) => topping.pizzaIndex === index + 1);
          const description = pizzaToppings.length
            ? pizzaToppings.map((topping) => `${topping.name} (${placementLabels[topping.placement]})`).join(', ')
            : 'ללא תוספות';
          return `\n  מגש ${index + 1}: ${description}`;
        }).join('')
      : line.toppings.length
        ? `\n  תוספות: ${line.toppings.map((topping) => `${topping.name} (${placementLabels[topping.placement]})`).join(', ')}`
        : '\n  ללא תוספות';
    return [`• ${promotion.name} — ${promotion.product}${toppingText}\n  ${line.quantity} × ${unitTotal} ₪ = ${unitTotal * line.quantity} ₪`];
  });
  const cleanNotes = notes.replace(/[<>]/g, '').trim();
  const cleanAddress = state.address.replace(/[<>]/g, '').trim();
  const fulfillmentText = state.fulfillment === 'delivery' ? `משלוח בתשלום — ${DELIVERY_PRICE} ₪` : 'איסוף עצמי';
  const message = [
    'היי פיצה וירטואוז',
    '',
    'אני רוצה להזמין ממבצעי יום האהבה:',
    '',
    ...lines,
    '',
    `סכום פריטים: ${itemsSubtotal} ₪`,
    ...(delivery ? [`משלוח: ${delivery} ₪`] : []),
    `סה״כ: ${total} ₪`,
    '',
    `אופן קבלה: ${fulfillmentText}`,
    ...(state.fulfillment === 'delivery' ? [`כתובת: ${cleanAddress}`] : []),
    '',
    'הערות:',
    cleanNotes || 'ללא',
    '',
    'שם:',
    'שעה מועדפת:',
    '',
    'תודה!',
  ].join('\n');
  return { total, url: `https://wa.me/972542537257?text=${encodeURIComponent(message)}` };
}

export function initCampaignCart(promotions: Promotion[], toppings: CampaignTopping[]) {
  const promotionMap = new Map(promotions.map((promotion) => [promotion.id, promotion]));
  const toppingMap = new Map(toppings.map((topping) => [topping.id, topping]));
  const cartDialog = document.querySelector<HTMLDialogElement>('[data-cart-dialog]');
  const customizerDialog = document.querySelector<HTMLDialogElement>('[data-customizer-dialog]');
  const list = document.querySelector<HTMLElement>('[data-cart-list]');
  const empty = document.querySelector<HTMLElement>('[data-cart-empty]');
  const notes = document.querySelector<HTMLTextAreaElement>('[data-cart-notes]');
  const address = document.querySelector<HTMLInputElement>('[data-address]');
  const addressWrap = document.querySelector<HTMLElement>('[data-delivery-address]');
  const addressError = document.querySelector<HTMLElement>('[data-address-error]');
  const live = document.querySelector<HTMLElement>('[data-cart-live]');
  const totalNodes = document.querySelectorAll<HTMLElement>('[data-cart-total]');
  const countNodes = document.querySelectorAll<HTMLElement>('[data-cart-count]');
  const subtotalNode = document.querySelector<HTMLElement>('[data-items-subtotal]');
  const deliveryRow = document.querySelector<HTMLElement>('[data-delivery-row]');
  let state = readState(promotions);
  let lastTrigger: HTMLElement | null = null;
  let activePromotion: Promotion | null = null;
  let activePizzaIndex = 1;
  let selectedToppings = new Map<string, ToppingPlacement>();

  if (!cartDialog || !customizerDialog || !list || !empty || !notes || !address || !addressWrap) return;

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.removeItem(PREVIOUS_KEY);
      localStorage.removeItem(LEGACY_KEY);
    } catch {}
  };

  const announce = (message: string) => {
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  };

  const bumpCart = () => {
    document.querySelectorAll<HTMLElement>('[data-open-cart]').forEach((button) => {
      button.classList.remove('cart-bump');
      requestAnimationFrame(() => button.classList.add('cart-bump'));
    });
  };

  const animateCartTransfer = (source: HTMLElement) => {
    const target = [...document.querySelectorAll<HTMLElement>('.floating-cart, .campaign-mobile-bar [data-open-cart]')]
      .find((element) => element.getBoundingClientRect().width > 0);
    if (!target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'cart-fly';
    dot.style.setProperty('--fly-x', `${to.left + to.width / 2 - (from.left + from.width / 2)}px`);
    dot.style.setProperty('--fly-y', `${to.top + to.height / 2 - (from.top + from.height / 2)}px`);
    dot.style.left = `${from.left + from.width / 2}px`;
    dot.style.top = `${from.top + from.height / 2}px`;
    document.body.append(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  };

  const render = (enteringKey?: string) => {
    const { count, itemsSubtotal, delivery, total } = stateSummary(promotions, state);
    countNodes.forEach((node) => { node.textContent = String(count); });
    totalNodes.forEach((node) => { node.textContent = `${total} ₪`; });
    if (subtotalNode) subtotalNode.textContent = `${itemsSubtotal} ₪`;
    if (deliveryRow) deliveryRow.hidden = delivery === 0;
    document.body.classList.toggle('has-cart-items', count > 0);
    document.querySelectorAll<HTMLButtonElement>('[data-clear-cart]').forEach((button) => { button.disabled = count === 0; });
    list.replaceChildren();
    empty.hidden = state.lines.length > 0;
    list.hidden = state.lines.length === 0;

    state.lines.forEach((line) => {
      const promotion = promotionMap.get(line.promotionId);
      if (!promotion) return;
      const unitTotal = lineUnitTotal(line, promotion);
      const item = document.createElement('li');
      item.className = `cart-line${line.key === enteringKey ? ' is-entering' : ''}`;
      item.dataset.lineKey = line.key;
      const toppingsMarkup = line.toppings.length
        ? `<ul>${line.toppings.map((topping) => `<li>${promotion.pizzas > 1 ? `מגש ${topping.pizzaIndex} · ` : ''}${topping.name} · ${placementLabels[topping.placement]}</li>`).join('')}</ul>`
        : '<small>ללא תוספות</small>';
      item.innerHTML = `
        <div class="cart-line-copy">
          <strong>${promotion.name}</strong>
          <span>${promotion.size} · ${unitTotal} ₪ ליחידה</span>
          ${toppingsMarkup}
        </div>
        <div class="quantity-control" aria-label="כמות עבור ${promotion.name}">
          <button type="button" data-cart-action="decrease" data-key="${line.key}" aria-label="הפחתת ${promotion.name}">−</button>
          <b aria-live="off">${line.quantity}</b>
          <button type="button" data-cart-action="increase" data-key="${line.key}" aria-label="הוספת ${promotion.name}">+</button>
        </div>
        <strong class="line-total">${unitTotal * line.quantity} ₪</strong>
        <button class="remove-line" type="button" data-cart-action="remove" data-key="${line.key}" aria-label="הסרת ${promotion.name}">הסרה</button>`;
      list.append(item);
    });
    addressWrap.hidden = state.fulfillment !== 'delivery';
    const selectedFulfillment = document.querySelector<HTMLInputElement>(`input[name="fulfillment"][value="${state.fulfillment}"]`);
    if (selectedFulfillment) selectedFulfillment.checked = true;
    address.value = state.address;
    persist();
  };

  const openCart = (trigger?: HTMLElement) => {
    if (trigger) lastTrigger = trigger;
    if (!cartDialog.open) cartDialog.showModal();
    document.body.classList.add('cart-open');
    track('cart_opened');
    cartDialog.querySelector<HTMLElement>('[data-cart-close]')?.focus();
  };

  const closeCart = () => {
    cartDialog.close();
    document.body.classList.remove('cart-open');
    lastTrigger?.focus();
  };

  const customizerTotal = () => {
    if (!activePromotion) return 0;
    return activePromotion.price + [...selectedToppings.keys()].reduce((sum, selectionKey) => {
      const id = selectionKey.split(':').slice(1).join(':');
      const topping = toppingMap.get(id);
      return sum + (topping?.prices[activePromotion!.size] || 0);
    }, 0);
  };

  const selectionKey = (toppingId: string, pizzaIndex = activePizzaIndex) => `${pizzaIndex}:${toppingId}`;

  const updateCustomizer = () => {
    if (!activePromotion) return;
    const total = customizerDialog.querySelector<HTMLElement>('[data-customizer-total]');
    if (total) total.textContent = `${customizerTotal()} ₪`;
    toppings.forEach((topping) => {
      const checkbox = customizerDialog.querySelector<HTMLInputElement>(`[data-topping-check][value="${topping.id}"]`);
      const picker = customizerDialog.querySelector<HTMLElement>(`[data-placement-picker="${topping.id}"]`);
      const key = selectionKey(topping.id);
      const price = topping.prices[activePromotion!.size];
      const priceNode = customizerDialog.querySelector<HTMLElement>(`[data-topping-price="${topping.id}"]`);
      if (priceNode) priceNode.textContent = `+${price} ₪`;
      if (checkbox) checkbox.checked = selectedToppings.has(key);
      if (picker) picker.hidden = !selectedToppings.has(key);
      picker?.querySelectorAll<HTMLButtonElement>('[data-placement]').forEach((button) => {
        button.setAttribute('aria-pressed', String((selectedToppings.get(key) || 'whole') === button.dataset.placement));
      });
    });
    customizerDialog.querySelectorAll<HTMLButtonElement>('[data-pizza-index]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.pizzaIndex) === activePizzaIndex));
    });
    customizerDialog.querySelectorAll<HTMLElement>('[data-pizza-summary]').forEach((summary) => {
      const pizzaIndex = Number(summary.dataset.pizzaSummary);
      const count = [...selectedToppings.keys()].filter((key) => key.startsWith(`${pizzaIndex}:`)).length;
      summary.textContent =
        count === 0 ? 'ללא תוספות' : count === 1 ? 'תוספת אחת' : `${count} תוספות`;
    });
  };

  const openCustomizer = (promotion: Promotion, trigger: HTMLElement) => {
    activePromotion = promotion;
    activePizzaIndex = 1;
    lastTrigger = trigger;
    selectedToppings = new Map();
    const title = customizerDialog.querySelector<HTMLElement>('[data-customizer-title]');
    const product = customizerDialog.querySelector<HTMLElement>('[data-customizer-product]');
    const pizzaSelector = customizerDialog.querySelector<HTMLElement>('[data-pizza-selector]');
    if (title) title.textContent = promotion.name;
    if (product) product.textContent = promotion.product;
    if (pizzaSelector) pizzaSelector.hidden = promotion.pizzas < 2;
    customizerDialog.querySelectorAll<HTMLElement>('[data-price-label]').forEach((label) => {
      const first = toppings.find((topping) => topping.kind === label.dataset.priceLabel);
      const price = first?.prices[promotion.size] || 0;
      label.textContent = promotion.pizzas > 1 ? `· ${price} ₪ למגש` : `· ${price} ₪`;
    });
    updateCustomizer();
    customizerDialog.showModal();
    customizerDialog.querySelector<HTMLElement>('[data-customizer-close]')?.focus();
  };

  const closeCustomizer = () => {
    customizerDialog.close();
    lastTrigger?.focus();
  };

  document.querySelectorAll<HTMLElement>('[data-open-cart]').forEach((button) => {
    button.addEventListener('click', () => openCart(button));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-add-promotion]').forEach((button) => {
    button.addEventListener('click', () => {
      const promotion = promotionMap.get(button.dataset.addPromotion || '');
      if (promotion) openCustomizer(promotion, button);
    });
  });

  customizerDialog.querySelectorAll<HTMLInputElement>('[data-topping-check]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const key = selectionKey(checkbox.value);
      if (checkbox.checked) selectedToppings.set(key, 'whole');
      else selectedToppings.delete(key);
      updateCustomizer();
    });
  });

  customizerDialog.addEventListener('click', (event) => {
    const placementButton = (event.target as Element).closest<HTMLButtonElement>('[data-placement]');
    if (placementButton) {
      const option = placementButton.closest<HTMLElement>('[data-topping-option]');
      const id = option?.dataset.toppingOption;
      const placement = placementButton.dataset.placement as ToppingPlacement;
      const key = id ? selectionKey(id) : '';
      if (id && selectedToppings.has(key)) {
        selectedToppings.set(key, placement);
        updateCustomizer();
      }
      return;
    }
    const pizzaButton = (event.target as Element).closest<HTMLButtonElement>('[data-pizza-index]');
    if (pizzaButton) {
      activePizzaIndex = Number(pizzaButton.dataset.pizzaIndex) || 1;
      customizerDialog.querySelector<HTMLElement>('.toppings-groups')?.classList.remove('is-switching');
      requestAnimationFrame(() => customizerDialog.querySelector<HTMLElement>('.toppings-groups')?.classList.add('is-switching'));
      updateCustomizer();
      return;
    }
    if (event.target === customizerDialog) closeCustomizer();
  });

  customizerDialog.querySelector('[data-customizer-close]')?.addEventListener('click', closeCustomizer);
  customizerDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeCustomizer();
  });

  customizerDialog.querySelector<HTMLButtonElement>('[data-confirm-customization]')?.addEventListener('click', (event) => {
    if (!activePromotion) return;
    const configuredToppings = [...selectedToppings.entries()].map(([selection, placement]) => {
      const [pizzaIndexText, ...idParts] = selection.split(':');
      const id = idParts.join(':');
      const topping = toppingMap.get(id)!;
      return { id, name: topping.name, pizzaIndex: Number(pizzaIndexText), placement, unitPrice: topping.prices[activePromotion!.size] };
    }).sort((a, b) => a.pizzaIndex - b.pizzaIndex || a.id.localeCompare(b.id));
    const signature = configuredToppings.map((topping) => `${topping.pizzaIndex}:${topping.id}:${topping.placement}`).join('|');
    const key = `${activePromotion.id}::${signature}`;
    const existing = state.lines.find((line) => line.key === key);
    if (existing) existing.quantity += 1;
    else state.lines.push({ key, promotionId: activePromotion.id, quantity: 1, toppings: configuredToppings });
    render(key);
    animateCartTransfer(event.currentTarget as HTMLElement);
    bumpCart();
    announce(`${activePromotion.name} נוסף לעגלה`);
    track('promotion_added', { item_id: activePromotion.id, value: customizerTotal() });
    closeCustomizer();
  });

  const removeLine = (line: CartLine, action: string, element: HTMLElement) => {
    if (action === 'increase') {
      line.quantity += 1;
      render(line.key);
      bumpCart();
      announce('הכמות עודכנה');
      return;
    }
    if (action === 'decrease' && line.quantity > 1) {
      line.quantity -= 1;
      element.closest('.cart-line')?.classList.add('is-changing');
      window.setTimeout(() => render(), 150);
      announce('הכמות עודכנה');
      return;
    }
    element.closest('.cart-line')?.classList.add('is-removing');
    window.setTimeout(() => {
      state.lines = state.lines.filter((item) => item.key !== line.key);
      render();
      bumpCart();
    }, 220);
    announce('הפריט הוסר מהעגלה');
    track('promotion_removed', { item_id: line.promotionId });
  };

  list.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-cart-action]');
    const line = state.lines.find((item) => item.key === button?.dataset.key);
    if (button && line) removeLine(line, button.dataset.cartAction || '', button);
  });

  cartDialog.querySelector('[data-cart-close]')?.addEventListener('click', closeCart);
  cartDialog.addEventListener('click', (event) => {
    if (event.target === cartDialog) closeCart();
  });
  cartDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeCart();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-clear-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!state.lines.length) return;
      list.classList.add('is-clearing');
      window.setTimeout(() => {
        state.lines = [];
        list.classList.remove('is-clearing');
        render();
        bumpCart();
      }, 240);
      announce('כל העגלה נמחקה');
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[name="fulfillment"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.fulfillment = radio.value === 'delivery' ? 'delivery' : 'pickup';
      if (addressError) addressError.hidden = true;
      render();
      announce(state.fulfillment === 'delivery' ? 'נוסף משלוח ב־25 שקלים' : 'נבחר איסוף עצמי');
    });
  });

  address.addEventListener('input', () => {
    state.address = address.value;
    if (addressError) addressError.hidden = true;
    persist();
  });

  cartDialog.querySelector('[data-checkout]')?.addEventListener('click', () => {
    const { count, total } = stateSummary(promotions, state);
    if (!count) {
      announce('העגלה עדיין ריקה');
      empty.focus();
      return;
    }
    if (state.fulfillment === 'delivery' && !state.address.trim()) {
      if (addressError) addressError.hidden = false;
      address.focus();
      announce('נא להזין כתובת למשלוח');
      return;
    }
    track('checkout_initiated', { value: total, items: count, fulfillment: state.fulfillment });
    const checkout = buildWhatsAppCheckoutUrl(promotions, state, notes.value);
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
