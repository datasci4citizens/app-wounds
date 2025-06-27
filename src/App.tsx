import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './guards/auth.tsx';
import { SWRConfig } from 'swr';
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import AppLayout from "@/components/common/AppLayout.tsx";
import './globals.css';

// Default app routes
import LandingPage from './routes/defaultApp/LandingPage.tsx';
import RoleSelection from './routes/defaultApp/RoleSelection.tsx';

// Specialist routes
import SpecialistSignUp from './routes/defaultApp/specialist/SpecialistSignUp.tsx';
import SpecialistMenu from './routes/specialistApp/Menu.tsx';
import SpecialistPatientList from './routes/specialistApp/patient/PatientList.tsx';
import SpecialistPatientWounds from './routes/specialistApp/patient/PatientWounds.tsx';
import SpecialistPatientCreate from './routes/specialistApp/patient/patient-create/PatientCreate.tsx';
import SpecialistPatientCreateQrCode from './routes/specialistApp/patient/patient-create/PatientCreateQrCode.tsx';
import SpecialistWoundCreate from './routes/specialistApp/wound/WoundCreate.tsx';
import SpecialistWoundDetail from './routes/specialistApp/wound/WoundDetail.tsx';
import SpecialistWoundRecordDetail from './routes/specialistApp/wound/WoundRecordDetail.tsx';
import SpecialistWoundAddUpdate from './routes/specialistApp/wound/AddUpdate/WoundAddUpdate.tsx';
import SpecialistWoundAddUpdateImage from './routes/specialistApp/wound/AddUpdate/WoundAddUpdateImage.tsx';
import SpecialistWoundAddUpdateConduct from './routes/specialistApp/wound/AddUpdate/WoundAddUpdateConduct.tsx';
import { WoundUpdateProvider as SpecialistWoundUpdateProvider } from './routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx';
import SpecialistNotifications from './routes/specialistApp/notifications/Notifications.tsx';
import SpecialistSignUpDetails from './routes/defaultApp/specialist/SpecialistSignUpDetails.tsx';

// Patient routes
import PatientSignUp from './routes/defaultApp/patient/PatientSignUp.tsx';
import PatientRegistered from './routes/defaultApp/patient/PatientRegistered.tsx';
import PatientSignUpToken from './routes/defaultApp/patient/PatientSignupToken.tsx';
import PatientMenu from './routes/patientApp/Menu.tsx';
import PatientWounds from './routes/patientApp/patient/PatientWounds.tsx';
import PatientWoundDetail from './routes/patientApp/wound/WoundDetail.tsx';
import PatientWoundRecordDetail from './routes/patientApp/wound/WoundRecordDetail.tsx';
import PatientWoundAddUpdate from './routes/patientApp/wound/AddUpdate/WoundAddUpdate.tsx';
import PatientWoundAddUpdateImage from './routes/patientApp/wound/AddUpdate/WoundAddUpdateImage.tsx';
import { WoundUpdateProvider as PatientWoundUpdateProvider } from './routes/patientApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx';
import PatientNotifications from './routes/patientApp/notifications/Notifications.tsx';


import axios from 'axios';

