// Renders the checklist rows: checkbox, grade dot, name, official description and tags.
import { isSpoilerHidden, KIND_LABELS } from './filters.js';

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function buildTrophyRow(trophy, state, callbacks) {
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.spoilerOn, state.earned);
  const row = document.createElement('li');
  row.className = 'trophy-row' + (earned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');
  row.dataset.trophyId = String(trophy.id);
  if (state.selectedId === trophy.id) row.setAttribute('aria-current', 'true');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${hidden ? 'hidden trophy' : trophy.name} earned`);
  box.addEventListener('change', () => callbacks.onToggleEarned(trophy.id, box.checked));
  box.addEventListener('click', (event) => event.stopPropagation());
  row.append(box);

  const dot = document.createElement('span');
  dot.className = `grade-dot ${trophy.grade}`;
  dot.title = gradeLabel(trophy.grade);
  row.append(dot);

  const text = document.createElement('div');
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden trophy — earn it to reveal its name' : trophy.name;
  text.append(name);
  const desc = document.createElement('p');
  desc.textContent = hidden ? 'A hidden story trophy. Its name and description stay hidden until earned.' : trophy.description;
  text.append(desc);
  row.append(text);

  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = 'tag';
  gradeTag.textContent = gradeLabel(trophy.grade);
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind === 'platinum' ? 'other' : trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const missableTag = document.createElement('span');
    missableTag.className = 'tag missable';
    missableTag.textContent = 'MISSABLE';
    tags.append(missableTag);
  }
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden';
    tags.append(hiddenTag);
  }
  row.append(tags);

  row.addEventListener('click', () => callbacks.onSelect(trophy.id));
  return row;
}

export function renderChecklist(listElement, metaElement, trophies, state, callbacks) {
  listElement.replaceChildren();
  if (trophies.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent =
      state.filters.kind === 'online'
        ? 'No online trophies: all 55 GTA 6 trophies are offline, single-player.'
        : 'No trophies match these filters. Try clearing the search or picking another kind.';
    listElement.append(empty);
  }
  for (const trophy of trophies) {
    listElement.append(buildTrophyRow(trophy, state, callbacks));
  }
  metaElement.textContent = `Showing ${trophies.length} of ${state.total} trophies` +
    (state.filters.kind === 'online' ? ' · GTA 6 has no online trophies' : '');
}
