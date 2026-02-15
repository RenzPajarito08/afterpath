import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { ArrowLeft, Clock, MapPin, Watch, X, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAlert } from "@/context/AlertContext";
import { useJourneyDetail } from "@/features/journey/hooks/useJourneyDetail";
import { retroMapStyle } from "@/lib/mapStyles";
import { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "JourneyDetail">;

const JourneyDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { journeyId } = route.params;
  const { journey, loading } = useJourneyDetail(journeyId);
  const { showAlert } = useAlert();
  const [init, setInit] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!loading && journey?.coordinates && journey.coordinates.length > 0) {
      const timer = setTimeout(() => {
        mapRef.current?.fitToCoordinates(journey.coordinates!, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, journey]);

  useEffect(() => {
    if (!loading) {
      if (journey) {
        setInit(true);
      } else {
        showAlert({
          title: "Error",
          message: "Could not load chronicle.",
          onConfirm: () => navigation.goBack(),
        });
      }
    }
  }, [loading, journey, navigation, showAlert]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + "h " : ""}${m}m`;
  };

  const backButtonStyle = useMemo(
    () => [styles.backButton, { top: Math.max(insets.top, 10) }],
    [insets.top],
  );

  const reflectionPromptStyle = useMemo(
    () => [
      styles.reflectionPrompt,
      { marginBottom: Math.max(insets.bottom, 40) },
    ],
    [insets.bottom],
  );

  const closeModalStyle = useMemo(
    () => [styles.closeModal, { top: Math.max(insets.top, 20) }],
    [insets.top],
  );

  if (loading || !journey) {
    return (
      <ImageBackground
        source={require("../../../../assets/parchment_texture.png")}
        style={styles.loadingContainer}
      >
        <ActivityIndicator color="#2F4F4F" size="large" />
        <Text style={styles.loadingText}>Recalling chronicle...</Text>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            customMapStyle={retroMapStyle}
            scrollEnabled={false}
            zoomEnabled={false}
            initialRegion={
              journey.coordinates && journey.coordinates.length > 0
                ? {
                    latitude: journey.coordinates[0].latitude,
                    longitude: journey.coordinates[0].longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : undefined
            }
          >
            {journey.coordinates && (
              <Polyline
                coordinates={journey.coordinates}
                strokeColor="#48BB78"
                strokeWidth={4}
              />
            )}
          </MapView>

          <TouchableOpacity
            style={backButtonStyle}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft color="#2D3748" size={24} />
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={require("../../../../assets/parchment_texture.png")}
          style={styles.contentParchment}
          imageStyle={styles.parchmentImage}
        >
          <View style={styles.content}>
            <Text style={styles.activityType}>
              {journey.activity_type || "Journey"}
            </Text>
            <Text style={styles.title}>
              {journey.title || "Untold Fragment"}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statContainer}>
                <View style={styles.statItem}>
                  <MapPin size={18} color="#718096" />
                  <View>
                    <Text style={styles.statValue}>
                      {(journey.distance_meters / 1000).toFixed(2)} km
                    </Text>
                    <Text style={styles.statLabel}>Traversed</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Clock size={18} color="#718096" />
                  <View>
                    <Text style={styles.statValue}>
                      {formatDuration(journey.duration_seconds)}
                    </Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.statContainer, { marginTop: 12 }]}>
                <View style={styles.statItem}>
                  <Zap size={18} color="#718096" />
                  <View>
                    <Text style={styles.statValue}>
                      {(journey.average_speed || 0).toFixed(1)} km/h
                    </Text>
                    <Text style={styles.statLabel}>Avg Speed</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Watch size={18} color="#718096" />
                  <View>
                    <Text style={styles.statValue}>
                      {((journey.max_speed || 0) * 3.6).toFixed(1)} km/h
                    </Text>
                    <Text style={styles.statLabel}>Max Speed</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Enscribed Memory</Text>
            <View style={styles.memoryContainer}>
              <Text style={styles.memoryText}>
                "{journey.memory_text || "No words were written for this day."}"
              </Text>
            </View>

            {journey.journey_images && journey.journey_images.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Captured Moments</Text>
                <View style={styles.scatterContainer}>
                  {journey.journey_images.map((img, index) => {
                    const rotation = ((index * 13) % 10) - 5;
                    const offsetX = ((index * 7) % 20) - 10;

                    return (
                      <TouchableOpacity
                        key={img.id}
                        onPress={() => setSelectedImage(img.image_url)}
                        style={[
                          styles.polaroidWrapper,
                          {
                            transform: [
                              { rotate: `${rotation}deg` },
                              { translateX: offsetX },
                            ],
                            zIndex: index,
                            marginTop: index === 0 ? 0 : -40,
                          },
                        ]}
                        accessibilityLabel={`Captured moment ${index + 1}`}
                        accessibilityRole="image"
                      >
                        <ImageBackground
                          source={require("../../../../assets/parchment_texture.png")}
                          style={styles.polaroidParchment}
                          imageStyle={styles.polaroidParchmentImage}
                        >
                          <View style={styles.polaroidFrame}>
                            <Image
                              source={{ uri: img.image_url }}
                              style={styles.polaroidImage}
                            />
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={reflectionPromptStyle}>
              <Text style={styles.promptText}>
                A fragment of time from{" "}
                {format(new Date(journey.start_time), "PP")}.
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
          accessibilityLabel="Close image viewer"
        >
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={closeModalStyle}
              onPress={() => setSelectedImage(null)}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X color="#F7F7F2" size={30} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F2",
  },
  loadingText: {
    marginTop: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
    fontSize: 16,
  },
  mapContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    left: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentParchment: {
    marginTop: -30,
    minHeight: 500,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  parchmentImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  content: {
    padding: 32,
  },
  activityType: {
    fontSize: 14,
    color: "#48BB78",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#2D3748",
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    lineHeight: 40,
  },
  statsRow: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(226, 232, 240, 0.8)",
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  memoryContainer: {
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: "#2F4F4F",
  },
  memoryText: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#2D3748",
    lineHeight: 32,
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  reflectionPrompt: {
    alignItems: "center",
    marginTop: 20,
  },
  promptText: {
    color: "#A0AEC0",
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  scatterContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  polaroidWrapper: {
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  polaroidParchment: {
    padding: 12,
    paddingBottom: 40,
  },
  polaroidParchmentImage: {
    borderRadius: 2,
  },
  polaroidFrame: {
    backgroundColor: "#F7F7F2",
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  polaroidImage: {
    width: "100%",
    aspectRatio: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeModal: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 25,
  },
});

export default JourneyDetailScreen;
