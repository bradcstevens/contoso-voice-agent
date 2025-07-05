import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef,
  ReactNode
} from 'react';
import { MultiModalOrchestrator } from './multimodalorchestrator';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import { MultiModalErrorLayout } from './multimodalerrorlayout';
import styles from './voicecallinterfacelayout.module.css';

// Voice call interfaces
interface CallParticipant {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'connecting' | 'connected' | 'speaking' | 'muted' | 'on_hold' | 'disconnected';
  audioLevel: number; // 0-100
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  joinTime: Date;
  isSelf: boolean;
  isHost: boolean;
}

interface CallState {
  status: 'idle' | 'dialing' | 'ringing' | 'connected' | 'on_hold' | 'transferring' | 'ending' | 'ended' | 'failed';
  duration: number; // seconds
  startTime: Date | null;
  endTime: Date | null;
  callId: string | null;
  isRecording: boolean;
  isMuted: boolean;
  isOnHold: boolean;
  volume: number; // 0-100
  participants: CallParticipant[];
  activeParticipantId: string | null;
  callQuality: {
    audioLatency: number;
    packetsLost: number;
    connectionStability: 'stable' | 'unstable' | 'poor';
    bandwidth: number;
  };
  errors: Array<{
    id: string;
    type: 'audio_device' | 'network' | 'permission' | 'service' | 'unknown';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

interface AudioVisualization {
  enabled: boolean;
  waveformData: number[]; // Audio levels for waveform
  spectrumData: number[]; // Frequency spectrum data
  currentLevel: number; // Current audio level 0-100
  peakLevel: number; // Peak level indicator
  backgroundNoise: number; // Background noise level
}

interface VoiceCallInterfaceLayoutState {
  call: CallState;
  audio: AudioVisualization;
  settings: {
    noiseReduction: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
    preferredDeviceId: string | null;
    ringtoneVolume: number;
    notificationSounds: boolean;
  };
  ui: {
    activePanel: 'controls' | 'participants' | 'settings' | 'quality';
    isExpanded: boolean;
    showVisualization: boolean;
    showCaptions: boolean;
  };
  accessibility: {
    currentFocus: string;
    announcements: string[];
    callStatus: string;
    participantUpdates: string[];
  };
}

interface VoiceCallInterfaceLayoutProps {
  className?: string;
  initialCall?: Partial<CallState>;
  onCallStateChange?: (state: CallState) => void;
  onParticipantUpdate?: (participant: CallParticipant) => void;
  onCallEnd?: (duration: number, reason: string) => void;
  onError?: (error: any) => void;
  enforceSLA?: boolean; // <500ms template render requirement
  accessibilityLevel?: 'AA' | 'AAA';
  enableAudioVisualization?: boolean;
  enableRecording?: boolean;
  maxParticipants?: number;
  children?: ReactNode;
}

export interface VoiceCallInterfaceLayoutRef {
  // Call management
  startCall: (participantId: string) => Promise<void>;
  endCall: (reason?: string) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  
  // Audio controls
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setVolume: (level: number) => void;
  hold: () => Promise<void>;
  unhold: () => Promise<void>;
  
  // Participant management
  addParticipant: (participant: CallParticipant) => void;
  removeParticipant: (participantId: string) => void;
  muteParticipant: (participantId: string) => void;
  
  // Template controls
  focusCallControls: () => void;
  announceCallStatus: (message: string) => void;
  getCallMetrics: () => any;
  
  // Performance monitoring
  validatePerformanceSLA: () => boolean;
}

// Header compound component
interface VoiceCallInterfaceLayoutHeaderProps {
  children?: ReactNode;
  call?: CallState;
  showDuration?: boolean;
  showParticipantCount?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const VoiceCallInterfaceLayoutHeader: React.FC<VoiceCallInterfaceLayoutHeaderProps> = ({
  children,
  call,
  showDuration = true,
  showParticipantCount = true,
  onMinimize,
  onMaximize
}) => {
  const formatDuration = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'connected': return '📞';
      case 'dialing': return '📱';
      case 'ringing': return '🔔';
      case 'on_hold': return '⏸️';
      case 'ending': return '📴';
      case 'failed': return '❌';
      default: return '📞';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'connected': return styles.statusConnected;
      case 'dialing': case 'ringing': return styles.statusConnecting;
      case 'on_hold': return styles.statusOnHold;
      case 'ending': case 'failed': return styles.statusEnding;
      default: return styles.statusIdle;
    }
  }, []);

