// Leonida Ledger boot: loads the trophy list and roadmap, wires the tabs,
// filters, spoiler setting, progress store and the detail pane together.
import { loadTrophyData, trophyById, kindCounts } from './data.js';
import {
  loadEarned,
  saveEarned,
  loadSpoilerSetting,
  saveSpoilerSetting,
  exportProgress,
  parseImportedProgress,
} from './store.js';
import { KIND_LABELS, KIND_ORDER, visibleTrophies } from './filters.js';
import { renderChecklist } from './renderChecklist.js';
import { renderDetail } from './renderDetail.js';
import { renderRoadmap, renderMissables } from './renderRoadmap.js';

const $ = (id) => document.getElementById(id);

const state = {
  trophies: [],
  roadmap: null,
  earned: loadEarned(),
  spoilerOn: loadSpoilerSetting(),
  selectedId: 28,
  view: 'checklist',
  filters: { kind: 'all', grade: 'all', query: '' },
  get total() { return this.trophies.length; },
};

const callbacks = {
  onToggleEarned(id, earnedNow) {
    if (earnedNow) state.earned.add(id);
    else state.earned.delete(id);
    saveEarned(state.earned);
    renderAll();
  },
  onSelect(id) {
    state.selectedId = id;
    renderChecklistView();
  },
  onOpenTrophy(id) {
    state.selectedId = id;
    showView('checklist');
    renderAll();
    const row = document.querySelector(`[data-trophy-id="${id}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
  },
};

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length || 55;
  $('earnedCount').textContent = String(earned);
  document.title = `(${earned}/${total}) Leonida Ledger — GTA 6 Trophy Guide & Tracker`;
  $('progressLabel').textContent =
    `earned · ${Math.round((earned / total) * 100)}% to the platinum`;
  $('progressBar').style.width = `${(earned / total) * 100}%`;
}

function renderChecklistView() {
  const visible = visibleTrophies(state.trophies, state.filters);
  renderChecklist($('trophyList'), $('listMeta'), visible, state, callbacks);
  renderDetail($('detail'), trophyById(state.trophies, state.selectedId), state, callbacks);
  renderProgress();
}

function renderAll() {
  renderChecklistView();
  if (state.roadmap) {
    renderRoadmap($('roadmapStages'), $('roadmapEstimate'), $('roadmapNote'), state.roadmap, state.trophies, state, callbacks);
    renderMissables($('missablesBody'), state.trophies, state, callbacks);
  }
  renderProgress();
}

function showView(view) {
  state.view = view;
  $('tabChecklist').classList.toggle('active', view === 'checklist');
  $('tabRoadmap').classList.toggle('active', view === 'roadmap');
  $('tabMissables').classList.toggle('active', view === 'missables');
  $('checklistView').hidden = view !== 'checklist';
  $('controls').style.display = view === 'checklist' ? '' : 'none';
  $('roadmapView').hidden = view !== 'roadmap';
  $('missablesView').hidden = view !== 'missables';
}

function buildKindChips() {
  const counts = kindCounts(state.trophies);
  const chips = $('kindChips');
  chips.replaceChildren();
  for (const kind of KIND_ORDER) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (state.filters.kind === kind ? ' active' : '');
    const count = kind === 'all' ? state.trophies.length : (counts[kind] ?? 0);
    chip.textContent = `${KIND_LABELS[kind]} (${count})`;
    chip.addEventListener('click', () => {
      state.filters.kind = kind;
      buildKindChips();
      renderChecklistView();
    });
    chips.append(chip);
  }
}

function wireControls() {
  $('tabChecklist').addEventListener('click', () => showView('checklist'));
  $('tabRoadmap').addEventListener('click', () => showView('roadmap'));
  $('tabMissables').addEventListener('click', () => showView('missables'));
  $('search').addEventListener('input', (event) => {
    state.filters.query = event.target.value.trim();
    renderChecklistView();
  });
  $('grade').addEventListener('change', (event) => {
    state.filters.grade = event.target.value;
    renderChecklistView();
  });
  const spoilerBox = $('spoiler');
  spoilerBox.checked = state.spoilerOn;
  spoilerBox.addEventListener('change', () => {
    state.spoilerOn = spoilerBox.checked;
    saveSpoilerSetting(state.spoilerOn);
    renderChecklistView();
  });
  $('export').addEventListener('click', () => exportProgress(state.earned, state.spoilerOn));
  $('import').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const imported = parseImportedProgress(text, state.trophies.map((t) => t.id));
        state.earned = imported.earned;
        state.spoilerOn = imported.spoiler;
        spoilerBox.checked = state.spoilerOn;
        saveSpoilerSetting(state.spoilerOn);
        saveEarned(state.earned);
        renderAll();
      } catch (error) {
        window.alert(`Could not import that file: ${error.message}`);
      }
      event.target.value = '';
    });
  });
  $('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      state.earned = new Set();
      saveEarned(state.earned);
      renderAll();
    }
  });
}

function readHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'roadmap' || hash === 'missables') showView(hash);
  if (hash === 'spoiler') {
    state.spoilerOn = true;
    saveSpoilerSetting(true);
    $('spoiler').checked = true;
  }
  const trophyMatch = hash.match(/^trophy-(\d+)$/);
  if (trophyMatch) state.selectedId = Number(trophyMatch[1]);
}

function wireHashChanges() {
  window.addEventListener('hashchange', () => {
    readHash();
    renderAll();
  });
}

function boot() {
  loadTrophyData()
    .then(({ trophies, roadmap }) => {
      state.trophies = trophies;
      state.roadmap = roadmap;
      buildKindChips();
      wireControls();
      wireHashChanges();
      readHash();
      renderAll();
    })
    .catch((error) => {
      $('trophyList').textContent = `Could not load the trophy list: ${error.message}`;
    });
}

boot();
