import { AlertCircle, CheckCircle2, Info } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface AlertOptions {
  title?: string;
  message: string;
  type?: "success" | "error" | "info";
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  cancelText?: string;
}

interface Props {
  visible: boolean;
  options: AlertOptions;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<Props> = ({
  visible,
  options,
  onClose,
}) => {
  const {
    title,
    message,
    type = "info",
    onConfirm,
    confirmText = "OK",
    showCancel = false,
    onCancel,
    cancelText = "Cancel",
  } = options;

  const handleConfirm = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onClose();
    if (onCancel) {
      onCancel();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={32} color="#2F4F4F" />;
      case "error":
        return <AlertCircle size={32} color="#E53E3E" />;
      default:
        return <Info size={32} color="#4A5568" />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ImageBackground
            source={require("../../assets/parchment_texture.png")}
            style={styles.parchment}
            imageStyle={styles.parchmentImage}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>{getIcon()}</View>

              {title && <Text style={styles.title}>{title}</Text>}
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonContainer}>
                {showCancel && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  parchment: {
    width: "100%",
  },
  parchmentImage: {
    borderRadius: 16,
    opacity: 0.98,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  message: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    backgroundColor: "#2F4F4F",
  },
  confirmButtonText: {
    color: "#F7F7F2",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#CBD5E0",
  },
  cancelButtonText: {
    color: "#718096",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
});
