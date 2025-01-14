import React, { useState, useRef, useEffect } from "react";

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current || (!isDragging && e.type === "mousemove"))
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x =
      (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mouseup", handleTouchEnd);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mouseup", handleTouchEnd);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  if (!afterImage && beforeImage) {
    console.log("here");
    return (
      <div className="relative w-full h-[500px] overflow-hidden">
        <img
          src={beforeImage}
          alt="Original"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (!beforeImage) {
    return (
      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Please upload an image to start</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden cursor-col-resize select-none"
      onMouseDown={handleTouchStart}
      onMouseMove={handleMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Original Image */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Original"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Edited Image */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <img
          src={afterImage}
          alt="Edited"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 w-1 h-full bg-white cursor-col-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-1 h-4 bg-gray-400 mx-0.5"></div>
          <div className="w-1 h-4 bg-gray-400 mx-0.5"></div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
