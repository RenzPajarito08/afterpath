import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      // Create profile to satisfy foreign key constraint
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, username: email });

      if (profileError) {
        console.error("Profile creation failed", profileError);
        // Optional: Alert user or handle gracefully
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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.quote}>"Every journey leaves a memory."</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={isLogin ? signInWithEmail : signUpWithEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isLogin ? "Sign In" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin ? "No account? Sign Up" : "Have an account? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  quote: {
    fontSize: 24,
    fontStyle: "italic",
    color: "#4A5568",
    marginBottom: 48,
    textAlign: "center",
    fontFamily: "System",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
    gap: 16,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#2D3748",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    marginTop: 8,
  },
  switchText: {
    color: "#4A5568",
    textDecorationLine: "underline",
  },
});
