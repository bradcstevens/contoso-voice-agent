"use client";
import Message from "./message";
import styles from "./chat.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { 
  ArrowClockwiseRegular,
  DismissRegular, 
  CircleRegular,
  CallInboundRegular,
  CallEndRegular,
  SettingsRegular,
  Attach24Regular,
  Mic24Regular,
  Mic24Filled,
  Apps24Regular,
  Apps24Filled,
  AppFolder16Regular,
  Apps16Regular,
  bundleIcon
} from "@fluentui/react-icons";
import { 
  Button, 
  Divider, 
  makeStyles, 
  Body1,
  Image
} from "@fluentui/react-components";
import {
  CopilotChat,
  CopilotMessage,
  SystemMessage,
  Timestamp,
  UserMessage,
} from "@fluentui-copilot/react-copilot-chat";
import {
  ChatInput,
  PromptStarter,
  Suggestion,
  SuggestionList,
} from "@fluentui-copilot/react-copilot";
import { CopilotTheme } from "@fluentui-copilot/react-copilot-theme";
import { CopilotProvider } from "@fluentui-copilot/react-provider";
import { tokens } from "@fluentui-copilot/tokens";

const Mic24 = bundleIcon(Mic24Filled, Mic24Regular);
const Apps24 = bundleIcon(Apps24Filled, Apps24Regular);
import { ChatState, Turn, useChatStore } from "@/store/chat";
import usePersistStore from "@/store/usePersistStore";
import FileImagePicker from "./fileimagepicker";
import { fetchCachedImage, removeCachedBlob } from "@/store/images";
import VideoDevicePicker from "./videodevicepicker";
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
import Settings from "./settings";
import voiceStyles from "./voice.module.css";

const useStyles = makeStyles({
  chatInputContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    gap: "0.75rem",
    borderTop: "1px solid var(--color-zinc-200)",
    backgroundColor: "var(--color-zinc-50)",
  },
  actionsContainer: {
    display: "flex",
    alignItems: "center",
  },
});

interface ChatOptions {
  video?: boolean;
  file?: boolean;
}
type Props = {
  options?: ChatOptions;
};

