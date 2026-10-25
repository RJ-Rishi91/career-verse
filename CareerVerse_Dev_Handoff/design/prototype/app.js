/*
 * CareerVerse interactive prototype.
 * Vanilla JS, no build step, no backend, no AI. Hash routes:
 *   #/desk  #/call  #/score  #/rewards  #/clients  #/client/<id>
 * The "server" is simulated with a short delay so saving states can be reviewed.
 * Production must replace commit() with a real transactional API call (see docs/09_FRONTEND_SPEC.md).
 */
(function () {
  'use strict';

  const DATA = window.CV_DATA;
  const LOTTIE = window.CV_LOTTIE || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const app = document.getElementById('app');
  const live = document.getElementById('live');

  /* ---------- State ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let game;
  function resetGame() {
    game = {
      player: clone(DATA.player),
      clients: clone(DATA.clients),
      call: null,
      result: null,
      saveState: 'saved',
      clientTab: 'overview',
      toast: null
    };
  }
  resetGame();

  const clientById = (id) => game.clients.find((c) => c.id === id);

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const sign = (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '');
  const clamp = (n) => Math.max(0, Math.min(10, n));

  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seededOrder(n, seed) {
    // Deterministic per career + node: the best reply is not always last.
    let a = hashString(seed);
    const rand = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }

  const ICON = {
    desk: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
    clients: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    inbox: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/>',
    journal: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>',
    flame: '<path d="M12 22c4 0 7-2.8 7-7 0-3.5-2.2-6-4-8-.5 2-1.6 3.2-3 3.5C12.5 7 11 4 8.5 2 8.8 6 5 8.5 5 14c0 4.2 3 8 7 8z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.5h-3a1.8 1.8 0 0 0 0 3.5h4"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>'
  };
  const icon = (name, size = 18, sw = 1.8) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

  const MARK = '<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M4 6.5A4.5 4.5 0 0 1 8.5 2h11A4.5 4.5 0 0 1 24 6.5v9a4.5 4.5 0 0 1-4.5 4.5H12l-5.5 5v-5A4.5 4.5 0 0 1 4 15.5z" fill="#2459E0"/><path d="M9.5 14l4.5-4.5 4.5 4.5" stroke="#FFF" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Portraits (flat vector, 5 expressions) ---------- */
  const MOODS = {
    neutral: { brows: 'M24.5 24.2h5M34.5 24.2h5', mouth: 'M29 34.6q3 1.2 6 0', label: 'calm' },
    worried: { brows: 'M24.5 25l5-1.6M39.5 25l-5-1.6', mouth: 'M29 35.6q3-1.3 6 0', label: 'worried' },
    pleased: { brows: 'M24.5 23.8h5M34.5 23.8h5', mouth: 'M28.2 33.8q3.8 3.4 7.6 0', label: 'pleased' },
    relieved: { brows: 'M24.5 24.2l5-.5M39.5 24.2l-5-.5', mouth: 'M29 34.4q3 2 6 0', label: 'relieved' },
    frustrated: { brows: 'M24.5 23l5 2M39.5 23l-5 2', mouth: 'M29 36.4q3-2.4 6 0', label: 'frustrated' }
  };
  const HAIR = {
    short: { front: 'M21 27c0-9 4.8-14 11-14s11 4.6 11 12.5c-3-3.6-7.4-5-11-5s-8 1.6-11 6.5z', back: '' },
    long: { front: 'M21 28c0-9.5 4.8-15 11-15s11 5.5 11 15c-2.5-4.5-6.5-7-11-7s-8.5 2.5-11 7z', back: 'M19.5 30c0-11 5.5-17.5 12.5-17.5S44.5 19 44.5 30v17h-25z' },
    bun: { front: 'M20.8 28c0-9.8 5-15 11.2-15s11.2 5.2 11.2 15c-2-5-6-7.6-11.2-7.6S22.8 23 20.8 28z', back: 'M28 10a4 4 0 1 0 8 0a4 4 0 1 0-8 0z' }
  };
  const STAGE = { neutral: null, worried: null, pleased: null, relieved: 'mint', frustrated: 'coral' };

  function portrait(c, mood = 'neutral', bg) {
    const a = c.art; const m = MOODS[mood] || MOODS.neutral; const h = HAIR[a.hair];
    const tie = a.tie ? `<path d="M25.5 45.5L32 53l6.5-7.5" fill="#FFFFFF"/><path d="M30.6 49.5h2.8l.8 9.5-2.2 2-2.2-2z" fill="${a.tie}"/>` : `<path d="M26 46l6 6.5 6-6.5" fill="#FFFFFF"/>`;
    return `<svg class="portrait" viewBox="0 0 64 64" role="img" aria-label="${esc(c.name)} looks ${m.label}">
      ${bg ? `<circle cx="32" cy="32" r="32" fill="${bg}"/>` : ''}
      ${h.back ? `<path d="${h.back}" fill="${a.hairColor}"/>` : ''}
      <path d="M7 64c2-12 12.5-18.5 25-18.5S55 52 57 64z" fill="${a.shirt}"/>
      ${tie}
      <rect x="27.5" y="37" width="9" height="10" rx="3" fill="${a.neck}"/>
      <ellipse cx="21.6" cy="29.5" rx="1.6" ry="2.4" fill="${a.skin}"/><ellipse cx="42.4" cy="29.5" rx="1.6" ry="2.4" fill="${a.skin}"/>
      <ellipse cx="32" cy="28" rx="10.5" ry="12" fill="${a.skin}"/>
      <path d="${h.front}" fill="${a.hairColor}"/>
      <path d="${m.brows}" stroke="#1B1F2A" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      <circle cx="28" cy="29" r="1.3" fill="#1B1F2A"/><circle cx="36" cy="29" r="1.3" fill="#1B1F2A"/>
      <path d="${m.mouth}" stroke="#1B1F2A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  window.CV_PORTRAIT = portrait; // used by the asset exporter

  const TINT_BG = { blue: '#DCE8FF', coral: '#FFE3DA', mint: '#D6F3E6', butter: '#FFF0C2' };
  const TINT_INK = { blue: '#1F3F8F', coral: '#8A2E12', mint: '#0D5A3A', butter: '#7A3E00' };
  const STATUS = { ok: ['On track', 'pill--ok'], watch: ['Watch', 'pill--watch'], risk: ['At risk', 'pill--risk'] };
  const statusPill = (s) => `<span class="pill ${STATUS[s][1]}">${STATUS[s][0]}</span>`;
  const avatar = (c, size = 38) => `<span class="avatar avatar--${size}" style="background:${TINT_BG[c.tint]};color:${TINT_INK[c.tint]}">${esc(c.initials)}</span>`;

  /* ---------- Scoring engine (deterministic, configurable) ---------- */
  const C7 = ['clear', 'concise', 'concrete', 'correct', 'coherent', 'complete', 'courteous'];
  const C7_WHY = {
    clear: ['He had to work to follow you', 'Mostly plain; one line was fuzzy', 'Plain words, one idea per sentence'],
    concise: ['Too much padding for a busy client', 'Could lose a sentence', 'No wasted words'],
    concrete: ['No facts, times or owners', 'Some specifics, some vague words', 'Real times and actions'],
    correct: ['Stated something that isn’t true yet', 'Accurate, with a loose phrase', 'Accurate and within your authority'],
    coherent: ['Ideas jumped around', 'Mostly in order', 'Past, present, next, in order'],
    complete: ['Left out the next step', 'Missing a fallback or detail', 'Everything he needed to act'],
    courteous: ['Sounded dismissive', 'Polite but brisk', 'Acknowledged his pressure']
  };
  function computeResult(choices) {
    const R = DATA.rules;
    const avg = {};
    C7.forEach((k) => { avg[k] = choices.reduce((s, ch) => s + ch.option.c7[k], 0) / choices.length; });
    const level = (v) => (v >= R.levelCuts.strong ? 3 : v >= R.levelCuts.good ? 2 : 1);
    const wSum = C7.reduce((s, k) => s + R.c7Weights[k], 0);
    const communication = Math.round(C7.reduce((s, k) => s + avg[k] * R.c7Weights[k], 0) / wSum / 3 * 100);
    let business = Math.round(choices.reduce((s, ch) => s + ch.option.business, 0) / choices.length / 3 * 100);
    const critical = choices.find((ch) => ch.option.critical);
    const recovered = !!choices.find((ch) => ch.option.recovery);
    const capped = !!critical && business > R.criticalBusinessCap;
    if (critical) business = Math.min(business, R.criticalBusinessCap);
    const perf = (communication + business) / 200;
    const xp = R.xpBase + Math.round(R.xpPerformanceMax * perf);
    const coins = R.coinsBase + Math.round(R.coinsPerformanceMax * business / 100);
    const b = R.badges.straightShooter;
    const badge = !critical && avg.correct >= b.requires.correct && avg.concrete >= b.requires.concrete;
    const rank = (ch) => ch.option.business + C7.reduce((s, k) => s + ch.option.c7[k], 0) / 7;
    const sorted = choices.slice().sort((x, y) => rank(y) - rank(x));
    const best = sorted[0].option; const worst = sorted[sorted.length - 1].option;
    const totals = { trust: 0, respect: 0, anger: 0 };
    choices.forEach((ch) => Object.keys(totals).forEach((k) => { totals[k] += ch.option.effects[k]; }));
    const c7rows = C7.map((k) => ({ key: k, name: k[0].toUpperCase() + k.slice(1), lvl: level(avg[k]), why: C7_WHY[k][level(avg[k]) - 1] }));
    let headline = 'A straight answer and a real plan.';
    if (critical && recovered) headline = 'You caught your own mistake. It still counts.';
    else if (critical) headline = 'A promise you couldn’t keep.';
    else if (business < 70) headline = 'Honest, but he needed a plan.';
    return {
      communication, business, critical: critical ? critical.option : null, recovered, capped, xp, coins, badge,
      c7rows, totals, coach: { worked: best.coach.worked, next: worst.coach.next, why: (critical ? critical.option : worst).coach.why },
      headline
    };
  }

  /* ---------- Lottie ---------- */
  let anims = [];
  function mountLotties(root) {
    anims.forEach((a) => a.destroy()); anims = [];
    if (!window.lottie) return;
    root.querySelectorAll('[data-lottie]').forEach((el) => {
      const name = el.dataset.lottie; const data = LOTTIE[name]; if (!data) return;
      const loop = el.dataset.loop === 'true';
      const a = window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: loop && !reduceMotion, autoplay: !reduceMotion, animationData: data, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
      if (reduceMotion) a.addEventListener('DOMLoaded', () => a.goToAndStop(loop ? 0 : data.op - 1, true));
      if (el.dataset.delay && !reduceMotion) { a.pause(); setTimeout(() => a.play(), Number(el.dataset.delay)); }
      anims.push(a);
    });
  }

  /* ---------- Shell ---------- */
  function sidebar(active) {
    const p = game.player;
    const link = (href, name, label, extra = '') => `<a href="${href}" ${active === name ? 'aria-current="page"' : ''}>${icon(name, 16, 1.6)}<span>${label}</span>${extra}</a>`;
    return `<aside class="sidebar" aria-label="Main navigation">
      <div class="sidebar__brand">${MARK}<span>CareerVerse</span></div>
      <nav class="sidebar__nav">
        ${link('#/desk', 'desk', 'Desk')}
        ${link('#/clients', 'clients', 'Clients')}
        ${link('#/desk', 'inbox', 'Inbox', `<span class="count">${DATA.inbox.length}</span>`)}
        ${link('#/desk', 'journal', 'Journal')}
      </nav>
      <div class="sidebar__player">${`<span class="avatar avatar--32" style="background:#E3E8F5;color:#1F3F8F">${p.initials}</span>`}<span><b>${esc(p.name)}</b><span>${esc(p.role)} · Level ${p.level}</span></span></div>
    </aside>`;
  }
  function brandBar() {
    const p = game.player;
    return `<header class="bar bar--brand">
      <div class="bar__brand">${MARK}<span>CareerVerse</span></div>
      <div class="bar__stats">
        <span class="bar__stat num" aria-label="${p.streak} day streak">${icon('flame', 16, 1.6)}${p.streak} days</span>
        <span class="bar__stat num" aria-label="${p.coins} coins">${icon('coin', 16, 1.6)}${p.coins}</span>
        <span class="avatar avatar--32" style="background:#E3E8F5;color:#1F3F8F">${p.initials}</span>
      </div>
    </header>`;
  }
  function viewBar({ backHref, backLabel, backIcon = 'back', title, sub, save = false }) {
    const saveHtml = !save ? '' : game.saveState === 'saving'
      ? `<span class="save-state" role="status"><span class="save-state__dots" data-lottie="saving-dots" data-loop="true"></span>Saving…</span>`
      : `<span class="save-state" role="status"><span class="save-state__dot"></span>Saved</span>`;
    return `<header class="bar">
      <a class="icon-btn" href="${backHref}" aria-label="${esc(backLabel)}">${icon(backIcon)}</a>
      <div class="bar__title"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>
      ${saveHtml}
    </header>`;
  }
  function bottomNav(active) {
    const link = (href, name, label) => `<a href="${href}" ${active === name ? 'aria-current="page"' : ''}>${icon(name, 20, 1.6)}${label}</a>`;
    return `<nav class="bottomnav" aria-label="Main">${link('#/desk', 'desk', 'Desk')}${link('#/clients', 'clients', 'Clients')}${link('#/desk', 'inbox', 'Inbox · ' + DATA.inbox.length)}${link('#/desk', 'journal', 'Journal')}</nav>`;
  }

  /* ---------- Views ---------- */
  function viewDesk() {
    const p = game.player; const sc = DATA.scenario; const marcus = clientById('marcus');
    const marcusDone = !!game.result;
    const inCall = !!game.call;
    let hello = `Morning, ${p.name.split(' ')[0]}.<br>Marcus needs his COI by 3:00&#8239;PM.`;
    if (marcusDone) hello = game.result.critical && !game.result.recovered
      ? `Marcus is expecting that certificate by 2.<br>Better check with the carrier.`
      : `Nice work, ${p.name.split(' ')[0]}.<br>Dana is next with her renewal.`;
    const callsLeft = p.callsTotal - p.callsDone;
    const xpPct = Math.min(100, Math.round(p.xp / p.xpToNext * 100));
    const gates = [
      { name: 'Calls complete', val: `${p.callsDone} of ${p.callsTotal}`, met: p.callsDone >= p.callsTotal },
      { name: 'XP threshold', val: `${p.xp} of ${p.xpToNext}`, met: p.xp >= p.xpToNext },
      { name: 'Portfolio health', val: p.portfolio, met: p.portfolio === 'Good' },
      { name: 'Boss review', val: 'Locked', met: false }
    ];
    const dana = clientById('dana');
    const next = marcusDone
      ? `<section class="next desk__next tint-coral" aria-label="Next call">
          <div class="next__top"><div class="next__portrait">${portrait(dana, 'neutral', '#FFFFFF')}</div></div>
          <div class="next__body">
            <div class="next__kicker t-ink">Next call · Instruction · Dana Whitfield, Whitfield Insurance Group</div>
            <h2 class="next__title">Dana is nervous about a renewal</h2>
            <p class="next__teaser t-ink">The premium may rise again. She needs to know what you can find out, and by when.</p>
            <div class="next__foot"><button class="btn btn--primary" type="button" disabled>Take the call</button><span class="meta t-ink">This call isn’t in the prototype yet.</span></div>
          </div>
        </section>`
      : `<section class="next desk__next tint-blue" aria-label="Next call">
          <div class="next__top"><div class="next__portrait"><div class="next__pulse" data-lottie="call-pulse" data-loop="true"></div>${portrait(marcus, 'worried', '#FFFFFF')}</div></div>
          <div class="next__body">
            <div class="next__kicker t-ink">Next call · ${esc(sc.type)} · ${esc(marcus.name)}, ${esc(marcus.company)} <span class="pill pill--watch" style="margin-left:6px">${esc(sc.due)}</span></div>
            <h2 class="next__title">${esc(sc.title)}</h2>
            <p class="next__teaser t-ink">${esc(sc.teaser)}</p>
            <div class="next__foot"><a class="btn btn--primary" href="#/call" data-action="start-call">${inCall ? 'Resume the call' : 'Take the call'} ${icon('arrow', 16, 2)}</a><span class="meta t-ink">+${DATA.rules.xpBase} XP base · skills: ${sc.skills.join(', ')}</span></div>
          </div>
        </section>`;
    const today = [
      { kind: 'Call', title: marcusDone ? 'Call Marcus with a firm time' : 'Status update with Marcus Bell', sub: marcusDone ? 'You promised this on the call' : 'COI for the Riverside job', pill: marcusDone ? ['1:30 PM', 'pill--watch'] : ['Due 3:00 PM', 'pill--watch'] },
      ...DATA.inbox.map((m) => ({ kind: 'Email', title: m.from + ': ' + m.title.toLowerCase(), sub: m.sub, pill: ['New', 'pill--neutral'] }))
    ];
    const body = `<div class="desk view-enter">
      <div class="desk__hello"><h1 class="h-display">${hello}</h1><p class="h-sub">Monday · Level ${p.level}, ${esc(p.levelTitle)} · ${callsLeft} calls left this level</p></div>
      <section class="kpis desk__kpis" aria-label="Your numbers">
        <div class="kpi"><div class="kpi__label">XP to Level ${p.level + 1}</div><div class="kpi__value">${p.xp}<small> /${p.xpToNext}</small></div><div class="bar-track" style="margin-top:10px;height:6px"><div class="bar-fill" style="width:${xpPct}%"></div></div></div>
        <div class="kpi"><div class="kpi__label">Calls this level</div><div class="kpi__value">${p.callsDone}<small> /${p.callsTotal}</small></div><div class="kpi__note">${callsLeft} left across 3 clients</div></div>
        <div class="kpi"><div class="kpi__label">Portfolio health</div><div class="kpi__value">${esc(p.portfolio)}</div><div class="kpi__note">${game.clients.filter((c) => c.status !== 'ok').length} client needs attention</div></div>
        <div class="kpi"><div class="kpi__label">Streak</div><div class="kpi__value">${p.streak}<small> days</small></div><div class="kpi__note">${p.freezes} freeze available</div></div>
      </section>
      ${next}
      <section class="panel desk__clients" aria-label="Your clients">
        <div class="panel__head"><h2 class="panel__title">Your clients <span class="count">${game.clients.length}</span></h2><a class="panel__link" href="#/clients">View all</a></div>
        ${game.clients.map((c) => `<a class="row" href="#/client/${c.id}">${avatar(c)}<span class="row__body"><b>${esc(c.name)}</b><span>${esc(c.company)} · ${esc(c.next)}</span></span><span class="row__meta num">Trust ${c.meters.trust}</span>${statusPill(c.status)}</a>`).join('')}
      </section>
      <section class="panel desk__gates" aria-label="Level review">
        <h2 class="panel__title" style="margin-bottom:6px">Level ${p.level} review</h2>
        ${gates.map((g) => `<div class="gate"><span class="gate__dot ${g.met ? 'is-met' : ''}">${g.met ? icon('check', 11, 3) : ''}</span><span class="gate__name">${g.name}</span><span class="gate__val">${esc(g.val)}</span></div>`).join('')}
        <p class="muted" style="margin:6px 0 0;font-size:12px;line-height:1.45">XP alone never promotes. Every gate must be met.</p>
      </section>
      <section class="panel desk__today" aria-label="Today">
        <div class="panel__head"><h2 class="panel__title">Today <span class="count">${today.length}</span></h2><span class="panel__link">Tasks and inbox</span></div>
        ${today.map((t) => `<div class="row"><span class="row__meta" style="width:44px;font-size:12px">${t.kind}</span><span class="row__body"><b>${esc(t.title)}</b><span>${esc(t.sub)}</span></span><span class="pill ${t.pill[1]}">${esc(t.pill[0])}</span></div>`).join('')}
      </section>
    </div>`;
    return { route: 'desk', sidebar: 'desk', bar: brandBar(), body, nav: 'desk' };
  }

  function startCall() {
    if (game.call || game.result) return;
    const sc = DATA.scenario; const c = clientById(sc.clientId);
    game.call = { nodeId: sc.start, idx: 0, phase: 'choose', choices: [], meters: { ...c.meters }, lastDelta: null, order: seededOrder(sc.nodes[sc.start].options.length, game.player.careerSeed + ':' + sc.start), mood: 'worried' };
  }

  function viewCall() {
    const sc = DATA.scenario; const c = clientById(sc.clientId);
    if (game.result && !game.call) { location.hash = '#/score'; return null; }
    if (!game.call) startCall();
    const st = game.call; const node = sc.nodes[st.nodeId];
    const n = node.options.length;
    const opt = node.options[st.order[st.idx]];
    const lastChoice = st.choices[st.choices.length - 1];
    const reacted = st.phase === 'reacted';
    const saving = st.phase === 'saving';
    const shownOpt = reacted ? lastChoice.option : opt;
    const tint = STAGE[st.mood] || c.tint;
    const meterDefs = [['trust', 'Trust', 'var(--accent)', true], ['respect', 'Respect', 'var(--ink)', true], ['anger', 'Anger', 'var(--anger)', false]];
    const meters = meterDefs.map(([k, label, color, goodUp]) => {
      const d = reacted ? lastChoice.option.effects[k] : 0;
      const good = goodUp ? d > 0 : d < 0;
      return `<div class="meter"><div class="meter__top"><span>${label}</span><span class="meter__val"><span class="meter__delta ${good ? 'up' : 'down'}">${sign(d)}</span> <b>${st.meters[k]}</b>/10</span></div><div class="bar-track"><div class="bar-fill" style="width:${st.meters[k] * 10}%;background:${color}"></div></div></div>`;
    }).join('');
    const known = sc.known.map((k) => `<div><span>${esc(k.time)}</span><span>${esc(k.text)}</span></div>`).join('');
    const isLast = st.idx === n - 1;
    let panel;
    if (reacted) {
      const deltas = meterDefs.filter(([k]) => lastChoice.option.effects[k] !== 0).map(([k, label, , goodUp]) => {
        const v = lastChoice.option.effects[k]; const good = goodUp ? v > 0 : v < 0;
        return `<span class="pill ${good ? 'pill--ok' : 'pill--risk'}">${label} ${sign(v)}</span>`;
      }).join('');
      const end = lastChoice.option.next === 'end';
      panel = `<div class="choice">
        <div class="muted" style="font-size:12px">You said</div>
        <p class="choice__said">“${esc(lastChoice.option.text)}”</p>
        <div class="deltas">${deltas}</div>
        <button class="btn btn--primary btn--block" type="button" data-action="continue">${end ? 'See how you did' : 'Continue the call'} ${icon('arrow', 16, 2)}</button>
      </div>`;
    } else if (saving) {
      panel = `<div class="choice" aria-busy="true">
        <div class="notice"><span style="width:30px;height:10px" data-lottie="saving-dots" data-loop="true"></span>Saving your reply. Choices are paused until the server confirms.</div>
        <p class="choice__said">“${esc(opt.text)}”</p>
      </div>`;
    } else {
      panel = `<div class="choice">
        <div class="choice__head"><span>Your reply · option <b>${st.idx + 1}</b> of ${n}</span><span class="pips" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span class="pip ${i < st.idx ? 'is-past' : i === st.idx ? 'is-now' : ''}"></span>`).join('')}</span></div>
        <p class="choice__text">“${esc(opt.text)}”</p>
        <div class="choice__actions">
          <p class="choice__hint">${isLast ? 'You’ve passed the other replies. This is the one you have left.' : 'Skipped replies don’t come back.'}</p>
          <button class="btn btn--secondary" type="button" data-action="next-option" ${isLast ? 'disabled' : ''}>${isLast ? 'Last option' : 'Next option'}</button>
          <button class="btn btn--primary" type="button" data-action="say">Say this</button>
        </div>
      </div>`;
    }
    const sheet = st.phase === 'confirm' ? `<div class="scrim" data-action="not-yet-scrim">
        <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="lock-title">
          <div class="sheet__handle"></div>
          <h2 class="sheet__title" id="lock-title">Say this to ${esc(c.name.split(' ')[0])}?</h2>
          <p class="sheet__quote">“${esc(opt.text)}”</p>
          <p class="sheet__warn">This reply will shape his trust, the deadline and your career record. <b>Once it’s said, it can’t be taken back.</b></p>
          <div class="sheet__actions"><button class="btn btn--secondary" type="button" data-action="not-yet">Not yet</button><button class="btn btn--primary" type="button" data-action="lock" data-autofocus>Lock it in</button></div>
        </div>
      </div>` : '';
    const decisionNo = st.choices.length + (reacted ? 0 : 1);
    const body = `<div class="call">
      <details class="brief-m"><summary>Call brief ${icon('chevron', 16)}</summary><div class="brief-m__body"><div>${esc(sc.goal)}</div><div class="known">${known}</div></div></details>
      <aside class="call__brief" aria-label="Call brief">
        <section class="panel"><div style="display:flex;align-items:center;gap:12px">${avatar(c, 44)}<span><b style="display:block;font-size:15px">${esc(c.name)}</b><span class="muted" style="font-size:12px">${esc(c.role.split(',')[0])}</span></span></div>
          <div class="muted" style="font-size:13px;margin-top:4px">Call goal</div><div style="font-size:15px;line-height:1.45">${esc(sc.goal)}</div></section>
        <section class="panel"><h2 class="panel__title">What you know</h2><div class="known">${known}</div></section>
        <section class="panel panel--white"><div class="muted" style="font-size:12px">How he likes to be told</div><div style="font-size:15px;line-height:1.45">${esc(c.prefs.slice(0, 2).join('. '))}.</div></section>
      </aside>
      <div class="stage tint-${tint}">${portrait(c, st.mood)}<div class="stage__meters">${meters}</div></div>
      <div class="line"><div class="line__who">${esc(c.name.split(' ')[0])}</div><p class="line__text">${esc(reacted ? lastChoice.option.reaction : node.line)}</p></div>
      ${panel}
      <aside class="call__side" aria-label="Relationship">
        <section class="panel" style="gap:16px"><h2 class="panel__title">Relationship</h2>${meters}</section>
        <section class="panel"><h2 class="panel__title">Call progress</h2><div class="num" style="font-size:14px">Decision ${decisionNo} of 2</div><div class="muted" style="font-size:13px;line-height:1.5">Each reply you say is final. Skipped replies don’t come back.</div></section>
      </aside>
    </div>${sheet}`;
    return { route: 'call', sidebar: null, bar: viewBar({ backHref: '#/desk', backLabel: 'Pause and return to desk (your progress is kept)', backIcon: 'pause', title: c.name, sub: sc.type + ' · ' + c.company, save: true }), body, nav: null };
  }

  function finishCall() {
    const st = game.call; const sc = DATA.scenario; const c = clientById(sc.clientId); const p = game.player;
    const r = computeResult(st.choices);
    game.result = r;
    c.meters = { ...st.meters };
    c.status = r.critical && !r.recovered ? 'risk' : 'watch';
    c.next = r.critical && !r.recovered ? 'Promised the COI by 2:00 PM' : 'Call back by 1:30 PM';
    c.cycle[1].done = true; c.cycle[1].current = false; c.cycle[2].current = true;
    c.history.unshift({ when: 'Today', kind: 'Call', title: 'Status update: ' + (r.critical ? (r.recovered ? 'overpromised, then corrected' : 'promised the certificate') : 'an honest timeline'), detail: '“' + st.choices[0].option.text + '”' });
    p.prevXp = p.xp; p.xp += r.xp; p.coins += r.coins; p.callsDone += 1; p.streak += 1;
    if (r.critical && !r.recovered) p.portfolio = 'Fair';
    game.call = null;
  }

  function viewScore() {
    const r = game.result; const sc = DATA.scenario; const c = clientById(sc.clientId);
    if (!r) { location.hash = '#/desk'; return null; }
    const lvlPill = (l) => l === 3 ? '<span class="pill pill--ok">Strong</span>' : l === 2 ? '<span class="pill pill--neutral">Good</span>' : '<span class="pill pill--watch">Needs work</span>';
    const deltaCell = (k, label, goodUp) => { const v = r.totals[k]; const good = goodUp ? v > 0 : v < 0; return `<div><div class="muted" style="font-size:12px">${label}</div><div class="split3__v">${c.meters[k]} <small class="${v === 0 ? 'muted' : good ? 'up' : 'down'}">${sign(v)}</small></div></div>`; };
    const body = `<div class="score view-enter">
      <div class="score__hello"><div class="muted" style="font-size:13px">${esc(c.name)} · ${esc(sc.type)}</div><h1 class="h-display" style="margin-top:6px">${esc(r.headline)}</h1></div>
      <div class="score__main">
        <section class="split" aria-label="Scores">
          <div><div class="muted" style="font-size:13px">Communication</div><div class="split__big">${r.communication}<small> /100</small></div><div class="muted" style="font-size:12px">The 7Cs, tone, grammar</div></div>
          <div><div class="muted" style="font-size:13px">Business</div><div class="split__big">${r.business}<small> /100</small></div><div class="muted" style="font-size:12px">${r.capped ? 'Capped: critical mistake' : 'Accuracy, authority, outcome'}</div></div>
        </section>
        ${r.critical ? `<div class="incident">${icon('alert', 18)}<span><b>Critical mistake: promised beyond your authority.</b> A critical mistake caps the business score at ${DATA.rules.criticalBusinessCap}, however good the words. ${r.recovered ? 'You corrected it on the call; the correction is on the record too.' : 'An incident is now on Marcus’s record.'}</span></div>` : ''}
        <section class="panel" aria-label="The 7Cs">
          <div class="panel__head" style="margin-bottom:4px"><h2 class="panel__title">The 7Cs</h2><span class="panel__link">How your replies landed</span></div>
          ${r.c7rows.map((row) => `<div class="c7"><div>${row.name}</div><div class="c7__bar"><div class="c7__segs" aria-hidden="true">${[1, 2, 3].map((i) => `<span class="${i <= row.lvl ? 'on' : ''}"></span>`).join('')}</div><div class="c7__why">${esc(row.why)}</div></div><div class="c7__lvl">${lvlPill(row.lvl)}</div></div>`).join('')}
        </section>
        <section class="panel coach" aria-label="Coach's notes" style="gap:14px">
          <h2 class="panel__title">Coach’s notes</h2>
          <div><div class="coach__k coach__k--ok">What worked</div><p>${esc(r.coach.worked)}</p></div>
          <div><div class="coach__k coach__k--next">Try next time</div><p>${esc(r.coach.next)}</p></div>
          <div><div class="coach__k coach__k--why">Why it mattered</div><p>${esc(r.coach.why)}</p></div>
          <div class="rule-card"><div class="rule-card__k">Rule of thumb</div><div class="rule-card__v">${esc(sc.ruleOfThumb)}</div></div>
        </section>
      </div>
      <div class="score__side">
        <section class="panel tint-blue" aria-label="Account impact">
          <h2 class="panel__title t-ink">${esc(c.name.split(' ')[0])}’s account</h2>
          <div class="split3">${deltaCell('trust', 'Trust', true)}${deltaCell('respect', 'Respect', true)}${deltaCell('anger', 'Anger', false)}</div>
          <div class="t-ink" style="font-size:13px;line-height:1.5">Status: ${statusPill(c.status)} ${c.status === 'risk' ? 'until the promise is resolved.' : 'until the certificate is delivered.'}</div>
        </section>
        <section class="panel"><div class="muted" style="font-size:13px">${DATA.rules.xpBase} base + ${r.xp - DATA.rules.xpBase} performance</div><div class="num" style="font-size:22px">+${r.xp} XP · +${r.coins} coins</div></section>
        <a class="btn btn--primary btn--block" href="#/rewards">Collect rewards</a>
      </div>
    </div>`;
    return { route: 'score', sidebar: null, bar: viewBar({ backHref: '#/desk', backLabel: 'Back to desk', title: 'Call scorecard', sub: c.name }), body, nav: null };
  }

  function viewRewards() {
    const r = game.result; const p = game.player; const dana = clientById('dana');
    if (!r) { location.hash = '#/desk'; return null; }
    const pct = Math.min(100, Math.round(p.xp / p.xpToNext * 100));
    const prevPct = Math.min(100, Math.round((p.prevXp ?? p.xp) / p.xpToNext * 100));
    const badgeSvg = `<svg width="150" height="170" viewBox="0 0 150 170" role="img" aria-label="Straight Shooter badge"><path d="M48 104l-14 58 22-11 14 19 12-62z" fill="#2459E0"/><path d="M102 104l14 58-22-11-14 19-12-62z" fill="#1F3F8F"/><circle cx="75" cy="72" r="62" fill="#FFFFFF" stroke="#14161C" stroke-width="3"/><circle cx="75" cy="72" r="48" fill="#FFD66B"/><circle cx="75" cy="72" r="30" fill="none" stroke="#14161C" stroke-width="4"/><circle cx="75" cy="72" r="14" fill="none" stroke="#14161C" stroke-width="4"/><circle cx="75" cy="72" r="4" fill="#14161C"/><path d="M108 39L79 68M108 39h-11M108 39v11" stroke="#14161C" stroke-width="4" stroke-linecap="round"/></svg>`;
    const hero = r.badge
      ? `<section class="reward-hero tint-butter"><div class="reward-hero__confetti" data-lottie="confetti" data-delay="250"></div><div class="t-ink" style="font-size:13px">New badge</div><div class="reward-hero__badge"><div class="reward-hero__burst" data-lottie="badge-burst"></div>${badgeSvg}</div><h1>Straight Shooter</h1><p class="t-ink">A truthful, specific update under deadline pressure, without promising what wasn’t yours to promise.</p></section>`
      : `<section class="reward-hero" style="background:var(--chrome)"><div class="muted" style="font-size:13px">No badge this time</div><h1>Call complete</h1><p class="muted">Straight Shooter needs Correct and Concrete rated Strong with no critical mistake. It’s still there to earn on a later call.</p></section>`;
    const body = `<div class="rewards view-enter">
      ${hero}
      <section class="panel" style="gap:12px">
        <div class="xp-line"><span class="xp-line__gain"><span class="xp-spark" data-lottie="xp-spark" data-delay="900"></span>+${r.xp} <span class="muted" style="font-size:14px">XP</span></span><span class="muted num" style="font-size:13px"><span style="color:var(--ink)">${p.xp}</span> / ${p.xpToNext} to Level ${p.level + 1}</span></div>
        <div class="bar-track"><div class="bar-fill" id="xpfill" style="width:${reduceMotion ? pct : prevPct}%" data-to="${pct}"></div></div>
        <div class="muted" style="font-size:13px;line-height:1.45">Promotion also needs a healthy portfolio and a passed boss review. XP alone won’t get you there.</div>
        <div class="split3" style="border:1px solid var(--border)"><div><div class="muted" style="font-size:12px">Coins</div><div class="split3__v">${p.coins} <small class="up">+${r.coins}</small></div></div><div><div class="muted" style="font-size:12px">Streak</div><div class="split3__v">${p.streak} <small class="muted">days</small></div></div><div><div class="muted" style="font-size:12px">Calls</div><div class="split3__v">${p.callsDone}<small class="muted"> /${p.callsTotal}</small></div></div></div>
      </section>
      <a class="row tint-coral" href="#/client/dana" style="border:0">${`<span class="avatar avatar--38" style="background:#FFFFFF;color:${TINT_INK.coral}">${dana.initials}</span>`}<span class="row__body"><span class="t-ink">Up next · Instruction call</span><b>Dana is nervous about a renewal</b></span><span class="t-ink">${icon('chevron', 16, 2)}</span></a>
      <a class="btn btn--primary btn--block" href="#/desk">Back to my desk</a>
    </div>`;
    return { route: 'rewards', sidebar: null, bar: viewBar({ backHref: '#/desk', backLabel: 'Back to desk', title: 'Rewards' }), body, nav: null };
  }

  function viewClients(selectedId) {
    const sel = clientById(selectedId) || game.clients[0];
    const isDetail = !!selectedId;
    const tab = game.clientTab;
    const meterRow = (k, label, color, word) => `<div class="meter"><div class="meter__top"><span style="font-size:14px">${label}</span><span class="meter__val"><b>${sel.meters[k]}</b>/10 · ${word}</span></div><div class="bar-track"><div class="bar-fill" style="width:${sel.meters[k] * 10}%;background:${color}"></div></div></div>`;
    const word = (k, v) => k === 'anger' ? (v >= 7 ? 'Hot' : v >= 4 ? 'Tense' : 'Calm') : (v >= 8 ? 'Strong' : v >= 6 ? 'Building' : v >= 4 ? 'Fragile' : 'Low');
    const thoughtOpen = sel.meters.trust >= sel.thought.unlockTrust;
    const overview = `
      <div class="duo">
        <section class="panel" style="gap:14px"><h3 class="panel__title">Relationship</h3>${meterRow('trust', 'Trust', 'var(--accent)', word('trust', sel.meters.trust))}${meterRow('respect', 'Respect', 'var(--ink)', word('respect', sel.meters.respect))}${meterRow('anger', 'Anger', 'var(--anger)', word('anger', sel.meters.anger))}</section>
        <section class="panel panel--white"><div class="muted" style="font-size:12px">What ${esc(sel.name.split(' ')[0])} is thinking · ${thoughtOpen ? 'unlocked at trust ' + sel.thought.unlockTrust : 'unlocks at trust ' + sel.thought.unlockTrust}</div>${thoughtOpen ? `<p class="thought">${esc(sel.thought.text)}</p>` : '<p class="muted" style="margin:0;font-size:15px">Build trust to hear what they don’t say out loud.</p>'}</section>
      </div>
      <section class="panel"><h3 class="panel__title">How ${sel.id === 'marcus' ? 'he' : 'she'} likes to be told</h3><div class="chips">${sel.prefs.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}<span class="chip chip--warn">${esc(sel.trigger)}</span></div></section>
      <section class="panel" style="gap:8px"><div class="panel__head"><h3 class="panel__title">Client cycle</h3><span class="panel__link num">${sel.cycle.filter((x) => x.done).length} of 3 calls</span></div>
        ${sel.cycle.map((x) => `<div class="cycle-row ${x.done ? '' : 'is-next'}"><span class="cycle-row__dot ${x.done ? 'is-done' : ''}">${x.done ? icon('check', 12, 3) : ''}</span><span class="cycle-row__name">${x.name}</span><span class="muted" style="font-size:12px">${x.done ? x.when : x.current ? 'Up next' : x.when}</span></div>`).join('')}
      </section>`;
    const history = `<section class="panel">${sel.history.map((e, i) => `<div class="timeline__item"><div class="timeline__rail"><span class="timeline__dot ${e.kind === 'Call' ? 'is-call' : ''}"></span>${i < sel.history.length - 1 ? '<span class="timeline__line"></span>' : ''}</div><div class="timeline__body"><div class="timeline__meta">${esc(e.when)} · ${esc(e.kind)}</div><div class="timeline__title">${esc(e.title)}</div><div class="timeline__detail">${esc(e.detail)}</div></div></div>`).join('')}<div class="muted" style="font-size:13px;padding-left:32px">This record is permanent. Recovering adds new entries; it never erases old ones.</div></section>`;
    const body = `<div class="clients view-enter">
      <section class="clients__list" aria-label="Client list">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;letter-spacing:-0.01em">Clients <span class="muted" style="font-weight:400">${game.clients.length}</span></h1>
        ${game.clients.map((c) => `<a class="row" href="#/client/${c.id}" ${isDetail && c.id === sel.id ? 'aria-current="true"' : ''}>${avatar(c)}<span class="row__body"><b>${esc(c.name)}</b><span>${esc(c.company)}</span></span>${statusPill(c.status)}</a>`).join('')}
      </section>
      <div class="clients__detail">
        <section class="client-hero tint-${sel.tint}"><div class="client-hero__text"><h2>${esc(sel.name)}</h2><div class="client-hero__role t-ink">${esc(sel.role)}</div><div class="client-hero__pills">${statusPill(sel.status)}<span class="pill pill--white">${esc(sel.importance)}</span></div></div>${portrait(sel, sel.status === 'risk' ? 'frustrated' : 'neutral')}</section>
        <div class="tabs" role="tablist" aria-label="Client sections"><button type="button" role="tab" aria-selected="${tab === 'overview'}" data-action="tab" data-tab="overview">Overview</button><button type="button" role="tab" aria-selected="${tab === 'history'}" data-action="tab" data-tab="history">History</button></div>
        ${tab === 'overview' ? overview : history}
      </div>
    </div>`;
    const bar = isDetail ? viewBar({ backHref: '#/clients', backLabel: 'Back to clients', title: sel.name, sub: sel.company }) : brandBar();
    return { route: isDetail ? 'client' : 'clients', sidebar: 'clients', bar, body, nav: isDetail ? null : 'clients' };
  }

  /* ---------- Router / render ---------- */
  function parseRoute() {
    const h = (location.hash || '#/desk').replace(/^#\/?/, '');
    const [name, param] = h.split('/');
    return { name: name || 'desk', param };
  }
  function render() {
    const { name, param } = parseRoute();
    let v;
    if (name === 'call') v = viewCall();
    else if (name === 'score') v = viewScore();
    else if (name === 'rewards') v = viewRewards();
    else if (name === 'clients') v = viewClients(null);
    else if (name === 'client') v = viewClients(param);
    else v = viewDesk();
    if (!v) return;
    app.className = 'app' + (v.sidebar ? ' has-sidebar' : '');
    app.dataset.route = v.route;
    app.innerHTML = (v.sidebar ? sidebar(v.sidebar) : '') + v.bar + `<main class="main" id="main">${v.body}</main>` + (v.nav ? bottomNav(v.nav) : '') + (game.toast ? `<div class="toast" role="status"><span class="toast__anim" data-lottie="success-check"></span>${esc(game.toast)}</div>` : '');
    mountLotties(app);
    const fill = document.getElementById('xpfill');
    if (fill && !reduceMotion) requestAnimationFrame(() => setTimeout(() => { fill.style.transition = 'width 1100ms var(--ease)'; fill.style.width = fill.dataset.to + '%'; }, 350));
    const af = app.querySelector('[data-autofocus]'); if (af) af.focus();
  }

  function showToast(text) {
    game.toast = text; render();
    clearTimeout(showToast.t); showToast.t = setTimeout(() => { game.toast = null; const t = app.querySelector('.toast'); if (t) t.remove(); }, 1800);
  }

  function focusSay() { const b = app.querySelector('[data-action=say]'); if (b) b.focus(); }

  function commit() {
    const st = game.call; const sc = DATA.scenario; const node = sc.nodes[st.nodeId];
    const opt = node.options[st.order[st.idx]];
    st.phase = 'saving'; game.saveState = 'saving'; render();
    // Simulated server round trip. Production: POST with an idempotency key, then render the server's state.
    setTimeout(() => {
      Object.keys(st.meters).forEach((k) => { st.meters[k] = clamp(st.meters[k] + opt.effects[k]); });
      st.choices.push({ nodeId: st.nodeId, option: opt });
      st.mood = opt.face; st.phase = 'reacted'; game.saveState = 'saved';
      live.textContent = clientById(sc.clientId).name.split(' ')[0] + ' says: ' + opt.reaction;
      showToast('Said, and saved to your career');
    }, 750);
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action],[data-preview]');
    if (!el) return;
    if (el.dataset.preview) {
      document.body.classList.remove('preview-phone', 'preview-desktop');
      if (el.dataset.preview !== 'auto') document.body.classList.add('preview-' + el.dataset.preview);
      document.querySelectorAll('[data-preview]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      render(); return;
    }
    const st = game.call; const sc = DATA.scenario;
    switch (el.dataset.action) {
      case 'start-call': startCall(); break;
      case 'next-option': { const n = sc.nodes[st.nodeId].options.length; if (st.idx < n - 1) { st.idx += 1; render(); } break; }
      case 'say': if (sc.nodes[st.nodeId].consequential) { st.phase = 'confirm'; render(); } else commit(); break;
      case 'not-yet': st.phase = 'choose'; render(); focusSay(); break;
      case 'not-yet-scrim': if (e.target === el) { st.phase = 'choose'; render(); focusSay(); } break;
      case 'lock': commit(); break;
      case 'continue': {
        const last = st.choices[st.choices.length - 1].option;
        if (last.next === 'end') { finishCall(); location.hash = '#/score'; }
        else { st.nodeId = last.next; st.idx = 0; st.phase = 'choose'; st.order = seededOrder(sc.nodes[last.next].options.length, game.player.careerSeed + ':' + last.next); render(); }
        break;
      }
      case 'tab': game.clientTab = el.dataset.tab; render(); break;
      case 'reset-demo': resetGame(); if (location.hash === '#/desk') render(); else location.hash = '#/desk'; break;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && game.call && game.call.phase === 'confirm') { game.call.phase = 'choose'; render(); focusSay(); }
  });
  window.addEventListener('hashchange', () => { game.toast = null; if (!location.hash.startsWith('#/client')) game.clientTab = 'overview'; render(); window.scrollTo(0, 0); document.getElementById('frame').scrollTop = 0; });
  render();
})();
