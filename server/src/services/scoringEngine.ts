import { C7Scores, CommittedChoice, ScorecardResult, ScenarioOption } from '../types/index.js';
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
      if (val >= rules.levelCuts.strong) return 3;
      if (val >= rules.levelCuts.good) return 2;
      return 1;
    };

    const wSum = C7_KEYS.reduce((sum, k) => sum + (rules.c7Weights[k] || 1), 0);
    const commTotal = C7_KEYS.reduce((sum, k) => sum + avg[k] * (rules.c7Weights[k] || 1), 0);
    const communication = Math.round((commTotal / wSum / 3) * 100);

    let rawBusiness = Math.round(
      (choices.reduce((sum, ch) => sum + (ch.option.business || 0), 0) / count / 3) * 100
    );

    const criticalChoice = choices.find((ch) => ch.option.critical);
    const recovered = !!choices.find((ch) => ch.option.recovery);
    const capped = !!criticalChoice && rawBusiness > rules.criticalBusinessCap;

    const business = criticalChoice ? Math.min(rawBusiness, rules.criticalBusinessCap) : rawBusiness;

    const perf = (communication + business) / 200;
    const xp = rules.xpBase + Math.round(rules.xpPerformanceMax * perf);
    const coins = rules.coinsBase + Math.round((rules.coinsPerformanceMax * business) / 100);

    const bReq = rules.badges.straightShooter;
    const badge = !criticalChoice && avg.correct >= bReq.requires.correct && avg.concrete >= bReq.requires.concrete;

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
      communication,
      business,
      critical: criticalChoice ? criticalChoice.option : null,
      recovered,
      capped,
      xp,
      coins,
      badge,
      c7rows,
      totals,
      coach: {
        worked: best.coach.worked,
        next: worst.coach.next,
        why: (criticalChoice ? criticalChoice.option : worst).coach.why
      },
      headline,
      ruleOfThumb: scenario.ruleOfThumb
    };
  }
}
