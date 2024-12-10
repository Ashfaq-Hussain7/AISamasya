import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [hoverTimer, setHoverTimer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Set playing state while speaking
      if (!text.startsWith("Click or press")) {
        setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMouseEnter = useCallback((description) => {
    if (!isPlaying) {
      const timer = setTimeout(() => {
        speak(description);
      }, 1000);
      setHoverTimer(timer);
    }
  }, [isPlaying]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
      window.speechSynthesis.cancel();
    }
  }, [hoverTimer]);

  // Rest of your existing handlers remain the same
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setStatus("Uploading document...");
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setFile(file);
        speak("Document uploaded successfully. You can now ask questions about it.");
        setStatus("Document uploaded successfully");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setStatus(`Upload failed: ${error.message}`);
      speak("Upload failed. Please try again.");
    }
  };

  const startVoiceQuery = () => {
    if (!file) {
      speak("Please upload a document first");
      setStatus("Please upload a document first");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();
    setIsListening(true);
    setStatus("Listening for your question...");
    speak("Listening for your question");

    recognition.onresult = async (event) => {
      const query = event.results[0][0].transcript;
      setStatus(`Processing query: ${query}`);
      
      try {
        const response = await fetch("http://127.0.0.1:5000/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        
        if (data.status === "success") {
          setResponse(data.response);
          speak(data.response);
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setStatus(`Query failed: ${error.message}`);
        speak("Sorry, there was an error processing your question. Please try again.");
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setStatus(`Error: ${event.error}`);
      setIsListening(false);
      speak("Sorry, I couldn't hear you. Please try again.");
    };
  };

  const getSummary = async () => {
    if (!file) {
      speak("Please upload a document first");
      setStatus("Please upload a document first");
      return;
    }

    setStatus("Generating summary...");
    speak("Generating document summary");

    try {
      const response = await fetch("http://127.0.0.1:5000/summarize", {
        method: "POST"
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setResponse(data.summary);
        speak(data.summary);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setStatus(`Summary failed: ${error.message}`);
      speak("Sorry, there was an error generating the summary. Please try again.");
    }
  };

  const goHome = () => {
    navigate('/visual');
  };

  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setStatus("Speech recognition is not supported in this browser");
      return;
    }
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Message */}
        {status && (
          <div className="p-4 bg-blue-900 border-l-4 border-blue-500 text-blue-100 text-xl">
            {status}
          </div>
        )}

        {/* Main Controls */}
        <div className="space-y-8">
          {/* Upload Button */}
          <div
            onMouseEnter={() => handleMouseEnter("Click or press Enter to upload a document. Accepted formats are PDF, DOC, and DOCX.")}
            onMouseLeave={handleMouseLeave}
          >
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              aria-label="Upload document"
            />
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center w-full h-40 bg-blue-800 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
            >
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-2xl font-bold">Upload Document</span>
              {file && (
                <span className="text-lg mt-2 text-center px-4">
                  Current file: {file.name}
                </span>
              )}
            </label>
          </div>

          {/* Voice Query Button */}
          <button
            onClick={startVoiceQuery}
            disabled={isListening}
            onMouseEnter={() => handleMouseEnter("Click or press Enter to start voice recognition and ask questions about your document.")}
            onMouseLeave={handleMouseLeave}
            className={`w-full h-40 ${
              isListening ? 'bg-red-800' : 'bg-green-800 hover:bg-green-700'
            } text-white rounded-lg transition-colors duration-200 flex flex-col items-center justify-center`}
            aria-label="Start voice query"
          >
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-2xl font-bold">
              {isListening ? "Listening..." : "Ask a Question"}
            </span>
          </button>

          {/* Summarize Button */}
          <button
            onClick={getSummary}
            onMouseEnter={() => handleMouseEnter("Click or press Enter to generate a summary of your uploaded document.")}
            onMouseLeave={handleMouseLeave}
            className="w-full h-40 bg-purple-800 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex flex-col items-center justify-center"
            aria-label="Summarize document"
          >
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-2xl font-bold">Summarize Document</span>
          </button>

          {/* Navigation Button */}
          <button
            onClick={goHome}
            onMouseEnter={() => handleMouseEnter("Click or press Enter to go back")}
            onMouseLeave={handleMouseLeave}
            className="w-full h-40 bg-cyan-800 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200 flex flex-col items-center justify-center"
            aria-label="Switch to visual mode"
          >
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-2xl font-bold">Go Back</span>
          </button>
        </div>

        {/* Response Area */}
        {response && (
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Response:</h2>
            <p className="text-xl leading-relaxed">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;