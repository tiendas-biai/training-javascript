import { loadProgress, saveProgress, clearProgress } from './storage.js';
import { migrateStorageKeys } from './migrate.js';
import { getSubject, listSubjects } from './subjects.js';
import { grade, graduate, getOrCreate, computeStats, previewIntervals, getNextDueTime } from './srs.js';
import { buildQueue, advance, applyFilters, getCardType } from './session.js';
import { route, navigate, initRouter } from './router.js';
import {
  renderSubjectPicker,
  renderEmptySubject,
  renderStartScreen,
  renderRevealQuestion,
  renderRevealAnswer,
  renderMCQQuestion,
  renderMCQAnswered,
  renderGradeToast,
  renderSummary,
  renderNothingDue,
  renderCardList,
  renderCardDetail,
} from './ui.js';

// ── State (scoped to the active subject) ───────────────────────────────────────

let current = null; // { subject, cards, progressMap }
let sessionQueue = [];
let sessionStats = { reviewed: 0, correct: 0 };
let lastFilters = {};
let lastSessionSize = 20;
let learningStreak = {};

async function loadCards(subject) {
  const mod = await subject.loadData();
  return mod.default;
}

// Resolves the subject id from the URL into { subject, cards, progressMap }.
// Unknown ids redirect to the picker and return null.
async function enterSubject(id) {
  const subject = getSubject(id);
  if (!subject) { navigate('/'); return null; }
  const cards = await loadCards(subject);
  current = { subject, cards, progressMap: loadProgress(subject.storageKey) };
  return current;
}

// ── Routes ─────────────────────────────────────────────────────────────────────

route('/', async () => {
  const tiles = await Promise.all(listSubjects().map(async (subject) => {
    const cards = await loadCards(subject);
    const stats = computeStats(cards, loadProgress(subject.storageKey));
    return { subject, total: cards.length, dueToday: stats.dueToday };
  }));
  renderSubjectPicker(tiles, { onPick: (id) => navigate(`/${id}`) });
});

route('/:subject', async ({ subject: id }) => {
  const ctx = await enterSubject(id);
  if (!ctx) return;
  if (ctx.cards.length === 0) {
    renderEmptySubject(ctx.subject, { onBack: () => navigate('/') });
    return;
  }
  renderStartScreen(ctx.subject, ctx.cards, ctx.progressMap, {
    onStart: startSession,
    onReset: handleReset,
    onBack: () => navigate('/'),
    onTileClick: (filter) =>
      navigate(`/${id}/card-library${filter ? `?filter=${filter}` : ''}`),
  });
});

route('/:subject/card-library', async ({ subject: id }) => {
  const ctx = await enterSubject(id);
  if (!ctx) return;
  renderCardList(ctx.cards, ctx.progressMap, {
    basePath: `/${id}/card-library`,
    onBack: () => navigate(`/${id}`),
    onCardClick: (cardId) => navigate(`/${id}/card/${cardId}`),
  });
});

route('/:subject/card/:id', async ({ subject: subjectId, id }) => {
  const ctx = await enterSubject(subjectId);
  if (!ctx) return;
  const card = ctx.cards.find(c => c.id === id);
  if (!card) { navigate(`/${subjectId}/card-library`); return; }
  renderCardDetail(card, ctx.progressMap, { onBack: () => history.back() });
});

// ── Subject home ───────────────────────────────────────────────────────────────

function handleReset() {
  clearProgress(current.subject.storageKey);
  current.progressMap = {};
  navigate(`/${current.subject.id}`);
}

function goHome() {
  navigate(`/${current.subject.id}`);
}

// ── Session ────────────────────────────────────────────────────────────────────

function startSession(filters, sessionSize) {
  lastFilters = filters;
  lastSessionSize = sessionSize;
  sessionQueue = buildQueue(current.cards, current.progressMap, filters, sessionSize);
  sessionStats = { reviewed: 0, correct: 0 };
  learningStreak = {};

  if (sessionQueue.length === 0) {
    showNothingDue();
    return;
  }
  showCurrentCard();
}

