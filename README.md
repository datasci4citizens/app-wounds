# Wounds App

**Wounds** is an application built for **nurses and patients** to collaboratively monitor the healing progress of wounds. It helps maintain consistent follow-up, improves documentation, and enhances communication between healthcare professionals and patients.

The main goal of the app is to **track wound evolution** through periodic records (photos, descriptions, notes) and provide a history that supports clinical decision-making.

---

## Setting up Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
VITE_SERVER_URL=<YOUR_BACKEND_URL> # http://localhost:3000 -> local
```

---

## Running the Web Version Locally

### Prerequisites
- `pnpm`, `npm`, or `yarn`

### Steps
```bash
# Install dependencies
npm install

# Run the application locally
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

> ✅ When running locally, authentication is disabled in development mode, so you can explore the app's workflow without logging in or running the backend.

---

## Running the Mobile Version Locally

### Prerequisites
- Capacitor CLI installed globally:  
  ```bash
  npm install -g @capacitor/cli
  ```
- Android Studio (for Android) or Xcode (for iOS)

### Steps
```bash
npx cap sync
npx cap open android   # or: npx cap open ios
```

Then, use Android Studio or Xcode to run the app on an emulator or physical device.

---

## Technologies Used

- **React 18**
- **Vite** – fast development and build tool
- **Tailwind CSS** – utility-first CSS framework with animation support
- **Radix UI** – accessible UI primitives
- **React Hook Form** + **Zod** – for form handling and schema validation
- **Capacitor** – for native mobile support (Android & iOS)
- **Google OAuth** – for authentication
- **SWR** – for data fetching and caching