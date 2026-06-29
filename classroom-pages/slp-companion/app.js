const state = {
  profile: {},
  scenarioChoice: "",
  reflections: {},
  result: null,
  entryMode: "direct_tool"
};

const earlyAccessConfig = {
  // Paste the Systeme form action URL or webhook URL here when available.
  // Until this is configured, the button redirects with lead details as URL parameters.
  formEndpoint: "",
  leadWebhookEndpoint: "https://hook.eu1.make.com/fu9v3lx2h4fvr3ayi7xuw6splev6ydpk",
  webhookEndpoint: "https://hook.eu1.make.com/s4upn1vn3atyt2nptt1hz0wo8q9ustes",
  redirectUrl: "https://janinemashigo.systeme.io/slpearlyaccess"
};

const coachingCallUrl = "https://calendly.com/consult-janineco/secret_leadership?month=2026-06";

const slpIncludesBullets = [
  "Short, focused chapters you can complete without heavy training fatigue",
  "Practical leadership lenses that are easy to remember and apply",
  "Flashcards, worksheets, and scenario-based reflection tools",
  "The SLP Companion Tool to help you apply the learning to real leadership moments"
];

const recorderState = {
  recognition: null,
  target: "",
  transcript: "",
  button: null,
  errorMessage: ""
};

const scenarioMap = {
  A: {
    score: 30,
    instinct: "The Public Pressure-Tester",
    summary:
      "You tend to bring signals into the room so the group can pressure-test the decision together. This shows transparency and strategic courage, with a watch point around timing and influence readiness."
  },
  B: {
    score: 36,
    instinct: "The Strategic Shaper",
    summary:
      "You tend to shape the conversation before the room. This shows strong influence judgment, timing awareness, and an instinct for protecting both the relationship and the decision."
  },
  C: {
    score: 28,
    instinct: "The Execution Guardian",
    summary:
      "You tend to protect the business through structure, decision gates, and operational discipline. This shows practical judgment, with a watch point around whether you are shaping the strategy or only managing its consequences."
  }
};

const rolePainPoints = {
  "CEO / Managing Director": {
    scope:
      "Overall business performance, strategy, profitability, people, investor/board confidence",
    pain:
      "You’re losing time, cash, and strategic momentum because decisions that should have been faced earlier are being delayed until the cost is bigger."
  },
  "Founder / Entrepreneur": {
    scope:
      "Growth, product-market fit, cash flow, team leadership, strategic direction",
    pain:
      "Your business is still moving, but slower than planned — and every month you stay in the wrong model costs you money, energy, and the confidence of your best people."
  },
  "COO / Operations Director": {
    scope:
      "Execution, delivery, cross-functional performance, efficiency, operational stability",
    pain:
      "You’re paying for poor leadership judgment in rework, delays, friction, and teams solving the same operational problems in different ways."
  },
  "CFO / Finance Director": {
    scope:
      "Cash flow, margin, reporting, risk, capital allocation, financial discipline",
    pain:
      "You hit the numbers on paper, but weak judgment upstream is costing the business real cash, margin leakage, and time spent correcting what should have been challenged earlier."
  },
  "Commercial Director / Sales Director": {
    scope:
      "Revenue growth, forecast accuracy, customer performance, team incentives",
    pain:
      "You’re losing revenue quality, customer trust, and forecasting credibility when the pressure to hit target overrides the judgment to challenge what won’t actually hold."
  },
  "HR Director / Chief People Officer": {
    scope:
      "Talent strategy, leadership capability, culture, succession, organisation effectiveness",
    pain:
      "You lose strong people, critical skills, and future leadership bench strength when difficult decisions are handled without enough clarity, fairness, or forward planning."
  },
  "General Manager / Business Unit Head": {
    scope:
      "P&L, team performance, strategy execution, local market performance",
    pain:
      "You’re carrying performance pressure from above and execution pressure from below — and poor judgment in either direction costs the business time, capability, and trust."
  },
  "Senior Manager / Functional Head": {
    scope:
      "Team delivery, stakeholder management, execution, influence upward and downward",
    pain:
      "You lose influence when you keep reporting problems without shaping decisions — and over time that costs your team clarity, speed, and credibility with executives."
  },
  "Transformation Lead / Strategy Lead": {
    scope:
      "Change delivery, business improvement, implementation, future readiness",
    pain:
      "You can design the right strategy and still lose time, money, and internal support if the system underneath it was never aligned to carry the change."
  },
  "Emerging Leader / Promotion-Ready Manager": {
    scope:
      "Stepping into bigger scope, executive visibility, team leadership, decision-making growth",
    pain:
      "You risk losing visibility, confidence, and promotion momentum when you’ve never been trained to think clearly through pressure, politics, and competing priorities."
  },
  Other: {
    scope: "Leadership judgment, influence, execution, and future readiness",
    pain:
      "Poor leadership judgment can cost the business time, trust, energy, momentum, and decisions that become more expensive the longer they are delayed."
  }
};