  return (
    <header className={styles.templateHeader} role="banner">
      <div className={styles.headerContent}>
        <div className={styles.callStatus}>
          <div className={`${styles.statusIndicator} ${getStatusColor(call?.status || 'idle')}`}>
            <span className={styles.statusIcon} aria-hidden="true">
              {getStatusIcon(call?.status || 'idle')}
            </span>
            <span className={styles.statusText}>
              {call?.status?.replace('_', ' ').toUpperCase() || 'READY'}
            </span>
          </div>
          
          {showDuration && call?.duration && call.duration > 0 && (
            <div className={styles.callDuration}>
              <span className={styles.durationLabel}>Duration:</span>
              <span className={styles.durationTime}>
                {formatDuration(call.duration)}
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.callInfo}>
          {showParticipantCount && call?.participants && (
            <div className={styles.participantCount}>
              <span className={styles.participantIcon}>��</span>
              <span>{call.participants.length} participant{call.participants.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {call?.isRecording && (
            <div className={styles.recordingIndicator}>
              <span className={styles.recordingDot}></span>
              <span>Recording</span>
            </div>
          )}
        </div>
        
        <div className={styles.windowControls}>
          {onMinimize && (
            <button 
              className={styles.windowButton}
              onClick={onMinimize}
              aria-label="Minimize call interface"
            >
              ➖
            </button>
          )}
          
          {onMaximize && (
            <button 
              className={styles.windowButton}
              onClick={onMaximize}
              aria-label="Maximize call interface"
            >
              ⬜
            </button>
          )}
        </div>
        
        {children}
      </div>
    </header>
  );
};

// CallControls compound component
interface VoiceCallInterfaceLayoutCallControlsProps {
  children?: ReactNode;
  call?: CallState;
  onMute?: () => void;
  onUnmute?: () => void;
  onHold?: () => void;
  onUnhold?: () => void;
  onEndCall?: () => void;
  onTransfer?: () => void;
  onRecord?: () => void;
  disabled?: boolean;
}

const VoiceCallInterfaceLayoutCallControls: React.FC<VoiceCallInterfaceLayoutCallControlsProps> = ({
  children,
  call,
  onMute,
  onUnmute,
  onHold,
  onUnhold,
  onEndCall,
  onTransfer,
  onRecord,
  disabled = false
}) => {
  const canControl = call?.status === 'connected' && !disabled;

  return (
    <section 
      className={styles.callControls}
      role="toolbar"
      aria-label="Call controls"
    >
      <div className={styles.controlsContainer}>
        <div className={styles.primaryControls}>
          {/* Mute/Unmute */}
          <button 
            className={`${styles.controlButton} ${call?.isMuted ? styles.active : ''}`}
            onClick={call?.isMuted ? onUnmute : onMute}
            disabled={!canControl}
            aria-label={call?.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={call?.isMuted ? 'Unmute' : 'Mute'}
          >
            <span className={styles.controlIcon}>
              {call?.isMuted ? '🔇' : '🎤'}
            </span>
            <span className={styles.controlLabel}>
              {call?.isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* Hold/Unhold */}
          <button 
            className={`${styles.controlButton} ${call?.isOnHold ? styles.active : ''}`}
            onClick={call?.isOnHold ? onUnhold : onHold}
            disabled={!canControl}
            aria-label={call?.isOnHold ? 'Resume call' : 'Put call on hold'}
            title={call?.isOnHold ? 'Resume' : 'Hold'}
          >
            <span className={styles.controlIcon}>
              {call?.isOnHold ? '▶️' : '⏸️'}
            </span>
            <span className={styles.controlLabel}>
              {call?.isOnHold ? 'Resume' : 'Hold'}
            </span>
          </button>

          {/* End Call */}
          <button 
            className={`${styles.controlButton} ${styles.endCall}`}
            onClick={onEndCall}
            disabled={call?.status === 'idle' || call?.status === 'ended'}
            aria-label="End call"
            title="End Call"
          >
            <span className={styles.controlIcon}>📞</span>
            <span className={styles.controlLabel}>End Call</span>
          </button>
        </div>

        <div className={styles.secondaryControls}>
          {/* Record */}
          {onRecord && (
            <button 
              className={`${styles.controlButton} ${call?.isRecording ? styles.active : ''}`}
              onClick={onRecord}
              disabled={!canControl}
              aria-label={call?.isRecording ? 'Stop recording' : 'Start recording'}
              title={call?.isRecording ? 'Stop Recording' : 'Record'}
            >
              <span className={styles.controlIcon}>
                {call?.isRecording ? '⏹️' : '🔴'}
              </span>
              <span className={styles.controlLabel}>
                {call?.isRecording ? 'Stop' : 'Record'}
              </span>
            </button>
          )}

          {/* Transfer */}
          {onTransfer && (
            <button 
              className={styles.controlButton}
              onClick={onTransfer}
              disabled={!canControl}
              aria-label="Transfer call"
              title="Transfer"
            >
              <span className={styles.controlIcon}>↗️</span>
              <span className={styles.controlLabel}>Transfer</span>
            </button>
          )}
        </div>
        
        {children}
      </div>
    </section>
  );
};

// AudioVisualization compound component
interface VoiceCallInterfaceLayoutAudioVisualizationProps {
  children?: ReactNode;
  audio?: AudioVisualization;
  participants?: CallParticipant[];
  showWaveform?: boolean;
  showSpectrum?: boolean;
  showParticipantLevels?: boolean;
}

const VoiceCallInterfaceLayoutAudioVisualization: React.FC<VoiceCallInterfaceLayoutAudioVisualizationProps> = ({
  children,
  audio,
  participants = [],
  showWaveform = true,
  showSpectrum = false,
  showParticipantLevels = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render audio visualization
  useEffect(() => {
    if (!audio?.enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showWaveform && audio.waveformData?.length > 0) {
      // Draw waveform
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const sliceWidth = canvas.width / audio.waveformData.length;
      let x = 0;
      
      for (let i = 0; i < audio.waveformData.length; i++) {
        const v = audio.waveformData[i] / 100.0;
        const y = (v * canvas.height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
    }

    // Draw current level indicator
    if (audio.currentLevel > 0) {
      const levelHeight = (audio.currentLevel / 100) * canvas.height;
      ctx.fillStyle = audio.currentLevel > 80 ? '#EF4444' : '#10B981';
      ctx.fillRect(canvas.width - 20, canvas.height - levelHeight, 15, levelHeight);
    }

  }, [audio, showWaveform, showSpectrum]);

  return (
    <section 
      className={styles.audioVisualization}
      role="region"
      aria-label="Audio visualization"
    >
      <div className={styles.visualizationContainer}>
        {audio?.enabled ? (
          <>
            <div className={styles.visualizationHeader}>
              <h3>Audio Levels</h3>
              <div className={styles.currentLevel}>
                <span>Level: {audio.currentLevel}%</span>
                {audio.currentLevel > 80 && (
                  <span className={styles.levelWarning} aria-live="polite">
                    Audio level high
                  </span>
                )}
              </div>
            </div>
            
            <canvas 
              ref={canvasRef}
              className={styles.visualizationCanvas}
              width={400}
              height={100}
              aria-label="Real-time audio waveform visualization"
            />
          </>
        ) : (
          <div className={styles.visualizationDisabled}>
            <span>Audio visualization disabled</span>
          </div>
        )}

        {showParticipantLevels && participants.length > 0 && (
          <div className={styles.participantLevels}>
            <h4>Participant Audio</h4>
            {participants.map(participant => (
              <div key={participant.id} className={styles.participantLevel}>
                <span className={styles.participantName}>{participant.name}</span>
                <div className={styles.levelBar}>
                  <div 
                    className={styles.levelFill}
                    style={{ width: `${participant.audioLevel}%` }}
                  />
                </div>
                <span className={styles.levelValue}>{participant.audioLevel}%</span>
              </div>
            ))}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
};

// ParticipantPanel compound component
interface VoiceCallInterfaceLayoutParticipantPanelProps {
  children?: ReactNode;
  participants?: CallParticipant[];
  onMuteParticipant?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onPromoteParticipant?: (participantId: string) => void;
}

const VoiceCallInterfaceLayoutParticipantPanel: React.FC<VoiceCallInterfaceLayoutParticipantPanelProps> = ({
  children,
  participants = [],
  onMuteParticipant,
  onRemoveParticipant,
  onPromoteParticipant
}) => {
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'speaking': return '🎤';
      case 'muted': return '🔇';
      case 'on_hold': return '⏸️';
      case 'connecting': return '⏳';
      case 'disconnected': return '❌';
      default: return '👤';
    }
  }, []);

  const getConnectionQualityColor = useCallback((quality: string) => {
    switch (quality) {
      case 'excellent': return styles.qualityExcellent;
      case 'good': return styles.qualityGood;
      case 'fair': return styles.qualityFair;
      case 'poor': return styles.qualityPoor;
      default: return styles.qualityUnknown;
    }
  }, []);

  return (
    <section 
      className={styles.participantPanel}
      role="region"
      aria-label="Call participants"
    >
      <div className={styles.participantContainer}>
        <div className={styles.participantHeader}>
          <h3>Participants ({participants.length})</h3>
        </div>
        
        {participants.length === 0 ? (
          <div className={styles.noParticipants}>
            <p>No participants in call</p>
          </div>
        ) : (
          <div className={styles.participantsList}>
            {participants.map(participant => (
              <div 
                key={participant.id}
                className={`${styles.participantItem} ${participant.isSelf ? styles.self : ''}`}
                role="listitem"
              >
                <div className={styles.participantInfo}>
                  <div className={styles.participantAvatar}>
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={`${participant.name} avatar`} />
                    ) : (
                      <span className={styles.avatarInitial}>
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.participantDetails}>
                    <div className={styles.participantName}>
                      {participant.name}
                      {participant.isHost && (
                        <span className={styles.hostBadge}>Host</span>
                      )}
                      {participant.isSelf && (
                        <span className={styles.selfBadge}>You</span>
                      )}
                    </div>
                    
                    <div className={styles.participantStatus}>
                      <span className={styles.statusIcon}>
                        {getStatusIcon(participant.status)}
                      </span>
                      <span className={styles.statusText}>
                        {participant.status.replace('_', ' ')}
                      </span>
                      <span className={`${styles.connectionQuality} ${getConnectionQualityColor(participant.connectionQuality)}`}>
                        {participant.connectionQuality}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!participant.isSelf && (
                  <div className={styles.participantActions}>
                    {onMuteParticipant && (
                      <button 
                        className={styles.participantActionButton}
                        onClick={() => onMuteParticipant(participant.id)}
                        aria-label={`Mute ${participant.name}`}
                        title="Mute participant"
                      >
                        🔇
                      </button>
                    )}
                    
                    {onPromoteParticipant && !participant.isHost && (
                      <button 
                        className={styles.participantActionButton}
                        onClick={() => onPromoteParticipant(participant.id)}
                        aria-label={`Promote ${participant.name} to host`}
                        title="Promote to host"
                      >
                        👑
                      </button>
                    )}
                    
                    {onRemoveParticipant && (
                      <button 
                        className={styles.participantActionButton}
                        onClick={() => onRemoveParticipant(participant.id)}
                        aria-label={`Remove ${participant.name} from call`}
                        title="Remove participant"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {children}
      </div>
    </section>
  );
};

// Footer compound component
interface VoiceCallInterfaceLayoutFooterProps {
  children?: ReactNode;
  call?: CallState;
  showQualityMetrics?: boolean;
  showNetworkStatus?: boolean;
}

const VoiceCallInterfaceLayoutFooter: React.FC<VoiceCallInterfaceLayoutFooterProps> = ({
  children,
  call,
  showQualityMetrics = true,
  showNetworkStatus = true
}) => {
  return (
    <footer className={styles.templateFooter} role="contentinfo">
      <div className={styles.footerContent}>
        {showQualityMetrics && call?.callQuality && (
          <div className={styles.qualityMetrics}>
            <span>Latency: {call.callQuality.audioLatency}ms</span>
            <span>Packets Lost: {call.callQuality.packetsLost}</span>
            <span>Stability: {call.callQuality.connectionStability}</span>
            <span>Bandwidth: {call.callQuality.bandwidth} kbps</span>
          </div>
        )}
        
        {showNetworkStatus && (
          <div className={styles.networkStatus}>
            <span className={styles.networkIcon}>📶</span>
            <span>Network: {call?.callQuality?.connectionStability || 'Unknown'}</span>
          </div>
        )}
        
        {children}
      </div>
    </footer>
  );
};

// Main template component
const VoiceCallInterfaceLayoutComponent = forwardRef<VoiceCallInterfaceLayoutRef, VoiceCallInterfaceLayoutProps>(
  ({ 
    className = '', 
    initialCall,
    onCallStateChange,
    onParticipantUpdate,
    onCallEnd,
    onError,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    enableAudioVisualization = true,
    enableRecording = false,
    maxParticipants = 50,
    children
  }, ref) => {
    
    // Performance tracking for <500ms template render SLA
    const renderStartTime = useRef<number>(Date.now());
    
    // Template state
    const [state, setState] = useState<VoiceCallInterfaceLayoutState>({
      call: {
        status: 'idle',
        duration: 0,
        startTime: null,
        endTime: null,
        callId: null,
        isRecording: false,
        isMuted: false,
        isOnHold: false,
        volume: 75,
        participants: [],
        activeParticipantId: null,
        callQuality: {
          audioLatency: 0,
          packetsLost: 0,
          connectionStability: 'stable',
          bandwidth: 0
        },
        errors: [],
        ...initialCall
      },
      audio: {
        enabled: enableAudioVisualization,
        waveformData: [],
        spectrumData: [],
        currentLevel: 0,
        peakLevel: 0,
        backgroundNoise: 0
      },
      settings: {
        noiseReduction: true,
        echoCancellation: true,
        autoGainControl: true,
        preferredDeviceId: null,
        ringtoneVolume: 80,
        notificationSounds: true
      },
      ui: {
        activePanel: 'controls',
        isExpanded: true,
        showVisualization: enableAudioVisualization,
        showCaptions: false
      },
      accessibility: {
        currentFocus: '',
        announcements: [],
        callStatus: 'Ready for call',
        participantUpdates: []
      }
    });
    
    // Refs for component coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const orchestratorRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Template-level accessibility announcements
    const announceCallStatus = useCallback((message: string) => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute('aria-live', 'assertive');
        announcementRef.current.textContent = message;
        
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
    }, []);

    // Performance monitoring
    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      
      if (enforceSLA && renderTime > 500) {
        console.warn(`[VoiceCallInterfaceLayout] Template render SLA violation: ${renderTime}ms > 500ms`);
      }
    }, [enforceSLA]);

    // Template API implementation
    useImperativeHandle(ref, () => ({
      startCall: async (participantId: string) => {
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            status: 'dialing',
            startTime: new Date(),
            callId: `call_${Date.now()}`
          }
        }));
        announceCallStatus('Starting call');
      },
      endCall: async (reason = 'user_hangup') => {
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            status: 'ending',
            endTime: new Date()
          }
        }));
        announceCallStatus('Ending call');
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            call: { ...prev.call, status: 'ended' }
          }));
          onCallEnd?.(state.call.duration, reason);
        }, 1000);
      },
      answerCall: async () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, status: 'connected', startTime: new Date() }
        }));
        announceCallStatus('Call connected');
      },
      rejectCall: async () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, status: 'ended' }
        }));
        announceCallStatus('Call rejected');
      },
      mute: () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, isMuted: true }
        }));
        announceCallStatus('Microphone muted');
      },
      unmute: () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, isMuted: false }
        }));
        announceCallStatus('Microphone unmuted');
      },
      toggleMute: () => {
        const newMutedState = !state.call.isMuted;
        setState(prev => ({
          ...prev,
          call: { ...prev.call, isMuted: newMutedState }
        }));
        announceCallStatus(newMutedState ? 'Microphone muted' : 'Microphone unmuted');
      },
      setVolume: (level: number) => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, volume: Math.max(0, Math.min(100, level)) }
        }));
      },
      hold: async () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, isOnHold: true }
        }));
        announceCallStatus('Call on hold');
      },
      unhold: async () => {
        setState(prev => ({
          ...prev,
          call: { ...prev.call, isOnHold: false }
        }));
        announceCallStatus('Call resumed');
      },
      addParticipant: (participant: CallParticipant) => {
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            participants: [...prev.call.participants, participant]
          }
        }));
        announceCallStatus(`${participant.name} joined the call`);
        onParticipantUpdate?.(participant);
      },
      removeParticipant: (participantId: string) => {
        const participant = state.call.participants.find(p => p.id === participantId);
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            participants: prev.call.participants.filter(p => p.id !== participantId)
          }
        }));
        if (participant) {
          announceCallStatus(`${participant.name} left the call`);
        }
      },
      muteParticipant: (participantId: string) => {
        setState(prev => ({
          ...prev,
          call: {
            ...prev.call,
            participants: prev.call.participants.map(p => 
              p.id === participantId ? { ...p, status: 'muted' as const } : p
            )
          }
        }));
      },
      focusCallControls: () => {
        const controlsSection = containerRef.current?.querySelector('[role="toolbar"]');
        if (controlsSection && 'focus' in controlsSection) {
          (controlsSection as HTMLElement).focus();
        }
      },
      announceCallStatus,
      getCallMetrics: () => ({
        duration: state.call.duration,
        participants: state.call.participants.length,
        quality: state.call.callQuality,
        errors: state.call.errors.length
      }),
      validatePerformanceSLA: () => {
        const renderTime = Date.now() - renderStartTime.current;
        return renderTime <= 500;
      }
    }));

    return (
      <div 
        className={`${styles.templateContainer} ${className}`}
        ref={containerRef}
        role="main"
        aria-label="Voice call interface"
      >
        {/* Accessibility announcements */}
        <div
          ref={announcementRef}
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
        />
        
        {/* Multi-modal orchestration (hidden but active) */}
        <MultiModalOrchestrator
          ref={orchestratorRef}
          className={styles.hiddenOrchestrator}
        />
        
        {/* Accessibility fusion layer */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          className={styles.hiddenFusion}
        />
        
        {children}
      </div>
    );
  }
);

