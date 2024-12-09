import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, StopCircle, X } from 'lucide-react';

// Dummy API for conversation simulation
const dummyConversationAPI = {
    async askMore(query) {
      const response = await fetch('http://localhost:5000/ask_more/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return response.json();
    },
  };
  

const SubjectInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { name, data } = location.state || {}; 
    
    const [description, setDescription] = useState(data.description || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [conversationHistory, setConversationHistory] = useState([]);
    
    const recognitionRef = useRef(null);
    const speechRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const isProcessingRef = useRef(false);

    const initializeSpeechRecognition = useCallback(() => {
      if (window.webkitSpeechRecognition) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
  
        recognition.onresult = (event) => {
          const results = event.results;
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < results.length; ++i) {
            if (results[i].isFinal) {
              finalTranscript += results[i][0].transcript;
            }
          }

          if (finalTranscript.trim()) {
            // Clear any existing silence timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }

            // Set a new silence timer
            silenceTimerRef.current = setTimeout(() => {
              if (!isProcessingRef.current) {
                handleQuerySubmission(finalTranscript);
              }
            }, 5000);

            setTranscript(finalTranscript);
          }
        };
  
        recognition.onerror = (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        };
  
        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };
  
        return recognition;
      }
      return null;
    }, []);
  
    const playTextToSpeech = useCallback((text) => {
      return new Promise((resolve) => {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsListening(false);
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      });
    }, []);
  
    useEffect(() => {
      const recognition = initializeSpeechRecognition();
      recognitionRef.current = recognition;
  
      return () => {
        if (recognition) {
          recognition.stop();
        }
        window.speechSynthesis.cancel();
      };
    }, [initializeSpeechRecognition]);
    
    useEffect(() => {
      setConversationHistory(prev => [...prev, { type: 'system', text: description }]);
    }, []);
  
    const handleQuerySubmission = async (query) => {
      // Prevent multiple simultaneous processing
      if (isProcessingRef.current) return;
      
      isProcessingRef.current = true;
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Clear the current transcript
      setTranscript('');
      
      // Add user query to conversation history
      setConversationHistory(prev => [...prev, { type: 'user', text: query }]);
      
      try {
        // Get AI response
        const response = await dummyConversationAPI.askMore(query);
        
        // Add AI response to conversation history
        setConversationHistory(prev => [...prev, { type: 'ai', text: response.info }]);
        
        // Play AI response
        await playTextToSpeech(response.info);
        
        // Restart listening after response
        setIsListening(true);
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Error processing query:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };
  
    const handleStartListening = () => {
    if (!isListening) {
          setIsListening(true);
        
          setTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
    else{
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();
          }
    }
    };
  
    const handleStopAudio = () => {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      
      // Immediately start listening
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    };
  
    const handleQuitConversation = () => {
      // Complete stop of all audio and recognition
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Reset all states
      setIsPlaying(false);
      setIsListening(false);
      setConversationHistory([]);
      setTranscript('');
      
      // Play goodbye message
      const utterance = new SpeechSynthesisUtterance("Goodbye! Thank you for chatting.");
      window.speechSynthesis.speak(utterance);
      
      // Navigate away
      navigate('/subject_b');
    };
  
    useEffect(() => {
      // Automatically start listening after initial description
      if (description) {
        playTextToSpeech(description).then(() => {
          setIsListening(true);
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        });
      }
    }, [description, playTextToSpeech]);
  
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">    
          {/* Main Content Area */}
          <div className="flex flex-grow overflow-hidden">
            {/* Conversation History Column - Expanded Width */}
            <div className="w-1/2 p-8 overflow-y-auto bg-white border-r border-gray-200">
              <h2 className="text-3xl font-semibold text-gray-700 mb-8">
                Conversation History
              </h2>
              <div className="space-y-6">
                {conversationHistory.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl shadow-md ${
                      entry.type === 'user' 
                        ? 'bg-blue-50 text-right' 
                        : entry.type === 'ai' 
                        ? 'bg-green-50' 
                        : 'bg-gray-100 italic'
                    }`}
                  >
                    <p className="text-6xl font-medium text-gray-800">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
    
            {/* Controls and Transcript Column - Reduced Width */}
            <div className="w-1/2 p-8 flex flex-col space-y-6">
              {/* Transcript Section */}
              {transcript && (
                <div className="mb-8 p-6 bg-yellow-50 rounded-2xl shadow-md">
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Transcript</h3>
                  <p className="text-2xl text-gray-800">{transcript}</p>
                </div>
              )}
    
              {/* Control Buttons - Large and Full Height */}
              <div className="flex flex-col flex-grow space-y-6">
                {isPlaying && (
                  <button
                    onClick={handleStopAudio}
                    aria-label="Stop Audio and Continue Listening"
                    className="flex-grow w-full bg-red-500 text-white text-4xl py-10 rounded-2xl hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <StopCircle className="mr-6 w-16 h-16" /> Stop Audio
                  </button>
                )}
    
                {!isListening ? (
                  <button
                    onClick={handleStartListening}
                    aria-label="Start Microphone"
                    className="flex-grow w-full bg-blue-500 text-white text-4xl py-10 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                  >
                    <Mic className="mr-6 w-16 h-16" /> Start Mic
                  </button>
                ) : (
                  <button
                    onClick={handleStartListening}
                    aria-label="Mic is Listening"
                    className="flex-grow w-full bg-green-500 text-white text-4xl py-10 rounded-2xl hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <Mic className="mr-6 w-16 h-16" /> Mic Listening
                  </button>
                )}
    
                <button
                  onClick={handleQuitConversation}
                  aria-label="Quit Conversation"
                  className="flex-grow w-full bg-gray-500 text-white text-4xl py-10 rounded-2xl hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <X className="mr-6 w-16 h-16" /> Quit Conversation
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};

export default SubjectInfo;