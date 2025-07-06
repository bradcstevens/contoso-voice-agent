'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraPermissionFlow, useCameraPermissionFlow } from '@/components/messaging/camerapermissionflow';
import { useRouter } from 'next/navigation';
import { FiCamera, FiSearch, FiShoppingBag, FiEye, FiArrowRight, FiCheck, FiInfo, FiHelpCircle, FiSettings } from 'react-icons/fi';
import styles from './page.module.css';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  benefits: string[];
}

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'visual-search',
    title: 'Visual Product Search',
    description: 'Take photos of products to instantly find matches, similar items, and detailed information.',
    icon: FiSearch,
    benefits: [
      'Instant product identification',
      'Find similar and related items',
      'Access detailed specifications',
      'Compare prices and reviews'
    ]
  },
  {
    id: 'smart-shopping',
    title: 'Smart Shopping Assistant',
    description: 'Get personalized recommendations and shopping guidance based on what you see.',
    icon: FiShoppingBag,
    benefits: [
      'Personalized product recommendations',
      'Real-time inventory checking',
      'Price comparison and deals',
      'Smart shopping lists'
    ]
  },
  {
    id: 'accessibility',
    title: 'Enhanced Accessibility',
    description: 'Camera features include voice descriptions and accessibility-first design.',
    icon: FiEye,
    benefits: [
      'Voice-guided navigation',
      'High contrast support',
      'Screen reader optimized',
      'Keyboard navigation ready'
    ]
  }
];

/**
 * CameraPermissionOnboarding Page
 * 
 * Provides comprehensive user education and camera permission flow with:
 * - WCAG AAA accessibility compliance
 * - Progressive disclosure of information
 * - Clear user benefits and use cases
 * - Comprehensive permission flow integration
 * - Fallback options for camera-disabled experiences
 */
