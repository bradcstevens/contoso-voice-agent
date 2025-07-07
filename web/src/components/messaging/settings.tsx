import { useLocalStorage } from "@/store/uselocalstorage";
import { useMediaDevices } from "@/store/usemediadevice";
import { GrPowerReset } from "react-icons/gr";
import styles from "./settings.module.css";
import { defaultConfiguration, type VoiceConfiguration } from "@/store/voice";
import { useEffect, useState } from "react";

const Settings = () => {
  const {
    storedValue: settings,
    setValue: setSettings,
    reset: resetSettings,
  } = useLocalStorage<VoiceConfiguration>(
    "voice-settings",
    defaultConfiguration
  );
  const { devices, error, isLoading } = useMediaDevices(true);
  
  // Video device state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<MediaDeviceInfo>();

  const getVideoDevices = async (): Promise<MediaDeviceInfo[] | null> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === "videoinput");
    } catch (err) {
      console.error("Error accessing video devices:", err);
      return null;
    }
  };

  const getSelectedVideoDevice = async (): Promise<MediaDeviceInfo | null> => {
    const devices = await getVideoDevices();
    if (!devices) return null;

    const device = localStorage.getItem("selected-video-device");

    if (device) {
      const parsedDevice = JSON.parse(device);
      const dvc = devices?.find((d) => d.deviceId === parsedDevice.deviceId);
      if (dvc) {
        return dvc;
      } else {
        // remove selected device if not found (bad entry)
        localStorage.removeItem("selected-video-device");
        return devices?.[0];
      }
    } else {
      return devices?.[0];
    }
  };

  useEffect(() => {
    const loadVideoDevices = async () => {
      const devices = await getVideoDevices();
      if (devices) {
        setVideoDevices(devices);
        const selectedDevice = await getSelectedVideoDevice();
        if (selectedDevice) {
          setSelectedVideoDevice(selectedDevice);
        }
      }
    };
    loadVideoDevices();
  }, []);

  useEffect(() => {
    if (selectedVideoDevice) {
      localStorage.setItem(
        "selected-video-device",
        JSON.stringify({ deviceId: selectedVideoDevice.deviceId })
      );
    }
  }, [selectedVideoDevice]);

  return (
    <div className={styles.container}>
      <div className={styles.control}>
        <div className={styles.label}>Voice Input:</div>
        <select
          id="voice-device"
          name="voice-device"
          className={styles.mediaselect}
          value={settings.inputDeviceId}
          title="Select a voice input device"
          onChange={(e) =>
            setSettings({ ...settings, inputDeviceId: e.target.value })
          }
        >
          {isLoading && <option>Loading...</option>}
          {error && <option>Error: {error}</option>}
          {devices
            .filter((device) => device.kind === "audioinput")
            .map((device) => {
              return (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              );
            })}
        </select>
      </div>

      <div className={styles.control}>
        <div className={styles.label}>Video Input:</div>
        <select
          id="video-device"
          name="video-device"
          className={styles.mediaselect}
          value={selectedVideoDevice?.deviceId}
          title="Select a video input device"
          onChange={(e) =>
            setSelectedVideoDevice(
              videoDevices.find((d) => d.deviceId === e.target.value)
            )
          }
        >
          {videoDevices.length === 0 && <option>No video devices found</option>}
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.control}>
        <div className={styles.label}>
          Sensitivity Threshold (between 0 - 1):
        </div>
        <input
          id="threshold"
          name="threshold"
          type="number"
          title="Sensitivity Threshold"
          min={0}
          max={1}
          step={0.1}
          className={styles.textInput}
          value={settings.threshold}
          onChange={(e) =>
            setSettings({ ...settings, threshold: +e.target.value })
          }
        />
      </div>
      <div className={styles.control}>
        <div className={styles.label}>Silence Duration (in ms):</div>
        <input
          id="silence"
          name="chat"
          type="number"
          title="Silence Duration"
          min={0}
          max={3000}
          step={50}
          className={styles.textInput}
          value={settings.silence}
          onChange={(e) =>
            setSettings({ ...settings, silence: +e.target.value })
          }
        />
      </div>

      <div className={styles.control}>
        <div className={styles.label}>Prefix Padding (in ms):</div>
        <input
          id="prefix"
          name="chat"
          type="number"
          title="Prefix Padding"
          min={0}
          max={3000}
          step={50}
          className={styles.textInput}
          value={settings.prefix}
          onChange={(e) =>
            setSettings({ ...settings, prefix: +e.target.value })
          }
        />
      </div>
      <div className={styles.buttonContainer}>
        <button
          className={styles.resetButton}
          onClick={() => resetSettings()}
          title="Reset to default settings"
        >
          <GrPowerReset size={24} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
