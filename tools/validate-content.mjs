#!/usr/bin/env node
// CareerVerse content + setup validator. No dependencies. Usage: node tools/validate-content.mjs
// Exits 1 on any error. Warnings don't fail the run.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const J = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const errors = []; const warnings = [];
const err = (m) => errors.push(m); const warn = (m) => warnings.push(m);

const levels = J('setup/game/levels.json');
const chars = [...J('setup/game/clients.json'), ...J('setup/game/teammates.json'), ...J('setup/game/cast.json')];
const slots = J('setup/game/call_slots.json');
const theme = J('setup/game/theme.json');
const rules = J('setup/game/rules.json');
const charIds = new Set(); chars.forEach((c) => { if (charIds.has(c.id)) err(`duplicate character id ${c.id}`); charIds.add(c.id); if (!theme.tints[c.tint]) err(`character ${c.id}: unknown tint ${c.tint}`); });
const C7 = ['clear', 'concise', 'concrete', 'correct', 'coherent', 'complete', 'courteous'];
const FLAGS = new Set(Object.keys(rules.critical_flags));
const TYPES = new Set(['instruction_call','status_update_call','feedback_call','escalation_call','email_mission','boss_mission','team_delegation','team_coaching','team_one_on_one','remediation_call','boss_variant','onboarding']);
const EXPR = new Set(['neutral', 'worried', 'pleased', 'relieved', 'frustrated']);

// levels
levels.forEach((l, i) => {
  if (l.level !== i + 1) err(`levels.json: level order broken at index ${i}`);
  const n = J('setup/game/clients.json').filter((c) => c.level === l.level).length;
  if (n !== l.client_count) err(`level ${l.level}: client_count ${l.client_count} but ${n} clients defined`);
  if (!slots.find((s) => s.id === l.boss_scenario_id)) err(`level ${l.level}: boss ${l.boss_scenario_id} has no slot`);
});
// slots
const slotIds = new Set(); const orderKeys = new Set();
slots.forEach((s) => {
  if (slotIds.has(s.id)) err(`duplicate slot id ${s.id}`); slotIds.add(s.id);
  const ok = `${s.level}:${s.slot_order}`; if (orderKeys.has(ok)) err(`duplicate slot_order ${ok}`); orderKeys.add(ok);
  if (!TYPES.has(s.type)) err(`slot ${s.id}: bad type ${s.type}`);
  if (s.client_id && !charIds.has(s.client_id)) err(`slot ${s.id}: unknown character ${s.client_id}`);
  if (!/^L[1-8]_[A-Z0-9_]+$/.test(s.id)) err(`slot ${s.id}: id must match L<level>_UPPER_SNAKE`);
});
slots.forEach((s) => s.prerequisites.forEach((p) => { if (!slotIds.has(p)) err(`slot ${s.id}: prerequisite ${p} missing`); }));

