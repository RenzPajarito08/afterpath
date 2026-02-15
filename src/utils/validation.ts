import { differenceInYears, isFuture, isValid, parse } from "date-fns";

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  return emailRegex.test(email) ? null : "Invalid email format";
};

export const validateUsername = (username: string): string | null => {
  if (username.length < 3 || username.length > 20) {
    return "Username must be between 3 and 20 characters";
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return "Username can only contain letters, numbers, underscores, dots, and hyphens";
  }
  if (/^[.\-]/.test(username) || /[.\-]$/.test(username)) {
    return "Username cannot start or end with a dot or hyphen";
  }
  if (/\.\./.test(username)) {
    return "Username cannot contain consecutive dots";
  }
  return null;
};

export const validatePasswordMatch = (p1: string, p2: string): boolean => {
  return p1 === p2;
};

/**
 * Validates a name (First or Last)
 * Rules:
 * - 1-50 characters
 * - Letters, Spaces, Apostrophes, Hyphens
 * - Must start and end with a letter
 * - No consecutive special characters
 */
export const validateName = (
  name: string,
  fieldLabel: string,
): string | null => {
  if (!name || name.trim().length === 0) {
    return `${fieldLabel} is required`;
  }
  if (name.length > 50) {
    return `${fieldLabel} cannot exceed 50 characters`;
  }

  // Check allowed characters (including international letters)
  // \p{L} matches any kind of letter from any language
  const allowedCharsRegex = /^[\p{L}\s'-]+$/u;
  if (!allowedCharsRegex.test(name)) {
    return `${fieldLabel} can only contain letters, spaces, apostrophes, or hyphens`;
  }

  // Must start and end with a letter
  if (!/^\p{L}/u.test(name)) {
    return `${fieldLabel} must start with a letter`;
  }
  if (!/\p{L}$/u.test(name)) {
    return `${fieldLabel} must end with a letter`;
  }

  // No consecutive special characters
  if (/[\s'-]{2,}/.test(name)) {
    return `${fieldLabel} cannot contain consecutive special characters`;
  }

  return null;
};

/**
 * Validates a birthday string in YYYY-MM-DD format
 */
export const validateBirthday = (birthday: string): string | null => {
  if (!birthday) return "Birthday is required";

  // Basic format check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return "Format must be YYYY-MM-DD";
  }

  const parsedDate = parse(birthday, "yyyy-MM-dd", new Date());

  if (!isValid(parsedDate)) {
    return "Must be a real calendar date";
  }

  if (isFuture(parsedDate)) {
    return "Birthday cannot be in the future";
  }

  // Minimum age check (e.g., 13+)
  const age = differenceInYears(new Date(), parsedDate);
  if (age < 13) {
    return "Must be at least 13 years old";
  }

  return null;
};
