import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserCreate from './routes/user/UserCreate.tsx'
import UserList from './routes/user/UserList.tsx'
import Menu from './routes/Menu.tsx'
import './globals.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Menu />
  },
  {
    path: '/user/create',
    element: <UserCreate />
  },
  {
    path: '/user/list',
    element: <UserList />
  }
])

export function App() {
  return <RouterProvider router={router} />;
}
