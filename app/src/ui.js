import { computeStats } from './srs.js';
import { applyFilters, getCardType } from './session.js';

const root = () => document.getElementById('app');

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shuffleCopy(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function diffBadge(d) {
  return `<span class="badge badge-${d}">${d}</span>`;
}

function cardMeta(card) {
  return `
    <div class="card-meta">
      <span class="badge">${esc(card.topic)}</span>
      ${diffBadge(card.difficulty)}
      <span class="badge">${getCardType(card) === 'multiple-choice' ? 'MCQ' : 'reveal'}</span>
    </div>`;
}

function sessionHeader(remaining) {
  return `
    <div class="session-header">
      <button class="exit-btn" id="exit-btn">← Exit</button>
      <span class="progress-label">${remaining} left</span>
    </div>`;
}

// ── Start screen ──────────────────────────────────────────────────────────────

export function renderStartScreen(allCards, progressMap, { onStart, onReset }) {
  const topics = [...new Set(allCards.map(c => c.topic))].sort();
  const tags    = [...new Set(allCards.flatMap(c => c.tags ?? []))].sort();

  const filters = { topic: '', difficulty: '', type: '', tag: '' };
  let mode = 'drill';

  function statTilesHtml(stats) {
    const sessionLen = mode === 'srs'
      ? stats.sessionLength
      : Math.min(applyFilters(allCards, filters).length, 15);
    return `
      <div class="stat-tiles">
        <div class="stat-tile"><span class="stat-val">${stats.attempted}/${stats.total}</span><span class="stat-label">Attempted</span></div>
        <div class="stat-tile"><span class="stat-val">${stats.mastered}</span><span class="stat-label">Mastered</span></div>
        <div class="stat-tile"><span class="stat-val">${stats.dueToday}</span><span class="stat-label">Due Today</span></div>
        <div class="stat-tile"><span class="stat-val">${sessionLen}</span><span class="stat-label">Session</span></div>
      </div>`;
  }

  function render() {
    const filtered = applyFilters(allCards, filters);
    const stats = computeStats(filtered, progressMap);
    const hasDue = mode === 'srs' ? stats.dueToday > 0 : filtered.length > 0;
    const startLabel = hasDue
      ? 'Start Session'
      : mode === 'srs' ? 'Nothing due today' : 'No cards match filters';

    root().innerHTML = `
      <div class="screen">
        <header class="app-header">
          <h1 class="app-title">JS Drill</h1>
          <p class="app-subtitle">Spaced repetition for JavaScript concepts</p>
        </header>

        <div class="mode-toggle">
          <button class="mode-btn ${mode === 'drill' ? 'active' : ''}" data-mode="drill">Drill</button>
          <button class="mode-btn ${mode === 'srs' ? 'active' : ''}" data-mode="srs">SRS</button>
        </div>
        <p class="mode-desc">
          ${mode === 'drill'
            ? 'Drill through a filtered set — up to 15 cards, missed cards cycle back.'
            : 'Review only cards due today — sessions get shorter as you improve.'}
        </p>

        <div class="filters">
          <select id="f-topic" class="filter-select">
            <option value="">All Topics</option>
            ${topics.map(t => `<option value="${esc(t)}"${filters.topic === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
          <select id="f-difficulty" class="filter-select">
            <option value="">All Difficulties</option>
            ${['easy','medium','hard'].map(d => `<option value="${d}"${filters.difficulty === d ? ' selected' : ''}>${d}</option>`).join('')}
          </select>
          <select id="f-type" class="filter-select">
            <option value="">All Types</option>
            <option value="reveal"${filters.type === 'reveal' ? ' selected' : ''}>Reveal</option>
            <option value="multiple-choice"${filters.type === 'multiple-choice' ? ' selected' : ''}>Multiple Choice</option>
          </select>
          <select id="f-tag" class="filter-select">
            <option value="">All Tags</option>
            ${tags.map(t => `<option value="${esc(t)}"${filters.tag === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
        </div>

        ${statTilesHtml(stats)}

        <button id="start-btn" class="btn-primary"${hasDue ? '' : ' disabled'}>${esc(startLabel)}</button>
        <button id="reset-btn" class="btn-reset">Reset all progress</button>
      </div>`;

    document.querySelectorAll('.mode-btn').forEach(btn =>
      btn.addEventListener('click', () => { mode = btn.dataset.mode; render(); })
    );
    const filterIds = { 'f-topic': 'topic', 'f-difficulty': 'difficulty', 'f-type': 'type', 'f-tag': 'tag' };
    for (const [id, key] of Object.entries(filterIds)) {
      document.getElementById(id)?.addEventListener('change', e => { filters[key] = e.target.value; render(); });
    }
    document.getElementById('start-btn')?.addEventListener('click', () => {
      if (hasDue) onStart(mode, { ...filters });
    });
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) onReset();
    });
  }

  render();
}

// ── Reveal: question ──────────────────────────────────────────────────────────

export function renderRevealQuestion(card, { remaining }, onShowAnswer, onExit) {
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card)}
        <p class="question-text">${esc(card.question)}</p>
      </div>
      <button id="show-btn" class="btn-show-answer">Show Answer</button>
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.getElementById('show-btn')?.addEventListener('click', onShowAnswer);
}

