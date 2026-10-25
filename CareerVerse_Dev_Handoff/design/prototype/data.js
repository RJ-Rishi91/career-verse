/*
 * CareerVerse prototype data.
 * Mirrors /content (clients.json, rules.config.json, scenarios/L1_MARCUS_STATUS_UPDATE.json).
 * Everything here is authored and deterministic. Nothing is generated at runtime.
 * Threshold numbers are PLACEHOLDERS until playtesting (open decisions 3-6).
 */
window.CV_DATA = {
  player: {
    name: 'Alex Kumar',
    initials: 'AK',
    role: 'Virtual assistant',
    level: 1,
    levelTitle: 'Rookie desk',
    xp: 340,
    xpToNext: 500,
    coins: 120,
    streak: 4,
    freezes: 1,
    callsDone: 5,
    callsTotal: 9,
    portfolio: 'Good',
    careerSeed: 'alex-kumar-career-1'
  },

  rules: {
    c7Weights: { clear: 1, concise: 1, concrete: 1, correct: 1, coherent: 1, complete: 1, courteous: 1 },
    levelCuts: { strong: 2.5, good: 1.5 },
    criticalBusinessCap: 40,
    xpBase: 60,
    xpPerformanceMax: 25,
    coinsBase: 5,
    coinsPerformanceMax: 10,
    badges: {
      straightShooter: { requires: { correct: 2.5, concrete: 2.5 }, noCritical: true }
    }
  },

  clients: [
    {
      id: 'marcus', name: 'Marcus Bell', initials: 'MB', company: 'Bellrock Commercial',
      role: 'Account manager · Bellrock Commercial, Houston TX', importance: 'High importance',
      tint: 'blue', status: 'watch', meters: { trust: 5, respect: 5, anger: 6 },
      next: 'COI due 3:00 PM',
      prefs: ['Bottom line first', 'Exact times, not “soon”', 'Short calls'],
      trigger: 'Loses patience with vague answers',
      thought: { unlockTrust: 6, text: '“The last agency told me ‘it’s handled’ twice. Both times it wasn’t.”' },
      art: { skin: '#8D5A3B', neck: '#7E4F33', hair: 'short', hairColor: '#1B1F2A', shirt: '#2B3A5C', tie: '#2459E0' },
      cycle: [
        { name: 'Instruction call', when: 'Yesterday', done: true },
        { name: 'Status update call', when: 'Today', done: false, current: true },
        { name: 'Feedback call', when: 'Later', done: false }
      ],
      history: [
        { when: 'Today 9:40', kind: 'Email', title: 'COI request sent to the carrier', detail: 'Additional insured: Riverside GC. Waiting on the endorsement.' },
        { when: 'Yesterday', kind: 'Call', title: 'Instruction: COI for the Riverside job', detail: 'You confirmed the GC name and the certificate holder address before hanging up.' },
        { when: 'Last Monday', kind: 'Account', title: 'Assigned to your desk', detail: 'Marcus moved to the agency after a bad experience with his previous one.' }
      ]
    },
    {
      id: 'dana', name: 'Dana Whitfield', initials: 'DW', company: 'Whitfield Insurance Group',
      role: 'Agency owner · Whitfield Insurance Group, Columbus OH', importance: 'Medium importance',
      tint: 'coral', status: 'ok', meters: { trust: 7, respect: 6, anger: 2 },
      next: 'Renewal instruction call next',
      prefs: ['Warm small talk first', 'Wants the why', 'Email recap after calls'],
      trigger: 'Dislikes surprises on premium',
      thought: { unlockTrust: 6, text: '“If this renewal premium jumps again, I’ll lose the Hendricks account.”' },
      art: { skin: '#F1C7A5', neck: '#E2B38F', hair: 'long', hairColor: '#B86F33', shirt: '#24325C', tie: null },
      cycle: [
        { name: 'Instruction call', when: 'Next', done: false, current: true },
        { name: 'Status update call', when: 'Later', done: false },
        { name: 'Feedback call', when: 'Later', done: false }
      ],
      history: [
        { when: 'Last Friday', kind: 'Call', title: 'Feedback call on the auto policy change', detail: 'She thanked you for catching the wrong VIN.' },
        { when: 'Last Wed', kind: 'Email', title: 'Endorsement confirmation sent', detail: 'Added a second driver, effective the 14th.' }
      ]
    },
    {
      id: 'priya', name: 'Priya Raman', initials: 'PR', company: 'Lakeside Benefits',
      role: 'Office manager · Lakeside Benefits, Naperville IL', importance: 'Medium importance',
      tint: 'mint', status: 'ok', meters: { trust: 6, respect: 6, anger: 3 },
      next: 'Feedback call Thursday',
      prefs: ['Detail and documents', 'Polite, formal tone', 'No surprises'],
      trigger: 'Needs every number in writing',
      thought: { unlockTrust: 6, text: '“I need every number in writing before I take it to the partners.”' },
      art: { skin: '#C68B5E', neck: '#B57C51', hair: 'bun', hairColor: '#24140E', shirt: '#2B3D6E', tie: null },
      cycle: [
        { name: 'Instruction call', when: 'Last Thu', done: true },
        { name: 'Status update call', when: 'Monday', done: true },
        { name: 'Feedback call', when: 'Thursday', done: false, current: true }
      ],
      history: [
        { when: 'Monday', kind: 'Call', title: 'Status update on the claim documents', detail: 'You listed the two documents the adjuster still needs.' },
        { when: 'Last Thu', kind: 'Call', title: 'Instruction: claim for water damage', detail: 'You took the loss date and photos and did not promise coverage.' }
      ]
    }
  ],

  inbox: [
    { from: 'Dana Whitfield', title: 'Renewal documents attached', sub: 'Check the declarations page for changes' },
    { from: 'Carrier underwriting', title: 'Endorsement in review', sub: 'Bellrock account, Riverside GC' }
  ],

  scenario: {
    id: 'L1_MARCUS_STATUS_UPDATE',
    version: 1,
    level: 1,
    clientId: 'marcus',
    type: 'Status update',
    title: 'The job site can’t open until his certificate lands',
    teaser: 'The carrier hasn’t returned the additional-insured endorsement. He’ll want to know exactly where things stand.',
    goal: 'Give a truthful update on his certificate of insurance without promising what the carrier hasn’t confirmed.',
    known: [
      { time: '9:40', text: 'COI request sent to the carrier' },
      { time: '10:55', text: 'Endorsement still pending' },
      { time: '3:00', text: 'GC deadline for site access' }
    ],
    due: 'Due 3:00 PM',
    skills: ['Concrete', 'Correct'],
    ruleOfThumb: 'Fact, then status, then the next step with a time.',
    start: 'd1',
    nodes: {
      d1: {
        line: 'The GC needs that certificate of insurance before 3, or my client can’t get on site. Where are we?',
        consequential: true,
        options: [
          {
            id: 'A', next: 'd2_promise', face: 'pleased',
            text: 'Don’t worry, it’s basically done. You’ll have it well before 3.',
            reaction: 'Great. I’ll tell the GC it’s handled.',
            effects: { trust: 1, respect: 0, anger: -2 },
            c7: { clear: 3, concise: 3, concrete: 0, correct: 0, coherent: 2, complete: 1, courteous: 3 },
            business: 0, critical: 'commit_beyond_authority',
            coach: {
              worked: 'Your tone was calm and reassuring.',
              next: 'Never call something done before the carrier confirms it. Say what is true right now.',
              why: 'You promised an endorsement the carrier hasn’t issued. If the GC acts on your word, the agency carries the risk.'
            }
          },
          {
            id: 'B', next: 'd2_plan', face: 'relieved',
            text: 'I sent the request to the carrier at 9:40. The additional-insured endorsement is still pending. I’m calling the underwriter now and I’ll update you by 1:30 with a firm time.',
            reaction: 'Okay. That’s a straight answer. Call me at 1:30 either way.',
            effects: { trust: 1, respect: 2, anger: -1 },
            c7: { clear: 3, concise: 2, concrete: 3, correct: 3, coherent: 3, complete: 2, courteous: 1 },
            business: 3,
            coach: {
              worked: 'A fact (sent at 9:40), the real status (pending) and a next step with a time (1:30). Marcus can plan around that.',
              next: 'Name his pressure first: “I know the crew is waiting.” Courtesy costs three seconds.',
              why: 'You can’t confirm an endorsement the carrier hasn’t issued. A clear process update protects him and the agency.'
            }
          },
          {
            id: 'C', next: 'd2_vague', face: 'frustrated',
            text: 'The carrier’s slow today, so I really can’t say when it’ll come through.',
            reaction: 'That’s not an answer. I have a crew waiting on site.',
            effects: { trust: -1, respect: -1, anger: 2 },
            c7: { clear: 2, concise: 3, concrete: 0, correct: 2, coherent: 2, complete: 0, courteous: 1 },
            business: 1,
            coach: {
              worked: 'You didn’t promise anything you couldn’t deliver.',
              next: 'Give him the facts you do have and a time for the next update.',
              why: 'An honest “I don’t know” still needs a plan. Without one, Marcus can’t manage his crew or the GC.'
            }
          }
        ]
      },
      d2_plan: {
        line: 'And if the carrier misses 1:30?',
        consequential: false,
        options: [
          {
            id: 'A', next: 'end', face: 'relieved',
            text: 'Then I’ll escalate to our account lead at the carrier and still call you at 1:30 with exactly what I know.',
            reaction: 'Good. That’s what I need to hear.',
            effects: { trust: 1, respect: 1, anger: -1 },
            c7: { clear: 3, concise: 3, concrete: 3, correct: 3, coherent: 3, complete: 3, courteous: 2 },
            business: 3,
            coach: { worked: 'You had a fallback ready and kept your 1:30 promise either way.', next: 'Keep the fallback as short as the answer.', why: 'A backup plan turns a risk into a managed risk.' }
          },
          {
            id: 'B', next: 'end', face: 'worried',
            text: 'Let’s hope it doesn’t come to that.',
            reaction: 'Hope isn’t a plan.',
            effects: { trust: 0, respect: -1, anger: 1 },
            c7: { clear: 2, concise: 3, concrete: 0, correct: 2, coherent: 2, complete: 0, courteous: 2 },
            business: 1,
            coach: { worked: 'You stayed polite.', next: 'Answer the “what if” with an action and a time.', why: 'He asked for a plan B. Without one he can’t prepare his crew.' }
          }
        ]
      },
      d2_promise: {
        line: 'Great. So you’ll email me the certificate by 2?',
        consequential: true,
        options: [
          {
            id: 'A', next: 'end', face: 'worried', recovery: true,
            text: 'I need to correct what I said. The endorsement isn’t issued yet. I’ll confirm a real time by 1:30.',
            reaction: 'Okay. I’d rather hear it now than at 2:45.',
            effects: { trust: 0, respect: 1, anger: 1 },
            c7: { clear: 3, concise: 3, concrete: 2, correct: 3, coherent: 3, complete: 2, courteous: 2 },
            business: 2,
            coach: { worked: 'You corrected yourself before the mistake could spread. That takes nerve.', next: 'Get it right the first time so there is nothing to correct.', why: 'Correcting early limits the damage, but the first promise stays on the record.' }
          },
          {
            id: 'B', next: 'end', face: 'pleased',
            text: 'Yes, by 2 for sure.',
            reaction: 'Perfect. I’m holding you to that.',
            effects: { trust: 1, respect: 0, anger: -1 },
            c7: { clear: 3, concise: 3, concrete: 2, correct: 0, coherent: 2, complete: 1, courteous: 2 },
            business: 0, critical: 'commit_beyond_authority',
            coach: { worked: 'You were decisive.', next: 'Only commit to times you control. The carrier controls this one.', why: 'This doubles the original promise. If the certificate isn’t there by 2, the GC and Marcus both lose trust in the agency.' }
          }
        ]
      },
      d2_vague: {
        line: 'I need something better than that. I have a crew on site.',
        consequential: false,
        options: [
          {
            id: 'A', next: 'end', face: 'relieved', recovery: true,
            text: 'Fair. I sent the request at 9:40, it’s still pending, and I’ll update you by 1:30 with a firm time.',
            reaction: 'Okay. 1:30, then.',
            effects: { trust: 1, respect: 1, anger: -1 },
            c7: { clear: 3, concise: 2, concrete: 3, correct: 3, coherent: 3, complete: 2, courteous: 2 },
            business: 2,
            coach: { worked: 'Second time round you gave facts and a time.', next: 'Lead with this answer next time.', why: 'He had to push to get a plan. That costs a little respect even when you recover.' }
          },
          {
            id: 'B', next: 'end', face: 'frustrated',
            text: 'I’ll try to find out.',
            reaction: 'Try harder.',
            effects: { trust: -1, respect: -1, anger: 1 },
            c7: { clear: 2, concise: 3, concrete: 0, correct: 2, coherent: 2, complete: 0, courteous: 1 },
            business: 0,
            coach: { worked: 'You stayed calm.', next: 'Replace “try” with an action and a time.', why: 'A vague promise twice in one call tells him the account isn’t in control.' }
          }
        ]
      }
    }
  }
};