// Attach compound components
type VoiceCallInterfaceLayoutComponents = {
  Header: typeof VoiceCallInterfaceLayoutHeader;
  CallControls: typeof VoiceCallInterfaceLayoutCallControls;
  AudioVisualization: typeof VoiceCallInterfaceLayoutAudioVisualization;
  ParticipantPanel: typeof VoiceCallInterfaceLayoutParticipantPanel;
  Footer: typeof VoiceCallInterfaceLayoutFooter;
};

const VoiceCallInterfaceLayout = VoiceCallInterfaceLayoutComponent as typeof VoiceCallInterfaceLayoutComponent & VoiceCallInterfaceLayoutComponents;

VoiceCallInterfaceLayout.Header = VoiceCallInterfaceLayoutHeader;
VoiceCallInterfaceLayout.CallControls = VoiceCallInterfaceLayoutCallControls;
VoiceCallInterfaceLayout.AudioVisualization = VoiceCallInterfaceLayoutAudioVisualization;
VoiceCallInterfaceLayout.ParticipantPanel = VoiceCallInterfaceLayoutParticipantPanel;
VoiceCallInterfaceLayout.Footer = VoiceCallInterfaceLayoutFooter;

VoiceCallInterfaceLayout.displayName = 'VoiceCallInterfaceLayout';

export { VoiceCallInterfaceLayout };
export type { 
  VoiceCallInterfaceLayoutProps, 
  VoiceCallInterfaceLayoutRef,
  CallParticipant,
  CallState,
  AudioVisualization
};
