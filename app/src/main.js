import allCards from '../data/data.json';
import { loadProgress, saveProgress, clearProgress } from './storage.js';
import { grade, getOrCreate, computeStats } from './srs.js';
import { buildQueue, advance, getCardType } from './session.js';
import {
  renderStartScreen,
  renderRevealQuestion,
  renderRevealAnswer,
  renderMCQQuestion,
  renderMCQAnswered,
  renderSummary,
  renderNothingDue,
} from './ui.js';

// ── State ──────────────────────────────────────────────────────────────────────

let progressMap = loadProgress();
let sessionQueue = [];
let sessionStats = { reviewed: 0, correct: 0 };
let lastMode = 'drill';
let lastFilters = {};

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

function startSession(mode, filters) {
  lastMode = mode;
  lastFilters = filters;
  sessionQueue = buildQueue(allCards, progressMap, filters, mode);
  sessionStats = { reviewed: 0, correct: 0 };

  if (sessionQueue.length === 0) {
    showNothingDue();
    return;
  }
  showCurrentCard();
}

function showCurrentCard() {
  if (sessionQueue.length === 0) {
    renderSummary(sessionStats, { onAgain: () => startSession(lastMode, lastFilters), onHome: showStart });
    return;
  }

  const card = sessionQueue[0];
  const remaining = sessionQueue.length;

  if (getCardType(card) === 'multiple-choice') {
    renderMCQQuestion(card, { remaining }, (pickedOption, shuffled) => onMCQPick(card, pickedOption, shuffled), showStart);
  } else {
    renderRevealQuestion(card, { remaining }, onShowAnswer, showStart);
  }
}

// ── Reveal flow ────────────────────────────────────────────────────────────────

function onShowAnswer() {
  const card = sessionQueue[0];
  renderRevealAnswer(card, { remaining: sessionQueue.length }, onGrade, showStart);
}

function onGrade(isCorrect) {
  const card = sessionQueue[0];
  const newState = grade(getOrCreate(card.id, progressMap), isCorrect);
  progressMap = { ...progressMap, [card.id]: newState };
  saveProgress(progressMap);

  sessionStats.reviewed++;
  if (isCorrect) sessionStats.correct++;

  sessionQueue = advance(sessionQueue, isCorrect);
  showCurrentCard();
}

// ── MCQ flow ───────────────────────────────────────────────────────────────────

function onMCQPick(card, pickedOption, shuffled) {
  const isCorrect = pickedOption === card.answer;
  renderMCQAnswered(card, { remaining: sessionQueue.length }, pickedOption, shuffled, () => {
    const newState = grade(getOrCreate(card.id, progressMap), isCorrect);
    progressMap = { ...progressMap, [card.id]: newState };
    saveProgress(progressMap);

    sessionStats.reviewed++;
    if (isCorrect) sessionStats.correct++;

    sessionQueue = advance(sessionQueue, isCorrect);
    showCurrentCard();
  }, showStart);
}

// ── Nothing due ────────────────────────────────────────────────────────────────

function showNothingDue() {
  const states = Object.values(progressMap);
  const nextDueTs = states
    .filter(s => s.nextDue > Date.now())
    .map(s => s.nextDue)
    .sort()[0];
  const nextDueDate = nextDueTs ? new Date(nextDueTs).toLocaleDateString() : null;
  const learned = states.filter(s => s.correctStreak >= 2).length;

  renderNothingDue({ nextDueDate, learned, total: allCards.length }, showStart);
}

// ── Boot ───────────────────────────────────────────────────────────────────────

showStart();
