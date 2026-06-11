import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import { computeStats, getOrCreate } from './srs.js';
import { applyFilters, getCardType } from './session.js';
import { replaceState } from './router.js';

const root = () => document.getElementById('app');

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Renders markdown-style text: fenced code blocks get Prism highlighting,
// inline `code` gets styled, newlines become <br>.
function renderText(str) {
  if (!str) return '';
  const parts = str.split(/(```(?:\w+)?\n[\s\S]*?```)/g);
  return parts.map(part => {
    const m = part.match(/^```(\w+)?\n([\s\S]*?)```$/);
    if (m) {
      const lang = m[1] === 'js' ? 'javascript' : (m[1] || 'javascript');
      const grammar = Prism.languages[lang] ?? Prism.languages.javascript;
      const highlighted = Prism.highlight(m[2], grammar, lang);
      return `<pre class="code-block"><code>${highlighted}</code></pre>`;
    }
    return esc(part)
      .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br>');
  }).join('');
}

// Returns plain text suitable for search previews: strips code fences and backticks.
function plainText(str) {
  if (!str) return '';
  return str
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`\n]+)`/g, '$1');
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

export function renderStartScreen(allCards, progressMap, { onStart, onReset, onTileClick }) {
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
          <div class="stat-tile stat-tile-link" data-filter="attempted"><span class="stat-val">${stats.attempted}/${stats.total}</span><span class="stat-label">Attempted</span></div>
          <div class="stat-tile stat-tile-link" data-filter="learning"><span class="stat-val">${stats.inLearning}</span><span class="stat-label">Learning</span></div>
          <div class="stat-tile stat-tile-link" data-filter="mastered"><span class="stat-val">${stats.mastered}</span><span class="stat-label">Mastered</span></div>
          <div class="stat-tile stat-tile-link" data-filter="due"><span class="stat-val">${stats.dueToday}</span><span class="stat-label">Due Today</span></div>
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
    if (onTileClick) {
      document.querySelectorAll('.stat-tile-link').forEach(tile =>
        tile.addEventListener('click', () => onTileClick(tile.dataset.filter))
      );
    }
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
        <div class="question-text">${renderText(card.question)}</div>
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
        <div class="question-text">${renderText(card.question)}</div>
        <div class="answer-section">
          <p class="answer-label">Answer</p>
          <div class="answer-text">${renderText(card.answer)}</div>
          <div class="explanation-text">${renderText(card.explanation)}</div>
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
        <div class="question-text">${renderText(card.question)}</div>
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
        <div class="question-text">${renderText(card.question)}</div>
        <ul class="options-list">${optionsHtml}</ul>
        <div class="answer-section">
          <p class="answer-label">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
          <div class="explanation-text">${renderText(card.explanation)}</div>
        </div>
      </div>
      ${gradeButtons(previews)}
    </div>`;
  document.getElementById('exit-btn')?.addEventListener('click', onExit);
  document.querySelectorAll('[data-rating]').forEach(btn =>
    btn.addEventListener('click', () => onRate(btn.dataset.rating))
  );
}

// ── Grade toast (replaces grade-area for 3 s then fires onDone) ──────────────

export function renderGradeToast(message, onDone) {
  const area = document.getElementById('grade-area');
  if (!area) { onDone(); return; }
  area.innerHTML = `<p class="grade-toast">${esc(message)}</p>`;
  setTimeout(onDone, 2000);
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

// ── Card library ─────────────────────────────────────────────────────────────

export function renderCardList(allCards, progressMap, { onBack, onCardClick }) {
  const topics = [...new Set(allCards.map(c => c.topic))].sort();
  const now = Date.now();

  function getState(card) { return getOrCreate(card.id, progressMap); }

  function getStatus(card) {
    const s = getState(card);
    if (s.totalSeen === 0) return 'new';
    if (s.phase === 'learning') return 'learning';
    if (s.interval >= 7) return 'mastered';
    return 'review';
  }

  function isDue(card) { return getState(card).nextDue <= now; }

  // Pre-compute counts (unaffected by filter controls — global reference)
  const counts = {
    all: allCards.length,
    new: allCards.filter(c => getStatus(c) === 'new').length,
    learning: allCards.filter(c => getStatus(c) === 'learning').length,
    due: allCards.filter(c => isDue(c)).length,
    mastered: allCards.filter(c => getStatus(c) === 'mastered').length,
  };

  // Read initial filter state from URL — single source of truth
  const params = new URLSearchParams(location.search);
  let statusFilter   = params.get('filter')   ?? 'all';
  let attemptedFilter = params.get('attempted') ?? 'all';
  let topicFilter    = params.get('topic')    ?? '';
  let search         = params.get('q')        ?? '';

  function updateURL() {
    const p = new URLSearchParams();
    if (statusFilter !== 'all')    p.set('filter',    statusFilter);
    if (attemptedFilter !== 'all') p.set('attempted', attemptedFilter);
    if (topicFilter)               p.set('topic',     topicFilter);
    if (search)                    p.set('q',         search);
    const qs = p.toString();
    replaceState('/card-library' + (qs ? '?' + qs : ''));
  }

  function statusBadge(card) {
    const status = getStatus(card);
    const s = getState(card);
    if (status === 'new')      return `<span class="badge badge-lib-new">New</span>`;
    if (status === 'learning') return `<span class="badge badge-learning">Learning</span>`;
    if (status === 'mastered') return `<span class="badge badge-lib-mastered">Mastered</span>`;
    return `<span class="badge badge-review">Review · ${s.interval}d</span>`;
  }

  function matchesFilters(card) {
    const s = getState(card);
    const status = getStatus(card);

    if (statusFilter === 'new'      && status !== 'new')      return false;
    if (statusFilter === 'learning' && status !== 'learning') return false;
    if (statusFilter === 'mastered' && status !== 'mastered') return false;
    if (statusFilter === 'due'      && !isDue(card))          return false;

    if (attemptedFilter === 'attempted'     && s.lastReviewed == null) return false;
    if (attemptedFilter === 'not-attempted' && s.lastReviewed != null) return false;

    if (topicFilter && card.topic !== topicFilter) return false;
    if (search && !card.question.toLowerCase().includes(search.toLowerCase())) return false;

    return true;
  }

  function render() {
    const filtered = allCards.filter(matchesFilters);

    const chips = [
      ['all',      `All (${counts.all})`],
      ['new',      `New (${counts.new})`],
      ['learning', `Learning (${counts.learning})`],
      ['due',      `Due (${counts.due})`],
      ['mastered', `Mastered (${counts.mastered})`],
    ];

    root().innerHTML = `
      <div class="screen">
        <div class="lib-header">
          <button class="exit-btn" id="back-btn">← Back</button>
          <span class="lib-title">Card Library</span>
          <span class="lib-count">${filtered.length} cards</span>
        </div>

        <div class="lib-filters">
          <div class="lib-chips">
            ${chips.map(([val, label]) =>
              `<button class="chip${statusFilter === val ? ' active' : ''}" data-status="${val}">${esc(label)}</button>`
            ).join('')}
          </div>
          <div class="lib-controls">
            <input id="lib-search" class="search-box" type="text" placeholder="Search questions…" value="${esc(search)}">
            <select id="lib-topic" class="filter-select">
              <option value="">All Topics</option>
              ${topics.map(t => `<option value="${esc(t)}"${topicFilter === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}
            </select>
            <select id="lib-attempted" class="filter-select">
              <option value="all"${attemptedFilter === 'all' ? ' selected' : ''}>All</option>
              <option value="attempted"${attemptedFilter === 'attempted' ? ' selected' : ''}>Attempted</option>
              <option value="not-attempted"${attemptedFilter === 'not-attempted' ? ' selected' : ''}>Not attempted</option>
            </select>
          </div>
        </div>

        ${filtered.length === 0
          ? `<p class="lib-empty">No cards match the current filters.</p>`
          : `<div class="lib-table-wrap">
              <table class="lib-table">
                <thead>
                  <tr>
                    <th class="col-q">Question</th>
                    <th class="col-topic">Topic</th>
                    <th class="col-diff">Difficulty</th>
                    <th class="col-status">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map(card => {
                    const raw = plainText(card.question);
                    const q = raw.length > 80 ? raw.slice(0, 80) + '…' : raw;
                    return `<tr>
                      <td class="col-q">
                        <button class="q-link" data-id="${esc(card.id)}">
                          <span class="q-text">${esc(q)}</span>
                          <span class="q-id">${esc(card.id)}</span>
                        </button>
                      </td>
                      <td class="col-topic"><span class="badge">${esc(card.topic)}</span></td>
                      <td class="col-diff">${diffBadge(card.difficulty)}</td>
                      <td class="col-status">${statusBadge(card)}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>`
        }
      </div>`;

    document.getElementById('back-btn')?.addEventListener('click', onBack);
    document.querySelectorAll('.chip').forEach(btn =>
      btn.addEventListener('click', () => { statusFilter = btn.dataset.status; updateURL(); render(); })
    );
    document.getElementById('lib-search')?.addEventListener('input', e => { search = e.target.value; updateURL(); render(); });
    document.getElementById('lib-topic')?.addEventListener('change', e => { topicFilter = e.target.value; updateURL(); render(); });
    document.getElementById('lib-attempted')?.addEventListener('change', e => { attemptedFilter = e.target.value; updateURL(); render(); });
    if (onCardClick) {
      document.querySelectorAll('.q-link').forEach(btn =>
        btn.addEventListener('click', () => onCardClick(btn.dataset.id))
      );
    }
  }

  render();
}

// ── Card detail ──────────────────────────────────────────────────────────────

export function renderCardDetail(card, progressMap, { onBack }) {
  const s = getOrCreate(card.id, progressMap);
  const type = getCardType(card);
  const tags = (card.tags ?? []).map(t => `<span class="badge">${esc(t)}</span>`).join('');

  function progressSection() {
    if (s.totalSeen === 0) {
      return `<div class="detail-progress-row">
        <span class="badge badge-lib-new">New</span>
        <span class="detail-progress-info">Never studied</span>
      </div>`;
    }
    if (s.phase === 'learning') {
      return `<div class="detail-progress-row">
        <span class="badge badge-learning">Learning</span>
        <span class="detail-progress-info">Seen ${s.totalSeen} time${s.totalSeen !== 1 ? 's' : ''} · in learning phase</span>
      </div>`;
    }
    const isMastered = s.interval >= 7;
    const badge = isMastered
      ? `<span class="badge badge-lib-mastered">Mastered</span>`
      : `<span class="badge badge-review">Review</span>`;
    const nextStr = s.nextDue > Date.now() ? formatNextDue(s.nextDue) : 'due now';
    const lastStr = s.lastReviewed ? new Date(s.lastReviewed).toLocaleDateString() : 'never';
    return `
      <div class="detail-progress-row">
        ${badge}
        <span class="detail-progress-info">Interval: ${s.interval}d · Ease: ${s.ease.toFixed(2)} · Next: ${esc(nextStr)}</span>
      </div>
      <div class="detail-progress-row" style="margin-top:8px">
        <span class="detail-progress-info">Last reviewed: ${lastStr} · Seen ${s.totalSeen} times</span>
      </div>`;
  }

  function answerSection() {
    if (type === 'multiple-choice') {
      const opts = card.options.map(opt => {
        const correct = opt === card.answer;
        return `<li><span class="detail-option${correct ? ' correct' : ''}">${esc(opt)}</span></li>`;
      }).join('');
      return `
        <ul class="detail-options">${opts}</ul>
        <div class="answer-section">
          <p class="answer-label">Explanation</p>
          <div class="explanation-text">${renderText(card.explanation)}</div>
        </div>`;
    }
    return `
      <div class="answer-section">
        <p class="answer-label">Answer</p>
        <div class="answer-text">${renderText(card.answer)}</div>
        <div class="explanation-text">${renderText(card.explanation)}</div>
      </div>`;
  }

  root().innerHTML = `
    <div class="screen">
      <div class="lib-header">
        <button class="exit-btn" id="back-btn">← Back</button>
        <span class="lib-title">Card Detail</span>
      </div>

      <div class="card">
        <div class="card-meta">
          <span class="badge">${esc(card.topic)}</span>
          ${card.subtopic ? `<span class="badge">${esc(card.subtopic)}</span>` : ''}
          ${diffBadge(card.difficulty)}
          <span class="badge">${type === 'multiple-choice' ? 'MCQ' : 'reveal'}</span>
          ${tags}
        </div>
        <div class="question-text">${renderText(card.question)}</div>
        ${answerSection()}
      </div>

      <div class="detail-progress-card">
        <p class="detail-section-label">Progress</p>
        ${progressSection()}
        <p class="q-id" style="margin-top:10px">${esc(card.id)}</p>
      </div>
    </div>`;

  document.getElementById('back-btn')?.addEventListener('click', onBack);
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
