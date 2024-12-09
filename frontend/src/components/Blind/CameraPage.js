import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const location = useLocation();

  // States
  const [sceneDescription, setSceneDescription] = useState('');
  const [hasLearning, setHasLearning] = useState(false);
  const [learningContent, setLearningContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showLearning, setShowLearning] = useState(false);

  // Control states
  const [sceneDescribed, setSceneDescribed] = useState(false); // To ensure scene is narrated once
  const [learningNarrated, setLearningNarrated] = useState(false); // Ensure learning is narrated once
  const [showButtons, setShowButtons] = useState(false); // Show Yes/No buttons after description

  const captureAfter = location.state?.captureAfter || 3000; // Default capture time

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        // Start camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Capture after delay
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

    // Convert image to blob
    const imageData = canvas.toDataURL('image/png');
    const blob = dataURLtoBlob(imageData);

    // Turn off camera immediately after capturing
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

      // Narrate the scene description once
      if (!sceneDescribed && data.scene_description) {
        setSceneDescribed(true);
        narrateText(data.scene_description, () => {
          // After narration finishes, show buttons
          setShowButtons(true);
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
    console.log('User said no, no learning content will be displayed or narrated.');
    // Do nothing else
  };

  const handleBackToHome = () => {
    window.location.href = 'http://localhost:3000/visual';
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {isProcessing && <p className="mb-4">Processing image, please wait...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isProcessing && !error && sceneDescription && (
        <div className="mb-4 text-center max-w-md">
          <p>{sceneDescription}</p>
          {hasLearning && !showLearning && showButtons && (
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleYes}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
              >
                No
              </button>
            </div>
          )}
        </div>
      )}

      {showLearning && learningContent && (
        <div className="mb-4 text-center max-w-md bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">More Information:</h2>
          <p>{learningContent}</p>
        </div>
      )}

      <video ref={videoRef} autoPlay className="hidden"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <button
        onClick={handleBackToHome}
        className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
      >
        Back to Home
      </button>
    </div>
  );
};

export default CameraPage;
