if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function landAtPageTop() {
  if (window.location.hash) return;
  window.setTimeout(() => window.scrollTo(0, 0), 0);
}

landAtPageTop();
window.addEventListener("pageshow", landAtPageTop);

const companionState = {
  profile: null,
  activeWorksheet: null,
  scenarioCards: [],
  scenarioIndex: 0,
  horizonMap: null,
  recognition: null,
  recorderTarget: null
};

const companionAccess = new URLSearchParams(window.location.search).get("access");
const isPreviewMode = companionAccess === "preview";
const requestedTool = new URLSearchParams(window.location.search).get("tool");

const worksheets = {
  "managing-up": {
    title: "Managing Up and Down",
    volume: "Volume 1",
    questions: [
      {
        id: "upward_signal",
        label: "What decision, tension, or leadership signal needs to be named?",
        prompt:
          "Describe the situation clearly. Include who is involved, what you are noticing, and why it matters."
      },
      {
        id: "influence_move",
        label: "What is the influence move?",
        prompt:
          "What conversation, framing, or stakeholder move would help you create clarity without burning trust?"
      },
      {
        id: "team_ownership",
        label: "How will you create clarity and ownership for your team?",
        prompt:
          "Name what your team needs to understand, what they need from you, and what ownership should look like."
      }
    ]
  },
  "future-shaping": {
    title: "Future Shaping: Control & Influence",
    volume: "Volume 1",
    questions: [
      {
        id: "shift_1",
        label: "Risk / Opportunity / Shift 1",
        prompt: "Name the first emerging risk, opportunity, or shift."
      },
      {
        id: "shift_1_control",
        label: "Shift 1: Within My Control",
        prompt: "What is within your control?"
      },
      {
        id: "shift_1_influence",
        label: "Shift 1: Influence but Not Fully Control",
        prompt: "What can you influence?"
      },
      {
        id: "shift_1_no_control",
        label: "Shift 1: No Control",
        prompt: "What is outside your control?"
      },
      {
        id: "shift_2",
        label: "Risk / Opportunity / Shift 2",
        prompt: "Name the second emerging risk, opportunity, or shift."
      },
      {
        id: "shift_2_control",
        label: "Shift 2: Within My Control",
        prompt: "What is within your control?"
      },
      {
        id: "shift_2_influence",
        label: "Shift 2: Influence but Not Fully Control",
        prompt: "What can you influence?"
      },
      {
        id: "shift_2_no_control",
        label: "Shift 2: No Control",
        prompt: "What is outside your control?"
      },
      {
        id: "shift_3",
        label: "Risk / Opportunity / Shift 3",
        prompt: "Name the third emerging risk, opportunity, or shift."
      },
      {
        id: "shift_3_control",
        label: "Shift 3: Within My Control",
        prompt: "What is within your control?"
      },
      {
        id: "shift_3_influence",
        label: "Shift 3: Influence but Not Fully Control",
        prompt: "What can you influence?"
      },
      {
        id: "shift_3_no_control",
        label: "Shift 3: No Control",
        prompt: "What is outside your control?"
      },
      {
        id: "pilot_control_item",
        label: "Control pilot item",
        prompt: "Choose one item within your control."
      },
      {
        id: "pilot_control_action",
        label: "Control pilot action",
        prompt: "What 1-week pilot action will you take?"
      },
      {
        id: "pilot_control_success",
        label: "Control pilot 30-day success",
        prompt: "What would success look like in 30 days?"
      },
      {
        id: "pilot_influence_item",
        label: "Influence pilot item",
        prompt: "Choose one item you can influence."
      },
      {
        id: "pilot_influence_action",
        label: "Influence pilot action",
        prompt: "What 1-week pilot action will you take?"
      },
      {
        id: "pilot_influence_success",
        label: "Influence pilot 30-day success",
        prompt: "What would success look like in 30 days?"
      },
      {
        id: "pilot_no_control_item",
        label: "No-control item",
        prompt: "Choose one item outside your control."
      },
      {
        id: "pilot_no_control_action",
        label: "No-control response action",
        prompt: "What boundary, preparation, or escalation action will you take?"
      },
      {
        id: "pilot_no_control_success",
        label: "No-control 30-day success",
        prompt: "What would success look like in 30 days?"
      },
      {
        id: "reflection_energy",
        label: "Energy audit",
        prompt: "Where do you spend most of your energy: control, influence, or no-control risks?"
      },
      {
        id: "reflection_hard_risk",
        label: "Hard-to-confront risk",
        prompt: "What feels too big, too political, or too complex to confront?"
      },
      {
        id: "reflection_capability",
        label: "Forced capability",
        prompt: "If this repeats for another year, what capability are you being forced to confront?"
      }
    ]
  }
};

const futureShapingExamples = {
  shift_1:
    "Example: Transitioning to an import model could reduce costs and reposition the company to compete more effectively.",
  shift_1_no_control:
    "Example: Imports flooding the market, currency fluctuations, or structural decline in local manufacturing competitiveness.",
  pilot_control_item:
    "Example: Transitioning one key product line into an import cost comparison.",
  pilot_control_action:
    "Example: Run a 1-week financial comparison pilot between current local manufacturing cost and potential import cost.",
  pilot_control_success:
    "Example: Clear cost comparison data to inform leadership discussions.",
  pilot_influence_item:
    "Example: Supply chain and commercial readiness for a possible import model.",
  pilot_influence_action:
    "Example: Schedule a strategy discussion with supply chain and commercial leaders to explore lead times, logistics, and distribution.",
  pilot_influence_success:
    "Example: Leadership alignment that the import model should be seriously evaluated as a strategic option.",
  reflection_capability:
    "Example: Revenue instability may reveal a weak demand engine. Market disruption may reveal no future scenarios."
};

function profileKey(email) {
  return `slp-companion:${email.trim().toLowerCase()}`;
}

function savedProfileKey() {
  return "slp-companion:active-profile";
}

function ensureStoreShape(store) {
  const shaped = store || {};
  shaped.profile = shaped.profile || companionState.profile;
  shaped.worksheets = shaped.worksheets || {};
  shaped.scenarios = shaped.scenarios || {};
  shaped.horizonMaps = shaped.horizonMaps || {};
  return shaped;
}

