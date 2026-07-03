# InvestEU Immobilienwebsite

Dynamic static website for a real estate agent. The design can stay close to immo17.at, but the published property data for the website is loaded from Supabase instead of directly from an XML file.

## Zielarchitektur

```text
index.html                    Static page shell, search/list/detail containers
styles.css                    Visual design and responsive layout
config.js                     Runtime Supabase configuration for the browser
script.js                     Startseite: load, filter, render listview
detail.html                   Full detail page shell
detail.js                     Detailview loader and renderer
src/supabaseProperties.js     Supabase REST loading and property normalization
src/routing.js                Language and detail URL helpers
src/contentTransforms.js      Text/content modification and translation hooks
netlify.toml                  Netlify deployment configuration
```

## Datenfluss

1. Property records are stored and maintained in Supabase.
2. The website loads only published rows from the configured Supabase table through the Supabase REST API.
3. The fetch request uses `cache: 'no-store'`, so new and modified rows can become visible without changing application code.
4. Deleted or unpublished rows disappear automatically because the list view is rebuilt from the current Supabase query result on each page load.
5. The start page renders all loaded records as a vertical listview.
6. Clicking a list row opens a full detail page under `/DE/Immobiliendetailseite/?id=<property-id>`. Netlify rewrites this route to `detail.html`.
7. `src/supabaseProperties.js` normalizes Supabase rows into the internal format used by filters, list rows and detail views.
8. `src/contentTransforms.js` applies language-aware text replacements/translations before content is displayed. The exact rules can be extended later when the final modification requirements are known.

## Supabase configuration

The browser reads Supabase settings from `config.js`:

```js
window.INVESTEU_CONFIG = {
  supabase: {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_PUBLIC_ANON_KEY',
    table: 'properties'
  }
};
```

The anon key must be protected by Supabase Row Level Security policies. The table should expose only fields that are safe to publish on the website.

## URL structure and languages

- Start page / listview: `https://investeu.netlify.app/` and `https://investeu.netlify.app/DE/`
- Detailview route: `https://investeu.netlify.app/DE/Immobiliendetailseite/?id=<property-id>`
- The first URL segment is treated as the language code, starting with `DE`.
- Supabase records can provide translated fields with suffixes such as `title_de`, `description_de` or future variants like `title_en`.

## Suggested `properties` table fields

The loader supports flexible field names, but this structure is recommended:

| Field | Purpose |
| --- | --- |
| `id` | Stable row id used by the detail button |
| `is_published` | Boolean used by the public query |
| `updated_at` | Sort order for newest changes |
| `object_number` | Agent/object reference number |
| `title` | Public listing title |
| `description` | Public listing description |
| `category` | Website category/filter label |
| `object_type` | Detailed object type for detail view |
| `marketing_type` | `KAUF` or `MIETE` |
| `price` | Sale or rent price |
| `currency` | Defaults to `EUR` |
| `city`, `postal_code`, `country` | Location/filter data |
| `rooms`, `living_area`, `total_area` | Displayed detail facts |
| `image_url` or `images` | Main image source |
| `has_pool`, `has_parking`, `has_terrace`, `has_balcony` | Optional feature flags |

## Local development

Because the site uses browser `fetch()`, run a local server instead of opening `index.html` directly:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080/>. Without valid Supabase values in `config.js`, the page will show a configuration message instead of listings.

## Deployment on Netlify

The site is deployed as static files. Netlify can publish the repository root (`.`). For production, provide a `config.js` with the public Supabase URL and anon key, and ensure Supabase RLS only permits public reads for listings that should appear on the website.

## Next steps

- Create and secure the Supabase `properties` table and public read policy.
- Connect the real property import/update process to Supabase.
- Define text replacement and translation rules in `src/contentTransforms.js`.
- Add richer fields for contact data, energy certificate details, maps and dedicated shareable detail URLs.