const levels = [
  {
    min: 0,
    max: 39,
    title: "The Reluctant Leader",
    suggests:
      "Your result suggests that you may be seeing more than you are currently acting on. You may notice tension, risk, or uncertainty, but hesitate to name it, challenge it, or take ownership of the next move.",
    cost:
      "When leaders avoid judgment, decisions do not disappear. They move elsewhere. Your team may start guessing, overcompensating, or waiting for direction. Over time, this can create slow execution, unclear ownership, hidden frustration, and avoidable mistakes.",
    helps:
      "SLP helps you build the confidence, language, and judgment lenses to step into difficult leadership moments earlier, without becoming reactive, political, or exposed."
  },
  {
    min: 40,
    max: 59,
    title: "The Curious Explorer",
    suggests:
      "Your result suggests that you are asking questions and noticing that something may be happening beneath the surface. But your questions may not yet be sharp enough to reveal the real signal.",
    cost:
      "Surface-level questions can create surface-level confidence. Leaders may believe they have checked the risk when they have only checked the obvious. This can lead to poor forecasting, missed margin opportunities, weak challenge in meetings, and teams executing plans that were never properly pressure-tested.",
    helps:
      "SLP helps you ask sharper questions, separate noise from signal, and connect what you are noticing to business consequence before it becomes expensive."
  },
  {
    min: 60,
    max: 79,
    title: "The Developing Leader",
    suggests:
      "Your result suggests that you are already reading more than the obvious signals. You are noticing risk, people dynamics, trade-offs, and future pressure points. You may be asking better questions than most leaders in the room.",
    cost:
      "Insight without movement can still become delay. If you see the signal but do not translate it into action, the business can lose time, energy, trust, and momentum. Teams may keep circling the same issues, leaders may keep debating instead of deciding, and opportunities may weaken while competitors move.",
    helps:
      "SLP helps you turn signal-reading into action: what to challenge, what to influence, what to test, when to move, and how to bring others with you."
  },
  {
    min: 80,
    max: 100,
    title: "The Judgment Architect",
    suggests:
      "Your result suggests that you are already reading beneath the surface. You can spot signals, weigh consequences, influence the right people, and move from insight to action with clarity.",
    cost:
      "At this level, the risk is not lack of judgment. The risk is that your judgment stays too dependent on you. If your team cannot see what you see, ask the questions you ask, or act with the same clarity, the business still slows down when you are not in the room.",
    helps:
      "SLP helps you turn instinctive leadership judgment into shared language, repeatable practice, and development conversations. It gives you a way to identify where other leaders are missing signals, asking weak questions, avoiding action, or failing to influence effectively."
  }
];

const dimensionCopy = {
  strongest: {
    signal_awareness:
      "You are noticing more than the obvious. You are paying attention to signals in people, performance, market demand, timing, and execution risk.",
    judgment_quality:
      "You are able to weigh trade-offs, consequence, influence, control, and timing before moving. You are not only reacting to what is visible.",
    action_readiness:
      "You are oriented toward movement. You are thinking about what needs to happen next, who needs to be involved, and how insight becomes execution."
  },
  growth: {
    signal_awareness:
      "You may be moving through decisions without fully reading the signals around people, market shifts, capacity, timing, or future pressure. The risk is acting on an incomplete picture.",
    judgment_quality:
      "You may be noticing the right things, but not yet weighing the trade-offs, influence dynamics, timing, or consequences deeply enough before deciding.",
    action_readiness:
      "You may be seeing and understanding the signal, but not yet converting it into a clear next move. The risk is that insight stays in your head while the business keeps moving."
  },
  labels: {
    signal_awareness: "Signal Awareness",
    judgment_quality: "Judgment Quality",
    action_readiness: "Action Readiness"
  }
};

const scoringConfig = {
  q1: {
    id: "Q1",
    theme: "Managing Up",
    signal: [
      "data",
      "capacity",
      "timing",
      "politic",
      "team",
      "pressure",
      "margin",
      "risk",
      "evidence",
      "consequence",
      "customer"
    ],
    judgment: [
      "influence",
      "relationship",
      "trust",
      "timing",
      "frame",
      "private",
      "alignment",
      "trade-off",
      "consequence"
    ],
    action: [
      "conversation",
      "meeting",
      "prepare",
      "evidence",
      "ask",
      "challenge",
      "propose",
      "follow up",
      "next step"
    ]
  },
  q2: {
    id: "Q2",
    theme: "Managing Down / Influence",
    signal: [
      "silence",
      "hesitation",
      "pushback",
      "confusion",
      "trust",
      "capacity",
      "ownership",
      "safety",
      "resistance",
      "alignment"
    ],
    judgment: [
      "influence",
      "clarity",
      "trust",
      "ownership",
      "accountability",
      "momentum",
      "safety",
      "execution",
      "context"
    ],
    action: [
      "one-on-one",
      "clarify",
      "reframe",
      "invite",
      "adjust",
      "rollout",
      "capacity",
      "owner",
      "ownership",
      "follow up",
      "next"
    ]
  },
  q3: {
    id: "Q3",
    theme: "Future Shaping / Market Signals",
    signal: [
      "customer",
      "demand",
      "market",
      "margin",
      "competitor",
      "buying",
      "behaviour",
      "behavior",
      "product",
      "service",
      "shift"
    ],
    judgment: [
      "business model",
      "systems",
      "capacity",
      "product mix",
      "trade-off",
      "capability",
      "constraint",
      "future",
      "risk",
      "operational",
      "strategic",
      "tension"
    ],
    action: [
      "pilot",
      "test",
      "validate",
      "experiment",
      "review",
      "pivot",
      "capability",
      "system",
      "capacity",
      "product",
      "stop",
      "start",
      "next"
    ]
  },
  q4: {
    id: "Q4",
    theme: "Future Shaping / Alternative Futures",
    signal: [
      "risk",
      "shift",
      "shock",
      "horizon",
      "future",
      "market",
      "change",
      "strategy",
      "core",
      "pressure",
      "revenue",
      "opportunity",
      "growth"
    ],
    judgment: [
      "core",
      "alternative",
      "future",
      "trade-off",
      "overcommit",
      "scenario",
      "strategic",
      "option",
      "tension",
      "revenue",
      "market",
      "opportunity"
    ],
    action: [
      "pilot",
      "test",
      "experiment",
      "scenario",
      "trigger",
      "capability",
      "market test",
      "plan",
      "owner",
      "prepare",
      "revenue stream",
      "opportunity"
    ]
  }
};

