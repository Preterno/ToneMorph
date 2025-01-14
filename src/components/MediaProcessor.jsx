import React, { useState } from "react";
import ImageProcessor from "./ImageProcessor";
import VideoProcessor from "./VideoProcessor";
import showToast from "./Notification";

const MediaProcessor = () => {
  const [mediaType, setMediaType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    handleFileUpload(event);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const maxSize = 20 * 1024 * 1024;

    if (!file) {
      resetFileSelection();
      return;
    }

    if (file.size === 0) {
      handleInvalidFile("Please upload a valid image or video file");
      return;
    }

    if (file.size > maxSize) {
      handleInvalidFile("File size exceeds the 20MB limit");
      return;
    }

    if (file.type.startsWith("image/")) {
      setMediaType("image");
      setSelectedFile(file);
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
      setSelectedFile(file);
    } else {
      handleInvalidFile("Please upload an image or video file");
    }
  };

  const resetFileSelection = () => {
    setMediaType(null);
    setSelectedFile(null);
  };

  const handleInvalidFile = (message) => {
    showToast(message, { type: "error" });
    document.querySelector('input[type="file"]').value = null;
    resetFileSelection();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2.5xl font-semibold mb-4 text-gray-800">
            Upload Media
          </h2>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="block w-full text-base text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:font-semibold
              file:bg-gray-100 file:text-black
              hover:file:bg-gray-200
              file:text-base
              border border-gray-300 rounded-lg cursor-pointer file:cursor-pointer"
          />
        </div>

        {mediaType === "image" && selectedFile && (
          <ImageProcessor initialFile={selectedFile} />
        )}
        {mediaType === "video" && selectedFile && (
          <VideoProcessor initialFile={selectedFile} />
        )}
      </div>
    </div>
  );
};

export default MediaProcessor;
