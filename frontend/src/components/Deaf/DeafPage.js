import React, { useState } from "react";
import axios from "axios";

const DeafPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [info, setInfo] = useState(
    "This section is dedicated to users with hearing impairments."
  );

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      alert("Please upload a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      // Send the file to the backend for processing (audio-to-text or subtitle generation)
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Assuming the backend returns the transcribed text or a link to the subtitled video
      setTranscription(
        response.data.transcription || "File processed successfully!"
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the file.");
    }
  };

  const handlePromptSubmit = async () => {
    try {
      // Send the prompt to the backend for generating a response
      const response = await axios.post("/api/prompt", { prompt });

      // Assuming the backend returns detailed text information about the topic
      setTranscription(
        response.data.text || "Response generated successfully!"
      );
    } catch (error) {
      console.error("Error submitting prompt:", error);
      alert("Failed to process the prompt.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Hearing Impairment Assistance
        </h1>

        {/* Information Section */}
        <p className="text-gray-700 mb-4">{info}</p>

        {/* Prompt Input Section */}
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-gray-600 mb-2">
            Enter a topic to get detailed text:
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your topic..."
          />
          <button
            onClick={handlePromptSubmit}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label htmlFor="fileUpload" className="block text-gray-600 mb-2">
            Upload an audio or video file:
          </label>
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <button
            onClick={handleFileUpload}
            className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Upload and Process
          </button>
        </div>

        {/* Transcription/Response Display */}
        {transcription && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Result:</h2>
            <p className="text-gray-700">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeafPage.js;
