import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Save } from "lucide-react-native";
import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEditProfileLogic } from "@/features/profile/hooks/useEditProfileLogic";

const EditProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    loading,
    saving,
    control,
    errors,
    onSubmit,
    handleBirthdayChange,
    isValid,
    isDirty,
  } = useEditProfileLogic();

  const containerStyle = useMemo(
    () => [styles.header, { paddingTop: insets.top + 10 }],
    [insets.top],
  );

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../../assets/parchment_texture.png")}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#2F4F4F" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/parchment_texture.png")}
      style={styles.container}
    >
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View style={containerStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ChevronLeft size={28} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Refine Identity</Text>
        </View>

        <View style={styles.editForm}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>True Name</Text>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enscribed at birth"
                  maxLength={50}
                  placeholderTextColor="#A0AEC0"
                  accessibilityLabel="True Name"
                />
              )}
            />
            <View
              style={[
                styles.inputUnderline,
                errors.firstName && styles.underlineError,
              ]}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Lineage</Text>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Family descent"
                  maxLength={50}
                  placeholderTextColor="#A0AEC0"
                  accessibilityLabel="Lineage"
                />
              )}
            />
            <View
              style={[
                styles.inputUnderline,
                errors.lastName && styles.underlineError,
              ]}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Day of Dawning (Birthday)</Text>
            <Controller
              control={control}
              name="birthday"
              render={({ field: { onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.birthday && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={handleBirthdayChange}
                  value={value || ""}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#A0AEC0"
                  accessibilityLabel="Birthday"
                />
              )}
            />
            <View
              style={[
                styles.inputUnderline,
                errors.birthday && styles.underlineError,
              ]}
            />
            {errors.birthday && (
              <Text style={styles.errorText}>{errors.birthday.message}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (saving || !isValid || !isDirty) && styles.disabledButton,
            ]}
            onPress={onSubmit}
            disabled={saving || !isValid || !isDirty}
            accessibilityLabel="Confirm details"
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color="#F7F7F2" />
            ) : (
              <>
                <Save size={20} color="#F7F7F2" />
                <Text style={styles.saveButtonText}>Confirm details</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
    marginLeft: -10,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  editForm: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  fieldGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  input: {
    fontSize: 18,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    paddingVertical: 12,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(47, 79, 79, 0.2)",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2F4F4F",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: "#F7F7F2",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  inputError: {
    color: "#E53E3E",
  },
  underlineError: {
    backgroundColor: "#E53E3E",
    opacity: 0.5,
  },
});

export default EditProfileScreen;
