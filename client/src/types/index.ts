export type Expression = 'neutral' | 'worried' | 'pleased' | 'relieved' | 'frustrated';
export type ClientStatus = 'ok' | 'watch' | 'risk';
export type ClientTint = 'blue' | 'coral' | 'mint' | 'butter';
export type CallPhase = 'choose' | 'confirm' | 'saving' | 'reacted' | 'uncertain';

export interface PlayerProfile {
  name: string;
  initials: string;
  role: string;
  level: number;
  levelTitle: string;
  xp: number;
  prevXp?: number;
  xpToNext: number;
  coins: number;
  streak: number;
  freezes: number;
  callsDone: number;
  callsTotal: number;
  portfolio: string;
  careerSeed: string;
}

export interface ClientMeters {
  trust: number;
  respect: number;
  anger: number;
}

export interface ClientThought {
  unlockTrust: number;
  text: string;
}

export interface ClientArt {
  skin: string;
  neck: string;
  hair: 'short' | 'long' | 'bun';
  hairColor: string;
  shirt: string;
  tie: string | null;
}

export interface ClientCycleStep {
  name: string;
  when: string;
  done: boolean;
  current?: boolean;
}

export interface ClientHistoryEntry {
  when: string;
  kind: 'Call' | 'Email' | 'Account';
  title: string;
  detail: string;
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  company: string;
  role: string;
  importance: string;
  tint: ClientTint;
  status: ClientStatus;
  meters: ClientMeters;
  next: string;
  prefs: string[];
  trigger: string;
  thought: ClientThought;
  art: ClientArt;
  cycle: ClientCycleStep[];
  history: ClientHistoryEntry[];
}

export interface C7Scores {
  clear: number;
  concise: number;
  concrete: number;
  correct: number;
  coherent: number;
  complete: number;
  courteous: number;
}

export interface CoachingNote {
  worked: string;
  next: string;
  why: string;
}

export interface ScenarioOption {
  id: string;
  next: string;
  face: Expression;
  text: string;
  reaction: string;
  effects: ClientMeters;
  c7: C7Scores;
  business: number;
  critical?: string;
  recovery?: boolean;
  coach: CoachingNote;
}

export interface ScenarioNode {
  line: string;
  consequential: boolean;
  options: ScenarioOption[];
}

export interface ScenarioKnownFact {
  time: string;
  text: string;
}

export interface Scenario {
  id: string;
  version: number;
  level: number;
  clientId: string;
  type: string;
  title: string;
  teaser: string;
  goal: string;
  known: ScenarioKnownFact[];
  due: string;
  skills: string[];
  ruleOfThumb: string;
  start: string;
  nodes: Record<string, ScenarioNode>;
}

export interface VisibleOption {
  optionId: string;
  text: string;
}

export interface CommittedChoice {
  nodeId: string;
  option: ScenarioOption;
}

export interface CallState {
  scenarioId: string;
  contentVersion: number;
  nodeId: string;
  phase: CallPhase;
  optionIndex: number;
  optionCount: number;
  visibleOption: VisibleOption | null;
  clientLine: string;
  meters: ClientMeters;
  consequential: boolean;
  expression: Expression;
  stageTint?: ClientTint;
  lastChoice?: CommittedChoice | null;
  choicesCount: number;
  isLastNode?: boolean;
}

export interface C7Row {
  key: keyof C7Scores;
  name: string;
  lvl: number; // 1 = Needs work, 2 = Good, 3 = Strong
  why: string;
}

export interface ScorecardResult {
  scenarioId?: string;
  communication: number; // 0-100
  business: number; // 0-100
  critical: ScenarioOption | null;
  recovered: boolean;
  capped: boolean;
  xp: number;
  coins: number;
  badge: boolean;
  badgeId?: string;
  badgeName?: string;
  c7rows: C7Row[];
  totals: ClientMeters;
  coach: CoachingNote;
  headline: string;
  ruleOfThumb?: string;
}

export interface LeaderboardEntry {
  rank: number;
  handle: string;
  title: string;
  points: number;
  topVoice: boolean;
  badge: string;
  me: boolean;
}

export interface KudosType {
  id: string;
  label: string;
  description: string;
}

export interface ScenarioSummary {
  id: string;
  title: string;
  type: string;
  clientId: string;
  clientName: string;
  due: string;
  skills: string[];
  isBoss?: boolean;
  completed?: boolean;
}

export interface CareerState {
  player: PlayerProfile;
  clients: Client[];
  inbox: Array<{ from: string; title: string; sub: string }>;
  scenario: Scenario;
  activeCall: CallState | null;
  lastResult: ScorecardResult | null;
  completedScenarios: string[];
  availableScenarios: ScenarioSummary[];
  unlocks: {
    clients: boolean;
    inbox: boolean;
    journal: boolean;
    shop: boolean;
    leaderboard: boolean;
  };
  kudosSent: Record<string, string>;
  lbOptIn: boolean;
}
