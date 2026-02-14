import React, { createContext, ReactNode, useContext, useState } from "react";

type AlertType = "success" | "error" | "info";

interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  cancelText?: string;
}

interface AlertContextData {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextData | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = (newOptions: AlertOptions) => {
    setOptions(newOptions);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  // Register instance for utility helper compatibility
  React.useEffect(() => {
    const { setAlertInstance } = require("../utils/alertHelper");
    setAlertInstance({ showAlert });
    return () => setAlertInstance(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {/* CustomAlertModal will be injected here in a real implementation or imported */}
      {options && (
        <CustomAlertModal
          visible={visible}
          options={options}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Internal Import for the modal to avoid circular dependency if possible
import { CustomAlertModal } from "../components/CustomAlertModal";
