-- CareerVerse DB smoke tests. Run after schema.sql + seed.sql:  psql "$DATABASE_URL" -f db/tests/smoke.sql
-- Everything runs inside a transaction that is rolled back. Any failed assertion raises an error.
BEGIN;

DO $$
DECLARE u uuid; c uuid; att uuid; ver uuid; n int; ok boolean;
BEGIN
  -- seed sanity
  SELECT count(*) INTO n FROM levels;                 IF n <> 8   THEN RAISE EXCEPTION 'expected 8 levels, got %', n; END IF;
  SELECT count(*) INTO n FROM characters WHERE kind='client'; IF n <> 60 THEN RAISE EXCEPTION 'expected 60 clients, got %', n; END IF;
  SELECT count(*) INTO n FROM config_versions WHERE status='published'; IF n < 6 THEN RAISE EXCEPTION 'expected published config, got %', n; END IF;
  SELECT count(*) INTO n FROM levels l JOIN scenarios s ON s.id = l.boss_scenario_id; IF n <> 8 THEN RAISE EXCEPTION 'every level needs a boss scenario'; END IF;
  SELECT count(*) INTO n FROM scenario_versions WHERE status='published'; IF n <> 0 THEN RAISE EXCEPTION 'nothing may be published before review'; END IF;

  -- user + career
  INSERT INTO users(email,password_hash,display_name) VALUES ('Test@Example.com','argon2id$placeholder','Test') RETURNING id INTO u;
  BEGIN INSERT INTO users(email,password_hash,display_name) VALUES ('test@example.com','x','Dup'); RAISE EXCEPTION 'email uniqueness not enforced';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  INSERT INTO careers(user_id,title,seed) VALUES (u,'Trainee Associate','seed-1') RETURNING id INTO c;
  BEGIN INSERT INTO careers(user_id,title,seed) VALUES (u,'Trainee Associate','seed-2'); RAISE EXCEPTION 'one live career per user not enforced';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- a call attempt (needs a version)
  SELECT id INTO ver FROM scenario_versions WHERE scenario_id='L1_MARCUS_STATUS_UPDATE';
  INSERT INTO call_attempts(career_id,scenario_id,scenario_version_id,rules_version,node_id,option_order,meters_snapshot)
    VALUES (c,'L1_MARCUS_STATUS_UPDATE',ver,1,'d1','{"d1":[1,0,2]}','{"trust":5,"respect":5,"anger":6}') RETURNING id INTO att;
  BEGIN INSERT INTO call_attempts(career_id,scenario_id,scenario_version_id,rules_version,node_id,option_order,meters_snapshot)
    VALUES (c,'L1_MARCUS_STATUS_UPDATE',ver,1,'d1','{}','{}'); RAISE EXCEPTION 'second non-review attempt allowed (undo risk)';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  -- review-mode attempts are allowed
  INSERT INTO call_attempts(career_id,scenario_id,scenario_version_id,rules_version,node_id,option_order,meters_snapshot,is_review)
    VALUES (c,'L1_MARCUS_STATUS_UPDATE',ver,1,'d1','{}','{}',true);

  -- decisions are final
  INSERT INTO decisions(call_attempt_id,node_id,option_id,option_index_seen,effects) VALUES (att,'d1','B',1,'{}');
  BEGIN INSERT INTO decisions(call_attempt_id,node_id,option_id,option_index_seen,effects) VALUES (att,'d1','A',0,'{}'); RAISE EXCEPTION 'second decision on same node allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  ok := false; BEGIN UPDATE decisions SET option_id='A' WHERE call_attempt_id=att; EXCEPTION WHEN restrict_violation THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'decisions are not append-only'; END IF;

  -- events: append-only + idempotent
  INSERT INTO career_events(career_id,type,payload,idempotency_key,rules_version,content_version) VALUES (c,'decision_committed','{}','key-1',1,1);
  BEGIN INSERT INTO career_events(career_id,type,payload,idempotency_key) VALUES (c,'decision_committed','{}','key-1'); RAISE EXCEPTION 'idempotency key reuse allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  ok := false; BEGIN DELETE FROM career_events WHERE career_id=c; EXCEPTION WHEN restrict_violation THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'career_events can be deleted'; END IF;

  -- rewards: once per source
  INSERT INTO reward_ledger(career_id,kind,amount,source_type,source_id,ref) VALUES (c,'xp',84,'scorecard',att::text,'');
  BEGIN INSERT INTO reward_ledger(career_id,kind,amount,source_type,source_id,ref) VALUES (c,'xp',84,'scorecard',att::text,''); RAISE EXCEPTION 'reward granted twice';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- meters bounded
  BEGIN INSERT INTO client_relationships(career_id,client_id,trust,respect,anger,health) VALUES (c,'marcus-bell',11,5,5,50); RAISE EXCEPTION 'meter > 10 accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- audit log append-only
  INSERT INTO audit_log(action,target_type,target_id,reason) VALUES ('career.adjust.xp','career',c::text,'test');
  ok := false; BEGIN UPDATE audit_log SET reason='x'; EXCEPTION WHEN restrict_violation THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'audit_log is not append-only'; END IF;

  -- one published config per kind
  BEGIN INSERT INTO config_versions(kind,version,status,data,published_at) VALUES ('rules',2,'published','{}',now()); RAISE EXCEPTION 'two published rules versions allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- social seed sanity
  SELECT count(*) INTO n FROM badges;               IF n <> 100 THEN RAISE EXCEPTION 'expected 100 badges, got %', n; END IF;
  SELECT count(*) INTO n FROM badges WHERE id IN ('streak_30','streak_60','streak_90','streak_180','streak_365'); IF n <> 5 THEN RAISE EXCEPTION 'streak badges missing'; END IF;
  SELECT count(*) INTO n FROM greeting_lines WHERE band='up_late'; IF n < 1 THEN RAISE EXCEPTION 'no up_late greetings'; END IF;

  -- kudos: no self-kudos, one per recipient per week, append-only
  DECLARE c2 uuid; u2 uuid; kid bigint; BEGIN
    INSERT INTO users(email,password_hash,display_name) VALUES ('two@example.com','x','Two') RETURNING id INTO u2;
    INSERT INTO careers(user_id,title,seed) VALUES (u2,'Trainee Associate','seed-3') RETURNING id INTO c2;
    BEGIN INSERT INTO kudos(from_career_id,to_career_id,type_id,week_start,sent_on) VALUES (c,c,'rising_star','2026-10-26','2026-10-26'); RAISE EXCEPTION 'self-kudos allowed';
    EXCEPTION WHEN check_violation THEN NULL; END;
    INSERT INTO kudos(from_career_id,to_career_id,type_id,week_start,sent_on) VALUES (c,c2,'rising_star','2026-10-26','2026-10-26') RETURNING id INTO kid;
    BEGIN INSERT INTO kudos(from_career_id,to_career_id,type_id,week_start,sent_on) VALUES (c,c2,'great_judgment','2026-10-26','2026-10-27'); RAISE EXCEPTION 'two kudos to same person in a week';
    EXCEPTION WHEN unique_violation THEN NULL; END;
    ok := false; BEGIN DELETE FROM kudos WHERE id=kid; EXCEPTION WHEN restrict_violation THEN ok := true; END;
    IF NOT ok THEN RAISE EXCEPTION 'kudos not append-only'; END IF;
  END;

  -- appreciation once per trigger + source
  INSERT INTO appreciations(career_id,template_id,source_kind,from_character_id,trigger,source_ref,rendered_title,rendered_body)
    VALUES (c,'client_trust_9_direct','client','marcus-bell','trust_9','marcus-bell','t','b');
  BEGIN INSERT INTO appreciations(career_id,template_id,source_kind,from_character_id,trigger,source_ref,rendered_title,rendered_body)
    VALUES (c,'client_trust_9_direct','client','marcus-bell','trust_9','marcus-bell','t','b'); RAISE EXCEPTION 'appreciation duplicated';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- recognitions once per period
  INSERT INTO recognitions(career_id,kind,category,period_key) VALUES (c,'top_voice','general','M2026-10');
  BEGIN INSERT INTO recognitions(career_id,kind,category,period_key) VALUES (c,'top_voice','general','M2026-10'); RAISE EXCEPTION 'top voice twice in a month';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- handles unique (case-insensitive) and validated
  INSERT INTO player_profiles(user_id,public_handle,leaderboard_opt_in) VALUES (u,'Alex K.',true);
  BEGIN INSERT INTO player_profiles(user_id,public_handle) VALUES ((SELECT id FROM users WHERE email='two@example.com'),'alex k.'); RAISE EXCEPTION 'duplicate handle allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN UPDATE player_profiles SET public_handle='a@b.com' WHERE user_id=u; RAISE EXCEPTION 'email-like handle allowed';
  EXCEPTION WHEN check_violation THEN NULL; END;

  RAISE NOTICE 'ALL SMOKE TESTS PASSED';
END $$;

ROLLBACK;
