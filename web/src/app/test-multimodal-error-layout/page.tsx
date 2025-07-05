'use client';

import React, { useRef, useState, useCallback } from 'react';
import { 
  MultiModalErrorLayout, 
  MultiModalErrorLayoutRef,
  SystemError,
  ModalityErrorType,
  RecoveryPlan
} from '../../components/messaging/multimodalerrorlayout';

// Sample system errors for testing
const createSampleError = (
  type: ModalityErrorType,
  modality: 'camera' | 'voice' | 'text' | 'visual_search' | 'network' | 'system',
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string
): SystemError => ({
  id: `error_${Date.now()}_${Math.random()}`,
  type,
  modality,
  severity,
  message,
  recoverable: severity !== 'critical',
  timestamp: new Date(),
  retryCount: 0,
  maxRetries: 3,
  context: { source: 'test_page' },
  relatedErrors: [],
  userImpact: severity === 'critical' ? 'blocking' : severity === 'high' ? 'major' : 'minor',
  recoveryActions: ['retry', 'settings_adjustment', 'manual_intervention']
});

const sampleErrors: SystemError[] = [
  createSampleError(
    'camera_permission_denied',
    'camera',
    'high',
    'Camera permission was denied. Please allow camera access to use visual search features.'
  ),
  createSampleError(
    'voice_connection_failed',
    'voice',
    'medium',
    'Voice service connection failed. Check your network connection and try again.'
  ),
  createSampleError(
    'network_timeout',
    'network',
    'medium',
    'Network request timed out. Please check your internet connection.'
  ),
  createSampleError(
    'visual_search_failed',
    'visual_search',
    'low',
    'Visual search processing failed. The image may be unclear or unsupported.'
  )
];

const sampleCriticalError: SystemError = createSampleError(
  'browser_unsupported',
  'system',
  'critical',
  'Your browser does not support required features. Please update your browser or use a supported browser.'
);

const sampleRecoveryPlans: RecoveryPlan[] = [
  {
    planId: 'plan_parallel_recovery',
    errors: ['error_1', 'error_2'],
    strategy: 'parallel_recovery',
    steps: [
      {
        stepId: 'step_1',
        action: 'retry',
        targetModality: 'camera',
        expectedDuration: 2000,
        isAutomated: true,
        successCriteria: 'Camera access granted',
        fallbackAction: 'settings_adjustment'
      },
      {
        stepId: 'step_2', 
        action: 'fallback_modality',
        targetModality: 'voice',
        expectedDuration: 1000,
        isAutomated: true,
        successCriteria: 'Voice modality activated'
      }
    ],
    estimatedRecoveryTime: 3000,
    successProbability: 0.85,
    userConfirmationRequired: false
  },
  {
    planId: 'plan_manual_intervention',
    errors: ['error_3'],
    strategy: 'manual_override',
    steps: [
      {
        stepId: 'step_1',
        action: 'manual_intervention',
        expectedDuration: 30000,
        isAutomated: false,
        successCriteria: 'User completes manual setup'
      },
      {
        stepId: 'step_2',
        action: 'system_restart',
        expectedDuration: 5000,
        isAutomated: true,
        successCriteria: 'System fully restarted'
      }
    ],
    estimatedRecoveryTime: 35000,
    successProbability: 0.95,
    userConfirmationRequired: true
  }
];

