import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { showErrorAlert, showSuccessAlert } from "@/utils/alertHelper";

import { differenceInYears, isFuture, isValid, parse } from "date-fns";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "True Name is required")
    .max(50, "True Name cannot exceed 50 characters")
    .superRefine((val, ctx) => {
      // Check allowed characters (including international letters)
      const allowedCharsRegex = /^[\p{L}\s'-]+$/u;
      if (!allowedCharsRegex.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "True Name can only contain letters, spaces, apostrophes, or hyphens",
        });
      }
      // Must start and end with a letter
      if (!/^\p{L}/u.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True Name must start with a letter",
        });
      }
      if (!/\p{L}$/u.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True Name must end with a letter",
        });
      }
      // No consecutive special characters
      if (/[\s'-]{2,}/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "True Name cannot contain consecutive special characters",
        });
      }
    }),
  lastName: z
    .string()
    .min(1, "Lineage is required")
    .max(50, "Lineage cannot exceed 50 characters")
    .superRefine((val, ctx) => {
      const allowedCharsRegex = /^[\p{L}\s'-]+$/u;
      if (!allowedCharsRegex.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Lineage can only contain letters, spaces, apostrophes, or hyphens",
        });
      }
      if (!/^\p{L}/u.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lineage must start with a letter",
        });
      }
      if (!/\p{L}$/u.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lineage must end with a letter",
        });
      }
      if (/[\s'-]{2,}/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lineage cannot contain consecutive special characters",
        });
      }
    }),
  birthday: z
    .string()
    .min(1, "Birthday is required")
    .superRefine((val, ctx) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format must be YYYY-MM-DD",
        });
        return;
      }

      const parsedDate = parse(val, "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a real calendar date",
        });
        return;
      }

      if (isFuture(parsedDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birthday cannot be in the future",
        });
      }

      const age = differenceInYears(new Date(), parsedDate);
      if (age < 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be at least 13 years old",
        });
      }
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const useEditProfileLogic = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthday: "",
    },
    mode: "onChange",
  });

  const getProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, first_name, last_name, birthday`)
        .eq("id", user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        reset({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          birthday: data.birthday || "",
        });
      }
    } catch (error: any) {
      console.log("Error loading profile", error.message);
    } finally {
      setLoading(false);
    }
  }, [user, reset]);

  const onSubmit = useCallback(
    async (data: ProfileFormData) => {
      if (!user) return;
      try {
        setSaving(true);

        const updates = {
          id: user.id,
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          birthday: data.birthday?.trim() || null,
          updated_at: new Date(),
        };

        const { error } = await supabase.from("profiles").upsert(updates);

        if (error) throw error;

        showSuccessAlert("Chronicle details updated.", "Success");
        navigation.goBack();
      } catch (error: any) {
        showErrorAlert(error.message);
      } finally {
        setSaving(false);
      }
    },
    [user, navigation],
  );

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
    setValue("birthday", formatted, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  return {
    loading,
    saving,
    control,
    errors,
    isValid,
    isDirty,
    onSubmit: handleSubmit(onSubmit),
    handleBirthdayChange,
  };
};
