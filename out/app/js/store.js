// Progress store: earned trophies and the spoiler setting, saved in localStorage,
// plus export to a file and import back. Progress is keyed by trophy id.
const PROGRESS_KEY = 'leonida-ledger-progress-v1';
const SETTINGS_KEY = 'leonida-ledger-settings-v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    // Storage full or unavailable: progress still shows for this session.
  }
}

export function loadSpoilerSetting() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}').spoiler === true;
  } catch {
    return false;
  }
}

export function saveSpoilerSetting(spoilerOn) {
  let settings = {};
  try { settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}'); } catch { settings = {}; }
  settings.spoiler = spoilerOn;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned, spoilerOn) {
  const payload = {
    app: 'Leonida Ledger — GTA 6 Trophy Guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    spoiler: spoilerOn,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseImportedProgress(text, knownIds) {
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('no earned list found');
  const known = new Set(knownIds);
  const earned = new Set();
  for (const id of ids) {
    const numeric = Number(id);
    if (Number.isInteger(numeric) && known.has(numeric)) earned.add(numeric);
  }
  const spoiler = !Array.isArray(parsed) && parsed.spoiler === true;
  return { earned, spoiler };
}
