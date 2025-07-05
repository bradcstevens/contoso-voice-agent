'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  VoiceCallInterfaceLayout, 
  VoiceCallInterfaceLayoutRef,
  CallParticipant,
  CallState,
  AudioVisualization
} from '../../components/messaging/voicecallinterfacelayout';

// Sample participants for testing
const sampleParticipants: CallParticipant[] = [
  {
    id: 'self',
    name: 'You',
    email: 'you@contoso.com',
    status: 'connected',
    audioLevel: 65,
    connectionQuality: 'excellent',
    joinTime: new Date(),
    isSelf: true,
    isHost: true
  },
  {
    id: 'participant_1',
    name: 'Alice Johnson',
    email: 'alice@contoso.com',
    status: 'speaking',
    audioLevel: 85,
    connectionQuality: 'good',
    joinTime: new Date(Date.now() - 120000),
    isSelf: false,
    isHost: false
  },
  {
    id: 'participant_2',
    name: 'Bob Smith',
    email: 'bob@contoso.com',
    status: 'muted',
    audioLevel: 0,
    connectionQuality: 'fair',
    joinTime: new Date(Date.now() - 300000),
    isSelf: false,
    isHost: false
  },
  {
    id: 'participant_3',
    name: 'Carol Davis',
    phoneNumber: '+1-555-0123',
    status: 'connected',
    audioLevel: 45,
    connectionQuality: 'excellent',
    joinTime: new Date(Date.now() - 60000),
    isSelf: false,
    isHost: false
  }
];

