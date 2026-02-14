import { HelpCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue?: string;
}

export const CustomInputModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  initialValue = "",
}) => {
  const [value, setValue] = useState(initialValue);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handleConfirm = () => {
    setHasAttemptedSubmit(true);
    if (!value.trim()) {
      return;
    }
    onConfirm(value.trim());
    setValue("");
    setHasAttemptedSubmit(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setHasAttemptedSubmit(false);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ImageBackground
            source={require("../../assets/parchment_texture.png")}
            style={styles.parchment}
            imageStyle={styles.parchmentImage}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <HelpCircle size={32} color="#2F4F4F" />
              </View>

              <Text style={styles.title}>Define Your Path</Text>
              <Text style={styles.message}>
                What type of activity are you undertaking?
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Sailing, Strolling..."
                  value={value}
                  onChangeText={setValue}
                  placeholderTextColor="rgba(45, 55, 72, 0.4)"
                  autoFocus
                />
                <View
                  style={[
                    styles.inputUnderline,
                    hasAttemptedSubmit &&
                      !value.trim() && {
                        backgroundColor: "#B55D5D",
                        height: 2,
                      },
                  ]}
                />
                {hasAttemptedSubmit && !value.trim() && (
                  <Text style={styles.validationText}>
                    A path must be named
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Set Activity</Text>
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
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
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
  inputWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  input: {
    fontSize: 18,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    paddingVertical: 12,
    textAlign: "center",
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(45, 55, 72, 0.2)",
    marginTop: 4,
  },
  validationText: {
    fontSize: 11,
    color: "#B55D5D",
    marginTop: 6,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
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
