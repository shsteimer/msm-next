const OWNER = 'shsteimer';
const DEFAULT_SITE = 'msm-next';

const loc = (site, path, language, label, level, source = '') => ({
  site, path, language, label, level, source,
});

export const LOCATIONS = [
  loc('msm-next', '/global', 'en', 'Global', 'Global'),
  loc('msm-next', '/amer', 'en', 'Americas', 'Region', '/global'),
  loc('msm-next', '/emea', 'en', 'Europe, Middle East & Africa', 'Region', '/global'),
  loc('msm-next', '/en-us', 'en-US', 'United States', 'Locale', '/amer'),
  loc('msm-next', '/en-ca', 'en-CA', 'Canada (English)', 'Locale', '/amer'),
  loc('msm-next', '/es-419', 'es-419', 'Latin American Spanish', 'Language', '/amer'),
  loc('msm-next', '/es-mx', 'es-MX', 'Mexico', 'Locale', '/es-419'),
  loc('msm-next', '/es-ar', 'es-AR', 'Argentina', 'Locale', '/es-419'),
  loc('msm-next', '/es-co', 'es-CO', 'Colombia', 'Locale', '/es-419'),
  loc('msm-next', '/en-gb', 'en-GB', 'United Kingdom', 'Locale', '/emea'),
  loc('msm-next', '/en-ie', 'en-IE', 'Ireland', 'Locale', '/emea'),
  loc('msm-next', '/fr', 'fr', 'French', 'Language', '/emea'),
  loc('msm-next', '/fr-fr', 'fr-FR', 'France', 'Locale', '/fr'),
  loc('msm-next', '/fr-be', 'fr-BE', 'Belgium (French)', 'Locale', '/fr'),
  loc('msm-next', '/fr-be-nl', 'nl-BE', 'Belgium (Dutch)', 'Sub-locale', '/fr-be'),
  loc('msm-next', '/fr-ch', 'fr-CH', 'Switzerland (French)', 'Locale', '/fr'),
  loc('msm-next', '/fr-lu', 'fr-LU', 'Luxembourg (French)', 'Locale', '/fr'),
  loc('msm-next', '/de', 'de', 'German', 'Language', '/emea'),
  loc('msm-next', '/de-de', 'de-DE', 'Germany', 'Locale', '/de'),
  loc('msm-next', '/de-at', 'de-AT', 'Austria', 'Locale', '/de'),
  loc('msm-next', '/de-ch', 'de-CH', 'Switzerland (German)', 'Locale', '/de'),
  loc('msm-next', '/legal/en', 'en', 'Legal (English)', 'Legal source'),
  loc('msm-next', '/legal/fr', 'fr', 'Legal (French)', 'Language', '/legal/en'),
  loc('msm-next', '/legal/de', 'de', 'Legal (German)', 'Language', '/legal/en'),
  loc('msm-next', '/legal/es-419', 'es-419', 'Legal (Latin American Spanish)', 'Language', '/legal/en'),
  loc('msm-next', '/en-us/legal', 'en-US', 'Legal United States', 'Legal locale', '/legal/en'),
  loc('msm-next', '/en-ca/legal', 'en-CA', 'Legal Canada', 'Legal locale', '/legal/en'),
  loc('msm-next', '/en-gb/legal', 'en-GB', 'Legal United Kingdom', 'Legal locale', '/legal/en'),
  loc('msm-next', '/en-ie/legal', 'en-IE', 'Legal Ireland', 'Legal locale', '/legal/en'),
  loc('msm-next', '/fr-fr/legal', 'fr-FR', 'Legal France', 'Legal locale', '/legal/fr'),
  loc('msm-next', '/fr-be/legal', 'fr-BE', 'Legal Belgium (French)', 'Legal locale', '/legal/fr'),
  loc('msm-next', '/fr-ch/legal', 'fr-CH', 'Legal Switzerland (French)', 'Legal locale', '/legal/fr'),
  loc('msm-next', '/fr-lu/legal', 'fr-LU', 'Legal Luxembourg (French)', 'Legal locale', '/legal/fr'),
  loc('msm-next', '/de-de/legal', 'de-DE', 'Legal Germany', 'Legal locale', '/legal/de'),
  loc('msm-next', '/de-at/legal', 'de-AT', 'Legal Austria', 'Legal locale', '/legal/de'),
  loc('msm-next', '/de-ch/legal', 'de-CH', 'Legal Switzerland (German)', 'Legal locale', '/legal/de'),
  loc('msm-next', '/es-mx/legal', 'es-MX', 'Legal Mexico', 'Legal locale', '/legal/es-419'),
  loc('msm-next', '/es-ar/legal', 'es-AR', 'Legal Argentina', 'Legal locale', '/legal/es-419'),
  loc('msm-next', '/es-co/legal', 'es-CO', 'Legal Colombia', 'Legal locale', '/legal/es-419'),
  loc('msm-next-2', '/pixelmart', 'en-US', 'PixelMart', 'Distributor', 'msm-next:/en-us'),
  loc('msm-next-2', '/gamestation-depot', 'en-US', 'GameStation Depot', 'Distributor', 'msm-next:/en-us'),
  loc('msm-next-2', '/arcade-avenue', 'en-US', 'Arcade Avenue', 'Distributor', 'msm-next:/en-us'),
];

