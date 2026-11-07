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
  loc('msm-next', '/en-gb', 'en-GB', 'United Kingdom', 'Locale', '/emea'),
  loc('msm-next', '/fr', 'fr', 'French', 'Language', '/emea'),
  loc('msm-next', '/fr-fr', 'fr-FR', 'France', 'Locale', '/fr'),
  loc('msm-next', '/fr-be', 'fr-BE', 'Belgium (French)', 'Locale', '/fr'),
  loc('msm-next', '/fr-ch', 'fr-CH', 'Switzerland (French)', 'Locale', '/fr'),
  loc('msm-next', '/de', 'de', 'German', 'Language', '/emea'),
  loc('msm-next', '/de-de', 'de-DE', 'Germany', 'Locale', '/de'),
  loc('msm-next', '/de-at', 'de-AT', 'Austria', 'Locale', '/de'),
  loc('msm-next', '/de-ch', 'de-CH', 'Switzerland (German)', 'Locale', '/de'),
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

export function localizePath(path) {
  const current = getCurrentLocation();
  if (!current || !path || !path.startsWith('/') || path.startsWith('//')) return path;
  if (isUnder(path, current.path) || isAsset(path)) return path;
  const source = getSourceChain(current).slice(1).find((l) => isUnder(path, l.path));
  return source ? `${current.path}${path.slice(source.path.length)}` : path;
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
