// This is a singleton-like helper to allow non-hook usage if absolutely necessary,
// but it's better to use the useAlert hook in components.
// For backwards compatibility with existing utility calls, we'll need a way
// to trigger the alert from outside the React tree or refactor callers.

let alertInstance: { showAlert: (options: any) => void } | null = null;

export const setAlertInstance = (instance: any) => {
  alertInstance = instance;
};

export const showErrorAlert = (
  message: string,
  title: string = "Error",
): void => {
  if (alertInstance) {
    alertInstance.showAlert({
      title,
      message,
      type: "error",
      confirmText: "Dismiss",
    });
  } else {
    // Fallback if provider isn't ready
    console.warn("AlertProvider not initialized. Message:", message);
  }
};

export const showSuccessAlert = (
  message: string,
  title: string = "Success",
): void => {
  if (alertInstance) {
    alertInstance.showAlert({
      title,
      message,
      type: "success",
      confirmText: "Excellent",
    });
  } else {
    // Fallback if provider isn't ready
    console.warn("AlertProvider not initialized. Message:", message);
  }
};
