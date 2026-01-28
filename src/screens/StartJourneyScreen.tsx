import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Bike, Footprints, Mountain } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  { id: "running", label: "Running", icon: Footprints }, // Reuse footprints or find a runner icon if available
  { id: "cycling", label: "Cycling", icon: Bike },
  { id: "hiking", label: "Hiking", icon: Mountain },
];

export default function StartJourneyScreen({ navigation }: Props) {
  const [selectedActivity, setSelectedActivity] = useState("walking");
  const [title, setTitle] = useState("");

  const handleStart = () => {
    navigation.navigate("Tracking", { activityType: selectedActivity });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Begin a new journey</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giving it a name? (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning Walk to Clear My Head"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#A0AEC0"
        />
      </View>

      <Text style={styles.label}>Select Activity</Text>
      <View style={styles.activityGrid}>
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selectedActivity === activity.id;
          return (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityCard,
                isSelected && styles.activityCardSelected,
              ]}
              onPress={() => setSelectedActivity(activity.id)}
            >
              <Icon size={24} color={isSelected ? "#FFF" : "#4A5568"} />
              <Text
                style={[
                  styles.activityLabel,
                  isSelected && styles.activityLabelSelected,
                ]}
              >
                {activity.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "300",
    color: "#2D3748",
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityCard: {
    width: "48%", // Approx 2 columns
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activityCardSelected: {
    backgroundColor: "#48BB78",
    borderColor: "#48BB78",
  },
  activityLabel: {
    marginTop: 8,
    color: "#4A5568",
    fontWeight: "500",
  },
  activityLabelSelected: {
    color: "#FFF",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#2D3748",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
