import {
  CallState,
  CareerState,
  Client,
  CommittedChoice,
  LeaderboardEntry,
  ScorecardResult,
  ScenarioSummary,
  Scenario
} from '../types/index.js';

import initialClientsData from '../game/clients.json';
import greetingsData from '../game/greetings.json';
import castData from '../game/cast.json';
import marcusStatusData from '../content/scenarios/L1_MARCUS_STATUS_UPDATE.json';
import marcusInstructionData from '../content/scenarios/L1_MARCUS_INSTRUCTION.json';
import marcusFeedbackData from '../content/scenarios/L1_MARCUS_FEEDBACK.json';
import danaInstructionData from '../content/scenarios/L1_DANA_INSTRUCTION.json';
import danaStatusData from '../content/scenarios/L1_DANA_STATUS_UPDATE.json';
import danaFeedbackData from '../content/scenarios/L1_DANA_FEEDBACK.json';
import priyaInstructionData from '../content/scenarios/L1_PRIYA_INSTRUCTION.json';
import priyaStatusData from '../content/scenarios/L1_PRIYA_STATUS_UPDATE.json';
import priyaFeedbackData from '../content/scenarios/L1_PRIYA_FEEDBACK.json';
import bossFirstReviewData from '../content/scenarios/L1_BOSS_FIRST_REVIEW.json';
import onboardingPracticeData from '../content/scenarios/L1_ONBOARDING_PRACTICE.json';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const SCENARIO_RAW_MAP: Record<string, any> = {
  'L1_MARCUS_STATUS_UPDATE': marcusStatusData,
  'L1_MARCUS_INSTRUCTION': marcusInstructionData,
  'L1_MARCUS_FEEDBACK': marcusFeedbackData,
  'L1_DANA_INSTRUCTION': danaInstructionData,
  'L1_DANA_STATUS_UPDATE': danaStatusData,
  'L1_DANA_FEEDBACK': danaFeedbackData,
  'L1_PRIYA_INSTRUCTION': priyaInstructionData,
  'L1_PRIYA_STATUS_UPDATE': priyaStatusData,
  'L1_PRIYA_FEEDBACK': priyaFeedbackData,
  'L1_BOSS_FIRST_REVIEW': bossFirstReviewData,
  'L1_ONBOARDING_PRACTICE': onboardingPracticeData
};

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

const LB_FIRST = ['Maya', 'Leo', 'Ana', 'Sam', 'Ivy', 'Noah', 'Zoe', 'Eli', 'Ruby', 'Kai', 'Nia', 'Omar', 'Lena', 'Theo', 'Asha', 'Finn', 'Mila', 'Jude', 'Iris', 'Ravi', 'Cleo', 'Hugo', 'Esme', 'Arlo', 'Nora', 'Dev', 'Lucia', 'Ben', 'Tara', 'Yusuf', 'Gwen', 'Ezra', 'Priti', 'Max', 'Sana', 'Reed', 'Lia', 'Joel', 'Aya', 'Cole'];
const LB_TITLES = ['Trainee Associate', 'Associate', 'Senior Associate', 'Executive Associate', 'Assistant Team Lead', 'Team Lead', 'Manager'];

