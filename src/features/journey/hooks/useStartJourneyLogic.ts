import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RootStackParamList } from "@/navigation/types";

const startJourneySchema = z.object({
  title: z
    .string()
    .min(1, "A chronicle requires a name")
    .max(100, "The name is too long for the record"),
  activityType: z.string().min(1, "You must choose your path"),
});

type StartJourneyFormData = z.infer<typeof startJourneySchema>;

type StartJourneyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "StartJourney"
>;

export const useStartJourneyLogic = () => {
  const navigation = useNavigation<StartJourneyNavigationProp>();
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [customActivity, setCustomActivity] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<StartJourneyFormData>({
    resolver: zodResolver(startJourneySchema),
    defaultValues: {
      title: "",
      activityType: "walking",
    },
  });

  const selectedActivity = watch("activityType");

  const handleActivitySelect = useCallback(
    (activityId: string) => {
      if (activityId === "others") {
        setShowOtherModal(true);
      } else {
        setValue("activityType", activityId, { shouldValidate: true });
        setCustomActivity("");
      }
    },
    [setValue],
  );

  const onConfirmCustomActivity = useCallback(
    (val: string) => {
      setCustomActivity(val);
      setValue("activityType", val, { shouldValidate: true });
      setShowOtherModal(false);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (data: StartJourneyFormData) => {
      navigation.navigate("Tracking", {
        activityType: data.activityType,
        title: data.title.trim(),
      });
    },
    [navigation],
  );

  return {
    control,
    onSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitted,
    selectedActivity,
    handleActivitySelect,
    showOtherModal,
    setShowOtherModal,
    customActivity,
    onConfirmCustomActivity,
  };
};
