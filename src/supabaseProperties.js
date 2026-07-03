const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80';
const DEFAULT_TABLE = 'properties';

function getSupabaseConfig() {
  const config = window.INVESTEU_CONFIG?.supabase || {};
  return {
    url: config.url || '',
    anonKey: config.anonKey || '',
    table: config.table || DEFAULT_TABLE
  };
}

function requireSupabaseConfig(config) {
  if (!config.url || !config.anonKey) {
    throw new Error('Supabase ist noch nicht konfiguriert. Bitte config.js mit URL und Anon Key bereitstellen.');
  }
}

function formatPrice(value, currency = 'EUR') {
  const price = Number(value || 0);
  if (!price) return 'Preis auf Anfrage';

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(price);
}

function localizedValue(record, baseName, language) {
  const suffix = language.toLowerCase();
  return firstValue(record[`${baseName}_${suffix}`], record[`${baseName}${language}`], record[baseName]);
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || '';
}

function normalizeDetails(record) {
  const details = [];
  const rooms = firstValue(record.rooms, record.anzahl_zimmer, record.openimmo?.flaechen?.anzahlZimmer);
  const livingArea = firstValue(record.living_area, record.wohnflaeche, record.openimmo?.flaechen?.wohnflaeche);
  const totalArea = firstValue(record.total_area, record.gesamtflaeche, record.openimmo?.flaechen?.gesamtflaeche);

  if (rooms) details.push(`${rooms} Zimmer`);
  if (livingArea) details.push(`${livingArea} m² Wohnfläche`);
  if (!livingArea && totalArea) details.push(`${totalArea} m² Fläche`);
  if (record.has_pool) details.push('Pool');
  if (record.has_parking) details.push('Stellplatz');
  if (record.has_terrace || record.has_balcony) details.push('Balkon/Terrasse');

  return details.length ? details : ['Details im Exposé'];
}

function normalizeImage(record) {
  if (record.image_url) return record.image_url;
  if (Array.isArray(record.images) && record.images.length) return record.images[0].url || record.images[0];
  if (Array.isArray(record.media) && record.media.length) return record.media[0].url || record.media[0];
  return FALLBACK_IMAGE;
}

export function normalizeSupabaseProperty(record, table = DEFAULT_TABLE, language = 'DE') {
  const price = Number(firstValue(record.price, record.kaufpreis, record.rent, record.miete, record.openimmo?.preise?.kaufpreis, record.openimmo?.preise?.miete) || 0);
  const marketingType = String(firstValue(record.marketing_type, record.vermarktungsart, record.openimmo?.vermarktungsart, price ? 'KAUF' : 'MIETE')).toUpperCase();
  const postalCode = firstValue(record.postal_code, record.plz, record.openimmo?.geo?.plz);
  const city = firstValue(record.city, record.ort, record.openimmo?.geo?.ort, 'Standort auf Anfrage');
  const country = firstValue(record.country, record.land, record.openimmo?.geo?.land, 'Österreich');
  const objectType = firstValue(record.object_type, record.objektart, record.openimmo?.objektart, 'IMMOBILIE');

  return {
    id: String(firstValue(record.id, record.object_number, record.objekt_nr_extern)),
    title: firstValue(localizedValue(record, 'title', language), localizedValue(record, 'objekttitel', language), localizedValue(record, 'name', language), 'Immobilie'),
    location: city,
    category: firstValue(localizedValue(record, 'category', language), localizedValue(record, 'kategorie', language), objectType),
    country,
    price,
    priceLabel: formatPrice(price, firstValue(record.currency, record.waehrung, 'EUR')),
    tag: marketingType === 'KAUF' ? 'Zu verkaufen' : 'Zur Miete',
    description: firstValue(localizedValue(record, 'description', language), localizedValue(record, 'objektbeschreibung', language), localizedValue(record, 'short_description', language), 'Weitere Informationen erhalten Sie auf Anfrage.'),
    image: normalizeImage(record),
    details: normalizeDetails(record),
    source: {
      system: 'Supabase',
      table,
      updatedAt: record.updated_at || record.modified_at || '',
      objectNumber: firstValue(record.object_number, record.objekt_nr_extern, record.id),
      objectType,
      marketingType,
      geo: { postalCode, city, country }
    }
  };
}

export async function loadSupabaseProperties(language = 'DE') {
  const config = getSupabaseConfig();
  requireSupabaseConfig(config);

  const endpoint = `${config.url.replace(/\/$/, '')}/rest/v1/${config.table}?select=*&is_published=eq.true&order=updated_at.desc`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Supabase-Daten konnten nicht geladen werden (${response.status}).`);
  }

  const records = await response.json();
  return records.map((record) => normalizeSupabaseProperty(record, config.table, language));
}
