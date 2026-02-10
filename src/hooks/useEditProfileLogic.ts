import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { showErrorAlert, showSuccessAlert } from "../utils/alertHelper";

export const useEditProfileLogic = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });

  const updateProfileField = (
    field: keyof typeof profileData,
    value: string,
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBirthdayChange = useCallback((text: string) => {
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
    updateProfileField("birthday", formatted);
  }, []);

  const getProfile = useCallback(async () => {
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
        setProfileData({
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
  }, [user]);

  const updateProfile = useCallback(async () => {
    try {
      setSaving(true);
      if (!user) throw new Error("No user on the session!");

      const updates = {
        id: user.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        birthday: profileData.birthday || null,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      showSuccessAlert("Chronicle details updated.", "Success");
      navigation.goBack();
    } catch (error: any) {
      showErrorAlert(error.message);
    } finally {
      setSaving(false);
    }
  }, [user, profileData, navigation]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);

  return {
    loading,
    saving,
    ...profileData,
    setFirstName: (val: string) => updateProfileField("firstName", val),
    setLastName: (val: string) => updateProfileField("lastName", val),
    birthday: profileData.birthday,
    handleBirthdayChange,
    updateProfile,
  };
};
