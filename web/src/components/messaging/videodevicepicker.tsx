import { useEffect, useRef, useState } from "react";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import styles from "./videodevicepicker.module.css";
import { GrClose } from "react-icons/gr";
import { readAndCacheVideoFrame } from "@/store/images";

type Props = {
  setCurrentImage: (image: string) => void;
};

const VideoDevicePicker = ({ setCurrentImage }: Props) => {
  const [show, setShow] = useState(false);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const toggleVideo = () => {
    if (show) {
      // Video is active, deactivate it
      stopVideo();
      setShow(false);
    } else {
      // Video is inactive, activate it
      setShow(true);
    }
  };

  const getSelectedVideoDevice = async (): Promise<MediaDeviceInfo | null> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      
      if (videoDevices.length === 0) return null;

      const device = localStorage.getItem("selected-video-device");

      if (device) {
        const parsedDevice = JSON.parse(device);
        const dvc = videoDevices.find((d) => d.deviceId === parsedDevice.deviceId);
        if (dvc) {
          return dvc;
        } else {
          // remove selected device if not found (bad entry)
          localStorage.removeItem("selected-video-device");
          return videoDevices[0];
        }
      } else {
        return videoDevices[0];
      }
    } catch (err) {
      console.error("Error accessing video devices:", err);
      return null;
    }
  };

  const startVideo = async () => {
    if (!videoRef.current) return;

    const selectedDevice = await getSelectedVideoDevice();
    if (!selectedDevice) {
      alert("No video device available.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDevice.deviceId } },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.disablePictureInPicture = true;
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Error accessing camera.");
      videoRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  // Start video when component becomes visible and video element is ready
  useEffect(() => {
    if (show && videoRef.current && !showCamera) {
      startVideo();
    }
  }, [show, showCamera]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      readAndCacheVideoFrame(videoRef.current!).then((data) => {
        if (!data) return;
        setCurrentImage(data);
        setShow(false);
      });
    }
  };

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pickerRef.current) return;
    
    const rect = pickerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !pickerRef.current) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Get picker dimensions
    const pickerRect = pickerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Constraints to keep within viewport and avoid overlap
    const minX = 16;
    const maxX = viewportWidth - pickerRect.width - 16;
    const minY = 16;
    const maxY = viewportHeight - pickerRect.height - 16;
    
    // Additional constraints to avoid chat/content areas (keep to edges)
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pickerRef.current) return;
    
    const touch = e.touches[0];
    const rect = pickerRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !pickerRef.current) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    // Get picker dimensions
    const pickerRect = pickerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Constraints to keep within viewport
    const minX = 16;
    const maxX = viewportWidth - pickerRect.width - 16;
    const minY = 16;
    const maxY = viewportHeight - pickerRect.height - 16;
    
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add global touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      {show && (
        <div className={styles.videooverlay}>
          <div 
            ref={pickerRef}
            className={styles.videoimagepicker}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className={styles.videobox}>
              <div className={styles.header}>
                {showCamera && (
                  <div className="button" onClick={() => handleVideoClick()}>
                    <HiOutlineVideoCamera size={24} className="buttonIcon" />
                  </div>
                )}
                <button className="button" onClick={toggleVideo}>
                  <GrClose size={24} className="buttonIcon" />
                </button>
              </div>
              <div className={styles.video}>
                <video
                  ref={videoRef}
                  autoPlay={true}
                  className={styles.videoelement}
                  title="Click to take a picture"
                  onClick={() => handleVideoClick()}
                ></video>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        title="Use Video Image"
        className={"button"}
        onClick={toggleVideo}
      >
        <HiOutlineVideoCamera className={"buttonIcon"} />
      </button>
    </>
  );
};

export default VideoDevicePicker;
