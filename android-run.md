# How to - Android run

This guide will show the walkthrough on how to run the wounds app in an Android environment.
Note that, in order for the app to run fully with the google auth, you must have the backend running. To do so, follow [this guide](https://github.com/datasci4citizens/server-wounds)

## Prerequisites

- Node.js and npm installed
- Android Studio installed (more info [here](https://developer.android.com/studio))
- Android SDK configured

## Steps to generate and run APK

1. **Build the web application**
   ```bash
   npm run build
   ```

2. **Sync with Android project**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**
   ```bash
   npx cap open android
   ```
   At this point, the Android studio app should open on your computer, and the build will finish there

4. **Generate APK**
   - In Android Studio: Build > Generate Bundle(s) / APK(s) > Generate APK(s)
   - Or via command line:
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Run on device/emulator**

   You can choose to run the app on a physical device or emulator. In this guide we will focus on the emulator, provided by Android Studio itself. 
   In the Android Studio app:
   1. Go to Tools > Device Manager
   2. A tab on your right with the device manager should open. If you don't have any configured device, click on the "+" button, and choose "Create Virtual Device"
   3. You can choose any phone on the list, click "Next" then "Finish"
   4. You should see that now the phone you have just choose will appear in the side menu
   5. On the upper side of the Android Studio App, select Run > Run 'app'
   Now you should see the phone screen in the right panel starting with the app

### Debugging JavaScript

To debug your JavaScript code:

 Use Chrome remote debugging:
   - Open Chrome and navigate to chrome://inspect
   - Run your app on Android Studio
   - Connect your device and find your app
   - Click "inspect" to open DevTools

## Troubleshooting

- If build fails, check Android Studio logs
- Ensure all dependencies are installed: `npm install`
- Verify Android SDK path in Android Studio settings