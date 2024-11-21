// import Cookies from 'js-cookie';
import GoogleButton from 'react-google-button';
// import { useNavigate } from 'react-router-dom';
// import useSWR from 'swr';

const LoginPage = () => {
	// const [user, setUser] = useState([]);
	// const [profile, setProfile] = useState([]);
    // const navigate = useNavigate();
	//
	// const fetcher = (...args: [RequestInfo, RequestInit?]) => fetch(...args).then((res) => res.json());
	// const { data, error, isLoading } = useSWR('http://localhost:8000/patients', fetcher)
	//
	// const onLoginError = () => {
	// 	console.log('Failed to sign in with google');
	// };
	//
	// function handleCredentialResponse(response: { code: string }) {
	// 	const accessToken = response.code;
	//
	// 	console.log('=== Credential response ===')
	// 	console.log(response)
	// 	console.log(`${import.meta.env.SERVER_URL}`)
	//
    // 	navigate("/registro-paciente");
	//
	// 	fetch(`${import.meta.env.SERVER_URL}/auth/login/google`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'X-Requested-With': 'XMLHttpRequest',
	// 		},
	// 		body: JSON.stringify({ access_token: accessToken }),
	// 		credentials: 'include',
	// 	})
	// 		.then((response) => {
	// 			if (!response.ok) {
	// 				throw new Error('Error while authenticating with server');
	// 			}
	// 			return response.json();
	// 		})
	// 		.then((data) => {
	// 			console.log('Access token:', data.access_token);
	// 			saveAccessToken(data.access_token);
	// 		})
	// 		.catch((error) => console.error('Error:', error));
	// }
	//
	// function fetchProtectedEndpoint() {
	// 	const token = Cookies.get('accessToken');
	// 	fetch('http://localhost:8000/users/me', {
	// 		method: 'GET',
	// 		headers: {
	// 			Accept: 'application/json',
	// 			'Content-Type': 'application/json',
	// 			Authorization: `Bearer ${token}`,
	// 		},
	// 	})
	// 		.then((response) => {
	// 			if (!response.ok) {
	// 				throw new Error('Access denied');
	// 			}
	// 			return response.json();
	// 		})
	// 		.then((data) => {
	// 			console.log('Data:', data);
	// 			return data;
	// 		})
	// 		.catch((error) => {
	// 			console.error('Error:', error);
	// 		});
	// }

	// function saveAccessToken(accessToken: string) {
	// 	Cookies.set('accessToken', accessToken, { expires: 1 });
	// 	console.log('Token saved to cookie!');
	// }

	function login() {
		// window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/google`;
		window.location.href = "http://localhost:8000/auth/login/google";
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-primary">
			<img
				src="/medications.svg"
				alt="Logo medicamentos"
				className="w-64 h-64 rounded-full object-contain"
			/>
			<div className="mt-40">
				<GoogleButton label="Entrar com o Google" onClick={login} />
			</div>
		</div>
	);
};

export default LoginPage;