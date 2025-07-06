'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraEnabledChatLayout } from '@/components/messaging/cameraenabledchatlayout';
import { useChatStore } from '@/store/chat';
import { useContextStore } from '@/store/context';
import { useUserStore } from '@/store/user';
import usePersistStore from '@/store/usePersistStore';
import { SocketServer } from '@/store/socket';
import { WS_ENDPOINT } from '@/store/endpoint';
import { ActionClient } from '@/socket/action';
import { useSound } from '@/audio/useSound';
import { useRealtime } from '@/audio/userealtime';
import { Message as VoiceMessage } from '@/socket/types';
import styles from './page.module.css';

export default function EnhancedChatWithCameraPage() {
  // Store integration
  const chatState = usePersistStore(useChatStore, (state) => state);
  const contextState = usePersistStore(useContextStore, (state) => state);
  const userState = usePersistStore(useUserStore, (state) => state);
  const user = userState?.user;

  // Socket connection management
  const server = useRef<SocketServer | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Multi-modal coordination state
  const [multiModalActive, setMultiModalActive] = useState<boolean>(false);
  const [currentPanel, setCurrentPanel] = useState<'chat' | 'camera' | 'split'>('split');
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number>>({});

  // Voice integration (for future call functionality)
  // const { playSound, stopSound } = useSound("/phone-ring.mp3");
  
  // Default user fallback
  const defaultUser = {
    name: "Brad Stevens",
    email: "bradstevens@microsoft.com",
    image: "/people/brad-stevens.jpg",
  };

  // Voice message handler
  const handleVoiceMessage = async (serverEvent: VoiceMessage) => {
    if (!chatState || !contextState) return;
    
    const client = new ActionClient(chatState, contextState);
    
    switch (serverEvent.type) {
      case "assistant":
        console.log("Voice assistant message:", serverEvent.payload);
        client.sendVoiceAssistantMessage(serverEvent.payload);
        break;
      case "user":
        console.log("Voice user message:", serverEvent.payload);
        client.sendVoiceUserMessage(serverEvent.payload, user || defaultUser);
        break;
      case "console":
        console.log("Voice console:", serverEvent.payload);
        break;
    }
  };

  // Realtime voice integration
  const { stopRealtime, callState } = useRealtime(
      user || defaultUser, 
      chatState && contextState ? new ActionClient(chatState, contextState) : new ActionClient({} as any, {} as any),
      handleVoiceMessage
    );

  // Initialize socket connection
  const createSocket = useCallback((threadId: string) => {
    console.log("Creating socket connection for thread:", threadId);
    const endpoint = WS_ENDPOINT.endsWith("/") ? WS_ENDPOINT.slice(0, -1) : WS_ENDPOINT;
    
    server.current = new SocketServer(
      endpoint + "/api/chat",
      threadId,
      () => {
        console.log("Socket connected");
        setConnected(true);
      },
      () => {
        console.log("Socket disconnected");
        setConnected(false);
      }
    );

    server.current.addListener("chat", async (data) => {
      if (chatState && contextState) {
        const client = new ActionClient(chatState, contextState);
        client.execute(data);
      }
    });
  }, []);

  // Initialize page when stores are ready
  useEffect(() => {
    if (chatState && contextState && userState && !isInitialized) {
      console.log("Initializing Enhanced Chat with Camera page");
      
      // Open chat if not already open
      if (!chatState.open) {
        chatState.setOpen(true);
      }

      // Create socket connection if thread exists
      if (chatState.threadId && !connected) {
        createSocket(chatState.threadId);
      }

      setIsInitialized(true);
    }
  }, [chatState, contextState, userState, isInitialized, connected]);

  // Auto-reconnect socket when thread changes
  useEffect(() => {
    if (chatState?.threadId && isInitialized && !connected) {
      console.log("Auto-reconnecting socket for thread:", chatState.threadId);
      createSocket(chatState.threadId);
    }
  }, [chatState?.threadId, isInitialized, connected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (server.current && server.current.ready) {
        server.current.close();
      }
      if (callState === "call") {
        stopRealtime();
      }
    };
  }, [callState, stopRealtime]);

  // Event handlers
  const handlePanelChange = (panel: 'chat' | 'camera' | 'split') => {
    console.log("Panel changed to:", panel);
    setCurrentPanel(panel);
  };

  const handleChatMessage = (message: string) => {
    console.log("Chat message sent:", message);
    // Additional chat message handling can be added here
  };

  const handleCameraCapture = (imageData: string) => {
    console.log("Camera capture received, size:", imageData.length);
    // Additional camera capture handling can be added here
  };

  const handlePerformanceMetric = (metric: string, value: number) => {
    console.log("Performance metric:", metric, "=", value);
    setPerformanceMetrics(prev => ({ ...prev, [metric]: value }));
  };

  const handleMultiModalToggle = (active: boolean) => {
    console.log("Multi-modal coordination:", active ? "activated" : "deactivated");
    setMultiModalActive(active);
    
    if (active) {
      // Initialize multi-modal session
      console.log("Starting multi-modal session");
    } else {
      // End multi-modal session
      console.log("Ending multi-modal session");
      if (callState === "call") {
        stopRealtime();
      }
    }
  };

  // Show loading state while initializing
  if (!isInitialized || !chatState || !contextState || !userState) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Initializing Enhanced Chat with Camera...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Enhanced Chat with Camera</h1>
        <div className={styles.statusIndicators}>
          <span className={`${styles.indicator} ${connected ? styles.connected : styles.disconnected}`}>
            {connected ? "Connected" : "Disconnected"}
          </span>
          <span className={`${styles.indicator} ${multiModalActive ? styles.active : styles.inactive}`}>
            Multi-Modal: {multiModalActive ? "Active" : "Inactive"}
          </span>
          <span className={`${styles.indicator} ${callState === "call" ? styles.active : styles.inactive}`}>
            Voice: {callState === "call" ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <CameraEnabledChatLayout
          defaultPanel={currentPanel}
          enableVoice={true}
          enableFileUpload={true}
          enforceSLA={true}
          accessibilityLevel="AAA"
          onPanelChange={handlePanelChange}
          onChatMessage={handleChatMessage}
          onCameraCapture={handleCameraCapture}
          onPerformanceMetric={handlePerformanceMetric}
        >
          <CameraEnabledChatLayout.Header 
            showPanelSwitcher={true}
          />
          
          <div className={styles.mainContent}>
            <CameraEnabledChatLayout.ChatPanel 
              enableVoice={true}
              enableFileUpload={true}
            />
            
            <CameraEnabledChatLayout.CameraPanel />
          </div>
          
          <CameraEnabledChatLayout.Controls 
            showMultiModalToggle={true}
            onMultiModalToggle={handleMultiModalToggle}
            multiModalActive={multiModalActive}
          />
          
          <CameraEnabledChatLayout.Footer 
            showPerformanceMetrics={true}
            performanceMetrics={performanceMetrics}
          />
        </CameraEnabledChatLayout>
      </div>

      {/* Performance monitoring overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.devOverlay}>
          <h3>Performance Metrics</h3>
          <div className={styles.metricsGrid}>
            {Object.entries(performanceMetrics).map(([metric, value]) => (
              <div key={metric} className={styles.metric}>
                <span className={styles.metricName}>{metric}:</span>
                <span className={styles.metricValue}>{value.toFixed(2)}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 