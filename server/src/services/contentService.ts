import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Scenario, ScenarioNode, ScenarioOption } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to locate content files reliably
function resolveContentPath(relativePath: string): string {
  const candidates = [
    path.resolve(__dirname, '../content', relativePath),
    path.resolve(__dirname, '../../content', relativePath),
    path.resolve(process.cwd(), 'server/src/content', relativePath),
    path.resolve(process.cwd(), 'content', relativePath),
    path.resolve(process.cwd(), 'CareerVerse_Dev_Handoff/content', relativePath),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

export class ContentService {
  private static clients: Client[] | null = null;
  private static rules: any = null;
  private static scenarios: Map<string, Scenario> = new Map();

  public static getRules(): any {
    if (!this.rules) {
      const p = resolveContentPath('rules.config.json');
      const raw = fs.readFileSync(p, 'utf-8');
      this.rules = JSON.parse(raw);
    }
    return this.rules;
  }

  public static getInitialClients(): Client[] {
    if (!this.clients) {
      const p = resolveContentPath('clients.json');
      const raw = fs.readFileSync(p, 'utf-8');
      const data = JSON.parse(raw);
      
      this.clients = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        initials: c.initials,
        company: c.company,
        role: c.role,
        importance: c.importance,
        tint: c.tint,
        status: c.initial_status || c.status || 'watch',
        meters: { ...(c.initial_meters || c.meters || { trust: 5, respect: 5, anger: 5 }) },
        next: c.id === 'marcus' ? 'COI due 3:00 PM' : c.id === 'dana' ? 'Renewal instruction call next' : 'Feedback call Thursday',
        prefs: c.preferences || c.prefs || [],
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
    }
    return JSON.parse(JSON.stringify(this.clients));
  }

  public static getScenario(scenarioId: string = 'L1_MARCUS_STATUS_UPDATE'): Scenario {
    if (this.scenarios.has(scenarioId)) {
      return this.scenarios.get(scenarioId)!;
    }

    const p = resolveContentPath(`scenarios/${scenarioId}.json`);
    const raw = fs.readFileSync(p, 'utf-8');
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
      type: data.scenario_type === 'status_update_call' ? 'Status update' : (data.scenario_type || 'Status update'),
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
