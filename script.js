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

const properties = [
  {
    id: 1,
    title: 'Exklusive Altbauwohnung',
    location: 'Wien',
    category: 'Neubau',
    country: 'Österreich',
    price: 4200000,
    priceLabel: '4,2 Mio.',
    tag: 'Zur Miete',
    description: 'Luxuswohnung in einer Toplage mit hochwertiger Ausstattung, großzügigen Räumen und Blick über die Stadt.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    details: ['4 Zimmer', '180 m²', 'Tiefgarage', 'Aufzug']
  },
  {
    id: 2,
    title: 'Villa mit Pool',
    location: 'Salzburg',
    category: 'Haus mit Pool',
    country: 'Österreich',
    price: 7200000,
    priceLabel: '7,2 Mio.',
    tag: 'Zu verkaufen',
    description: 'Elegante Villa mit privatem Pool, mediterranem Garten und Panoramablick.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    details: ['5 Zimmer', '320 m²', 'Pool', 'Terrasse']
  },
  {
    id: 3,
    title: 'Adriavilla in Poreč',
    location: 'Poreč',
    category: 'Luxusimmobilie',
    country: 'Kroatien',
    price: 10800000,
    priceLabel: '10,8 Mio.',
    tag: 'Direkt am Meer',
    description: 'Direkt am Wasser gelegene Luxusvilla mit modernster Technik und privatem Bootsanleger.',
    image: 'https://images.unsplash.com/photo-1531764242653-0b05b8d8acdd?auto=format&fit=crop&w=900&q=80',
    details: ['6 Zimmer', '410 m²', 'Bootsanleger', 'Meerblick']
  },
  {
    id: 4,
    title: 'Premium Apartment',
    location: 'Graz',
    category: 'Neubau',
    country: 'Österreich',
    price: 2500000,
    priceLabel: '2,5 Mio.',
    tag: 'Neubau',
    description: 'Modernes Neubauapartment mit hochwertiger Ausstattung und bester Infrastruktur.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    details: ['3 Zimmer', '130 m²', 'Balkon', 'Fußbodenheizung']
  },
  {
    id: 5,
    title: 'Business Bürofläche',
    location: 'Linz',
    category: 'Geschäftsräume',
    country: 'Österreich',
    price: 1800000,
    priceLabel: '1,8 Mio.',
    tag: 'Investition',
    description: 'Hochwertige Geschäftsfläche in zentraler Lage mit großer Schaufensterfront.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    details: ['220 m²', 'Lager', 'Parkplätze', 'Sicherheitssystem']
  },
  {
    id: 6,
    title: 'Meerblick Residenz',
    location: 'Split',
    category: 'Luxusimmobilie',
    country: 'Kroatien',
    price: 14500000,
    priceLabel: '14,5 Mio.',
    tag: 'Bestlage',
    description: 'Ultimative Luxusresidenz auf der kroatischen Küste mit Pool und privatem Garten.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    details: ['7 Zimmer', '520 m²', 'Infinity Pool', 'Spa Bereich']
  },
  {
    id: 7,
    title: 'Penthouse City',
    location: 'Wien',
    category: 'Luxusimmobilie',
    country: 'Österreich',
    price: 8200000,
    priceLabel: '8,2 Mio.',
    tag: 'Panorama',
    description: 'Penthouse mit Dachterrasse, privatem Lift und einzigartigem Blick über die Stadt.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    details: ['5 Zimmer', '260 m²', 'Dachterrasse', 'Smart Home']
  },
  {
    id: 8,
    title: 'Bürokomplex',
    location: 'Salzburg',
    category: 'Geschäftsräume',
    country: 'Österreich',
    price: 5300000,
    priceLabel: '5,3 Mio.',
    tag: 'Premium',
    description: 'Investitionsprojekt mit modernen Büroflächen und flexiblem Raumkonzept.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    details: ['400 m²', 'Konferenzräume', 'Café Bereich', 'Parkplätze']
  }
];

function formatCurrency(value) {
  return `${value.toLocaleString('de-DE')} €`;
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
      const propertyId = Number(button.dataset.id);
      const property = properties.find((item) => item.id === propertyId);
      if (property) {
        renderPropertyDetail(property);
      }
    });
  });
}

function renderPropertyDetail(property) {
  propertyDetail.innerHTML = `
    <h3>${property.title}</h3>
    <div class="detail-grid">
      <div class="detail-meta">
        <span><strong>Ort:</strong> ${property.location}, ${property.country}</span>
        <span><strong>Kategorie:</strong> ${property.category}</span>
        <span><strong>Preis:</strong> ${property.priceLabel}</span>
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
  renderProperties(filtered.length ? filtered : []);

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

searchForm.addEventListener('submit', applyFilters);
clearFilters.addEventListener('click', resetFilters);

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

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

attachScrollBehavior();
applyFilters();
