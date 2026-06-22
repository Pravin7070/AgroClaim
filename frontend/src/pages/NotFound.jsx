import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="text-center animate-fade-in-up">
                <div className="text-9xl font-black text-gray-200 mb-4 select-none">404</div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
}
