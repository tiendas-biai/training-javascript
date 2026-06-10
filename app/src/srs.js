const INTERVALS = {
  1: 0,
  2: 86_400_000,
  3: 259_200_000,
  4: 604_800_000,
  5: 1_209_600_000,
};

function freshCard(id) {
  return { id, box: 1, nextDue: 0, lastReviewed: null, correctStreak: 0, totalSeen: 0 };
}

export function grade(state, isCorrect) {
  const now = Date.now();
  if (isCorrect) {
    const newBox = Math.min(state.box + 1, 5);
    return {
      ...state,
      box: newBox,
      nextDue: now + INTERVALS[newBox],
      lastReviewed: now,
      correctStreak: state.correctStreak + 1,
      totalSeen: state.totalSeen + 1,
    };
  }
  return {
    ...state,
    box: 1,
    nextDue: now + INTERVALS[1],
    lastReviewed: now,
    correctStreak: 0,
    totalSeen: state.totalSeen + 1,
  };
}

export function getDueCards(allCards, progressMap) {
  const now = Date.now();
  const due = allCards.filter(card => {
    const s = progressMap[card.id];
    return !s || s.nextDue <= now;
  });
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due;
}

export function computeStats(filteredCards, progressMap) {
  const now = Date.now();
  let attempted = 0, mastered = 0, dueToday = 0;
  for (const card of filteredCards) {
    const s = progressMap[card.id];
    if (s?.lastReviewed != null) attempted++;
    if ((s?.correctStreak ?? 0) >= 2) mastered++;
    if (!s || s.nextDue <= now) dueToday++;
  }
  return {
    total: filteredCards.length,
    attempted,
    mastered,
    dueToday,
    sessionLength: Math.min(dueToday, 15),
  };
}

export function getOrCreate(id, progressMap) {
  return progressMap[id] ?? freshCard(id);
}
