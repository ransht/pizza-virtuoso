interface Env { GOOGLE_PLACES_API_KEY?: string; GOOGLE_PLACE_ID?: string; }
interface Context { request: Request; env: Env; }

const DETAILS_FIELDS = 'id,displayName,rating,userRatingCount,reviews,googleMapsUri';
const SEARCH_FIELDS = DETAILS_FIELDS.split(',').map((field) => `places.${field}`).join(',');
const BUSINESS_QUERY = "פיצה וירטואוז, ז'בוטינסקי 16, ראשון לציון";
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
});

export const onRequestGet = async ({ request, env }: Context) => {
  if (!env.GOOGLE_PLACES_API_KEY) return json({ error: 'Google reviews are not configured.' }, 503);
  const languageCode = new URL(request.url).searchParams.get('lang') === 'en' ? 'en' : 'he';
  const headers = { 'Content-Type': 'application/json', 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY };
  let response: Response;
  if (env.GOOGLE_PLACE_ID) {
    const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}`);
    url.searchParams.set('languageCode', languageCode); url.searchParams.set('regionCode', 'IL');
    response = await fetch(url, { headers: { ...headers, 'X-Goog-FieldMask': DETAILS_FIELDS } });
  } else {
    response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', headers: { ...headers, 'X-Goog-FieldMask': SEARCH_FIELDS },
      body: JSON.stringify({ textQuery: BUSINESS_QUERY, languageCode, regionCode: 'IL', pageSize: 1 }),
    });
  }
  if (!response.ok) {
    console.error('Google Places request failed', response.status, await response.text());
    return json({ error: 'Reviews are temporarily unavailable.' }, 502);
  }
  const payload = await response.json() as Record<string, unknown> & { places?: unknown[] };
  const place = env.GOOGLE_PLACE_ID ? payload : payload.places?.[0];
  return place ? json(place) : json({ error: 'Business profile was not found.' }, 404);
};
