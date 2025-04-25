import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import LoginPage from '../routes/defaultApp/Login.tsx';
import '../globals.css';
import { SWRConfig } from 'swr';
import { UserContextProvider } from '@/lib/hooks/use-user.tsx';
import { AuthGuard } from '@/guards/auth.tsx';
import AppLayout from '@/components/common/AppLayout.tsx';
import RoleSelection from '@/routes/defaultApp/RoleSelection.tsx';

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage/>,
    },
    {
        index: true,
        element: <Navigate to="/menu" />,
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
                path: '/role-selection',
                element: (
                    <AppLayout>
                        <RoleSelection/>
                    </AppLayout>
                ),
            },
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