export default function TestMultiModalErrorLayoutPage() {
  const layoutRef = useRef<MultiModalErrorLayoutRef>(null);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [activeRecovery, setActiveRecovery] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState({
    overallStatus: 'healthy' as const,
    modalityStatus: {
      camera: 'operational' as const,
      voice: 'operational' as const,
      text: 'operational' as const,
      visual_search: 'operational' as const,
      network: 'operational' as const,
      system: 'operational' as const
    },
    lastHealthCheck: Date.now(),
    performanceMetrics: {
      errorRate: 0.05,
      recoverySuccessRate: 0.92,
      averageRecoveryTime: 2500,
      slaCompliance: true
    }
  });

  // Simulate adding different types of errors
  const handleAddSampleError = useCallback(() => {
    const randomError = sampleErrors[Math.floor(Math.random() * sampleErrors.length)];
    const newError = {
      ...randomError,
      id: `error_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };
    
    setErrors(prev => [...prev, newError]);
    setSystemHealth(prev => ({
      ...prev,
      overallStatus: newError.severity === 'critical' ? 'critical' : 'degraded',
      modalityStatus: {
        ...prev.modalityStatus,
        [newError.modality]: newError.severity === 'critical' ? 'failed' : 'degraded'
      }
    }));
  }, []);

  const handleAddCriticalError = useCallback(() => {
    const criticalError = {
      ...sampleCriticalError,
      id: `critical_error_${Date.now()}`,
      timestamp: new Date()
    };
    
    setErrors(prev => [...prev, criticalError]);
    setSystemHealth(prev => ({
      ...prev,
      overallStatus: 'critical',
      modalityStatus: {
        ...prev.modalityStatus,
        system: 'failed'
      }
    }));
  }, []);

  const handleClearAllErrors = useCallback(() => {
    setErrors([]);
    setRecoveryPlans([]);
    setActiveRecovery(null);
    setSystemHealth(prev => ({
      ...prev,
      overallStatus: 'healthy',
      modalityStatus: {
        camera: 'operational',
        voice: 'operational', 
        text: 'operational',
        visual_search: 'operational',
        network: 'operational',
        system: 'operational'
      }
    }));
  }, []);

  const handleAddRecoveryPlans = useCallback(() => {
    setRecoveryPlans(sampleRecoveryPlans);
  }, []);

  const handleExecuteRecovery = useCallback((planId: string) => {
    setActiveRecovery(planId);
    
    // Simulate recovery execution
    setTimeout(() => {
      console.log(`Recovery plan ${planId} executed`);
      setActiveRecovery(null);
      
      // Remove some errors to simulate successful recovery
      setErrors(prev => prev.slice(0, -1));
      
      if (errors.length <= 1) {
        setSystemHealth(prev => ({
          ...prev,
          overallStatus: 'healthy',
          modalityStatus: {
            ...prev.modalityStatus,
            camera: 'operational',
            voice: 'operational',
            text: 'operational'
          }
        }));
      }
    }, 3000);
  }, [errors.length]);

  const handleErrorResolved = useCallback((error: SystemError) => {
    console.log('Error resolved:', error);
    setErrors(prev => prev.filter(e => e.id !== error.id));
  }, []);

  const handleSystemRestart = useCallback(() => {
    console.log('System restart requested');
    handleClearAllErrors();
    
    // Simulate restart delay
    setTimeout(() => {
      console.log('System restarted successfully');
    }, 2000);
  }, [handleClearAllErrors]);

  const handleContactSupport = useCallback(() => {
    console.log('Contact support requested');
    alert('Support contact feature would open here');
  }, []);

  const handleRefreshSystem = useCallback(() => {
    console.log('System refresh requested');
    setSystemHealth(prev => ({
      ...prev,
      lastHealthCheck: Date.now()
    }));
  }, []);

  const handleExportErrorLog = useCallback(() => {
    console.log('Export error log requested');
    const errorLog = {
      timestamp: new Date().toISOString(),
      errors: errors,
      systemHealth: systemHealth,
      recoveryPlans: recoveryPlans
    };
    
    const blob = new Blob([JSON.stringify(errorLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [errors, systemHealth, recoveryPlans]);

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
        <h2 style={{ margin: '0 1rem 0 0', fontSize: '1.25rem' }}>MultiModalErrorLayout Test</h2>
        
        <button 
          onClick={handleAddSampleError}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Add Random Error
        </button>
        
        <button 
          onClick={handleAddCriticalError}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#dc2626', color: 'white' }}
        >
          Add Critical Error
        </button>
        
        <button 
          onClick={handleAddRecoveryPlans}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#059669', color: 'white' }}
        >
          Add Recovery Plans
        </button>
        
        <button 
          onClick={handleClearAllErrors}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: '#6b7280', color: 'white' }}
        >
          Clear All
        </button>
      </div>

      <div style={{ paddingTop: '5rem', height: '100vh' }}>
        <MultiModalErrorLayout
          ref={layoutRef}
          errors={errors}
          enableAutomaticRecovery={true}
          enableGracefulDegradation={true}
          maxConcurrentErrors={10}
          recoveryTimeoutMs={30000}
          enforceSLA={true}
          accessibilityLevel="AAA"
          onErrorResolved={handleErrorResolved}
          onRecoveryPlanExecuted={() => console.log('Recovery plan executed')}
          onDegradationActivated={() => console.log('Graceful degradation activated')}
          onUserActionRequired={(actions) => console.log('User action required:', actions)}
          onPerformanceMetric={(metric, value) => console.log(`Performance metric ${metric}: ${value}`)}
        >
          <MultiModalErrorLayout.Header 
            systemHealth={systemHealth}
            showSystemStatus={true}
            showErrorCount={true}
            onSystemRestart={handleSystemRestart}
            onContactSupport={handleContactSupport}
          />
          
          <MultiModalErrorLayout.ErrorPanel 
            errors={errors}
            showErrorDetails={true}
            groupByModality={true}
            onErrorSelect={(error) => console.log('Error selected:', error)}
            onErrorDismiss={(errorId) => {
              setErrors(prev => prev.filter(e => e.id !== errorId));
            }}
          />
          
          <MultiModalErrorLayout.RecoveryPanel 
            recoveryPlans={recoveryPlans}
            activeRecovery={activeRecovery}
            onExecuteRecovery={handleExecuteRecovery}
            onCreateCustomPlan={() => console.log('Create custom plan requested')}
          />
          
          <MultiModalErrorLayout.DegradationPanel 
            degradation={{
              degradationLevel: errors.length > 2 ? 'partial' : 'none',
              availableModalities: ['text', 'voice'],
              disabledFeatures: ['camera', 'visual_search'],
              alternativeWorkflows: [
                {
                  originalFeature: 'Visual Search',
                  alternativeApproach: 'Text Description',
                  userGuidance: 'Describe the item you are looking for instead of taking a photo'
                }
              ],
              userNotifications: []
            }}
            onActivateDegradation={(level) => console.log('Activate degradation:', level)}
            onRestoreFullFunctionality={() => {
              console.log('Restore full functionality requested');
              handleClearAllErrors();
            }}
          />
          
          <MultiModalErrorLayout.Controls 
            onClearAllErrors={handleClearAllErrors}
            onRefreshSystem={handleRefreshSystem}
            onExportErrorLog={handleExportErrorLog}
            hasActiveErrors={errors.length > 0}
          />
          
          <MultiModalErrorLayout.Footer 
            systemHealth={systemHealth}
            showPerformanceMetrics={true}
            showLastUpdate={true}
          />
        </MultiModalErrorLayout>
      </div>
    </div>
  );
}
