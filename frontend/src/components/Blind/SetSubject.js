import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SetSubject = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state || {};
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        console.log('Voice recognition started...');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscription(transcript);
        console.log('Transcript:', transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsRecording(false);
        console.log('Voice recognition stopped.');
      };

      // Start recording as soon as the page loads
      recognition.start();

      // Clean up on component unmount
      return () => {
        recognition.stop();
      };
    } else {
      console.error('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const handleSubmit = async () => {
    try {
      // Send transcription to the backend
      const response = await axios.post('http://127.0.0.1:5000/api/scrap_subject', { subject:transcription });
      console.log('Backend response:', response.data);

      // Navigate to the next page with data from the backend
      navigate('/learn', { state: { name, data: response.data } });
    } catch (error) {
      console.error('Error submitting transcription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {name}!</h1>
        <p className="text-gray-600 mb-4">
          You have selected the following disabilities:
        </p>

        <div className="mt-6">
          <p className="text-gray-700">
            <strong>Transcription:</strong> {transcription || 'Listening...'}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!transcription}
          className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg 
                     hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Submit and Continue
        </button>
      </div>
    </div>
  );
};

export default SetSubject;
