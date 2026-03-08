# Capacitor Guide

## Native Development Requirements

### 1. System Requirements
- **Operating System:**
  - macOS (for iOS development)
  - Windows or Linux (for Android development)

### 2. Node.js
- Install Node.js (v12 or later) from [nodejs.org](https://nodejs.org/).

### 3. Capacitor CLI
- Install the Capacitor CLI globally:
  ```bash
  npm install -g @capacitor/cli
  ```

### 4. Java Development Kit (JDK)
- Install the JDK (version 8 or later) for Android development, and configure the JAVA_HOME environment variable.

### 5. Android Studio
- Install Android Studio for Android development. Ensure you have the necessary SDKs and the Android emulator setup.

### 6. Xcode (for macOS)
- Install Xcode from the App Store for iOS development. Make sure to install the command line tools.

### 7. Setting Up Your App
1. Navigate to your app directory.
2. Initialize Capacitor:
   ```bash
   npx cap init
   ```
3. Add Platforms:
   ```bash
   npx cap add android
   npx cap add ios
   ```

### 8. Running Your App
- For Android:
  ```bash
  npx cap open android
  ```
- For iOS:
  ```bash
  npx cap open ios
  ```

## Conclusion
With these tools and requirements set up, you can start developing your app using Capacitor.