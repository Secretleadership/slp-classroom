(function () {
  if (window.location.search.indexOf("embed=1") !== -1) {
    document.documentElement.classList.add("is-embed");
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
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
          ? "Your lab is ready to save."
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
        window.location.href = "class-3-results.html";
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
      window.location.href = "class-3-results.html#downloads";
    });
  }
})();
