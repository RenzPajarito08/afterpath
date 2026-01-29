import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Save, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Summary">;

export default function SummaryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { distance, duration, coordinates, activityType } = route.params;
  const { user } = useAuth();

  const [memory, setMemory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Simple encoding: JSON stringify for now.
      // For production, Google Polyline Algorithm is better for space.
      const polylineString = JSON.stringify(coordinates);

      const { error } = await supabase.from("journeys").insert({
        user_id: user.id,
        distance_meters: distance,
        duration_seconds: duration,
        polyline: polylineString,
        memory_text: memory,
        activity_type: activityType,
        start_time: new Date(
          coordinates[0]?.timestamp || Date.now(),
        ).toISOString(),
        end_time: new Date().toISOString(),
        title: "Journey on " + new Date().toLocaleDateString(), // Default title
        mood_score: 5, // Default neutral
      });

      if (error) throw error;

      Alert.alert("Memory Saved", "Your journey has been recorded in time.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("MainTabs", { screen: "HomeTab" }),
        },
      ]);
    } catch (e: any) {
      Alert.alert("Error saving journey", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: Math.max(insets.top, 24),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <Text style={styles.headerTitle}>Journey Complete</Text>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: coordinates[0]?.latitude || 0,
              longitude: coordinates[0]?.longitude || 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Polyline
              coordinates={coordinates}
              strokeColor="#48BB78"
              strokeWidth={4}
            />
          </MapView>
          <View style={styles.overlayStats}>
            <Text style={styles.overlayText}>
              {(distance / 1000).toFixed(2)} km • {Math.floor(duration / 60)}m
            </Text>
          </View>
        </View>

        <Text style={styles.prompt}>
          "What stayed with you from this journey?"
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your reflection here..."
          value={memory}
          onChangeText={setMemory}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Memory</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.discardButton}
          onPress={() => navigation.navigate("MainTabs", { screen: "HomeTab" })}
        >
          <Trash2 size={20} color="#E53E3E" style={{ marginRight: 8 }} />
          <Text style={styles.discardButtonText}>Discard Journey</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "300",
    color: "#2D3748",
    marginBottom: 24,
    textAlign: "center",
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
    backgroundColor: "#E2E8F0",
  },
  map: {
    flex: 1,
  },
  overlayStats: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overlayText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  prompt: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#4A5568",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 16,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    marginBottom: 16,
    color: "#2D3748",
  },
  saveButton: {
    backgroundColor: "#2D3748",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  discardButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginTop: 16,
  },
  discardButtonText: {
    color: "#E53E3E",
    fontSize: 16,
    fontWeight: "600",
  },
});
