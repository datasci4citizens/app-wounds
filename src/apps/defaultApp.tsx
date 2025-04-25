import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../routes/defaultApp/Login.tsx';
import '../globals.css';
import { SWRConfig } from 'swr';
import AppLayout from '@/components/common/AppLayout.tsx';
import RoleSelection from '@/routes/defaultApp/RoleSelection.tsx';
import LandingPage from '@/routes/defaultApp/LandingPage.tsx';
import PatientSignUp from '@/routes/defaultApp/patient/PatientSignUp.tsx';
import PatientRegistered from '@/routes/defaultApp/patient/PatientRegistered.tsx';

const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/role-selection',
      element: (
        <AppLayout>
          <RoleSelection />
        </AppLayout>
      ),
    },
    {
      path: '/patient-signup',
      element: (
        <AppLayout>
          <PatientSignUp />
        </AppLayout>
      ),
    },
    {
      path: '/patient-registered',
      element: (
        <AppLayout>
          <PatientRegistered />
        </AppLayout>
      ),
    },
  ]);

export default function App() {
    return (
        <main className="bg-primary h-screen flex flex-col justify-end overflow-hidden">
            <SWRConfig value={{
                fetcher: (url, args) => fetch(`${import.meta.env.VITE_SERVER_URL}${url}`, {credentials: 'include', ...args}).then(res => res.json())
            }}>
                <RouterProvider router={router}/>
            </SWRConfig>
        </main>
    );
}