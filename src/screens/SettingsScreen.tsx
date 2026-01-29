import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Ruler,
  Shield,
  User,
  Volume2,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

const SettingRow = ({
  icon: Icon,
  label,
  value,
  onPress,
  isDestructive,
}: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.iconCircle}>
      <Icon size={20} color={isDestructive ? "#B55D5D" : "#4A5D4E"} />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.label, isDestructive && styles.destructiveText]}>
        {label}
      </Text>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
    {!isDestructive && <ChevronRight size={20} color="#718096" />}
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert("End Journey", "Are you sure you want to rest for now?", [
      { text: "Continue", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionHeader title="Account" />
        <SettingRow
          icon={User}
          label="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <SettingRow
          icon={Mail}
          label="Email & Password"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "This feature is still under development.",
            )
          }
        />
        <SettingRow
          icon={Shield}
          label="Privacy & Data"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "This feature is still under development.",
            )
          }
        />

        <View style={styles.spacer} />

        <SectionHeader title="Preferences" />
        <SettingRow
          icon={Ruler}
          label="Units"
          value="(km)"
          onPress={() => {}}
        />
        <SettingRow icon={Bell} label="Notifications" onPress={() => {}} />
        <SettingRow
          icon={Moon}
          label="Theme"
          value="(Light)"
          onPress={() => {}}
        />
        <SettingRow
          icon={Volume2}
          label="Quiet Mode"
          value="(On)"
          onPress={() => {}}
        />

        <View style={styles.spacer} />

        <SectionHeader title="Support" />
        <SettingRow icon={HelpCircle} label="Help Center" onPress={() => {}} />
        <SettingRow
          icon={MessageSquare}
          label="Send Feedback"
          onPress={() => {}}
        />
        <SettingRow icon={Info} label="About Afterpath" onPress={() => {}} />

        <View style={styles.spacer} />

        <SettingRow
          icon={LogOut}
          label="Log Out"
          onPress={handleLogout}
          isDestructive
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5EF", // Cream background
  },
  header: {
    paddingHorizontal: 20,
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
    fontSize: 40,
    fontWeight: "700",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EFEC", // Sage green light background
    borderRadius: 30,
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C5D0C6", // Darker sage for icon bg
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
  },
  label: {
    fontSize: 18,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  value: {
    fontSize: 18,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  destructiveText: {
    color: "#B55D5D",
    fontWeight: "600",
  },
  spacer: {
    height: 24,
  },
});
