import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editBirthday, setEditBirthday] = useState("");

  const handleBirthdayChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    let formatted = "";
    if (numeric.length > 0) {
      formatted = numeric.substring(0, 4);
      if (numeric.length > 4) {
        formatted += "-" + numeric.substring(4, 6);
        if (numeric.length > 6) {
          formatted += "-" + numeric.substring(6, 8);
        }
      }
    }
    setEditBirthday(formatted);
  };

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, first_name, last_name, birthday`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        const fn = data.first_name || "";
        const ln = data.last_name || "";
        const b = data.birthday || "";

        setUsername(data.username || "");
        setFirstName(fn);
        setLastName(ln);
        setBirthday(b);

        setEditFirstName(fn);
        setEditLastName(ln);
        setEditBirthday(b);
      }
    } catch (error: any) {
      console.log("Error loading profile", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      if (!user) throw new Error("No user on the session!");

      const updates = {
        id: user.id,
        first_name: editFirstName,
        last_name: editLastName,
        birthday: editBirthday || null,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Chronicle details updated.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/parchment_texture.png")}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#2F4F4F" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/parchment_texture.png")}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Refine Identity</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.editForm}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>True Name</Text>
              <TextInput
                style={styles.input}
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="Enscribed at birth"
                maxLength={25}
                placeholderTextColor="#A0AEC0"
              />
              <View style={styles.inputUnderline} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Lineage</Text>
              <TextInput
                style={styles.input}
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="Family descent"
                maxLength={25}
                placeholderTextColor="#A0AEC0"
              />
              <View style={styles.inputUnderline} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Day of Dawning (Birthday)</Text>
              <TextInput
                style={styles.input}
                value={editBirthday}
                onChangeText={handleBirthdayChange}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#A0AEC0"
              />
              <View style={styles.inputUnderline} />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={updateProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#F7F7F2" />
              ) : (
                <>
                  <Save size={20} color="#F7F7F2" />
                  <Text style={styles.saveButtonText}>Confirm details</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingBottom: 40,
  },
  editForm: {
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  fieldGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  input: {
    fontSize: 18,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
    paddingVertical: 12,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: "rgba(47, 79, 79, 0.2)",
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2F4F4F",
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: "#F7F7F2",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Bold" : "serif",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
