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

  return (
    <>
      {show && (
        <div className={styles.videooverlay}>
          <div className={styles.videoimagepicker}>
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
