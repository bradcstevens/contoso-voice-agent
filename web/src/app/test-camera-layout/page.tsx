'use client';

import React from 'react';
import { CameraEnabledChatLayout } from '@/components/messaging/cameraenabledchatlayout';

export default function TestCameraLayoutPage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <CameraEnabledChatLayout
        defaultPanel="split"
        enableVoice={true}
        enableFileUpload={true}
        enforceSLA={true}
        accessibilityLevel="AAA"
        onPanelChange={(panel) => console.log('Panel changed to:', panel)}
        onChatMessage={(message) => console.log('Chat message:', message)}
        onCameraCapture={(imageData) => console.log('Camera capture:', imageData.length)}
        onPerformanceMetric={(metric, value) => console.log('Performance:', metric, value)}
      >
        <CameraEnabledChatLayout.Header showPanelSwitcher={true} />
        
        <div style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
          <CameraEnabledChatLayout.ChatPanel 
            enableVoice={true}
            enableFileUpload={true}
          />
          
          <CameraEnabledChatLayout.CameraPanel />
        </div>
        
        <CameraEnabledChatLayout.Controls 
          showMultiModalToggle={true}
        />
        
        <CameraEnabledChatLayout.Footer 
          showPerformanceMetrics={true}
        />
      </CameraEnabledChatLayout>
    </div>
  );
}
