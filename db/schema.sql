-- =====================================================================
-- CareerVerse — complete PostgreSQL schema (v1)
-- Target: PostgreSQL 15+ (tested on 16). Uses only core features.
-- Conventions:
--   * UUID primary keys (gen_random_uuid()), timestamptz everywhere.
--   * Append-only tables are protected by triggers (no UPDATE/DELETE).
--   * Meters are integers 0..10 enforced by CHECK constraints.
--   * Every career write carries an idempotency key; rewards are unique per source event.
--   * Committed outcomes record the rules_version and content_version used.
--   * No table stores free-text dialogue typed by players (players only choose authored options).
-- =====================================================================

BEGIN;

-- ---------- Enums ----------
CREATE TYPE user_role        AS ENUM ('player','author','reviewer','admin','master_admin');
CREATE TYPE user_status      AS ENUM ('active','suspended','pending_deletion','deleted');
CREATE TYPE token_purpose    AS ENUM ('verify_email','reset_password','admin_setup','email_change');
CREATE TYPE content_status   AS ENUM ('draft','in_review','published','retired');
CREATE TYPE config_kind      AS ENUM ('rules','economy','ladder','unlocks','flags','theme','quests_pool','notifications','leaderboard','greetings','appreciation');
CREATE TYPE character_kind   AS ENUM ('client','teammate','mentor','executive','rival');
CREATE TYPE scenario_type    AS ENUM ('instruction_call','status_update_call','feedback_call','escalation_call','email_mission','boss_mission','team_delegation','team_coaching','team_one_on_one','remediation_call','boss_variant','onboarding');
CREATE TYPE career_status    AS ENUM ('active','probation','under_review','completed','archived');
CREATE TYPE call_phase       AS ENUM ('choose','confirm','saving','reacted','completed','abandoned');
CREATE TYPE account_status   AS ENUM ('on_track','watch','at_risk');
CREATE TYPE incident_severity AS ENUM ('minor','major','severe');
CREATE TYPE reward_kind      AS ENUM ('xp','coins','badge','freeze','cosmetic','title');
CREATE TYPE quest_status     AS ENUM ('assigned','completed','claimed','expired');
CREATE TYPE delegation_status AS ENUM ('assigned','in_progress','done','failed','returned');
CREATE TYPE event_type       AS ENUM (
  'career_started','call_started','option_revealed','decision_committed','call_completed','scorecard_issued',
  'reward_granted','badge_awarded','incident_opened','incident_resolved','relationship_changed','client_status_changed',
  'level_gate_checked','boss_started','boss_completed','promoted','probation_started','probation_ended','demoted',
  'streak_extended','streak_frozen','streak_reset','quest_completed','quest_claimed','item_purchased',
  'delegation_assigned','delegation_resolved','team_member_changed','ending_reached','admin_adjustment','career_reset',
  'appreciation_received','recognition_awarded','recognition_revoked','kudos_sent','kudos_received','leaderboard_finish'
);
CREATE TYPE appreciation_source AS ENUM ('client','mentor','teammate','agency');
CREATE TYPE recognition_kind AS ENUM ('top_voice','employee_of_month','leaderboard_finish');
CREATE TYPE leaderboard_period_kind AS ENUM ('weekly','monthly','all_time');

-- ---------- Helper: block UPDATE/DELETE on append-only tables ----------
CREATE OR REPLACE FUNCTION forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only (% not allowed)', TG_TABLE_NAME, TG_OP USING ERRCODE = 'restrict_violation';
END $$;

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;

-- =====================================================================
-- 1. Identity, sessions, security
-- =====================================================================
CREATE TABLE users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text NOT NULL,
  email_verified_at  timestamptz,
  password_hash      text NOT NULL,                       -- Argon2id encoded string
  display_name       text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 60),
  role               user_role   NOT NULL DEFAULT 'player',
  status             user_status NOT NULL DEFAULT 'active',
  org_id             uuid,                                -- reserved (proposal P6), no tenancy UI
  failed_login_count int NOT NULL DEFAULT 0,
  locked_until       timestamptz,
  last_login_at      timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);
CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email)) WHERE status <> 'deleted';
CREATE INDEX users_role_idx ON users (role);
CREATE TRIGGER users_touch BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE user_mfa (
  user_id            uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  totp_secret_enc    bytea NOT NULL,                      -- encrypted with app key (never plaintext)
  recovery_codes_hash text[] NOT NULL DEFAULT '{}',
  enabled_at         timestamptz,
  last_used_step     bigint                               -- prevents TOTP replay
);

CREATE TABLE sessions (
  id                 text PRIMARY KEY,                    -- hash of the random session token (cookie holds token)
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_admin_session   boolean NOT NULL DEFAULT false,
  mfa_verified_at    timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  last_seen_at       timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz NOT NULL,
  ip_hash            text,
  user_agent         text
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE auth_tokens (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose            token_purpose NOT NULL,
  token_hash         text NOT NULL UNIQUE,
  payload            jsonb NOT NULL DEFAULT '{}',
  expires_at         timestamptz NOT NULL,
  used_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_tokens_user_purpose_idx ON auth_tokens (user_id, purpose);

CREATE TABLE login_attempts (
  id                 bigserial PRIMARY KEY,
  email_lower        text NOT NULL,
  ip_hash            text,
  success            boolean NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX login_attempts_email_time_idx ON login_attempts (email_lower, created_at DESC);
CREATE INDEX login_attempts_ip_time_idx ON login_attempts (ip_hash, created_at DESC);

CREATE TABLE role_permissions (
  role               user_role NOT NULL,
  permission         text NOT NULL,                       -- e.g. 'users.suspend', 'config.publish'
  PRIMARY KEY (role, permission)
);

CREATE TABLE idempotency_keys (
  key                text NOT NULL,
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope              text NOT NULL,                       -- e.g. 'call.commit'
  request_hash       text NOT NULL,
  response           jsonb,
  status_code        int,
  created_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scope, key)
);

-- =====================================================================
-- 2. Player profile and preferences
-- =====================================================================
CREATE TABLE player_profiles (
  user_id            uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar             jsonb NOT NULL DEFAULT '{}',          -- cosmetic parts only
  daily_goal         text  NOT NULL DEFAULT 'steady' CHECK (daily_goal IN ('light','steady','driven')),
  timezone           text  NOT NULL DEFAULT 'UTC',
  text_scale         numeric(3,2) NOT NULL DEFAULT 1.00 CHECK (text_scale BETWEEN 1.00 AND 2.00),
  reduced_motion     boolean NOT NULL DEFAULT false,
  sound_on           boolean NOT NULL DEFAULT false,
  reminders_opt_in   boolean NOT NULL DEFAULT false,
  reminder_time      time,
  quiet_hours        int4range,
  feedback_opt_in    boolean NOT NULL DEFAULT false,
  onboarding_done_at timestamptz,
  public_handle      text CHECK (public_handle IS NULL OR public_handle ~ '^[A-Za-z0-9 ._''-]{3,24}$'),
  leaderboard_opt_in boolean NOT NULL DEFAULT false,
  kudos_opt_in       boolean NOT NULL DEFAULT false,
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX player_profiles_handle_uq ON player_profiles (lower(public_handle)) WHERE public_handle IS NOT NULL;
CREATE TRIGGER player_profiles_touch BEFORE UPDATE ON player_profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- =====================================================================
-- 3. Configuration (versioned, tunable from the Command Center)
-- =====================================================================
CREATE TABLE config_versions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind               config_kind NOT NULL,
  version            int NOT NULL CHECK (version > 0),
  status             content_status NOT NULL DEFAULT 'draft',
  data               jsonb NOT NULL,
  notes              text,
  simulation_report  jsonb,
  created_by         uuid REFERENCES users(id),
  published_by       uuid REFERENCES users(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  published_at       timestamptz,
  UNIQUE (kind, version)
);
-- exactly one published version per kind
CREATE UNIQUE INDEX config_one_published_uq ON config_versions (kind) WHERE status = 'published';

CREATE TABLE feature_flags (
  key                text PRIMARY KEY,
  enabled            boolean NOT NULL DEFAULT false,
  value              jsonb,
  description        text NOT NULL,
  updated_by         uuid REFERENCES users(id),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE levels (
  level              int PRIMARY KEY CHECK (level BETWEEN 1 AND 8),
  title              text NOT NULL,
  short_title        text NOT NULL,
  client_count       int  NOT NULL CHECK (client_count BETWEEN 1 AND 20),
  team_size          int  NOT NULL DEFAULT 0 CHECK (team_size >= 0),
  xp_threshold       int  NOT NULL CHECK (xp_threshold >= 0),
  gates              jsonb NOT NULL,                       -- see setup/game/levels.json
  skills_introduced  text[] NOT NULL DEFAULT '{}',
  unlocks            text[] NOT NULL DEFAULT '{}',
  boss_scenario_id   text,                                 -- FK added after scenarios
  promotion_message  text NOT NULL,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 4. Content (authored, versioned, reviewed)
-- =====================================================================
CREATE TABLE characters (
  id                 text PRIMARY KEY,                      -- stable slug e.g. 'marcus-bell'
  kind               character_kind NOT NULL,
  level              int REFERENCES levels(level),
  name               text NOT NULL,
  initials           text NOT NULL,
  pronoun            text NOT NULL DEFAULT 'they' CHECK (pronoun IN ('he','she','they')),
  company            text,
  role_line          text,
  location           text,
  importance         text CHECK (importance IN ('low','medium','high')),
  tint               text NOT NULL,
  persona            jsonb NOT NULL DEFAULT '{}',           -- style, preferences, trigger, thoughts
  art                jsonb NOT NULL DEFAULT '{}',           -- portrait parameters (5 expressions)
  starting_meters    jsonb,                                 -- clients: trust/respect/anger; teammates: skill/reliability/workload/morale
  status             content_status NOT NULL DEFAULT 'draft',
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX characters_kind_level_idx ON characters (kind, level);
CREATE TRIGGER characters_touch BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE scenarios (
  id                 text PRIMARY KEY,                      -- e.g. 'L1_MARCUS_STATUS_UPDATE'
  level              int  NOT NULL REFERENCES levels(level),
  type               scenario_type NOT NULL,
  client_id          text REFERENCES characters(id),        -- null for boss/team where speaker varies
  slot_order         int  NOT NULL,                         -- order on the Career Path
  cycle_step         int  CHECK (cycle_step BETWEEN 1 AND 3),
  title              text NOT NULL,
  objective          text NOT NULL,
  prerequisites      text[] NOT NULL DEFAULT '{}',          -- scenario ids that must be completed first
  is_required        boolean NOT NULL DEFAULT true,         -- counts toward the level gate
  current_version_id uuid,                                  -- published version, FK below
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level, slot_order)
);
CREATE INDEX scenarios_level_type_idx ON scenarios (level, type);

CREATE TABLE scenario_versions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id        text NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  version            int  NOT NULL CHECK (version > 0),
  status             content_status NOT NULL DEFAULT 'draft',
  body               jsonb NOT NULL,                        -- validated against content/schema/scenario.schema.json
  validator_report   jsonb,
  domain_reviewed_by uuid REFERENCES users(id),
  comms_reviewed_by  uuid REFERENCES users(id),
  reviewed_at        timestamptz,
  published_by       uuid REFERENCES users(id),
  published_at       timestamptz,
  created_by         uuid REFERENCES users(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scenario_id, version),
  CHECK (status <> 'published' OR (published_at IS NOT NULL))
);
CREATE UNIQUE INDEX scenario_one_published_uq ON scenario_versions (scenario_id) WHERE status = 'published';
ALTER TABLE scenarios ADD CONSTRAINT scenarios_current_version_fk FOREIGN KEY (current_version_id) REFERENCES scenario_versions(id);
ALTER TABLE levels ADD CONSTRAINT levels_boss_fk FOREIGN KEY (boss_scenario_id) REFERENCES scenarios(id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE glossary_terms (
  id                 text PRIMARY KEY,
  term               text NOT NULL,
  meaning            text NOT NULL,
  example            text,
  level              int REFERENCES levels(level),
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE badges (
  id                 text PRIMARY KEY,
  name               text NOT NULL,
  description        text NOT NULL,
  tier               int NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 3),
  family             text NOT NULL,                         -- tiers of one family share this
  category           text NOT NULL,                         -- communication, problem_solving, streaks, ...
  rarity             text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic')),
  hidden             boolean NOT NULL DEFAULT false,        -- secret until earned
  sort               int NOT NULL DEFAULT 0,
  criteria           jsonb NOT NULL,                        -- {"all":[{"metric","op","value"}]} using setup/game/badge_metrics.json
  art                text,
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE quest_templates (
  id                 text PRIMARY KEY,
  title              text NOT NULL,
  metric             text NOT NULL,                          -- e.g. 'calls_completed', 'c7_strong:concrete'
  target             int  NOT NULL CHECK (target > 0),
  reward             jsonb NOT NULL,                         -- {coins:10} or {freeze:1}
  min_level          int NOT NULL DEFAULT 1,
  weight             int NOT NULL DEFAULT 1,
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE shop_items (
  id                 text PRIMARY KEY,
  name               text NOT NULL,
  kind               text NOT NULL CHECK (kind IN ('cosmetic_outfit','desk_theme','streak_freeze','title_frame')),
  price_coins        int NOT NULL CHECK (price_coins >= 0),
  max_owned          int,                                    -- e.g. freezes capped
  min_level          int NOT NULL DEFAULT 1,
  data               jsonb NOT NULL DEFAULT '{}',
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE endings (
  id                 text PRIMARY KEY,
  title              text NOT NULL,
  body               text NOT NULL,
  rule               jsonb NOT NULL,                          -- deterministic selection rule
  priority           int NOT NULL,                            -- lower = checked first
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE delegation_tasks (
  key                text PRIMARY KEY,
  title              text NOT NULL,
  complexity         int  NOT NULL CHECK (complexity BETWEEN 1 AND 10),
  rule               text NOT NULL,                             -- deterministic outcome rule (engine)
  min_level          int  NOT NULL DEFAULT 5 REFERENCES levels(level),
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE announcements (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title              text NOT NULL,
  body               text NOT NULL,
  audience           jsonb NOT NULL DEFAULT '{"all":true}',
  starts_at          timestamptz NOT NULL,
  ends_at            timestamptz,
  created_by         uuid REFERENCES users(id),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- =====================================================================
-- 5. Careers and gameplay state
-- =====================================================================
CREATE TABLE careers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status             career_status NOT NULL DEFAULT 'active',
  level              int NOT NULL DEFAULT 1 REFERENCES levels(level),
  title              text NOT NULL,
  seed               text NOT NULL,                            -- deterministic option order + quests
  xp                 int NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins              int NOT NULL DEFAULT 0 CHECK (coins >= 0),
  portfolio_health   int NOT NULL DEFAULT 70 CHECK (portfolio_health BETWEEN 0 AND 100),
  team_health        int CHECK (team_health BETWEEN 0 AND 100),
  probation_count    int NOT NULL DEFAULT 0,
  ending_id          text REFERENCES endings(id),
  row_version        int NOT NULL DEFAULT 1,                   -- optimistic concurrency
  started_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz,
  archived_at        timestamptz
);
CREATE UNIQUE INDEX careers_one_live_per_user_uq ON careers (user_id) WHERE archived_at IS NULL;

CREATE TABLE career_events (                                   -- APPEND-ONLY: the permanent record
  id                 bigserial PRIMARY KEY,
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  type               event_type NOT NULL,
  payload            jsonb NOT NULL DEFAULT '{}',
  rules_version      int,
  content_version    int,
  idempotency_key    text NOT NULL,
  actor_user_id      uuid REFERENCES users(id),                -- player or admin (admin_adjustment)
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (career_id, idempotency_key, type)
);
CREATE INDEX career_events_career_time_idx ON career_events (career_id, id);
CREATE INDEX career_events_type_idx ON career_events (type);
CREATE TRIGGER career_events_no_update BEFORE UPDATE OR DELETE ON career_events FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE level_progress (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  level              int  NOT NULL REFERENCES levels(level),
  started_at         timestamptz NOT NULL DEFAULT now(),
  boss_attempts      int NOT NULL DEFAULT 0,
  boss_passed_at     timestamptz,
  promoted_at        timestamptz,
  gate_snapshot      jsonb,
  PRIMARY KEY (career_id, level)
);

CREATE TABLE call_attempts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  scenario_id        text NOT NULL REFERENCES scenarios(id),
  scenario_version_id uuid NOT NULL REFERENCES scenario_versions(id),
  rules_version      int NOT NULL,
  node_id            text NOT NULL,
  option_order       jsonb NOT NULL,                           -- {nodeId:[indices]} from career seed
  option_index       int NOT NULL DEFAULT 0 CHECK (option_index >= 0),
  phase              call_phase NOT NULL DEFAULT 'choose',
  meters_snapshot    jsonb NOT NULL,                           -- live meters during the call
  row_version        int NOT NULL DEFAULT 1,
  started_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz,
  is_review          boolean NOT NULL DEFAULT false,           -- review mode never writes outcomes
  UNIQUE (career_id, scenario_id, is_review, started_at)
);
-- one non-review attempt per scenario per career (no retries: no undo)
CREATE UNIQUE INDEX call_attempts_once_uq ON call_attempts (career_id, scenario_id) WHERE is_review = false;

CREATE TABLE decisions (                                        -- APPEND-ONLY
  id                 bigserial PRIMARY KEY,
  call_attempt_id    uuid NOT NULL REFERENCES call_attempts(id) ON DELETE CASCADE,
  node_id            text NOT NULL,
  option_id          text NOT NULL,
  option_index_seen  int  NOT NULL,                            -- how many options were revealed
  effects            jsonb NOT NULL,
  critical_flags     text[] NOT NULL DEFAULT '{}',
  recovery           boolean NOT NULL DEFAULT false,
  committed_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (call_attempt_id, node_id)
);
CREATE TRIGGER decisions_no_update BEFORE UPDATE OR DELETE ON decisions FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE scorecards (                                       -- APPEND-ONLY
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_attempt_id    uuid NOT NULL UNIQUE REFERENCES call_attempts(id) ON DELETE CASCADE,
  communication      int NOT NULL CHECK (communication BETWEEN 0 AND 100),
  business           int NOT NULL CHECK (business BETWEEN 0 AND 100),
  c7_levels          jsonb NOT NULL,
  capped             boolean NOT NULL DEFAULT false,
  critical_flags     text[] NOT NULL DEFAULT '{}',
  coaching           jsonb NOT NULL,
  rules_version      int NOT NULL,
  content_version    int NOT NULL,
  issued_at          timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER scorecards_no_update BEFORE UPDATE OR DELETE ON scorecards FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE reward_ledger (                                    -- APPEND-ONLY, awarded once per source
  id                 bigserial PRIMARY KEY,
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  kind               reward_kind NOT NULL,
  amount             int NOT NULL,                              -- negative allowed for purchases/admin
  ref                text,                                      -- badge id, item id, title
  source_type        text NOT NULL,                             -- 'scorecard','quest','purchase','admin'
  source_id          text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (career_id, kind, source_type, source_id, ref)
);
CREATE TRIGGER reward_ledger_no_update BEFORE UPDATE OR DELETE ON reward_ledger FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE client_relationships (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  client_id          text NOT NULL REFERENCES characters(id),
  trust              int NOT NULL CHECK (trust BETWEEN 0 AND 10),
  respect            int NOT NULL CHECK (respect BETWEEN 0 AND 10),
  anger              int NOT NULL CHECK (anger BETWEEN 0 AND 10),
  health             int NOT NULL CHECK (health BETWEEN 0 AND 100),
  status             account_status NOT NULL DEFAULT 'on_track',
  thoughts_unlocked  int NOT NULL DEFAULT 0,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (career_id, client_id)
);

CREATE TABLE incidents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  client_id          text REFERENCES characters(id),
  severity           incident_severity NOT NULL,
  flag               text NOT NULL,                             -- e.g. 'commit_beyond_authority'
  source_attempt_id  uuid REFERENCES call_attempts(id),
  opened_at          timestamptz NOT NULL DEFAULT now(),
  resolved_at        timestamptz,
  resolution_note    text
);
CREATE INDEX incidents_open_idx ON incidents (career_id) WHERE resolved_at IS NULL;

-- Team (Levels 5–8)
CREATE TABLE career_team_members (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  teammate_id        text NOT NULL REFERENCES characters(id),
  joined_level       int NOT NULL REFERENCES levels(level),
  skill              int NOT NULL CHECK (skill BETWEEN 0 AND 10),
  reliability        int NOT NULL CHECK (reliability BETWEEN 0 AND 10),
  workload           int NOT NULL CHECK (workload BETWEEN 0 AND 10),
  morale             int NOT NULL CHECK (morale BETWEEN 0 AND 10),
  active             boolean NOT NULL DEFAULT true,
  PRIMARY KEY (career_id, teammate_id)
);

CREATE TABLE delegations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  task_key           text NOT NULL REFERENCES delegation_tasks(key),
  teammate_id        text NOT NULL REFERENCES characters(id),
  status             delegation_status NOT NULL DEFAULT 'assigned',
  outcome            jsonb,
  assigned_at        timestamptz NOT NULL DEFAULT now(),
  resolved_at        timestamptz,
  UNIQUE (career_id, task_key)
);

-- Motivation
CREATE TABLE badge_awards (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  badge_id           text NOT NULL REFERENCES badges(id),
  evidence           jsonb NOT NULL,
  awarded_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (career_id, badge_id)
);

CREATE TABLE quest_assignments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  quest_id           text NOT NULL REFERENCES quest_templates(id),
  day                date NOT NULL,                              -- player's local day
  progress           int NOT NULL DEFAULT 0,
  status             quest_status NOT NULL DEFAULT 'assigned',
  UNIQUE (career_id, quest_id, day)
);

CREATE TABLE streaks (
  career_id          uuid PRIMARY KEY REFERENCES careers(id) ON DELETE CASCADE,
  current_days       int NOT NULL DEFAULT 0,
  longest_days       int NOT NULL DEFAULT 0,
  freezes_held       int NOT NULL DEFAULT 0 CHECK (freezes_held >= 0),
  last_active_day    date
);

CREATE TABLE streak_days (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  day                date NOT NULL,
  kind               text NOT NULL CHECK (kind IN ('active','frozen')),
  daily_goal_met     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (career_id, day)
);

CREATE TABLE inventory (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  item_id            text NOT NULL REFERENCES shop_items(id),
  quantity           int NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  equipped           boolean NOT NULL DEFAULT false,
  PRIMARY KEY (career_id, item_id)
);

CREATE TABLE glossary_progress (
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  term_id            text NOT NULL REFERENCES glossary_terms(id),
  box                int NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 5), -- Leitner box (spaced repetition)
  due_on             date NOT NULL,
  seen_count         int NOT NULL DEFAULT 0,
  PRIMARY KEY (career_id, term_id)
);

-- =====================================================================
-- 5b. Appreciation, recognition, kudos, leaderboard, greetings
-- =====================================================================
CREATE TABLE appreciation_templates (
  id                 text PRIMARY KEY,
  source_kind        appreciation_source NOT NULL,
  trigger            text NOT NULL,
  persona_style      text,                                   -- client templates vary by persona style
  from_character_id  text REFERENCES characters(id),         -- mentor/agency templates
  title              text NOT NULL,
  body               text NOT NULL,                          -- placeholders only from the allowed list
  reward             jsonb NOT NULL DEFAULT '{}',
  status             content_status NOT NULL DEFAULT 'draft'
);
CREATE INDEX appreciation_templates_trigger_idx ON appreciation_templates (source_kind, trigger, persona_style);

CREATE TABLE appreciations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  template_id        text NOT NULL REFERENCES appreciation_templates(id),
  source_kind        appreciation_source NOT NULL,
  from_character_id  text REFERENCES characters(id),
  trigger            text NOT NULL,
  source_ref         text NOT NULL,                          -- scorecard id, client id, etc. (makes it once-only)
  rendered_title     text NOT NULL,
  rendered_body      text NOT NULL,
  hidden_by_player   boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (career_id, trigger, source_ref)
);
CREATE INDEX appreciations_career_idx ON appreciations (career_id, created_at DESC);

CREATE TABLE recognitions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  kind               recognition_kind NOT NULL,
  category           text NOT NULL DEFAULT 'general',        -- top voice category, title group, or rank bucket
  period_key         text NOT NULL,                          -- 'M2026-10', 'W2026-44'
  details            jsonb NOT NULL DEFAULT '{}',
  awarded_at         timestamptz NOT NULL DEFAULT now(),
  revoked_at         timestamptz,
  revoked_by         uuid REFERENCES users(id),
  revoked_reason     text,
  UNIQUE (career_id, kind, category, period_key)
);

CREATE TABLE kudos_types (
  id                 text PRIMARY KEY,
  label              text NOT NULL,
  description        text NOT NULL,
  status             content_status NOT NULL DEFAULT 'draft'
);

CREATE TABLE kudos (                                         -- APPEND-ONLY; preset types, no free text
  id                 bigserial PRIMARY KEY,
  from_career_id     uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  to_career_id       uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  type_id            text NOT NULL REFERENCES kudos_types(id),
  week_start         date NOT NULL,                          -- Monday (UTC) of the sending week
  sent_on            date NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (from_career_id <> to_career_id),
  UNIQUE (from_career_id, to_career_id, week_start)
);
CREATE INDEX kudos_from_day_idx ON kudos (from_career_id, sent_on);
CREATE INDEX kudos_to_idx ON kudos (to_career_id);
CREATE TRIGGER kudos_no_update BEFORE UPDATE OR DELETE ON kudos FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE kudos_hidden (                                  -- recipient hides a kudos without deleting history
  kudos_id           bigint PRIMARY KEY REFERENCES kudos(id) ON DELETE CASCADE,
  hidden_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE points_ledger (                                 -- APPEND-ONLY Career Points per scorecard
  id                 bigserial PRIMARY KEY,
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  scorecard_id       uuid NOT NULL REFERENCES scorecards(id) ON DELETE CASCADE,
  local_day          date NOT NULL,
  points             int  NOT NULL CHECK (points >= 0),
  counted            boolean NOT NULL,                       -- false beyond the daily cap
  rules_version      int NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scorecard_id)
);
CREATE INDEX points_career_time_idx ON points_ledger (career_id, created_at);
CREATE TRIGGER points_ledger_no_update BEFORE UPDATE OR DELETE ON points_ledger FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE leaderboard_periods (
  key                text PRIMARY KEY,                       -- 'W2026-44', 'M2026-10', 'ALL'
  kind               leaderboard_period_kind NOT NULL,
  starts_at          timestamptz NOT NULL,
  ends_at            timestamptz,
  frozen_at          timestamptz
);

CREATE TABLE leaderboard_entries (
  period_key         text NOT NULL REFERENCES leaderboard_periods(key) ON DELETE CASCADE,
  career_id          uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  points             int NOT NULL,
  avg_communication  numeric(5,2) NOT NULL,
  reached_at         timestamptz NOT NULL,
  rank               int NOT NULL CHECK (rank > 0),
  snapshot_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (period_key, career_id)
);
CREATE INDEX leaderboard_rank_idx ON leaderboard_entries (period_key, rank);

CREATE TABLE leaderboard_exclusions (
  career_id          uuid PRIMARY KEY REFERENCES careers(id) ON DELETE CASCADE,
  reason             text NOT NULL,
  excluded_by        uuid REFERENCES users(id),
  excluded_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE greeting_lines (
  id                 text PRIMARY KEY,
  band               text,                                   -- up_late, early_bird, morning, midday, afternoon, evening, night_owl
  context            text,                                   -- first_session, comeback, weekend, ... (null for band lines)
  text               text NOT NULL CHECK (char_length(text) <= 80),
  status             content_status NOT NULL DEFAULT 'draft',
  CHECK ((band IS NULL) <> (context IS NULL))
);

CREATE TABLE blocked_handle_words (
  word               text PRIMARY KEY
);

-- =====================================================================
-- 6. Admin, audit, privacy, ops
-- =====================================================================
CREATE TABLE audit_log (                                         -- APPEND-ONLY
  id                 bigserial PRIMARY KEY,
  actor_user_id      uuid REFERENCES users(id),
  action             text NOT NULL,                              -- e.g. 'career.adjust.xp'
  target_type        text NOT NULL,
  target_id          text NOT NULL,
  before             jsonb,
  after              jsonb,
  reason             text,
  ip_hash            text,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_target_idx ON audit_log (target_type, target_id);
CREATE INDEX audit_actor_idx ON audit_log (actor_user_id, created_at DESC);
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON audit_log FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

CREATE TABLE feedback (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  scenario_id        text REFERENCES scenarios(id),
  rating             int CHECK (rating BETWEEN 1 AND 5),
  category           text CHECK (category IN ('bug','content','accessibility','idea','other')),
  message            text CHECK (char_length(message) <= 2000),
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE data_requests (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind               text NOT NULL CHECK (kind IN ('export','delete')),
  status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','cancelled')),
  requested_at       timestamptz NOT NULL DEFAULT now(),
  execute_after      timestamptz,                               -- deletion grace period
  completed_at       timestamptz,
  artifact_path      text
);

CREATE TABLE email_outbox (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email           text NOT NULL,
  template           text NOT NULL,
  data               jsonb NOT NULL,
  status             text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  attempts           int NOT NULL DEFAULT 0,
  last_error         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  sent_at            timestamptz
);

CREATE TABLE analytics_events (                                   -- privacy-minimal: no free text
  id                 bigserial PRIMARY KEY,
  user_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  name               text NOT NULL,
  props              jsonb NOT NULL DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_name_time_idx ON analytics_events (name, created_at);

-- =====================================================================
-- 7. Read views for the player journal and admin dashboards
-- =====================================================================
CREATE VIEW v_journal AS
  SELECT e.career_id, e.id AS event_id, e.type, e.payload, e.created_at,
         (e.type = 'admin_adjustment') AS is_admin_adjustment
  FROM career_events e;

CREATE VIEW v_level_funnel AS
  SELECT c.level, count(*) FILTER (WHERE c.archived_at IS NULL) AS live_careers,
         count(*) FILTER (WHERE c.status = 'probation') AS on_probation
  FROM careers c GROUP BY c.level;

CREATE VIEW v_wallet_check AS                                   -- ledger vs cached balances (integrity check)
  SELECT c.id AS career_id, c.xp, c.coins,
         COALESCE(sum(r.amount) FILTER (WHERE r.kind = 'xp'), 0)    AS ledger_xp,
         COALESCE(sum(r.amount) FILTER (WHERE r.kind = 'coins'), 0) AS ledger_coins
  FROM careers c LEFT JOIN reward_ledger r ON r.career_id = c.id
  GROUP BY c.id;

CREATE VIEW v_leaderboard_public AS                           -- what players may see
  SELECT e.period_key, e.rank, e.points, p.public_handle, c.title, c.id AS career_id
  FROM leaderboard_entries e
  JOIN careers c ON c.id = e.career_id
  JOIN player_profiles p ON p.user_id = c.user_id
  WHERE p.leaderboard_opt_in AND p.public_handle IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM leaderboard_exclusions x WHERE x.career_id = c.id);

COMMIT;
