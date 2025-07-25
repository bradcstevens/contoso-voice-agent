"use client";
import Message from "./message";
import styles from "./chat.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { GrPowerReset, GrClose, GrBeacon } from "react-icons/gr";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { FiPhone, FiPhoneCall, FiPhoneOff, FiSettings } from "react-icons/fi";
import { ChatState, Turn, useChatStore } from "@/store/chat";
import usePersistStore from "@/store/usePersistStore";
import FileImagePicker from "./fileimagepicker";
import { fetchCachedImage, removeCachedBlob } from "@/store/images";
import VideoImagePicker from "./videoimagepicker";
import { WS_ENDPOINT } from "@/store/endpoint";
import { SocketMessage, SocketServer } from "@/store/socket";
import clsx from "clsx";
import { ContextState, useContextStore } from "@/store/context";
import { ActionClient, startSuggestionTask, suggestionRequested } from "@/socket/action";
import { useUserStore } from "@/store/user";
import { useSound } from "@/audio/useSound";
import { useRealtime } from "@/audio/userealtime";
import { Message as VoiceMessage } from "@/socket/types";
import Content from "./content";
import VoiceSettings from "./voicesettings";
import voiceStyles from "./voice.module.css";

interface ChatOptions {
  video?: boolean;
  file?: boolean;
}
type Props = {
  options?: ChatOptions;
};

