const DAY = 86_400_000;

function freshCard(id) {
  return { id, phase: 'learning', interval: 0, ease: 2.5, nextDue: 0, lastReviewed: null, totalSeen: 0 };
}

function migrateIfNeeded(state) {
  if ('phase' in state) return state;
  // Migrate from old Leitner shape: { id, box, nextDue, lastReviewed, correctStreak, totalSeen }
  const boxToInterval = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };
  return {
    id: state.id,
    phase: (state.box ?? 1) <= 1 ? 'learning' : 'review',
    interval: boxToInterval[state.box ?? 1] ?? 0,
    ease: 2.5,
    nextDue: state.nextDue ?? 0,
    lastReviewed: state.lastReviewed ?? null,
    totalSeen: state.totalSeen ?? 0,
  };
}

export function getOrCreate(id, progressMap) {
  const raw = progressMap[id];
  return raw ? migrateIfNeeded(raw) : freshCard(id);
}

// For review cards (any rating) and learning+easy (immediate graduation at 3d).
export function grade(state, rating) {
  const now = Date.now();
  const base = { ...state, totalSeen: state.totalSeen + 1, lastReviewed: now };

  if (state.phase === 'learning') {
    // Only 'easy' reaches here from learning — graduates immediately with 3d
    return { ...base, phase: 'review', interval: 3, nextDue: now + 3 * DAY };
  }

  if (rating === 'hard') {
    const ease = Math.max(1.3, state.ease - 0.15);
    const interval = Math.max(1, Math.round(state.interval * 1.2));
    return { ...base, ease, interval, nextDue: now + interval * DAY };
  }
  if (rating === 'good') {
    const interval = Math.max(2, Math.round(state.interval * state.ease));
    return { ...base, interval, nextDue: now + interval * DAY };
  }
  // easy
  const ease = Math.min(3.0, state.ease + 0.15);
  const interval = Math.max(3, Math.round(state.interval * state.ease * 1.3));
  return { ...base, ease, interval, nextDue: now + interval * DAY };
}

// Called by session when a learning card reaches 2 consecutive correct answers (Good path).
export function graduate(state, rating) {
  const now = Date.now();
  const interval = rating === 'hard' ? 1 : rating === 'easy' ? 3 : 2;
  return {
    ...state,
    phase: 'review',
    interval,
    nextDue: now + interval * DAY,
    lastReviewed: now,
    totalSeen: state.totalSeen + 1,
  };
}

// Returns the interval label for each button given the current card state.
export function previewIntervals(state) {
  if (state.phase === 'learning') {
    return { hard: 'again', good: 'later', easy: '3d' };
  }
  const hard = Math.max(1, Math.round(state.interval * 1.2));
  const good = Math.max(2, Math.round(state.interval * state.ease));
  const easy = Math.max(3, Math.round(state.interval * state.ease * 1.3));
  return { hard: `${hard}d`, good: `${good}d`, easy: `${easy}d` };
}

export function getDueCards(allCards, progressMap) {
  const now = Date.now();
  const due = allCards.filter(card => {
    const raw = progressMap[card.id];
    if (!raw) return true;
    return migrateIfNeeded(raw).nextDue <= now;
  });
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due;
}

export function computeStats(filteredCards, progressMap) {
  const now = Date.now();
  let attempted = 0, mastered = 0, dueToday = 0, inLearning = 0;
  for (const card of filteredCards) {
    const raw = progressMap[card.id];
    const s = raw ? migrateIfNeeded(raw) : null;
    if (s?.lastReviewed != null) attempted++;
    if (s?.phase === 'review' && s.interval >= 7) mastered++;
    if (!s || s.nextDue <= now) dueToday++;
    if (s?.phase === 'learning' && s.totalSeen > 0) inLearning++;
  }
  return { total: filteredCards.length, attempted, mastered, dueToday, inLearning };
}

export function getNextDueTime(progressMap) {
  const now = Date.now();
  const times = Object.values(progressMap)
    .map(s => migrateIfNeeded(s).nextDue)
    .filter(t => t > now);
  return times.length ? Math.min(...times) : null;
}