export default function TestVoiceCallLayoutPage() {
  const layoutRef = useRef<VoiceCallInterfaceLayoutRef>(null);
  const [callState, setCallState] = useState<CallState>({
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
      audioLatency: 45,
      packetsLost: 0,
      connectionStability: 'stable',
      bandwidth: 128
    },
    errors: []
  });

  const [audioVisualization, setAudioVisualization] = useState<AudioVisualization>({
    enabled: true,
    waveformData: [],
    spectrumData: [],
    currentLevel: 0,
    peakLevel: 0,
    backgroundNoise: 15
  });

  const [isExpanded, setIsExpanded] = useState(true);

  // Simulate call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState.status === 'connected' && callState.startTime) {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - (prev.startTime?.getTime() || Date.now())) / 1000)
        }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.status, callState.startTime]);

  // Simulate audio visualization data
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (audioVisualization.enabled && callState.status === 'connected') {
      interval = setInterval(() => {
        setAudioVisualization(prev => ({
          ...prev,
          currentLevel: Math.floor(Math.random() * 100),
          waveformData: Array.from({ length: 50 }, () => Math.random() * 100),
          peakLevel: Math.floor(Math.random() * 100)
        }));
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioVisualization.enabled, callState.status]);

  // Simulate participant audio levels
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callState.status === 'connected' && callState.participants.length > 0) {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.map(participant => ({
            ...participant,
            audioLevel: participant.status === 'speaking' 
              ? Math.floor(Math.random() * 40) + 60
              : participant.status === 'muted' 
                ? 0 
                : Math.floor(Math.random() * 30) + 10
          }))
        }));
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.status, callState.participants.length]);

  const handleStartCall = useCallback(() => {
    setCallState(prev => ({
      ...prev,
      status: 'dialing',
      callId: `call_${Date.now()}`,
      startTime: new Date()
    }));
    
    // Simulate connection process
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        status: 'connected',
        participants: sampleParticipants
      }));
    }, 2000);
  }, []);

  const handleEndCall = useCallback(() => {
    layoutRef.current?.endCall('user_hangup');
    setCallState(prev => ({
      ...prev,
      status: 'ending',
      endTime: new Date()
    }));
    
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        status: 'ended',
        participants: [],
        duration: 0
      }));
    }, 1000);
  }, []);

  const handleMute = useCallback(() => {
    layoutRef.current?.toggleMute();
    setCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  }, []);

  const handleHold = useCallback(() => {
    if (callState.isOnHold) {
      layoutRef.current?.unhold();
    } else {
      layoutRef.current?.hold();
    }
    setCallState(prev => ({
      ...prev,
      isOnHold: !prev.isOnHold
    }));
  }, [callState.isOnHold]);

  const handleRecord = useCallback(() => {
    setCallState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
  }, []);

  const handleTransfer = useCallback(() => {
    console.log('Transfer call functionality would open here');
    alert('Transfer call feature would open transfer dialog');
  }, []);

  const handleMuteParticipant = useCallback((participantId: string) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, status: 'muted' as const, audioLevel: 0 } : p
      )
    }));
  }, []);

  const handleRemoveParticipant = useCallback((participantId: string) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }));
  }, []);

  const handlePromoteParticipant = useCallback((participantId: string) => {
    setCallState(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, isHost: true } : p
      )
    }));
  }, []);

  const handleAddParticipant = useCallback(() => {
    const newParticipant: CallParticipant = {
      id: `participant_${Date.now()}`,
      name: `New Participant ${callState.participants.length + 1}`,
      email: `participant${callState.participants.length + 1}@contoso.com`,
      status: 'connecting',
      audioLevel: 0,
      connectionQuality: 'good',
      joinTime: new Date(),
      isSelf: false,
      isHost: false
    };

    layoutRef.current?.addParticipant(newParticipant);
    setCallState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));

    // Simulate connection
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === newParticipant.id ? { ...p, status: 'connected' as const } : p
        )
      }));
    }, 1500);
  }, [callState.participants.length]);

  const handleToggleVisualization = useCallback(() => {
    setAudioVisualization(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    layoutRef.current?.setVolume(volume);
    setCallState(prev => ({
      ...prev,
      volume
    }));
  }, []);

  return (
    <div style={{ height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        background: '#f0f0f0', 
        padding: '1rem',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: '0 1rem 0 0', fontSize: '1.25rem' }}>VoiceCallInterfaceLayout Test</h2>
        
        <button 
          onClick={handleStartCall}
          disabled={callState.status !== 'idle' && callState.status !== 'ended'}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#10B981', color: 'white' }}
        >
          Start Call
        </button>
        
        <button 
          onClick={handleEndCall}
          disabled={callState.status === 'idle' || callState.status === 'ended'}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#EF4444', color: 'white' }}
        >
          End Call
        </button>
        
        <button 
          onClick={handleAddParticipant}
          disabled={callState.status !== 'connected'}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#3B82F6', color: 'white' }}
        >
          Add Participant
        </button>
        
        <button 
          onClick={handleToggleVisualization}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#8B5CF6', color: 'white' }}
        >
          Toggle Visualization
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem' }}>Volume:</span>
          <input 
            type="range"
            min="0"
            max="100"
            value={callState.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            style={{ width: '100px' }}
          />
          <span style={{ fontSize: '0.875rem' }}>{callState.volume}%</span>
        </div>
      </div>

      <div style={{ paddingTop: '5rem', height: '100vh' }}>
        <VoiceCallInterfaceLayout
          ref={layoutRef}
          initialCall={callState}
          onCallStateChange={(state) => console.log('Call state changed:', state)}
          onParticipantUpdate={(participant) => console.log('Participant updated:', participant)}
          onCallEnd={(duration, reason) => console.log(`Call ended after ${duration}s: ${reason}`)}
          onError={(error) => console.error('Call error:', error)}
          enforceSLA={true}
          accessibilityLevel="AAA"
          enableAudioVisualization={audioVisualization.enabled}
          enableRecording={true}
          maxParticipants={10}
        >
          <VoiceCallInterfaceLayout.Header 
            call={callState}
            showDuration={true}
            showParticipantCount={true}
            onMinimize={() => setIsExpanded(false)}
            onMaximize={() => setIsExpanded(true)}
          />
          
          <VoiceCallInterfaceLayout.CallControls 
            call={callState}
            onMute={handleMute}
            onUnmute={handleMute}
            onHold={handleHold}
            onUnhold={handleHold}
            onEndCall={handleEndCall}
            onTransfer={handleTransfer}
            onRecord={handleRecord}
            disabled={callState.status !== 'connected'}
          />
          
          <VoiceCallInterfaceLayout.AudioVisualization 
            audio={audioVisualization}
            participants={callState.participants}
            showWaveform={true}
            showSpectrum={false}
            showParticipantLevels={true}
          />
          
          <VoiceCallInterfaceLayout.ParticipantPanel 
            participants={callState.participants}
            onMuteParticipant={handleMuteParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onPromoteParticipant={handlePromoteParticipant}
          />
          
          <VoiceCallInterfaceLayout.Footer 
            call={callState}
            showQualityMetrics={true}
            showNetworkStatus={true}
          />
        </VoiceCallInterfaceLayout>
      </div>
    </div>
  );
}
