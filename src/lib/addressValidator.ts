import { Address } from "./types";

export interface AddressValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validates individual saved address profile records for data quality controls.
 */
export function validateAddress(address: Partial<Address>): AddressValidation {
  const errors: string[] = [];

  if (!address.name || address.name.trim().length < 2) {
    errors.push("Address name (e.g. 'Home', 'Office') must be at least 2 characters.");
  }

  if (!address.street || address.street.trim().length < 5) {
    errors.push("Street address details must be at least 5 characters.");
  }

  if (!address.city || address.city.trim().length < 2) {
    errors.push("City name is required.");
  }

  if (!address.state || address.state.trim().length < 2) {
    errors.push("State or Province is required.");
  }

  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip.trim())) {
    errors.push("Invalid postal code format. Must be 5 digits (e.g., 12345).");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Safely sanitizes address inputs before db storage.
 */
export function sanitizeAddress(address: Address): Address {
  return {
    ...address,
    name: address.name.trim(),
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    zip: address.zip.trim().replace(/\s/g, "")
  };
}
