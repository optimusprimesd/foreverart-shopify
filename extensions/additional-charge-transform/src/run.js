// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 */

/**
 * @param {RunInput} input
 * @returns {CartTransformRunResult}
 */
export function run(input) {
  /** @type {CartTransformRunResult["operations"]} */
  const operations = [];

  for (const line of input.cart.lines) {
    const additionalCents = parseInt(line.attribute?.value || "0", 10);
    if (!Number.isFinite(additionalCents) || additionalCents <= 0) {
      continue;
    }

    const baseAmount = parseFloat(line.cost.amountPerQuantity.amount);
    if (!Number.isFinite(baseAmount)) {
      continue;
    }

    const newAmount = (baseAmount + additionalCents / 100).toFixed(2);

    operations.push({
      lineUpdate: {
        cartLineId: line.id,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: newAmount,
            },
          },
        },
      },
    });
  }

  return { operations };
}
