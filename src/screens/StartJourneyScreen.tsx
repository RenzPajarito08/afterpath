import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Bike, Footprints, Mountain } from "lucide-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/types";

type StartJourneyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StartJourney"
>;

interface Props {
  navigation: StartJourneyScreenNavigationProp;
}

const ACTIVITIES = [
  { id: "walking", label: "Walking", icon: Footprints },
  { id: "running", label: "Running", icon: Footprints },
  { id: "cycling", label: "Cycling", icon: Bike },
  { id: "hiking", label: "Hiking", icon: Mountain },
];

export default function StartJourneyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedActivity, setSelectedActivity] = useState("walking");
  const [title, setTitle] = useState("");
  const [hasAttemptedStart, setHasAttemptedStart] = useState(false);

  const handleStart = () => {
    setHasAttemptedStart(true);
    if (!title.trim()) {
      return;
    }
    navigation.navigate("Tracking", {
      activityType: selectedActivity,
      title: title.trim(),
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/landscape.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
          <TextInput
            style={styles.input}
            placeholder="Name your chronicle*"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="rgba(247, 247, 242, 0.6)"
          />
          <View
            style={[
              styles.inputUnderline,
              hasAttemptedStart &&
                !title.trim() && {
                  backgroundColor: "#B55D5D",
                  height: 2,
                },
            ]}
          />
          {hasAttemptedStart && !title.trim() && (
            <Text style={styles.validationText}>
              A chronicle requires a name
            </Text>
          )}
        </View>

        <Text style={styles.label}>Choose your path</Text>
        <View style={styles.activityGrid}>
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            const isSelected = selectedActivity === activity.id;
            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCardContainer}
                onPress={() => setSelectedActivity(activity.id)}
              >
                <ImageBackground
                  source={require("../../assets/parchment_texture.png")}
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
                    {activity.label}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[styles.footer, { marginBottom: Math.max(insets.bottom, 20) }]}
        >
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Begin Journey</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
  },
  header: {
    marginBottom: 40,
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
    flex: 1,
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
