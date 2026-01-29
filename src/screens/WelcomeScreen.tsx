import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Lock, LogIn, Mail, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { RootStackParamList } from "../navigation/types";

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    if (session?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, username: email });

      if (profileError) {
        console.error("Profile creation failed", profileError);
      } else {
        Alert.alert(
          "Success",
          "Please check your inbox for email verification!",
        );
      }
    } else {
      Alert.alert("Please check your inbox for email verification!");
    }

    setLoading(false);
  }

  return (
    <ImageBackground
      source={require("../assets/frieren_landscape.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.overlay,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Afterpath</Text>
            <Text style={styles.subtitle}>Beyond the Journey</Text>
            <View style={styles.divider} />
            <Text style={styles.quote}>
              "The journey is the reward for those who seek memories."
            </Text>
          </View>

          <ImageBackground
            source={require("../assets/parchment_texture.png")}
            style={styles.parchmentContainer}
            imageStyle={styles.parchmentImage}
          >
            <View style={styles.inputSection}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Sanctuary Email"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#718096" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Secret Phrase"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={isLogin ? signInWithEmail : signUpWithEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#F7F7F2" />
                ) : (
                  <>
                    {isLogin ? (
                      <LogIn size={20} color="#F7F7F2" />
                    ) : (
                      <UserPlus size={20} color="#F7F7F2" />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? "Begin Journey" : "Join Fellowship"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Seek a new fate? Sign Up"
                : "Retrace your steps? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(247, 247, 242, 0.4)", // Very subtle tint
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 48,
    fontWeight: "300",
    color: "#2D3748",
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  subtitle: {
    fontSize: 14,
    color: "#4A5568",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: -8,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  divider: {
    height: 1,
    width: 60,
    backgroundColor: "#A0AEC0",
    marginVertical: 20,
  },
  quote: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  parchmentContainer: {
    width: "100%",
    padding: 2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  parchmentImage: {
    borderRadius: 12,
    opacity: 0.95,
  },
  inputSection: {
    padding: 30,
    gap: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E0",
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  primaryButton: {
    backgroundColor: "#2F4F4F", // Deep Forest Green
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#2F4F4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryButtonText: {
    color: "#F7F7F2",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  switchButton: {
    padding: 10,
    marginBottom: 10,
  },
  switchText: {
    color: "#4A5568",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
});
