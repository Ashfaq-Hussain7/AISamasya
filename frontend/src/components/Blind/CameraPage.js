import React, { useRef, useEffect, useState } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [sceneDescription, setSceneDescription] = useState('');
  const [hasLearning, setHasLearning] = useState(false);
  const [learningContent, setLearningContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showLearning, setShowLearning] = useState(false);

  // Control states
  const [sceneDescribed, setSceneDescribed] = useState(false);
  const [learningNarrated, setLearningNarrated] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const captureAfter = location.state?.captureAfter || 3000;

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setTimeout(() => {
          captureImage(stream);
        }, captureAfter);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Error accessing camera');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [captureAfter]);

  const captureImage = async (stream) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    const blob = dataURLtoBlob(imageData);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    await sendImageToAPI(blob);
  };

  const dataURLtoBlob = (dataURL) => {
    const parts = dataURL.split(',');
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  };

  const sendImageToAPI = async (blob) => {
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('image', blob, 'captured_image.png');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/scene-description', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || 'Unknown error occurred');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      setSceneDescription(data.scene_description || '');
      setHasLearning(data.has_learning || false);
      setLearningContent(data.learning || '');
      setIsProcessing(false);

      if (!sceneDescribed && data.scene_description) {
        setSceneDescribed(true);
        narrateText(data.scene_description, () => {
          setShowButtons(true); // Show buttons after description
        });
      }
    } catch (err) {
      console.error('Error calling the API:', err);
      setError('Error calling the API');
      setIsProcessing(false);
    }
  };

  const narrateText = (text, onEndCallback) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.onend = onEndCallback;
    window.speechSynthesis.speak(utter);
  };

  const handleYes = () => {
    if (hasLearning && !learningNarrated) {
      setLearningNarrated(true);
      setShowLearning(true);
      narrateText(learningContent, () => {});
    }
  };

  const handleNo = () => {
    window.location.reload();
    console.log('User said no, no learning content will be displayed or narrated.');
  };

  const handleBackToHome = () => {
    navigate('/visual')
  };

  const handleHover = (text) => {
    // Stop any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    // Narrate the button text
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="h-screen flex p-6 bg-black text-white transition-all duration-200 ease-in-out">
      {/* Left Half for Scene Description */}

      <div className="flex-1 flex flex-col items-start justify-center p-6 overflow-auto	">
        {isProcessing && <p className="mb-6 text-6xl">Processing image, please wait...</p>}
        {error && <p className="text-red-500 mb-6 text-4xl">{error}</p>}

        {!isProcessing && !error && sceneDescription && (
          <div className="mb-8 text-center max-w-2xl">
            <p className="text-5xl">{sceneDescription}</p>
            {hasLearning && !showLearning && showButtons && (
              <div className="flex flex-col items-start mt-10 space-y-4">
                {/* No Yes/No buttons here initially */}
              </div>
            )}
          </div>
        )}

        {showLearning && learningContent && (
          <div className="mb-8 text-center max-w-2xl bg-white text-black p-8 rounded-xl shadow-lg transition-all duration-500">
            <h2 className="font-bold text-5xl mb-4">More Information:</h2>
            <p className="text-4xl">{learningContent}</p>
          </div>
        )}
      </div>

      {/* Right Half for Buttons */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div className="flex flex-col space-y-4 h-full">
          {/* Buttons appear after the scene description */}
          {showButtons && (
            <>
              <button
                onMouseEnter={() => handleHover('Yes button, click to continue')}
                onClick={handleYes}
                className="w-full h-1/3 bg-green-600 text-white font-extrabold text-7xl rounded-xl hover:bg-green-700 transform hover:scale-110 transition-transform duration-200"

              >
                Yes
              </button>
              <button
                onMouseEnter={() => handleHover('No button, to stop')}
                onClick={handleNo}
                className="w-full h-1/3 bg-red-600 text-white font-extrabold text-7xl rounded-xl hover:bg-red-700 transform hover:scale-110 transition-transform duration-300"

              >
                No
              </button>
              <button
                onMouseEnter={() => handleHover('Back to Home button')}
                onClick={handleBackToHome}
                className="w-full h-1/3 bg-blue-600 text-white font-extrabold text-7xl rounded-xl flex items-center justify-center hover:bg-blue-700 transform hover:scale-110 transition-transform duration-300"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>

      <video ref={videoRef} autoPlay className="hidden"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default CameraPage;