const SITES = [...new Set(LOCATIONS.map((l) => l.site))];

export function isUnder(path, folder) {
  return path === folder || path.startsWith(`${folder}/`);
}

function hostSite(hostname) {
  const match = hostname.match(/^[^.]+--([a-z0-9-]+)--([a-z0-9-]+)\.aem\.(?:page|live)$/);
  if (!match || match[2] !== OWNER || !SITES.includes(match[1])) return null;
  return match[1];
}

function longestMatch(locations, pathname) {
  return locations
    .filter((l) => isUnder(pathname, l.path))
    .sort((a, b) => b.path.length - a.path.length)[0] || null;
}

export function getCurrentSite() {
  const fromHost = hostSite(window.location.hostname);
  if (fromHost) return fromHost;
  const match = longestMatch(LOCATIONS, window.location.pathname);
  return match ? match.site : DEFAULT_SITE;
}

export function getLocations(site = getCurrentSite()) {
  return LOCATIONS.filter((l) => l.site === site);
}

export function getCurrentLocation(pathname = window.location.pathname) {
  return longestMatch(getLocations(), pathname);
}

function findSource(location) {
  if (!location.source) return null;
  const [site, path] = location.source.includes(':')
    ? location.source.split(':')
    : [location.site, location.source];
  return LOCATIONS.find((l) => l.site === site && l.path === path) || null;
}

export function getSourceChain(location = getCurrentLocation()) {
  const chain = [];
  let current = location;
  while (current && !chain.includes(current)) {
    chain.push(current);
    current = findSource(current);
  }
  return chain;
}

function isAsset(path) {
  if (/\/media[_/]/.test(path)) return true;
  const last = path.split('/').pop();
  const dot = last.lastIndexOf('.');
  return dot > 0 && last.slice(dot) !== '.html';
}

/**
 * Deepest location whose folder contains the folder of `location` (same site), or null.
 * A location with an enclosing location is "nested" (e.g. /fr-fr/legal inside /fr-fr).
 */
export function getEnclosingLocation(location = getCurrentLocation()) {
  if (!location) return null;
  return longestMatch(
    getLocations(location.site).filter((l) => l !== location && l.path !== location.path),
    location.path,
  );
}

/** Locations whose enclosing location is `location` (e.g. /fr-fr/legal for /fr-fr). */
export function getNestedLocations(location = getCurrentLocation()) {
  if (!location) return [];
  return getLocations(location.site).filter((l) => getEnclosingLocation(l) === location);
}

/**
 * Ordered rewrite rules `{ target, chain }` for the current location C and E = the location
 * enclosing C (if C is nested):
 * C's source chain -> C.path; E's source chain -> E.path; when C is a normal location, the
 * source chain of each location nested directly in C -> that nested location's path.
 */
function getRules(current) {
  const enclosing = getEnclosingLocation(current);
  const rules = [{ target: current.path, chain: getSourceChain(current).slice(1) }];
  if (enclosing) {
    rules.push({ target: enclosing.path, chain: getSourceChain(enclosing).slice(1) });
  } else {
    getNestedLocations(current).forEach((n) => {
      rules.push({ target: n.path, chain: getSourceChain(n).slice(1) });
    });
  }
  return rules;
}

function localizeAgainst(path, current, rules) {
  if (!current || !path || !path.startsWith('/') || path.startsWith('//')) return path;
  if (isUnder(path, current.path) || isAsset(path)) return path;
  const enclosing = getEnclosingLocation(current);
  if (enclosing && isUnder(path, enclosing.path)) return path;
  for (let i = 0; i < rules.length; i += 1) {
    const match = rules[i].chain.find((l) => isUnder(path, l.path));
    if (match) return `${rules[i].target}${path.slice(match.path.length)}`;
  }
  return path;
}

export function localizePath(path) {
  const current = getCurrentLocation();
  return current ? localizeAgainst(path, current, getRules(current)) : path;
}

/**
 * Localizes nav/footer metadata and fragment paths. On a nested location (e.g. /fr-fr/legal)
 * these resolve against the enclosing location (/fr-fr), so /global/nav becomes /fr-fr/nav.
 */
export function localizeFragmentPath(path) {
  const current = getCurrentLocation();
  if (!current) return path;
  const enclosing = getEnclosingLocation(current);
  if (!enclosing) return localizePath(path);
  return localizeAgainst(path, enclosing, getRules(enclosing));
}

function isSameSite(url) {
  if (url.origin === window.location.origin) return true;
  if (url.hostname === 'localhost') return true;
  return hostSite(url.hostname) === getCurrentSite();
}

export function localizeLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || !isSameSite(url)) return;
    const localized = localizePath(url.pathname);
    if (localized === url.pathname) return;
    if (href.startsWith('/') && !href.startsWith('//')) {
      a.setAttribute('href', `${localized}${url.search}${url.hash}`);
    } else {
      url.pathname = localized;
      a.setAttribute('href', url.href);
    }
  });
}