class LocalSimulation {
  static player = {
    name: 'Alex Kumar',
    initials: 'AK',
    role: 'Virtual assistant',
    level: 1,
    levelTitle: 'Trainee Associate',
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

  static clients: Client[] = [...(initialClientsData as any[]), ...(castData as any[])].map((c: any) => ({
    id: c.id,
    name: c.name,
    initials: c.initials || c.name.split(' ').map((n: string) => n[0]).join(''),
    company: c.company || (c.role?.includes('Agency') ? 'Agency Mentor' : 'Bellrock Commercial'),
    role: c.role || 'Account manager',
    importance: c.importance || 'Medium importance',
    tint: c.tint || 'blue',
    status: c.initial_status || 'watch',
    meters: { ...(c.initial_meters || { trust: 5, respect: 5, anger: 3 }) },
    next: c.id === 'marcus' ? 'COI due 3:00 PM' : c.id === 'dana' ? 'Renewal instruction call next' : 'Feedback call Thursday',
    prefs: c.preferences || [],
    trigger: c.trigger || '',
    thought: c.thought || { unlockTrust: 6, text: '' },
    art: c.art || { skin: '#8D5A3B', neck: '#7E4F33', hair: 'short', hairColor: '#1B1F2A', shirt: '#2B3A5C', tie: '#2459E0' },
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

  static activeScenarioId: string = 'L1_MARCUS_STATUS_UPDATE';
  static activeCall: any = null;
  static lastResult: ScorecardResult | null = null;
  static completedScenarios: Set<string> = new Set();
  static kudosSent: Record<string, string> = {};
  static lbOptIn: boolean = false;

  static getScenario(id: string = this.activeScenarioId): any {
    const raw = SCENARIO_RAW_MAP[id] || SCENARIO_RAW_MAP['L1_MARCUS_STATUS_UPDATE'];
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
      type: raw.scenario_type === 'boss_mission' ? 'Boss review' : (raw.scenario_type === 'status_update_call' ? 'Status update' : 'Call'),
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

  static getAvailableScenarios(): ScenarioSummary[] {
    return Object.keys(SCENARIO_RAW_MAP).map(id => {
      const s = SCENARIO_RAW_MAP[id];
      const client = LocalSimulation.clients.find(c => c.id === s.client_id);
      return {
        id: s.scenario_id,
        title: s.title,
        type: s.scenario_type === 'boss_mission' ? 'Boss review' : (s.scenario_type === 'status_update_call' ? 'Status update' : 'Call'),
        clientId: s.client_id,
        clientName: client?.name || s.client_id,
        due: s.due_label || 'Today',
        skills: s.skills || ['Communication'],
        isBoss: s.scenario_type === 'boss_mission',
        completed: LocalSimulation.completedScenarios.has(s.scenario_id)
      };
    });
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
        console.warn('Backend fetch failed, using local simulation:', err);
      }
    }

    const scenario = LocalSimulation.getScenario();
    return {
      player: { ...LocalSimulation.player },
      clients: JSON.parse(JSON.stringify(LocalSimulation.clients)),
      inbox: [
        { from: 'Dana Whitfield', title: 'Renewal documents attached', sub: 'Check the declarations page for changes' },
        { from: 'Carrier underwriting', title: 'Endorsement in review', sub: 'Bellrock account, Riverside GC' },
        { from: 'Rosa Delgado', title: 'Feedback on your first week', sub: 'Review scheduled for Friday' }
      ],
      scenario,
      activeCall: LocalSimulation.activeCall,
      lastResult: LocalSimulation.lastResult,
      completedScenarios: Array.from(LocalSimulation.completedScenarios),
      availableScenarios: LocalSimulation.getAvailableScenarios(),
      unlocks: {
        clients: true,
        inbox: true,
        journal: true,
        shop: false,
        leaderboard: true
      },
      kudosSent: { ...LocalSimulation.kudosSent },
      lbOptIn: LocalSimulation.lbOptIn
    };
  }

  public static getGreeting(timeOverride: number | null = null): { line: string; band: string } {
    const G = greetingsData as any;
    const now = new Date();
    const hour = timeOverride ?? now.getHours();
    const mins = hour * 60 + (timeOverride === null ? now.getMinutes() : 0);
    const toMin = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);

    const band = G.bands.find((b: any) => mins >= toMin(b.from) && mins <= toMin(b.to)) || G.bands[0];
    const day = now.getDay();
    let pool = G.lines[band.id];
    let key = band.id;

    if ((day === 0 || day === 6) && timeOverride === null) {
      pool = G.context_lines.weekend;
      key = 'weekend';
    }

    const seed = hashString(LocalSimulation.player.name + now.toDateString() + key);
    const name = LocalSimulation.player.name.split(' ')[0];
    const line = pool[seed % pool.length].replace('{name}', name);
    return { line, band: band.id };
  }

  public static async getLeaderboard(period: string = 'weekly'): Promise<LeaderboardEntry[]> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/leaderboard?period=${period}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend leaderboard fetch failed, using local simulation:', err);
      }
    }

