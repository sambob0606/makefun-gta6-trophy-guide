// Renders the roadmap to the platinum and the missables view from roadmap.json
// and the trophy list. Roadmap stages are built from the official descriptions.
import { trophyById } from './data.js';

export function renderRoadmap(stagesElement, estimateElement, noteElement, roadmap, trophies, state, callbacks) {
  estimateElement.textContent = `${roadmap.title} — ${roadmap.estimate}`;
  noteElement.textContent = roadmap.missablesNote;
  stagesElement.replaceChildren();
  for (const stage of roadmap.stages) {
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = `Stage ${stage.stage} · ${stage.hours}`;
    item.append(hours);
    const title = document.createElement('h3');
    title.textContent = stage.name;
    item.append(title);
    const steps = document.createElement('ol');
    for (const step of stage.steps) {
      const stepItem = document.createElement('li');
      stepItem.textContent = step;
      steps.append(stepItem);
    }
    item.append(steps);
    if (stage.trophies.length > 0) {
      const earnedCount = stage.trophies.filter((id) => state.earned.has(id)).length;
      const progress = document.createElement('p');
      progress.style.cssText = 'margin:8px 0 0;font-size:13px;font-weight:700;';
      progress.textContent = `${earnedCount} of ${stage.trophies.length} trophies in this stage earned`;
      item.append(progress);
      const chips = document.createElement('div');
      chips.className = 'stage-trophies';
      for (const id of stage.trophies) {
        const trophy = trophyById(trophies, id);
        if (!trophy) continue;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.title = trophy.description;
        chip.className = state.earned.has(id) ? 'earned' : '';
        chip.textContent = `${state.earned.has(id) ? '✓ ' : ''}${trophy.name}`;
        chip.addEventListener('click', () => callbacks.onOpenTrophy(id));
        chips.append(chip);
      }
      item.append(chips);
    }
    stagesElement.append(item);
  }
}

export function renderMissables(bodyElement, trophies, state, callbacks) {
  bodyElement.replaceChildren();
  const missable = trophies.filter((trophy) => trophy.missable);
  const card = document.createElement('div');
  card.className = 'missable-card';
  const heading = document.createElement('h3');
  heading.textContent = `Potentially missable: ${missable.length} trophy`;
  card.append(heading);
  for (const trophy of missable) {
    const name = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = trophy.name;
    name.append(strong);
    name.append(document.createTextNode(` — ${trophy.description}`));
    card.append(name);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide.replace(/ Sources:.*$/, '').trim();
    card.append(guide);
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Open its full guide with sources';
    open.style.cssText = 'padding:8px 14px;border-radius:8px;cursor:pointer;';
    open.addEventListener('click', () => callbacks.onOpenTrophy(trophy.id));
    card.append(open);
  }
  bodyElement.append(card);

  const safe = document.createElement('div');
  safe.className = 'safe-card';
  const safeHeading = document.createElement('h3');
  safeHeading.textContent = 'Everything else: safe after the story';
  safe.append(safeHeading);
  const safeText = document.createElement('p');
  safeText.textContent =
    'All 12 story trophies, the 5 stranger finals, the 8 Strangers & Freaks strands and everything on the ' +
    '100% completion checklist can be finished in free roam after the credits — there is no mission replay, ' +
    'but nothing on the list is locked behind a finished chapter. PowerPyx notes every trophy-related quest ' +
    'giver is still there after the story, and GTA-Zone confirms nothing on the 100% checklist is missable. ' +
    'The only thing to do on time is the Chapter 1 balcony meditation above.';
  safe.append(safeText);
  const counts = document.createElement('p');
  const unmissable = trophies.length - missable.length;
  counts.textContent = `${unmissable} of ${trophies.length} trophies cannot be missed · 0 online trophies · 1 playthrough is enough.`;
  safe.append(counts);
  bodyElement.append(safe);
}
