export const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const colors = {
    primary: 'border-t-primary-600',
    farmer: 'border-t-farmer-600',
    officer: 'border-t-officer-600',
  };

  return (
    <div className={`${sizes[size]} border-4 border-gray-200 ${colors[color]} rounded-full animate-spin`} />
  );
};

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center animate-fade-in-up">
      <div className="mb-6">
        <Spinner size="lg" />
      </div>
      <p className="text-xl font-semibold text-gray-700 mb-2">{message}</p>
      <p className="text-sm text-gray-500">Please wait a moment...</p>

      {/* Loading Dots Animation */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

export const LoadingCard = () => (
  <div className="card">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

export const LoadingOverlay = ({ message = 'Processing...' }) => (
  <div className="overlay animate-fade-in">
    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-scale-in">
      <Spinner size="lg" />
      <p className="mt-6 text-lg font-semibold text-gray-800">{message}</p>
      <p className="mt-2 text-sm text-gray-500">This won't take long</p>
    </div>
  </div>
);
