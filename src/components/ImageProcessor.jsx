import React, { useState, useEffect } from "react";
import showToast from "./Notification";
import { useAuth } from "../context/AuthContext";
import BeforeAfterSlider from "./BeforeAfterSlider";
import axios from "axios";

const ImageProcessor = ({ initialFile }) => {
  const { token } = useAuth();
  const [originalFile, setOriginalFile] = useState(null);
  const [processedFile, setProcessedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [controls, setControls] = useState({
    brightness: 1,
    sharpness: 1,
    contrast: 1.5,
  });

  const controlRanges = {
    brightness: { min: 0.5, max: 2, step: 0.1, label: "Brightness" },
    sharpness: { min: 0.5, max: 2, step: 0.1, label: "Sharpness" },
    contrast: { min: 1, max: 3, step: 0.1, label: "Contrast" },
  };

  useEffect(() => {
    if (initialFile) {
      console.log("Initial file received:", initialFile);
      if (originalFile) URL.revokeObjectURL(originalFile);
      if (processedFile) URL.revokeObjectURL(processedFile);

      const objectUrl = URL.createObjectURL(initialFile);
      console.log("Created Object URL for initial file:", objectUrl);
      setOriginalFile(objectUrl);
      setProcessedFile(null);
    }

    return () => {
      if (originalFile) URL.revokeObjectURL(originalFile);
      if (processedFile) URL.revokeObjectURL(processedFile);
    };
  }, [initialFile]);

  const processImage = async () => {
    if (!initialFile) {
      console.log("No file selected for processing");
      return;
    }

    console.log(initialFile);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", initialFile);

    console.log("FormData to be sent:", formData);
    try {
      const base_url = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.post(
        `${base_url}api/process-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          params: controls,
          responseType: "blob",
        }
      );

      console.log("Response received from server:", response);
      if (processedFile) {
        URL.revokeObjectURL(processedFile);
      }

      const blob = response.data;
      console.log("Processed file URL:", objectUrl);
      setProcessedFile(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error processing file:", error);
      showToast("Error processing image. Please try again.", { type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleControlChange = (name, value) => {
    setControls((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Controls Section */}
        {originalFile && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Adjust Image
            </h2>
            <div className="grid gap-6 mt-3">
              {Object.entries(controls).map(([name, value]) => (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-base font-medium text-gray-700">
                      {controlRanges[name].label}
                    </label>
                    <span className="text-base text-gray-500">
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={controlRanges[name].min}
                    max={controlRanges[name].max}
                    step={controlRanges[name].step}
                    value={value}
                    onChange={(e) => handleControlChange(name, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
                  />
                </div>
              ))}

              <button
                onClick={processImage}
                disabled={isProcessing || !originalFile}
                className={`w-full py-2 mt-2 px-4 rounded-lg text-2xl text-white font-medium transition-colors
                  ${
                    isProcessing || !originalFile
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-slate-950 active:bg-slate-950"
                  }`}
              >
                {isProcessing ? "Processing..." : "Process Image"}
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {originalFile && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Preview
            </h2>
            {isProcessing ? (
              <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-950 border-t-transparent"></div>
              </div>
            ) : (
              <BeforeAfterSlider
                beforeImage={originalFile}
                afterImage={processedFile}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageProcessor;
