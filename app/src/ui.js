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

function phaseBadge({ phase, streak, interval }) {
  if (phase === 'learning') {
    return `<span class="badge badge-learning">Learning · ${streak}/2</span>`;
  }
  return `<span class="badge badge-review">Review · ${interval}d</span>`;
}

function cardMeta(card, cardInfo) {
  return `
    <div class="card-meta">
      <span class="badge">${esc(card.topic)}</span>
      ${diffBadge(card.difficulty)}
      <span class="badge">${getCardType(card) === 'multiple-choice' ? 'MCQ' : 'reveal'}</span>
      ${cardInfo ? phaseBadge(cardInfo) : ''}
    </div>`;
}

function sessionHeader(remaining) {
  return `
    <div class="session-header">
      <button class="exit-btn" id="exit-btn">← Exit</button>
      <span class="progress-label">${remaining} left</span>
    </div>`;
}

function gradeButtons(previews) {
  return `
    <div id="grade-area" class="grade-buttons">
      <button class="btn-hard" data-rating="hard">
        Hard <span class="interval-label">${esc(previews.hard)}</span>
      </button>
      <button class="btn-good" data-rating="good">
        Good <span class="interval-label">${esc(previews.good)}</span>
      </button>
      <button class="btn-easy" data-rating="easy">
        Easy <span class="interval-label">${esc(previews.easy)}</span>
      </button>
    </div>`;
}

function formatNextDue(ts) {
  const diff = ts - Date.now();
  if (diff <= 0) return 'now';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h < 24) return `in ${h}h ${m}m`;
  return `on ${new Date(ts).toLocaleDateString()}`;
}

// ── Start screen ──────────────────────────────────────────────────────────────

export function renderStartScreen(allCards, progressMap, { onStart, onReset }) {
  const topics = [...new Set(allCards.map(c => c.topic))].sort();
  const tags   = [...new Set(allCards.flatMap(c => c.tags ?? []))].sort();

  const filters = { topic: '', difficulty: '', type: '', tag: '' };
  let sessionSize = 20;

  function render() {
    const filtered = applyFilters(allCards, filters);
    const stats = computeStats(filtered, progressMap);
    const hasDue = stats.dueToday > 0;

    let startLabel, startDisabled;
    if (filtered.length === 0) {
      startLabel = 'No cards match filters';
      startDisabled = true;
    } else if (!hasDue) {
      startLabel = 'Nothing due today';
      startDisabled = true;
    } else {
      startLabel = 'Start Session';
      startDisabled = false;
    }

    // Next due hint when blocked
    const nextDueTsFiltered = !hasDue && filtered.length > 0
      ? filtered.map(c => progressMap[c.id]?.nextDue ?? 0).filter(t => t > Date.now()).sort((a,b) => a-b)[0] ?? null
      : null;
    const nextDueHint = nextDueTsFiltered ? `Next review ${formatNextDue(nextDueTsFiltered)}` : '';

    const effectiveSize = sessionSize === Infinity ? Math.min(stats.dueToday, filtered.length) : Math.min(sessionSize, stats.dueToday);

    root().innerHTML = `
      <div class="screen">
        <header class="app-header">
          <h1 class="app-title">JS Drill</h1>
          <p class="app-subtitle">Spaced repetition for JavaScript concepts</p>
        </header>

        <div class="stat-tiles">
          <div class="stat-tile"><span class="stat-val">${stats.attempted}/${stats.total}</span><span class="stat-label">Attempted</span></div>
          <div class="stat-tile"><span class="stat-val">${stats.inLearning}</span><span class="stat-label">Learning</span></div>
          <div class="stat-tile"><span class="stat-val">${stats.mastered}</span><span class="stat-label">Mastered</span></div>
          <div class="stat-tile"><span class="stat-val">${stats.dueToday}</span><span class="stat-label">Due Today</span></div>
        </div>

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

        <p class="size-label">Session size</p>
        <div class="size-toggle">
          <button class="size-btn ${sessionSize === 10 ? 'active' : ''}" data-size="10">10</button>
          <button class="size-btn ${sessionSize === 20 ? 'active' : ''}" data-size="20">20</button>
          <button class="size-btn ${sessionSize === Infinity ? 'active' : ''}" data-size="all">All (${stats.dueToday})</button>
        </div>

        <button id="start-btn" class="btn-primary"${startDisabled ? ' disabled' : ''}>
          ${esc(startLabel)}${!startDisabled ? ` · ${effectiveSize} cards` : ''}
        </button>
        ${nextDueHint ? `<p class="next-due-hint">${esc(nextDueHint)}</p>` : ''}

        <button id="reset-btn" class="btn-reset">Reset all progress</button>
      </div>`;

    document.querySelectorAll('.size-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        sessionSize = btn.dataset.size === 'all' ? Infinity : Number(btn.dataset.size);
        render();
      })
    );
    const filterIds = { 'f-topic': 'topic', 'f-difficulty': 'difficulty', 'f-type': 'type', 'f-tag': 'tag' };
    for (const [id, key] of Object.entries(filterIds)) {
      document.getElementById(id)?.addEventListener('change', e => { filters[key] = e.target.value; render(); });
    }
    document.getElementById('start-btn')?.addEventListener('click', () => {
      if (!startDisabled) onStart({ ...filters }, sessionSize);
    });
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) onReset();
    });
  }

  render();
}

