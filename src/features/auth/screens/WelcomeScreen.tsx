import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Lock, LogIn, Mail, UserPlus } from "lucide-react-native";
import React, { useMemo } from "react";
import { Controller } from "react-hook-form";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useWelcomeLogic } from "@/features/auth/hooks/useWelcomeLogic";
import { RootStackParamList } from "@/navigation/types";

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Welcome"
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const { control, onSubmit, loading, isLogin, setIsLogin, errors, formError } =
    useWelcomeLogic();

  const overlayStyle = useMemo(
    () => [
      styles.overlay,
      {
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 20,
      },
    ],
    [insets.top, insets.bottom],
  );

  return (
    <ImageBackground
      source={require("../../../../assets/landscape.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        style={styles.keyboardView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View style={overlayStyle}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Afterpath</Text>
            <Text style={styles.subtitle}>Beyond the Journey</Text>
            <View style={styles.divider} />
            <Text style={styles.quote}>
              "The journey is the reward for those who seek memories."
            </Text>
          </View>

          <ImageBackground
            source={require("../../../../assets/parchment_texture.png")}
            style={styles.parchmentContainer}
            imageStyle={styles.parchmentImage}
          >
            <View style={styles.inputSection}>
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.username && styles.inputWrapperError,
                    ]}
                  >
                    <UserPlus
                      size={20}
                      color={errors.username ? "#E53E3E" : "#718096"}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={control}
                      name="username"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Chosen Username"
                          placeholderTextColor="#A0AEC0"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          autoCapitalize="none"
                          accessibilityLabel="Chosen Username"
                        />
                      )}
                    />
                  </View>
                  {errors.username && (
                    <Text style={styles.errorText}>
                      {errors.username.message}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.emailOrUsername && styles.inputWrapperError,
                  ]}
                >
                  <Mail
                    size={20}
                    color={errors.emailOrUsername ? "#E53E3E" : "#718096"}
                    style={styles.inputIcon}
                  />
                  <Controller
                    control={control}
                    name="emailOrUsername"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder={
                          isLogin ? "Email or Username" : "Sanctuary Email"
                        }
                        placeholderTextColor="#A0AEC0"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        keyboardType={isLogin ? "default" : "email-address"}
                        accessibilityLabel={
                          isLogin ? "Email or Username" : "Sanctuary Email"
                        }
                      />
                    )}
                  />
                </View>
                {errors.emailOrUsername && (
                  <Text style={styles.errorText}>
                    {errors.emailOrUsername.message}
                  </Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password && styles.inputWrapperError,
                  ]}
                >
                  <Lock
                    size={20}
                    color={errors.password ? "#E53E3E" : "#718096"}
                    style={styles.inputIcon}
                  />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder={
                          isLogin ? "Secret Phrase" : "New Secret Phrase"
                        }
                        placeholderTextColor="#A0AEC0"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        secureTextEntry
                        autoCapitalize="none"
                        accessibilityLabel={
                          isLogin ? "Secret Phrase" : "New Secret Phrase"
                        }
                      />
                    )}
                  />
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      errors.confirmPassword && styles.inputWrapperError,
                    ]}
                  >
                    <Lock
                      size={20}
                      color={errors.confirmPassword ? "#E53E3E" : "#718096"}
                      style={styles.inputIcon}
                    />
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm Secret Phrase"
                          placeholderTextColor="#A0AEC0"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          secureTextEntry
                          autoCapitalize="none"
                          accessibilityLabel="Confirm Secret Phrase"
                        />
                      )}
                    />
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </View>
              )}

              {formError ? (
                <View style={styles.formErrorContainer}>
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onSubmit}
                disabled={loading}
                accessibilityLabel={
                  isLogin ? "Begin Journey" : "Join Fellowship"
                }
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#F7F7F2" />
                ) : (
                  <>
                    {isLogin ? (
                      <LogIn size={20} color="#F7F7F2" />
                    ) : (
                      <UserPlus size={20} color="#F7F7F2" />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? "Begin Journey" : "Join Fellowship"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <TouchableOpacity
            onPress={setIsLogin}
            style={styles.switchButton}
            accessibilityLabel={
              isLogin
                ? "Switch to Sign Up fate"
                : "Switch to Sign In retrace steps"
            }
            accessibilityRole="link"
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Seek a new fate? Sign Up"
                : "Retrace your steps? Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(247, 247, 242, 0.4)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 48,
    fontWeight: "300",
    color: "#2D3748",
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  subtitle: {
    fontSize: 14,
    color: "#4A5568",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: -8,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  divider: {
    height: 1,
    width: 60,
    backgroundColor: "#A0AEC0",
    marginVertical: 20,
  },
  quote: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
    fontFamily: Platform.OS === "ios" ? "Optima-Italic" : "serif",
  },
  parchmentContainer: {
    width: "100%",
    padding: 2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  parchmentImage: {
    borderRadius: 12,
    opacity: 0.95,
  },
  inputSection: {
    padding: 30,
    gap: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E0",
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  primaryButton: {
    backgroundColor: "#2F4F4F",
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#2F4F4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryButtonText: {
    color: "#F7F7F2",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  switchButton: {
    padding: 10,
    marginBottom: 10,
  },
  switchText: {
    color: "#4A5568",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  inputContainer: {
    gap: 4,
  },
  inputWrapperError: {
    borderBottomColor: "#E53E3E",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 12,
    marginTop: -4,
    fontFamily: Platform.OS === "ios" ? "Optima-Regular" : "serif",
  },
  formErrorContainer: {
    backgroundColor: "rgba(229, 62, 62, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(229, 62, 62, 0.2)",
  },
  formErrorText: {
    color: "#E53E3E",
    fontSize: 14,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Optima-Medium" : "serif",
  },
});

export default WelcomeScreen;
