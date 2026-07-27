import menu from '../menu/menu.json';

export type ToppingPlacement = 'whole' | 'right' | 'left';
export type CampaignTopping = {
  id: string;
  name: string;
  kind: 'regular' | 'special';
  prices: { MEDIUM: number; LARGE: number };
};

const pizzaCategory = menu.categories.find((category) => category.id === 'pizzas');
const regularSource = pizzaCategory?.items.find((item) => item.id === 'regularTopping');
const specialSource = pizzaCategory?.items.find((item) => item.id === 'specialTopping');

function priceFor(source: typeof regularSource, size: 'M' | 'L') {
  return source?.prices.find((price) => price.label === size)?.price ?? 0;
}

const regularPrices = {
  MEDIUM: priceFor(regularSource, 'M'),
  LARGE: priceFor(regularSource, 'L'),
};
const specialPrices = {
  MEDIUM: priceFor(specialSource, 'M'),
  LARGE: priceFor(specialSource, 'L'),
};

export const campaignToppings: CampaignTopping[] = [
  { id: 'green-olives', name: 'זיתים ירוקים', kind: 'regular', prices: regularPrices },
  { id: 'black-olives', name: 'זיתים שחורים', kind: 'regular', prices: regularPrices },
  { id: 'corn', name: 'תירס', kind: 'regular', prices: regularPrices },
  { id: 'chili', name: 'פלפל חריף', kind: 'regular', prices: regularPrices },
  { id: 'red-onion', name: 'בצל סגול', kind: 'regular', prices: regularPrices },
  { id: 'tomato', name: 'עגבנייה', kind: 'regular', prices: regularPrices },
  { id: 'mushrooms', name: 'פטריות', kind: 'regular', prices: regularPrices },
  { id: 'egg', name: 'ביצה קשה', kind: 'regular', prices: regularPrices },
  { id: 'extra-cheese', name: 'אקסטרה גבינה', kind: 'special', prices: specialPrices },
  { id: 'tuna', name: 'טונה', kind: 'special', prices: specialPrices },
  { id: 'bulgarian-cheese', name: 'גבינה בולגרית', kind: 'special', prices: specialPrices },
];
