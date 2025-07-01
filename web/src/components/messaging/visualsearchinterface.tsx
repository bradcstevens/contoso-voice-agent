import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react';
import { AdvancedCameraWidget, AdvancedCameraWidgetRef } from './advancedcamerawidget';
import { VisualAnalysisDisplay } from './visualanalysisdisplay';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './visualsearchinterface.module.css';

// Visual search organism interfaces
interface VisualSearchResult {
  id: string;
  productId: number;
  confidence: number;
  matchType: 'exact' | 'similar' | 'category';
  product: {
    name: string;
    price: number;
    description: string;
    category: string;
    brand: string;
    image: string;
    features: string[];
  };
  matchPoints: Array<{
    feature: string;
    confidence: number;
    description: string;
  }>;
}

interface VisualSearchSession {
  sessionId: string;
  capturedImage: string | null;
  searchQuery: string;
  results: VisualSearchResult[];
  searchStartTime: number;
  searchDuration: number;
  interactionHistory: Array<{
    type: 'capture' | 'search' | 'result_view' | 'product_select';
    timestamp: number;
    data: any;
  }>;
}

interface VisualSearchPerformanceMetrics {
  captureTime: number;
  searchProcessingTime: number;
  resultsRenderTime: number;
  totalSearchTime: number;
  accessibilityValidationTime: number;
  resultCount: number;
  confidenceDistribution: Record<string, number>;
}

interface VisualSearchAccessibility {
  resultAnnouncements: Map<string, string>;
  keyboardNavigation: {
    currentResultIndex: number;
    totalResults: number;
    focusMode: 'grid' | 'list' | 'detailed';
  };
  screenReaderContext: {
    searchStatus: string;
    resultsSummary: string;
    currentSelection: string;
  };
}

interface VisualSearchInterfaceState {
  session: VisualSearchSession;
  isSearching: boolean;
  hasResults: boolean;
  selectedResult: VisualSearchResult | null;
  viewMode: 'capture' | 'results' | 'detail';
  performanceMetrics: VisualSearchPerformanceMetrics;
  accessibility: VisualSearchAccessibility;
  error: string | null;
}

interface VisualSearchInterfaceProps {
  className?: string;
  onResultSelect?: (result: VisualSearchResult) => void;
  onSearchComplete?: (results: VisualSearchResult[]) => void;
  onProductView?: (productId: number) => void;
  onError?: (error: string) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  maxResults?: number;
  confidenceThreshold?: number;
  accessibilityLevel?: 'AA' | 'AAA';
  searchApiEndpoint?: string;
  enableRealTimeSearch?: boolean;
  children?: React.ReactNode;
}

export interface VisualSearchInterfaceRef {
  // Search controls
  startSearch: (image?: string) => Promise<void>;
  clearSearch: () => void;
  retrySearch: () => void;
  
  // Result navigation
  selectResult: (resultId: string) => void;
  navigateResults: (direction: 'next' | 'previous') => void;
  setViewMode: (mode: 'capture' | 'results' | 'detail') => void;
  
  // Performance monitoring
  getPerformanceMetrics: () => VisualSearchPerformanceMetrics;
  getSearchSession: () => VisualSearchSession;
  
  // Accessibility controls
  announceSearchStatus: (message: string) => void;
  getAccessibilityContext: () => VisualSearchAccessibility;
  auditResultsAccessibility: () => Promise<any[]>;
}