function getStore() {
  if (!companionState.profile?.email) return null;
  const raw = localStorage.getItem(profileKey(companionState.profile.email));
  return ensureStoreShape(
    raw
      ? JSON.parse(raw)
      : {
          profile: companionState.profile,
          worksheets: {},
          scenarios: {},
          horizonMaps: {}
        }
  );
}

function saveStore(store) {
  localStorage.setItem(profileKey(store.profile.email), JSON.stringify(ensureStoreShape(store)));
  localStorage.setItem(savedProfileKey(), store.profile.email);
}

function showView(viewName) {
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.classList.toggle("hidden", view.dataset.view !== viewName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProfileCard() {
  const name = document.querySelector("[data-profile-name]");
  const email = document.querySelector("[data-profile-email]");
  if (!companionState.profile) {
    name.textContent = "Not signed in";
    email.textContent = "Enter your email to save your worksheet responses on this device.";
    return;
  }
  name.textContent = `${companionState.profile.firstName} ${companionState.profile.lastName}`;
  email.textContent = companionState.profile.email;
}

function statusForWorksheet(store, worksheetId) {
  const saved = store?.worksheets?.[worksheetId];
  if (!saved) return "Not started";
  return `Saved ${new Date(saved.updatedAt).toLocaleDateString()}`;
}

function statusForScenario(store) {
  const saved = store?.scenarios?.["future-shaping-own-scenario"];
  if (!saved) return "Not started";
  return `Saved ${new Date(saved.updatedAt).toLocaleDateString()}`;
}

function statusForHorizon(store) {
  const saved = store?.horizonMaps?.[horizonKey()];
  if (!saved) return "Not started";
  return `Saved ${new Date(saved.updatedAt).toLocaleDateString()}`;
}

function renderDashboard() {
  const store = getStore();
  renderActions(store);
  document.body.classList.toggle("non-member-preview", isPreviewMode);
  const futureCard = document.querySelector("[data-open-volume='volume-1']");
  if (futureCard && isPreviewMode) {
    futureCard.classList.add("locked");
    futureCard.classList.remove("available");
    futureCard.querySelector("span").textContent = "Members only";
    futureCard.querySelector("strong").textContent = "Join SLP to open";
  }
  showView("dashboard");
}

function renderVolume() {
  const store = getStore();
  Object.keys(worksheets).forEach((worksheetId) => {
    const status = document.querySelector(`[data-status="${worksheetId}"]`);
    if (status) status.textContent = statusForWorksheet(store, worksheetId);
  });
  const scenarioStatus = document.querySelector("[data-scenario-status]");
  if (scenarioStatus) scenarioStatus.textContent = statusForScenario(store);
  const horizonStatus = document.querySelector("[data-horizon-status]");
  if (horizonStatus) horizonStatus.textContent = statusForHorizon(store);
  showView("volume");
}

function renderScenarioChoice() {
  const store = getStore();
  const scenarioStatus = document.querySelector("[data-scenario-status]");
  if (scenarioStatus) scenarioStatus.textContent = statusForScenario(store);
  const horizonStatus = document.querySelector("[data-horizon-status]");
  if (horizonStatus) horizonStatus.textContent = statusForHorizon(store);
  showView("scenario-choice");
}

function renderActions(store) {
  const actionList = document.querySelector("[data-action-list]");
  const worksheetActions = Object.entries(store?.worksheets || {}).flatMap(([worksheetId, saved]) => {
    const worksheet = worksheets[worksheetId];
    return normalizeActions(saved).map((action, index) => ({
      ...action,
      worksheetId,
      worksheet,
      index
    }));
  });
  const scenarioActions = Object.entries(store?.scenarios || {}).flatMap(([scenarioId, saved]) => {
    return normalizeActions(saved).map((action, index) => ({
      ...action,
      worksheetId: scenarioId,
      worksheet: {
        volume: "Apply Playbook",
        title: saved.title ? `Scenario: ${saved.title}` : "Build My Own Scenario"
      },
      index
    }));
  });
  const horizonActions = Object.entries(store?.horizonMaps || {}).flatMap(([horizonId, saved]) => {
    return normalizeActions(saved).map((action, index) => ({
      ...action,
      worksheetId: horizonId,
      worksheet: {
        volume: "Apply Playbook",
        title: saved.title ? `3 Horizon Tension Map: ${saved.title}` : "3 Horizon Tension Map"
      },
      index
    }));
  });
  const savedActions = [...worksheetActions, ...scenarioActions, ...horizonActions];

  if (!savedActions.length) {
    actionList.innerHTML = "<p>No actions saved yet. Complete a worksheet to create your first commitment.</p>";
    return;
  }

  actionList.innerHTML = savedActions
    .map((saved) => {
      const calendarLink = saved.dueDate
        ? `<a class="calendar-link" download="${calendarFilename(saved)}" href="${calendarDataUrl(saved)}">Download calendar reminder</a>`
        : "";
      return `
        <article class="action-item">
          <small>${saved.worksheet.volume} / ${saved.worksheet.title}</small>
          <p><strong>${saved.text}</strong></p>
          <div class="action-meta">
            <small>Due: ${saved.dueDate || "No date set"} / Involved: ${saved.owner || "To confirm"}</small>
            ${calendarLink}
          </div>
        </article>
      `;
    })
    .join("");
}

function scenarioKey() {
  return "future-shaping-own-scenario";
}

function getScenarioStore() {
  const store = getStore();
  if (!store.scenarios) store.scenarios = {};
  return store;
}

function sortedScenarioGroups(cards) {
  return {
    control: cards.filter((card) => card.bucket === "control"),
    influence: cards.filter((card) => card.bucket === "influence"),
    "no-control": cards.filter((card) => card.bucket === "no-control")
  };
}

function scenarioReportText() {
  const title = document.querySelector("[data-scenario-title]")?.value.trim() || "Untitled leadership scenario";
  const groups = sortedScenarioGroups(companionState.scenarioCards);
  const insight = document.querySelector("[data-scenario-insight]")?.value.trim() || "";
  const actions = getStore()?.scenarios?.[scenarioKey()]?.actions || [];
  const lines = [
    "SLP Companion - Build My Own Scenario",
    "",
    `Scenario: ${title}`,
    "",
    "INSIGHT",
    insight || "- No insight captured yet.",
    "",
    "CONTROL",
    ...groups.control.map((card) => `- ${card.text}`),
    "",
    "INFLUENCE",
    ...groups.influence.map((card) => `- ${card.text}`),
    "",
    "NO CONTROL",
    ...groups["no-control"].map((card) => `- ${card.text}`),
    "",
    "Unsorted",
    ...companionState.scenarioCards.filter((card) => !card.bucket).map((card) => `- ${card.text}`),
    "",
    "ACTIONS",
    ...(actions.length
      ? actions.map((action) => `- ${action.text} | Due: ${action.dueDate || "No date set"} | Involved: ${action.owner || "To confirm"}`)
      : ["- No actions saved yet."])
  ];

  return lines.join("\n");
}

function wrapPdfText(text, maxLength = 82) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function escapePdfText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfReportLines(text) {
  return text.split("\n").flatMap((line) => {
    if (!line.trim()) return [""];
    return wrapPdfText(line);
  });
}

function buildSimplePdf(text) {
  const lines = pdfReportLines(text);
  const pages = [];
  const pageLineLimit = 38;

  for (let index = 0; index < lines.length; index += pageLineLimit) {
    pages.push(lines.slice(index, index + pageLineLimit));
  }

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontRegular = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBold = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageRefs = [];

  pages.forEach((pageLines) => {
    const stream = pageLines
      .map((line, lineIndex) => {
        const y = 760 - lineIndex * 18;
        const isHeading =
          line &&
          line === line.toUpperCase() &&
          !line.startsWith("-") &&
          line.length < 42;
        const font = isHeading ? "F2" : "F1";
        const size = isHeading ? 13 : 10.5;
        return `BT /${font} ${size} Tf 54 ${y} Td (${escapePdfText(line)}) Tj ET`;
      })
      .join("\n");
    const streamRef = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    pageRefs.push({ streamRef });
  });

  const pagesRef = objects.length + pages.length + 1;
  pageRefs.forEach((page) => {
    page.ref = addObject(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${page.streamRef} 0 R >>`
    );
  });

  const kids = pageRefs.map((page) => `${page.ref} 0 R`).join(" ");
  addObject(`<< /Type /Pages /Kids [${kids}] /Count ${pageRefs.length} >>`);
  const catalogRef = addObject(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function saveScenario() {
  const store = getScenarioStore();
  const title = document.querySelector("[data-scenario-title]")?.value.trim() || "";
  const insight = document.querySelector("[data-scenario-insight]")?.value.trim() || "";
  const previous = store.scenarios[scenarioKey()] || {};
  store.scenarios[scenarioKey()] = {
    ...previous,
    title,
    insight,
    cards: companionState.scenarioCards,
    updatedAt: new Date().toISOString()
  };
  saveStore(store);

  const status = document.querySelector("[data-scenario-save-status]");
  if (status) status.textContent = "Saved on this device.";

  const scenarioStatus = document.querySelector("[data-scenario-status]");
  if (scenarioStatus) scenarioStatus.textContent = statusForScenario(store);
}

function renderScenarioBuckets() {
  const groups = sortedScenarioGroups(companionState.scenarioCards);
  Object.keys(groups).forEach((bucketName) => {
    const bucket = document.querySelector(`[data-scenario-bucket="${bucketName}"]`);
    if (!bucket) return;
    bucket.innerHTML = groups[bucketName].length
      ? groups[bucketName].map((card) => `<div class="scenario-bucket-item">${card.text}</div>`).join("")
      : `<div class="scenario-bucket-empty">Nothing sorted here yet.</div>`;
  });
}

function renderScenarioCard() {
  const current = document.querySelector("[data-scenario-current]");
  const total = document.querySelector("[data-scenario-total]");
  const message = document.querySelector("[data-scenario-message]");
  const activeCard = document.querySelector("[data-scenario-active-card]");
  const card = companionState.scenarioCards[companionState.scenarioIndex];

  if (total) total.textContent = String(companionState.scenarioCards.length);
  if (current) current.textContent = companionState.scenarioCards.length ? String(companionState.scenarioIndex + 1) : "0";

  document.querySelectorAll("[data-scenario-sort]").forEach((button) => {
    button.classList.toggle("is-selected", Boolean(card && card.bucket === button.dataset.scenarioSort));
    button.disabled = !card;
  });

  if (!card) {
    if (activeCard) activeCard.innerHTML = "<p>Your scenario flashcards will appear here one at a time.</p>";
    if (message) message.textContent = "Add your first moving part to begin.";
    renderScenarioBuckets();
    return;
  }

  if (activeCard) activeCard.innerHTML = `<p>${card.text}</p>`;
  if (message) {
    message.textContent = card.bucket
      ? `Sorted into ${card.bucket.replace("-", " ")}. You can change it.`
      : "Choose where this moving part belongs.";
  }

  renderScenarioBuckets();
}

function renderScenarioTool() {
  const store = getScenarioStore();
  const saved = store.scenarios[scenarioKey()];
  const titleInput = document.querySelector("[data-scenario-title]");
  const insightInput = document.querySelector("[data-scenario-insight]");
  const actionTextInput = document.querySelector("[data-scenario-action-text]");
  const actionDueInput = document.querySelector("[data-scenario-action-due]");
  const actionOwnerInput = document.querySelector("[data-scenario-action-owner]");
  companionState.scenarioCards = saved?.cards ? [...saved.cards] : [];
  companionState.scenarioIndex = 0;
  if (titleInput) titleInput.value = saved?.title || "";
  if (insightInput) insightInput.value = saved?.insight || "";
  if (actionTextInput) actionTextInput.value = "";
  if (actionDueInput) actionDueInput.value = "";
  if (actionOwnerInput) actionOwnerInput.value = "";
  renderScenarioCard();
  showView("scenario");
}

function addScenarioCard() {
  const input = document.querySelector("[data-scenario-card-input]");
  const value = input?.value.trim();
  if (!value) return;

  companionState.scenarioCards.push({
    id: `scenario-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: value,
    bucket: ""
  });
  companionState.scenarioIndex = companionState.scenarioCards.length - 1;
  input.value = "";
  renderScenarioCard();
}

function sortScenarioCard(bucket) {
  const card = companionState.scenarioCards[companionState.scenarioIndex];
  if (!card) return;
  card.bucket = bucket;

  const nextUnsorted = companionState.scenarioCards.findIndex((item, index) => index > companionState.scenarioIndex && !item.bucket);
  if (nextUnsorted !== -1) {
    companionState.scenarioIndex = nextUnsorted;
  }
  renderScenarioCard();
  saveScenario();
}

function saveScenarioAction() {
  const actionTextInput = document.querySelector("[data-scenario-action-text]");
  const actionDueInput = document.querySelector("[data-scenario-action-due]");
  const actionOwnerInput = document.querySelector("[data-scenario-action-owner]");
  const status = document.querySelector("[data-scenario-save-status]");
  const text = actionTextInput?.value.trim() || "";
  const dueDate = actionDueInput?.value || "";
  const owner = actionOwnerInput?.value.trim() || "";

  if (!text) {
    if (status) status.textContent = "Add an action before saving it to the dashboard.";
    return;
  }

  const store = getScenarioStore();
  const previous = store.scenarios[scenarioKey()] || {};
  const title = document.querySelector("[data-scenario-title]")?.value.trim() || previous.title || "";
  const insight = document.querySelector("[data-scenario-insight]")?.value.trim() || previous.insight || "";
  const actions = normalizeActions(previous);

  actions.push({ text, dueDate, owner });

  store.scenarios[scenarioKey()] = {
    ...previous,
    title,
    insight,
    cards: companionState.scenarioCards,
    actions,
    updatedAt: new Date().toISOString()
  };

  saveStore(store);
  if (actionTextInput) actionTextInput.value = "";
  if (actionDueInput) actionDueInput.value = "";
  if (actionOwnerInput) actionOwnerInput.value = "";
  if (status) status.textContent = "Action saved to your dashboard.";
  renderActions(store);
}

function moveScenarioCard(direction) {
  if (!companionState.scenarioCards.length) return;
  companionState.scenarioIndex =
    (companionState.scenarioIndex + direction + companionState.scenarioCards.length) %
    companionState.scenarioCards.length;
  renderScenarioCard();
}

function downloadScenarioReport() {
  saveScenario();
  const blob = new Blob([buildSimplePdf(scenarioReportText())], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "slp-my-scenario-report.pdf";
  link.click();
  URL.revokeObjectURL(link.href);
}

function updateScenarioEmailLink() {
  const link = document.querySelector("[data-email-scenario]");
  if (!link) return;
  const subject = encodeURIComponent("My SLP scenario report");
  const body = encodeURIComponent(scenarioReportText());
  link.href = `mailto:?subject=${subject}&body=${body}`;
}

function horizonKey() {
  return "future-shaping-3-horizon-tension-map";
}

function defaultHorizonMap() {
  return {
    title: "",
    team: "",
    budgetMode: "credits",
    currency: "credits",
    budget: 100,
    timeframes: {
      h1: "1-3 years",
      h2: "3-5 years",
      h3: "5+ years"
    },
    periodBudgets: {
      h1: 0,
      h2: 0,
      h3: 0
    },
    investments: [],
    actions: []
  };
}

function getHorizonStore() {
  const store = getStore();
  if (!store.horizonMaps) store.horizonMaps = {};
  return store;
}

function horizonLabels() {
  return {
    h1: {
      number: "Horizon 1",
      title: "Sustain and optimize the core"
    },
    h2: {
      number: "Horizon 2",
      title: "Extend and differentiate"
    },
    h3: {
      number: "Horizon 3",
      title: "Shape the future"
    }
  };
}

function horizonCurrencyLabel(map = companionState.horizonMap) {
  if (!map || map.budgetMode === "credits") return "credits";
  return map.currency || "ZAR";
}

function formatHorizonAmount(amount, map = companionState.horizonMap) {
  const value = Number(amount || 0);
  const label = horizonCurrencyLabel(map);
  if (label === "credits") return `${value} credits`;
  return `${label} ${value.toLocaleString()}`;
}

function horizonSpent(map = companionState.horizonMap) {
  return (map?.investments || [])
    .filter((investment) => !investment.eliminated)
    .reduce((total, investment) => total + Number(investment.amount || 0), 0);
}

function collectHorizonMapFromDom() {
  const existing = companionState.horizonMap || defaultHorizonMap();
  const action = {
    text: document.querySelector("[data-horizon-action-text]")?.value.trim() || "",
    dueDate: document.querySelector("[data-horizon-action-due]")?.value || "",
    owner: document.querySelector("[data-horizon-action-owner]")?.value.trim() || ""
  };
  companionState.horizonMap = {
    ...existing,
    title: document.querySelector("[data-horizon-title]")?.value.trim() || "",
    team: document.querySelector("[data-horizon-team]")?.value.trim() || "",
    budgetMode: document.querySelector("[data-horizon-budget-mode]")?.value || "credits",
    currency: document.querySelector("[data-horizon-currency]")?.value || "credits",
    budget: Number(document.querySelector("[data-horizon-budget]")?.value || 100),
    timeframes: {
      h1: document.querySelector('[data-horizon-timeframe="h1"]')?.value.trim() || "1-3 years",
      h2: document.querySelector('[data-horizon-timeframe="h2"]')?.value.trim() || "3-5 years",
      h3: document.querySelector('[data-horizon-timeframe="h3"]')?.value.trim() || "5+ years"
    },
    periodBudgets: {
      h1: Number(document.querySelector('[data-horizon-period-budget="h1"]')?.value || 0),
      h2: Number(document.querySelector('[data-horizon-period-budget="h2"]')?.value || 0),
      h3: Number(document.querySelector('[data-horizon-period-budget="h3"]')?.value || 0)
    },
    actions: action.text || action.dueDate || action.owner ? [action] : []
  };
  return companionState.horizonMap;
}

function setHorizonForm(map) {
  document.querySelector("[data-horizon-title]").value = map.title || "";
  document.querySelector("[data-horizon-team]").value = map.team || "";
  document.querySelector("[data-horizon-budget-mode]").value = map.budgetMode || "credits";
  document.querySelector("[data-horizon-currency]").value = map.currency || "credits";
  document.querySelector("[data-horizon-budget]").value = map.budget || 100;
  Object.entries(map.timeframes || {}).forEach(([horizon, value]) => {
    const input = document.querySelector(`[data-horizon-timeframe="${horizon}"]`);
    if (input) input.value = value || "";
  });
  Object.entries(map.periodBudgets || {}).forEach(([horizon, value]) => {
    const input = document.querySelector(`[data-horizon-period-budget="${horizon}"]`);
    if (input) input.value = value || 0;
  });
  const action = (map.actions || [])[0] || {};
  document.querySelector("[data-horizon-action-text]").value = action.text || "";
  document.querySelector("[data-horizon-action-due]").value = action.dueDate || "";
  document.querySelector("[data-horizon-action-owner]").value = action.owner || "";
}

function renderHorizonBudget() {
  const map = collectHorizonMapFromDom();
  const spent = horizonSpent(map);
  const remaining = Number(map.budget || 0) - spent;
  const total = document.querySelector("[data-horizon-total]");
  const balance = document.querySelector("[data-horizon-remaining]");
  const status = document.querySelector("[data-horizon-budget-status]");
  if (total) total.textContent = formatHorizonAmount(map.budget, map);
  if (balance) balance.textContent = formatHorizonAmount(remaining, map);
  if (status) {
    status.textContent =
      remaining < 0
        ? "You are over budget. Lower allocations, eliminate items, or increase the budget before saving."
        : `You have allocated ${formatHorizonAmount(spent, map)} so far. Keep testing whether the trade-offs still make strategic sense.`;
    status.classList.toggle("is-warning", remaining < 0);
  }
}

function renderHorizonBoard() {
  const board = document.querySelector("[data-horizon-board]");
  if (!board) return;
  const map = collectHorizonMapFromDom();
  const labels = horizonLabels();
  board.innerHTML = Object.entries(labels)
    .map(([horizon, label]) => {
      const investments = map.investments.filter((investment) => investment.horizon === horizon);
      return `
        <article class="horizon-column" data-horizon-column="${horizon}">
          <div class="horizon-column-heading">
            <span>${label.number}</span>
            <h3>${label.title}</h3>
            <small>${map.timeframes?.[horizon] || ""}</small>
            <small>Period budget: ${formatHorizonAmount(map.periodBudgets?.[horizon] || 0, map)}</small>
          </div>
          <div class="horizon-investment-list">
            ${
              investments.length
                ? investments.map(renderHorizonInvestment).join("")
                : `<p class="horizon-empty">No investments placed here yet.</p>`
            }
          </div>
        </article>
      `;
    })
    .join("");
  renderHorizonBudget();
  updateHorizonEmailLink();
}

function renderHorizonInvestment(investment) {
  return `
    <article class="horizon-investment ${investment.eliminated ? "is-eliminated" : ""}" data-horizon-investment="${investment.id}">
      <p>${investment.text}</p>
      <div class="horizon-investment-meta">
        <span>${investment.pillar}</span>
        <label>
          <small>Allocation</small>
          <input type="number" min="0" step="1" value="${investment.amount || 0}" data-horizon-amount="${investment.id}">
        </label>
      </div>
      <button type="button" class="secondary-action horizon-toggle" data-horizon-toggle="${investment.id}">
        ${investment.eliminated ? "Restore / keep" : "Keep / Eliminate"}
      </button>
      <div class="horizon-tradeoff-fields">
        <label>
          Consequence of eliminating this
          <textarea data-horizon-consequence="${investment.id}" placeholder="What becomes weaker, slower, riskier, or delayed?">${investment.consequence || ""}</textarea>
        </label>
        <label>
          How will you manage the gap?
          <textarea data-horizon-mitigation="${investment.id}" placeholder="What smaller move, partner, sequence, or safeguard can reduce the risk?">${investment.mitigation || ""}</textarea>
        </label>
      </div>
    </article>
  `;
}

function addHorizonInvestment() {
  const textInput = document.querySelector("[data-horizon-investment-text]");
  const text = textInput.value.trim();
  const status = document.querySelector("[data-horizon-save-status]");
  if (!text) {
    if (status) status.textContent = "Add an investment before placing it on the map.";
    return;
  }
  const map = collectHorizonMapFromDom();
  map.investments.push({
    id: crypto?.randomUUID ? crypto.randomUUID() : `horizon-${Date.now()}`,
    text,
    horizon: document.querySelector("[data-horizon-investment-horizon]").value,
    pillar: document.querySelector("[data-horizon-investment-pillar]").value,
    amount: Number(document.querySelector("[data-horizon-investment-amount]").value || 0),
    eliminated: false,
    consequence: "",
    mitigation: ""
  });
  textInput.value = "";
  companionState.horizonMap = map;
  renderHorizonBoard();
  if (status) status.textContent = "Investment added. Keep building or test the trade-offs.";
}

function updateHorizonInvestment(id, patch) {
  const map = collectHorizonMapFromDom();
  map.investments = map.investments.map((investment) =>
    investment.id === id ? { ...investment, ...patch } : investment
  );
  companionState.horizonMap = map;
}

function saveHorizonMap() {
  const map = collectHorizonMapFromDom();
  const remaining = Number(map.budget || 0) - horizonSpent(map);
  const status = document.querySelector("[data-horizon-save-status]");
  if (remaining < 0) {
    if (status) status.textContent = "You are over budget. Bring the map back within budget before saving.";
    renderHorizonBudget();
    return false;
  }
  const store = getHorizonStore();
  store.horizonMaps[horizonKey()] = {
    ...map,
    updatedAt: new Date().toISOString()
  };
  saveStore(store);
  if (status) status.textContent = "Saved on this device.";
  renderVolume();
  showView("horizon-tool");
  return true;
}

function horizonReportText() {
  const map = collectHorizonMapFromDom();
  const labels = horizonLabels();
  const lines = [
    "SLP Companion - 3 Horizon Tension Map",
    "",
    `Scenario: ${map.title || "Untitled horizon strategy"}`,
    `Team / business: ${map.team || "Not captured"}`,
    `Budget: ${formatHorizonAmount(map.budget, map)}`,
    `Allocated: ${formatHorizonAmount(horizonSpent(map), map)}`,
    `Remaining: ${formatHorizonAmount(Number(map.budget || 0) - horizonSpent(map), map)}`,
    ""
  ];

  Object.entries(labels).forEach(([horizon, label]) => {
    lines.push(`${label.number.toUpperCase()} - ${label.title}`);
    lines.push(`Timeframe: ${map.timeframes?.[horizon] || "Not captured"}`);
    lines.push(`Period budget: ${formatHorizonAmount(map.periodBudgets?.[horizon] || 0, map)}`);
    const investments = map.investments.filter((investment) => investment.horizon === horizon);
    if (!investments.length) lines.push("- No investments added.");
    investments.forEach((investment) => {
      lines.push(
        `- ${investment.text} | ${investment.pillar} | ${formatHorizonAmount(investment.amount, map)} | ${
          investment.eliminated ? "Eliminated" : "Kept"
        }`
      );
      if (investment.eliminated) {
        lines.push(`  Consequence: ${investment.consequence || "Not captured"}`);
        lines.push(`  Gap plan: ${investment.mitigation || "Not captured"}`);
      }
    });
    lines.push("");
  });

  lines.push("ACTION");
  const action = map.actions?.[0];
  lines.push(
    action
      ? `- ${action.text || "No action text"} | Due: ${action.dueDate || "No date set"} | Involved: ${action.owner || "To confirm"}`
      : "- No action saved yet."
  );
  return lines.join("\n");
}

function downloadHorizonReport() {
  if (!saveHorizonMap()) return;
  const blob = new Blob([buildSimplePdf(horizonReportText())], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "slp-3-horizon-tension-map.pdf";
  link.click();
  URL.revokeObjectURL(link.href);
}

function updateHorizonEmailLink() {
  const link = document.querySelector("[data-email-horizon]");
  if (!link) return;
  const subject = encodeURIComponent("My SLP 3 Horizon Tension Map");
  const body = encodeURIComponent(horizonReportText());
  link.href = `mailto:?subject=${subject}&body=${body}`;
}

function renderHorizonTool() {
  const store = getHorizonStore();
  const saved = store.horizonMaps[horizonKey()];
  companionState.horizonMap = saved ? structuredClone(saved) : defaultHorizonMap();
  setHorizonForm(companionState.horizonMap);
  renderHorizonBoard();
  showView("horizon-tool");
}

function fieldValue(saved, fieldName) {
  return saved?.answers?.[fieldName] || "";
}

function textareaField(name, saved, placeholder = "") {
  return `
    <div class="worksheet-input-wrap">
      <textarea
        name="${name}"
        data-worksheet-field
        placeholder="${placeholder}"
      >${fieldValue(saved, name)}</textarea>
      <button class="mini-record companion-record" type="button" data-target="${name}" aria-label="Record answer">
        Record
      </button>
      <span class="record-status" data-status="${name}"></span>
    </div>
  `;
}

function renderControlInfluenceWorksheet(saved) {
  const shiftRows = [1, 2, 3]
    .map(
      (number) => `
        <tr class="worksheet-shift-row${shouldShowShiftRow(saved, number) ? "" : " hidden"}" data-shift-row="${number}">
          <th scope="row">Risk / Opportunity / Shift ${number}</th>
          <td>${textareaField(`shift_${number}`, saved, futureShapingExamples[`shift_${number}`] || "")}</td>
          <td>${textareaField(`shift_${number}_control`, saved)}</td>
          <td>${textareaField(`shift_${number}_influence`, saved)}</td>
          <td>${textareaField(`shift_${number}_no_control`, saved, futureShapingExamples[`shift_${number}_no_control`] || "")}</td>
        </tr>
      `
    )
    .join("");

  const pilotRows = [
    ["control", "Control"],
    ["influence", "Influence"],
    ["no_control", "No Control"]
  ]
    .map(
      ([key, label]) => `
        <tr>
          <th scope="row">${label}</th>
          <td>${textareaField(`pilot_${key}_item`, saved, futureShapingExamples[`pilot_${key}_item`] || "")}</td>
          <td>${textareaField(`pilot_${key}_action`, saved, futureShapingExamples[`pilot_${key}_action`] || "")}</td>
          <td>${textareaField(`pilot_${key}_success`, saved, futureShapingExamples[`pilot_${key}_success`] || "")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <section class="worksheet-page">
      <div class="worksheet-page-header">
        <p class="eyebrow">The Control & Influence Worksheet</p>
        <h3>Map an emerging risk, shift, or opportunity</h3>
        <p>Start with one item. Add another line only if there is more to map.</p>
      </div>
      <div class="worksheet-table-wrap">
        <table class="worksheet-table control-map-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Risk / Opportunity / Shift</th>
              <th>Within My Control (C)</th>
              <th>Influence but Not Fully Control (I)</th>
              <th>No Control (NC)</th>
            </tr>
          </thead>
          <tbody>${shiftRows}</tbody>
        </table>
      </div>
      <button class="secondary-action worksheet-add-line" type="button" data-add-shift-row${shouldShowShiftRow(saved, 3) ? " hidden" : ""}>
        Add another line
      </button>
    </section>

    <section class="worksheet-page">
      <div class="worksheet-page-header">
        <p class="eyebrow">Pilot Action</p>
        <h3>Identify the items with the greatest impact and urgency</h3>
        <p>Run a 1-week pilot action for one item within your control, influence, and no-control category.</p>
      </div>
      <div class="worksheet-table-wrap">
        <table class="worksheet-table pilot-table">
          <thead>
            <tr>
              <th>C - I - NC</th>
              <th>Risk / Opportunity / Shift</th>
              <th>Action</th>
              <th>What would success look like in 30 days?</th>
            </tr>
          </thead>
          <tbody>${pilotRows}</tbody>
        </table>
      </div>
    </section>

    <section class="worksheet-page">
      <div class="worksheet-page-header">
        <p class="eyebrow">SLP Mirror / Self-Coaching</p>
        <h3>Reflection Questions</h3>
      </div>
      <div class="reflection-table">
        <label>
          <span>Where do you spend most of your energy?</span>
          <p>Control, influence, or no-control risks?</p>
          ${textareaField("reflection_energy", saved)}
        </label>
        <label>
          <span>What feels too big, too political, or too complex to confront?</span>
          <p>Why does it feel out of reach?</p>
          ${textareaField("reflection_hard_risk", saved)}
        </label>
        <label>
          <span>If this repeats for another year, what capability are you being forced to confront?</span>
          <p>Think revenue engine, leadership expectations, expertise, future scenarios, or retention rituals.</p>
          ${textareaField("reflection_capability", saved, futureShapingExamples.reflection_capability)}
        </label>
      </div>
    </section>
  `;
}

function shouldShowShiftRow(saved, number) {
  if (number === 1) return true;
  return Boolean(
    fieldValue(saved, `shift_${number}`) ||
      fieldValue(saved, `shift_${number}_control`) ||
      fieldValue(saved, `shift_${number}_influence`) ||
      fieldValue(saved, `shift_${number}_no_control`)
  );
}

function renderWorksheet(worksheetId) {
  companionState.activeWorksheet = worksheetId;
  const worksheet = worksheets[worksheetId];
  const store = getStore();
  const saved = store?.worksheets?.[worksheetId];

  document.querySelector("[data-worksheet-volume]").textContent = worksheet.volume;
  document.querySelector("[data-worksheet-title]").textContent = worksheet.title;

  const fields = document.querySelector("[data-question-fields]");
  fields.innerHTML =
    worksheetId === "future-shaping"
      ? renderControlInfluenceWorksheet(saved)
      : worksheet.questions
          .map(
            (question) => `
              <label class="question-block">
                <span>${question.label}</span>
                ${question.prompt}
                <div class="voice-controls">
                  <button class="secondary-action companion-record" type="button" data-target="${question.id}">
                    Start Voice Answer
                  </button>
                  <span class="record-status" data-status="${question.id}"></span>
                </div>
                <textarea name="${question.id}" required minlength="20">${fieldValue(saved, question.id)}</textarea>
              </label>
            `
          )
          .join("");

  const savedActions = normalizeActions(saved);
  const latestAction = savedActions[savedActions.length - 1] || {};
  document.querySelector('[name="actionText_1"]').value = "";
  document.querySelector('[name="actionDueDate_1"]').value = "";
  document.querySelector('[name="actionOwner_1"]').value = "";
  document.querySelector('[name="actionText_1"]').placeholder = latestAction.text
    ? "Add another action, or leave blank to save worksheet only."
    : "";
  showView("worksheet");
}

function normalizeActions(saved) {
  if (!saved) return [];
  if (Array.isArray(saved.actions)) {
    return saved.actions.filter((action) => action.text || action.dueDate || action.owner);
  }
  if (saved.actionText || saved.actionDueDate || saved.actionOwner) {
    return [
      {
        text: saved.actionText || "",
        dueDate: saved.actionDueDate || "",
        owner: saved.actionOwner || ""
      }
    ];
  }
  return [];
}

function collectActions(data) {
  const action = {
    text: (data.actionText_1 || "").trim(),
    dueDate: data.actionDueDate_1 || "",
    owner: (data.actionOwner_1 || "").trim()
  };
  return action.text || action.dueDate || action.owner ? [action] : [];
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function calendarDate(date) {
  return String(date || "").replaceAll("-", "");
}

function calendarEndDate(date) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return calendarDate(date);
  parsed.setDate(parsed.getDate() + 1);
  return parsed.toISOString().slice(0, 10).replaceAll("-", "");
}

function calendarFilename(action) {
  const title = (action.text || "slp-action")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
  return `${title || "slp-action"}.ics`;
}

function calendarDataUrl(action) {
  const date = calendarDate(action.dueDate);
  const endDate = calendarEndDate(action.dueDate);
  const title = escapeIcsText(`SLP action: ${action.text}`);
  const description = escapeIcsText(
    `SLP Companion action commitment. People involved: ${action.owner || "To confirm"}`
  );
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Secret Leadership Playbook//Companion Lite//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@slp-companion`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function saveWorksheet(event) {
  event.preventDefault();
  const worksheet = worksheets[companionState.activeWorksheet];
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const store = getStore();
  const answers = {};

  worksheet.questions.forEach((question) => {
    answers[question.id] = data[question.id] || "";
  });

  const actions = collectActions(data);
  const previous = store.worksheets[companionState.activeWorksheet] || {};
  const savedActions = [...normalizeActions(previous), ...actions];

  store.worksheets[companionState.activeWorksheet] = {
    ...previous,
    worksheetId: companionState.activeWorksheet,
    title: worksheet.title,
    volume: worksheet.volume,
    answers,
    actions: savedActions,
    actionText: savedActions[savedActions.length - 1]?.text || "",
    actionDueDate: savedActions[savedActions.length - 1]?.dueDate || "",
    actionOwner: savedActions[savedActions.length - 1]?.owner || "",
    updatedAt: new Date().toISOString()
  };

  saveStore(store);
  form.querySelector('[name="actionText_1"]').value = "";
  form.querySelector('[name="actionDueDate_1"]').value = "";
  form.querySelector('[name="actionOwner_1"]').value = "";
  renderActions(store);
}

function startVoice(targetName, button) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.querySelector(`[data-status="${targetName}"]`);

  if (!SpeechRecognition) {
    status.textContent = "Voice typing is not available in this browser.";
    return;
  }

  if (companionState.recognition) {
    companionState.recognition.stop();
    companionState.recognition = null;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-ZA";
  recognition.continuous = true;
  recognition.interimResults = true;
  companionState.recognition = recognition;
  companionState.recorderTarget = targetName;
  button.textContent = "Stop Voice Answer";
  status.textContent = "Listening...";

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");
    const textarea = document.querySelector(`[name="${targetName}"]`);
    textarea.value = transcript;
  };

  recognition.onerror = () => {
    status.textContent = "Microphone access was not available.";
  };

  recognition.onend = () => {
    button.textContent = "Start Voice Answer";
    status.textContent = "Voice answer captured. Review and edit before saving.";
    companionState.recognition = null;
    companionState.recorderTarget = null;
  };

  recognition.start();
}

document.getElementById("companion-login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = Object.fromEntries(new FormData(event.currentTarget).entries());
  companionState.profile = profile;
  const existing = localStorage.getItem(profileKey(profile.email));
  if (!existing) {
    saveStore({ profile, worksheets: {}, scenarios: {} });
  } else {
    const store = JSON.parse(existing);
    store.profile = profile;
    saveStore(store);
  }
  updateProfileCard();
  openRequestedTool();
});

document.querySelectorAll("[data-open-worksheet]").forEach((card) => {
  card.addEventListener("click", () => renderWorksheet(card.dataset.openWorksheet));
});

document.querySelectorAll("[data-open-scenario-menu]").forEach((card) => {
  card.addEventListener("click", renderScenarioChoice);
});

document.querySelectorAll("[data-open-scenario]").forEach((card) => {
  card.addEventListener("click", renderScenarioTool);
});

document.querySelectorAll("[data-open-horizon]").forEach((card) => {
  card.addEventListener("click", renderHorizonTool);
});

document.querySelectorAll("[data-open-placeholder]").forEach((card) => {
  card.addEventListener("click", () => showView("placeholder"));
});

document.querySelectorAll("[data-open-volume]").forEach((card) => {
  card.addEventListener("click", () => {
    if (isPreviewMode) return;
    renderVolume();
  });
});

document.getElementById("back-to-map").addEventListener("click", renderDashboard);

document.getElementById("back-to-volume").addEventListener("click", renderVolume);

document.getElementById("back-from-scenario-choice").addEventListener("click", renderVolume);

document.getElementById("back-from-scenario").addEventListener("click", renderScenarioChoice);

document.getElementById("back-from-horizon").addEventListener("click", renderScenarioChoice);

document.getElementById("back-from-placeholder").addEventListener("click", renderVolume);

document.getElementById("switch-profile").addEventListener("click", () => {
  companionState.profile = null;
  localStorage.removeItem(savedProfileKey());
  updateProfileCard();
  showView("login");
});

document.getElementById("worksheet-form").addEventListener("submit", saveWorksheet);

document.querySelector("[data-add-scenario-card]").addEventListener("click", addScenarioCard);

document.querySelectorAll("[data-scenario-sort]").forEach((button) => {
  button.addEventListener("click", () => sortScenarioCard(button.dataset.scenarioSort));
});

document.querySelector("[data-scenario-prev]").addEventListener("click", () => moveScenarioCard(-1));

document.querySelector("[data-scenario-next]").addEventListener("click", () => moveScenarioCard(1));

document.querySelector("[data-save-scenario]").addEventListener("click", saveScenario);

document.querySelector("[data-save-scenario-action]").addEventListener("click", saveScenarioAction);

document.querySelector("[data-download-scenario]").addEventListener("click", downloadScenarioReport);

document.querySelector("[data-email-scenario]").addEventListener("click", updateScenarioEmailLink);

document.querySelector("[data-scenario-insight]").addEventListener("input", saveScenario);

document.querySelector("[data-add-horizon-investment]").addEventListener("click", addHorizonInvestment);

document.querySelector("[data-save-horizon]").addEventListener("click", saveHorizonMap);

document.querySelector("[data-download-horizon]").addEventListener("click", downloadHorizonReport);

document.querySelector("[data-email-horizon]").addEventListener("click", updateHorizonEmailLink);

document.querySelectorAll(
  "[data-horizon-title], [data-horizon-team], [data-horizon-budget-mode], [data-horizon-currency], [data-horizon-budget], [data-horizon-timeframe], [data-horizon-period-budget], [data-horizon-action-text], [data-horizon-action-due], [data-horizon-action-owner]"
).forEach((input) => {
  input.addEventListener("input", renderHorizonBudget);
  input.addEventListener("change", renderHorizonBudget);
});

document.addEventListener("click", (event) => {
  const horizonToggle = event.target.closest("[data-horizon-toggle]");
  if (horizonToggle) {
    const id = horizonToggle.dataset.horizonToggle;
    const map = collectHorizonMapFromDom();
    const investment = map.investments.find((item) => item.id === id);
    if (investment) {
      updateHorizonInvestment(id, { eliminated: !investment.eliminated });
      renderHorizonBoard();
    }
    return;
  }

  const addShiftRowButton = event.target.closest("[data-add-shift-row]");
  if (addShiftRowButton) {
    const hiddenRow = document.querySelector(".worksheet-shift-row.hidden");
    if (hiddenRow) hiddenRow.classList.remove("hidden");
    if (!document.querySelector(".worksheet-shift-row.hidden")) {
      addShiftRowButton.hidden = true;
    }
    return;
  }

  const button = event.target.closest(".companion-record");
  if (!button) return;
  startVoice(button.dataset.target, button);
});

document.addEventListener("input", (event) => {
  const amountInput = event.target.closest("[data-horizon-amount]");
  if (amountInput) {
    updateHorizonInvestment(amountInput.dataset.horizonAmount, { amount: Number(amountInput.value || 0) });
    renderHorizonBudget();
    return;
  }

  const consequenceInput = event.target.closest("[data-horizon-consequence]");
  if (consequenceInput) {
    updateHorizonInvestment(consequenceInput.dataset.horizonConsequence, {
      consequence: consequenceInput.value
    });
    return;
  }

  const mitigationInput = event.target.closest("[data-horizon-mitigation]");
  if (mitigationInput) {
    updateHorizonInvestment(mitigationInput.dataset.horizonMitigation, {
      mitigation: mitigationInput.value
    });
  }
});

function initializeCompanion() {
  if (isPreviewMode) {
    companionState.profile = {
      firstName: "Preview",
      lastName: "Visitor",
      email: "Member access required"
    };
    updateProfileCard();
    openRequestedTool();
    return;
  }

  const activeEmail = localStorage.getItem(savedProfileKey());
  if (!activeEmail) {
    updateProfileCard();
    showView("login");
    return;
  }

  const raw = localStorage.getItem(profileKey(activeEmail));
  if (!raw) {
    updateProfileCard();
    showView("login");
    return;
  }

  const store = JSON.parse(raw);
  companionState.profile = store.profile;
  updateProfileCard();
  openRequestedTool();
}

function openRequestedTool() {
  if (requestedTool === "horizon") {
    renderHorizonTool();
    return;
  }

  if (requestedTool === "scenario") {
    renderScenarioTool();
    return;
  }

  if (requestedTool === "scenario-menu") {
    renderScenarioChoice();
    return;
  }

  renderDashboard();
}

initializeCompanion();
