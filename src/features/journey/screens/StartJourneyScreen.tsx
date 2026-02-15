import {
  ArrowLeft,
  Bike,
  Footprints,
  HelpCircle,
  Map as MapIcon,
  Mountain,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import {
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

import { CustomInputModal } from "@/components/CustomInputModal";
import { useStartJourneyLogic } from "@/features/journey/hooks/useStartJourneyLogic";

const ACTIVITIES = [
  { id: "walking", label: "Walking", icon: Footprints },
  { id: "running", label: "Running", icon: Footprints },
  { id: "cycling", label: "Cycling", icon: Bike },
  { id: "hiking", label: "Hiking", icon: Mountain },
  { id: "traveling", label: "Traveling", icon: MapIcon },
  { id: "others", label: "Others", icon: HelpCircle },
];

const StartJourneyScreen: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    control,
    onSubmit,
    errors,
    isSubmitted,
    selectedActivity,
    handleActivitySelect,
    showOtherModal,
    setShowOtherModal,
    customActivity,
    onConfirmCustomActivity,
  } = useStartJourneyLogic();

  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingTop: Math.max(insets.top, 20) }],
    [insets.top],
  );

  const footerStyle = useMemo(
    () => [styles.footer, { marginBottom: Math.max(insets.bottom, 20) }],
    [insets.bottom],
  );

  return (
    <ImageBackground
      source={require("../../../../assets/landscape.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        style={styles.keyboardView}
        contentContainerStyle={scrollContentStyle}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft color="#F7F7F2" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prepare for a Quest</Text>
          <Text style={styles.headerSubtitle}>
            Every journey begins with a name
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Name your chronicle*"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholderTextColor="rgba(247, 247, 242, 0.6)"
                accessibilityLabel="Chronicle Name"
              />
            )}
          />
          <View
            style={[
              styles.inputUnderline,
              errors.title && {
                backgroundColor: "#B55D5D",
                height: 2,
              },
            ]}
          />
          {errors.title && (
            <Text style={styles.validationText}>{errors.title.message}</Text>
          )}
        </View>

        <Text style={styles.label}>Choose your path</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            // A bit tricky because selectedActivity might be the custom one.
            // If it's not one of the predefined IDs, then 'others' is visually selected.
            const isPredefined = ACTIVITIES.some(
              (a) => a.id === selectedActivity && a.id !== "others",
            );
            const isSelected =
              activity.id === "others"
                ? !isPredefined
                : selectedActivity === activity.id;

            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCardContainer}
                onPress={() => handleActivitySelect(activity.id)}
                accessibilityLabel={activity.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <ImageBackground
                  source={require("../../../../assets/parchment_texture.png")}
                  style={styles.activityCard}
                  imageStyle={[
                    styles.cardParchment,
                    isSelected && styles.cardParchmentSelected,
                  ]}
                >
                  <Icon size={28} color={isSelected ? "#2F4F4F" : "#718096"} />
                  <Text
                    style={[
                      styles.activityLabel,
                      isSelected && styles.activityLabelSelected,
                    ]}
                  >
                    {activity.id === "others" &&
                    !isPredefined &&
                    selectedActivity !== "others"
                      ? selectedActivity
                      : activity.label}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={footerStyle}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={onSubmit}
            accessibilityLabel="Begin Journey"
            accessibilityRole="button"
          >
            <Text style={styles.startButtonText}>Begin Journey</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <CustomInputModal
        visible={showOtherModal}
        onClose={() => setShowOtherModal(false)}
        onConfirm={onConfirmCustomActivity}
        initialValue={customActivity}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#F7F7F2",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E2E8F0",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  inputContainer: {
    marginBottom: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    fontSize: 16,
    color: "#F7F7F2",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    paddingVertical: 12,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(247, 247, 242, 0.5)",
    marginTop: 4,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityCardContainer: {
    width: "48%",
    aspectRatio: 1.2,
  },
  activityCard: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  cardParchment: {
    borderRadius: 16,
    opacity: 0.7,
  },
  cardParchmentSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: "#F7F7F2",
  },
  activityLabel: {
    marginTop: 12,
    color: "#718096",
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Optima-Medium" : "serif",
  },
  activityLabelSelected: {
    color: "#2D3748",
    fontWeight: "700",
  },
  footer: {
    marginTop: 32,
    justifyContent: "flex-end",
  },
  startButton: {
    backgroundColor: "#F7F7F2",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  startButtonText: {
    color: "#2D3748",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  validationText: {
    fontSize: 12,
    color: "#B55D5D",
    marginTop: 6,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
});

export default StartJourneyScreen;
