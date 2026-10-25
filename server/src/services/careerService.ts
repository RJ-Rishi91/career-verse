import {
  CallState,
  CareerState,
  Client,
  CommittedChoice,
  PlayerProfile,
  ScorecardResult,
  VisibleOption
} from '../types/index.js';
import { ContentService } from './contentService.js';
import { ScoringEngine } from './scoringEngine.js';
import { isDbConnected } from '../config/db.js';
import { PlayerModel } from '../models/Player.js';
import { ClientModel } from '../models/ClientModel.js';
import { CallSessionModel } from '../models/CallSession.js';
import { DecisionEventModel } from '../models/DecisionEvent.js';

// Deterministic seed order generator
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

export class CareerService {
  private static playerMemory: PlayerProfile = {
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

  private static clientsMemory: Client[] = ContentService.getInitialClients();
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

  public static async getCareerState(): Promise<CareerState> {
    const player = await this.getPlayer();
    const clients = await this.getClients();
    const scenario = ContentService.getScenario();
    const activeCall = await this.getActiveCallState();

    return {
      player,
      clients,
      inbox: [
        { from: 'Dana Whitfield', title: 'Renewal documents attached', sub: 'Check the declarations page for changes' },
        { from: 'Carrier underwriting', title: 'Endorsement in review', sub: 'Bellrock account, Riverside GC' }
      ],
      scenario,
      activeCall,
      lastResult: this.lastResultMemory,
      unlocks: {
        clients: true,
        inbox: player.callsDone >= 2,
        journal: true,
        shop: false
      }
    };
  }

  public static async getActiveCallState(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<CallState | null> {
    const scenario = ContentService.getScenario(scenarioId);
    const client = (await this.getClients()).find(c => c.id === scenario.clientId);
    if (!client) return null;

    if (!this.activeCallMemory) {
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
    const client = (await this.getClients()).find(c => c.id === scenario.clientId);
    if (!client) throw new Error('Client not found');

    const startNode = scenario.nodes[scenario.start];
    const player = await this.getPlayer();

    const order = seededOrder(startNode.options.length, `${player.careerSeed}:${scenario.start}`);

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
    if (!this.activeCallMemory) {
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

    if (!this.activeCallMemory) {
      await this.startCall(scenarioId);
    }

    const st = this.activeCallMemory!;
    const scenario = ContentService.getScenario(scenarioId);
    const node = scenario.nodes[nodeId || st.nodeId];
    const opt = node.options.find(o => o.id === optionId) || node.options[st.order[optionIndex || st.idx]];

    if (!opt) {
      throw new Error(`Option ${optionId} not found in node ${nodeId}`);
    }

    // Apply effects to relationship meters
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
      const scorecard = await this.getScorecard(scenarioId);
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
    st.order = seededOrder(nextNode.options.length, `${player.careerSeed}:${nextNodeId}`);

    return {
      callState: (await this.getActiveCallState(scenarioId))!,
      finished: false
    };
  }

  public static async getScorecard(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<ScorecardResult> {
    if (this.lastResultMemory) {
      return this.lastResultMemory;
    }

    if (!this.activeCallMemory || this.activeCallMemory.choices.length === 0) {
      throw new Error('No committed choices found for scorecard');
    }

    const result = ScoringEngine.compute(this.activeCallMemory.choices, scenarioId);
    this.lastResultMemory = result;
    return result;
  }

  public static async collectRewards(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Promise<{
    reward: { xp: number; coins: number; badge: boolean };
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

      if (client.cycle[1]) {
        client.cycle[1].done = true;
        client.cycle[1].current = false;
      }
      if (client.cycle[2]) {
        client.cycle[2].current = true;
      }

      const firstChoiceText = this.activeCallMemory.choices[0]?.option.text || '';
      client.history.unshift({
        when: 'Today',
        kind: 'Call',
        title: `Status update: ${scorecard.critical ? (scorecard.recovered ? 'overpromised, then corrected' : 'promised the certificate') : 'an honest timeline'}`,
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

    // Save changes to DB or memory
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
        badge: scorecard.badge
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

    this.clientsMemory = ContentService.getInitialClients();
    this.activeCallMemory = null;
    this.lastResultMemory = null;
    this.idempotencyResponses.clear();

    if (isDbConnected()) {
      try {
        await PlayerModel.deleteMany({});
        await ClientModel.deleteMany({});
        await CallSessionModel.deleteMany({});
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
