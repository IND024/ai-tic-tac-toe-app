import React from 'react';

const ProgressSaveIndicator: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-20 animate-fade-in-out"
    >
      <style>
        {`
          @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(10px); }
            15% { opacity: 1; transform: translateY(0); }
            85% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
          }
          .animate-fade-in-out {
            animation: fade-in-out 2.5s ease-in-out forwards;
          }
        `}
      </style>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-semibold">Progress Saved!</span>
    </div>
  );
};

export default ProgressSaveIndicator;
