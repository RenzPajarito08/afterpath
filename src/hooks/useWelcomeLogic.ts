import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

export const useWelcomeLogic = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const signIn = useCallback(async () => {
    const trimmedInput = emailOrUsername.trim();
    if (!trimmedInput || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    let loginEmail = trimmedInput;

    // Resolve username to email if it doesn't look like an email
    if (!trimmedInput.includes("@")) {
      try {
        const { data, error: rpcError } = await supabase.rpc(
          "get_email_by_username",
          {
            lookup_username: trimmedInput,
          },
        );

        if (rpcError) throw rpcError;
        if (!data) {
          Alert.alert("Error", "Username not found");
          setLoading(false);
          return;
        }
        loginEmail = data;
      } catch (err: any) {
        Alert.alert("Error", "Failed to resolve username");
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: password,
    });

    if (error) Alert.alert("Login Failed", error.message);
    setLoading(false);
  }, [emailOrUsername, password]);

  const signUp = useCallback(async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = emailOrUsername.trim();

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (trimmedUsername.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    // Check if username is already taken
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", trimmedUsername)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        Alert.alert(
          "Error",
          "This username is already claimed by another seeker.",
        );
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Username check failed", err);
      // We continue anyway, but the pre-check is better UX
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: password,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    });

    if (error) {
      Alert.alert("Signup Failed", error.message);
      setLoading(false);
      return;
    }

    if (session?.user) {
      Alert.alert(
        "Success",
        "Welcome to the fellowship! Please verify your email.",
      );
    } else {
      Alert.alert("Success", "Please check your inbox for email verification!");
    }

    setLoading(false);
  }, [username, emailOrUsername, password, confirmPassword]);

  return {
    emailOrUsername,
    setEmailOrUsername,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    isLogin,
    setIsLogin,
    signIn,
    signUp,
  };
};
