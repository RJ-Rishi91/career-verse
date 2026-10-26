import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Scenario, ScenarioNode, ScenarioOption, ScenarioSummary } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePath(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), relativePath),
    path.resolve(process.cwd(), 'setup/game', relativePath),
    path.resolve(process.cwd(), 'content', relativePath),
    path.resolve(process.cwd(), 'server/src', relativePath),
    path.resolve(__dirname, '..', relativePath),
    path.resolve(__dirname, '../../setup/game', relativePath),
    path.resolve(__dirname, '../../content', relativePath),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

export class ContentService {
  private static clients: Client[] | null = null;
  private static rules: any = null;
  private static greetings: any = null;
  private static badges: any[] | null = null;
  private static leaderboardConfig: any = null;
  private static scenarios: Map<string, Scenario> = new Map();
  private static scenarioSummaries: ScenarioSummary[] | null = null;

  public static getRules(): any {
    if (!this.rules) {
      const p = resolvePath('setup/game/rules.json');
      const raw = fs.readFileSync(p, 'utf-8');
      this.rules = JSON.parse(raw);
    }
    return this.rules;
  }

  public static getGreetings(): any {
    if (!this.greetings) {
      const p = resolvePath('setup/game/greetings.json');
      const raw = fs.readFileSync(p, 'utf-8');
      this.greetings = JSON.parse(raw);
    }
    return this.greetings;
  }

  public static getBadges(): any[] {
    if (!this.badges) {
      const p = resolvePath('setup/game/badges.json');
      const raw = fs.readFileSync(p, 'utf-8');
      this.badges = JSON.parse(raw);
    }
    return this.badges || [];
  }

  public static getLeaderboardConfig(): any {
    if (!this.leaderboardConfig) {
      const p = resolvePath('setup/game/leaderboard.json');
      const raw = fs.readFileSync(p, 'utf-8');
      this.leaderboardConfig = JSON.parse(raw);
    }
    return this.leaderboardConfig;
  }