// ── Reveal: answer + self-grade ───────────────────────────────────────────────

export function renderRevealAnswer(card, { remaining }, onGrade, onExit) {
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card)}
        <p class="question-text">${esc(card.question)}</p>
        <div class="answer-section">
          <p class="answer-label">Answer</p>
          <p class="answer-text">${esc(card.answer)}</p>
          <p class="explanation-text">${esc(card.explanation)}</p>
        </div>
      </div>
      <div class="grade-buttons">
        <button id="btn-got" class="btn-got-it">Got it ✓</button>
        <button id="btn-miss" class="btn-missed">Missed it ✗</button>
      </div>
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.getElementById('btn-got')?.addEventListener('click', () => onGrade(true));
  document.getElementById('btn-miss')?.addEventListener('click', () => onGrade(false));
}

// ── MCQ: question + options ───────────────────────────────────────────────────

export function renderMCQQuestion(card, { remaining }, onPick, onExit) {
  const shuffled = shuffleCopy(card.options);
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card)}
        <p class="question-text">${esc(card.question)}</p>
        <ul class="options-list">
          ${shuffled.map((opt, i) =>
            `<li><button class="option-btn" data-idx="${i}">${esc(opt)}</button></li>`
          ).join('')}
        </ul>
      </div>
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => onPick(shuffled[i], shuffled));
  });
}

// ── MCQ: answered (highlight result) ─────────────────────────────────────────

export function renderMCQAnswered(card, { remaining }, pickedOption, shuffledOptions, onNext, onExit) {
  const shuffled = shuffledOptions;
  const isCorrect = pickedOption === card.answer;

  const optionsHtml = shuffled.map(opt => {
    let cls = 'option-btn';
    if (opt === card.answer) cls += ' correct';
    else if (opt === pickedOption) cls += ' wrong';
    return `<li><button class="${cls}" disabled>${esc(opt)}</button></li>`;
  }).join('');

  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card)}
        <p class="question-text">${esc(card.question)}</p>
        <ul class="options-list">${optionsHtml}</ul>
        <div class="answer-section">
          <p class="answer-label">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
          <p class="explanation-text">${esc(card.explanation)}</p>
        </div>
      </div>
      <button id="next-btn" class="btn-next">Next →</button>
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.getElementById('next-btn')?.addEventListener('click', onNext);
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function renderSummary({ reviewed, correct }, { onAgain, onHome }) {
  const pct = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  const icon = pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪';
  root().innerHTML = `
    <div class="screen">
      <div class="summary">
        <div class="summary-icon">${icon}</div>
        <h2 class="summary-title">Session complete!</h2>
        <div class="summary-stats">
          <div class="summary-stat"><span class="summary-stat-val">${reviewed}</span><span class="summary-stat-label">Reviewed</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${correct}</span><span class="summary-stat-label">Got it</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${pct}%</span><span class="summary-stat-label">Accuracy</span></div>
        </div>
        <button id="again-btn" class="btn-primary">Drill Again</button>
        <button id="home-btn" class="btn-secondary">Back to Home</button>
      </div>
    </div>`;
  document.getElementById('again-btn')?.addEventListener('click', onAgain);
  document.getElementById('home-btn')?.addEventListener('click', onHome);
}

// ── Nothing due ───────────────────────────────────────────────────────────────

export function renderNothingDue({ nextDueDate, learned, total }, onHome) {
  root().innerHTML = `
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">🎉</div>
        <h2>Nothing due today!</h2>
        <p>You're all caught up. Come back later to review more cards.</p>
        ${nextDueDate ? `<p class="next-due">Next review: <strong>${esc(nextDueDate)}</strong></p>` : ''}
        <p style="margin-top:12px">${learned} / ${total} cards learned</p>
        <button id="home-btn" class="btn-primary" style="margin-top:32px">Back to Home</button>
      </div>
    </div>`;
  document.getElementById('home-btn')?.addEventListener('click', onHome);
}
