import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '../guards/auth.tsx';
import LoginPage from '../routes/defaultApp/Login.tsx';
import '../globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
import { SWRConfig } from 'swr';
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import WoundCreate from '@/routes/specialistApp/wound/WoundCreate.tsx';
import WoundAddUpdate from '@/routes/specialistApp/wound/AddUpdate/WoundAddUpdate.tsx';
import PatientsPage from "@/routes/specialistApp/patient/PatientList.tsx";
import PatientsWounds from "@/routes/specialistApp/patient/PatientWounds.tsx";
import WoundDetail from "@/routes/specialistApp/wound/WoundDetail.tsx";
import WoundRecordDetail from "@/routes/specialistApp/wound/WoundRecordDetail.tsx";
import WoundAddUpdateImage from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateImage.tsx";
import WoundAddUpdateConduct from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateConduct.tsx";
import PatientCreate  from "@/routes/specialistApp/patient/PatientCreate.tsx";
import {WoundUpdateProvider}  from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import Menu from "@/routes/specialistApp/Menu.tsx"

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
                path: '/specialist-menu',
                element: (
                    <AppLayout>
                        <Menu/>
                    </AppLayout>
                ),
            },
            {
                path: '/patient/create',
                element: (
                    <AppLayout>
                        <PatientCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/patient/list',
                element: (
                    <AppLayout>
                        <PatientsPage/>
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
