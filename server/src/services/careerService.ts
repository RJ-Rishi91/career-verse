import {
  CallState,
  CareerState,
  Client,
  CommittedChoice,
  LeaderboardEntry,
  PlayerProfile,
  ScorecardResult,
  ScenarioSummary,
  VisibleOption
} from '../types/index.js';
import { ContentService } from './contentService.js';
import { ScoringEngine } from './scoringEngine.js';
import { isDbConnected } from '../config/db.js';
import { PlayerModel } from '../models/Player.js';
import { ClientModel } from '../models/ClientModel.js';
import { DecisionEventModel } from '../models/DecisionEvent.js';

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

export class CareerService {
  private static playerMemory: PlayerProfile = {
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

  private static clientsMemory: Client[] = ContentService.getInitialClients();
  private static completedScenariosMemory: Set<string> = new Set();
  private static kudosSentMemory: Record<string, string> = {};
  private static lbOptInMemory: boolean = false;

  private static activeCallMemory: {
    scenarioId: string;
    nodeId: string;
    idx: number;
    phase: CallState['phase'];
    choices: CommittedChoice[];
    meters: { trust: number; respect: number; anger: number };
    order: number[];
    mood: CallState['expression'];
    idempotencyKeys: Set<string>;
  } | null = null;

  private static lastResultMemory: ScorecardResult | null = null;
  private static idempotencyResponses = new Map<string, any>();

  public static async getPlayer(): Promise<PlayerProfile> {
    if (isDbConnected()) {
      try {
        let p = await PlayerModel.findOne();
        if (!p) {
          p = await PlayerModel.create(this.playerMemory);
        }
        return p.toObject();
      } catch (err) {
        console.warn('DB read error for player, falling back to memory:', err);
      }
    }
    return { ...this.playerMemory };
  }

  public static async getClients(): Promise<Client[]> {
    if (isDbConnected()) {
      try {
        const clients = await ClientModel.find();
        if (clients.length === 0) {
          await ClientModel.insertMany(this.clientsMemory);
          return this.clientsMemory;
        }
        return clients.map(c => c.toObject());
      } catch (err) {
        console.warn('DB read error for clients, falling back to memory:', err);
      }
    }
    return JSON.parse(JSON.stringify(this.clientsMemory));
  }

  public static async getClientById(id: string): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  public static getAvailableScenarios(): ScenarioSummary[] {
    const summaries = ContentService.getScenarioSummaries();
    return summaries.map(s => ({
      ...s,
      completed: this.completedScenariosMemory.has(s.id)
    }));
  }

  public static getGreeting(timeOverride: number | null = null): { line: string; band: string } {
    const G = ContentService.getGreetings();
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

    const seed = hashString(this.playerMemory.name + now.toDateString() + key);
    const name = this.playerMemory.name.split(' ')[0];
    const line = pool[seed % pool.length].replace('{name}', name);
    return { line, band: band.id };
  }

  public static getLeaderboard(period: string = 'weekly'): LeaderboardEntry[] {
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

    const myPts = this.lastResultMemory
      ? (period === 'all_time' ? 1240 : period === 'monthly' ? 640 : Math.round((this.lastResultMemory.communication + this.lastResultMemory.business) / 2) + 410)
      : (period === 'weekly' ? 380 : period === 'monthly' ? 520 : 1150);

    const myEntry: LeaderboardEntry = {
      rank: 0,
      handle: this.playerMemory.name.split(' ')[0] + ' ' + this.playerMemory.name.split(' ')[1][0] + '.',
      title: this.playerMemory.levelTitle,
      points: myPts,
      topVoice: false,
      badge: this.lastResultMemory?.badge ? (this.lastResultMemory.badgeName || 'Straight Shooter I') : 'Crystal Clear I',
      me: true
    };

    rows.push(myEntry);
    rows.sort((a, b) => b.points - a.points);
    rows.forEach((r, idx) => { r.rank = idx + 1; });

    return rows.slice(0, 31);
  }

  public static setLeaderboardOptIn(optIn: boolean): boolean {
    this.lbOptInMemory = optIn;
    return this.lbOptInMemory;
  }

  public static sendKudos(handle: string, type: string): { success: boolean; kudosSent: Record<string, string> } {
    if (Object.keys(this.kudosSentMemory).length >= 3) {
      throw new Error('You have already sent your 3 daily kudos.');
    }
    this.kudosSentMemory[handle] = type;
    return {
      success: true,
      kudosSent: { ...this.kudosSentMemory }
    };
  }

  public static async getCareerState(): Promise<CareerState> {
    const player = await this.getPlayer();
    const clients = await this.getClients();
    const currentScenarioId = this.activeCallMemory?.scenarioId || 'L1_MARCUS_STATUS_UPDATE';
    const scenario = ContentService.getScenario(currentScenarioId);
    const activeCall = await this.getActiveCallState(currentScenarioId);

    return {
      player,
      clients,
      inbox: [
        { from: 'Dana Whitfield', title: 'Renewal documents attached', sub: 'Check the declarations page for changes' },
        { from: 'Carrier underwriting', title: 'Endorsement in review', sub: 'Bellrock account, Riverside GC' },
        { from: 'Rosa Delgado', title: 'Feedback on your first week', sub: 'Review scheduled for Friday' }
      ],
      scenario,
      activeCall,
      lastResult: this.lastResultMemory,
      completedScenarios: Array.from(this.completedScenariosMemory),
      availableScenarios: this.getAvailableScenarios(),
      unlocks: {
        clients: true,
        inbox: true,
        journal: true,
        shop: false,
        leaderboard: true
      },
      kudosSent: { ...this.kudosSentMemory },
      lbOptIn: this.lbOptInMemory
    };
  }

  public static async getActiveCallState(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<CallState | null> {
    const scenario = ContentService.getScenario(scenarioId);
    const client = (await this.getClients()).find(c => c.id === scenario.clientId);
    if (!client) return null;

    if (!this.activeCallMemory || this.activeCallMemory.scenarioId !== scenarioId) {
      return null;
    }

    const st = this.activeCallMemory;
    const node = scenario.nodes[st.nodeId];
    if (!node) return null;

    const opt = node.options[st.order[st.idx]];
    const lastChoice = st.choices[st.choices.length - 1];

    const visibleOption: VisibleOption | null = opt
      ? { optionId: opt.id, text: opt.text }
      : null;

    return {
      scenarioId,
      contentVersion: scenario.version,
      nodeId: st.nodeId,
      phase: st.phase,
      optionIndex: st.idx,
      optionCount: node.options.length,
      visibleOption,
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

  public static async startCall(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<CallState> {
    const scenario = ContentService.getScenario(scenarioId);
    let client = (await this.getClients()).find(c => c.id === scenario.clientId);
    if (!client) {
      client = (await this.getClients())[0];
    }

    const startNode = scenario.nodes[scenario.start];
    const player = await this.getPlayer();

    const order = seededOrder(startNode.options.length, `${player.careerSeed}:${scenario.id}:${scenario.start}`);

    this.activeCallMemory = {
      scenarioId,
      nodeId: scenario.start,
      idx: 0,
      phase: 'choose',
      choices: [],
      meters: { ...client.meters },
      order,
      mood: 'worried',
      idempotencyKeys: new Set()
    };

    return (await this.getActiveCallState(scenarioId))!;
  }

  public static async revealNextOption(scenarioId: string, nodeId: string, optionIndex: number): Promise<CallState> {
    if (!this.activeCallMemory || this.activeCallMemory.scenarioId !== scenarioId) {
      await this.startCall(scenarioId);
    }
    const st = this.activeCallMemory!;
    const scenario = ContentService.getScenario(scenarioId);
    const node = scenario.nodes[nodeId || st.nodeId];

    if (optionIndex < node.options.length - 1) {
      st.idx = optionIndex + 1;
    }

    return (await this.getActiveCallState(scenarioId))!;
  }

  public static async commitDecision(
    scenarioId: string,
    nodeId: string,
    optionId: string,
    optionIndex: number,
    idempotencyKey?: string
  ): Promise<{ callState: CallState; reaction: string }> {
    if (idempotencyKey && this.idempotencyResponses.has(idempotencyKey)) {
      return this.idempotencyResponses.get(idempotencyKey);
    }

    if (!this.activeCallMemory || this.activeCallMemory.scenarioId !== scenarioId) {
      await this.startCall(scenarioId);
    }

    const st = this.activeCallMemory!;
    const scenario = ContentService.getScenario(scenarioId);
    const node = scenario.nodes[nodeId || st.nodeId];
    const opt = node.options.find(o => o.id === optionId) || node.options[st.order[optionIndex || st.idx]];

    if (!opt) {
      throw new Error(`Option ${optionId} not found in node ${nodeId}`);
    }

    st.meters.trust = clamp(st.meters.trust + (opt.effects.trust || 0));
    st.meters.respect = clamp(st.meters.respect + (opt.effects.respect || 0));
    st.meters.anger = clamp(st.meters.anger + (opt.effects.anger || 0));

    st.choices.push({
      nodeId: st.nodeId,
      option: opt
    });

    st.mood = opt.face;
    st.phase = 'reacted';

    if (idempotencyKey) {
      st.idempotencyKeys.add(idempotencyKey);
      if (isDbConnected()) {
        try {
          await DecisionEventModel.create({
            idempotencyKey,
            scenarioId,
            nodeId: st.nodeId,
            optionId: opt.id,
            optionIndex,
            effects: opt.effects
          });
        } catch (err) {
          console.warn('DB write for decision event failed:', err);
        }
      }
    }

    const callState = (await this.getActiveCallState(scenarioId))!;
    const response = {
      callState,
      reaction: opt.reaction
    };

    if (idempotencyKey) {
      this.idempotencyResponses.set(idempotencyKey, response);
    }

    return response;
  }

  public static async advanceToNextNode(scenarioId: string): Promise<{ callState: CallState; finished: boolean }> {
    if (!this.activeCallMemory) {
      throw new Error('No active call');
    }

    const st = this.activeCallMemory;
    const scenario = ContentService.getScenario(scenarioId);
    const lastChoice = st.choices[st.choices.length - 1];

    if (!lastChoice) {
      throw new Error('No choice committed yet');
    }

    if (lastChoice.option.next === 'end') {
      await this.getScorecard(scenarioId);
      return {
        callState: (await this.getActiveCallState(scenarioId))!,
        finished: true
      };
    }

    const nextNodeId = lastChoice.option.next;
    const nextNode = scenario.nodes[nextNodeId];
    if (!nextNode) {
      throw new Error(`Next node ${nextNodeId} not found`);
    }

    const player = await this.getPlayer();
    st.nodeId = nextNodeId;
    st.idx = 0;
    st.phase = 'choose';
    st.order = seededOrder(nextNode.options.length, `${player.careerSeed}:${scenarioId}:${nextNodeId}`);

    return {
      callState: (await this.getActiveCallState(scenarioId))!,
      finished: false
    };
  }

  public static async getScorecard(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<ScorecardResult> {
    if (this.lastResultMemory && this.lastResultMemory.scenarioId === scenarioId) {
      return this.lastResultMemory;
    }

    if (!this.activeCallMemory || this.activeCallMemory.choices.length === 0) {
      // If no active call, run on first scenario choices if any, or mock
      throw new Error('No committed choices found for scorecard');
    }

    const result = ScoringEngine.compute(this.activeCallMemory.choices, scenarioId);
    this.lastResultMemory = result;
    return result;
  }

  public static async collectRewards(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<{
    reward: { xp: number; coins: number; badge: boolean; badgeName?: string };
    career: CareerState;
  }> {
    const scorecard = await this.getScorecard(scenarioId);
    const player = await this.getPlayer();
    const clients = await this.getClients();
    const scenario = ContentService.getScenario(scenarioId);
    const client = clients.find(c => c.id === scenario.clientId);

    if (client && this.activeCallMemory) {
      client.meters = { ...this.activeCallMemory.meters };
      client.status = scorecard.critical && !scorecard.recovered ? 'risk' : 'watch';
      client.next = scorecard.critical && !scorecard.recovered
        ? 'Promised the COI by 2:00 PM'
        : 'Call back by 1:30 PM';

      const firstChoiceText = this.activeCallMemory.choices[0]?.option.text || '';
      client.history.unshift({
        when: 'Today',
        kind: 'Call',
        title: `${scenario.type}: ${scorecard.critical ? (scorecard.recovered ? 'overpromised, then corrected' : 'promised without authority') : 'a clear timeline'}`,
        detail: `“${firstChoiceText}”`
      });
    }

    player.prevXp = player.xp;
    player.xp += scorecard.xp;
    player.coins += scorecard.coins;
    player.callsDone += 1;
    player.streak += 1;
    if (scorecard.critical && !scorecard.recovered) {
      player.portfolio = 'Fair';
    }

    this.completedScenariosMemory.add(scenarioId);

    this.playerMemory = { ...player };
    this.clientsMemory = clients;
    this.activeCallMemory = null;

    if (isDbConnected()) {
      try {
        await PlayerModel.updateOne({}, { $set: player }, { upsert: true });
        for (const c of clients) {
          await ClientModel.updateOne({ id: c.id }, { $set: c }, { upsert: true });
        }
      } catch (err) {
        console.warn('DB update during rewards collect failed:', err);
      }
    }

    const career = await this.getCareerState();

    return {
      reward: {
        xp: scorecard.xp,
        coins: scorecard.coins,
        badge: scorecard.badge,
        badgeName: scorecard.badgeName
      },
      career
    };
  }

  public static async resetCareer(): Promise<CareerState> {
    this.playerMemory = {
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

    this.clientsMemory = ContentService.getInitialClients();
    this.completedScenariosMemory.clear();
    this.kudosSentMemory = {};
    this.lbOptInMemory = false;
    this.activeCallMemory = null;
    this.lastResultMemory = null;
    this.idempotencyResponses.clear();

    if (isDbConnected()) {
      try {
        await PlayerModel.deleteMany({});
        await ClientModel.deleteMany({});
        await DecisionEventModel.deleteMany({});
        await PlayerModel.create(this.playerMemory);
        await ClientModel.insertMany(this.clientsMemory);
      } catch (err) {
        console.warn('DB reset failed:', err);
      }
    }

    return this.getCareerState();
  }
}
