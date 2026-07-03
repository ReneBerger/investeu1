import { transformProperty } from './src/contentTransforms.js';
import { detailUrl, getCurrentLanguage } from './src/routing.js';
import { loadSupabaseProperties } from './src/supabaseProperties.js';

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
const dataStatus = document.querySelector('#dataStatus');

let properties = [];
const currentLanguage = getCurrentLanguage();

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
      <a class="property-list-row" href="${detailUrl(property.id, currentLanguage)}">
        <div class="property-list-image" style="background-image: url('${property.image}')"></div>
        <div class="property-list-main">
          <p class="property-tag">${property.tag}</p>
          <h3>${property.title}</h3>
          <p>${property.location}, ${property.country}</p>
        </div>
        <div class="property-list-meta">
          <span class="price">${property.priceLabel}</span>
          <span>${property.details.join(' · ')}</span>
        </div>
      </a>
    `;
  }).join('');
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
    propertyCards.innerHTML = '<div class="empty-state"><h3>Keine Angebote gefunden</h3><p>Bitte passen Sie die Suchfilter an, um passende Immobilien zu sehen.</p></div>';
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
  dataStatus.textContent = 'Immobiliendaten werden aus Supabase geladen …';
  const loadedProperties = await loadSupabaseProperties(currentLanguage);
  properties = loadedProperties.map((property) => transformProperty(property, currentLanguage));
  updateFilterOptions(properties);
  dataStatus.textContent = `${properties.length} Objekte aus Supabase geladen.`;
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
  propertyCards.innerHTML = '<div class="empty-state"><h3>Datenquelle nicht verfügbar</h3><p>Bitte prüfen Sie die Supabase-Konfiguration in <code>config.js</code>.</p></div>';
});