function showCurrentCard() {
  if (sessionQueue.length === 0) {
    renderSummary(sessionStats, {
      onAgain: () => startSession(lastFilters, lastSessionSize),
      onHome: goHome,
    });
    return;
  }

  const card = sessionQueue[0];
  const state = getOrCreate(card.id, current.progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };

  if (getCardType(card) === 'multiple-choice') {
    renderMCQQuestion(card, { remaining: sessionQueue.length, cardInfo },
      (pickedOption, shuffled) => onMCQPick(card, pickedOption, shuffled),
      goHome);
  } else {
    renderRevealQuestion(card, { remaining: sessionQueue.length, cardInfo }, onShowAnswer, goHome);
  }
}

// ── Reveal flow ────────────────────────────────────────────────────────────────

function onShowAnswer() {
  const card = sessionQueue[0];
  const state = getOrCreate(card.id, current.progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };
  const previews = previewIntervals(state);
  renderRevealAnswer(card, { remaining: sessionQueue.length, cardInfo, previews }, onGrade, goHome);
}

function onGrade(rating) {
  const card = sessionQueue[0];
  const msg = processGrade(card, rating);
  renderGradeToast(msg, showCurrentCard);
}

// ── MCQ flow ───────────────────────────────────────────────────────────────────

function onMCQPick(card, pickedOption, shuffled) {
  const state = getOrCreate(card.id, current.progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };
  const previews = previewIntervals(state);
  renderMCQAnswered(card, { remaining: sessionQueue.length, cardInfo, previews }, pickedOption, shuffled,
    (rating) => {
      const msg = processGrade(card, rating);
      renderGradeToast(msg, showCurrentCard);
    },
    goHome);
}

// ── Grading logic ──────────────────────────────────────────────────────────────

function processGrade(card, rating) {
  const state = getOrCreate(card.id, current.progressMap);
  let newState;
  let cardExits = false;
  let toastMsg;

  if (state.phase === 'learning') {
    if (rating === 'easy') {
      newState = grade(state, 'easy');
      cardExits = true;
      toastMsg = 'Graduated! See you in 3 days';
    } else if (rating === 'good') {
      const streak = (learningStreak[card.id] ?? 0) + 1;
      learningStreak[card.id] = streak;
      if (streak >= 2) {
        newState = graduate(state, 'good');
        cardExits = true;
        toastMsg = 'Graduated! See you in 2 days';
        delete learningStreak[card.id];
      } else {
        newState = { ...state, totalSeen: state.totalSeen + 1, lastReviewed: Date.now() };
        toastMsg = '1 more correct to graduate';
      }
    } else {
      learningStreak[card.id] = 0;
      newState = { ...state, totalSeen: state.totalSeen + 1, lastReviewed: Date.now() };
      toastMsg = 'Coming back soon';
    }
  } else {
    newState = grade(state, rating);
    cardExits = true;
    const previews = previewIntervals(state);
    toastMsg = `See you in ${previews[rating]}`;
  }

  current.progressMap = { ...current.progressMap, [card.id]: newState };
  saveProgress(current.subject.storageKey, current.progressMap);
  sessionStats.reviewed++;
  if (rating !== 'hard') sessionStats.correct++;

  sessionQueue = advance(sessionQueue, cardExits, rating);
  return toastMsg;
}

// ── Nothing due ────────────────────────────────────────────────────────────────

function showNothingDue() {
  const filtered = applyFilters(current.cards, lastFilters);
  const stats = computeStats(filtered, current.progressMap);
  const nextDueTs = getNextDueTime(current.progressMap);
  renderNothingDue({ nextDueTs, mastered: stats.mastered, total: stats.total }, goHome);
}

// ── Boot ───────────────────────────────────────────────────────────────────────

migrateStorageKeys();
initRouter();