  public static getInitialClients(): Client[] {
    if (!this.clients) {
      const pClients = resolvePath('setup/game/clients.json');
      const rawClients = fs.readFileSync(pClients, 'utf-8');
      const dataClients = JSON.parse(rawClients);

      let castClients: any[] = [];
      try {
        const pCast = resolvePath('setup/game/cast.json');
        if (fs.existsSync(pCast)) {
          castClients = JSON.parse(fs.readFileSync(pCast, 'utf-8'));
        }
      } catch (e) {
        // ignore
      }

      const allChars = [...dataClients, ...castClients];

      this.clients = allChars.map((c: any) => ({
        id: c.id,
        name: c.name,
        initials: c.initials || c.name.split(' ').map((n: string) => n[0]).join(''),
        company: c.company || (c.role?.includes('Agency') ? 'Agency Mentor' : 'Bellrock'),
        role: c.role || 'Client',
        importance: c.importance || 'Medium importance',
        tint: c.tint || 'blue',
        status: c.initial_status || c.status || 'watch',
        meters: { ...(c.initial_meters || c.meters || { trust: 5, respect: 5, anger: 3 }) },
        next: c.id === 'marcus' ? 'COI due 3:00 PM' : c.id === 'dana' ? 'Renewal instruction call next' : 'Feedback call Thursday',
        prefs: c.preferences || c.prefs || [],
        trigger: c.trigger || '',
        thought: c.thought || { unlockTrust: 6, text: '' },
        art: c.art || { skin: '#8D5A3B', neck: '#7E4F33', hair: 'short', hairColor: '#1B1F2A', shirt: '#2B3A5C', tie: null },
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
    }
    return JSON.parse(JSON.stringify(this.clients));
  }

  public static getScenarioSummaries(): ScenarioSummary[] {
    if (!this.scenarioSummaries) {
      const scenariosDir = resolvePath('content/scenarios');
      const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.json'));

      this.scenarioSummaries = files.map(file => {
        const raw = fs.readFileSync(path.join(scenariosDir, file), 'utf-8');
        const data = JSON.parse(raw);
        const clientId = data.client_id;
        const clients = this.getInitialClients();
        const client = clients.find(c => c.id === clientId) || { name: clientId };

        return {
          id: data.scenario_id,
          title: data.title,
          type: data.scenario_type === 'boss_mission' ? 'Boss review' : data.scenario_type.replace('_call', '').replace('_', ' '),
          clientId,
          clientName: client.name,
          due: data.due_label || 'Today',
          skills: data.skills || data.learning_objectives || ['Communication'],
          isBoss: data.scenario_type === 'boss_mission'
        };
      });
    }
    return this.scenarioSummaries;
  }

  public static getScenario(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Scenario {
    if (this.scenarios.has(scenarioId)) {
      return this.scenarios.get(scenarioId)!;
    }

    const scenariosDir = resolvePath('content/scenarios');
    const targetFile = path.join(scenariosDir, `${scenarioId}.json`);

    let raw: string;
    if (fs.existsSync(targetFile)) {
      raw = fs.readFileSync(targetFile, 'utf-8');
    } else {
      // Fallback search
      const files = fs.readdirSync(scenariosDir).filter(f => f.endsWith('.json'));
      raw = fs.readFileSync(path.join(scenariosDir, files[0]), 'utf-8');
    }

    const data = JSON.parse(raw);
    const nodesMap: Record<string, ScenarioNode> = {};

    for (const node of data.nodes) {
      const options: ScenarioOption[] = (node.options || []).map((opt: any) => {
        const effects = opt.effects?.relationship || opt.effects || { trust: 0, respect: 0, anger: 0 };
        const c7 = opt.effects?.communication_7c || opt.c7 || { clear: 2, concise: 2, concrete: 2, correct: 2, coherent: 2, complete: 2, courteous: 2 };
        const business = opt.effects?.business !== undefined ? opt.effects.business : (opt.business !== undefined ? opt.business : 2);
        const critical = (opt.critical_flags && opt.critical_flags.length > 0) ? opt.critical_flags[0] : (opt.critical || undefined);
        const recovery = opt.recovery ?? false;
        const coach = opt.coaching || opt.coach || { worked: '', next: '', why: '' };

        return {
          id: opt.option_id || opt.id,
          next: opt.next_node_id || opt.next || 'end',
          face: opt.expression || opt.face || 'neutral',
          text: opt.text,
          reaction: opt.reaction,
          effects: {
            trust: effects.trust || 0,
            respect: effects.respect || 0,
            anger: effects.anger || 0
          },
          c7: {
            clear: c7.clear || 0,
            concise: c7.concise || 0,
            concrete: c7.concrete || 0,
            correct: c7.correct || 0,
            coherent: c7.coherent || 0,
            complete: c7.complete || 0,
            courteous: c7.courteous || 0
          },
          business,
          critical,
          recovery,
          coach
        };
      });

      nodesMap[node.node_id] = {
        line: node.line,
        consequential: node.consequential ?? true,
        options
      };
    }

    const scenario: Scenario = {
      id: data.scenario_id,
      version: data.version || 1,
      level: data.level || 1,
      clientId: data.client_id,
      type: data.scenario_type === 'status_update_call' ? 'Status update' : (data.scenario_type === 'boss_mission' ? 'Boss review' : (data.scenario_type || 'Call')),
      title: data.title,
      teaser: data.teaser,
      goal: data.business_objective || data.goal,
      known: data.known_facts || data.known || [],
      due: data.due_label || data.due || 'Due 3:00 PM',
      skills: data.skills || ['Concrete', 'Correct'],
      ruleOfThumb: data.rule_of_thumb || data.ruleOfThumb || 'Fact, then status, then the next step with a time.',
      start: data.opening_node_id || data.start || 'd1',
      nodes: nodesMap
    };

    this.scenarios.set(scenarioId, scenario);
    return scenario;
  }
}
