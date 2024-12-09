import React from 'react';
import { useLocation } from 'react-router-dom';

const BlindPage = () => {
  const location = useLocation();
  const { name, disabilities } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {name}!</h1>
        <p className="text-gray-600 mb-4">
          You have selected the following disabilities:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {disabilities.map((disability, index) => (
            <li key={index}>{disability}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlindPage;