// ── Reveal: question ──────────────────────────────────────────────────────────

export function renderRevealQuestion(card, { remaining, cardInfo }, onShowAnswer, onExit) {
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card, cardInfo)}
        <p class="question-text">${esc(card.question)}</p>
      </div>
      <button id="show-btn" class="btn-show-answer">Show Answer</button>
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.getElementById('show-btn')?.addEventListener('click', onShowAnswer);
}

// ── Reveal: answer + grade ────────────────────────────────────────────────────

export function renderRevealAnswer(card, { remaining, cardInfo, previews }, onGrade, onExit) {
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card, cardInfo)}
        <p class="question-text">${esc(card.question)}</p>
        <div class="answer-section">
          <p class="answer-label">Answer</p>
          <p class="answer-text">${esc(card.answer)}</p>
          <p class="explanation-text">${esc(card.explanation)}</p>
        </div>
      </div>
      ${gradeButtons(previews)}
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.querySelectorAll('[data-rating]').forEach(btn =>
    btn.addEventListener('click', () => onGrade(btn.dataset.rating))
  );
}

// ── MCQ: question + options ───────────────────────────────────────────────────

export function renderMCQQuestion(card, { remaining, cardInfo }, onPick, onExit) {
  const shuffled = shuffleCopy(card.options);
  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card, cardInfo)}
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

// ── MCQ: answered (highlight result, then Hard/Good/Easy) ─────────────────────

export function renderMCQAnswered(card, { remaining, cardInfo, previews }, pickedOption, shuffledOptions, onRate, onExit) {
  const isCorrect = pickedOption === card.answer;

  const optionsHtml = shuffledOptions.map(opt => {
    let cls = 'option-btn';
    if (opt === card.answer) cls += ' correct';
    else if (opt === pickedOption) cls += ' wrong';
    return `<li><button class="${cls}" disabled>${esc(opt)}</button></li>`;
  }).join('');

  root().innerHTML = `
    <div class="screen">
      ${sessionHeader(remaining)}
      <div class="card">
        ${cardMeta(card, cardInfo)}
        <p class="question-text">${esc(card.question)}</p>
        <ul class="options-list">${optionsHtml}</ul>
        <div class="answer-section">
          <p class="answer-label">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
          <p class="explanation-text">${esc(card.explanation)}</p>
        </div>
      </div>
      ${gradeButtons(previews)}
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.querySelectorAll('[data-rating]').forEach(btn =>
    btn.addEventListener('click', () => onRate(btn.dataset.rating))
  );
}

// ── Grade toast (replaces grade-area for 1.2 s then fires onDone) ─────────────

export function renderGradeToast(message, onDone) {
  const area = document.getElementById('grade-area');
  if (!area) { onDone(); return; }
  area.innerHTML = `<p class="grade-toast">${esc(message)}</p>`;
  setTimeout(onDone, 1200);
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
          <div class="summary-stat"><span class="summary-stat-val">${correct}</span><span class="summary-stat-label">Good/Easy</span></div>
          <div class="summary-stat"><span class="summary-stat-val">${pct}%</span><span class="summary-stat-label">Accuracy</span></div>
        </div>
        <button id="again-btn" class="btn-primary">Study Again</button>
        <button id="home-btn" class="btn-secondary">Back to Home</button>
      </div>
    </div>`;
  document.getElementById('again-btn')?.addEventListener('click', onAgain);
  document.getElementById('home-btn')?.addEventListener('click', onHome);
}

// ── Nothing due ───────────────────────────────────────────────────────────────

export function renderNothingDue({ nextDueTs, mastered, total }, onHome) {
  const nextStr = nextDueTs ? formatNextDue(nextDueTs) : null;
  root().innerHTML = `
    <div class="screen">
      <div class="nothing-due">
        <div class="nothing-due-icon">🎉</div>
        <h2>All caught up!</h2>
        <p>Nothing to review right now.</p>
        ${nextStr ? `<p class="next-due">Next review <strong>${esc(nextStr)}</strong></p>` : ''}
        <p style="margin-top:12px;color:var(--muted)">${mastered} / ${total} cards mastered</p>
        <button id="home-btn" class="btn-primary" style="margin-top:32px">Back to Home</button>
      </div>
    </div>`;
  document.getElementById('home-btn')?.addEventListener('click', onHome);
}
