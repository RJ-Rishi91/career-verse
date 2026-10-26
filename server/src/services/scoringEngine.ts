import { C7Scores, CommittedChoice, ScorecardResult } from '../types/index.js';
import { ContentService } from './contentService.js';

const C7_KEYS: (keyof C7Scores)[] = ['clear', 'concise', 'concrete', 'correct', 'coherent', 'complete', 'courteous'];

const C7_WHY: Record<keyof C7Scores, [string, string, string]> = {
  clear: [
    'He had to work to follow you',
    'Mostly plain; one line was fuzzy',
    'Plain words, one idea per sentence'
  ],
  concise: [
    'Too much padding for a busy client',
    'Could lose a sentence',
    'No wasted words'
  ],
  concrete: [
    'No facts, times or owners',
    'Some specifics, some vague words',
    'Real times and actions'
  ],
  correct: [
    'Stated something that isn’t true yet',
    'Accurate, with a loose phrase',
    'Accurate and within your authority'
  ],
  coherent: [
    'Ideas jumped around',
    'Mostly in order',
    'Past, present, next, in order'
  ],
  complete: [
    'Left out the next step',
    'Missing a fallback or detail',
    'Everything he needed to act'
  ],
  courteous: [
    'Sounded dismissive',
    'Polite but brisk',
    'Acknowledged his pressure'
  ]
};

export class ScoringEngine {
  public static compute(choices: CommittedChoice[], scenarioId: string): ScorecardResult {
    const rules = ContentService.getRules();
    const scenario = ContentService.getScenario(scenarioId);

    const avg: Record<keyof C7Scores, number> = {
      clear: 0,
      concise: 0,
      concrete: 0,
      correct: 0,
      coherent: 0,
      complete: 0,
      courteous: 0
    };

    const count = Math.max(choices.length, 1);

    C7_KEYS.forEach((k) => {
      avg[k] = choices.reduce((sum, ch) => sum + (ch.option.c7[k] || 0), 0) / count;
    });

    const level = (val: number): number => {
      const strongCut = rules.levelCuts?.strong ?? 2.5;
      const goodCut = rules.levelCuts?.good ?? 1.5;
      if (val >= strongCut) return 3;
      if (val >= goodCut) return 2;
      return 1;
    };

    const weights = rules.c7Weights || { clear: 1, concise: 1, concrete: 1, correct: 1.5, coherent: 1, complete: 1, courteous: 1 };
    const wSum = C7_KEYS.reduce((sum, k) => sum + (weights[k] || 1), 0);
    const commTotal = C7_KEYS.reduce((sum, k) => sum + avg[k] * (weights[k] || 1), 0);
    const communication = Math.round((commTotal / wSum / 3) * 100);

    let rawBusiness = Math.round(
      (choices.reduce((sum, ch) => sum + (ch.option.business || 0), 0) / count / 3) * 100
    );

    const criticalChoice = choices.find((ch) => ch.option.critical);
    const recovered = !!choices.find((ch) => ch.option.recovery);
    const cap = rules.criticalBusinessCap ?? 40;
    const capped = !!criticalChoice && rawBusiness > cap;

    const business = criticalChoice ? Math.min(rawBusiness, cap) : rawBusiness;

    const perf = (communication + business) / 200;
    const xpBase = rules.xpBase ?? 60;
    const xpMax = rules.xpPerformanceMax ?? 25;
    const coinsBase = rules.coinsBase ?? 5;
    const coinsMax = rules.coinsPerformanceMax ?? 10;

    const xp = xpBase + Math.round(xpMax * perf);
    const coins = coinsBase + Math.round((coinsMax * business) / 100);

    // Evaluate badges from v1.0 100-badge system
    let badge = false;
    let badgeId: string | undefined = undefined;
    let badgeName: string | undefined = undefined;

    if (!criticalChoice && avg.correct >= 2.5 && avg.concrete >= 2.5) {
      badge = true;
      badgeId = 'straight_shooter_1';
      badgeName = 'Straight Shooter I';
    } else if (recovered) {
      badge = true;
      badgeId = 'course_correct';
      badgeName = 'Course Correct';
    } else if (!criticalChoice && rawBusiness >= 85) {
      badge = true;
      badgeId = 'clean_record_1';
      badgeName = 'Clean Record I';
    } else if (avg.clear >= 2.5) {
      badge = true;
      badgeId = 'c7_clear_1';
      badgeName = 'Crystal Clear I';
    } else if (avg.courteous >= 2.5) {
      badge = true;
      badgeId = 'c7_courteous_1';
      badgeName = 'Diplomat I';
    }

    const rank = (ch: CommittedChoice) =>
      ch.option.business + C7_KEYS.reduce((s, k) => s + ch.option.c7[k], 0) / 7;

    const sorted = choices.slice().sort((x, y) => rank(y) - rank(x));
    const best = sorted[0]?.option || choices[0]?.option;
    const worst = sorted[sorted.length - 1]?.option || choices[0]?.option;

    const totals = { trust: 0, respect: 0, anger: 0 };
    choices.forEach((ch) => {
      totals.trust += ch.option.effects.trust || 0;
      totals.respect += ch.option.effects.respect || 0;
      totals.anger += ch.option.effects.anger || 0;
    });

    const c7rows = C7_KEYS.map((k) => {
      const lvl = level(avg[k]);
      return {
        key: k,
        name: k[0].toUpperCase() + k.slice(1),
        lvl,
        why: C7_WHY[k][lvl - 1]
      };
    });

    let headline = 'A straight answer and a real plan.';
    if (criticalChoice && recovered) {
      headline = 'You caught your own mistake. It still counts.';
    } else if (criticalChoice) {
      headline = 'A promise you couldn’t keep.';
    } else if (business < 70) {
      headline = 'Honest, but he needed a plan.';
    }

    return {
      scenarioId,
      communication,
      business,
      critical: criticalChoice ? criticalChoice.option : null,
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
        worked: best?.coach?.worked || 'You maintained a clear structure.',
        next: worst?.coach?.next || 'Acknowledge the client’s timeline pressure.',
        why: (criticalChoice ? criticalChoice.option : worst)?.coach?.why || 'Clear updates protect both client and agency.'
      },
      headline,
      ruleOfThumb: scenario.ruleOfThumb
    };
  }
}
