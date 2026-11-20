// Renders the detail pane for the selected trophy: official description,
// the guide in this entry's own words, its target count and its cited sources.
import { isSpoilerHidden } from './filters.js';

function flag(text, className) {
  const span = document.createElement('span');
  span.className = `flag ${className}`;
  span.textContent = text;
  return span;
}

export function renderDetail(detailElement, trophy, state, callbacks) {
  detailElement.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.textContent = 'Select a trophy to read its guide.';
    detailElement.append(empty);
    return;
  }
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.spoilerOn, state.earned);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden trophy' : trophy.name;
  detailElement.append(title);

  const flags = document.createElement('div');
  const gradeName = trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
  flags.append(flag(gradeName, ''));
  if (trophy.hidden) flags.append(flag('Hidden on PSN', 'hidden-flag'));
  if (trophy.missable) flags.append(flag('Potentially missable', 'missable-flag'));
  if (earned) flags.append(flag('Earned', 'earned-flag'));
  detailElement.append(flags);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Official description hidden until earned (spoiler setting is on).'
    : `Official description: “${trophy.description}”`;
  detailElement.append(official);

  if (typeof trophy.target === 'number') {
    const target = document.createElement('p');
    target.className = 'target-line';
    target.textContent = `PSN target: ${trophy.target.toLocaleString('en-US')}`;
    detailElement.append(target);
  }

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'How to earn it';
  guideHeading.style.cssText = 'margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;';
  detailElement.append(guideHeading);

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = hidden
    ? 'Turn the spoiler setting off, or earn this trophy, to read its guide.'
    : trophy.guide.replace(/ Sources:.*$/, '').trim();
  detailElement.append(guide);

  if (!hidden && Array.isArray(trophy.sources) && trophy.sources.length > 0) {
    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    sourcesHeading.style.cssText = 'margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;';
    detailElement.append(sourcesHeading);
    const list = document.createElement('ul');
    list.className = 'sources';
    list.style.cssText = 'margin:0;padding-left:18px;';
    for (const source of trophy.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    detailElement.append(list);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('aria-pressed', String(earned));
  toggle.textContent = earned ? 'Mark as not earned' : 'Mark as earned';
  toggle.style.cssText = 'margin-top:14px;padding:8px 14px;border-radius:8px;cursor:pointer;';
  toggle.addEventListener('click', () => callbacks.onToggleEarned(trophy.id, !earned));
  detailElement.append(toggle);
}
