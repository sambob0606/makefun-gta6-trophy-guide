// Filter rules for the checklist: kind chips, grade, search text and the spoiler rule.
export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  crime: 'Crime',
  money: 'Money',
  other: 'Other',
  online: 'Online',
};

export const KIND_ORDER = ['all', 'story', 'missable', 'collectible', 'activity', 'crime', 'money', 'other', 'online'];

export function kindOf(trophy) {
  return trophy.kind === 'platinum' ? 'other' : trophy.kind;
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return false;
  return kindOf(trophy) === kind;
}

export function matchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  const trimmed = (query ?? '').trim();
  if (!trimmed) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return trimmed.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
}

export function visibleTrophies(trophies, filters) {
  return trophies.filter(
    (trophy) =>
      matchesKind(trophy, filters.kind) &&
      matchesGrade(trophy, filters.grade) &&
      matchesSearch(trophy, filters.query),
  );
}

// The spoiler rule: a hidden story trophy stays nameless until it is earned.
export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden && !earned.has(trophy.id);
}