function showStep(step) {
  document.querySelectorAll("[data-step]").forEach((section) => {
    section.classList.toggle("hidden", section.dataset.step !== step);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function initializeProfileFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const values = {
    firstName: params.get("first_name") || params.get("firstName") || "",
    lastName: params.get("last_name") || params.get("lastName") || "",
    email: params.get("email") || "",
    linkedin: params.get("linkedin_profile") || params.get("linkedin") || ""
  };

  const hasCapturedEmail = Boolean(values.email);
  if (!hasCapturedEmail) return;

  state.entryMode = "systeme_early_access";

  Object.entries(values).forEach(([name, value]) => {
    if (!value) return;
    const field = document.querySelector(`[name="${name}"]`);
    if (field) {
      field.value = value;
      field.closest("label")?.classList.add("prefilled-field");
    }
  });

  const profileHeading = document.querySelector("[data-profile-heading]");
  const profileIntro = document.querySelector("[data-profile-intro]");

  if (profileHeading) {
    profileHeading.textContent = "Tell us the leadership context behind your score";
  }

  if (profileIntro) {
    profileIntro.textContent =
      "You have already joined early access. Add the leadership context for this assessment so your report is more useful.";
  }
}

function countMatches(text, words) {
  const normalized = text.toLowerCase();
  return words.reduce((total, word) => {
    return normalized.includes(word.toLowerCase()) ? total + 1 : total;
  }, 0);
}

function hasSpecificEvidence(answer) {
  const normalized = answer.toLowerCase();
  return [
    /\b\d+(\.\d+)?\s?(%|percent|months?|weeks?|quarters?|years?|people|clients?|customers?|days?)\b/i,
    /\b(last|next|this|past|current|quarter|month|week|year|six months|two quarters)\b/i,
    /\b(customer|client|team|ceo|board|cfo|sales|margin|cash|forecast|pipeline|capacity|burnout|retention|rework|delay)\b/i
  ].some((pattern) => pattern.test(normalized));
}

function hasConsequenceLanguage(answer) {
  const normalized = answer.toLowerCase();
  return [
    "cost",
    "risk",
    "because",
    "therefore",
    "so that",
    "if",
    "then",
    "impact",
    "consequence",
    "trade-off",
    "trade off",
    "margin",
    "cash",
    "trust",
    "delay",
    "rework",
    "momentum"
  ].some((word) => normalized.includes(word));
}

function hasActionSpecificity(answer) {
  const normalized = answer.toLowerCase();
  return [
    "owner",
    "by when",
    "deadline",
    "next step",
    "follow up",
    "follow-up",
    "meeting",
    "one-on-one",
    "pilot",
    "test",
    "review",
    "decision gate",
    "measure",
    "track",
    "sequence",
    "accountable",
    "responsible"
  ].some((word) => normalized.includes(word));
}

function capScore(score, cap) {
  return Math.min(score, cap);
}

function includesAny(answer, words) {
  const normalized = answer.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function matchesAny(answer, patterns) {
  return patterns.some((pattern) => pattern.test(answer));
}

function scoreSignalAwareness(answer, words) {
  let score = 0;
  if (countMatches(answer, words) > 0) score += 1;
  if (includesAny(answer, ["customer", "client", "team", "ceo", "board", "sales", "cfo", "market", "competitor", "employee", "people"])) score += 1;
  if (hasSpecificEvidence(answer)) score += 1;
  if (hasConsequenceLanguage(answer)) score += 1;
  if (
    includesAny(answer, [
      "this tells me",
      "this told me",
      "this suggests",
      "pattern",
      "trend",
      "underneath",
      "beneath",
      "noticing",
      "what it means",
      "root cause"
    ])
  ) {
    score += 1;
  }
  return score;
}

function scoreJudgmentQuality(answer, words) {
  let score = 0;
  if (countMatches(answer, words) > 0) score += 1;
  if (includesAny(answer, ["influence", "timing", "relationship", "trust", "control", "in my control", "outside my control", "stakeholder"])) score += 1;
  if (includesAny(answer, ["trade-off", "trade off", "weigh", "balance", "option", "alternative", "scenario", "choice"])) score += 1;
  if (hasConsequenceLanguage(answer)) score += 1;
  if (includesAny(answer, ["frame", "private", "alignment", "safety", "clarity", "ownership", "bring them with", "buy-in", "buy in"])) score += 1;
  return score;
}

function scoreActionReadiness(answer, words) {
  let score = 0;
  if (countMatches(answer, words) > 0) score += 1;
  if (hasActionSpecificity(answer)) score += 1;
  if (matchesAny(answer, [/\b(by|within|after|before|next|first|then|weekly|monthly|quarterly)\b/i])) score += 1;
  if (includesAny(answer, ["measure", "track", "owner", "accountable", "responsible", "decision gate", "checkpoint", "metric", "kpi", "review"])) score += 1;
  if (includesAny(answer, ["clarify", "reframe", "pilot", "test", "follow up", "one-on-one", "meeting", "sequence", "pause", "adjust", "implement"])) score += 1;
  return score;
}

function scoreDimension(answer, words, dimension) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 12) return 0;

  let score = 0;
  if (dimension === "signal_awareness") score = scoreSignalAwareness(answer, words);
  if (dimension === "judgment_quality") score = scoreJudgmentQuality(answer, words);
  if (dimension === "action_readiness") score = scoreActionReadiness(answer, words);

  if (wordCount < 35) return capScore(score, 2);
  if (wordCount < 55) return capScore(score, 4);
  return capScore(score, 5);
}

function summarizeAnswer(answer) {
  const clean = answer.trim().replace(/\s+/g, " ");
  if (clean.length <= 170) return clean;
  return `${clean.slice(0, 167)}...`;
}

function blindSpot(scores) {
  const lowest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
  if (lowest === "signal_awareness") {
    return "May need to name the signal more specifically before moving to interpretation or action.";
  }
  if (lowest === "judgment_quality") {
    return "May need to weigh influence, timing, trade-offs, and consequence more clearly.";
  }
  return "May need to convert insight into a practical next move with clearer ownership.";
}

function scoreQuestion(key, answer) {
  const config = scoringConfig[key];
  const signalAwareness = scoreDimension(answer, config.signal, "signal_awareness");
  const judgmentQuality = scoreDimension(answer, config.judgment, "judgment_quality");
  const actionReadiness = scoreDimension(answer, config.action, "action_readiness");
  const scores = {
    signal_awareness: signalAwareness,
    judgment_quality: judgmentQuality,
    action_readiness: actionReadiness
  };
  return {
    question_id: config.id,
    theme: config.theme,
    answer,
    signal_awareness: signalAwareness,
    judgment_quality: judgmentQuality,
    action_readiness: actionReadiness,
    total: signalAwareness + judgmentQuality + actionReadiness,
    answer_summary: summarizeAnswer(answer),
    possible_blind_spot: blindSpot(scores)
  };
}

function levelForScore(score) {
  return levels.find((level) => score >= level.min && score <= level.max);
}

function dimensionTotals(questionScores) {
  return questionScores.reduce(
    (totals, item) => {
      totals.signal_awareness += item.signal_awareness;
      totals.judgment_quality += item.judgment_quality;
      totals.action_readiness += item.action_readiness;
      return totals;
    },
    { signal_awareness: 0, judgment_quality: 0, action_readiness: 0 }
  );
}

function strongestAndLowest(totals) {
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  return {
    strongest: sorted[0][0],
    lowest: sorted[sorted.length - 1][0]
  };
}

function leadQuality(totalScore, profile, questionScores) {
  const reflectionTotal = questionScores.reduce((sum, item) => sum + item.total, 0);
  const senior = /ceo|executive|c-suite|senior|founder/i.test(profile.seniority || "");
  if (senior && reflectionTotal >= 34) return "Priority";
  if (reflectionTotal >= 30 || totalScore >= 65) return "High Potential";
  if (reflectionTotal >= 18) return "Nurture";
  return "Low Fit";
}

function calibrateTotalScore(rawScore, totals) {
  const compressedScore = Math.round(50 + (rawScore - 50) * 0.65);
  const exceptionalReadiness =
    totals.signal_awareness >= 17 &&
    totals.judgment_quality >= 17 &&
    totals.action_readiness >= 16;
  const ceiling = exceptionalReadiness ? 82 : 74;
  return Math.min(ceiling, Math.max(50, compressedScore));
}

function buildResult() {
  const scenario = scenarioMap[state.scenarioChoice];
  const roleProfile = rolePainPoints[state.profile.role] || rolePainPoints.Other;
  const questionScores = Object.entries(state.reflections).map(([key, answer]) =>
    scoreQuestion(key, answer)
  );
  const totals = dimensionTotals(questionScores);
  const dimensions = strongestAndLowest(totals);
  const totalReflectionScore = questionScores.reduce((sum, item) => sum + item.total, 0);
  const actionPenalty = actionReadinessPenalty(totals.action_readiness);
  const rawScore = Math.max(0, scenario.score + totalReflectionScore - actionPenalty);
  const totalScore = calibrateTotalScore(rawScore, totals);
  const level = levelForScore(totalScore);
  const sharedProduct =
    "SLP is built in short, focused chapters with practical leadership lenses, flashcards, worksheets, scenario-based reflection, and the SLP Companion Tool to help you apply the learning to real leadership moments.";
  const sharedValue =
    "The value is not more leadership theory. It is the ability to see the signal earlier, ask the sharper question, influence the right conversation, and move before delay becomes expensive. That can save time, protect cash and margin, reduce rework, create clearer direction, and help you keep high-potential people who may otherwise disengage when the business feels unclear, slow, or misaligned.";
  const volumeOneValue =
    "Volume 1 focuses on Managing Up and Down and Future Shaping. It helps you challenge upward without burning relationship capital, influence your team with more clarity and ownership, read market and customer signals earlier, and test alternative futures before pressure forces the decision.";
  const earlyAccessOffer =
    "Now that you have joined the early access list, you will be considered for limited early access pricing. As a thank you for being one of the first people to see why SLP exists, early access members will stay on the early access list for future volumes too, with lifetime early access pricing opportunities as new SLP volumes open.";

  return {
    user: {
      first_name: state.profile.firstName,
      last_name: state.profile.lastName,
      email: state.profile.email,
      linkedin_profile: state.profile.linkedin || "",
      role: state.profile.role,
      role_scope: roleProfile.scope,
      role_pain_point: roleProfile.pain,
      seniority_level: state.profile.seniority,
      industry: state.profile.industry,
      team_size: state.profile.teamSize,
      biggest_leadership_pressure: state.profile.pressure
    },
    assessment: {
      scenario_choice: state.scenarioChoice,
      scenario_score: scenario.score,
      scenario_instinct: scenario.instinct,
      total_reflection_score: totalReflectionScore,
      action_readiness_penalty: actionPenalty,
      raw_score: rawScore,
      total_score: totalScore,
      judgment_level: level.title,
      strongest_dimension: dimensionCopy.labels[dimensions.strongest],
      growth_edge: dimensionCopy.labels[dimensions.lowest]
    },
    dimension_scores: totals,
    question_scores: questionScores,
    user_report: {
      headline: `${state.profile.firstName}, your SLP Judgment Score is ${totalScore}/100`,
      score_summary: `Your result is ${level.title}. Your scenario instinct is ${scenario.instinct}.`,
      what_this_suggests: level.suggests,
      scenario_instinct_summary: scenario.summary,
      strongest_area_summary: dimensionCopy.strongest[dimensions.strongest],
      growth_edge_summary: dimensionCopy.growth[dimensions.lowest],
      role_pain_point: roleProfile.pain,
      what_this_may_be_costing_you: level.cost,
      why_slp_matters: `${level.helps} ${sharedValue}`,
      volume_one_value: volumeOneValue,
      what_slp_includes: sharedProduct,
      why_janine_built_slp:
        "I built the Secret Leadership Playbook because too many capable leaders are carrying decisions they were never properly trained to make. They are expected to read the room, manage up, lead teams, protect performance, shape the future, and make complex calls under pressure, often without a practical system for how to think through those moments.\n\nSLP is my way of making that invisible leadership work visible, practical, and easier to apply.",
      early_access_offer: earlyAccessOffer,
      testimonial:
        "Testimonial placeholder: “Volume 1 helped me put language to decisions I had been carrying quietly. It showed me where I was reporting problems instead of shaping decisions, and where future signals were already visible but not yet being acted on.”",
      cta:
        "You are now on the SLP early access list. Use this report as a mirror for the leadership moments you are carrying now, and watch your inbox for what opens next."
    },
    janine_report: {
      lead_quality_signal: leadQuality(totalScore, state.profile, questionScores),
      assessment_summary: `${state.profile.firstName} ${state.profile.lastName} scored ${totalScore}/100 as ${level.title}. Their instinct was ${scenario.instinct}. Strongest area: ${dimensionCopy.labels[dimensions.strongest]}. Growth edge: ${dimensionCopy.labels[dimensions.lowest]}.`,
      role_scope: roleProfile.scope,
      role_pain_point: roleProfile.pain,
      key_blind_spots: questionScores.map((item) => `${item.question_id}: ${item.possible_blind_spot}`),
      recommended_follow_up_angle: followUpAngle(dimensions.lowest),
      suggested_coaching_question: coachingQuestion(dimensions.lowest),
      suggested_slp_bridge: bridgeForProfile(state.profile.pressure, dimensions.lowest)
    }
  };
}

function actionReadinessPenalty(actionReadinessTotal) {
  if (actionReadinessTotal <= 6) return 12;
  if (actionReadinessTotal <= 9) return 8;
  if (actionReadinessTotal <= 12) return 4;
  return 0;
}

function followUpAngle(lowest) {
  if (lowest === "signal_awareness") {
    return "Reflect back the signal-reading gap and ask what pressure they may not have fully named yet.";
  }
  if (lowest === "judgment_quality") {
    return "Explore how they are weighing timing, influence, trade-offs, and consequence in a live decision.";
  }
  return "Focus on the gap between what they already see and the leadership move they have not made yet.";
}

function coachingQuestion(lowest) {
  if (lowest === "signal_awareness") {
    return "What signal do you think your team or market has been sending for a while that you have not fully named yet?";
  }
  if (lowest === "judgment_quality") {
    return "What trade-off are you currently managing that feels simple on the surface but complex underneath?";
  }
  return "What is one leadership move you already know you need to make, but have not yet translated into action?";
}

function bridgeForProfile(pressure, lowest) {
  if (/market|future|strategic/i.test(pressure || "")) {
    return "Future Shaping";
  }
  if (/team|managing|influencing|authority/i.test(pressure || "")) {
    return "Managing Up and Down";
  }
  if (lowest === "action_readiness") {
    return "Both: Managing Up and Down plus Future Shaping";
  }
  return "Start with the first available SLP volumes: Managing Up and Down and Future Shaping";
}

function renderResults(result) {
  const totals = result.dimension_scores;
  const maxDimensionScore = 20;
  const content = document.getElementById("results-content");
  content.innerHTML = `
    <div class="step-header">
      <p class="eyebrow">Step 5 of 5</p>
      <h2>Your SLP Judgment Score</h2>
    </div>
    <div class="results-layout">
      <section class="score-hero">
        <div class="score-panel">
          <p>${result.user.first_name}, your score is</p>
          <div class="score-number">${result.assessment.total_score}<span>/100</span></div>
          <h3>${result.assessment.judgment_level}</h3>
        </div>
        <div class="score-summary-panel">
          <div class="pill-row">
            <span class="pill">${result.assessment.scenario_instinct}</span>
            <span class="pill">Strongest: ${result.assessment.strongest_dimension}</span>
            <span class="pill">Growth Edge: ${result.assessment.growth_edge}</span>
          </div>
          <h3>What This Suggests</h3>
          <p>${result.user_report.what_this_suggests}</p>
          <p>${result.user_report.scenario_instinct_summary}</p>
        </div>
      </section>

      <section class="dimension-card">
        <h3>Your Score Breakdown</h3>
        <div class="dimension-bars">
          ${Object.entries(totals)
            .map(
              ([key, value]) => `
              <div>
                <div class="bar-label">
                  <span>${dimensionCopy.labels[key]}</span>
                  <span>${value}/${maxDimensionScore}</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${(value / maxDimensionScore) * 100}%"></div>
                </div>
              </div>`
            )
            .join("")}
        </div>
      </section>

      <section class="result-card-grid">
        <div class="result-section result-card">
          <h3>Your Strongest Area</h3>
          <p>${result.user_report.strongest_area_summary}</p>
        </div>
        <div class="result-section result-card">
          <h3>Your Growth Edge</h3>
          <p>${result.user_report.growth_edge_summary}</p>
        </div>
        <div class="result-section result-card">
          <h3>Your Role Pressure Point</h3>
          <p>${result.user_report.role_pain_point}</p>
        </div>
        <div class="result-section result-card cost-card">
          <h3>What This May Be Costing You</h3>
          <p>${result.user_report.what_this_may_be_costing_you}</p>
        </div>
      </section>

      <section class="result-feature-grid">
        <div class="result-section value-callout">
          <h3>Why SLP Matters</h3>
          <p>${result.user_report.why_slp_matters}</p>
        </div>
        <div class="result-section value-callout">
          <h3>What Volume 1 Helps You Do</h3>
          <p>${result.user_report.volume_one_value}</p>
        </div>
      </section>

      <section class="result-feature-grid">
        <div class="result-section">
          <h3>What You Get Inside SLP</h3>
          <ul class="result-bullets">
            ${slpIncludesBullets.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="result-section janine-block">
          <h3>Why Janine Built SLP</h3>
          ${result.user_report.why_janine_built_slp
            .split("\n\n")
            .map((paragraph) => `<p>${paragraph}</p>`)
            .join("")}
        </div>
      </section>

      <section class="result-section cta-panel">
        <h3>What Happens Next</h3>
        <p>${result.user_report.cta}</p>
        <p>${result.user_report.early_access_offer}</p>
        <div class="action-row">
          <button class="primary-action" type="button" id="email-user-report">Email My Report To Me</button>
          <button class="secondary-action" type="button" id="book-coaching-call">Book a Coaching Call</button>
        </div>
      </section>
    </div>
  `;

  document.getElementById("email-user-report").addEventListener("click", () => {
    emailUserReport(result);
  });
  document.getElementById("book-coaching-call").addEventListener("click", () => {
    bookCoachingCall(result);
  });
}

function userReportText(result) {
  return [
    result.user_report.headline,
    "",
    result.user_report.score_summary,
    "",
    "What this suggests:",
    result.user_report.what_this_suggests,
    "",
    "Scenario instinct:",
    result.user_report.scenario_instinct_summary,
    "",
    "Strongest area:",
    result.user_report.strongest_area_summary,
    "",
    "Growth edge:",
    result.user_report.growth_edge_summary,
    "",
    "Your role pressure point:",
    result.user_report.role_pain_point,
    "",
    "What this may be costing you:",
    result.user_report.what_this_may_be_costing_you,
    "",
    "Why SLP matters:",
    result.user_report.why_slp_matters,
    "",
    "What Volume 1 helps you do:",
    result.user_report.volume_one_value,
    "",
    "What you get inside SLP:",
    result.user_report.what_slp_includes,
    "",
    "Why Janine built SLP:",
    result.user_report.why_janine_built_slp,
    "",
    "Early access:",
    result.user_report.early_access_offer
  ].join("\n");
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function emailUserReport(result) {
  if (earlyAccessConfig.webhookEndpoint) {
    submitLeadSilently(earlyAccessConfig.webhookEndpoint, reportPayload(result, "Report requested"));
    alert("Your report request has been sent. If Make is active, your report email and spreadsheet row should process shortly.");
    return;
  }

  copyText(userReportText(result));
  alert(
    "Your report has been copied for now. Once email delivery is connected, this button will send the report to your inbox automatically."
  );
}

function reportPayload(result, eventName) {
  return {
    event: eventName,
    submitted_at: new Date().toISOString(),
    submitted_at_local: new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" }),
    source: "SLP Judgment Score",
    first_name: result.user.first_name,
    last_name: result.user.last_name,
    email: result.user.email,
    linkedin_profile: result.user.linkedin_profile,
    role: result.user.role,
    role_scope: result.user.role_scope,
    role_pain_point: result.user.role_pain_point,
    seniority_level: result.user.seniority_level,
    industry: result.user.industry,
    team_size: result.user.team_size,
    biggest_leadership_pressure: result.user.biggest_leadership_pressure,
    scenario_choice: result.assessment.scenario_choice,
    scenario_score: result.assessment.scenario_score,
    scenario_instinct: result.assessment.scenario_instinct,
    total_reflection_score: result.assessment.total_reflection_score,
    action_readiness_penalty: result.assessment.action_readiness_penalty,
    slp_score: result.assessment.total_score,
    judgment_level: result.assessment.judgment_level,
    strongest_dimension: result.assessment.strongest_dimension,
    growth_edge: result.assessment.growth_edge,
    q1_managing_up: state.reflections.q1 || "",
    q2_managing_down_influence: state.reflections.q2 || "",
    q3_future_shaping_market_signals: state.reflections.q3 || "",
    q4_future_shaping_alternative_futures: state.reflections.q4 || "",
    q1_score: result.question_scores[0]?.total || 0,
    q2_score: result.question_scores[1]?.total || 0,
    q3_score: result.question_scores[2]?.total || 0,
    q4_score: result.question_scores[3]?.total || 0,
    lead_quality_signal: result.janine_report.lead_quality_signal,
    follow_up_angle: result.janine_report.recommended_follow_up_angle,
    suggested_coaching_question: result.janine_report.suggested_coaching_question,
    suggested_slp_bridge: result.janine_report.suggested_slp_bridge,
    user_report: userReportText(result),
    janine_report: JSON.stringify(result.janine_report)
  };
}

function bookCoachingCall(result) {
  if (coachingCallUrl) {
    window.open(coachingCallUrl, "_blank", "noopener");
    return;
  }

  alert("Add your coaching booking link and this button will open it directly.");
}

function submitEarlyAccessSignup(profile) {
  const lead = {
    event: "Assessment started",
    submitted_at: new Date().toISOString(),
    submitted_at_local: new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" }),
    first_name: profile.firstName,
    last_name: profile.lastName,
    email: profile.email,
    linkedin_profile: profile.linkedin || "",
    role: profile.role,
    seniority_level: profile.seniority,
    industry: profile.industry,
    team_size: profile.teamSize,
    biggest_leadership_pressure: profile.pressure,
    source: "SLP Judgment Score",
    signup_stage: "Assessment started",
    entry_mode: state.entryMode
  };

  if (earlyAccessConfig.leadWebhookEndpoint) {
    submitLeadSilently(earlyAccessConfig.leadWebhookEndpoint, lead);
    return;
  }

  if (earlyAccessConfig.formEndpoint) {
    submitLeadSilently(earlyAccessConfig.formEndpoint, lead);
  }
}

function joinEarlyAccess(result) {
  const lead = {
    first_name: result.user.first_name,
    last_name: result.user.last_name,
    email: result.user.email,
    linkedin_profile: result.user.linkedin_profile,
    role: result.user.role,
    seniority_level: result.user.seniority_level,
    industry: result.user.industry,
    team_size: result.user.team_size,
    biggest_leadership_pressure: result.user.biggest_leadership_pressure,
    slp_score: result.assessment.total_score,
    judgment_level: result.assessment.judgment_level,
    scenario_instinct: result.assessment.scenario_instinct,
    strongest_dimension: result.assessment.strongest_dimension,
    growth_edge: result.assessment.growth_edge,
    user_report: userReportText(result),
    janine_report: JSON.stringify(result.janine_report)
  };

  if (earlyAccessConfig.webhookEndpoint) {
    submitLeadToWebhook(earlyAccessConfig.webhookEndpoint, lead, earlyAccessConfig.redirectUrl);
    return;
  }

  if (earlyAccessConfig.formEndpoint) {
    submitLeadToSysteme(earlyAccessConfig.formEndpoint, lead, earlyAccessConfig.redirectUrl);
    return;
  }

  const url = new URL(earlyAccessConfig.redirectUrl);
  Object.entries(lead).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  window.location.href = url.toString();
}

function submitLeadSilently(endpoint, lead) {
  const iframeName = "early-access-signup-frame";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.target = iframeName;
  form.style.display = "none";

  Object.entries(lead).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value || "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function submitReportToWebhook(endpoint, payload) {
  fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  }).catch(() => {
    submitLeadSilently(endpoint, payload);
  });
}

