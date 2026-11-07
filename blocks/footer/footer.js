import { getMetadata } from '../../scripts/aem.js';
import { getCurrentLocation, getLocations, getSourceChain } from '../../scripts/locations.js';
import { loadFragment } from '../fragment/fragment.js';

function buildLocationSwitcher() {
  const current = getCurrentLocation();
  if (!current) return null;
  const rest = window.location.pathname.slice(current.path.length) || '/';
  const { search, hash } = window.location;

  const details = document.createElement('details');
  details.className = 'location-switcher';
  const summary = document.createElement('summary');
  summary.textContent = `${current.label} (${current.language})`;
  const list = document.createElement('ul');
  const rootOf = (loc) => getSourceChain(loc).pop();
  const root = rootOf(current);
  getLocations().filter((l) => rootOf(l) === root).forEach((l) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `${l.path}${rest}${search}${hash}`;
    a.textContent = l.label;
    a.lang = l.language;
    li.className = `level-${l.level.toLowerCase()}`;
    if (l === current) a.setAttribute('aria-current', 'true');
    li.append(a);
    list.append(li);
  });
  details.append(summary, list);
  return details;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  if (fragment) while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const switcher = buildLocationSwitcher();
  if (switcher) {
    const wrapper = document.createElement('div');
    wrapper.className = 'location-switcher-wrapper';
    wrapper.append(switcher);
    footer.append(wrapper);
  }

  block.append(footer);
}
