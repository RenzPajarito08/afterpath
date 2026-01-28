# Android APK Build Instructions

This guide will help you build an APK file for your Afterpath app that can be installed on any Android device.

## Prerequisites
1. **Expo Account**: You need an Expo account to use EAS Build
2. **EAS CLI**: Install if you haven't already

## Steps

### 1. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Enter your Expo credentials when prompted.

### 3. Configure the Project (Already Done)
✅ `app.json` has been configured with package name: `com.afterpath`
✅ `eas.json` has been created with build profiles

### 4. Build the APK
Run the following command to build your Android APK:
```bash
eas build -p android --profile preview
```

This will:
- Upload your code to Expo's build servers
- Build the APK
- Provide you with a download link when complete

> **Note**: The build process takes 10-20 minutes on average.

### 5. Download and Install
Once the build completes:
1. You'll get a download link in the terminal
2. Download the APK file
3. Transfer it to your Android device
4. Enable "Install from Unknown Sources" in your device settings
5. Install the APK

## Alternative: Local Build (Development Build)
For faster testing, you can create a development build on your device:
```bash
npx expo run:android
```
This requires Android Studio and an Android emulator or connected device.

## Important Notes
- **First Build**: The first build may take longer as EAS sets up your project
- **APK Size**: The preview build will be larger than production builds
- **Updates**: Each time you make changes, you'll need to rebuild and reinstall the APK
- **Production Build**: For Play Store submission, use `eas build -p android --profile production`