const Chat = ({ options }: Props) => {
  const fluentStyles = useStyles();
  
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
  const settingsRef = useRef<HTMLButtonElement>(null);

  /** Auto-resize textarea */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /** Chat drawer reference */
  const chatRef = useRef<HTMLDivElement>(null);

  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const maxHeight = 120; // Max height in pixels
      const minHeight = 30; // Min height in pixels (from CSS)
      
      // If textarea is empty, reset to minimum height
      if (!textarea.value.trim()) {
        textarea.style.height = minHeight + 'px';
        return;
      }
      
      // Check if content overflows current height
      const currentHeight = textarea.clientHeight;
      const isOverflowing = textarea.scrollHeight > currentHeight;
      
      // Only resize if content is overflowing or we need to shrink
      if (isOverflowing || textarea.scrollHeight < currentHeight) {
        // Set to minimal height to get true content height
        textarea.style.height = '1px';
        const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
        textarea.style.height = newHeight + 'px';
      }
    }
  }, []);

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

    // Manage body class for drawer
    if (state?.open) {
      document.body.classList.add('chat-drawer-open');
    } else {
      document.body.classList.remove('chat-drawer-open');
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

      // Reset textarea size to minimum after clearing message
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '30px'; // Reset to minimum height
        }
      }, 0);

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

  // Auto-resize textarea when message changes
  useEffect(() => {
    autoResizeTextarea();
  }, [state?.message, autoResizeTextarea]);

  // Auto-resize textarea on component mount
  useEffect(() => {
    autoResizeTextarea();
  }, [autoResizeTextarea]);

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

  // Chat drawer functionality - no dragging needed for fixed drawer

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('chat-drawer-open');
    };
  }, []);

  return (
    <CopilotProvider {...CopilotTheme}>
      <>
        <div className={state?.open ? styles.overlay : styles.hidden}></div>
        {suggestions && (
          <>
            {console.log("Rendering Content component with suggestions:", suggestions, "and content:", contentRef.current)}
            <Content
              suggestions={contentRef.current}
              onClose={onCloseSuggestions}
              chatPosition={{ x: 0, y: 0 }}
            />
          </>
        )}
        <div 
          ref={chatRef}
          className={`${styles.chat} ${state?.open ? styles.open : ''}`}
        >
        {state && state?.open && (
          <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
              <ArrowClockwiseRegular
                fontSize={18}
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
                <CircleRegular
                  fontSize={18}
                  className={clsx(
                    styles.chatIcon,
                    connected ? styles.connected : styles.disconnected
                  )}
                />
              </div>
              <div>
                <DismissRegular
                  fontSize={18}
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
            
            {/* Settings overlay */}
            {settings && (
              <div className={styles.settingsOverlay}>
                <div className={styles.settingsBackdrop} onClick={toggleSettings} />
                <div className={styles.settingsModal}>
                  <Settings onClose={toggleSettings} />
                </div>
              </div>
            )}
            
            {/* chat section */}
            <div className={styles.chatSection} ref={chatDiv}>
              <CopilotChat className={styles.copilotChat}>
                {state && state.turns.length === 0 && callState === "idle" && (
                  <div className={styles.zeroprompt}>
                    <Body1>Hi {user?.name || "there"},</Body1>
                    <Body1>
                      Ready to explore? Select one of the suggestions below to get
                      started...
                    </Body1>
                    <PromptStarter
                      icon={<AppFolder16Regular />}
                      category={"Summarize"}
                      prompt={<Body1>Review key points in file</Body1>}
                    />
                    <PromptStarter
                      icon={<AppFolder16Regular />}
                      category={"Create"}
                      prompt={<Body1>Write more about...</Body1>}
                    />
                    <PromptStarter
                      icon={<AppFolder16Regular />}
                      category={"Ask"}
                      prompt={<Body1>Tell me about my day</Body1>}
                      badge="New"
                    />
                  </div>
                )}
                
                {state && state.turns.length > 0 && (
                  <>
                    <Timestamp>Today</Timestamp>
                    {state.turns.map((turn, index) => {
                      if (turn.type === "user") {
                        return (
                          <UserMessage key={index} timestamp={new Date().toLocaleTimeString()}>
                            {turn.message}
                          </UserMessage>
                        );
                      } else {
                        return (
                          <CopilotMessage
                            key={index}
                            name="Copilot"
                            avatar={
                              <Image
                                src="https://res-2-sdf.cdn.office.net/files/fabric-cdn-prod_20240411.001/assets/brand-icons/product/svg/copilot_24x1.svg"
                                alt="Copilot"
                              />
                            }
                            loadingState={turn.status === "streaming" || turn.status === "waiting" ? "streaming" : "none"}
                          >
                            {turn.message}
                          </CopilotMessage>
                        );
                      }
                    })}
                  </>
                )}
              </CopilotChat>
              
              {/* Call controls overlay - only show during ringing */}
              {callState === "ringing" && (
                <div className={styles.callOverlay}>
                  <div
                    className={clsx(voiceStyles.callButton, voiceStyles.callRing)}
                    ref={buttonRef}
                    onClick={answerCall}
                  >
                    <CallInboundRegular fontSize={32} />
                  </div>
                  <div className={voiceStyles.callHangup} onClick={hangupCall}>
                    <CallEndRegular fontSize={32} />
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
              <SuggestionList className={styles.suggestionList}>
                <Suggestion>Summarize my emails from Chris</Suggestion>
                <Suggestion>What's new in Outlook?</Suggestion>
                <Suggestion>Help me plan my day</Suggestion>
              </SuggestionList>
              
              <ChatInput
                aria-label="Copilot Chat"
                maxLength={1000}
                charactersRemainingMessage={(value) => `${value} characters remaining`}
                placeholderValue="Ask questions and work with this document"
                onSubmit={(_, data) => {
                  if (state && data?.value) {
                    state.setMessage(data.value);
                    sendMessage();
                  }
                }}
                actions={
                  <span className={styles.inputContainer}>
                    {options && options.file && (
                      <Button
                        aria-label="attach an item"
                        appearance="transparent"
                        icon={<Attach24Regular />}
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = 'image/*';
                          fileInput.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file && state) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                state.setCurrentImage(result);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          fileInput.click();
                        }}
                      />
                    )}
                    <Button
                      aria-label="add-plugins"
                      appearance="transparent"
                      icon={<Apps24 />}
                    />
                    <Divider className={styles.divider} vertical />
                    {callState === "idle" && (
                      <Button
                        aria-label="dictate"
                        appearance="transparent"
                        icon={<Mic24 />}
                        onClick={startCall}
                      />
                    )}
                    {callState === "call" && (
                      <Button
                        aria-label="end call"
                        appearance="transparent"
                        icon={<CallEndRegular />}
                        onClick={hangupCall}
                      />
                    )}
                  </span>
                }
              />
              
              <div className={styles.buttonRow}>
                {options && options.video && (
                  <VideoDevicePicker setCurrentImage={state.setCurrentImage} />
                )}
                
                <button
                  className="button"
                  ref={settingsRef}
                  onClick={toggleSettings}
                >
                  {settings ? <SettingsRegular fontSize={20} className="buttonIcon" /> : <SettingsRegular fontSize={24} className="buttonIcon" />}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      </>
    </CopilotProvider>
  );
};

export default Chat;
