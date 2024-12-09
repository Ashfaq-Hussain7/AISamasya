import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BlindPage = () => {
  const [speechText, setSpeechText] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [audioReady, setAudioReady] = useState(false); // Track if the audio is allowed to play
  const blupSound = useRef(new Audio('C:/Users/ashfa/OneDrive/Desktop/AISamasya/frontend/src/bloop-2-186531.mp3'));
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize speech recognition and text-to-speech
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
          .toLowerCase();
        setSpeechText(transcript);
        handleTopicSelection(transcript); // Process the recognized input
      };

      setRecognition(recognitionInstance);
    }

    const synthesis = window.speechSynthesis;
    if (synthesis) {
      setSpeechSynthesis(synthesis);
    }

    // Speak the initial greeting
    const greetUser = () => {
      const greeting = "Welcome to the Blind Assistance App. Please tell me what topic you'd like to learn.";
      speakText(greeting);
    };

    greetUser();
  }, []);

  const speakText = (text) => {
    if (speechSynthesis) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleTopicSelection = (input) => {
    stopListening();
    if (input.includes('mathematics')) {
      speakText('Navigating to the Mathematics learning page.');
      navigate('/learn-mathematics');
    } else if (input.includes('science')) {
      speakText('Navigating to the Science learning page.');
      navigate('/learn-science');
    } else if (input.includes('history')) {
      speakText('Navigating to the History learning page.');
      navigate('/learn-history');
    } else {
      speakText("I couldn't understand that. Please try again.");
      startListening(); // Restart listening if the input is unclear
    }
  };

  const startCameraAndCaptureImage = () => {
    navigate('/camera', { state: { captureAfter: 3000 } }); // Navigate to CameraPage with a 3-second capture delay
  };

  const handleHover = (text) => {
    if (audioReady) {
      blupSound.current.play(); // Play the blup sound only after interaction
    }
    speakText(text); // Speak the text when hovering over elements
  };

  const enableAudio = () => {
    setAudioReady(true); // Mark audio as ready to play
  };

  return (
    <div
      className="h-screen bg-black grid grid-cols-2 grid-rows-2 gap-4 p-6"
      onClick={enableAudio} // Ensure user interaction enables audio
    >
      {/* Topic Selection */}
      <div
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-[#4B4376] to-[#4B4376] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover('This is the topic selection feature.')}
        onClick={startListening}
      >
        <h1 className="text-3xl font-bold text-white">Topic Selection</h1>
      </div>

      {/* Scene Capture */}
      <div
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-[#0A5EB0] to-[#0A5EB0] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover('This is the scene capturing feature.')}
        onClick={startCameraAndCaptureImage}
      >
        <h1 className="text-3xl font-bold text-white">Scene Capture</h1>
      </div>

      {/* Document Summarizer */}
      <div
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-[#5ba300] to-[#5ba300] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover('This is the document summarizer feature.')}
        onClick={() => {
          speakText('Navigating to the document summarizer.');
          navigate('/doc-summarizer');
        }}
      >
        <h1 className="text-3xl font-bold text-white">Doc Summarizer</h1>
      </div>

      {/* Note Making */}
      <div
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-[#c44601] to-[#c44601] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover('This is the note-making feature.')}
        onClick={() => {
          speakText('Navigating to the note-making tool.');
          navigate('/note-making');
        }}
      >
        <h1 className="text-3xl font-bold text-white">Note Making</h1>
      </div>
    </div>
  );
};

export default BlindPage;
