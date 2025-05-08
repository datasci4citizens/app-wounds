# 🩹 Wounds App

**Wounds** is an application built for **nurses and patients** to collaboratively monitor the healing progress of wounds. It helps maintain consistent follow-up, improves documentation, and enhances communication between healthcare professionals and patients.

The main goal of the app is to **track wound evolution** through periodic records (photos, descriptions, notes) and provide a history that supports clinical decision-making.

---

## Setting up Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
VITE_SERVER_URL=<YOUR_BACKEND_URL> # http://localhost:3000 -> local
VITE_GOOGLE_CLIENT_ID=<GOOGLE_KEY>
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

- [Android Studio Dowload](https://developer.android.com/studio?hl=pt-br)


### Steps
```bash
npm run build        # compila a versão web
npx cap sync         # sincroniza com Capacitor
npx cap open android # ou ios
```

Then, use Android Studio or Xcode to run the app on an emulator or physical device.

---

# Routing Guide – Wounds App

This guide explains how the routing system works in the **Wounds App**, how routes are structured, and how you can create and register new pages in the application.

---

## Folder Structure

The application uses **React Router v6** with `createBrowserRouter`. The app is divided into three contexts:

```
src/
├── apps/
│   ├── DefaultApp.tsx       # Login/SignUp -> Role selection
│   ├── PatientApp.tsx       # Patient-only routes
│   └── SpecialistApp.tsx    # Specialist-only routes
├── routes/
│   ├── login/
│   ├── patientApp/
│   ├── specialistApp/
│   └── RoleSelection.tsx
```

Each app has its own router definition, layout and structure.

---

## How Routing is Defined

Each app file defines its own router:

- `DefaultApp.tsx`: entry after login, with route to `/role-selection`
- `PatientApp.tsx`: routes for patients only
- `SpecialistApp.tsx`: routes for specialists only

Your main `App.tsx` dynamically chooses which app to load:

```tsx
const role = useUserRole();

if (role === "patient") return <PatientApp />;
if (role === "specialist") return <SpecialistApp />;
return <DefaultApp />;
```

---

## How to Create a New Page

### Step 1: Create the Component

Example:

```tsx
// src/routes/patientApp/example/PatientExample.tsx
export default function PatientExample() {
  return <div>Patient Example</div>;
}
```

### Step 2: Register the Route

Go to `PatientApp.tsx` or `SpecialistApp.tsx` depending on the context.

```tsx
import PatientExample from "@/routes/patientApp/example/PatientExample";

{
  path: "/patientApp/example",
  element: (
    <AppLayout>
      <PatientExample />
    </AppLayout>
  ),
}
```

### Step 3: Use the Route

```tsx
<Link to="/patientApp/example">View Example</Link>
```

---

## Role Selection Page


The page `/role-selection` is the first step after login, where the user selects whether they are a **patient** or **specialist**. This sets the role in localStorage.

> ⚠️ Temporary mechanism: This manual role selection is only a placeholder. In the final version, the role will be provided directly by the backend after login, and this page will be removed from the flow.

```tsx
localStorage.setItem("user_role", "patient" or "specialist");
```

Your `App.tsx` uses this value to load the correct app.

---

## Auth Guard

All pages (except `/login`) are protected using the `AuthGuard`, which checks authentication state.

For development, the guard skips validation when `import.meta.env.DEV === true`.

---