import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  imageSrc: string;
  className?: string;
  videoClassName?: string;
  imageClassName?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  onError?: (error: Event) => void;
  poster?: string;
}

/**
 * VideoBackground Component
 *
 * Always shows the image as base layer.
 * On desktop (>= 1024px), overlays video on top.
 * On mobile/tablet (< 1024px), only shows image.
 */
export default function VideoBackground({
  videoSrc,
  imageSrc,
  className = '',
  videoClassName = '',
  imageClassName = '',
  overlayClassName = '',
  children,
  onError,
  poster,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(true); // Default to showing video on desktop

  useEffect(() => {
    const checkScreenSize = () => {
      // Show video on desktop (>= 1024px), hide on mobile/tablet (< 1024px)
      setShowVideo(window.innerWidth >= 1024);
    };

    // Check immediately
    checkScreenSize();

    // Listen for resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Only attempt to play video if we're showing it
    if (!showVideo) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const playVideo = async () => {
      try {
        await videoElement.play();
      } catch (error) {
        console.error('Error attempting to play video:', error);
        // Don't hide video on error, let poster image show
        if (onError) {
          onError(error as Event);
        }
      }
    };

    // Try to play once the video metadata is loaded
    if (videoElement.readyState >= 2) {
      playVideo();
    } else {
      videoElement.addEventListener('loadeddata', playVideo);
      return () => videoElement.removeEventListener('loadeddata', playVideo);
    }
  }, [showVideo, onError]);

  return (
    <div className={`relative ${className}`}>
      {/* Base layer: Image always visible - ensures something is always shown */}
      <img
        src={imageSrc}
        alt="Background"
        className={`absolute inset-0 w-full h-full object-cover z-0 ${imageClassName}`}
        loading="eager"
        onError={(e) => {
          console.error('Image failed to load:', imageSrc);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', imageSrc);
        }}
      />
      
      {/* Overlay layer: Video only on desktop */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={poster || imageSrc}
          className={`absolute inset-0 w-full h-full object-cover z-[1] ${videoClassName}`}
          onError={(e) => {
            console.error('Video loading error:', e);
            // Video failed, but image is still showing underneath
            if (onError) onError(e.nativeEvent);
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Optional overlay */}
      {overlayClassName && (
        <div className={`absolute inset-0 ${overlayClassName}`} />
      )}

      {/* Content */}
      {children}
    </div>
  );
}
