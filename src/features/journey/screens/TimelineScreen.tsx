import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTimelineLogic } from "@/features/journey/hooks/useTimelineLogic";
import { RootStackParamList } from "@/navigation/types";

type TimelineScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "TimelineTab"
>;

interface TimelineScreenProps {
  navigation: TimelineScreenNavigationProp;
}

const TimelineScreen: React.FC<TimelineScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { journeys, refreshing, loadingMore, onRefresh, loadMore } =
    useTimelineLogic();

  const renderTimelineItem = useCallback(
    ({ item: journey }: { item: any }) => (
      <View style={styles.timelineItem}>
        <View style={styles.nodeWrapper}>
          <View style={styles.timelineDot} />
          <View style={styles.dotInner} />
        </View>

        <TouchableOpacity
          style={styles.cardContainer}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("JourneyDetail", {
              journeyId: journey.id,
            })
          }
          accessibilityLabel={`Explore ${journey.title || "Untold Fragment"}`}
          accessibilityRole="button"
        >
          <ImageBackground
            source={require("../../../../assets/parchment_texture.png")}
            style={styles.card}
            imageStyle={styles.cardParchment}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.activityType}>
                {journey.activity_type || "Journey"}
              </Text>
            </View>
            <Text style={styles.title}>
              {journey.title || "Untold Fragment"}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.distance}>
                Traversed {(journey.distance_meters / 1000).toFixed(1)} km
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    ),
    [navigation],
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#48BB78" />
        <Text style={styles.loaderText}>Unveiling more chronicles...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No chronicles found. Your journey is yet to begin.
        </Text>
      </View>
    ),
    [],
  );

  const headerStyle = useMemo(
    () => [styles.header, { paddingTop: Math.max(insets.top, 16) }],
    [insets.top],
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      { paddingBottom: Math.max(insets.bottom, 40) },
    ],
    [insets.bottom],
  );

  return (
    <ImageBackground
      source={require("../../../../assets/parchment_texture.png")}
      style={styles.container}
      imageStyle={styles.bgParchment}
    >
      <View style={headerStyle}>
        <Text style={styles.headerTitle}>Journey Logbook</Text>
        <Text style={styles.headerSubtitle}>Chronicles of your path</Text>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.timelineLine} />
        <FlatList
          data={journeys}
          renderItem={renderTimelineItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={scrollContentStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={!refreshing ? renderEmpty : null}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  bgParchment: {
    opacity: 0.3,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "rgba(247, 247, 242, 0.8)",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    flexGrow: 1,
  },
  timelineLine: {
    position: "absolute",
    left: 31,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#CBD5E0",
    opacity: 0.5,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  nodeWrapper: {
    width: 16,
    height: 16,
    marginRight: 24,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F7F7F2",
    borderWidth: 2,
    borderColor: "#2F4F4F",
    zIndex: 2,
  },
  dotInner: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#48BB78",
    zIndex: 3,
  },
  cardContainer: {
    flex: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  cardParchment: {
    borderRadius: 16,
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  activityType: {
    fontSize: 10,
    color: "#48BB78",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  title: {
    fontSize: 20,
    color: "#2D3748",
    fontWeight: "500",
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(203, 213, 224, 0.3)",
    paddingTop: 8,
  },
  distance: {
    fontSize: 14,
    color: "#4A5568",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  emptyState: {
    marginLeft: 48,
    marginTop: 20,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyStateText: {
    color: "#A0AEC0",
    fontStyle: "italic",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    marginLeft: 40,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#718096",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
});

export default TimelineScreen;
