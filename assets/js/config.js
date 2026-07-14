export const BUSINESS_CONFIG = {
  nameHe: "פיצה וירטואוז",
  nameEn: "Pizza Virtuoso",
  mainPhoneDisplay: "03-9504888",
  mainPhoneLink: "tel:039504888",
  whatsappNumber: "972542537257",
  whatsappMessage: "שלום, הגעתי דרך האתר של פיצה וירטואוז ורציתי לבצע הזמנה",
  externalOrderUrl: "",
  address: "ז׳בוטינסקי 16, מול היכל התרבות, ראשון לציון",
  kosherText: "כשר רבנות ראשון לציון",
  openingHoursVerified: false,
  openingHours: [],
  deliveryAreasVerified: false,
  deliveryAreas: [],
  googleRatingVerified: false,
  googleRating: null,
  googleReviewCount: null,
  googleReviewsUrl: "",
  // Set to the GA4 measurement ID, for example "G-XXXXXXXXXX", to enable Google Analytics.
  googleAnalyticsMeasurementId: ""
};

export const WHATSAPP_URL =
  `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}` +
  `?text=${encodeURIComponent(BUSINESS_CONFIG.whatsappMessage)}`;
