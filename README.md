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

# Routing Guide – Wounds App

This guide explains how the routing system works in the **Wounds App**, how routes are structured, and how you can create and register new pages in the application.

---

## Folder Structure

The application uses **React Router v6** with `createBrowserRouter`. All routes are defined in `src/App.tsx`.

The project is split into **two main domains** based on the user type:

```
src/routes/
├── login/
│   └── Login.tsx
├── patientApp/
│   ├── patient/
│   ├── wound/
│   └── Menu.tsx
└── specialistApp/
    ├── patient/
    ├── wound/
    └── Menu.tsx
```

Both `patientApp/` and `specialistApp/` contain similar route modules like `patient/` and `wound/`, but are tailored to each role's experience.

---

## How Routing is Defined

All routing is configured in `src/App.tsx` using `createBrowserRouter`.

Example route structure:

```tsx
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <UserContextProvider>
        <AuthGuard />
      </UserContextProvider>
    ),
    children: [
      // Patient App
      {
        path: "/patient/dashboard",
        element: (
          <AppLayout>
            <PatientDashboard />
          </AppLayout>
        ),
      },
      {
        path: "/patient/wound/create",
        element: (
          <AppLayout>
            <PatientWoundCreate />
          </AppLayout>
        ),
      },

      // Specialist App
      {
        path: "/specialist/patients",
        element: (
          <AppLayout>
            <SpecialistPatientList />
          </AppLayout>
        ),
      },
      {
        path: "/specialist/wound/create",
        element: (
          <AppLayout>
            <SpecialistWoundCreate />
          </AppLayout>
        ),
      },
    ],
  },
]);
```

---

## How to Create a New Page

### Step 1: Create the Component

Example for a new patient route:

```tsx
// src/routes/patientApp/example/PatientExample.tsx
export default function PatientExample() {
  return <div>Patient Example</div>;
}
```

### Step 2: Register the Route

```tsx
import WoundHistory from "@/routes/patientApp/example/PatientExample";

{
  path: "/patient/example",
  element: (
    <AppLayout>
      <PatientExample />
    </AppLayout>
  ),
}
```

### Step 3: Use it in Navigation

```tsx
<Link to="/patient/example">View Example</Link>
```

---

## Auth Guard

All routes (except `/login`) are nested inside the `AuthGuard`, which protects access and redirects unauthenticated users.

For development, this guard is disabled in `DEV` mode to allow free navigation.

---
