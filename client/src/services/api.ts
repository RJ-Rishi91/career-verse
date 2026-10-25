import {
  CallState,
  CareerState,
  Client,
  CommittedChoice,
  ScorecardResult
} from '../types/index.js';

// Load default local content fallback
import initialClients from '../content/clients.json';
import rulesData from '../content/rules.config.json';
import scenarioData from '../content/scenarios/L1_MARCUS_STATUS_UPDATE.json';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededOrder(n: number, seed: string): number[] {
  let a = hashString(seed);
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const clamp = (n: number) => Math.max(0, Math.min(10, n));

// Local state for offline demo fallback
class LocalSimulation {
  static player = {
    name: 'Alex Kumar',
    initials: 'AK',
    role: 'Virtual assistant',
    level: 1,
    levelTitle: 'Rookie desk',
    xp: 340,
    prevXp: 340,
    xpToNext: 500,
    coins: 120,
    streak: 4,
    freezes: 1,
    callsDone: 5,
    callsTotal: 9,
    portfolio: 'Good',
    careerSeed: 'alex-kumar-career-1'
  };

  static clients: Client[] = (initialClients as any[]).map((c: any) => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    company: c.company,
    role: c.role,
    importance: c.importance,
    tint: c.tint,
    status: c.initial_status || 'watch',
    meters: { ...(c.initial_meters || { trust: 5, respect: 5, anger: 5 }) },
    next: c.id === 'marcus' ? 'COI due 3:00 PM' : c.id === 'dana' ? 'Renewal instruction call next' : 'Feedback call Thursday',
    prefs: c.preferences || [],
    trigger: c.trigger || '',
    thought: c.thought || { unlockTrust: 6, text: '' },
    art: c.art || {},
    cycle: [
      { name: 'Instruction call', when: c.id === 'priya' ? 'Last Thu' : c.id === 'marcus' ? 'Yesterday' : 'Next', done: c.id !== 'dana', current: c.id === 'dana' },
      { name: 'Status update call', when: c.id === 'priya' ? 'Monday' : 'Today', done: c.id === 'priya', current: c.id === 'marcus' },
      { name: 'Feedback call', when: c.id === 'priya' ? 'Thursday' : 'Later', done: false, current: c.id === 'priya' }
    ],
    history: c.id === 'marcus' ? [
      { when: 'Today 9:40', kind: 'Email', title: 'COI request sent to the carrier', detail: 'Additional insured: Riverside GC. Waiting on the endorsement.' },
      { when: 'Yesterday', kind: 'Call', title: 'Instruction: COI for the Riverside job', detail: 'You confirmed the GC name and the certificate holder address before hanging up.' },
      { when: 'Last Monday', kind: 'Account', title: 'Assigned to your desk', detail: 'Marcus moved to the agency after a bad experience with his previous one.' }
    ] : c.id === 'dana' ? [
      { when: 'Last Friday', kind: 'Call', title: 'Feedback call on the auto policy change', detail: 'She thanked you for catching the wrong VIN.' },
      { when: 'Last Wed', kind: 'Email', title: 'Endorsement confirmation sent', detail: 'Added a second driver, effective the 14th.' }
    ] : [
      { when: 'Monday', kind: 'Call', title: 'Status update on the claim documents', detail: 'You listed the two documents the adjuster still needs.' },
      { when: 'Last Thu', kind: 'Call', title: 'Instruction: claim for water damage', detail: 'You took the loss date and photos and did not promise coverage.' }
    ]
  }));

  static activeCall: any = null;
  static lastResult: ScorecardResult | null = null;

  static getScenario(): any {
    const raw = scenarioData as any;
    const nodesMap: Record<string, any> = {};

    for (const node of raw.nodes) {
      nodesMap[node.node_id] = {
        line: node.line,
        consequential: node.consequential ?? true,
        options: node.options.map((opt: any) => ({
          id: opt.option_id,
          next: opt.next_node_id || 'end',
          face: opt.expression || 'neutral',
          text: opt.text,
          reaction: opt.reaction,
          effects: opt.effects?.relationship || { trust: 0, respect: 0, anger: 0 },
          c7: opt.effects?.communication_7c || { clear: 2, concise: 2, concrete: 2, correct: 2, coherent: 2, complete: 2, courteous: 2 },
          business: opt.effects?.business ?? 2,
          critical: opt.critical_flags?.[0],
          recovery: opt.recovery ?? false,
          coach: opt.coaching || { worked: '', next: '', why: '' }
        }))
      };
    }

    return {
      id: raw.scenario_id,
      version: raw.version || 1,
      level: raw.level || 1,
      clientId: raw.client_id,
      type: 'Status update',
      title: raw.title,
      teaser: raw.teaser,
      goal: raw.business_objective,
      known: raw.known_facts,
      due: raw.due_label || 'Due 3:00 PM',
      skills: raw.skills,
      ruleOfThumb: raw.rule_of_thumb,
      start: raw.opening_node_id,
      nodes: nodesMap
    };
  }
}

