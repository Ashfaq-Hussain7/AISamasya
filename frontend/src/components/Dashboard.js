import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const disabilityOptions = [
    'Visual Impairment',
    'Hearing Impairment',
    'Motor Disability',
    'Learning Disorder',    
  ];

  const navigate = useNavigate();

  const toggleDisability = (disability) => {
    setSelectedDisabilities((prev) =>
      prev.includes(disability)
        ? prev.filter((d) => d !== disability)
        : [...prev, disability]
    );
  };

  const handleSubmit = async () => {
    try {
      // Send selected disabilities to the backend
    //   await axios.post('/api/submitDisabilities', { disabilities: selectedDisabilities });
  
      // Determine the route based on selected disabilities
      if (selectedDisabilities.includes('Visual Impairment')) {
        navigate('/visual');
      } else if (selectedDisabilities.includes('Hearing Impairment')) {
        navigate('/audial');
      } else {
        navigate('/general'); // Fallback route
      }
    } catch (error) {
      console.error('Error submitting disabilities:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-4">Select the disabilities that impact your learning experience:</p>
        <div className="space-y-4">
          {disabilityOptions.map((disability) => (
            <button
              key={disability}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-300 text-left
                ${selectedDisabilities.includes(disability) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => toggleDisability(disability)}
            >
              {disability}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selectedDisabilities.length === 0}
          className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg 
                     hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit and Continue
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
