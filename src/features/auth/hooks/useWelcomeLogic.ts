import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { supabase } from "@/lib/supabase";
import { showSuccessAlert } from "@/utils/alertHelper";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Field is required"),
  password: z.string().min(1, "Secret phrase is required"),
});

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be between 3 and 20 characters")
      .max(20, "Username must be between 3 and 20 characters")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Username can only contain letters, numbers, underscores, dots, and hyphens",
      )
      .refine(
        (val) => !/^[.\-]/.test(val) && !/[.\-]$/.test(val),
        "Username cannot start or end with a dot or hyphen",
      )
      .refine(
        (val) => !/\.\./.test(val),
        "Username cannot contain consecutive dots",
      ),
    emailOrUsername: z.string().email("Invalid email format"),
    password: z.string().min(6, "Secret phrase must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your phrase"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Phrases do not match",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

export const useWelcomeLogic = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    clearErrors,
  } = useForm<SignupData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema) as any,
    defaultValues: {
      emailOrUsername: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setFormError("");
    reset();
    clearErrors();
  }, [reset, clearErrors]);

  const signIn = useCallback(
    async (data: LoginData) => {
      const { emailOrUsername, password } = data;
      const trimmedInput = emailOrUsername.trim();

      setLoading(true);
      setFormError("");

      let loginEmail = trimmedInput;

      try {
        if (!trimmedInput.includes("@")) {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            "get_email_by_username",
            { lookup_username: trimmedInput },
          );

          if (rpcError) throw rpcError;
          if (!rpcData) {
            setFormError("Username not found");
            setLoading(false);
            return;
          }
          loginEmail = rpcData;
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
    },
    [setLoading, setFormError],
  );

  const signUp = useCallback(
    async (data: SignupData) => {
      const { username, emailOrUsername, password } = data;
      const trimmedUsername = username.trim();
      const trimmedEmail = emailOrUsername.trim();

      setLoading(true);
      setFormError("");

      try {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", trimmedUsername)
          .maybeSingle();

        if (checkError) throw checkError;
        if (existingUser) {
          setFormError("This username is already claimed.");
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
    },
    [setLoading, setFormError],
  );

  const onSubmit = handleSubmit((data) => {
    if (isLogin) {
      signIn(data as unknown as LoginData);
    } else {
      signUp(data as unknown as SignupData);
    }
  });

  return {
    control,
    onSubmit,
    errors,
    formError,
    loading,
    isLogin,
    setIsLogin: toggleMode,
  };
};
