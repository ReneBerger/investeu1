import { transformProperty } from './src/contentTransforms.js';
import { getCurrentLanguage, getPropertyIdFromUrl } from './src/routing.js';
import { loadSupabaseProperties } from './src/supabaseProperties.js';

const detailRoot = document.querySelector('#detailRoot');
const detailStatus = document.querySelector('#detailStatus');
const backLink = document.querySelector('#backToList');

function renderDetail(property) {
  document.title = `${property.title} | immo17.at`;
  detailRoot.innerHTML = `
    <article class="detail-page-card">
      <div class="detail-hero-image" style="background-image: url('${property.image}')"></div>
      <div class="detail-page-content">
        <p class="property-tag">${property.tag}</p>
        <h1>${property.title}</h1>
        <p class="detail-lead">${property.description}</p>
        <div class="detail-facts-list">
          <span><strong>Objektnummer:</strong> ${property.source.objectNumber}</span>
          <span><strong>Ort:</strong> ${property.source.geo.postalCode} ${property.source.geo.city}, ${property.source.geo.country}</span>
          <span><strong>Kategorie:</strong> ${property.category}</span>
          <span><strong>Preis:</strong> ${property.priceLabel}</span>
          <span><strong>Objektart:</strong> ${property.source.objectType}</span>
          <span><strong>Vermarktung:</strong> ${property.source.marketingType}</span>
          <span><strong>Merkmale:</strong> ${property.details.join(', ')}</span>
        </div>
      </div>
    </article>
  `;
}

async function initializeDetailPage() {
  const language = getCurrentLanguage();
  const propertyId = getPropertyIdFromUrl();
  backLink.href = `/${language}/`;

  if (!propertyId) {
    detailStatus.textContent = 'Keine Immobilie ausgewählt.';
    return;
  }

  detailStatus.textContent = 'Immobiliendaten werden aus Supabase geladen …';
  const properties = (await loadSupabaseProperties(language)).map((property) => transformProperty(property, language));
  const property = properties.find((item) => String(item.id) === propertyId);

  if (!property) {
    detailStatus.textContent = 'Die ausgewählte Immobilie wurde nicht gefunden oder ist nicht mehr veröffentlicht.';
    return;
  }

  detailStatus.textContent = '';
  renderDetail(property);
}

initializeDetailPage().catch((error) => {
  detailStatus.textContent = error.message;
});
