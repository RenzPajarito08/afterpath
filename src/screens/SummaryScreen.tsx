import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Save, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
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
        title: "Journey on " + new Date().toLocaleDateString(),
        mood_score: 5,
      });

      if (error) throw error;

      Alert.alert(
        "Memory Enscribed",
        "Your journey has been woven into time.",
        [
          {
            text: "Farewell",
            onPress: () =>
              navigation.navigate("MainTabs", { screen: "HomeTab" }),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert("Error saving memory", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/frieren_landscape.png")}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <ScrollView
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.contentContainer,
              {
                paddingTop: Math.max(insets.top, 24),
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <Text style={styles.headerTitle}>Journey Epilogue</Text>

            <View style={styles.mapCardContainer}>
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
                    strokeColor="#2F4F4F"
                    strokeWidth={4}
                  />
                </MapView>
                <View style={styles.overlayStats}>
                  <Text style={styles.overlayText}>
                    {(distance / 1000).toFixed(2)} km traversed
                  </Text>
                </View>
              </View>
            </View>

            <ImageBackground
              source={require("../assets/parchment_texture.png")}
              style={styles.summaryCard}
              imageStyle={styles.parchmentImage}
            >
              <Text style={styles.prompt}>
                "What stayed with you from this path?"
              </Text>

              <TextInput
                style={styles.input}
                multiline
                placeholder="Enscribe your reflection here..."
                value={memory}
                onChangeText={setMemory}
                textAlignVertical="top"
                placeholderTextColor="#A0AEC0"
              />

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#F7F7F2" />
                ) : (
                  <>
                    <Save
                      size={20}
                      color="#F7F7F2"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.saveButtonText}>Enscribe Memory</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.discardButton}
                onPress={() =>
                  navigation.navigate("MainTabs", { screen: "HomeTab" })
                }
              >
                <Trash2 size={16} color="#B55D5D" style={{ marginRight: 8 }} />
                <Text style={styles.discardButtonText}>Discard Journey</Text>
              </TouchableOpacity>
            </ImageBackground>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#F7F7F2",
    marginBottom: 32,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    letterSpacing: 1,
  },
  mapCardContainer: {
    borderRadius: 24,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 24,
  },
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  map: {
    flex: 1,
  },
  overlayStats: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(47, 79, 79, 0.8)",
    paddingVertical: 10,
    alignItems: "center",
  },
  overlayText: {
    color: "#F7F7F2",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
    letterSpacing: 1,
  },
  parchmentImage: {
    borderRadius: 24,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  prompt: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#2D3748",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
    lineHeight: 28,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    padding: 20,
    height: 180,
    fontSize: 18,
    borderColor: "rgba(0,0,0,0.1)",
    borderWidth: 1,
    marginBottom: 24,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  saveButton: {
    backgroundColor: "#2F4F4F",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: "#F7F7F2",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  disabledButton: {
    opacity: 0.7,
  },
  discardButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginTop: 8,
  },
  discardButtonText: {
    color: "#B55D5D",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
});