export class ApiService {
  private static backendAvailable: boolean | null = null;

  public static async checkBackend(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
      this.backendAvailable = res.ok;
      return res.ok;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  public static isConnected(): boolean {
    return this.backendAvailable === true;
  }

  public static async getCareer(): Promise<CareerState> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/career`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local simulation:', err);
      }
    }

    // Local simulation fallback
    const scenario = LocalSimulation.getScenario();
    return {
      player: { ...LocalSimulation.player },
      clients: JSON.parse(JSON.stringify(LocalSimulation.clients)),
      inbox: [
        { from: 'Dana Whitfield', title: 'Renewal documents attached', sub: 'Check the declarations page for changes' },
        { from: 'Carrier underwriting', title: 'Endorsement in review', sub: 'Bellrock account, Riverside GC' }
      ],
      scenario,
      activeCall: LocalSimulation.activeCall,
      lastResult: LocalSimulation.lastResult,
      unlocks: {
        clients: true,
        inbox: LocalSimulation.player.callsDone >= 2,
        journal: true,
        shop: false
      }
    };
  }

  public static async getActiveCall(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<CallState> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend call fetch failed, using local simulation:', err);
      }
    }

    // Local simulation fallback
    const sc = LocalSimulation.getScenario();
    const client = LocalSimulation.clients.find(c => c.id === sc.clientId)!;

    if (!LocalSimulation.activeCall) {
      const startNode = sc.nodes[sc.start];
      const order = seededOrder(startNode.options.length, `${LocalSimulation.player.careerSeed}:${sc.start}`);
      LocalSimulation.activeCall = {
        scenarioId,
        contentVersion: sc.version,
        nodeId: sc.start,
        idx: 0,
        phase: 'choose',
        choices: [],
        meters: { ...client.meters },
        order,
        mood: 'worried'
      };
    }

    const st = LocalSimulation.activeCall;
    const node = sc.nodes[st.nodeId];
    const opt = node.options[st.order[st.idx]];
    const lastChoice = st.choices[st.choices.length - 1];

    return {
      scenarioId,
      contentVersion: sc.version,
      nodeId: st.nodeId,
      phase: st.phase,
      optionIndex: st.idx,
      optionCount: node.options.length,
      visibleOption: opt ? { optionId: opt.id, text: opt.text } : null,
      clientLine: node.line,
      meters: { ...st.meters },
      consequential: node.consequential,
      expression: st.mood,
      stageTint: client.tint,
      lastChoice: lastChoice || null,
      choicesCount: st.choices.length,
      isLastNode: lastChoice?.option.next === 'end'
    };
  }

  public static async revealNextOption(scenarioId: string, nodeId: string, optionIndex: number): Promise<CallState> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/reveal-next`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, optionIndex })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend revealNext failed, using local fallback:', err);
      }
    }

    const sc = LocalSimulation.getScenario();
    const st = LocalSimulation.activeCall;
    const node = sc.nodes[nodeId || st.nodeId];
    if (optionIndex < node.options.length - 1) {
      st.idx = optionIndex + 1;
    }
    return this.getActiveCall(scenarioId);
  }

  public static async commitDecision(
    scenarioId: string,
    nodeId: string,
    optionId: string,
    optionIndex: number
  ): Promise<{ callState: CallState; reaction: string }> {
    const idempotencyKey = generateUUID();
    const isOnline = await this.checkBackend();

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/commit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify({ nodeId, optionId, optionIndex, idempotencyKey })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend commit failed, using local fallback:', err);
      }
    }

    // Local simulation fallback
    const sc = LocalSimulation.getScenario();
    const st = LocalSimulation.activeCall;
    const node = sc.nodes[nodeId || st.nodeId];
    const opt = node.options.find((o: any) => o.id === optionId) || node.options[st.order[optionIndex || st.idx]];

    st.meters.trust = clamp(st.meters.trust + (opt.effects.trust || 0));
    st.meters.respect = clamp(st.meters.respect + (opt.effects.respect || 0));
    st.meters.anger = clamp(st.meters.anger + (opt.effects.anger || 0));

    st.choices.push({ nodeId: st.nodeId, option: opt });
    st.mood = opt.face;
    st.phase = 'reacted';

    const callState = await this.getActiveCall(scenarioId);
    return {
      callState,
      reaction: opt.reaction
    };
  }

  public static async continueCall(scenarioId: string): Promise<{ callState: CallState; finished: boolean }> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/continue`, {
          method: 'POST'
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend continue failed, using local fallback:', err);
      }
    }

    const sc = LocalSimulation.getScenario();
    const st = LocalSimulation.activeCall;
    const lastChoice = st.choices[st.choices.length - 1];

    if (lastChoice.option.next === 'end') {
      await this.getScorecard(scenarioId);
      return {
        callState: await this.getActiveCall(scenarioId),
        finished: true
      };
    }

    const nextNodeId = lastChoice.option.next;
    const nextNode = sc.nodes[nextNodeId];
    st.nodeId = nextNodeId;
    st.idx = 0;
    st.phase = 'choose';
    st.order = seededOrder(nextNode.options.length, `${LocalSimulation.player.careerSeed}:${nextNodeId}`);

    return {
      callState: await this.getActiveCall(scenarioId),
      finished: false
    };
  }

  public static async getScorecard(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<ScorecardResult> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/scorecard`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend scorecard failed, using local calculation:', err);
      }
    }

    if (LocalSimulation.lastResult) return LocalSimulation.lastResult;

    // Local deterministic calculation
    const choices = LocalSimulation.activeCall?.choices || [];
    const rules = rulesData as any;
    const C7 = ['clear', 'concise', 'concrete', 'correct', 'coherent', 'complete', 'courteous'];
    const C7_WHY: Record<string, [string, string, string]> = {
      clear: ['He had to work to follow you', 'Mostly plain; one line was fuzzy', 'Plain words, one idea per sentence'],
      concise: ['Too much padding for a busy client', 'Could lose a sentence', 'No wasted words'],
      concrete: ['No facts, times or owners', 'Some specifics, some vague words', 'Real times and actions'],
      correct: ['Stated something that isn’t true yet', 'Accurate, with a loose phrase', 'Accurate and within your authority'],
      coherent: ['Ideas jumped around', 'Mostly in order', 'Past, present, next, in order'],
      complete: ['Left out the next step', 'Missing a fallback or detail', 'Everything he needed to act'],
      courteous: ['Sounded dismissive', 'Polite but brisk', 'Acknowledged his pressure']
    };

    const avg: Record<string, number> = {};
    C7.forEach((k) => {
      avg[k] = choices.reduce((s: number, ch: any) => s + ch.option.c7[k], 0) / (choices.length || 1);
    });

    const level = (v: number) => (v >= rules.levelCuts.strong ? 3 : v >= rules.levelCuts.good ? 2 : 1);
    const wSum = C7.reduce((s, k) => s + (rules.c7Weights[k] || 1), 0);
    const communication = Math.round((C7.reduce((s, k) => s + avg[k] * (rules.c7Weights[k] || 1), 0) / wSum / 3) * 100);

    let business = Math.round(
      (choices.reduce((s: number, ch: any) => s + ch.option.business, 0) / (choices.length || 1) / 3) * 100
    );

    const critical = choices.find((ch: any) => ch.option.critical);
    const recovered = !!choices.find((ch: any) => ch.option.recovery);
    const capped = !!critical && business > rules.criticalBusinessCap;
    if (critical) business = Math.min(business, rules.criticalBusinessCap);

    const perf = (communication + business) / 200;
    const xp = rules.xpBase + Math.round(rules.xpPerformanceMax * perf);
    const coins = rules.coinsBase + Math.round((rules.coinsPerformanceMax * business) / 100);

    const b = rules.badges.straightShooter;
    const badge = !critical && avg.correct >= b.requires.correct && avg.concrete >= b.requires.concrete;

    const rank = (ch: any) => ch.option.business + C7.reduce((s, k) => s + ch.option.c7[k], 0) / 7;
    const sorted = choices.slice().sort((x: any, y: any) => rank(y) - rank(x));
    const best = sorted[0]?.option || choices[0]?.option;
    const worst = sorted[sorted.length - 1]?.option || choices[0]?.option;

    const totals = { trust: 0, respect: 0, anger: 0 };
    choices.forEach((ch: any) => {
      totals.trust += ch.option.effects.trust || 0;
      totals.respect += ch.option.effects.respect || 0;
      totals.anger += ch.option.effects.anger || 0;
    });

    const c7rows = C7.map((k) => ({
      key: k as any,
      name: k[0].toUpperCase() + k.slice(1),
      lvl: level(avg[k]),
      why: C7_WHY[k][level(avg[k]) - 1]
    }));

    let headline = 'A straight answer and a real plan.';
    if (critical && recovered) headline = 'You caught your own mistake. It still counts.';
    else if (critical) headline = 'A promise you couldn’t keep.';
    else if (business < 70) headline = 'Honest, but he needed a plan.';

    const result: ScorecardResult = {
      communication,
      business,
      critical: critical ? critical.option : null,
      recovered,
      capped,
      xp,
      coins,
      badge,
      c7rows,
      totals,
      coach: {
        worked: best?.coach?.worked || '',
        next: worst?.coach?.next || '',
        why: (critical ? critical.option : worst)?.coach?.why || ''
      },
      headline,
      ruleOfThumb: 'Fact, then status, then the next step with a time.'
    };

    LocalSimulation.lastResult = result;
    return result;
  }

  public static async collectRewards(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<{
    reward: { xp: number; coins: number; badge: boolean };
    career: CareerState;
  }> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/collect`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend collectRewards failed, using local fallback:', err);
      }
    }

    const r = await this.getScorecard(scenarioId);
    const p = LocalSimulation.player;
    const marcus = LocalSimulation.clients.find(c => c.id === 'marcus')!;

    if (LocalSimulation.activeCall) {
      marcus.meters = { ...LocalSimulation.activeCall.meters };
      marcus.status = r.critical && !r.recovered ? 'risk' : 'watch';
      marcus.next = r.critical && !r.recovered ? 'Promised the COI by 2:00 PM' : 'Call back by 1:30 PM';
      marcus.cycle[1].done = true;
      marcus.cycle[1].current = false;
      marcus.cycle[2].current = true;

      const firstChoiceText = LocalSimulation.activeCall.choices[0]?.option.text || '';
      marcus.history.unshift({
        when: 'Today',
        kind: 'Call',
        title: `Status update: ${r.critical ? (r.recovered ? 'overpromised, then corrected' : 'promised the certificate') : 'an honest timeline'}`,
        detail: `“${firstChoiceText}”`
      });
    }

    p.prevXp = p.xp;
    p.xp += r.xp;
    p.coins += r.coins;
    p.callsDone += 1;
    p.streak += 1;
    if (r.critical && !r.recovered) p.portfolio = 'Fair';

    LocalSimulation.activeCall = null;

    const career = await this.getCareer();
    return {
      reward: { xp: r.xp, coins: r.coins, badge: r.badge },
      career
    };
  }

  public static async resetCareer(): Promise<CareerState> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/career/reset`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend reset failed, using local reset:', err);
      }
    }

    LocalSimulation.player = {
      name: 'Alex Kumar',
      initials: 'AK',
      role: 'Virtual assistant',
      level: 1,
      levelTitle: 'Rookie desk',
      xp: 340,
      prevXp: 340,
      xpToNext: 500,
      coins: 120,
      streak: 4,
      freezes: 1,
      callsDone: 5,
      callsTotal: 9,
      portfolio: 'Good',
      careerSeed: 'alex-kumar-career-1'
    };
    LocalSimulation.activeCall = null;
    LocalSimulation.lastResult = null;

    return this.getCareer();
  }
}