const router = createBrowserRouter([
  // Public routes (no authentication required)
  {
    path: '/',
    element: <LandingPage/>
  },
  {
    path: '/role-selection',
    element: <AppLayout><RoleSelection /></AppLayout>,
  },
  
  // Patient signup flow (public)
  {
    path: '/patient-signup',
    element: <AppLayout><PatientSignUp /></AppLayout>,
  },
  {
    path: '/patient-signup-token',
    element: <AppLayout><PatientSignUpToken /></AppLayout>,
  },
  {
    path: '/patient-registered',
    element: <AppLayout><PatientRegistered /></AppLayout>,
  },
  
  // Specialist signup (public)
  {
    path: '/specialist-signup',
    element: <AppLayout><SpecialistSignUp /></AppLayout>,
  },
  {
    path: '/specialist-signup-details',
    element: <AppLayout><SpecialistSignUpDetails /></AppLayout>,
  },
  
  // Protected specialist routes
  {
    path: '/specialist',
    element: <UserContextProvider><AuthGuard /></UserContextProvider>,
    children: [
      {
        path: 'menu',
        element: <AppLayout><SpecialistMenu /></AppLayout>,
      },
      {
        path: 'notifications',
        element: <AppLayout><SpecialistNotifications /></AppLayout>,
      },
      {
        path: 'patient/create',
        element: <AppLayout><SpecialistPatientCreate /></AppLayout>,
      },
      {
        path: 'patient/create/qrcode',
        element: <AppLayout><SpecialistPatientCreateQrCode /></AppLayout>,
      },
      {
        path: 'patient/list',
        element: <AppLayout><SpecialistPatientList /></AppLayout>,
      },
      {
        path: 'patient/wounds',
        element: <AppLayout><SpecialistPatientWounds /></AppLayout>,
      },
      {
        path: 'wound/create',
        element: <AppLayout><SpecialistWoundCreate /></AppLayout>,
      },
      {
        path: 'wound/detail',
        element: <AppLayout><SpecialistWoundDetail /></AppLayout>,
      },
      {
        path: 'wound/record-detail',
        element: <AppLayout><SpecialistWoundRecordDetail /></AppLayout>,
      },
      {
        path: 'wound/add-update',
        element: <AppLayout>
          <SpecialistWoundUpdateProvider>
            <SpecialistWoundAddUpdate />
          </SpecialistWoundUpdateProvider>
        </AppLayout>,
      },
      {
        path: 'wound/add-update/image',
        element: <AppLayout>
          <SpecialistWoundUpdateProvider>
            <SpecialistWoundAddUpdateImage />
          </SpecialistWoundUpdateProvider>
        </AppLayout>,
      },
      {
        path: 'wound/add-update/conduct',
        element: <AppLayout>
          <SpecialistWoundUpdateProvider>
            <SpecialistWoundAddUpdateConduct />
          </SpecialistWoundUpdateProvider>
        </AppLayout>,
      },
    ],
  },

  // Protected patient routes
  {
    path: '/patient',
    element: <UserContextProvider><AuthGuard /></UserContextProvider>,
    children: [
      {
        path: 'menu',
        element: <AppLayout><PatientMenu /></AppLayout>,
      },
      {
        path: 'notifications',
        element: <AppLayout><PatientNotifications /></AppLayout>,
      },
      {
        path: 'wounds',
        element: <AppLayout><PatientWounds /></AppLayout>,
      },
      {
        path: 'wound/detail',
        element: <AppLayout><PatientWoundDetail /></AppLayout>,
      },
      {
        path: 'wound/record-detail',
        element: <AppLayout><PatientWoundRecordDetail /></AppLayout>,
      },
      {
        path: 'wound/add-update',
        element: <AppLayout>
          <PatientWoundUpdateProvider>
            <PatientWoundAddUpdate />
          </PatientWoundUpdateProvider>
        </AppLayout>,
      },
      {
        path: 'wound/add-update/image',
        element: <AppLayout>
          <PatientWoundUpdateProvider>
            <PatientWoundAddUpdateImage />
          </PatientWoundUpdateProvider>
        </AppLayout>,
      },
      {
        path: 'wound/add-update/conduct',
        element: <AppLayout>
          <PatientWoundUpdateProvider>
            <PatientWoundAddUpdateConduct />
          </PatientWoundUpdateProvider>
        </AppLayout>,
      },
    ],
  },
]);

export function App() {
  return (
    <main className="bg-primary">
      <SWRConfig value={{
        fetcher: async (url, args) => {
          console.log(url, args);
          let Auth = {};
          let token = localStorage.getItem("access_token")
          if (!!token) {
            Auth = {
              "headers": {
                "authorization" : "Bearer " + token 
              }
            }
          }
          return await axios.get(`${import.meta.env.VITE_SERVER_URL}${url}`, { credentials: 'include', ...Auth, ...args }).then(res => res.data)
        }
      }}>
        <RouterProvider router={router} />
      </SWRConfig>
    </main>
  );
}
