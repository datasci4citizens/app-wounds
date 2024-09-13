import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserCreate from './routes/user/UserCreate.tsx';
import './globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserCreate />
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
