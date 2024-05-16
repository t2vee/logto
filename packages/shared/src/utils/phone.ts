import { parsePhoneNumberWithError } from 'libphonenumber-js/mobile';
import type { E164Number } from 'libphonenumber-js/mobile';

export { ParseError } from 'libphonenumber-js/mobile';

function validateE164Number(value: string): asserts value is E164Number {
  if (value && !value.startsWith('+')) {
    throw new TypeError(`Invalid E164Number: ${value}`);
  }
}

const parseE164Number = (value: string): E164Number | '' => {
  // If typeof `value` is string and `!value` is true, then `value` is an empty string.
  if (!value) {
    return '';
  }

  const result = value.startsWith('+') ? value : `+${value}`;
  validateE164Number(result);
  return result;
};

export const parseE164PhoneNumberWithError = (value: string) =>
  parsePhoneNumberWithError(parseE164Number(value));

/**
 * Parse phone number to number string.
 * E.g. +1 (650) 253-0000 -> 16502530000
 */
export const parsePhoneNumber = (phone: string) => {
  try {
    return parseE164PhoneNumberWithError(phone).number.slice(1);
  } catch {
    console.error(`Invalid phone number: ${phone}`);
    return phone;
  }
};

/**
 * Parse phone number to readable international format.
 * E.g. 16502530000 -> +1 650 253 0000
 */
export const formatToInternationalPhoneNumber = (phone: string) => {
  try {
    return parseE164PhoneNumberWithError(phone).formatInternational();
  } catch {
    console.error(`Invalid phone number: ${phone}`);
    return phone;
  }
};
