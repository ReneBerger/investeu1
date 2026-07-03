import { transformProperty } from './src/contentTransforms.js';
import { loadOpenImmoProperties } from './src/openimmo.js';

const mobileMenu = document.querySelector('#mobileMenu');
const menuToggle = document.querySelector('.menu-toggle');
const filterLocation = document.querySelector('#filterLocation');
const filterCategory = document.querySelector('#filterCategory');
const filterCountry = document.querySelector('#filterCountry');
const filterPrice = document.querySelector('#filterPrice');
const searchForm = document.querySelector('#searchForm');
const resultCount = document.querySelector('#resultCount');
const clearFilters = document.querySelector('#clearFilters');
const propertyCards = document.querySelector('#propertyCards');
const propertyDetail = document.querySelector('#propertyDetail');
const dataStatus = document.querySelector('#dataStatus');

let properties = [];

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'de'));
}

function setOptions(selectElement, values, defaultLabel) {
  selectElement.innerHTML = [`<option value="">${defaultLabel}</option>`, ...values.map((value) => `<option value="${value}">${value}</option>`)].join('');
}

function updateFilterOptions(items) {
  setOptions(filterLocation, uniqueValues(items, 'location'), 'Alle Regionen');
  setOptions(filterCategory, uniqueValues(items, 'category'), 'Alle Kategorien');
  setOptions(filterCountry, uniqueValues(items, 'country'), 'Alle Länder');
}

function renderProperties(items) {
  propertyCards.innerHTML = items.map((property) => {
    return `
      <article class="property-card">
        <div class="property-image" style="background-image: url('${property.image}')"></div>
        <div class="property-content">
          <p class="property-tag">${property.tag}</p>
          <h3>${property.title}</h3>
          <p>${property.description}</p>
        </div>
        <div class="property-card-footer card-footer">
          <span class="price">${property.priceLabel}</span>
          <button class="btn btn-secondary" data-id="${property.id}">Details</button>
        </div>
      </article>
    `;
  }).join('');

  const buttons = document.querySelectorAll('.property-card-footer button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const property = properties.find((item) => String(item.id) === button.dataset.id);
      if (property) renderPropertyDetail(property);
    });
  });
}

function renderPropertyDetail(property) {
  propertyDetail.innerHTML = `
    <h3>${property.title}</h3>
    <div class="detail-grid">
      <div class="detail-meta">
        <span><strong>Objektnummer:</strong> ${property.openImmo.objektNr}</span>
        <span><strong>Ort:</strong> ${property.openImmo.geo.plz} ${property.openImmo.geo.ort}, ${property.openImmo.geo.land}</span>
        <span><strong>Kategorie:</strong> ${property.category}</span>
        <span><strong>Preis:</strong> ${property.priceLabel}</span>
        <span><strong>OpenImmo Objektart:</strong> ${property.openImmo.objektart}</span>
        <span><strong>Vermarktung:</strong> ${property.openImmo.vermarktungsart}</span>
        <span><strong>Merkmale:</strong> ${property.details.join(', ')}</span>
      </div>
      <img src="${property.image}" alt="${property.title}" />
    </div>
    <p style="margin-top: 1.5rem; color: var(--muted);">${property.description}</p>
  `;
  propertyDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyFilters(event) {
  if (event) event.preventDefault();

  const locationValue = filterLocation.value;
  const categoryValue = filterCategory.value;
  const countryValue = filterCountry.value;
  const priceValue = filterPrice.value;

  const filtered = properties.filter((property) => {
    const locationMatch = locationValue ? property.location === locationValue : true;
    const categoryMatch = categoryValue ? property.category === categoryValue : true;
    const countryMatch = countryValue ? property.country === countryValue : true;
    const priceMatch = priceValue ? (() => {
      const [min, max] = priceValue.split('-').map(Number);
      return property.price >= min && property.price <= max;
    })() : true;
    return locationMatch && categoryMatch && countryMatch && priceMatch;
  });

  resultCount.textContent = `${filtered.length} Angebot${filtered.length === 1 ? '' : 'e'} verfügbar`;
  renderProperties(filtered);

  if (!filtered.length) {
    propertyDetail.innerHTML = '<h3>Keine Angebote gefunden</h3><p>Bitte passen Sie die Suchfilter an, um passende Immobilien zu sehen.</p>';
  }
}

function resetFilters() {
  filterLocation.value = '';
  filterCategory.value = '';
  filterCountry.value = '';
  filterPrice.value = '';
  applyFilters();
}

function attachScrollBehavior() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      link.addEventListener('click', (event) => {
        if (href !== '#') {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          mobileMenu.classList.remove('open');
        }
      });
    }
  });
}

async function initializeProperties() {
  dataStatus.textContent = 'OpenImmo-Daten werden geladen …';
  const loadedProperties = await loadOpenImmoProperties();
  properties = loadedProperties.map((property) => transformProperty(property));
  updateFilterOptions(properties);
  dataStatus.textContent = `${properties.length} Objekte aus der aktuellen OpenImmo-Datei geladen.`;
  applyFilters();
}

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

searchForm.addEventListener('submit', applyFilters);
clearFilters.addEventListener('click', resetFilters);
attachScrollBehavior();
initializeProperties().catch((error) => {
  dataStatus.textContent = error.message;
  resultCount.textContent = '0 Angebote verfügbar';
  propertyDetail.innerHTML = '<h3>Datenquelle nicht verfügbar</h3><p>Bitte prüfen Sie die OpenImmo-XML-Datei unter <code>data/openimmo.xml</code>.</p>';
});