    const s = hashString('lb:' + period);
    const rows = LB_FIRST.map((f, i) => {
      const h = hashString(f + period + s);
      const pts = (period === 'all_time' ? 9000 : period === 'monthly' ? 2600 : 720) - i * (period === 'all_time' ? 170 : period === 'monthly' ? 52 : 15) + (h % 9);
      return {
        rank: i + 1,
        handle: f + ' ' + String.fromCharCode(65 + (h % 26)) + '.',
        title: LB_TITLES[(h >>> 3) % 7],
        points: pts,
        topVoice: i % 9 === 1,
        badge: ['Master Communicator I', 'Problem Solver II', 'Trusted I', 'Straight Shooter I', 'Calm Voice I'][h % 5],
        me: false
      };
    });

    const myPts = LocalSimulation.lastResult
      ? (period === 'all_time' ? 1240 : period === 'monthly' ? 640 : Math.round((LocalSimulation.lastResult.communication + LocalSimulation.lastResult.business) / 2) + 410)
      : (period === 'weekly' ? 380 : period === 'monthly' ? 520 : 1150);

    const myEntry: LeaderboardEntry = {
      rank: 0,
      handle: LocalSimulation.player.name.split(' ')[0] + ' ' + LocalSimulation.player.name.split(' ')[1][0] + '.',
      title: LocalSimulation.player.levelTitle,
      points: myPts,
      topVoice: false,
      badge: LocalSimulation.lastResult?.badge ? (LocalSimulation.lastResult.badgeName || 'Straight Shooter I') : 'Crystal Clear I',
      me: true
    };

    rows.push(myEntry);
    rows.sort((a, b) => b.points - a.points);
    rows.forEach((r, idx) => { r.rank = idx + 1; });

