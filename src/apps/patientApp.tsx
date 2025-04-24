import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '../guards/auth';
import LoginPage from '../routes//login/Login.tsx';
import '../globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
import { SWRConfig } from 'swr';
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import PatientWoundCreate from '@/routes/patientApp/wound/WoundCreate.tsx';
import PatientWoundAddUpdate from '@/routes/patientApp/wound/AddUpdate/WoundAddUpdate.tsx';
import PatientPatientsWounds from "@/routes/patientApp/patient/PatientWounds.tsx";
import PatientWoundDetail from "@/routes/patientApp/wound/WoundDetail.tsx";
import PatientWoundRecordDetail from "@/routes/patientApp/wound/WoundRecordDetail.tsx";
import PatientWoundAddUpdateImage from "@/routes/patientApp/wound/AddUpdate/WoundAddUpdateImage.tsx";
import PatientWoundAddUpdateConduct from "@/routes/patientApp/wound/AddUpdate/WoundAddUpdateConduct.tsx";
import {WoundUpdateProvider}  from "@/routes/patientApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        path: '/',
        element: (
            <UserContextProvider>
                <AuthGuard/>
            </UserContextProvider>
        ),
        children: [
            {
                path: '/patientApp/patient/wounds',
                element: (
                    <AppLayout>
                        <PatientPatientsWounds/>
                    </AppLayout>
                ),
            },
            {
                path: '/patientApp/wound/create',
                element: (
                    <AppLayout>
                        <PatientWoundCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/patientApp/wound/detail',
                element: (
                    <AppLayout>
                        <PatientWoundDetail/>
                    </AppLayout>
                ),
            },
            {
                path: '/patientApp/wound/record-detail',
                element:
                    <AppLayout>
                        <PatientWoundRecordDetail/>
                    </AppLayout>
            },
            {
                path: '/patientApp/wound/add-update',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <PatientWoundAddUpdate/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/patientApp/wound/add-update/image',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <PatientWoundAddUpdateImage/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/patientApp/wound/add-update/conduct',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <PatientWoundAddUpdateConduct/>
                        </WoundUpdateProvider>
                    </AppLayout>
            }
        ]
    }
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