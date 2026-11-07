import { loadCSS } from './aem.js';
import {
  getCurrentLocation, getCurrentSite, getEnclosingLocation, getSourceChain,
} from './locations.js';

export default async function showRibbon() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/msm-ribbon.css`);
  const site = getCurrentSite();
  const current = getCurrentLocation();
  const ribbon = document.createElement('aside');
  ribbon.className = 'msm-ribbon';
  ribbon.setAttribute('aria-label', 'MSM location info');

  const item = (label, value) => {
    const span = document.createElement('span');
    const b = document.createElement('b');
    b.textContent = `${label}: `;
    span.append(b, value);
    return span;
  };

  if (!current) {
    ribbon.append(item('Site', site), item('Location', 'none'));
  } else {
    const chain = getSourceChain(current)
      .map((l) => (l.site === site ? l.path : `${l.site}:${l.path}`))
      .join(' → ');
    ribbon.append(
      item('Site', site),
      item('Location', `${current.label} (${current.path})`),
      item('Level', current.level),
      item('Language', current.language),
      item('Chain', chain),
    );
    const enclosing = getEnclosingLocation(current);
    if (enclosing) ribbon.append(item('Nested in', enclosing.path));
  }
  document.body.append(ribbon);
}
