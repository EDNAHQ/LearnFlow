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
 * A responsive background component that shows:
 * - Static images on mobile/tablet devices (< 1024px)
 * - Video on desktop devices (>= 1024px)
 *
 * This ensures better performance and avoids blank backgrounds on mobile devices
 * where videos often fail to load properly.
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile/tablet on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only attempt to play video if not mobile
    if (isMobile) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const playVideo = async () => {
      try {
        await videoElement.play();
        console.log('Video started playing successfully');
      } catch (error) {
        console.error('Error attempting to play video:', error);
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
  }, [isMobile, onError]);

  return (
    <div className={`relative ${className}`}>
      {/* Mobile/Tablet: Show static image */}
      {isMobile ? (
        <img
          src={imageSrc}
          alt="Background"
          className={`absolute inset-0 w-full h-full object-cover ${imageClassName}`}
          loading="eager"
        />
      ) : (
        /* Desktop: Show video */
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          className={`absolute inset-0 w-full h-full object-cover ${videoClassName}`}
          onError={(e) => {
            console.error('Video loading error:', e);
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
