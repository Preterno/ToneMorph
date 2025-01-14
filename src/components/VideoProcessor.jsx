import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import VideoSlider from "./VideoSlider";
import axios from "axios";

const VideoProcessor = ({ initialFile }) => {
  const { token } = useAuth();
  const [originalFile, setOriginalFile] = useState(null);
  const [processedFile, setProcessedFile] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialFile) {
      if (originalFile) URL.revokeObjectURL(originalFile);
      if (processedFile) URL.revokeObjectURL(processedFile);

      const objectUrl = URL.createObjectURL(initialFile);
      setOriginalFile(objectUrl);
      setCurrentFile(initialFile);
    }
    return () => {
      if (originalFile) URL.revokeObjectURL(originalFile);
      if (processedFile) URL.revokeObjectURL(processedFile);
    };
  }, [initialFile]);

  const processVideo = async () => {
    if (!currentFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", currentFile);

    try {
      const base_url = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${base_url}api/process-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      if (processedFile) {
        URL.revokeObjectURL(processedFile);
      }

      const blob = response.data;
      setProcessedFile(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error processing video:", error);
      alert("Error processing video. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Process Button */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={processVideo}
          disabled={isProcessing || !originalFile}
          className={`w-full py-2 px-4 text-2xl rounded-lg text-white font-medium transition-colors
            ${
              isProcessing || !originalFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-slate-950 active:bg-slate-950"
            }`}
        >
          {isProcessing ? "Processing..." : "Process Video"}
        </button>
      </div>

      {/* Video Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preview</h2>
        {isProcessing ? (
          <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-950 border-t-transparent"></div>
          </div>
        ) : (
          <VideoSlider
            beforeVideo={originalFile}
            afterVideo={processedFile}
          />
        )}
      </div>
    </div>
  );
};

export default VideoProcessor;