function submitLeadToSysteme(endpoint, lead, redirectUrl) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.style.display = "none";

  Object.entries(lead).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value || "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

function submitLeadToWebhook(endpoint, lead, redirectUrl) {
  const iframeName = "early-access-webhook-frame";
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`);

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.target = iframeName;
  form.style.display = "none";

  Object.entries(lead).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value || "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 900);
}

document.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => showStep(button.dataset.next));
});

document.getElementById("profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = formValues(event.currentTarget);
  submitEarlyAccessSignup(state.profile);
  showStep("scenario");
});

document.getElementById("decision-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.scenarioChoice = formValues(event.currentTarget).scenarioChoice;
  showStep("reflection");
});

document.getElementById("reflection-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitReflectionForm(event.currentTarget);
});

document.querySelectorAll(".record-action").forEach((button) => {
  button.addEventListener("click", () => toggleRecording(button));
});

initializeProfileFromUrl();

async function submitReflectionForm(form) {
  const submitButton = form.querySelector("button[type='submit']");
  state.reflections = formValues(form);
  submitButton.disabled = true;
  submitButton.textContent = "Calculating...";

  try {
    state.result = buildResult();
    state.result.user_report.ai_notice =
      "MVP 0 note: This result uses the built-in SLP rubric scoring engine. No external AI account is required for this version.";
  } catch (error) {
    console.warn("Local scoring unavailable.", error);
    state.result = buildResult();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Calculate My Judgment Score";
  }

  renderResults(state.result);
  showStep("results");
}

async function toggleRecording(button) {
  const target = button.dataset.target;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setStatus(target, "Voice typing is not supported in this browser. Open this link in Chrome or Edge, or type your answer here.");
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus(target, "This browser is not giving the page microphone access. Open the link in Chrome or Edge.");
    return;
  }

  if (recorderState.recognition && recorderState.target === target) {
    recorderState.recognition.stop();
    return;
  }

  if (recorderState.recognition) {
    setStatus(target, "Finish the current voice answer first.");
    return;
  }

  try {
    const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    permissionStream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    setStatus(target, "Microphone permission was blocked. Allow microphone access in the browser, or open this link in Chrome or Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recorderState.recognition = recognition;
  recorderState.target = target;
  recorderState.transcript = "";
  recorderState.button = button;
  recorderState.errorMessage = "";

  recognition.addEventListener("result", (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }

    if (finalTranscript.trim()) {
      recorderState.transcript = `${recorderState.transcript} ${finalTranscript}`.trim();
      appendTranscript(target, finalTranscript);
    }

    setStatus(
      target,
      interimTranscript.trim()
        ? `Listening: ${interimTranscript.trim()}`
        : "Listening..."
    );
  });

  recognition.addEventListener("end", () => {
    button.textContent = "Start Voice Answer";
    setStatus(
      target,
      recorderState.errorMessage
        ? recorderState.errorMessage
        : recorderState.transcript
        ? "Voice answer added. You can edit it before submitting."
        : "Recording stopped. If no words appeared, check microphone permission and try again."
    );
    cleanupRecorder();
  });

  recognition.addEventListener("error", (event) => {
    const messages = {
      "not-allowed": "Microphone permission was blocked. Allow microphone access in the browser and try again.",
      "no-speech": "I could not hear speech. Try again and speak clearly after clicking Start Voice Answer.",
      "audio-capture": "No microphone was found. Check that your microphone is connected and allowed.",
      "network": "This browser could not connect to its voice typing service. Open the link in Chrome or Edge and try again."
    };
    recorderState.errorMessage = messages[event.error] || "Voice typing was interrupted. You can try again or type your answer.";
    setStatus(target, recorderState.errorMessage);
    button.textContent = "Start Voice Answer";
  });

  try {
    recognition.start();
    button.textContent = "Stop Voice Answer";
    setStatus(target, "Listening...");
  } catch (error) {
    setStatus(target, "Voice typing could not start. Please try again or type your answer.");
    cleanupRecorder();
  }
}

function appendTranscript(target, transcript) {
  const textarea = document.querySelector(`textarea[name="${target}"]`);
  if (!textarea) return;
  textarea.value = textarea.value
    ? `${textarea.value.trim()} ${transcript.trim()}`.trim()
    : transcript.trim();
}

function cleanupRecorder() {
  recorderState.recognition = null;
  recorderState.target = "";
  recorderState.transcript = "";
  recorderState.button = null;
  recorderState.errorMessage = "";
}

function setStatus(target, message) {
  const status = document.querySelector(`[data-status="${target}"]`);
  if (status) status.textContent = message;
}
