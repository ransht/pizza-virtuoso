export type Promotion = {
  id: string;
  name: string;
  product: string;
  size: 'MEDIUM' | 'LARGE';
  price: number;
  regularPrice: number;
  copy: string[];
  popular?: boolean;
};

export const lovePromotions: Promotion[] = [
  {
    id: 'small-start',
    name: 'התחלה קטנה',
    product: 'פיצה מרגריטה MEDIUM בצורת לב',
    size: 'MEDIUM',
    regularPrice: 35,
    price: 29,
    copy: ['יש דייטים שמתחילים בקטן', 'את ההמשך נשאיר לכם'],
  },
  {
    id: 'big-heart',
    name: 'הלב הגדול',
    product: 'פיצה מרגריטה LARGE בצורת לב',
    size: 'LARGE',
    regularPrice: 49,
    price: 39,
    copy: ['גדול יותר', 'חם יותר', 'והשאר כבר ביניכם'],
    popular: true,
  },
  {
    id: 'double-love',
    name: 'אהבה כפולה',
    product: 'שתי פיצות מרגריטה LARGE בצורת לב + שתי פחיות שתייה',
    size: 'LARGE',
    regularPrice: 118,
    price: 89,
    copy: ['שני לבבות', 'כי על המשולש האחרון לא בונים זוגיות'],
  },
];
