import { LucideIcon } from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface StatRowProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

export const StatRow: React.FC<StatRowProps> = ({
  icon: Icon,
  label,
  value,
  subtext,
}) => (
  <View style={styles.statContainer}>
    <ImageBackground
      source={require("../../../../assets/parchment_texture.png")}
      style={styles.statParchment}
      imageStyle={styles.parchmentImage}
    >
      <View style={styles.statContent}>
        <View style={styles.statIconContainer}>
          <Icon size={20} color="#2F4F4F" />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statLabel}>{label}</Text>
          {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </ImageBackground>
  </View>
);

const styles = StyleSheet.create({
  statContainer: {
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statParchment: {
    borderRadius: 24,
  },
  parchmentImage: {
    borderRadius: 24,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(47, 79, 79, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statSubtext: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F4F4F",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
});
