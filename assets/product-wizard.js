(function () {
  function stripInputInfoTrailingActions(wrap) {
    if (!wrap) return;
    var trailing = wrap.querySelector(".wizard__input-trailing");
    if (trailing) trailing.remove();
    wrap.classList.remove(
      "wizard__input-info-wrap--has-actions",
      "wizard__input-info-wrap--has-help",
      "wizard__input-info-wrap--has-help-voice"
    );
    var audio = wrap.nextElementSibling;
    if (audio && audio.classList && audio.classList.contains("product-page__field-voice-audio")) {
      audio.remove();
    }
  }

  function cloneWizardInputInfoWrap(templateWrap, inputConfig) {
    var wrap = templateWrap.cloneNode(true);
    stripInputInfoTrailingActions(wrap);
    var input = wrap.querySelector("input, textarea, select");

    if (input) {
      input.name = inputConfig.name;
      input.placeholder = inputConfig.placeholder;
      input.value = "";
      if (inputConfig.className) {
        input.className = inputConfig.className;
      }
      if (inputConfig.required) {
        input.setAttribute("aria-required", "true");
      } else {
        input.removeAttribute("aria-required");
      }
    }
    return wrap;
  }

  window.cloneWizardInputInfoWrap = cloneWizardInputInfoWrap;

  function getRepeatableMax(button) {
    var maxAttr = button.getAttribute("data-repeatable-max");
    if (maxAttr === null || maxAttr === "") return 0;
    var max = parseInt(maxAttr, 10);
    return Number.isFinite(max) && max > 0 ? max : 0;
  }

  function getRepeatableInputCount(wrapper, propertyName) {
    if (!wrapper || !propertyName) return 0;
    return wrapper.querySelectorAll('input[name="properties[' + propertyName + ']"]').length;
  }

  function createRepeatableRowFromWrap(inputWrap) {
    var row = document.createElement("div");
    row.className = "wizard__repeatable-row";
    row.setAttribute("data-repeatable-row", "");

    var main = document.createElement("div");
    main.className = "wizard__repeatable-row-main w-full min-w-0";
    main.appendChild(inputWrap);

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "wizard__repeatable-remove";
    removeBtn.setAttribute("data-repeatable-remove", "");
    removeBtn.setAttribute("aria-label", "Remove");
    removeBtn.innerHTML = '<i class="hgi hgi-stroke hgi-rounded hgi-cancel-01" aria-hidden="true"></i>';

    row.appendChild(main);
    row.appendChild(removeBtn);
    return row;
  }

  function renumberRepeatablePlaceholders(wrapper, propertyName, placeholderBase) {
    if (!wrapper || !propertyName) return;
    var inputs = wrapper.querySelectorAll('input[name="properties[' + propertyName + ']"]');
    inputs.forEach(function (input, index) {
      input.placeholder = placeholderBase + " " + (index + 1);
    });
  }

  function syncRepeatableRemoveButtons(wrapper) {
    if (!wrapper) return;
    var rows = wrapper.querySelectorAll("[data-repeatable-row]");
    var showRemove = rows.length > 1;
    rows.forEach(function (row) {
      var removeBtn = row.querySelector("[data-repeatable-remove]");
      if (!removeBtn) return;
      removeBtn.hidden = !showRemove;
      removeBtn.disabled = !showRemove;
    });
  }

  function syncRepeatableList(wrapper, button) {
    if (!wrapper || !button) return;
    var propertyName = button.getAttribute("data-repeatable-name") || "";
    var placeholderBase = button.getAttribute("data-repeatable-placeholder") || "Item";
    renumberRepeatablePlaceholders(wrapper, propertyName, placeholderBase);
    syncRepeatableAddButton(button);
    syncRepeatableRemoveButtons(wrapper);
  }

  function syncRepeatableAddButton(button) {
    var wrapper = button.parentElement;
    if (!wrapper) return;

    var propertyName = button.getAttribute("data-repeatable-name") || "";
    var count = getRepeatableInputCount(wrapper, propertyName);
    var max = getRepeatableMax(button);
    var atLimit = max > 0 && count >= max;

    button.setAttribute("data-repeatable-count", String(count));
    button.disabled = atLimit;
    button.setAttribute("aria-disabled", atLimit ? "true" : "false");
    button.classList.toggle("wizard__repeatable-add--disabled", atLimit);
  }

  function addRepeatableInput(button) {
    var wrapper = button.parentElement;
    if (!wrapper) return;
    var templateWrap = wrapper.querySelector(".wizard__repeatable-row .wizard__input-info-wrap");
    if (!templateWrap) return;

    var propertyName = button.getAttribute("data-repeatable-name") || "";
    var placeholderBase = button.getAttribute("data-repeatable-placeholder") || "Item";
    var inputs = wrapper.querySelectorAll('input[name="properties[' + propertyName + ']"]');
    var max = getRepeatableMax(button);
    if (max > 0 && inputs.length >= max) {
      syncRepeatableList(wrapper, button);
      return;
    }
    var count = inputs.length + 1;

    var newWrap = cloneWizardInputInfoWrap(templateWrap, {
      name: "properties[" + propertyName + "]",
      placeholder: placeholderBase + " " + count,
      className: button.getAttribute("data-repeatable-class") || "product-page__input w-full",
      required: button.getAttribute("data-repeatable-required") === "true",
    });
    var row = createRepeatableRowFromWrap(newWrap);
    wrapper.insertBefore(row, button);
    syncRepeatableList(wrapper, button);
    window.dispatchEvent(
      new CustomEvent("product-form:pricing-refresh", { bubbles: true, detail: { source: "repeatable" } })
    );
  }

  function removeRepeatableInput(removeBtn) {
    var row = removeBtn.closest("[data-repeatable-row]");
    var wrapper = removeBtn.closest("[data-repeatable-list]");
    if (!row || !wrapper) return;

    var addBtn = wrapper.querySelector("[data-repeatable-add]");
    if (!addBtn) return;

    var propertyName = addBtn.getAttribute("data-repeatable-name") || "";
    if (getRepeatableInputCount(wrapper, propertyName) <= 1) return;

    row.remove();
    syncRepeatableList(wrapper, addBtn);
    window.dispatchEvent(
      new CustomEvent("product-form:pricing-refresh", { bubbles: true, detail: { source: "repeatable" } })
    );
  }

  function ensureRepeatableRowStructure(wrapper) {
    if (!wrapper || wrapper.querySelector("[data-repeatable-row]")) return;

    var templateWrap = wrapper.querySelector(":scope > .wizard__input-info-wrap");
    if (!templateWrap) return;

    var row = createRepeatableRowFromWrap(templateWrap);
    var addBtn = wrapper.querySelector("[data-repeatable-add]");
    if (addBtn) {
      wrapper.insertBefore(row, addBtn);
    } else {
      wrapper.appendChild(row);
    }
  }

  function initFlatpickrDateInput(el) {
    if (!el) return null;
    if (el._flatpickr) {
      if (el._flatpickr.altInput) {
        el._flatpickr.altInput.disabled = !!el.disabled;
      }
      return el._flatpickr;
    }
    var FlatpickrCtor = typeof window !== "undefined" ? window.flatpickr : undefined;
    if (!FlatpickrCtor) {
      // flatpickr.js is deferred — retry once scripts finish loading
      if (!el.dataset.flatpickrRetryScheduled) {
        el.dataset.flatpickrRetryScheduled = "1";
        window.addEventListener(
          "load",
          function () {
            delete el.dataset.flatpickrRetryScheduled;
            initFlatpickrDateInput(el);
          },
          { once: true }
        );
      }
      return null;
    }
    var fp = FlatpickrCtor(el, {
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "j F Y",
      altInputClass: "product-page__input w-full",
      allowInput: true,
      disableMobile: true,
    });
    if (el.disabled && fp && fp.altInput) {
      fp.altInput.disabled = true;
    }
    var wrap = el.closest(".wizard__event-date-wrap");
    var icon = wrap && wrap.querySelector(".wizard__event-date-icon");
    if (icon && fp && icon.dataset.flatpickrBound !== "1") {
      icon.dataset.flatpickrBound = "1";
      icon.style.pointerEvents = "auto";
      icon.style.cursor = "pointer";
      icon.addEventListener("click", function (event) {
        event.preventDefault();
        if (el.disabled || (fp.altInput && fp.altInput.disabled)) return;
        fp.open();
      });
    }
    return fp;
  }

  function inferPropertyDateModeFromLabel(label) {
    var lc = String(label || "").trim().toLowerCase();
    if (!lc) return null;
    if (lc.indexOf("entry") !== -1 && lc.indexOf("exit") !== -1) return "year_range";
    if (lc.indexOf("circa") !== -1) return "circa_year";
    if (lc.indexOf("no record") !== -1) return "no_record";
    if (
      lc.indexOf("date specific") !== -1 ||
      lc.indexOf("exact date") !== -1 ||
      lc.indexOf("birth date") !== -1 ||
      lc.indexOf("birthdate") !== -1 ||
      lc === "current" ||
      lc === "date"
    ) {
      return "date";
    }
    if (lc.indexOf("single") !== -1 && lc.indexOf("year") !== -1) return "year";
    if (lc.indexOf("birth year") !== -1 || lc.indexOf("year") !== -1) return "year";
    if (lc.indexOf("date") !== -1) return "date";
    return null;
  }

  function getSelectOptionMode(select, value) {
    if (!select || !value) return null;
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        return (
          options[i].getAttribute("data-selection-mode") ||
          inferPropertyDateModeFromLabel(options[i].value || options[i].textContent)
        );
      }
    }
    return inferPropertyDateModeFromLabel(value);
  }

  function setPropertyDateFieldState(field, enabled, required) {
    if (!field) return;
    field.disabled = !enabled;
    field.setAttribute("aria-hidden", enabled ? "false" : "true");
    if (field._flatpickr && field._flatpickr.altInput) {
      field._flatpickr.altInput.disabled = !enabled;
      if (!enabled) field._flatpickr.clear();
    }
    if (enabled) {
      if (required) {
        if (field.tagName !== "SELECT") {
          field.setAttribute("required", "");
        }
        field.setAttribute("aria-required", "true");
      } else {
        field.removeAttribute("required");
        field.removeAttribute("aria-required");
      }
    } else {
      if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
      } else {
        field.value = "";
      }
      field.removeAttribute("required");
      field.removeAttribute("aria-required");
    }
  }

  function initSelectDependentInputs() {
    document.querySelectorAll("select[data-show-input-on-selection]").forEach(function (select) {
      if (select.dataset.selectDependentBound === "1") return;
      select.dataset.selectDependentBound = "1";

      var wrap = select.closest(".wizard__select-with-input");
      if (!wrap) return;
      var dependentWrap = wrap.querySelector("[data-select-dependent-input]");
      if (!dependentWrap) return;

      var isPropertyDate = dependentWrap.getAttribute("data-select-dependent-type") === "property_date";
      var dependentInput = isPropertyDate
        ? null
        : dependentWrap.querySelector("input, textarea");
      if (!isPropertyDate && !dependentInput) return;

      var shouldRequire =
        dependentWrap.getAttribute("data-selection-input-required") === "true" ||
        (dependentInput && dependentInput.getAttribute("data-selection-input-required") === "true");

      function shouldShowDependentInput(value) {
        var normalized = String(value || "").trim();
        if (!normalized) return false;
        if (normalized.toLowerCase() === "none") return false;

        var showValues = select.getAttribute("data-show-selection-values");
        if (showValues) {
          var showList = showValues.split(",").map(function (v) { return v.trim().toLowerCase(); });
          return showList.indexOf(normalized.toLowerCase()) !== -1;
        }

        var hideValues = select.getAttribute("data-hide-selection-values");
        if (hideValues) {
          var hideList = hideValues.split(",").map(function (v) { return v.trim().toLowerCase(); });
          if (hideList.indexOf(normalized.toLowerCase()) !== -1) return false;
        }

        if (isPropertyDate) {
          var mode = getSelectOptionMode(select, normalized);
          if (mode === "no_record") return false;
        }

        return true;
      }

      function dispatchPricingRefresh() {
        window.dispatchEvent(
          new CustomEvent("product-form:pricing-refresh", {
            bubbles: true,
            detail: { source: "select-dependent-input" },
          })
        );
      }

      function resetPropertyDateModes() {
        dependentWrap.querySelectorAll("[data-selection-mode]").forEach(function (modePanel) {
          modePanel.hidden = true;
          modePanel.querySelectorAll("input, select, textarea").forEach(function (field) {
            setPropertyDateFieldState(field, false, false);
          });
        });
      }

      function setPropertyDateMode(mode) {
        resetPropertyDateModes();
        if (!mode) return;
        var panel = dependentWrap.querySelector('[data-selection-mode="' + mode + '"]');
        if (!panel) return;
        panel.hidden = false;
        panel.querySelectorAll("input, select, textarea").forEach(function (field) {
          setPropertyDateFieldState(field, true, shouldRequire);
        });
        var dateInput = panel.querySelector("[data-flatpickr-date]");
        if (dateInput) initFlatpickrDateInput(dateInput);
      }

      function setDependentInputVisible(visible) {
        dependentWrap.hidden = !visible;

        if (isPropertyDate) {
          if (!visible) resetPropertyDateModes();
          dispatchPricingRefresh();
          return;
        }

        dependentInput.disabled = !visible;
        dependentInput.setAttribute("aria-hidden", visible ? "false" : "true");

        if (visible) {
          if (shouldRequire) {
            dependentInput.setAttribute("required", "");
            dependentInput.setAttribute("aria-required", "true");
          }
        } else {
          dependentInput.value = "";
          dependentInput.removeAttribute("required");
          dependentInput.removeAttribute("aria-required");
        }

        dispatchPricingRefresh();
      }

      function syncDependentInput() {
        var selectedValue = String(select.value || "").trim();
        var visible = shouldShowDependentInput(selectedValue);
        setDependentInputVisible(visible);

        if (isPropertyDate) {
          if (visible) {
            setPropertyDateMode(getSelectOptionMode(select, selectedValue));
          }
          return;
        }

        if (visible) {
          var keepPlaceholder = select.getAttribute("data-show-selection-values");
          var fallbackPlaceholder = dependentInput.getAttribute("data-selection-input-placeholder") || "";
          dependentInput.placeholder = keepPlaceholder && fallbackPlaceholder ? fallbackPlaceholder : selectedValue;
        } else {
          var resetPlaceholder = dependentInput.getAttribute("data-selection-input-placeholder") || "";
          dependentInput.placeholder = resetPlaceholder;
        }
      }

      select.addEventListener("change", syncDependentInput);
      syncDependentInput();
    });
  }

  function initRepeatableFields() {
    document.querySelectorAll("[data-repeatable-list]").forEach(function (wrapper) {
      ensureRepeatableRowStructure(wrapper);
    });

    document.querySelectorAll("[data-repeatable-add]").forEach(function (button) {
      if (button.dataset.repeatableBound === "1") return;
      button.dataset.repeatableBound = "1";
      button.addEventListener("click", function () {
        addRepeatableInput(button);
      });

      var wrapper = button.closest("[data-repeatable-list]") || button.parentElement;
      var propertyName = button.getAttribute("data-repeatable-name");
      var placeholderBase = button.getAttribute("data-repeatable-placeholder") || "";
      if (!wrapper || !propertyName) return;
      syncRepeatableList(wrapper, button);
    });

    if (!initRepeatableFields._removeBound) {
      initRepeatableFields._removeBound = true;
      document.addEventListener("click", function (event) {
        var removeBtn = event.target.closest("[data-repeatable-remove]");
        if (!removeBtn || removeBtn.disabled || removeBtn.hidden) return;
        event.preventDefault();
        removeRepeatableInput(removeBtn);
      });
    }
  }

  function initProductWizardScroll() {
    var wizard = document.getElementById("product-wizard");
    if (!wizard) return;

    var stepBtns = wizard.querySelectorAll(".wizard__step-btn");
    var stepSections = wizard.querySelectorAll(
      '.wizard__step-content[data-wizard-step], section[data-wizard-step]'
    );
    var stepNav = wizard.querySelector(".wizard__step-nav");
    var ticking = false;

    function getScrollOffset() {
      var offset = parseFloat(getComputedStyle(wizard).getPropertyValue("--wizard-scroll-offset"));
      return isNaN(offset) ? 250 : offset;
    }

    function setActiveStep(step) {
      if (stepNav) stepNav.setAttribute("data-progress", String(step));
      stepBtns.forEach(function (btn) {
        var n = parseInt(btn.getAttribute("data-step"), 10);
        btn.classList.remove("wizard__step-btn--active", "wizard__step-btn--pending", "wizard__step-btn--completed");
        btn.removeAttribute("aria-current");
        if (n < step) {
          btn.classList.add("wizard__step-btn--completed");
        } else if (n === step) {
          btn.classList.add("wizard__step-btn--active");
          btn.setAttribute("aria-current", "step");
        } else {
          btn.classList.add("wizard__step-btn--pending");
        }
      });
    }

    function getActiveStepFromScroll() {
      var offset = getScrollOffset();
      var active = 1;
      stepSections.forEach(function (section) {
        var top = section.getBoundingClientRect().top;
        if (top - offset <= 0) {
          active = parseInt(section.getAttribute("data-wizard-step"), 10) || active;
        }
      });
      return active;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        setActiveStep(getActiveStepFromScroll());
        ticking = false;
      });
    }

    function scrollToStep(step) {
      var target = wizard.querySelector('[data-wizard-step="' + step + '"]');
      if (!target) return;
      var offset = getScrollOffset();
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "auto" });
    }

    stepBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var selStep = parseInt(btn.getAttribute("data-step"), 10);
        scrollToStep(selStep);
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    setActiveStep(getActiveStepFromScroll());
  }

  function initProductVoiceToggles(scope) {
    var root = scope || document;
    root.querySelectorAll("[data-voice-toggle]").forEach(function (toggleBtn) {
      if (toggleBtn.dataset.voiceBound === "1") return;
      toggleBtn.dataset.voiceBound = "1";
      var targetId = toggleBtn.getAttribute("data-voice-for");
      var audio = targetId ? document.getElementById(targetId) : null;
      if (!audio) return;
      var iconPlay = toggleBtn.querySelector(".voice-icon-play");
      var iconPause = toggleBtn.querySelector(".voice-icon-pause");
      if (!iconPlay || !iconPause) return;

      function updateIcons(isPlaying) {
        iconPlay.style.display = isPlaying ? "none" : "";
        iconPause.style.display = isPlaying ? "" : "none";
      }

      toggleBtn.addEventListener("click", function () {
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      });

      audio.addEventListener("play", function () {
        updateIcons(true);
      });
      audio.addEventListener("pause", function () {
        updateIcons(false);
      });
      audio.addEventListener("ended", function () {
        updateIcons(false);
      });

      updateIcons(!audio.paused && !audio.ended);
    });
  }

  window.initProductVoiceToggles = initProductVoiceToggles;

  function initProductVideoToggles(scope) {
    var root = scope || document;
    root.querySelectorAll("[data-video-toggle]").forEach(function (toggleBtn) {
      if (toggleBtn.dataset.videoBound === "1") return;
      toggleBtn.dataset.videoBound = "1";

      toggleBtn.addEventListener("click", function () {
        var indexAttr = toggleBtn.getAttribute("data-video-slide-index");
        if (indexAttr == null || indexAttr === "") return;
        var slideIndex = parseInt(indexAttr, 10);
        if (!Number.isFinite(slideIndex) || slideIndex < 1) return;
        if (typeof window.toggleProductGalleryVideo === "function") {
          window.toggleProductGalleryVideo(slideIndex);
        } else if (typeof window.goToProductGallerySlide === "function") {
          window.goToProductGallerySlide(slideIndex);
        }
      });
    });
  }

  function initHelpTooltips() {
    var HOVER_CLOSE_DELAY = 120;
    var useClickToggle = window.matchMedia("(pointer: coarse)").matches;

    function getHelpTooltipTrigger(panel) {
      if (!panel) return null;
      var wrap = panel.closest(".product-page__help-tooltip");
      if (wrap) {
        return wrap.querySelector(".product-page__help-tooltip-trigger");
      }
      var triggerId = panel.id;
      return triggerId
        ? document.querySelector('.product-page__help-tooltip-trigger[aria-controls="' + triggerId + '"]')
        : null;
    }

    function getHelpTooltipWrap(panel) {
      return panel ? panel.closest(".product-page__help-tooltip") : null;
    }

    function openHelpTooltipPanel(trigger, panel) {
      if (!panel || !trigger) return;
      closeHelpTooltips(panel);
      panel.hidden = false;
      var wrap = getHelpTooltipWrap(panel);
      if (wrap) wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }

    function closeHelpTooltipPanel(panel) {
      if (!panel) return;
      panel.hidden = true;
      var wrap = getHelpTooltipWrap(panel);
      if (wrap) wrap.classList.remove("is-open");
      var trigger = getHelpTooltipTrigger(panel);
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }

    function closeHelpTooltips(exceptPanel) {
      document.querySelectorAll(".product-page__help-tooltip-panel").forEach(function (panel) {
        if (panel === exceptPanel) return;
        closeHelpTooltipPanel(panel);
      });
    }

    document.querySelectorAll(".product-page__help-tooltip-close").forEach(function (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var panel = closeBtn.closest(".product-page__help-tooltip-panel");
        closeHelpTooltipPanel(panel);
      });
    });

    document.querySelectorAll(".product-page__help-tooltip").forEach(function (wrap) {
      if (wrap.dataset.helpTooltipBound === "1") return;
      wrap.dataset.helpTooltipBound = "1";

      var trigger = wrap.querySelector(".product-page__help-tooltip-trigger");
      var panel = wrap.querySelector(".product-page__help-tooltip-panel");
      if (!trigger || !panel) return;

      var closeTimer = null;

      function clearCloseTimer() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      }

      function scheduleClose() {
        clearCloseTimer();
        closeTimer = setTimeout(function () {
          closeHelpTooltipPanel(panel);
        }, HOVER_CLOSE_DELAY);
      }

      function bindHoverOpen(el) {
        el.addEventListener("mouseenter", function () {
          clearCloseTimer();
          openHelpTooltipPanel(trigger, panel);
        });
        el.addEventListener("mouseleave", scheduleClose);
      }

      if (!useClickToggle) {
        bindHoverOpen(trigger);
        bindHoverOpen(panel);

        trigger.addEventListener("focus", function () {
          clearCloseTimer();
          openHelpTooltipPanel(trigger, panel);
        });
        trigger.addEventListener("blur", scheduleClose);

        trigger.addEventListener("click", function (e) {
          e.preventDefault();
        });
      } else {
        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          var willOpen = panel.hidden;
          closeHelpTooltips(willOpen ? panel : null);
          if (willOpen) {
            openHelpTooltipPanel(trigger, panel);
          } else {
            closeHelpTooltipPanel(panel);
          }
        });

        panel.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    });

    if (useClickToggle) {
      document.addEventListener("click", function () {
        closeHelpTooltips(null);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeHelpTooltips(null);
    });
  }

  function initMessageStepVoicePlayer() {
    var wizard = document.getElementById("product-wizard");
    if (!wizard) return;
    var audio = wizard.querySelector(".product-page__voice-audio");
    if (!audio) return;
    var step4 = wizard.querySelector('[data-wizard-step="4"]');
    if (!step4 || !step4.contains(audio)) return;

    var toggleBtn = step4.querySelector("[data-voice-toggle]");
    if (!toggleBtn) return;

    var targetId = toggleBtn.getAttribute("data-voice-for");
    if (targetId && document.getElementById(targetId) !== audio) return;

    var iconPlay = toggleBtn.querySelector(".voice-icon-play");
    var iconPause = toggleBtn.querySelector(".voice-icon-pause");
    var elRemaining = toggleBtn.parentElement && toggleBtn.parentElement.querySelector("[data-voice-remaining]");
    var voicePlayer = audio.closest(".product-page__voice-player");
    var waveWrap = voicePlayer && voicePlayer.querySelector(".product-page__voice-wave");
    if (!iconPlay || !iconPause) return;

    function formatClock(totalSeconds) {
      if (!isFinite(totalSeconds) || totalSeconds < 0) return "—";
      var s = Math.floor(Math.max(0, totalSeconds));
      var m = Math.floor(s / 60);
      s = s % 60;
      return m + ":" + String(s).padStart(2, "0");
    }

    function updateTimeLabels() {
      if (!elRemaining) return;
      var d = audio.duration;
      if (!isFinite(d) || d <= 0) {
        elRemaining.textContent = "—";
        return;
      }
      var left = d - audio.currentTime;
      if (audio.ended) left = 0;
      elRemaining.textContent = formatClock(left);
    }

    function updateIcons(isPlaying) {
      iconPlay.style.display = isPlaying ? "none" : "";
      iconPause.style.display = isPlaying ? "" : "none";
    }

    function updateWaveVisibility() {
      if (!waveWrap) return;
      if (!audio.paused && !audio.ended) {
        waveWrap.classList.remove("hidden");
      } else if (audio.ended) {
        waveWrap.classList.add("hidden");
      }
    }

    toggleBtn.addEventListener("click", function () {
      if (audio.paused) {
        if (waveWrap) waveWrap.classList.remove("hidden");
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("loadedmetadata", updateTimeLabels);
    audio.addEventListener("durationchange", updateTimeLabels);
    audio.addEventListener("timeupdate", updateTimeLabels);
    audio.addEventListener("play", function () {
      updateIcons(true);
      updateTimeLabels();
      updateWaveVisibility();
    });
    audio.addEventListener("pause", function () {
      updateIcons(false);
      updateTimeLabels();
      updateWaveVisibility();
    });
    audio.addEventListener("ended", function () {
      updateIcons(false);
      updateTimeLabels();
      updateWaveVisibility();
    });

    updateIcons(!audio.paused && !audio.ended);
    updateTimeLabels();
    updateWaveVisibility();
  }

  function initCharCounters() {
    document.querySelectorAll("textarea[data-char-count]").forEach(function (textarea) {
      if (textarea.dataset.charCountBound === "1") return;
      textarea.dataset.charCountBound = "1";

      var counter = textarea.parentElement && textarea.parentElement.querySelector("[data-char-count-for]");
      if (!counter) return;
      var currentEl = counter.querySelector("[data-char-count-current]");
      if (!currentEl) return;

      function syncCount() {
        currentEl.textContent = String(textarea.value || "").length;
      }

      textarea.addEventListener("input", syncCount);
      syncCount();
    });
  }

  function initCustomMessageGroups() {
    document.querySelectorAll("[data-custom-message]").forEach(function (root) {
      var select = root.querySelector("[data-custom-message-selector]");
      if (!select) return;

      function syncGroups() {
        var selected = String(select.value || "").trim();
        root.querySelectorAll("[data-custom-message-group]").forEach(function (group) {
          var groupValue = String(group.getAttribute("data-custom-message-group") || "").trim();
          var isActive = selected !== "" && groupValue === selected;
          group.hidden = !isActive;
          group.querySelectorAll("[data-custom-message-radio]").forEach(function (radio) {
            if (!isActive) {
              radio.checked = false;
              radio.disabled = true;
              radio.setAttribute("aria-hidden", "true");
              radio.removeAttribute("required");
            } else {
              radio.disabled = false;
              radio.removeAttribute("aria-hidden");
            }
          });
        });
      }

      select.addEventListener("change", syncGroups);
      syncGroups();
    });
  }

  function initProductWizard() {
    initRepeatableFields();
    initSelectDependentInputs();
    initCustomMessageGroups();
    initCharCounters();
    initProductWizardScroll();
    initHelpTooltips();
    var wizard = document.getElementById("product-wizard") || document;
    initProductVoiceToggles(wizard);
    initProductVideoToggles(wizard);
    initMessageStepVoicePlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductWizard);
  } else {
    initProductWizard();
  }
})();

