import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '../guards/auth';
import LoginPage from '../routes/defaultApp/Login.tsx';
import '../globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
import { SWRConfig } from 'swr';
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import WoundCreate from '@/routes/patientApp/wound/WoundCreate.tsx';
import WoundAddUpdate from '@/routes/patientApp/wound/AddUpdate/WoundAddUpdate.tsx';
import PatientsWounds from "@/routes/patientApp/patient/PatientWounds.tsx";
import WoundDetail from "@/routes/patientApp/wound/WoundDetail.tsx";
import WoundRecordDetail from "@/routes/patientApp/wound/WoundRecordDetail.tsx";
import WoundAddUpdateImage from "@/routes/patientApp/wound/AddUpdate/WoundAddUpdateImage.tsx";
import WoundAddUpdateConduct from "@/routes/patientApp/wound/AddUpdate/WoundAddUpdateConduct.tsx";
import {WoundUpdateProvider}  from "@/routes/patientApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import Menu from '@/routes/patientApp/Menu.tsx';

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
                path: '/menu',
                element: (
                    <AppLayout>
                        <Menu/>
                    </AppLayout>
                ),
            },
            {
                path: '/patient/wounds',
                element: (
                    <AppLayout>
                        <PatientsWounds/>
                    </AppLayout>
                ),
            },
            {
                path: '/wound/create',
                element: (
                    <AppLayout>
                        <WoundCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/wound/detail',
                element: (
                    <AppLayout>
                        <WoundDetail/>
                    </AppLayout>
                ),
            },
            {
                path: '/wound/record-detail',
                element:
                    <AppLayout>
                        <WoundRecordDetail/>
                    </AppLayout>
            },
            {
                path: '/wound/add-update',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <WoundAddUpdate/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/wound/add-update/image',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <WoundAddUpdateImage/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/wound/add-update/conduct',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <WoundAddUpdateConduct/>
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