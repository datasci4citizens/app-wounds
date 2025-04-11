import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './guards/auth';
import LoginPage from './routes//login/Login.tsx';
import WoundCreate from './routes/specialistApp/wound/WoundCreate.tsx';
import WoundAddUpdate from './routes/specialistApp/wound/AddUpdate/WoundAddUpdate.tsx';
import './globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
//SPECIALIST ROUTES IMPORT
import PatientsPage from "@/routes/specialistApp/patient/PatientList.tsx";
import PatientsWounds from "@/routes/specialistApp/patient/PatientWounds.tsx";
import WoundDetail from "@/routes/specialistApp/wound/WoundDetail.tsx";
import WoundRecordDetail from "@/routes/specialistApp/wound/WoundRecordDetail.tsx";
import WoundAddUpdateImage from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateImage.tsx";
import WoundAddUpdateConduct from "@/routes/specialistApp/wound/AddUpdate/WoundAddUpdateConduct.tsx";
//PATIENT ROUTES IMPORT
import { SWRConfig } from 'swr';
import { PatientCreate } from "@/routes/specialistApp/patient/PatientCreate.tsx";
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";
import { WoundUpdateProvider } from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";

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
                        <PatientCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/patient/list',
                element: (
                    <AppLayout>
                        <PatientsPage/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/patient/wounds',
                element: (
                    <AppLayout>
                        <PatientsWounds/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/create',
                element: (
                    <AppLayout>
                        <WoundCreate/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/detail',
                element: (
                    <AppLayout>
                        <WoundDetail/>
                    </AppLayout>
                ),
            },
            {
                path: '/specialistApp/wound/record-detail',
                element:
                    <AppLayout>
                        <WoundRecordDetail/>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <WoundAddUpdate/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update/image',
                element:
                    <AppLayout>
                        <WoundUpdateProvider>
                            <WoundAddUpdateImage/>
                        </WoundUpdateProvider>
                    </AppLayout>
            },
            {
                path: '/specialistApp/wound/add-update/conduct',
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

export function App() {
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
