import GoogleButton from 'react-google-button';

const LoginPage = () => {
    function login() {
        window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/google`
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
            <img
                src="/wounds.svg"
                alt="Logo Cicatrizando"
                className="w-64 h-64 rounded-full object-contain"
            />
            <div className="mt-40">
                <GoogleButton label="Entrar com o Google" onClick={login}/>
            </div>
        </div>
    );
};

export default LoginPage;