const Chat = ({ options }: Props) => {
  /** Socket */
  const server = useRef<SocketServer | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  /** STORE */
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const state = usePersistStore(useChatStore, (state) => state);
  const stateRef = useRef<ChatState | undefined>();

  const context = usePersistStore(useContextStore, (state) => state);
  const contextRef = useRef<ContextState | undefined>();

  const user = usePersistStore(useUserStore, (state) => state.user);
  const userState = usePersistStore(useUserStore, (state) => state);

  /** Voice functionality */
  const contentRef = useRef<string[]>([]);
  const [settings, setSettings] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<boolean>(false);
  const suggestionsRef = useRef<boolean>(false);
  const { playSound, stopSound } = useSound("/phone-ring.mp3");
  const buttonRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const defaultUser = {
    name: "Brad Stevens",
    email: "bradstevens@microsoft.com",
    image: "/people/brad-stevens.jpg",
  };

  const checkForSuggestions = async (client: ActionClient) => {
    if (suggestionsRef.current) {
      console.log("Suggestions already processed, skipping...");
      return;
    }

    const messages = client.retrieveMessages();
    console.log("Checking for suggestions with messages:", messages);
    
    // Skip if the last message is the "visual suggestions are ready" message
    if (messages.length > 0 && 
        messages[messages.length - 1].text.includes("visual suggestions are ready")) {
      console.log("Skipping suggestion check for visual ready message");
      return;
    }
    
    try {
      const response = await suggestionRequested(messages);
      console.log("Suggestion request response:", response);
      
      if (response && response.requested) {
        console.log("Suggestions requested, starting task...");
        console.log("Setting suggestions state to true");
        setSuggestions(true);
        suggestionsRef.current = true;
        contentRef.current = []; // Clear previous content
        console.log("Cleared content array, starting suggestion task");
        
        const task = await startSuggestionTask(
          user?.name || "Brad",
          messages
        );
        
        for await (const chunk of task) {
          contentRef.current.push(chunk);
          client.streamSuggestion(chunk);
        }
        console.log("Suggestions completed");
      }
    } catch (error) {
      console.error("Error with suggestions:", error);
    }
  };

  const handleServerMessage = async (serverEvent: VoiceMessage) => {
    const client = new ActionClient(stateRef.current!, contextRef.current!);
    switch (serverEvent.type) {
      case "assistant":
        console.log("assistant:", serverEvent.payload);
        client.sendVoiceAssistantMessage(serverEvent.payload);
        // Check for suggestions after message is processed
        await checkForSuggestions(client);
        // Send the ready message for voice only once per suggestion session
        if (suggestionsRef.current && !serverEvent.payload.includes("visual suggestions are ready")) {
          await sendRealtime({
            type: "user",
            payload: "The visual suggestions are ready.",
          });
          await sendRealtime({ type: "interrupt", payload: "" });
        }
        break;
      case "user":
        console.log("user:", serverEvent.payload);
        // Reset suggestions for new conversation context
        if (suggestionsRef.current) {
          suggestionsRef.current = false;
          setSuggestions(false);
          contentRef.current = [];
        }
        client.sendVoiceUserMessage(serverEvent.payload, user || defaultUser);
        break;
      case "console":
        console.log(serverEvent.payload);
        break;
    }
  };

  const { startRealtime, stopRealtime, sendRealtime, callState, setCallState } =
    useRealtime(user || defaultUser, new ActionClient(stateRef.current!, contextRef.current!), handleServerMessage);

  const toggleSettings = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Stop audio when toggling settings
    if (callState === "call") {
      sendRealtime({ type: "interrupt", payload: "" });
    }
    setSettings(!settings);
    settingsRef.current?.classList.toggle(voiceStyles.settingsOn);
  };

  const startCall = useCallback(async () => {
    console.log("Starting call");
    setCallState("ringing");
    buttonRef.current?.classList.add(voiceStyles.callRing);
    playSound();
  }, [playSound, setCallState]);

  const answerCall = async () => {
    console.log("Answering call");
    setCallState("call");
    stopSound();
    buttonRef.current?.classList.remove(voiceStyles.callRing);
    await startRealtime();
  };

  const hangupCall = async () => {
    console.log("Hanging up call");
    // Stop audio immediately before other cleanup
    await sendRealtime({ type: "interrupt", payload: "" });
    
    setCallState("idle");
    stopSound();
    await stopRealtime();
  };

  const onCloseSuggestions = () => {
    setSuggestions(false);
    suggestionsRef.current = false;
    contentRef.current = []; // Clear suggestions content
  };

  /** Current State */
  useEffect(() => {
    stateRef.current = state;

    if (state && state.currentImage) {
      fetchCachedImage(state.currentImage, setCurrentImage).then(() => {
        scrollChat();
      });
    }
  }, [state]);

  /** Current Context */
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  /** Send */
  const sendMessage = async () => {
    if (stateRef.current) {
      // Reset suggestions for new conversation context
      if (suggestionsRef.current) {
        suggestionsRef.current = false;
        setSuggestions(false);
        contentRef.current = [];
      }

      // get current message
      const turn: Turn = {
        name: user?.name || "Brad Stevens",
        avatar: user?.image || "undefined",
        image: stateRef.current.currentImage,
        message: stateRef.current.message,
        status: "done",
        type: "user",
      };

      // can replace with current user
      stateRef.current.sendMessage(
        user?.name || "Brad Stevens",
        user?.image || "undefined"
      );
      // reset image
      setCurrentImage(null);

      // process on server
      //execute(turn);
      if (server.current && server.current.ready) {
        await server.current.sendTurn(turn);
      }
    }
  };

  /** Events */
  const serverCallback = async (data: SocketMessage) => {
    if (stateRef.current && contextRef.current) {
      const client = new ActionClient(stateRef.current, contextRef.current);
      client.execute(data);
      
      // Only check for suggestions in text chat mode (not during voice calls)
      if (data.type === "assistant" && data.payload && callState === "idle") {
        console.log("Assistant message received:", data.payload);
        
        // Check for completion in various ways
        const isComplete = 
          ('state' in data.payload && data.payload.state === "complete") ||
          ('status' in data.payload && data.payload.status === "done") ||
          !('state' in data.payload); // Fallback for messages without state
        
        if (isComplete) {
          console.log("Message is complete, checking for suggestions...");
          await checkForSuggestions(client);
        }
      }
    }
  };

  const manageConnection = () => {
    if (server.current && server.current.ready) {
      server.current.close();
      server.current = null;
    } else {
      if (stateRef.current && stateRef.current.threadId) {
        createSocket(stateRef.current.threadId);
      }
    }
  };

  const createSocket = (threadId: string) => {
    console.log("Starting Socket (" + threadId + ")");
    const endpoint = WS_ENDPOINT.endsWith("/")
      ? WS_ENDPOINT.slice(0, -1)
      : WS_ENDPOINT;
    server.current = new SocketServer(
      endpoint + "/api/chat",
      threadId,
      () => setConnected(true),
      () => setConnected(false)
    );
    server.current.addListener("chat", serverCallback);
  };

  const clear = () => {
    // Stop any playing audio immediately
    if (callState === "call") {
      sendRealtime({ type: "interrupt", payload: "" });
    }
    
    // Reset suggestions state
    setSuggestions(false);
    suggestionsRef.current = false;
    contentRef.current = [];
    
    if (state) state.resetChat();
    if (context) context.clearContext();
    if (server.current && server.current.ready) {
      server.current.close();
      server.current = null;
    }
    if(userState) userState.resetUser();
    clearImage();
  };

  const clearImage = () => {
    // remove image from cache
    if (state?.currentImage) {
      removeCachedBlob(state?.currentImage);
    }
    if (state) state.setCurrentImage(null);
    setCurrentImage(null);
  };

  /** Updates */
  const chatDiv = useRef<HTMLDivElement>(null);

  const scrollChat = () => {
    setTimeout(() => {
      if (chatDiv.current) {
        chatDiv.current.scrollTo({
          top: chatDiv.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 10);
  };

  useEffect(() => {
    scrollChat();
  }, [state?.turns.length, state?.currentImage]);

  useEffect(() => {
    if (contextRef.current && contextRef.current.call >= 5) {
      contextRef.current.setCallScore(0);
      startCall();
    }
  }, [contextRef.current?.call, startCall]);

  // Auto-reconnect on component mount if chat is open
  useEffect(() => {
    if (state?.open && stateRef.current?.threadId && !connected) {
      console.log("Auto-reconnecting on page load...");
      createSocket(stateRef.current.threadId);
    }
  }, [state?.open, connected]);

  return (
    <>
      <div className={state?.open ? styles.overlay : styles.hidden}></div>
      {suggestions && (
        <>
          {console.log("Rendering Content component with suggestions:", suggestions, "and content:", contentRef.current)}
          <Content
            suggestions={contentRef.current}
            onClose={onCloseSuggestions}
          />
        </>
      )}
      <div className={styles.chat}>
        {state && state?.open && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <GrPowerReset
                size={18}
                className={styles.chatIcon}
                onClick={() => {
                  // Stop audio immediately when clearing
                  if (callState === "call") {
                    sendRealtime({ type: "interrupt", payload: "" });
                  }
                  clear();
                }}
              />
              <div className={"grow"} />
              <div>
                <GrBeacon
                  size={18}
                  className={clsx(
                    styles.chatIcon,
                    connected ? styles.connected : styles.disconnected
                  )}
                />
              </div>
              <div>
                <GrClose
                  size={18}
                  className={styles.chatIcon}
                  onClick={() => {
                    // Stop audio immediately when closing
                    if (callState === "call") {
                      sendRealtime({ type: "interrupt", payload: "" });
                    }
                    state && state.setOpen(false);
                  }}
                />
              </div>
            </div>
            {/* chat section */}
            <div className={styles.chatSection} ref={chatDiv}>
              <div className={callState === "ringing" ? styles.chatMessagesBlurred : styles.chatMessages}>
                {state && state.turns.length === 0 && callState === "idle" && (
                  <div className={styles.chatPlaceholder}>
                    Ask Anything
                  </div>
                )}
                {state &&
                  state.turns.map((turn, index) => (
                    <Message key={index} turn={turn} notify={scrollChat} />
                  ))}
              </div>
              
              {/* Call controls overlay - only show during ringing */}
              {callState === "ringing" && (
                <div className={styles.callOverlay}>
                  <div
                    className={clsx(voiceStyles.callButton, voiceStyles.callRing)}
                    ref={buttonRef}
                    onClick={answerCall}
                  >
                    <FiPhoneCall size={32} />
                  </div>
                  <div className={voiceStyles.callHangup} onClick={hangupCall}>
                    <FiPhoneOff size={32} />
                  </div>
                </div>
              )}
            </div>
            {/* image section */}
            {currentImage && (
              <div className={styles.chatImageSection}>
                <img
                  src={currentImage}
                  className={styles.chatImage}
                  alt="Current Image"
                  onClick={() => clearImage()}
                />
              </div>
            )}
            {/* chat input section */}
            <div className={styles.chatInputSection}>
              <input
                id="chat"
                name="chat"
                type="text"
                title="Type a message"
                value={state ? state.message : ""}
                onChange={(e) => state && state.setMessage(e.target.value)}
                onKeyUp={(e) => {
                  if (e.code === "Enter") sendMessage();
                }}
                className={styles.chatInput}
              />
              {options && options.file && (
                <FileImagePicker setCurrentImage={state.setCurrentImage} />
              )}
              {options && options.video && (
                <VideoImagePicker setCurrentImage={state.setCurrentImage} />
              )}
              
              {/* Voice buttons */}
              {callState === "idle" && (
                <div className={voiceStyles.voiceButton} onClick={startCall}>
                  <FiPhone size={24} />
                </div>
              )}
              {callState === "call" && (
                <div className={voiceStyles.callHangupSmall} onClick={hangupCall}>
                  <FiPhoneOff size={20} />
                </div>
              )}
              <div
                className={voiceStyles.settingsButton}
                ref={settingsRef}
                onClick={toggleSettings}
              >
                {settings ? <GrClose size={20} /> : <FiSettings size={24} />}
              </div>

              <button
                type="button"
                title="Send Message"
                className={"button"}
                onClick={sendMessage}
              >
                <HiOutlinePaperAirplane size={24} className={"buttonIcon"} />
              </button>
            </div>
          </div>
        )}
        <div
          className={styles.chatButton}
          onClick={() => {
            if (state) {
              const isOpening = !state.open;
              
              // Stop audio when closing chat
              if (!isOpening && callState === "call") {
                sendRealtime({ type: "interrupt", payload: "" });
              }
              
              state.setOpen(isOpening);
              
              // Auto-connect when opening chat
              if (isOpening && stateRef.current && stateRef.current.threadId && !connected) {
                createSocket(stateRef.current.threadId);
              }
            }
            scrollChat();
          }}
        >
          {state?.open ? (
            <GrClose size={24} />
          ) : (
            <HiOutlineChatBubbleLeftRight size={32} />
          )}
        </div>
      </div>
      {settings && <VoiceSettings />}
    </>
  );
};

export default Chat;