export default function CameraPermissionOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPermissionFlow, setShowPermissionFlow] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false
  });

  // Camera permission flow management
  const {
    flowState,
    isFlowComplete,
    hasStream,
    handleFlowComplete,
    handleCameraGranted,
    resetFlow,
    isGranted,
    hasError
  } = useCameraPermissionFlow();

  // Focus management
  const mainContentRef = useRef<HTMLElement>(null);
  const permissionSectionRef = useRef<HTMLDivElement>(null);

  // Detect accessibility preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    setAccessibilitySettings({
      reducedMotion: mediaQuery.matches,
      highContrast: contrastQuery.matches,
      largeText: false // Could be detected from user agent or settings
    });

    // Listen for changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setAccessibilitySettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setAccessibilitySettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setAnnouncement(`Now showing step ${currentStep + 2} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[currentStep + 1].title}`);
    } else {
      setShowPermissionFlow(true);
      setAnnouncement('Ready to enable camera permissions. Please review the camera permission section below.');
      
      // Focus the permission section
      setTimeout(() => {
        permissionSectionRef.current?.scrollIntoView({ 
          behavior: accessibilitySettings.reducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
        permissionSectionRef.current?.focus();
      }, 100);
    }
  }, [currentStep, accessibilitySettings.reducedMotion]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setAnnouncement(`Now showing step ${currentStep} of ${ONBOARDING_STEPS.length}: ${ONBOARDING_STEPS[currentStep - 1].title}`);
    }
  }, [currentStep]);

  const handleSkipToPermission = useCallback(() => {
    setShowPermissionFlow(true);
    setAnnouncement('Skipped to camera permission section.');
    setTimeout(() => {
      permissionSectionRef.current?.scrollIntoView({ 
        behavior: accessibilitySettings.reducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      permissionSectionRef.current?.focus();
    }, 100);
  }, [accessibilitySettings.reducedMotion]);

  // Handle successful camera permission
  const handleCameraSuccess = useCallback((stream: MediaStream) => {
    handleCameraGranted(stream);
    setAnnouncement('Camera permission granted successfully. Redirecting to enhanced chat experience.');
    
    // Redirect to enhanced chat after brief delay
    setTimeout(() => {
      router.push('/enhanced-chat-with-camera');
    }, 2000);
  }, [handleCameraGranted, router]);

  // Handle permission flow completion
  const handlePermissionComplete = useCallback((success: boolean) => {
    handleFlowComplete(success);
    
    if (success) {
      setAnnouncement('Camera permission granted. You can now use all visual search features.');
    } else {
      setAnnouncement('Camera permission was not granted. You can still use text-based features or try again.');
    }
  }, [handleFlowComplete]);

  // Handle continue without camera
  const handleContinueWithoutCamera = useCallback(() => {
    setAnnouncement('Continuing without camera. You can enable camera features later from settings.');
    router.push('/');
  }, [router]);

  // Handle retry permission
  const handleRetryPermission = useCallback(() => {
    resetFlow();
    setAnnouncement('Resetting camera permission flow. Please try again.');
  }, [resetFlow]);

  // Render onboarding step
  const renderOnboardingStep = (step: OnboardingStep, index: number) => {
    const IconComponent = step.icon;
    const isCurrentStep = index === currentStep;
    
    return (
      <div 
        key={step.id}
        className={`${styles.stepCard} ${isCurrentStep ? styles.activeStep : ''}`}
        role="tabpanel"
        aria-labelledby={`step-${index}-tab`}
        tabIndex={isCurrentStep ? 0 : -1}
      >
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <IconComponent aria-hidden="true" />
          </div>
          <h3>{step.title}</h3>
        </div>
        
        <p className={styles.stepDescription}>{step.description}</p>
        
        <div className={styles.benefitsList}>
          <h4>Key Benefits:</h4>
          <ul>
            {step.benefits.map((benefit, benefitIndex) => (
              <li key={benefitIndex}>
                <FiCheck aria-hidden="true" className={styles.checkIcon} />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Render permission flow section
  const renderPermissionSection = () => (
    <section 
      ref={permissionSectionRef}
      className={styles.permissionSection}
      tabIndex={-1}
      aria-labelledby="permission-heading"
    >
      <h2 id="permission-heading">Enable Camera Access</h2>
      
      {!isFlowComplete && (
        <div className={styles.permissionIntro}>
          <p>
            To use visual search features, we need access to your camera. 
            This allows you to take photos of products for instant identification and recommendations.
          </p>
          <div className={styles.privacyNote}>
            <FiInfo aria-hidden="true" />
            <span>
              <strong>Privacy:</strong> Images are processed securely and not stored permanently. 
              You can revoke camera access at any time in your browser settings.
            </span>
          </div>
        </div>
      )}

      <div className={styles.permissionFlow}>
        <CameraPermissionFlow
          onCameraGranted={handleCameraSuccess}
          onFlowComplete={handlePermissionComplete}
          showAdvancedOptions={true}
          autoStart={false}
          compact={false}
          className={styles.flowComponent}
        />
      </div>

      {/* Fallback options */}
      <div className={styles.fallbackOptions}>
        <h3>Alternative Options</h3>
        <div className={styles.optionsGrid}>
          <button 
            onClick={handleContinueWithoutCamera}
            className={styles.fallbackButton}
            aria-describedby="no-camera-description"
          >
            <FiArrowRight aria-hidden="true" />
            Continue Without Camera
          </button>
          <div id="no-camera-description" className="sr-only">
            Continue to use text-based search and features without camera access
          </div>
          
          {hasError && (
            <button 
              onClick={handleRetryPermission}
              className={styles.retryButton}
              aria-describedby="retry-description"
            >
              <FiSettings aria-hidden="true" />
              Try Again
            </button>
          )}
          <div id="retry-description" className="sr-only">
            Reset and retry the camera permission process
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <main 
        ref={mainContentRef}
        className={`${styles.pageContainer} ${accessibilitySettings.highContrast ? styles.highContrast : ''}`}
      >
        {/* Page header */}
        <header className={styles.pageHeader}>
          <h1>Camera Features Setup</h1>
          <p className={styles.pageDescription}>
            Discover how camera features enhance your shopping experience with visual search, 
            smart recommendations, and accessibility-first design.
          </p>
        </header>

        {/* Skip navigation for screen readers */}
        <nav className={styles.skipNav}>
          <button 
            onClick={handleSkipToPermission}
            className={styles.skipButton}
          >
            Skip to Camera Permission
          </button>
        </nav>

        {/* Onboarding steps */}
        {!showPermissionFlow && (
          <section className={styles.onboardingSection} aria-labelledby="onboarding-heading">
            <h2 id="onboarding-heading">Camera Features Overview</h2>
            
            {/* Step indicator */}
            <div className={styles.stepIndicator} role="tablist" aria-label="Onboarding steps">
              {ONBOARDING_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  id={`step-${index}-tab`}
                  role="tab"
                  className={`${styles.stepTab} ${index === currentStep ? styles.activeTab : ''} ${index < currentStep ? styles.completedTab : ''}`}
                  aria-selected={index === currentStep}
                  aria-controls={`step-${index}-panel`}
                  onClick={() => setCurrentStep(index)}
                  tabIndex={index === currentStep ? 0 : -1}
                >
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </button>
              ))}
            </div>

            {/* Current step content */}
            <div className={styles.stepContent}>
              {renderOnboardingStep(ONBOARDING_STEPS[currentStep], currentStep)}
            </div>

            {/* Navigation */}
            <div className={styles.stepNavigation}>
              <button 
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                className={styles.navButton}
                aria-label="Go to previous step"
              >
                Previous
              </button>
              
              <span className={styles.stepCounter} aria-live="polite">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
              
              <button 
                onClick={handleNextStep}
                className={styles.navButton}
                aria-label={
                  currentStep === ONBOARDING_STEPS.length - 1 
                    ? "Proceed to camera setup" 
                    : "Go to next step"
                }
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Enable Camera' : 'Next'}
                <FiArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {/* Permission flow section */}
        {showPermissionFlow && renderPermissionSection()}

        {/* Success state - redirect message */}
        {isGranted && (
          <section className={styles.successSection} aria-labelledby="success-heading">
            <h2 id="success-heading">Camera Setup Complete!</h2>
            <p>
              Camera access has been granted successfully. You'll be redirected to the enhanced chat experience 
              where you can start using visual search features.
            </p>
            <div className={styles.loadingIndicator} role="status" aria-label="Redirecting to enhanced chat">
              <div className={styles.spinner}></div>
              <span>Redirecting to Enhanced Chat...</span>
            </div>
          </section>
        )}

        {/* Accessibility notice */}
        <footer className={styles.accessibilityFooter}>
          <details className={styles.accessibilityDetails}>
            <summary>
              <FiHelpCircle aria-hidden="true" />
              Accessibility Information
            </summary>
            <div className={styles.accessibilityContent}>
              <h3>Accessibility Features</h3>
              <ul>
                <li>Full keyboard navigation support</li>
                <li>Screen reader optimized with ARIA labels</li>
                <li>High contrast mode detection</li>
                <li>Reduced motion preference support</li>
                <li>Voice guidance for camera features</li>
                <li>Alternative text-based workflows</li>
              </ul>
              <p>
                If you experience any accessibility issues, please contact our support team. 
                All features are available through alternative interaction methods.
              </p>
            </div>
          </details>
        </footer>
      </main>
    </>
  );
} 