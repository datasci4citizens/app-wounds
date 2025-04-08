# Wounds App

**Wounds** is an application built for **nurses and patients** to collaboratively monitor the healing progress of wounds. It helps maintain a consistent follow-up, improves documentation, and enhances communication between healthcare professionals and patients.

The main goal of the app is to **track wound evolution** through periodic records (photos, descriptions, notes) and provide a history that supports clinical decision-making.

---

## Running the Web Version

### Prerequisites
- pnpm, npm or yarn

### Steps
```bash
# Install dependencies
npm install

# Run the application locally
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

---

## Running the Mobile Version

### Prerequisites
- Capacitor CLI installed globally (`npm install -g @capacitor/cli`)
- Android Studio (for Android) or Xcode (for iOS)

### Steps
```bash
# After installing dependencies...
npx cap sync
npx cap open android   # or: npx cap open ios
```

From there, you can run the app on an emulator or a physical device using Android Studio or Xcode.

---


## Technologies Used

- **React 18**
- **Vite** for fast builds
- **Tailwind CSS** with animation support
- **Radix UI** for accessible components
- **React Hook Form** + **Zod** for robust form validation
- **Capacitor** for Android/iOS integration
- **Google OAuth**
- **SWR** for data fetching and caching

---