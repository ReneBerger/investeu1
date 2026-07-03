const OPENIMMO_SOURCE_URL = 'data/openimmo.xml';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80';

function text(node, selector) {
  return node.querySelector(selector)?.textContent?.trim() || '';
}

function attr(node, selector, attribute) {
  return node.querySelector(selector)?.getAttribute(attribute)?.trim() || '';
}

function activeOpenImmoAttribute(node, selector, attributeNames) {
  const element = node.querySelector(selector);
  if (!element) return '';

  return attributeNames.find((attributeName) => {
    return element.getAttribute(attributeName)?.toLowerCase() === 'true';
  }) || '';
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = Number(String(value || '').replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function formatPrice(value) {
  if (!value) return 'Preis auf Anfrage';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
}

function categoryFromOpenImmo(propertyNode) {
  const objectTypeNode = propertyNode.querySelector('objektart > *');
  const objectType = objectTypeNode?.tagName || 'IMMOBILIE';
  const usage = activeOpenImmoAttribute(propertyNode, 'nutzungsart', ['WOHNEN', 'GEWERBE', 'ANLAGE', 'WAZ']);

  if (usage === 'GEWERBE') return 'Geschäftsräume';
  if (objectType.toUpperCase().includes('HAUS')) return 'Haus mit Pool';
  if (objectType.toUpperCase().includes('WOHNUNG')) return 'Neubau';
  return 'Luxusimmobilie';
}

function imageFromOpenImmo(propertyNode) {
  const path = text(propertyNode, 'anhaenge anhang daten pfad') || text(propertyNode, 'anhaenge anhang pfad');
  return path || FALLBACK_IMAGE;
}

function detailsFromOpenImmo(propertyNode) {
  const rooms = firstNumber(text(propertyNode, 'flaechen anzahl_zimmer'));
  const livingArea = firstNumber(text(propertyNode, 'flaechen wohnflaeche'));
  const totalArea = firstNumber(text(propertyNode, 'flaechen gesamtflaeche'), text(propertyNode, 'flaechen grundstuecksflaeche'));
  const detailItems = [];

  if (rooms) detailItems.push(`${rooms} Zimmer`);
  if (livingArea) detailItems.push(`${livingArea} m² Wohnfläche`);
  if (!livingArea && totalArea) detailItems.push(`${totalArea} m² Fläche`);
  if (propertyNode.querySelector('ausstattung swimmingpool')) detailItems.push('Pool');
  if (propertyNode.querySelector('ausstattung balkon_terrasse')) detailItems.push('Balkon/Terrasse');
  if (propertyNode.querySelector('ausstattung stellplatzart')) detailItems.push('Stellplatz');

  return detailItems.length ? detailItems : ['Details im Exposé'];
}

function idFromOpenImmo(propertyNode, index) {
  return text(propertyNode, 'verwaltung_techn objekt_nr_extern') || text(propertyNode, 'verwaltung_techn objekt_nr_intern') || `openimmo-${index + 1}`;
}

export function parseOpenImmo(xmlText) {
  const document = new DOMParser().parseFromString(xmlText, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error('OpenImmo XML konnte nicht gelesen werden.');
  }

  return [...document.querySelectorAll('anbieter > immobilie, openimmo > immobilie, immobilie')].map((propertyNode, index) => {
    const purchasePrice = firstNumber(text(propertyNode, 'preise kaufpreis'));
    const rent = firstNumber(text(propertyNode, 'preise kaltmiete'), text(propertyNode, 'preise warmmiete'));
    const price = purchasePrice || rent;
    const marketingType = activeOpenImmoAttribute(propertyNode, 'vermarktungsart', ['KAUF', 'MIETE_PACHT']) || (purchasePrice ? 'KAUF' : 'MIETE');
    const city = text(propertyNode, 'geo ort');
    const country = text(propertyNode, 'geo land') || attr(propertyNode, 'geo land', 'iso_land') || 'Österreich';
    const objectTypeNode = propertyNode.querySelector('objektart > *');

    return {
      id: idFromOpenImmo(propertyNode, index),
      title: text(propertyNode, 'freitexte objekttitel') || text(propertyNode, 'verwaltung_techn objekt_nr_extern') || 'Immobilie',
      location: city || 'Standort auf Anfrage',
      category: categoryFromOpenImmo(propertyNode),
      country,
      price,
      priceLabel: formatPrice(price),
      tag: marketingType === 'KAUF' ? 'Zu verkaufen' : 'Zur Miete',
      description: text(propertyNode, 'freitexte objektbeschreibung') || text(propertyNode, 'freitexte lage') || 'Weitere Informationen erhalten Sie auf Anfrage.',
      image: imageFromOpenImmo(propertyNode),
      details: detailsFromOpenImmo(propertyNode),
      openImmo: {
        objektNr: idFromOpenImmo(propertyNode, index),
        objektart: objectTypeNode?.tagName?.toUpperCase() || 'IMMOBILIE',
        vermarktungsart: marketingType,
        geo: {
          plz: text(propertyNode, 'geo plz'),
          ort: city,
          land: country
        },
        preise: { kaufpreis: purchasePrice, miete: rent, waehrung: 'EUR' },
        flaechen: {
          wohnflaeche: firstNumber(text(propertyNode, 'flaechen wohnflaeche')),
          gesamtflaeche: firstNumber(text(propertyNode, 'flaechen gesamtflaeche')),
          anzahlZimmer: firstNumber(text(propertyNode, 'flaechen anzahl_zimmer'))
        }
      }
    };
  });
}

export async function loadOpenImmoProperties(sourceUrl = OPENIMMO_SOURCE_URL) {
  const response = await fetch(sourceUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`OpenImmo XML konnte nicht geladen werden (${response.status}).`);
  }
  const xmlText = await response.text();
  return parseOpenImmo(xmlText);
}
