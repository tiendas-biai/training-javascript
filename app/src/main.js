import allCards from '../data/data.json';
import { loadProgress, saveProgress, clearProgress } from './storage.js';
import { grade, graduate, getOrCreate, computeStats, previewIntervals, getNextDueTime } from './srs.js';
import { buildQueue, advance, applyFilters, getCardType } from './session.js';
import {
  renderStartScreen,
  renderRevealQuestion,
  renderRevealAnswer,
  renderMCQQuestion,
  renderMCQAnswered,
  renderGradeToast,
  renderSummary,
  renderNothingDue,
} from './ui.js';

// ── State ──────────────────────────────────────────────────────────────────────

let progressMap = loadProgress();
let sessionQueue = [];
let sessionStats = { reviewed: 0, correct: 0 };
let lastFilters = {};
let lastSessionSize = 20;
let learningStreak = {};  // cardId → consecutive correct count this session

// ── Start screen ───────────────────────────────────────────────────────────────

function showStart() {
  progressMap = loadProgress();
  renderStartScreen(allCards, progressMap, { onStart: startSession, onReset: handleReset });
}

function handleReset() {
  clearProgress();
  progressMap = {};
  showStart();
}

// ── Session ────────────────────────────────────────────────────────────────────

function startSession(filters, sessionSize) {
  lastFilters = filters;
  lastSessionSize = sessionSize;
  sessionQueue = buildQueue(allCards, progressMap, filters, sessionSize);
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
    renderSummary(sessionStats, { onAgain: () => startSession(lastFilters, lastSessionSize), onHome: showStart });
    return;
  }

  const card = sessionQueue[0];
  const state = getOrCreate(card.id, progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };

  if (getCardType(card) === 'multiple-choice') {
    renderMCQQuestion(card, { remaining: sessionQueue.length, cardInfo },
      (pickedOption, shuffled) => onMCQPick(card, pickedOption, shuffled),
      showStart);
  } else {
    renderRevealQuestion(card, { remaining: sessionQueue.length, cardInfo }, onShowAnswer, showStart);
  }
}

// ── Reveal flow ────────────────────────────────────────────────────────────────

function onShowAnswer() {
  const card = sessionQueue[0];
  const state = getOrCreate(card.id, progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };
  const previews = previewIntervals(state);
  renderRevealAnswer(card, { remaining: sessionQueue.length, cardInfo, previews }, onGrade, showStart);
}

function onGrade(rating) {
  const card = sessionQueue[0];
  const msg = processGrade(card, rating);
  renderGradeToast(msg, showCurrentCard);
}

// ── MCQ flow ───────────────────────────────────────────────────────────────────

function onMCQPick(card, pickedOption, shuffled) {
  const state = getOrCreate(card.id, progressMap);
  const cardInfo = { phase: state.phase, streak: learningStreak[card.id] ?? 0, interval: state.interval };
  const previews = previewIntervals(state);
  renderMCQAnswered(card, { remaining: sessionQueue.length, cardInfo, previews }, pickedOption, shuffled,
    (rating) => {
      const msg = processGrade(card, rating);
      renderGradeToast(msg, showCurrentCard);
    },
    showStart);
}

// ── Grading logic ──────────────────────────────────────────────────────────────

function processGrade(card, rating) {
  const state = getOrCreate(card.id, progressMap);
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

  progressMap = { ...progressMap, [card.id]: newState };
  saveProgress(progressMap);
  sessionStats.reviewed++;
  if (rating !== 'hard') sessionStats.correct++;

  sessionQueue = advance(sessionQueue, cardExits, rating);
  return toastMsg;
}

// ── Nothing due ────────────────────────────────────────────────────────────────

function showNothingDue() {
  const filtered = applyFilters(allCards, lastFilters);
  const stats = computeStats(filtered, progressMap);
  const nextDueTs = getNextDueTime(progressMap);
  renderNothingDue({ nextDueTs, mastered: stats.mastered, total: stats.total }, showStart);
}

// ── Boot ───────────────────────────────────────────────────────────────────────

showStart();