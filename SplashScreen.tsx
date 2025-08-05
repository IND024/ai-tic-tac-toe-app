import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 selection:bg-cyan-400/20">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from { transform: scale(0.8); }
            to { transform: scale(1); }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-in-out forwards;
          }
          .animate-zoom-in {
            animation: zoomIn 1s ease-in-out forwards;
          }
          .animate-slide-up-delay-1 {
            animation: slideUp 0.8s ease-in-out 0.5s forwards;
            opacity: 0;
          }
          .animate-slide-up-delay-2 {
            animation: slideUp 0.8s ease-in-out 1s forwards;
            opacity: 0;
          }
        `}
      </style>
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter animate-zoom-in">
          <span className="text-cyan-400">AI</span> Tic Tac <span className="text-amber-400">Toe</span>
        </h1>
        <div className="mt-8 animate-slide-up-delay-2">
            <div className="flex items-center justify-center space-x-3">
                 <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-2xl font-medium text-gray-300">Loading Game...</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;