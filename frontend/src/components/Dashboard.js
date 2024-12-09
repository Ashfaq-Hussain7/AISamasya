import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [name, setName] = useState('');
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
      // Send selected disabilities and name to the backend
      // const response = await axios.post('/api/submitDisabilities', { 
      //   disabilities: selectedDisabilities, 
      //   name 
      // });

      // Determine the route based on selected disabilities
      if (selectedDisabilities.includes('Visual Impairment')) {
        navigate('/subject_b', { state: { name, disabilities: selectedDisabilities } });
      } else if (selectedDisabilities.includes('Hearing Impairment')) {
        navigate('/audial', { state: { name, disabilities: selectedDisabilities } });
      } else {
        navigate('/general', { state: { name, disabilities: selectedDisabilities } });
      }
    } catch (error) {
      console.error('Error submitting disabilities:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-4">Enter your name and select the disabilities that impact your learning experience:</p>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          disabled={selectedDisabilities.length === 0 || name.trim() === ''}
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
