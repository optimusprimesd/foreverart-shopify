(function () {
  "use strict";

  function formatMoney(cents, format) {
    if (typeof cents !== "number" || !isFinite(cents)) return "";
    var value = (cents / 100).toFixed(2);
    var amount = value;
    var amountNoDecimals = Math.round(cents / 100).toString();
    var amountWithComma = value.replace(".", ",");
    var amountNoDecimalsWithComma = amountNoDecimals;

    if (!format) {
      return "$" + value;
    }

    return format
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, amountWithComma)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, amountNoDecimalsWithComma)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, amountNoDecimals)
      .replace(/\{\{\s*amount\s*\}\}/g, amount);
  }

  function parseChargeCents(el) {
    var raw = el.getAttribute("data-additional-charge-cents");
    var cents = parseInt(raw || "0", 10);
    return Number.isFinite(cents) && cents > 0 ? cents : 0;
  }

  function hasMeaningfulValue(value) {
    return String(value == null ? "" : value).trim() !== "";
  }

  function elementTriggersCharge(el) {
    if (el.getAttribute("data-additional-charge-type") === "radio") {
      var checked = el.querySelector('input[type="radio"]:checked:not([disabled])');
      return !!(checked && hasMeaningfulValue(checked.value));
    }

    if (!el.matches("input, textarea, select")) {
      return false;
    }

    // Hidden fee total input must never self-trigger a charge.
    if (el.hasAttribute("data-additional-charge-total-input")) {
      return false;
    }

    if (el.disabled) {
      return false;
    }

    if (el.type === "radio") {
      return el.checked && hasMeaningfulValue(el.value);
    }

    if (el.type === "checkbox") {
      return el.checked;
    }

    if (el.tagName === "SELECT") {
      var selected = el.selectedOptions && el.selectedOptions[0];
      if (!selected || selected.disabled) return false;
      return hasMeaningfulValue(selected.value);
    }

    // Only charge once the customer has entered a real value.
    return hasMeaningfulValue(el.value);
  }

  function calculateAdditionalChargeCents(scope) {
    var root = scope || document;
    // Flat customization fee: use the highest single field charge (typically $20),
    // never stack multiple $20 fields into $40+.
    var maxCharge = 0;
    var seenRadioGroups = new Set();

    root.querySelectorAll("[data-additional-charge-cents]").forEach(function (el) {
      if (el.getAttribute("data-additional-charge-type") === "radio") {
        if (seenRadioGroups.has(el)) return;
        seenRadioGroups.add(el);
        if (elementTriggersCharge(el)) {
          maxCharge = Math.max(maxCharge, parseChargeCents(el));
        }
        return;
      }

      if (el.type === "radio") {
        return;
      }

      if (elementTriggersCharge(el)) {
        maxCharge = Math.max(maxCharge, parseChargeCents(el));
      }
    });

    return maxCharge;
  }

  function getBasePriceCents(form, wizard) {
    var fromWizard = wizard && wizard.getAttribute("data-base-variant-price-cents");
    var parsed = parseInt(fromWizard || "0", 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;

    var variantInput = form && form.querySelector('input[name="id"]');
    return parseInt(variantInput && variantInput.getAttribute("data-variant-price-cents"), 10) || 0;
  }

  function getProductQuantity(form) {
    var qtyInput = form && form.querySelector('input[name="quantity"]');
    if (!qtyInput) return 1;
    var qty = parseInt(qtyInput.value, 10);
    if (!Number.isFinite(qty) || qty < 1) return 1;
    return qty;
  }

  function normalizeQuantityInput(form) {
    var qtyInput = form && form.querySelector('input[name="quantity"]');
    if (!qtyInput) return;
    var qty = parseInt(qtyInput.value, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      qtyInput.value = "1";
    }
  }

  function updateProductPriceDisplay(form, wizard) {
    if (!form) return 0;

    normalizeQuantityInput(form);

    var moneyFormat = form.getAttribute("data-money-format") || "";
    var baseCents = getBasePriceCents(form, wizard);
    // Charge only when a customization field that has additional_charge is filled.
    var additionalCents = calculateAdditionalChargeCents(form);
    var unitTotalCents = baseCents + additionalCents;
    var quantity = getProductQuantity(form);
    var lineTotalCents = unitTotalCents * quantity;
    var unitFormatted = formatMoney(unitTotalCents, moneyFormat);
    var lineFormatted = formatMoney(lineTotalCents, moneyFormat);

    // Update every price display on the product page (header + cart row), not only
    // nodes inside the form — headers live outside <form> in product-page.liquid.
    var pageRoot =
      (form.closest && form.closest(".product-page")) ||
      document.querySelector(".product-page") ||
      document;
    pageRoot.querySelectorAll("[data-product-price-display]").forEach(function (node) {
      var suffix = node.getAttribute("data-product-price-suffix") || "";
      var useQuantity = node.hasAttribute("data-product-price-quantity");
      var formatted = useQuantity ? lineFormatted : unitFormatted;
      if (node.classList.contains("product-page__price")) {
        node.textContent = formatted + (suffix || " inc. GST");
      } else {
        node.textContent = formatted;
      }
    });

    var cartBtn = form.querySelector("[data-product-add-to-cart]");
    if (cartBtn) {
      cartBtn.setAttribute("aria-label", "Add to cart, " + lineFormatted);
    }

    var hiddenInput = form.querySelector("[data-additional-charge-total-input]");
    if (hiddenInput) {
      hiddenInput.value = String(additionalCents);
    }

    return additionalCents;
  }

  function initProductFormPricing(form, wizard) {
    if (!form || form.dataset.pricingBound === "1") return;
    form.dataset.pricingBound = "1";

    var refresh = function () {
      updateProductPriceDisplay(form, wizard);
    };

    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);

    window.addEventListener("product-form:pricing-refresh", function (event) {
      if (!event || !event.target || form.contains(event.target)) {
        refresh();
      }
    });

    // Back navigation / autofill restore often skips input events.
    window.addEventListener("pageshow", function () {
      refresh();
      requestAnimationFrame(refresh);
      setTimeout(refresh, 50);
      setTimeout(refresh, 250);
    });

    refresh();
  }

  window.ProductFormPricing = {
    formatMoney: formatMoney,
    calculateAdditionalChargeCents: calculateAdditionalChargeCents,
    updateProductPriceDisplay: updateProductPriceDisplay,
    initProductFormPricing: initProductFormPricing,
  };
})();