// scenarios
const dir = path.join(root, 'content/scenarios');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
files.forEach((f) => {
  const s = J(`content/scenarios/${f}`); const where = `scenario ${s.scenario_id}`;
  if (f !== `${s.scenario_id}.json`) err(`${f}: file name must equal scenario_id`);
  if (!slotIds.has(s.scenario_id)) err(`${where}: no slot in call_slots.json`);
  const slot = slots.find((x) => x.id === s.scenario_id);
  if (slot && slot.type !== s.scenario_type) err(`${where}: type ${s.scenario_type} ≠ slot type ${slot.type}`);
  if (slot && slot.level !== s.level) err(`${where}: level ${s.level} ≠ slot level ${slot.level}`);
  if (!charIds.has(s.client_id)) err(`${where}: unknown client ${s.client_id}`);
  if (!TYPES.has(s.scenario_type)) err(`${where}: bad scenario_type`);
  const ids = new Set(s.nodes.map((n) => n.node_id));
  if (!ids.has(s.opening_node_id)) err(`${where}: opening node missing`);
  s.nodes.forEach((n) => {
    if (n.options.length < 2 || n.options.length > 4) err(`${where}/${n.node_id}: needs 2–4 options`);
    const oids = new Set();
    n.options.forEach((o) => {
      const w = `${where}/${n.node_id}/${o.option_id}`;
      if (oids.has(o.option_id)) err(`${w}: duplicate option id`); oids.add(o.option_id);
      if (o.next_node_id && !ids.has(o.next_node_id)) err(`${w}: next ${o.next_node_id} missing`);
      if (!o.next_node_id && !o.ends_call) err(`${w}: no next node and not ends_call`);
      C7.forEach((k) => { const v = o.effects?.communication_7c?.[k]; if (!(Number.isInteger(v) && v >= 0 && v <= 3)) err(`${w}: 7C ${k} missing or out of range`); });
      const b = o.effects?.business; if (!(Number.isInteger(b) && b >= 0 && b <= 3)) err(`${w}: business level missing`);
      ['trust', 'respect', 'anger'].forEach((k) => { const v = o.effects?.relationship?.[k]; if (!(Number.isInteger(v) && Math.abs(v) <= rules.meters.max_delta_per_reply)) err(`${w}: relationship ${k} invalid`); });
      (o.critical_flags || []).forEach((fl) => { if (!FLAGS.has(fl)) err(`${w}: unknown critical flag ${fl}`); });
      ['worked', 'next', 'why'].forEach((k) => { if (!o.coaching?.[k]) err(`${w}: coaching.${k} missing`); });
      if (!EXPR.has(o.expression)) err(`${w}: bad expression`);
      if (/\b(covered|approved|bound)\b/i.test(o.text) && !(o.critical_flags || []).length && !/can't|cannot|won't|isn't|not|adjuster|carrier/i.test(o.text)) warn(`${w}: mentions coverage/approval without a critical flag; check with the domain reviewer`);
    });
  });
  // reachability + termination
  const map = Object.fromEntries(s.nodes.map((n) => [n.node_id, n])); const seen = new Set([s.opening_node_id]); const q = [s.opening_node_id];
  while (q.length) { const x = q.pop(); map[x]?.options.forEach((o) => { if (o.next_node_id && !seen.has(o.next_node_id)) { seen.add(o.next_node_id); q.push(o.next_node_id); } }); }
  ids.forEach((id) => { if (!seen.has(id)) err(`${where}: node ${id} unreachable`); });
  if (!s.nodes.some((n) => n.options.some((o) => o.ends_call))) err(`${where}: no ending option`);
  if (!s.review?.domain_reviewer) warn(`${where}: awaiting domain review (cannot be published)`);
});
// tags
const TAGS = J('setup/game/tags.json');
files.forEach((f) => { const s = J(`content/scenarios/${f}`);
  (s.tags || []).forEach((t) => { if (!TAGS.scenario_tags.includes(t)) err(`scenario ${s.scenario_id}: unknown scenario tag ${t}`); });
  s.nodes.forEach((n) => n.options.forEach((o) => (o.tags || []).forEach((t) => { if (!TAGS.option_tags.includes(t)) err(`scenario ${s.scenario_id}/${n.node_id}/${o.option_id}: unknown option tag ${t}`); })));
});
// badges
const badges = J('setup/game/badges.json'); const metricsVocab = new Set(J('setup/game/badge_metrics.json').metrics);
if (badges.length !== 100) err(`expected 100 badges, found ${badges.length}`);
const bids = new Set(); badges.forEach((b) => {
  if (bids.has(b.id)) err(`duplicate badge ${b.id}`); bids.add(b.id);
  if (!fs.existsSync(path.join(root, b.art))) err(`badge ${b.id}: art missing ${b.art}`);
  (b.criteria?.all || []).forEach((c) => { const base = c.metric.split(':')[0]; if (!metricsVocab.has(base)) err(`badge ${b.id}: unknown metric ${c.metric}`);
    if (base === 'option_tag' && !TAGS.option_tags.includes(c.metric.split(':')[1])) err(`badge ${b.id}: unknown option tag in ${c.metric}`);
    if (base === 'scenario_tag_calls_comm85' && !TAGS.scenario_tags.includes(c.metric.split(':')[1])) err(`badge ${b.id}: unknown scenario tag in ${c.metric}`); });
});
[30, 60, 90, 180, 365].forEach((d) => { if (!bids.has(`streak_${d}`)) err(`missing streak badge for ${d} days`); });
// appreciation
const appr = J('setup/game/appreciation.json'); const allowed = new Set(appr.placeholders);
appr.templates.forEach((t) => { (t.body.match(/\{[a-z_]+\}/g) || []).forEach((ph) => { if (!allowed.has(ph)) err(`appreciation ${t.id}: placeholder ${ph} not allowed`); });
  if (t.from && !charIds.has(t.from)) err(`appreciation ${t.id}: unknown sender ${t.from}`); });
Object.keys(appr.client_triggers).forEach((tr) => { const styles = new Set(appr.templates.filter((t) => t.trigger === tr && t.source_kind === 'client').map((t) => t.persona_style));
  J('setup/game/clients.json').forEach((c) => { if (!styles.has(c.persona.style)) err(`appreciation: no ${tr} template for persona style ${c.persona.style}`); }); });
// greetings cover 24 hours without gaps
const gr = J('setup/game/greetings.json'); const mins = (t) => +t.slice(0, 2) * 60 + +t.slice(3);
const bands = gr.bands.slice().sort((a, b) => mins(a.from) - mins(b.from)); let cursor = 0;
bands.forEach((b) => { if (mins(b.from) !== cursor) err(`greetings: gap or overlap at ${b.from}`); cursor = mins(b.to) + 1; if (!gr.lines[b.id]?.length) err(`greetings: no lines for band ${b.id}`); });
if (cursor !== 1440) err('greetings: bands must end at 23:59');
gr.context_priority.forEach((c) => { if (!gr.context_lines[c]?.length) err(`greetings: no lines for context ${c}`); });
Object.values(gr.lines).flat().concat(Object.values(gr.context_lines).flat()).forEach((l) => { if (l.length > 80) err(`greeting too long: ${l}`); });
// leaderboard
const lb = J('setup/game/leaderboard.json'); if (lb.size !== 30) err('leaderboard size must be 30'); if (!lb.visibility.opt_in) err('leaderboard must be opt-in');

const authored = new Set(files.map((f) => f.replace('.json', '')));
slots.filter((s) => s.authored && !authored.has(s.id)).forEach((s) => err(`slot ${s.id} marked authored but has no file`));

console.log(`Levels ${levels.length} · characters ${charIds.size} · slots ${slots.length} · authored scenarios ${files.length}`);
warnings.forEach((w) => console.log('WARN ', w));
errors.forEach((e) => console.log('ERROR', e));
console.log(errors.length ? `✗ ${errors.length} error(s)` : '✓ content and setup valid');
process.exit(errors.length ? 1 : 0);
