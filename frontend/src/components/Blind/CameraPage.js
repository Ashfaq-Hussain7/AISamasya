import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const captureAfter = location.state?.captureAfter || 3000; // Default capture time
  const saveImageToLocal = (imageData) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'captured_image.png'; // Set the file name
    link.click();
  };

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Automatically capture image after the specified delay
        setTimeout(() => {
          captureImage(stream);
        }, captureAfter);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    const captureImage = (stream) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video) {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = canvas.toDataURL('image/png');

        // Save the captured image to the local system
        saveImageToLocal(imageData);

        // Navigate to the display image page with the image
        navigate('/display-image', { state: { image: imageData } });
      }

      // Stop the camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    startCamera();

    return () => {
      // Cleanup to stop the camera stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [captureAfter, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default CameraPage;
