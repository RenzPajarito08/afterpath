export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
