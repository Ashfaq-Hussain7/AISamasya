import React, { useState, useEffect, useRef } from "react";

const NoteMakingPage = () => {
  const [isListening, setIsListening] = useState(false); // Controls mic recording
  const [timer, setTimer] = useState(0); // Timer value in seconds

  const recognitionRef = useRef(null); // Speech recognition ref
  const timerInterval = useRef(null); // Timer interval
  const canvasRef = useRef(null); // Canvas for frequency visualization
  const audioContextRef = useRef(null); // Audio context
  const animationIdRef = useRef(null); // Animation frame ID

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopVisualizing();
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      startTimer();
      startVisualizing();
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      pauseTimer();
      stopVisualizing();
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      pauseRecording();
    } else {
      startRecording();
    }
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerInterval.current);
  };

  const resetTimer = () => {
    clearInterval(timerInterval.current);
    setTimer(0);
  };

  const startVisualizing = () => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Number of frequency bins
      source.connect(analyser);

      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext("2d");

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on each frame

        const barWidth = canvas.width / bufferLength;
        let x = 0;

        dataArray.forEach((value) => {
          const barHeight = (value / 255) * canvas.height; // Normalize to canvas height

          canvasCtx.fillStyle = `rgb(${value + 100}, 50, 50)`;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight); // Draw each bar

          x += barWidth;
        });

        animationIdRef.current = requestAnimationFrame(draw);
      };

      draw();
    });
  };

  const stopVisualizing = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };

  const handleHover = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="h-screen bg-gray-100 grid grid-cols-2 grid-rows-2 gap-0 p-0">

      {/* First Quartile: Start Recording Button */}
      <div
        className="flex justify-center items-center p-0 border-r-4 border-b-4 border-gray-600 bg-gradient-to-r from-[#b71c1c] to-[#b71c1c] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover('Start recording')}
        onClick={toggleRecording}
      >
        <h1 className="text-3xl font-bold text-white">
          {isListening ? "Pause Recording" : "Start Recording"}
        </h1>
      </div>

      {/* Second Quartile: Stop Recording Button */}
      <div
        className="flex justify-center items-center p-0 border-b-4 border-l-4 border-gray-600 bg-gradient-to-r from-[#311b92] to-[#311b92] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover("Stop recording and reset timer")}
        onClick={() => {
          pauseRecording();
          resetTimer();
        }}
      >
        <h1 className="text-3xl font-bold text-white">Stop Recording</h1>
      </div>

      {/* Third Quartile: Frequency Bar Visualization */}
      <div className="flex justify-center items-center p-0 border-r-4 border-t-4 border-gray-600 bg-gradient-to-r from-[#0288d1] to-[#0288d1] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110">
        <canvas
          ref={canvasRef}
          width="100%"
          height="100%"
          className="border-none"
        ></canvas>
      </div>

      {/* Fourth Quartile: Home Button */}
      <div
        className="flex justify-center items-center p-0 border-t-4 border-l-4 border-gray-600 bg-gradient-to-r from-[#28a745] to-[#28a745] rounded-xl shadow-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
        onMouseEnter={() => handleHover("Go back to the home page")}
        onClick={() => (window.location.href = "/")}
      >
        <h1 className="text-3xl font-bold text-white">Home</h1>
      </div>

    </div>
  );
};

export default NoteMakingPage;
