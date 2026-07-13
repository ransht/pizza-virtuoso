export const BUSINESS_CONFIG = {
  nameHe: "פיצה וירטואוז",
  nameEn: "Pizza Virtuoso",
  mainPhoneDisplay: "03-9504888",
  mainPhoneLink: "tel:039504888",
  ownerPhoneDisplay: "054-2537257",
  ownerPhoneLink: "tel:0542537257",
  whatsappNumber: "972542537257",
  whatsappMessage: "שלום, הגעתי דרך האתר של פיצה וירטואוז ורציתי לבצע הזמנה",
  // Re-enable only when the restaurant wants to show online ordering again.
  externalOrderUrl: "",
  address: "ז׳בוטינסקי 16, מול היכל התרבות, ראשון לציון",
  kosherText: "כשר רבנות ראשון לציון"
};

export const WHATSAPP_URL =
  `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}` +
  `?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessage)}`;
