(function () {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  function landAtTop() {
    if (window.location.hash) return;
    window.setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  }

  landAtTop();
  window.addEventListener("pageshow", landAtTop);

  if (window.location.search.indexOf("embed=1") !== -1) {
    document.documentElement.classList.add("is-embed");
  }

  var carousels = document.querySelectorAll("[data-carousel]");

  carousels.forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
        dot.setAttribute("aria-current", dotIndex === active ? "true" : "false");
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    carousel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(active - 1);
      if (event.key === "ArrowRight") show(active + 1);
    });

    show(0);
  });

  var labs = document.querySelectorAll("[data-decision-lab]");

  labs.forEach(function (lab) {
    var bucketItems = {};
    var cards = Array.prototype.slice.call(lab.querySelectorAll("[data-card]"));
    var completeButton = document.querySelector("[data-complete-lab]");
    var completionHint = document.querySelector("[data-lab-hint]");
    var optionInputs = Array.prototype.slice.call(document.querySelectorAll('.decision-form input[name="option"]'));
    var optionProtect = document.querySelector('[name="optionProtect"]');
    var optionAssumption = document.querySelector('[name="optionAssumption"]');
    var currentCardOutput = lab.querySelector("[data-card-current]");
    var totalCardOutput = lab.querySelector("[data-card-total]");
    var cardStatus = lab.querySelector("[data-card-status]");
    var previousCardButton = lab.querySelector("[data-card-prev]");
    var nextCardButton = lab.querySelector("[data-card-next]");
    var labStateKey = "slp-leaders-decision-lab-state";
    var activeCard = 0;

    lab.classList.add("is-carousel-ready");

    if (totalCardOutput) {
      totalCardOutput.textContent = String(cards.length);
    }

    function getSelectedOption() {
      var selected = optionInputs.find(function (input) {
        return input.checked;
      });
      return selected ? selected.value : "";
    }

    function getLabState() {
      var cardAnswers = {};
      var buckets = {
        control: [],
        influence: [],
        "no-control": []
      };

      cards.forEach(function (card) {
        var label = card.getAttribute("data-card");
        var selected = card.getAttribute("data-selected");
        if (!selected) return;
        cardAnswers[label] = selected;
        if (buckets[selected]) {
          buckets[selected].push(label);
        }
      });

      return {
        cards: cardAnswers,
        buckets: buckets,
        option: getSelectedOption(),
        optionProtect: optionProtect ? optionProtect.value : "",
        optionAssumption: optionAssumption ? optionAssumption.value : "",
        savedAt: new Date().toISOString()
      };
    }

    function saveLabState() {
      localStorage.setItem(labStateKey, JSON.stringify(getLabState()));
    }

    function findBucketItem(bucketName, label) {
      var target = bucketItems[bucketName];
      if (!target) return null;
      return Array.prototype.find.call(target.querySelectorAll("[data-source]"), function (item) {
        return item.getAttribute("data-source") === label;
      });
    }

    function addToBucket(label, bucketName) {
      var target = bucketItems[bucketName];
      if (!target) return;

      Object.keys(bucketItems).forEach(function (key) {
        var existing = findBucketItem(key, label);
        if (existing) existing.remove();
      });

      var item = document.createElement("div");
      item.className = "bucket-item";
      item.setAttribute("data-source", label);
      item.textContent = label;
      target.appendChild(item);
    }

    function showCard(index) {
      if (!cards.length) return;
      activeCard = (index + cards.length) % cards.length;

      cards.forEach(function (card, cardIndex) {
        var isActive = cardIndex === activeCard;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      if (currentCardOutput) {
        currentCardOutput.textContent = String(activeCard + 1);
      }

      if (cardStatus) {
        var selected = cards[activeCard].getAttribute("data-selected");
        cardStatus.textContent = selected
          ? "Sorted into " + selected.replace("-", " ") + ". You can change it."
          : "Choose where this evidence belongs.";
      }
    }

    function showNextUnsortedCard() {
      var nextIndex = cards.findIndex(function (card, index) {
        return index > activeCard && !card.hasAttribute("data-selected");
      });

      if (nextIndex === -1) {
        nextIndex = cards.findIndex(function (card) {
          return !card.hasAttribute("data-selected");
        });
      }

      if (nextIndex !== -1) {
        showCard(nextIndex);
      } else {
        showCard(activeCard);
      }
    }

    function updateCompletionState() {
      if (!completeButton) return;

      var sortedCount = cards.filter(function (card) {
        return card.hasAttribute("data-selected");
      }).length;
      var hasOption = optionInputs.some(function (input) {
        return input.checked;
      });
      var isComplete = sortedCount === cards.length && hasOption;

      completeButton.disabled = !isComplete;
      if (completionHint) {
        completionHint.textContent = isComplete
          ? "Your lab is ready to save. After saving, return to Systeme.io and open Class 3 from the course navigation."
          : "Sort every evidence card and choose an option before continuing.";
      }
    }

    lab.querySelectorAll("[data-bucket]").forEach(function (bucket) {
      bucketItems[bucket.getAttribute("data-bucket")] = bucket.querySelector(".bucket-items");
    });

    cards.forEach(function (card) {
      card.querySelectorAll("[data-sort]").forEach(function (button) {
        button.addEventListener("click", function () {
          var bucketName = button.getAttribute("data-sort");
          var label = card.getAttribute("data-card");

          addToBucket(label, bucketName);
          card.setAttribute("data-selected", bucketName);
          card.querySelectorAll("[data-sort]").forEach(function (sortButton) {
            sortButton.classList.toggle("is-selected", sortButton === button);
          });
          saveLabState();
          showNextUnsortedCard();
          updateCompletionState();
        });
      });
    });

    optionInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        saveLabState();
        updateCompletionState();
      });
    });

    [optionProtect, optionAssumption].forEach(function (field) {
      if (!field) return;
      field.addEventListener("input", saveLabState);
    });

    if (completeButton) {
      completeButton.addEventListener("click", function () {
        if (completeButton.disabled) return;
        saveLabState();
        localStorage.setItem("slp-leaders-decision-lab-complete", "true");
        if (completionHint) {
          completionHint.textContent = "Saved. Return to Systeme.io and open Class 3 from the course navigation.";
        }
      });
    }

    if (previousCardButton) {
      previousCardButton.addEventListener("click", function () {
        showCard(activeCard - 1);
      });
    }

    if (nextCardButton) {
      nextCardButton.addEventListener("click", function () {
        showCard(activeCard + 1);
      });
    }

    try {
      var savedState = JSON.parse(localStorage.getItem(labStateKey) || "{}");
      if (savedState.cards) {
        cards.forEach(function (card) {
          var label = card.getAttribute("data-card");
          var savedBucket = savedState.cards[label];
          if (!savedBucket) return;

          addToBucket(label, savedBucket);
          card.setAttribute("data-selected", savedBucket);
          card.querySelectorAll("[data-sort]").forEach(function (button) {
            button.classList.toggle("is-selected", button.getAttribute("data-sort") === savedBucket);
          });
        });
      }
      if (savedState.option) {
        optionInputs.forEach(function (input) {
          input.checked = input.value === savedState.option;
        });
      }
      if (optionProtect && savedState.optionProtect) {
        optionProtect.value = savedState.optionProtect;
      }
      if (optionAssumption && savedState.optionAssumption) {
        optionAssumption.value = savedState.optionAssumption;
      }
    } catch (error) {
      localStorage.removeItem(labStateKey);
    }

    var firstUnsorted = cards.findIndex(function (card) {
      return !card.hasAttribute("data-selected");
    });
    showCard(firstUnsorted === -1 ? 0 : firstUnsorted);
    updateCompletionState();
  });

  var gatedPage = document.querySelector("[data-requires-lab]");
  if (gatedPage) {
    var gateKey = gatedPage.getAttribute("data-requires-lab");
    var gateMode = gatedPage.getAttribute("data-gate-mode");
    if (gateMode !== "preview-open" && localStorage.getItem(gateKey) !== "true") {
      document.body.classList.add("is-lab-locked");
    }
  }

  var revealMode = window.location.search.indexOf("after=reveal") !== -1 || window.location.hash === "#after-reveal";
  var afterRevealSection = document.querySelector(".after-reveal-section");
  if (afterRevealSection) {
    afterRevealSection.hidden = !revealMode;
    afterRevealSection.setAttribute("aria-hidden", revealMode ? "false" : "true");
    document.body.classList.toggle("is-after-reveal", revealMode);
  }

  function saveAfterRevealReflection() {
      var selectedBlindspot = document.querySelector('input[name="blindspot"]:checked');
      var bucketAnswer = document.querySelector('[name="blindspotBucket"]');
      var signalAnswer = document.querySelector('[name="leadershipSignal"]');
      var status = document.querySelector("[data-save-status]");

      localStorage.setItem("slp-after-reveal-reflection", JSON.stringify({
        blindspot: selectedBlindspot ? selectedBlindspot.value : "",
        bucket: bucketAnswer ? bucketAnswer.value : "",
        signal: signalAnswer ? signalAnswer.value : "",
        savedAt: new Date().toISOString()
      }));

      if (status) {
        status.textContent = "Saved on this device for this preview.";
      }
  }

  try {
    var savedAfterReveal = JSON.parse(localStorage.getItem("slp-after-reveal-reflection") || "{}");
    var savedBlindspot = savedAfterReveal.blindspot;
    var savedBucketAnswer = document.querySelector('[name="blindspotBucket"]');
    var savedSignalAnswer = document.querySelector('[name="leadershipSignal"]');

    if (savedBlindspot) {
      var savedBlindspotInput = document.querySelector('input[name="blindspot"][value="' + savedBlindspot + '"]');
      if (savedBlindspotInput) savedBlindspotInput.checked = true;
    }
    if (savedBucketAnswer && savedAfterReveal.bucket) {
      savedBucketAnswer.value = savedAfterReveal.bucket;
    }
    if (savedSignalAnswer && savedAfterReveal.signal) {
      savedSignalAnswer.value = savedAfterReveal.signal;
    }
  } catch (error) {
    localStorage.removeItem("slp-after-reveal-reflection");
  }

  var saveAfterReveal = document.querySelector("[data-save-after-reveal]");
  if (saveAfterReveal) {
    saveAfterReveal.addEventListener("click", saveAfterRevealReflection);
  }

  var saveAfterRevealReturn = document.querySelector("[data-save-after-reveal-return]");
  if (saveAfterRevealReturn) {
    saveAfterRevealReturn.addEventListener("click", function () {
      saveAfterRevealReflection();
      var saveStatus = document.querySelector("[data-save-status]");
      if (saveStatus) {
        saveStatus.textContent = "Saved. Return to your Systeme.io class tab to continue.";
      }
    });
  }

  var horizonLab = document.querySelector("[data-horizon-lab]");
  if (horizonLab) {
    var horizonStateKey = horizonLab.getAttribute("data-storage-key") || "slp-horizon-strategy-lab-state";
    var horizonCompletionKey = horizonLab.getAttribute("data-completion-key") || "slp-horizon-strategy-lab-complete";
    var horizonBaselineKey = horizonLab.getAttribute("data-baseline-key");
    var useBaseline = horizonLab.getAttribute("data-use-baseline") === "true";
    var maxHorizonItems = Number(horizonLab.getAttribute("data-max-items") || 12);
    var horizonForm = horizonLab.querySelector("[data-horizon-form]");
    var saveHorizonButton = horizonLab.querySelector("[data-save-horizon-strategy]");
    var clearHorizonButton = horizonLab.querySelector("[data-clear-horizon-strategy]");
    var horizonStatus = horizonLab.querySelector("[data-horizon-save-status]");
    var horizonHint = horizonLab.querySelector("[data-horizon-hint]");
    var horizonItems = {
      h1: [],
      h2: [],
      h3: []
    };

    function cloneHorizonItems(items) {
      return {
        h1: (items && items.h1 ? items.h1 : []).map(function (item) { return Object.assign({}, item); }),
        h2: (items && items.h2 ? items.h2 : []).map(function (item) { return Object.assign({}, item); }),
        h3: (items && items.h3 ? items.h3 : []).map(function (item) { return Object.assign({}, item); })
      };
    }

    function getTotalHorizonItems() {
      return horizonItems.h1.length + horizonItems.h2.length + horizonItems.h3.length;
    }

    function readHorizonState(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "{}");
      } catch (error) {
        localStorage.removeItem(key);
        return {};
      }
    }

    function getHorizonColumns() {
      return {
        h1: horizonLab.querySelector('[data-horizon-items="h1"]'),
        h2: horizonLab.querySelector('[data-horizon-items="h2"]'),
        h3: horizonLab.querySelector('[data-horizon-items="h3"]')
      };
    }

    function getHorizonLabel(horizon) {
      if (horizon === "h1") return "Horizon 1";
      if (horizon === "h2") return "Horizon 2";
      return "Horizon 3";
    }

    function hasBaseline() {
      return horizonItems.h1.length > 0 && horizonItems.h2.length > 0 && horizonItems.h3.length > 0;
    }

    function saveHorizonState(markSaved) {
      localStorage.setItem(horizonStateKey, JSON.stringify({
        items: horizonItems,
        savedBaseline: markSaved || false,
        savedAt: new Date().toISOString()
      }));
    }

    function updateHorizonCompletion() {
      var isReady = hasBaseline();
      var totalItems = getTotalHorizonItems();
      if (saveHorizonButton) {
        saveHorizonButton.disabled = !isReady;
      }
      if (horizonHint) {
        horizonHint.textContent = isReady
          ? "Your strategy has all three horizons represented. " + totalItems + " / " + maxHorizonItems + " investments used."
          : "Add at least one investment in each horizon before saving. " + totalItems + " / " + maxHorizonItems + " investments used.";
      }
    }

    function renderHorizonBoard() {
      var columns = getHorizonColumns();
      Object.keys(columns).forEach(function (key) {
        var target = columns[key];
        if (!target) return;
        target.innerHTML = "";

        horizonItems[key].forEach(function (item, index) {
          var card = document.createElement("article");
          card.className = "horizon-investment";

          var title = document.createElement("strong");
          title.textContent = item.text;
          card.appendChild(title);

          var pillar = document.createElement("span");
          pillar.textContent = item.pillar;
          card.appendChild(pillar);

          if (item.why) {
            var details = document.createElement("details");
            details.className = "horizon-investment-detail";

            var summary = document.createElement("summary");
            summary.textContent = "Why?";
            details.appendChild(summary);

            var why = document.createElement("p");
            why.textContent = item.why;
            details.appendChild(why);

            card.appendChild(details);
          }

          var remove = document.createElement("button");
          remove.type = "button";
          remove.textContent = "Remove";
          remove.addEventListener("click", function () {
            horizonItems[key].splice(index, 1);
            saveHorizonState(false);
            renderHorizonBoard();
          });
          card.appendChild(remove);

          target.appendChild(card);
        });
      });

      updateHorizonCompletion();
    }

    if (horizonForm) {
      horizonForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var formData = new FormData(horizonForm);
        var text = String(formData.get("investmentText") || "").trim();
        var horizon = String(formData.get("investmentHorizon") || "h1");
        var pillar = String(formData.get("investmentPillar") || "Quality");
        var why = String(formData.get("investmentWhy") || "").trim();

        if (!text) {
          if (horizonHint) horizonHint.textContent = "Add an investment or decision before placing it on the board.";
          return;
        }

        if (getTotalHorizonItems() >= maxHorizonItems) {
          if (horizonHint) horizonHint.textContent = "You have used all " + maxHorizonItems + " investment slots. Remove one before adding another.";
          return;
        }

        horizonItems[horizon].push({
          id: Date.now().toString(36),
          text: text,
          pillar: pillar,
          why: why,
          horizon: getHorizonLabel(horizon)
        });

        horizonForm.reset();
        saveHorizonState(false);
        renderHorizonBoard();
      });
    }

    if (saveHorizonButton) {
      saveHorizonButton.addEventListener("click", function () {
        if (!hasBaseline()) return;
        saveHorizonState(true);
        localStorage.setItem(horizonCompletionKey, "true");
        if (horizonStatus) {
          horizonStatus.textContent = "Saved on this device. This strategy is ready for the next step.";
        }
      });
    }

    if (clearHorizonButton) {
      clearHorizonButton.addEventListener("click", function () {
        horizonItems = { h1: [], h2: [], h3: [] };
        localStorage.removeItem(horizonStateKey);
        localStorage.removeItem(horizonCompletionKey);
        if (horizonStatus) horizonStatus.textContent = "";
        renderHorizonBoard();
      });
    }

    function renderBaselineBoard(items) {
      var baseline = document.querySelector("[data-horizon-baseline]");
      if (!baseline) return;
      baseline.innerHTML = "";

      ["h1", "h2", "h3"].forEach(function (key) {
        var column = document.createElement("section");
        column.className = "baseline-column";
        var title = document.createElement("h3");
        title.textContent = getHorizonLabel(key);
        column.appendChild(title);

        var list = document.createElement("div");
        list.className = "baseline-items";
        (items[key] || []).forEach(function (item) {
          var card = document.createElement("div");
          card.className = "baseline-item";
          card.textContent = item.text;
          list.appendChild(card);
        });
        if (!(items[key] || []).length) {
          var empty = document.createElement("div");
          empty.className = "baseline-item is-empty";
          empty.textContent = "No investment saved";
          list.appendChild(empty);
        }

        column.appendChild(list);
        baseline.appendChild(column);
      });
    }

    var savedHorizonState = readHorizonState(horizonStateKey);
    var baselineState = horizonBaselineKey ? readHorizonState(horizonBaselineKey) : {};

    if (baselineState.items) {
      renderBaselineBoard(cloneHorizonItems(baselineState.items));
    }

    if (savedHorizonState.items) {
      horizonItems = cloneHorizonItems(savedHorizonState.items);
    } else if (useBaseline && baselineState.items) {
      horizonItems = cloneHorizonItems(baselineState.items);
      saveHorizonState(false);
    }

    if (horizonStatus && savedHorizonState.savedBaseline) {
      horizonStatus.textContent = "Saved on this device. This strategy is ready for the next step.";
    }

    renderHorizonBoard();
  }

  var tradeoffLab = document.querySelector("[data-tradeoff-lab]");
  if (tradeoffLab) {
    var tradeoffSourceKey = tradeoffLab.getAttribute("data-source-key") || "slp-horizon-strategy-lab-2-state";
    var tradeoffStorageKey = tradeoffLab.getAttribute("data-storage-key") || "slp-horizon-strategy-lab-3-state";
    var tradeoffBudget = Number(tradeoffLab.getAttribute("data-budget") || 100);
    var tradeoffBoard = tradeoffLab.querySelector("[data-tradeoff-board]");
    var remainingOutput = tradeoffLab.querySelector("[data-budget-remaining]");
    var meter = tradeoffLab.querySelector("[data-budget-meter]");
    var budgetStatus = tradeoffLab.querySelector("[data-budget-status]");
    var saveTradeoffButton = tradeoffLab.querySelector("[data-save-tradeoff-strategy]");
    var tradeoffSaveStatus = tradeoffLab.querySelector("[data-tradeoff-save-status]");
    var tradeoffAddForm = tradeoffLab.querySelector("[data-tradeoff-add-form]");
    var tradeoffItems = [];

    var pillarCosts = {
      Quality: 8,
      Speed: 7,
      Cost: 6,
      Profit: 8,
      Margins: 8,
      "Unit economics": 10,
      "Customer adoption": 9,
      Retention: 9,
      "Product experience": 8,
      Distribution: 9,
      "Team capability": 10,
      "Capability building": 10,
      Marketing: 8,
      "Market education": 7,
      Innovation: 12
    };

    function readTradeoffState(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "{}");
      } catch (error) {
        localStorage.removeItem(key);
        return {};
      }
    }

    function flattenHorizons(items) {
      var flattened = [];
      ["h1", "h2", "h3"].forEach(function (key) {
        (items[key] || []).forEach(function (item, index) {
          flattened.push(Object.assign({}, item, {
            id: item.id || key + "-" + index,
            horizonKey: key,
            horizon: item.horizon || (key === "h1" ? "Horizon 1" : key === "h2" ? "Horizon 2" : "Horizon 3"),
            cost: item.cost || pillarCosts[item.pillar] || 8,
            keep: item.keep !== false,
            consequence: item.consequence || "",
            mitigation: item.mitigation || ""
          }));
        });
      });
      return flattened;
    }

    function getTradeoffHorizonLabel(key) {
      if (key === "h1") return "Horizon 1";
      if (key === "h2") return "Horizon 2";
      return "Horizon 3";
    }

    function getTradeoffSpent() {
      return tradeoffItems.reduce(function (sum, item) {
        return item.keep ? sum + Number(item.cost || 0) : sum;
      }, 0);
    }

    function updateTradeoffBudget() {
      var spent = getTradeoffSpent();
      var remaining = tradeoffBudget - spent;
      if (remainingOutput) remainingOutput.textContent = String(remaining);
      if (meter) meter.style.width = Math.min(100, Math.max(0, spent / tradeoffBudget * 100)) + "%";
      if (budgetStatus) {
        budgetStatus.textContent = remaining < 0
          ? "You are over budget. Eliminate or reduce credits before saving."
          : "Credits used: " + spent + " / " + tradeoffBudget + ".";
      }
      if (saveTradeoffButton) saveTradeoffButton.disabled = remaining < 0;
    }

    function saveTradeoffState(markSaved) {
      localStorage.setItem(tradeoffStorageKey, JSON.stringify({
        items: tradeoffItems,
        budget: tradeoffBudget,
        spent: getTradeoffSpent(),
        saved: markSaved || false,
        savedAt: new Date().toISOString()
      }));
    }

    function renderTradeoffBoard() {
      if (!tradeoffBoard) return;
      tradeoffBoard.innerHTML = "";

      if (!tradeoffItems.length) {
        var empty = document.createElement("article");
        empty.className = "tradeoff-card";
        empty.innerHTML = "<h3>No Strategy 2 investments found yet.</h3><p>Build and save Strategy 2 first, then return here to play the credit round.</p>";
        tradeoffBoard.appendChild(empty);
        if (saveTradeoffButton) saveTradeoffButton.disabled = true;
        return;
      }

      ["h1", "h2", "h3"].forEach(function (horizonKey) {
        var column = document.createElement("section");
        column.className = "tradeoff-horizon-column";

        var columnNumber = document.createElement("p");
        columnNumber.className = "horizon-number";
        columnNumber.textContent = getTradeoffHorizonLabel(horizonKey);
        column.appendChild(columnNumber);

        var columnTitle = document.createElement("h3");
        columnTitle.textContent = horizonKey === "h1"
          ? "Sustain and optimize the core"
          : horizonKey === "h2"
            ? "Extend and differentiate"
            : "Shape the future";
        column.appendChild(columnTitle);

        var columnItems = document.createElement("div");
        columnItems.className = "tradeoff-horizon-items";

        var itemsForHorizon = tradeoffItems.filter(function (item) {
          return item.horizonKey === horizonKey;
        });

        if (!itemsForHorizon.length) {
          var emptyCard = document.createElement("div");
          emptyCard.className = "tradeoff-empty-card";
          emptyCard.textContent = "No investment here yet.";
          columnItems.appendChild(emptyCard);
        }

        itemsForHorizon.forEach(function (item, index) {
        var card = document.createElement("article");
        card.className = "tradeoff-card" + (item.keep ? "" : " is-eliminated");

        var top = document.createElement("div");
        top.className = "tradeoff-card-top";

        var copy = document.createElement("div");
        var title = document.createElement("h3");
        title.textContent = item.text;
        copy.appendChild(title);

        var meta = document.createElement("div");
        meta.className = "tradeoff-meta";
        [item.horizon, item.pillar].forEach(function (label) {
          var pill = document.createElement("span");
          pill.textContent = label;
          meta.appendChild(pill);
        });
        copy.appendChild(meta);

        var controls = document.createElement("div");
        controls.className = "tradeoff-controls";

        var cost = document.createElement("select");
        [5, 8, 10, 12, 15, 20].forEach(function (value) {
          var option = document.createElement("option");
          option.value = String(value);
          option.textContent = value + " credits";
          option.selected = Number(item.cost) === value;
          cost.appendChild(option);
        });
        cost.addEventListener("change", function () {
          item.cost = Number(cost.value);
          saveTradeoffState(false);
          updateTradeoffBudget();
        });
        controls.appendChild(cost);

        var toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "tradeoff-toggle";
        toggle.textContent = "Keep / Eliminate";
        toggle.addEventListener("click", function () {
          item.keep = !item.keep;
          renderTradeoffBoard();
          saveTradeoffState(false);
        });
        controls.appendChild(toggle);

        top.appendChild(copy);
        top.appendChild(controls);
        card.appendChild(top);

        var reflection = document.createElement("div");
        reflection.className = "tradeoff-reflection";
        reflection.innerHTML =
          '<div><label>Consequence of eliminating this</label><textarea data-consequence placeholder="What becomes weaker, slower, riskier, or delayed?"></textarea></div>' +
          '<div><label>How will you manage the gap?</label><textarea data-mitigation placeholder="What smaller move, sequence, or workaround could reduce the risk?"></textarea></div>';

        var consequence = reflection.querySelector("[data-consequence]");
        var mitigation = reflection.querySelector("[data-mitigation]");
        consequence.value = item.consequence || "";
        mitigation.value = item.mitigation || "";
        consequence.addEventListener("input", function () {
          item.consequence = consequence.value;
          saveTradeoffState(false);
        });
        mitigation.addEventListener("input", function () {
          item.mitigation = mitigation.value;
          saveTradeoffState(false);
        });

        card.appendChild(reflection);
        columnItems.appendChild(card);
      });

        column.appendChild(columnItems);
        tradeoffBoard.appendChild(column);
      });

      updateTradeoffBudget();
    }

    var savedTradeoff = readTradeoffState(tradeoffStorageKey);
    if (savedTradeoff.items) {
      tradeoffItems = savedTradeoff.items;
    } else {
      var sourceTradeoff = readTradeoffState(tradeoffSourceKey);
      if (sourceTradeoff.items) {
        tradeoffItems = flattenHorizons(sourceTradeoff.items);
      }
    }

    if (saveTradeoffButton) {
      saveTradeoffButton.addEventListener("click", function () {
        if (getTradeoffSpent() > tradeoffBudget) return;
        saveTradeoffState(true);
        localStorage.setItem("slp-horizon-strategy-lab-3-complete", "true");
        if (tradeoffSaveStatus) {
          tradeoffSaveStatus.textContent = "Saved on this device. Your trade-off strategy is ready for the final debrief.";
        }
      });
    }

    if (tradeoffAddForm) {
      tradeoffAddForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var formData = new FormData(tradeoffAddForm);
        var text = String(formData.get("tradeoffInvestmentText") || "").trim();
        if (!text) return;

        var horizonKey = String(formData.get("tradeoffInvestmentHorizon") || "h1");
        var pillar = String(formData.get("tradeoffInvestmentPillar") || "Quality");
        var cost = Number(formData.get("tradeoffInvestmentCost") || pillarCosts[pillar] || 8);
        var why = String(formData.get("tradeoffInvestmentWhy") || "").trim();

        tradeoffItems.push({
          id: "custom-" + Date.now(),
          horizonKey: horizonKey,
          horizon: getTradeoffHorizonLabel(horizonKey),
          pillar: pillar,
          text: text,
          why: why,
          cost: cost,
          keep: true,
          consequence: "",
          mitigation: "",
          custom: true
        });

        tradeoffAddForm.reset();
        saveTradeoffState(false);
        renderTradeoffBoard();
      });
    }

    if (tradeoffSaveStatus && savedTradeoff.saved) {
      tradeoffSaveStatus.textContent = "Saved on this device. Your trade-off strategy is ready for the final debrief.";
    }

    renderTradeoffBoard();
  }
})();
