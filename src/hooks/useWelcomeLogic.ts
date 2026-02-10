import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import { showErrorAlert, showSuccessAlert } from "../utils/alertHelper";
import { validatePasswordMatch, validateUsername } from "../utils/validation";

export const useWelcomeLogic = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const signIn = useCallback(async () => {
    const { emailOrUsername, password } = formData;
    const trimmedInput = emailOrUsername.trim();

    if (!trimmedInput || !password) {
      showErrorAlert("Please fill in all fields");
      return;
    }

    setLoading(true);
    let loginEmail = trimmedInput;

    try {
      // Resolve username to email if it doesn't look like an email
      if (!trimmedInput.includes("@")) {
        const { data, error: rpcError } = await supabase.rpc(
          "get_email_by_username",
          { lookup_username: trimmedInput },
        );

        if (rpcError) throw rpcError;
        if (!data) {
          showErrorAlert("Username not found");
          return;
        }
        loginEmail = data;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        showErrorAlert(error.message, "Login Failed");
      }
    } catch (err: any) {
      showErrorAlert(err.message || "Failed to resolve username");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const signUp = useCallback(async () => {
    const { username, emailOrUsername, password, confirmPassword } = formData;
    const trimmedUsername = username.trim();
    const trimmedEmail = emailOrUsername.trim();

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      showErrorAlert("Please fill in all fields");
      return;
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
      showErrorAlert("Passwords do not match");
      return;
    }

    const usernameError = validateUsername(trimmedUsername);
    if (usernameError) {
      showErrorAlert(usernameError);
      return;
    }

    setLoading(true);

    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", trimmedUsername)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        showErrorAlert("This username is already claimed by another seeker.");
        return;
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
        showErrorAlert(error.message, "Signup Failed");
        return;
      }

      if (session?.user) {
        showSuccessAlert(
          "Welcome to the fellowship! Please verify your email.",
        );
      } else {
        showSuccessAlert("Please check your inbox for email verification!");
      }
    } catch (err: any) {
      showErrorAlert(err.message || "Signup failed unexpectedly");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return {
    ...formData,
    setEmailOrUsername: (val: string) => updateField("emailOrUsername", val),
    setUsername: (val: string) => updateField("username", val),
    setPassword: (val: string) => updateField("password", val),
    setConfirmPassword: (val: string) => updateField("confirmPassword", val),
    loading,
    isLogin,
    setIsLogin,
    signIn,
    signUp,
  };
};
