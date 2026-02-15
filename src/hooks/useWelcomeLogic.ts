import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";
import { showSuccessAlert } from "../utils/alertHelper";
import {
  validateEmail,
  validatePasswordMatch,
  validateUsername,
} from "../utils/validation";

export const useWelcomeLogic = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    emailOrUsername: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that specific field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general form error
    if (formError) setFormError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormError("");
    setErrors({
      emailOrUsername: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
  };

  const validateSignIn = () => {
    const { emailOrUsername, password } = formData;
    const newErrors = { ...errors };
    let isValid = true;

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Field is required";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Secret phrase is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateSignUp = () => {
    const { username, emailOrUsername, password, confirmPassword } = formData;
    const newErrors = {
      emailOrUsername: "",
      username: "",
      password: "",
      confirmPassword: "",
    };
    let isValidForm = true;

    const uError = validateUsername(username.trim());
    if (uError) {
      newErrors.username = uError;
      isValidForm = false;
    }

    const eError = validateEmail(emailOrUsername.trim());
    if (eError) {
      newErrors.emailOrUsername = eError;
      isValidForm = false;
    }

    if (!password) {
      newErrors.password = "Secret phrase is required";
      isValidForm = false;
    } else if (password.length < 6) {
      newErrors.password = "Secret phrase must be at least 6 characters";
      isValidForm = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your phrase";
      isValidForm = false;
    } else if (!validatePasswordMatch(password, confirmPassword)) {
      newErrors.confirmPassword = "Phrases do not match";
      isValidForm = false;
    }

    setErrors(newErrors);
    return isValidForm;
  };

  const signIn = useCallback(async () => {
    if (!validateSignIn()) return;

    const { emailOrUsername, password } = formData;
    const trimmedInput = emailOrUsername.trim();

    setLoading(true);
    let loginEmail = trimmedInput;

    try {
      if (!trimmedInput.includes("@")) {
        const { data, error: rpcError } = await supabase.rpc(
          "get_email_by_username",
          { lookup_username: trimmedInput },
        );

        if (rpcError) throw rpcError;
        if (!data) {
          setErrors((prev) => ({
            ...prev,
            emailOrUsername: "Username not found",
          }));
          setLoading(false);
          return;
        }
        loginEmail = data;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (error) {
        setFormError(error.message);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to resolve username");
    } finally {
      setLoading(false);
    }
  }, [formData, validateSignIn]);

  const signUp = useCallback(async () => {
    if (!validateSignUp()) return;

    const { username, emailOrUsername, password } = formData;
    const trimmedUsername = username.trim();
    const trimmedEmail = emailOrUsername.trim();

    setLoading(true);

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", trimmedUsername)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        setErrors((prev) => ({
          ...prev,
          username: "This username is already claimed.",
        }));
        setLoading(false);
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
        setFormError(error.message);
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
      setFormError(err.message || "Signup failed unexpectedly");
    } finally {
      setLoading(false);
    }
  }, [formData, validateSignUp]);

  return {
    ...formData,
    errors,
    formError,
    setEmailOrUsername: (val: string) => updateField("emailOrUsername", val),
    setUsername: (val: string) => updateField("username", val),
    setPassword: (val: string) => updateField("password", val),
    setConfirmPassword: (val: string) => updateField("confirmPassword", val),
    loading,
    isLogin,
    setIsLogin: toggleMode,
    signIn,
    signUp,
  };
};
