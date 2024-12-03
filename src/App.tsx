import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthGuard } from './guards/auth';
import LoginPage from './routes/login/Login.tsx';
import WoundCreate from './routes/wound/WoundCreate.tsx';
import WoundAddUpdate from './routes/wound/WoundAddUpdate.tsx';
import './globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";
import PatientsPage from "@/routes/patient/PatientList.tsx";
import PatientsWounds from "@/routes/patient/PatientWounds.tsx";
import WoundDetail from "@/routes/wound/WoundDetail.tsx";
import WoundRecordDetail from "@/routes/wound/WoundRecordDetail.tsx";
import WoundAddUpdateImage from "@/routes/wound/WoundAddUpdateImage.tsx";
import WoundAddUpdateConduct from "@/routes/wound/WoundAddUpdateConduct.tsx";
import { SWRConfig } from 'swr';
import { PatientCreate } from "@/routes/patient/PatientCreate.tsx";
import { UserContextProvider } from "@/lib/hooks/use-user.tsx";

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
                        <WoundAddUpdate/>
                    </AppLayout>
            },
            {
                path: '/wound/add-update/image',
                element:
                    <AppLayout>
                        <WoundAddUpdateImage/>
                    </AppLayout>
            },
            {
                path: '/wound/add-update/conduct',
                element:
                    <AppLayout>
                        <WoundAddUpdateConduct/>
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
