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
import React, { useCallback } from "react";
import {
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Settings">;

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  value?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon: Icon,
  label,
  value,
  onPress,
  isDestructive,
}) => (
  <View style={styles.rowContainer}>
    <ImageBackground
      source={require("../../../../assets/parchment_texture.png")}
      style={styles.rowParchment}
      imageStyle={styles.parchmentImage}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityLabel={label}
        accessibilityRole="button"
      >
        <View style={styles.iconCircle}>
          <Icon size={20} color={isDestructive ? "#B55D5D" : "#2F4F4F"} />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.label, isDestructive && styles.destructiveText]}>
            {label}
          </Text>
          {value && <Text style={styles.value}>{value}</Text>}
        </View>
        {!isDestructive && <ChevronRight size={20} color="#718096" />}
      </TouchableOpacity>
    </ImageBackground>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth();
  const { showAlert } = useAlert();

  const handleLogout = useCallback(() => {
    showAlert({
      title: "End Journey",
      message: "Are you sure you want to rest for now?",
      showCancel: true,
      confirmText: "Sign Out",
      cancelText: "Continue",
      onConfirm: () => signOut(),
    });
  }, [showAlert, signOut]);

  const showUnderDevelopment = useCallback(() => {
    showAlert({
      title: "Coming Soon",
      message: "This feature is still under development.",
    });
  }, [showAlert]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={28} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.title}>Chronicle Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionHeader title="Adventurer Identity" />
        <SettingRow
          icon={User}
          label="Refine Identity"
          onPress={() => navigation.navigate("EditProfile")}
        />
        <SettingRow
          icon={Mail}
          label="Secret Passcodes"
          onPress={showUnderDevelopment}
        />
        <SettingRow
          icon={Shield}
          label="Privacy & Wards"
          onPress={showUnderDevelopment}
        />

        <View style={styles.spacer} />

        <SectionHeader title="Chronicle Preferences" />
        <SettingRow
          icon={Ruler}
          label="Scales"
          value="(km)"
          onPress={() => {}}
        />
        <SettingRow icon={Bell} label="Winds of News" onPress={() => {}} />
        <SettingRow
          icon={Moon}
          label="Atmosphere"
          value="(Light)"
          onPress={() => {}}
        />
        <SettingRow
          icon={Volume2}
          label="Silence"
          value="(On)"
          onPress={() => {}}
        />

        <View style={styles.spacer} />

        <SectionHeader title="Library Support" />
        <SettingRow
          icon={HelpCircle}
          label="Wisdom Center"
          onPress={() => {}}
        />
        <SettingRow
          icon={MessageSquare}
          label="Send Messenger"
          onPress={() => {}}
        />
        <SettingRow
          icon={Info}
          label="About the Chronicle"
          onPress={() => {}}
        />

        <View style={styles.spacer} />

        <SettingRow
          icon={LogOut}
          label="Depart Journey"
          onPress={handleLogout}
          isDestructive
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  header: {
    paddingHorizontal: 24,
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
    fontSize: 24,
    fontWeight: "300",
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 16,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  rowContainer: {
    marginBottom: 12,
    borderRadius: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  rowParchment: {
    borderRadius: 24,
  },
  parchmentImage: {
    borderRadius: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(47, 79, 79, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
  },
  label: {
    fontSize: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  destructiveText: {
    color: "#B55D5D",
    fontWeight: "700",
  },
  spacer: {
    height: 16,
  },
});

export default SettingsScreen;