    return rows.slice(0, 31);
  }

  public static async setLeaderboardOptIn(optIn: boolean): Promise<boolean> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/leaderboard/opt-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optIn })
        });
        if (res.ok) {
          const d = await res.json();
          LocalSimulation.lbOptIn = d.optIn;
          return d.optIn;
        }
      } catch (err) {
        console.warn('Backend leaderboard opt-in failed:', err);
      }
    }
    LocalSimulation.lbOptIn = optIn;
    return optIn;
  }

  public static async sendKudos(handle: string, type: string): Promise<Record<string, string>> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/leaderboard/kudos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle, type })
        });
        if (res.ok) {
          const d = await res.json();
          LocalSimulation.kudosSent = d.kudosSent;
          return d.kudosSent;
        }
      } catch (err) {
        console.warn('Backend send kudos failed:', err);
      }
    }

    if (Object.keys(LocalSimulation.kudosSent).length >= 3) {
      throw new Error('You have already sent your 3 daily kudos.');
    }
    LocalSimulation.kudosSent[handle] = type;
    return { ...LocalSimulation.kudosSent };
  }

  public static async getActiveCall(scenarioId?: string): Promise<CallState> {
    const targetId = scenarioId || LocalSimulation.activeScenarioId;
    LocalSimulation.activeScenarioId = targetId;

    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${targetId}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend call fetch failed, using local simulation:', err);
      }
    }

    const sc = LocalSimulation.getScenario(targetId);
    LocalSimulation.activeScenarioId = targetId;
    let client = LocalSimulation.clients.find(c => c.id === sc.clientId);
    if (!client) client = LocalSimulation.clients[0];

    if (!LocalSimulation.activeCall || LocalSimulation.activeCall.scenarioId !== targetId) {
      const startNode = sc.nodes[sc.start];
      const order = seededOrder(startNode.options.length, `${LocalSimulation.player.careerSeed}:${sc.id}:${sc.start}`);
      LocalSimulation.activeCall = {
        scenarioId: targetId,
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
      scenarioId: targetId,
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

    const sc = LocalSimulation.getScenario(scenarioId);
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

    const sc = LocalSimulation.getScenario(scenarioId);
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

    const sc = LocalSimulation.getScenario(scenarioId);
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
    st.order = seededOrder(nextNode.options.length, `${LocalSimulation.player.careerSeed}:${scenarioId}:${nextNodeId}`);

    return {
      callState: await this.getActiveCall(scenarioId),
      finished: false
    };
  }

  public static async getScorecard(scenarioId: string = LocalSimulation.activeScenarioId): Promise<ScorecardResult> {
    const isOnline = await this.checkBackend();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/calls/${scenarioId}/scorecard`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend scorecard failed, using local calculation:', err);
      }
    }

    if (LocalSimulation.lastResult && LocalSimulation.lastResult.scenarioId === scenarioId) {
      return LocalSimulation.lastResult;
    }

    const choices = LocalSimulation.activeCall?.choices || [];
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

    const level = (v: number) => (v >= 2.5 ? 3 : v >= 1.5 ? 2 : 1);
    const communication = Math.round((C7.reduce((s, k) => s + avg[k], 0) / 7 / 3) * 100);

    let business = Math.round(
      (choices.reduce((s: number, ch: any) => s + ch.option.business, 0) / (choices.length || 1) / 3) * 100
    );

    const critical = choices.find((ch: any) => ch.option.critical);
    const recovered = !!choices.find((ch: any) => ch.option.recovery);
    const capped = !!critical && business > 40;
    if (critical) business = Math.min(business, 40);

    const perf = (communication + business) / 200;
    const xp = 60 + Math.round(25 * perf);
    const coins = 5 + Math.round((10 * business) / 100);

    let badge = false;
    let badgeId: string | undefined = undefined;
    let badgeName: string | undefined = undefined;

    if (!critical && avg.correct >= 2.5 && avg.concrete >= 2.5) {
      badge = true;
      badgeId = 'straight_shooter_1';
      badgeName = 'Straight Shooter I';
    } else if (recovered) {
      badge = true;
      badgeId = 'course_correct';
      badgeName = 'Course Correct';
    } else if (!critical && business >= 80) {
      badge = true;
      badgeId = 'clean_record_1';
      badgeName = 'Clean Record I';
    }

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
      scenarioId,
      communication,
      business,
      critical: critical ? critical.option : null,
      recovered,
      capped,
      xp,
      coins,
      badge,
      badgeId,
      badgeName,
      c7rows,
      totals,
      coach: {
        worked: best?.coach?.worked || 'Your reply was structured and professional.',
        next: worst?.coach?.next || 'Acknowledge the client’s timeline pressure.',
        why: (critical ? critical.option : worst)?.coach?.why || 'Clear communication protects the client and the agency.'
      },
      headline,
      ruleOfThumb: 'Fact, then status, then the next step with a time.'
    };

    LocalSimulation.lastResult = result;
    return result;
  }

  public static async collectRewards(scenarioId: string = LocalSimulation.activeScenarioId): Promise<{
    reward: { xp: number; coins: number; badge: boolean; badgeName?: string };
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
    const sc = LocalSimulation.getScenario(scenarioId);
    const client = LocalSimulation.clients.find(c => c.id === sc.clientId);

    if (client && LocalSimulation.activeCall) {
      client.meters = { ...LocalSimulation.activeCall.meters };
      client.status = r.critical && !r.recovered ? 'risk' : 'watch';
      const firstChoiceText = LocalSimulation.activeCall.choices[0]?.option.text || '';
      client.history.unshift({
        when: 'Today',
        kind: 'Call',
        title: `${sc.type}: ${r.critical ? (r.recovered ? 'overpromised, then corrected' : 'promised without authority') : 'a clear timeline'}`,
        detail: `“${firstChoiceText}”`
      });
    }

    p.prevXp = p.xp;
    p.xp += r.xp;
    p.coins += r.coins;
    p.callsDone += 1;
    p.streak += 1;
    if (r.critical && !r.recovered) p.portfolio = 'Fair';

    LocalSimulation.completedScenarios.add(scenarioId);
    LocalSimulation.activeCall = null;

    const career = await this.getCareer();
    return {
      reward: { xp: r.xp, coins: r.coins, badge: r.badge, badgeName: r.badgeName },
      career
    };
  }

  public static getScenario(scenarioId?: string): Scenario {
    return LocalSimulation.getScenario(scenarioId);
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
      levelTitle: 'Trainee Associate',
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
    LocalSimulation.completedScenarios.clear();
    LocalSimulation.kudosSent = {};
    LocalSimulation.lbOptIn = false;

    return this.getCareer();
  }
}
