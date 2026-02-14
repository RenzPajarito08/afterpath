import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, Save, Trash2, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSummaryLogic } from "../hooks/useSummaryLogic";
import { retroMapStyle } from "../lib/mapStyles";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Summary">;

export default function SummaryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { distance, duration, coordinates, activityType, maxSpeed } =
    route.params;
  const {
    memory,
    setMemory,
    saving,
    handleSave,
    selectedImages,
    pickImage,
    removeImage,
  } = useSummaryLogic(navigation);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        });
      }, 500);
    }
  }, [coordinates]);

  // Wrap handleSave to pass the correct data
  const onSave = () => {
    handleSave({
      distance,
      duration,
      coordinates,
      activityType,
      maxSpeed,
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/landscape.png")}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}
        >
          <Text style={styles.headerTitle}>Journey Epilogue</Text>

          <View style={styles.mapCardContainer}>
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                scrollEnabled={false}
                zoomEnabled={false}
                provider={PROVIDER_DEFAULT}
                customMapStyle={retroMapStyle}
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
            source={require("../../assets/parchment_texture.png")}
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

            <Text style={styles.imageSectionTitle}>Captured Moments</Text>
            <View style={styles.imageGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(uri)}
                  >
                    <X size={12} color="#F7F7F2" />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 6 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                >
                  <Camera size={24} color="#2F4F4F" />
                  <Text style={styles.addImageText}>
                    {selectedImages.length}/6
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#F7F7F2" />
              ) : (
                <>
                  <Save size={20} color="#F7F7F2" style={{ marginRight: 12 }} />
                  <Text style={styles.saveButtonText}>Enscribe Memory</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardButton}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs", params: { screen: "HomeTab" } }],
                })
              }
            >
              <Trash2 size={16} color="#B55D5D" style={{ marginRight: 8 }} />
              <Text style={styles.discardButtonText}>Discard Journey</Text>
            </TouchableOpacity>
          </ImageBackground>
        </KeyboardAwareScrollView>
      </View>
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
    height: 120, // Reduced height to fit images
    fontSize: 16,
    borderColor: "rgba(0,0,0,0.1)",
    borderWidth: 1,
    marginBottom: 20,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  imageSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    padding: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(47, 79, 79, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 10,
    color: "#2D3748",
    marginTop: 4,
    fontWeight: "600",
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
    fontSize: 16,
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
