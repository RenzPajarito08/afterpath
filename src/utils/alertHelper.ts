import { Alert } from "react-native";

export const showErrorAlert = (
  message: string,
  title: string = "Error",
): void => {
  Alert.alert(title, message);
};

export const showSuccessAlert = (
  message: string,
  title: string = "Success",
): void => {
  Alert.alert(title, message);
};
