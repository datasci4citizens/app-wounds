import { useState } from 'react';
import GoogleButton from 'react-google-button';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

const LoginPage = () => {
    const [user, setUser] = useState([]);
    const [profile, setProfile] = useState([]);
    const navigate = useNavigate();

    const fetcher = (...args) => fetch({ ...args, credentials: 'include' }).then(res => res.json())
    const { data, error, isLoading } = useSWR(`${import.meta.env.VITE_SERVER_URL}/patients`, fetcher)

    const onLoginSuccess = (credentialResponse) => {
        console.log(credentialResponse);
    };

    function login() {
        window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/google`
    }

    const onLoginError = () => {
        console.log('Failed to sign in with google');
    };

    async function sendRequest(url, { arg }: {
        arg: {
            name: string;
            email: string;
            phone_number: string;
            birthday: Date;
            is_smoker: boolean;
            drink_frequency: "never" | "sometimes" | "often";
            accept_tcle: boolean;
            observations?: string | undefined
        }
    }) {
        console.log('=== sending request to ===')
        console.log(url)
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(arg)
        }).then(res => res.json())
    }


    function handleCredentialResponse(response) {
        const accessToken = response.code;

        console.log(response);

        navigate("/registro-paciente");

        fetch(`${import.meta.env.VITE_SERVER_URL}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ access_token: accessToken }),
            credentials: 'include',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error while authenticating with server');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Access token:', data.access_token);
                saveAccessToken(data.access_token);
            })
            .catch((error) => console.error('Error:', error));
    }

    function fetchProtectedEndpoint() {
        fetch(`${import.meta.env.VITE_SERVER_URL}/users/me`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: Cookies.get('accessToken'),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Access denied');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Data:', data);
                return data;
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    function saveAccessToken(accessToken) {
        Cookies.set('accessToken', accessToken, { expires: 1 });
        console.log('Token saved to cookie!');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
            <img
                src="/wounds.svg"
                alt="Logo Cicatrizando"
                className="w-64 h-64 rounded-full object-contain"
            />
            <div className="mt-40">
                <GoogleButton label="Entrar com o Google" onClick={login} />
            </div>
        </div>
    );
};

export default LoginPage;