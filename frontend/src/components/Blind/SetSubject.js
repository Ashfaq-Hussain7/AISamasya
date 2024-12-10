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
    } else {
      console.error('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const speakText = (text) => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      // Create a new SpeechSynthesisUtterance object
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optional: Customize speech properties
      utterance.rate = 1; // Speaking rate (1 is normal)
      utterance.pitch = 1; // Pitch (1 is normal)
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-Speech not supported in this browser.');
    }
  };

  const handleSubmit = async () => {
    try {
      // First, speak out the transcribed text
      if (transcription) {
        speakText(`Your selected subject is: ${transcription}`);
      }

      // Send transcription to the backend
      const response = await axios.post('http://127.0.0.1:5000/api/scrap_subject', { subject: transcription });
      console.log('Backend response:', response.data);
      
      // Navigate to the next page with data from the backend
      navigate('/learn', { state: { name, data: response.data } });
    } catch (error) {
      console.error('Error submitting transcription:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-6">
    <div className="w-full max-w-full h-full bg-white rounded-lg shadow-md p-8 flex flex-col justify-between">
      <h1 className="text-6xl md:text-9xl font-bold text-gray-800 mb-6 text-center">
        Welcome, {name}!
      </h1>
  
      <div className="mt-6 flex-grow">
        <p className="text-lg md:text-2xl text-gray-700 text-center">
          <strong>Transcription:</strong> {transcription || 'Listening...'}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!transcription}
        aria-label="Submit transcribed subject and proceed to learning page"
        className="text-6xl md:text-6xl w-full mt-6 bg-green-500 text-white py-8 rounded-lg
                   hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Submit and Continue
      </button>
    </div>
  </div>
  );
};

export default SetSubject;