import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../lib/cloudinary";
import { supabase } from "../lib/supabase";

interface JourneyData {
  distance: number;
  duration: number;
  coordinates: { latitude: number; longitude: number; timestamp?: number }[];
  activityType: string;
  maxSpeed?: number;
}

export const useSummaryLogic = (navigation: any) => {
  const { user } = useAuth();
  const [memory, setMemory] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { showAlert } = useAlert();

  const pickImage = async () => {
    if (selectedImages.length >= 6) {
      showAlert({
        title: "Limit Reached",
        message: "You can only enscribe up to 6 memories.",
        type: "info",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 6 - selectedImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 6));
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((img) => img !== uri));
  };

  const handleSave = useCallback(
    async (data: JourneyData) => {
      if (!user) return;
      setSaving(true);

      try {
        // 1. Upload images to Cloudinary first
        const uploadedUrls = await Promise.all(
          selectedImages.map((uri) => uploadToCloudinary(uri, user.id)),
        );

        const polylineString = JSON.stringify(data.coordinates);

        // 2. Save the journey
        const { data: journey, error: journeyError } = await supabase
          .from("journeys")
          .insert({
            user_id: user.id,
            distance_meters: data.distance,
            duration_seconds: data.duration,
            polyline: polylineString,
            memory_text: memory,
            activity_type: data.activityType,
            max_speed: data.maxSpeed || 0,
            start_time: new Date(
              data.coordinates[0]?.timestamp || Date.now(),
            ).toISOString(),
            end_time: new Date().toISOString(),
            title: "Journey on " + new Date().toLocaleDateString(),
            mood_score: 5,
          })
          .select()
          .single();

        if (journeyError) throw journeyError;

        // 3. Save image URLs to journey_images table (optional)
        if (uploadedUrls.length > 0) {
          const { error: imagesError } = await supabase
            .from("journey_images")
            .insert(
              uploadedUrls.map((url) => ({
                journey_id: journey.id,
                image_url: url,
              })),
            );

          if (imagesError) throw imagesError;
        }

        showAlert({
          title: "Memory Enscribed",
          message: "Your journey has been woven into time.",
          type: "success",
          confirmText: "Farewell",
          onConfirm: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs", params: { screen: "HomeTab" } }],
            }),
        });
      } catch (e: any) {
        showAlert({
          title: "Error saving memory",
          message: e.message,
          type: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [user, memory, navigation, selectedImages],
  );

  return {
    memory,
    setMemory,
    saving,
    handleSave,
    selectedImages,
    pickImage,
    removeImage,
  };
};