// Product form file upload field
(function () {
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function getDropboxConfig() {
    var el = document.getElementById("forever-art-dropbox-config");
    if (!el) return { enabled: false, proxyUrl: "", folder: "/custom_wedding_posters" };
    try {
      var parsed = JSON.parse(el.textContent || "{}");
      return {
        enabled: Boolean(parsed.enabled),
        proxyUrl: String(parsed.proxyUrl || "").trim(),
        folder: String(parsed.folder || "/custom_wedding_posters").trim() || "/custom_wedding_posters",
      };
    } catch (err) {
      return { enabled: false, proxyUrl: "", folder: "/custom_wedding_posters" };
    }
  }

  /**
   * Ask Dropbox (via your proxy) to save a public Shopify/Cloudinary URL.
   * Matches Dropbox /2/files/save_url payload: { path, url }.
   * Do not call api.dropboxapi.com from the browser with an access token.
   */
  function uploadShopifyUrlToDropbox(shopifyFileUrl, fileName, options) {
    options = options || {};
    var proxyUrl = String(options.proxyUrl || "").trim();
    if (!proxyUrl) {
      return Promise.reject(new Error("Dropbox proxy URL is not configured."));
    }
    if (!shopifyFileUrl || !/^https?:\/\//i.test(String(shopifyFileUrl))) {
      return Promise.reject(new Error("A public http(s) file URL is required for Dropbox save_url."));
    }

    var folder = String(options.folder || "/custom_wedding_posters").replace(/\/+$/, "") || "/custom_wedding_posters";
    var safeName = String(fileName || "upload")
      .replace(/[\\/]/g, "-")
      .replace(/\s+/g, "-");
    var payload = {
      path: folder + "/" + safeName,
      url: String(shopifyFileUrl),
    };

    return fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (data) {
        if (!response.ok) {
          var message =
            (data && (data.error_summary || data.error || data.message)) ||
            "Dropbox save_url failed";
          throw new Error(typeof message === "string" ? message : "Dropbox save_url failed");
        }
        return data;
      });
    });
  }

  window.uploadShopifyUrlToDropbox = uploadShopifyUrlToDropbox;

  function parseUploadResponse(payload, responseText) {
    if (payload && typeof payload === "object") {
      if (typeof payload.url === "string" && payload.url) return [payload.url];
      if (typeof payload.secure_url === "string" && payload.secure_url) return [payload.secure_url];
      if (typeof payload.path === "string" && payload.path) return [payload.path];
      if (typeof payload.file === "string" && payload.file) return [payload.file];
      if (Array.isArray(payload.urls)) {
        return payload.urls.filter(function (url) {
          return typeof url === "string" && url;
        });
      }
      if (payload.data && typeof payload.data.url === "string") return [payload.data.url];
    }
    var text = String(responseText || "").trim();
    if (/^https?:\/\//i.test(text) || text.charAt(0) === "/") return [text];
    return [];
  }

  function setStatus(root, message, state) {
    var status = root.querySelector("[data-upload-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", state === "error");
    status.classList.toggle("is-success", state === "success");
  }

  function renderFileList(root, files) {
    var list = root.querySelector("[data-upload-file-list]");
    if (!list) return;
    list.innerHTML = "";
    if (!files.length) {
      list.hidden = true;
      return;
    }
    list.hidden = false;
    files.forEach(function (file) {
      var item = document.createElement("li");
      item.className = "wizard__upload-file-item";
      item.innerHTML =
        '<span class="wizard__upload-file-name"></span>' +
        '<span class="wizard__upload-file-meta"></span>';
      item.querySelector(".wizard__upload-file-name").textContent = file.name;
      item.querySelector(".wizard__upload-file-meta").textContent = formatBytes(file.size);
      list.appendChild(item);
    });
  }

  function uploadOneFile(file, endpoint, preset) {
    var body = new FormData();
    body.append("file", file);
    if (preset) body.append("upload_preset", preset);
    body.append("filename", file.name);

    return fetch(endpoint, {
      method: "POST",
      body: body,
    }).then(function (response) {
      return response.text().then(function (text) {
        var payload = null;
        try {
          payload = JSON.parse(text);
        } catch (err) {
          payload = null;
        }
        if (!response.ok) {
          var message =
            (payload && (payload.error && (payload.error.message || payload.error))) ||
            payload.message ||
            text ||
            "Upload failed";
          throw new Error(typeof message === "string" ? message : "Upload failed");
        }
        var urls = parseUploadResponse(payload, text);
        if (!urls.length) {
          throw new Error("Upload succeeded but no file URL was returned.");
        }
        return { url: urls[0], fileName: file.name };
      });
    });
  }

  function initProductUploads() {
    var dropboxConfig = getDropboxConfig();

    document.querySelectorAll("[data-product-upload]").forEach(function (root) {
      if (root.dataset.uploadInit === "1") return;
      root.dataset.uploadInit = "1";

      var fileInput = root.querySelector("[data-upload-input]");
      var selectBtn = root.querySelector("[data-upload-select]");
      var submitBtn = root.querySelector("[data-upload-submit]");
      var valueInput = root.querySelector("[data-upload-value]");
      if (!fileInput || !selectBtn || !submitBtn || !valueInput) return;

      var selectedFiles = [];
      var maxFiles = Math.max(1, parseInt(root.getAttribute("data-upload-max-files") || "5", 10) || 5);
      var maxSizeMb = Math.max(0.1, parseFloat(root.getAttribute("data-upload-max-size-mb") || "10") || 10);
      var maxBytes = maxSizeMb * 1024 * 1024;
      var fieldEndpoint = (root.getAttribute("data-upload-endpoint") || "").trim();
      var preset = (root.getAttribute("data-upload-preset") || "").trim();
      var fieldDropboxSync = root.getAttribute("data-dropbox-sync") !== "false";
      var fieldDropboxFolder = (root.getAttribute("data-dropbox-folder") || "").trim();
      var dropboxConfigured =
        fieldDropboxSync && dropboxConfig.enabled && Boolean(dropboxConfig.proxyUrl);
      // Prefer field endpoint (e.g. Cloudinary). Otherwise upload straight to the Dropbox proxy.
      var endpoint = fieldEndpoint || (dropboxConfigured ? dropboxConfig.proxyUrl : "");
      var directDropboxUpload = dropboxConfigured && !fieldEndpoint;
      // Only call save_url after Cloudinary-style public URL uploads — not when the proxy already stored the file.
      var dropboxSaveUrlAfter = dropboxConfigured && Boolean(fieldEndpoint);

      function syncButtons() {
        submitBtn.disabled = selectedFiles.length === 0 || submitBtn.dataset.loading === "1";
      }

      function clearError() {
        root.classList.remove("is-error");
      }

      selectBtn.addEventListener("click", function () {
        fileInput.click();
      });

      fileInput.addEventListener("change", function () {
        clearError();
        var next = Array.prototype.slice.call(fileInput.files || []);
        if (!next.length) return;

        if (next.length > maxFiles) {
          setStatus(root, "You can select up to " + maxFiles + " file" + (maxFiles === 1 ? "" : "s") + ".", "error");
          fileInput.value = "";
          return;
        }

        var oversized = next.find(function (file) {
          return file.size > maxBytes;
        });
        if (oversized) {
          setStatus(
            root,
            oversized.name + " is too large. Max size is " + maxSizeMb + " MB.",
            "error"
          );
          fileInput.value = "";
          return;
        }

        selectedFiles = next;
        valueInput.value = "";
        renderFileList(root, selectedFiles);
        setStatus(
          root,
          selectedFiles.length +
            " file" +
            (selectedFiles.length === 1 ? "" : "s") +
            " selected. Click Upload to continue.",
          ""
        );
        syncButtons();
      });

      submitBtn.addEventListener("click", function () {
        if (!selectedFiles.length || submitBtn.dataset.loading === "1") return;
        clearError();
        submitBtn.dataset.loading = "1";
        submitBtn.disabled = true;
        setStatus(root, "Uploading…", "");

        var uploadPromise;
        if (endpoint) {
          var uploadUrl = directDropboxUpload
            ? String(endpoint).replace(/\/+$/, "") + "/upload"
            : endpoint;
          uploadPromise = Promise.all(
            selectedFiles.map(function (file) {
              return uploadOneFile(file, uploadUrl, preset);
            })
          );
        } else {
          uploadPromise = Promise.reject(
            new Error(
              "Upload is not configured. In Theme settings enable Dropbox sync and set the Dropbox proxy URL, or set an Upload endpoint on this field."
            )
          );
        }

        uploadPromise
          .then(function (results) {
            var urls = results.map(function (item) {
              return typeof item === "string" ? item : item.url;
            });

            var afterDropbox = Promise.resolve(results);
            if (dropboxSaveUrlAfter) {
              setStatus(root, "Saving to Dropbox…", "");
              afterDropbox = Promise.all(
                results.map(function (item, index) {
                  var url = typeof item === "string" ? item : item.url;
                  var fileName =
                    (typeof item === "object" && item.fileName) ||
                    (selectedFiles[index] && selectedFiles[index].name) ||
                    "upload-" + (index + 1);
                  if (!/^https?:\/\//i.test(String(url))) {
                    return Promise.resolve(null);
                  }
                  return uploadShopifyUrlToDropbox(url, fileName, {
                    proxyUrl: dropboxConfig.proxyUrl,
                    folder: fieldDropboxFolder || dropboxConfig.folder,
                  });
                })
              ).then(function () {
                return results;
              });
            }

            return afterDropbox.then(function () {
              return urls;
            });
          })
          .then(function (urls) {
            valueInput.value = urls.join(", ");
            var successSuffix = directDropboxUpload || dropboxSaveUrlAfter
              ? " uploaded to Dropbox."
              : " uploaded successfully.";
            setStatus(
              root,
              urls.length +
                " file" +
                (urls.length === 1 ? "" : "s") +
                successSuffix,
              "success"
            );
            root.classList.remove("is-error");
            valueInput.dispatchEvent(new Event("input", { bubbles: true }));
            valueInput.dispatchEvent(new Event("change", { bubbles: true }));
            window.dispatchEvent(
              new CustomEvent("product-form:pricing-refresh", {
                bubbles: true,
                detail: { source: "upload" },
              })
            );
          })
          .catch(function (err) {
            valueInput.value = "";
            root.classList.add("is-error");
            setStatus(root, (err && err.message) || "Upload failed. Please try again.", "error");
          })
          .finally(function () {
            submitBtn.dataset.loading = "0";
            syncButtons();
          });
      });

      syncButtons();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductUploads);
  } else {
    initProductUploads();
  }
})();
