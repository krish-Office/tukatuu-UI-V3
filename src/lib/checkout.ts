export interface CartSummary {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  discountedSubtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}

// State-level sales tax rates
const REGIONAL_TAX_RATES: Record<string, number> = {
  CA: 0.0725, // 7.25% California
  TX: 0.0625, // 6.25% Texas
  FL: 0.0600, // 6.00% Florida
  NY: 0.0800, // 8.00% New York
  WA: 0.0650, // 6.50% Washington
  default: 0.0800 // 8.00% standard tax rate
};

const SHIPPING_RULES = {
  freeThreshold: 50.00, // Free shipping if subtotal after discount >= $50
  standardCost: 10.00, // $10 standard shipping cost
  expressAddon: 15.00 // Express shipping adds $15
};

/**
 * Calculates a complete, centralized receipt breakdown for checkout invoicing.
 */
export function calculateCheckoutSummary(
  subtotal: number,
  discountPercent = 0,
  postalCodeOrState = "",
  shippingMethod: "standard" | "express" = "standard"
): CartSummary {
  // 1. Discount calculations
  const discountAmount = subtotal * (Math.min(100, Math.max(0, discountPercent)) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // 2. Tax rate resolution based on zip code prefix or state code input
  let taxRate = REGIONAL_TAX_RATES.default;
  if (postalCodeOrState) {
    const cleanInput = postalCodeOrState.trim().toUpperCase();
    if (REGIONAL_TAX_RATES[cleanInput]) {
      taxRate = REGIONAL_TAX_RATES[cleanInput];
    } else {
      // Resolve US states from common ZIP ranges
      const zip = parseInt(cleanInput.slice(0, 5));
      if (!isNaN(zip)) {
        if (zip >= 90000 && zip <= 96199) taxRate = REGIONAL_TAX_RATES.CA; // California
        else if (zip >= 75000 && zip <= 79999) taxRate = REGIONAL_TAX_RATES.TX; // Texas
        else if (zip >= 32000 && zip <= 34999) taxRate = REGIONAL_TAX_RATES.FL; // Florida
        else if (zip >= 10000 && zip <= 14999) taxRate = REGIONAL_TAX_RATES.NY; // New York
        else if (zip >= 98000 && zip <= 99499) taxRate = REGIONAL_TAX_RATES.WA; // Washington
      }
    }
  }
  const taxAmount = discountedSubtotal * taxRate;

  // 3. Shipping logic
  let shippingCost = 0;
  if (discountedSubtotal > 0 && discountedSubtotal < SHIPPING_RULES.freeThreshold) {
    shippingCost = SHIPPING_RULES.standardCost;
  }
  if (shippingMethod === "express" && discountedSubtotal > 0) {
    shippingCost += SHIPPING_RULES.expressAddon;
  }

  // 4. Totals accumulation
  const total = discountedSubtotal + taxAmount + shippingCost;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    discountedSubtotal,
    taxRate,
    taxAmount,
    shippingCost,
    total
  };
}

/**
 * Validates checkout form data before initiating reservations and payments.
 */
export function validateCheckoutForm(data: {
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zip: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.phone.trim() || !/^[\d\s\-\+\(\)]{10,}$/.test(data.phone.trim().replace(/\s/g, ""))) {
    errors.push("Invalid contact phone format. Must be at least 10 digits.");
  }

  if (!data.firstName.trim() || data.firstName.trim().length < 2) {
    errors.push("First name must be at least 2 characters.");
  }

  if (!data.lastName.trim() || data.lastName.trim().length < 2) {
    errors.push("Last name must be at least 2 characters.");
  }

  if (!data.address.trim() || data.address.trim().length < 5) {
    errors.push("Street address must be at least 5 characters.");
  }

  if (!data.city.trim() || data.city.trim().length < 2) {
    errors.push("City name is required.");
  }

  if (!data.zip.trim() || !/^\d{5}(-\d{4})?$/.test(data.zip.trim())) {
    errors.push("Invalid postal code. Format should be: 12345 or 12345-6789");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
