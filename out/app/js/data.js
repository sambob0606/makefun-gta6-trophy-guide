// Loads the guide's data files: the trophy list and the platinum roadmap.
// Both live under app/data/ and are fetched from the app's own server only.
export async function loadTrophyData() {
  const trophiesResponse = await fetch('data/trophies.json');
  if (!trophiesResponse.ok) throw new Error('could not load data/trophies.json');
  const trophyDoc = await trophiesResponse.json();
  if (!Array.isArray(trophyDoc.trophies) || trophyDoc.trophies.length === 0) {
    throw new Error('data/trophies.json holds no trophy list');
  }
  const roadmapResponse = await fetch('data/roadmap.json');
  if (!roadmapResponse.ok) throw new Error('could not load data/roadmap.json');
  const roadmapDoc = await roadmapResponse.json();
  return { trophies: trophyDoc.trophies, trophyListNote: trophyDoc.list, roadmap: roadmapDoc };
}

export function trophyById(trophies, id) {
  return trophies.find((trophy) => trophy.id === id);
}

export function gradeCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) counts[trophy.grade] = (counts[trophy.grade] || 0) + 1;
  return counts;
}

export function kindCounts(trophies) {
  const counts = {};
  for (const trophy of trophies) {
    const kind = trophy.kind === 'platinum' ? 'other' : trophy.kind;
    counts[kind] = (counts[kind] || 0) + 1;
  }
  counts.missable = trophies.filter((trophy) => trophy.missable).length;
  counts.online = 0;
  return counts;
}
