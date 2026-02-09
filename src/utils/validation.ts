export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): string | null => {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  return null;
};

export const validatePasswordMatch = (p1: string, p2: string): boolean => {
  return p1 === p2;
};
