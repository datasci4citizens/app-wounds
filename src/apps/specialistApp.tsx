import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from '../guards/auth.tsx';
import LoginPage from '../routes/login/Login.tsx';
import '../globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
import { SWRConfig } from 'swr';
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import SpecialistWoundCreate from '@/routes/specialistApp/wound/WoundCreate.tsx';
import SpecialistWoundAddUpdate from '@/routes/specialistApp/wound/AddUpdate/WoundAddUpdate.tsx';
import SpecialistPatientsPage from "@/routes/specialistApp/patient/PatientList.tsx";
import SpecialistPatientsWounds from "@/routes/specialistApp/patient/PatientWounds.tsx";
import SpecialistWoundDetail from "@/routes/specialistApp/wound/WoundDetail.tsx";
import SpecialistWoundRecordDetail from "@/routes/specialistApp/wound/WoundRecordDetail.tsx";
import SpecialistWoundAddUpdateImage from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateImage.tsx";
import SpecialistWoundAddUpdateConduct from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateConduct.tsx";
import SpecialistPatientCreate  from "@/routes/specialistApp/patient/PatientCreate.tsx";
import {WoundUpdateProvider}  from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";

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
                path: '/specialistApp/patient/create',
                element: (
                    <AppLayout>
                        <SpecialistPatientCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/patient/list',
                element: (
                    <AppLayout>
                        <SpecialistPatientsPage/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/patient/wounds',
                element: (
                    <AppLayout>
                        <SpecialistPatientsWounds/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/create',
                element: (
                    <AppLayout>
                        <SpecialistWoundCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/detail',
                element: (
                    <AppLayout>
                        <SpecialistWoundDetail/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/record-detail',
                element:
                    <AppLayout>
                        <SpecialistWoundRecordDetail/>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <SpecialistWoundAddUpdate/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update/image',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <SpecialistWoundAddUpdateImage/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update/conduct',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <SpecialistWoundAddUpdateConduct/>
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
