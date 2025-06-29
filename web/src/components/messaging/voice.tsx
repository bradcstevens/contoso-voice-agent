"use client";
//import VoiceClient from "@/socket/voice-client";
import styles from "./voice.module.css";

const Voice = () => {
  // Voice functionality has been moved to the Chat component
  // This component is now minimal and can be removed if not needed elsewhere
  
  return (
    <div className={styles.voice}>
      {/* Voice controls are now integrated into the chat input section */}
    </div>
  );
};

export default Voice;
