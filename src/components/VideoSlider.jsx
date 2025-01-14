import React, { useState, useRef, useEffect } from "react";

const VideoSlider = ({ beforeVideo, afterVideo }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const beforeVideoRef = useRef(null);
  const afterVideoRef = useRef(null);

  const handleMove = (e) => {
    if (!containerRef.current || (!isDragging && e.type === "mousemove"))
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - rect.left;
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
    const syncVideos = () => {
      if (beforeVideoRef.current && afterVideoRef.current) {
        afterVideoRef.current.currentTime = beforeVideoRef.current.currentTime;
      }
    };

    const beforeVideo = beforeVideoRef.current;
    if (beforeVideo) {
      beforeVideo.addEventListener('play', () => afterVideoRef.current?.play());
      beforeVideo.addEventListener('pause', () => afterVideoRef.current?.pause());
      beforeVideo.addEventListener('timeupdate', syncVideos);
    }

    document.addEventListener("mouseup", handleTouchEnd);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      if (beforeVideo) {
        beforeVideo.removeEventListener('play', () => afterVideoRef.current?.play());
        beforeVideo.removeEventListener('pause', () => afterVideoRef.current?.pause());
        beforeVideo.removeEventListener('timeupdate', syncVideos);
      }
      document.removeEventListener("mouseup", handleTouchEnd);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  if (!afterVideo && beforeVideo) {
    return (
      <div className="relative w-full h-[500px] overflow-hidden">
        <video
          src={beforeVideo}
          ref={beforeVideoRef}
          controls
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (!beforeVideo) {
    return (
      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Please upload a video to start</p>
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
      {/* Original Video */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <video
          ref={beforeVideoRef}
          src={beforeVideo}
          controls
          className="w-full h-full object-contain"
        />
      </div>

      {/* Processed Video */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <video
          ref={afterVideoRef}
          src={afterVideo}
          controls
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

export default VideoSlider;