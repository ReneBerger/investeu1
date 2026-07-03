export const DEFAULT_LANGUAGE = 'DE';
export const DETAIL_ROUTE = 'Immobiliendetailseite';

export function getCurrentLanguage(pathname = window.location.pathname) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return (segment || DEFAULT_LANGUAGE).toUpperCase();
}

export function detailUrl(propertyId, language = getCurrentLanguage()) {
  return `/${language}/${DETAIL_ROUTE}/?id=${encodeURIComponent(propertyId)}`;
}

export function getPropertyIdFromUrl(search = window.location.search) {
  return new URLSearchParams(search).get('id');
}
