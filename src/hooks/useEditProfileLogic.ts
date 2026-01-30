import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export const useEditProfileLogic = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");

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
    setBirthday(formatted);
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
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBirthday(data.birthday || "");
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
        first_name: firstName,
        last_name: lastName,
        birthday: birthday || null,
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
  }, [user, firstName, lastName, birthday, navigation]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);

  return {
    loading,
    saving,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    birthday,
    handleBirthdayChange,
    updateProfile,
  };
};
