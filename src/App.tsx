import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './routes/user/Login.tsx';
import UserCreate from './routes/user/UserCreate.tsx';
import UserList from './routes/user/UserList.tsx';
import PatientCreate from './routes/patient/PatientCreate.tsx';
import WoundCreate from './routes/wound/WoundCreate.tsx';
import WoundUpdate from './routes/wound/WoundUpdate1.tsx';
import Menu from './routes/Menu.tsx';
import './globals.css';
import AppLayout from "@/components/common/AppLayout.tsx";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import tissueTypes from '@/localdata/tissue-type.json'
import PatientsPage from "@/routes/patient/PatientList.tsx";
import PatientsWounds from "@/routes/patient/PatientWounds.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Menu/>,
    },
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        path: '/user/create',
        element: <UserCreate/>,
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
        path: '/user/list',
        element: <UserList/>,
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
        path: '/wound/update',
        element:
            <WoundUpdate
                exudateAmounts={exudateAmounts}
                exudateTypes={exudateTypes}
                tissueTypes={tissueTypes}
            />

    },
]);

export function App() {
    return (
        <main className="bg-primary h-screen flex flex-col justify-end overflow-hidden">
            <RouterProvider router={router}/>
        </main>
    );
}
