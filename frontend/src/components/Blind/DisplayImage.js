import React from 'react';
import { useLocation } from 'react-router-dom';

const DisplayImage = () => {
  const location = useLocation();
  const { image } = location.state || {};

  return (
    <div className="h-screen bg-black flex justify-center items-center p-6">
      <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6">Captured Image</h1>
        {image ? (
          <img src={image} alt="Captured Scene" className="w-96 h-auto rounded-lg shadow-md" />
        ) : (
          <p className="text-xl text-gray-700">No image captured.</p>
        )}
      </div>
    </div>
  );
};

export default DisplayImage;