export const VisualSearchInterface = forwardRef<VisualSearchInterfaceRef, VisualSearchInterfaceProps>(
  ({ 
    className = '', 
    onResultSelect,
    onSearchComplete,
    onProductView,
    onError,
    onPerformanceMetric,
    maxResults = 10,
    confidenceThreshold = 0.6,
    accessibilityLevel = 'AAA',
    searchApiEndpoint = '/api/visual-search',
    enableRealTimeSearch = false,
    children
  }, ref) => {
    
    // Component refs for organism coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const cameraWidgetRef = useRef<AdvancedCameraWidgetRef>(null);
    const analysisDisplayRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const resultsListRef = useRef<HTMLDivElement>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Performance tracking
    const searchStartTimeRef = useRef<number>(0);
    const componentMountTime = useRef<number>(Date.now());
    
    // Visual search state
    const [state, setState] = useState<VisualSearchInterfaceState>({
      session: {
        sessionId: `search_${Date.now()}`,
        capturedImage: null,
        searchQuery: '',
        results: [],
        searchStartTime: 0,
        searchDuration: 0,
        interactionHistory: []
      },
      isSearching: false,
      hasResults: false,
      selectedResult: null,
      viewMode: 'capture',
      performanceMetrics: {
        captureTime: 0,
        searchProcessingTime: 0,
        resultsRenderTime: 0,
        totalSearchTime: 0,
        accessibilityValidationTime: 0,
        resultCount: 0,
        confidenceDistribution: {}
      },
      accessibility: {
        resultAnnouncements: new Map(),
        keyboardNavigation: {
          currentResultIndex: -1,
          totalResults: 0,
          focusMode: 'grid'
        },
        screenReaderContext: {
          searchStatus: 'Ready to search',
          resultsSummary: '',
          currentSelection: ''
        }
      },
      error: null
    });
    
    // Search processing with accessibility announcements
    const processVisualSearch = useCallback(async (imageData: string): Promise<VisualSearchResult[]> => {
      try {
        const response = await fetch(searchApiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageData,
            maxResults,
            confidenceThreshold,
            sessionId: state.session.sessionId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        
        const searchData = await response.json();
        
        // Transform API response to our result format
        const results: VisualSearchResult[] = searchData.results.map((result: any, index: number) => ({
          id: `result_${index}`,
          productId: result.product_id,
          confidence: result.confidence,
          matchType: result.match_type || 'similar',
          product: {
            name: result.product.name,
            price: result.product.price,
            description: result.product.description,
            category: result.product.category,
            brand: result.product.brand,
            image: result.product.image,
            features: result.product.features || []
          },
          matchPoints: result.match_points || []
        }));
        
        return results;
        
      } catch (error) {
        console.error('[VisualSearchInterface] Search processing failed:', error);
        throw error;
      }
    }, [searchApiEndpoint, maxResults, confidenceThreshold, state.session.sessionId]);
    
    // Start visual search process
    const startSearch = useCallback(async (imageData?: string) => {
      const searchStartTime = Date.now();
      searchStartTimeRef.current = searchStartTime;
      
      try {
        setState(prev => ({
          ...prev,
          isSearching: true,
          error: null,
          viewMode: 'results',
          accessibility: {
            ...prev.accessibility,
            screenReaderContext: {
              ...prev.accessibility.screenReaderContext,
              searchStatus: 'Searching for matching products...'
            }
          }
        }));
        
        // Announce search start
        announceSearchStatus('Starting visual search for matching products');
        
        const searchImage = imageData || state.session.capturedImage;
        if (!searchImage) {
          throw new Error('No image available for search');
        }
        
        // Process search
        const results = await processVisualSearch(searchImage);
        const searchEndTime = Date.now();
        const searchDuration = searchEndTime - searchStartTime;
        
        // Calculate performance metrics
        const confidenceDistribution = results.reduce((acc, result) => {
          const bucket = Math.floor(result.confidence * 10) / 10;
          acc[bucket.toString()] = (acc[bucket.toString()] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Update state with results
        setState(prev => ({
          ...prev,
          isSearching: false,
          hasResults: results.length > 0,
          session: {
            ...prev.session,
            results,
            searchDuration,
            interactionHistory: [
              ...prev.session.interactionHistory,
              {
                type: 'search',
                timestamp: searchStartTime,
                data: { resultCount: results.length, duration: searchDuration }
              }
            ]
          },
          performanceMetrics: {
            ...prev.performanceMetrics,
            searchProcessingTime: searchDuration,
            totalSearchTime: searchDuration,
            resultCount: results.length,
            confidenceDistribution
          },
          accessibility: {
            ...prev.accessibility,
            keyboardNavigation: {
              ...prev.accessibility.keyboardNavigation,
              totalResults: results.length,
              currentResultIndex: results.length > 0 ? 0 : -1
            },
            screenReaderContext: {
              ...prev.accessibility.screenReaderContext,
              searchStatus: 'Search complete',
              resultsSummary: `Found ${results.length} matching products`
            }
          }
        }));
        
        // Report performance metrics
        onPerformanceMetric?.('search_duration', searchDuration);
        onPerformanceMetric?.('result_count', results.length);
        
        // Announce results
        if (results.length > 0) {
          announceSearchStatus(`Search complete. Found ${results.length} matching products. Use arrow keys to navigate results.`);
        } else {
          announceSearchStatus('Search complete. No matching products found. You can try capturing a different image.');
        }
        
        // Call success callback
        onSearchComplete?.(results);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        
        setState(prev => ({
          ...prev,
          isSearching: false,
          error: errorMessage,
          accessibility: {
            ...prev.accessibility,
            screenReaderContext: {
              ...prev.accessibility.screenReaderContext,
              searchStatus: `Search failed: ${errorMessage}`
            }
          }
        }));
        
        announceSearchStatus(`Search failed: ${errorMessage}. Please try again.`);
        onError?.(errorMessage);
      }
    }, [processVisualSearch, state.session.capturedImage, onPerformanceMetric, onSearchComplete, onError]);
    
    // Clear search and reset to capture mode
    const clearSearch = useCallback(() => {
      setState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          capturedImage: null,
          results: [],
          searchDuration: 0
        },
        isSearching: false,
        hasResults: false,
        selectedResult: null,
        viewMode: 'capture',
        error: null,
        accessibility: {
          ...prev.accessibility,
          keyboardNavigation: {
            ...prev.accessibility.keyboardNavigation,
            currentResultIndex: -1,
            totalResults: 0
          },
          screenReaderContext: {
            ...prev.accessibility.screenReaderContext,
            searchStatus: 'Ready to search',
            resultsSummary: '',
            currentSelection: ''
          }
        }
      }));
      
      announceSearchStatus('Search cleared. Ready to capture new image.');
    }, []);
    
    // Retry last search
    const retrySearch = useCallback(() => {
      if (state.session.capturedImage) {
        startSearch(state.session.capturedImage);
      } else {
        announceSearchStatus('No previous image to retry search. Please capture a new image.');
      }
    }, [state.session.capturedImage, startSearch]);
    
    // Select specific result
    const selectResult = useCallback((resultId: string) => {
      const result = state.session.results.find(r => r.id === resultId);
      if (!result) return;
      
      setState(prev => ({
        ...prev,
        selectedResult: result,
        viewMode: 'detail',
        accessibility: {
          ...prev.accessibility,
          screenReaderContext: {
            ...prev.accessibility.screenReaderContext,
            currentSelection: `Selected ${result.product.name} - ${result.product.price} dollars - confidence ${Math.round(result.confidence * 100)} percent`
          }
        }
      }));
      
      announceSearchStatus(`Selected ${result.product.name}. Price: $${result.product.price}. Confidence: ${Math.round(result.confidence * 100)}%`);
      onResultSelect?.(result);
      onProductView?.(result.productId);
    }, [state.session.results, onResultSelect, onProductView]);
    
    // Navigate through results with keyboard
    const navigateResults = useCallback((direction: 'next' | 'previous') => {
      const { currentResultIndex, totalResults } = state.accessibility.keyboardNavigation;
      
      if (totalResults === 0) return;
      
      let newIndex = currentResultIndex;
      if (direction === 'next') {
        newIndex = (currentResultIndex + 1) % totalResults;
      } else {
        newIndex = (currentResultIndex - 1 + totalResults) % totalResults;
      }
      
      const result = state.session.results[newIndex];
      if (result) {
        setState(prev => ({
          ...prev,
          accessibility: {
            ...prev.accessibility,
            keyboardNavigation: {
              ...prev.accessibility.keyboardNavigation,
              currentResultIndex: newIndex
            }
          }
        }));
        
        // Focus the result element
        const resultElement = resultsListRef.current?.querySelector(`[data-result-index="${newIndex}"]`) as HTMLElement;
        if (resultElement) {
          resultElement.focus();
        }
        
        announceSearchStatus(`Result ${newIndex + 1} of ${totalResults}: ${result.product.name}, ${Math.round(result.confidence * 100)}% match`);
      }
    }, [state.accessibility.keyboardNavigation, state.session.results]);
    
    // Accessibility announcements
    const announceSearchStatus = useCallback((message: string) => {
      if (announcementRef.current) {
        announcementRef.current.setAttribute('aria-live', 'assertive');
        announcementRef.current.textContent = message;
        
        // Clear announcement after reading
        setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, 1000);
      }
    }, []);
    
    // Keyboard navigation handler
    const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          if (state.viewMode === 'results') {
            event.preventDefault();
            navigateResults('next');
          }
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          if (state.viewMode === 'results') {
            event.preventDefault();
            navigateResults('previous');
          }
          break;
          
        case 'Enter':
        case ' ':
          if (state.viewMode === 'results' && state.accessibility.keyboardNavigation.currentResultIndex >= 0) {
            event.preventDefault();
            const currentResult = state.session.results[state.accessibility.keyboardNavigation.currentResultIndex];
            if (currentResult) {
              selectResult(currentResult.id);
            }
          }
          break;
          
        case 'Escape':
          if (state.viewMode === 'detail') {
            event.preventDefault();
            setState(prev => ({ ...prev, viewMode: 'results', selectedResult: null }));
            announceSearchStatus('Returned to search results');
          } else if (state.viewMode === 'results') {
            event.preventDefault();
            clearSearch();
          }
          break;
          
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            retrySearch();
          }
          break;
      }
    }, [state.viewMode, state.accessibility.keyboardNavigation, state.session.results, navigateResults, selectResult, clearSearch, retrySearch]);
    
    // Handle image capture from camera widget
    const handleImageCapture = useCallback(async (imageData: string) => {
      const captureTime = Date.now() - componentMountTime.current;
      
      setState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          capturedImage: imageData,
          interactionHistory: [
            ...prev.session.interactionHistory,
            {
              type: 'capture',
              timestamp: Date.now(),
              data: { imageSize: imageData.length }
            }
          ]
        },
        performanceMetrics: {
          ...prev.performanceMetrics,
          captureTime
        }
      }));
      
      onPerformanceMetric?.('capture_time', captureTime);
      
      // Start search automatically if real-time search is enabled
      if (enableRealTimeSearch) {
        await startSearch(imageData);
      } else {
        announceSearchStatus('Image captured successfully. Press Enter to start search.');
      }
    }, [enableRealTimeSearch, startSearch, onPerformanceMetric]);
    
    // Set view mode
    const setViewMode = useCallback((mode: 'capture' | 'results' | 'detail') => {
      setState(prev => ({ ...prev, viewMode: mode }));
      
      switch (mode) {
        case 'capture':
          announceSearchStatus('Switched to camera capture mode');
          break;
        case 'results':
          announceSearchStatus(`Switched to results view. ${state.session.results.length} results available.`);
          break;
        case 'detail':
          announceSearchStatus('Switched to detailed product view');
          break;
      }
    }, [state.session.results.length]);
    
    // Accessibility audit for results
    const auditResultsAccessibility = useCallback(async (): Promise<any[]> => {
      const violations: any[] = [];
      
      if (!resultsListRef.current) return violations;
      
      // Check result accessibility
      const resultElements = resultsListRef.current.querySelectorAll('[data-result-index]');
      resultElements.forEach((element, index) => {
        // Check for proper labeling
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
          violations.push({
            rule: 'result_labeling',
            severity: 'high',
            message: `Result ${index + 1} missing accessible label`,
            element: element
          });
        }
        
        // Check for keyboard accessibility
        if (!element.getAttribute('tabindex') && element.tagName !== 'BUTTON' && element.tagName !== 'A') {
          violations.push({
            rule: 'keyboard_accessibility',
            severity: 'medium',
            message: `Result ${index + 1} not keyboard accessible`,
            element: element
          });
        }
      });
      
      return violations;
    }, []);
    
    // Initialize keyboard handling
    useEffect(() => {
      const container = containerRef.current;
      if (container) {
        container.addEventListener('keydown', handleKeyboardNavigation);
        return () => container.removeEventListener('keydown', handleKeyboardNavigation);
      }
    }, [handleKeyboardNavigation]);
    
    // Expose API
    useImperativeHandle(ref, () => ({
      startSearch,
      clearSearch,
      retrySearch,
      selectResult,
      navigateResults,
      setViewMode,
      getPerformanceMetrics: () => ({ ...state.performanceMetrics }),
      getSearchSession: () => ({ ...state.session }),
      announceSearchStatus,
      getAccessibilityContext: () => ({ ...state.accessibility }),
      auditResultsAccessibility
    }));
    
    // Render search results grid
    const renderSearchResults = useMemo(() => {
      if (!state.hasResults) {
        return (
          <div className={styles.noResults} role="status">
            <p>No matching products found. Try capturing a different image or adjusting the lighting.</p>
          </div>
        );
      }
      
      return (
        <div 
          ref={resultsListRef}
          className={styles.resultsGrid}
          role="grid"
          aria-label={`Search results: ${state.session.results.length} products found`}
        >
          {state.session.results.map((result, index) => (
            <div
              key={result.id}
              data-result-index={index}
              className={`${styles.resultCard} ${
                index === state.accessibility.keyboardNavigation.currentResultIndex ? styles.focused : ''
              }`}
              role="gridcell"
              tabIndex={0}
              aria-label={`${result.product.name}, $${result.product.price}, ${Math.round(result.confidence * 100)}% match`}
              onClick={() => selectResult(result.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectResult(result.id);
                }
              }}
            >
              <img 
                src={result.product.image} 
                alt={`${result.product.name} product image`}
                className={styles.resultImage}
                loading="lazy"
              />
              <div className={styles.resultInfo}>
                <h3 className={styles.resultTitle}>{result.product.name}</h3>
                <p className={styles.resultPrice}>${result.product.price}</p>
                <div className={styles.resultMeta}>
                  <span className={styles.confidence}>
                    {Math.round(result.confidence * 100)}% match
                  </span>
                  <span className={styles.category}>{result.product.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }, [state.hasResults, state.session.results, state.accessibility.keyboardNavigation.currentResultIndex, selectResult]);
    
    // Render organism content based on view mode
    const renderContent = useMemo(() => {
      switch (state.viewMode) {
        case 'capture':
          return (
            <section className={styles.captureSection} aria-labelledby="capture-heading">
              <h2 id="capture-heading" className="sr-only">Visual Search - Camera Capture</h2>
              <AdvancedCameraWidget
                ref={cameraWidgetRef}
                onCaptureComplete={handleImageCapture}
                onError={onError}
                enforceSLA={true}
                accessibilityLevel={accessibilityLevel}
              />
            </section>
          );
          
        case 'results':
          return (
            <section className={styles.resultsSection} aria-labelledby="results-heading">
              <h2 id="results-heading" className="sr-only">Search Results</h2>
              {state.isSearching ? (
                <div className={styles.searchingIndicator} role="status" aria-live="polite">
                  <span>Searching for matching products...</span>
                </div>
              ) : (
                renderSearchResults
              )}
            </section>
          );
          
        case 'detail':
          return (
            <section className={styles.detailSection} aria-labelledby="detail-heading">
              <h2 id="detail-heading" className="sr-only">Product Details</h2>
              {state.selectedResult && (
                <div className={styles.productDetail}>
                  <img 
                    src={state.selectedResult.product.image}
                    alt={`${state.selectedResult.product.name} detailed view`}
                    className={styles.detailImage}
                  />
                  <div className={styles.detailInfo}>
                    <h3>{state.selectedResult.product.name}</h3>
                    <p className={styles.detailPrice}>${state.selectedResult.product.price}</p>
                    <p className={styles.detailDescription}>{state.selectedResult.product.description}</p>
                    <div className={styles.detailMeta}>
                      <span>Brand: {state.selectedResult.product.brand}</span>
                      <span>Category: {state.selectedResult.product.category}</span>
                      <span>Match: {Math.round(state.selectedResult.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
          
        default:
          return null;
      }
    }, [state.viewMode, state.isSearching, state.selectedResult, handleImageCapture, onError, accessibilityLevel, renderSearchResults]);
    
    return (
      <div 
        ref={containerRef}
        className={`${styles.visualSearchInterface} ${className}`}
        role="main"
        aria-labelledby="search-heading"
        tabIndex={-1}
      >
        {/* Interface heading */}
        <h1 id="search-heading" className="sr-only">
          Visual Product Search Interface
        </h1>
        
        {/* Accessibility announcements */}
        <div 
          ref={announcementRef}
          className="sr-only"
          aria-live="assertive"
          aria-atomic="true"
        />
        
        {/* Search status bar */}
        <div className={styles.statusBar} role="status" aria-live="polite">
          <span className={styles.searchStatus}>{state.accessibility.screenReaderContext.searchStatus}</span>
          {state.hasResults && (
            <span className={styles.resultCount}>
              {state.session.results.length} results found
            </span>
          )}
        </div>
        
        {/* Navigation controls */}
        <nav className={styles.navigation} aria-label="Search interface navigation">
          <button
            className={`${styles.navButton} ${state.viewMode === 'capture' ? styles.active : ''}`}
            onClick={() => setViewMode('capture')}
            aria-pressed={state.viewMode === 'capture'}
          >
            Capture
          </button>
          {state.hasResults && (
            <button
              className={`${styles.navButton} ${state.viewMode === 'results' ? styles.active : ''}`}
              onClick={() => setViewMode('results')}
              aria-pressed={state.viewMode === 'results'}
            >
              Results ({state.session.results.length})
            </button>
          )}
          {state.selectedResult && (
            <button
              className={`${styles.navButton} ${state.viewMode === 'detail' ? styles.active : ''}`}
              onClick={() => setViewMode('detail')}
              aria-pressed={state.viewMode === 'detail'}
            >
              Details
            </button>
          )}
        </nav>
        
        {/* Error display */}
        {state.error && (
          <div className={styles.errorBanner} role="alert">
            <p>{state.error}</p>
            <button onClick={retrySearch} className={styles.retryButton}>
              Retry Search
            </button>
          </div>
        )}
        
        {/* Accessibility fusion layer */}
        <AccessibilityFusionLayer
          ref={fusionLayerRef}
          accessibilityLevel={accessibilityLevel}
          performanceMode="organism"
        />
        
        {/* Main content */}
        {renderContent}
        
        {/* Additional content */}
        {children}
      </div>
    );
  }
);

VisualSearchInterface.displayName = 'VisualSearchInterface';

export default VisualSearchInterface; 