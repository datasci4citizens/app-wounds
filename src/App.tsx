import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserCreate from './routes/user/UserCreate.tsx';
import UserList from './routes/user/UserList.tsx';
import PatientCreate from './routes/patient/PatientCreate.tsx';
import WoundCreate from './routes/wound/WoundCreate.tsx';
import WoundUpdate from './routes/wound/WoundUpdate.tsx';
import Menu from './routes/Menu.tsx';
import './globals.css';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Menu />,
	},
	{
		path: '/user/create',
		element: <UserCreate />,
	},
	{
		path: '/patient/create',
		element: <PatientCreate />,
	},
	{
		path: '/user/list',
		element: <UserList />,
	},
	{
		path: '/wound/create',
		element: <WoundCreate />,
	},
	{
		path: '/wound/update',
		element: <WoundUpdate />,
	},
]);

export function App() {
	return (
		<main className="bg-primary h-screen flex flex-col justify-end overflow-hidden">
      <div className='overflow-auto'>
        <div className='h-12' />
      <RouterProvider router={router} />
      </div>
		</main>
	);
}
