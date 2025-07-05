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
import { VisualSearchInterface, VisualSearchInterfaceRef } from './visualsearchinterface';
import { MultiModalOrchestrator } from './multimodalorchestrator';
import { AccessibilityFusionLayer } from './accessibilityfusionlayer';
import styles from './visualsearchresultslayout.module.css';

// Template-level interfaces for visual search results layout
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

interface VisualSearchResultsLayoutState {
  currentView: 'search' | 'results' | 'detail';
  results: VisualSearchResult[];
  selectedResult: VisualSearchResult | null;
  layoutMode: 'mobile' | 'tablet' | 'desktop';
  displayMode: 'grid' | 'list' | 'mosaic';
  sortBy: 'relevance' | 'price' | 'confidence' | 'brand';
  sortDirection: 'asc' | 'desc';
  filters: {
    priceRange: [number, number];
    categories: string[];
    brands: string[];
    minConfidence: number;
  };
  pagination: {
    currentPage: number;
    resultsPerPage: number;
    totalResults: number;
  };
  performanceMetrics: {
    templateRenderTime: number;
    resultsLoadTime: number;
    filterTime: number;
    sortTime: number;
    accessibilityUpdateTime: number;
  };
  accessibilityContext: {
    currentFocus: string;
    announcementQueue: string[];
    navigationHistory: string[];
    resultsSummary: string;
  };
}

interface VisualSearchResultsLayoutProps {
  className?: string;
  defaultView?: 'search' | 'results' | 'detail';
  defaultDisplayMode?: 'grid' | 'list' | 'mosaic';
  defaultSortBy?: 'relevance' | 'price' | 'confidence' | 'brand';
  resultsPerPage?: number;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enforceSLA?: boolean; // <500ms template render requirement
  accessibilityLevel?: 'AA' | 'AAA';
  onResultSelect?: (result: VisualSearchResult) => void;
  onProductView?: (productId: number) => void;
  onSearchRefinement?: (filters: any) => void;
  onPerformanceMetric?: (metric: string, value: number) => void;
  children?: ReactNode;
}

export interface VisualSearchResultsLayoutRef {
  // Template-level navigation
  switchToView: (view: 'search' | 'results' | 'detail') => void;
  focusSearch: () => void;
  focusResults: () => void;
  
  // Results management
  updateResults: (results: VisualSearchResult[]) => void;
  selectResult: (resultId: string) => void;
  clearResults: () => void;
  
  // Display controls
  setDisplayMode: (mode: 'grid' | 'list' | 'mosaic') => void;
  setSorting: (sortBy: string, direction: 'asc' | 'desc') => void;
  applyFilters: (filters: any) => void;
  
  // Performance monitoring
  getTemplateMetrics: () => any;
  validatePerformanceSLA: () => boolean;
  
  // Accessibility
  announceResultsUpdate: (message: string) => void;
  auditResultsAccessibility: () => Promise<any[]>;
}

// Compound component structure for results layout
interface VisualSearchResultsLayoutComponents {
  Header: React.FC<VisualSearchResultsLayoutHeaderProps>;
  SearchPanel: React.FC<VisualSearchResultsLayoutSearchPanelProps>;
  ResultsPanel: React.FC<VisualSearchResultsLayoutResultsPanelProps>;
  DetailsPanel: React.FC<VisualSearchResultsLayoutDetailsPanelProps>;
  Controls: React.FC<VisualSearchResultsLayoutControlsProps>;
  Footer: React.FC<VisualSearchResultsLayoutFooterProps>;
}

// Header compound component
interface VisualSearchResultsLayoutHeaderProps {
  children?: ReactNode;
  showViewSwitcher?: boolean;
  showDisplayModeToggle?: boolean;
  onViewSwitch?: (view: 'search' | 'results' | 'detail') => void;
  onDisplayModeChange?: (mode: 'grid' | 'list' | 'mosaic') => void;
  currentView?: 'search' | 'results' | 'detail';
  currentDisplayMode?: 'grid' | 'list' | 'mosaic';
}

const VisualSearchResultsLayoutHeader: React.FC<VisualSearchResultsLayoutHeaderProps> = ({
  children,
  showViewSwitcher = true,
  showDisplayModeToggle = true,
  onViewSwitch,
  onDisplayModeChange,
  currentView = 'results',
  currentDisplayMode = 'grid'
}) => {
  const handleViewSwitch = useCallback((view: 'search' | 'results' | 'detail') => {
    onViewSwitch?.(view);
  }, [onViewSwitch]);

  const handleDisplayModeChange = useCallback((mode: 'grid' | 'list' | 'mosaic') => {
    onDisplayModeChange?.(mode);
  }, [onDisplayModeChange]);

  return (
    <header className={styles.templateHeader} role="banner">
      <div className={styles.headerContent}>
        {showViewSwitcher && (
          <nav className={styles.viewSwitcher} role="navigation" aria-label="View navigation">
            <button
              className={`${styles.viewButton} ${currentView === 'search' ? styles.active : ''}`}
              onClick={() => handleViewSwitch('search')}
              aria-pressed={currentView === 'search'}
              aria-label="Switch to search view"
            >
              🔍 Search
            </button>
            <button
              className={`${styles.viewButton} ${currentView === 'results' ? styles.active : ''}`}
              onClick={() => handleViewSwitch('results')}
              aria-pressed={currentView === 'results'}
              aria-label="Switch to results view"
            >
              📋 Results
            </button>
            <button
              className={`${styles.viewButton} ${currentView === 'detail' ? styles.active : ''}`}
              onClick={() => handleViewSwitch('detail')}
              aria-pressed={currentView === 'detail'}
              aria-label="Switch to detail view"
            >
              🔍 Detail
            </button>
          </nav>
        )}
        
        {showDisplayModeToggle && currentView === 'results' && (
          <div className={styles.displayModeToggle} role="group" aria-label="Display mode">
            <button
              className={`${styles.displayButton} ${currentDisplayMode === 'grid' ? styles.active : ''}`}
              onClick={() => handleDisplayModeChange('grid')}
              aria-pressed={currentDisplayMode === 'grid'}
              aria-label="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              className={`${styles.displayButton} ${currentDisplayMode === 'list' ? styles.active : ''}`}
              onClick={() => handleDisplayModeChange('list')}
              aria-pressed={currentDisplayMode === 'list'}
              aria-label="List view"
            >
              ☰ List
            </button>
            <button
              className={`${styles.displayButton} ${currentDisplayMode === 'mosaic' ? styles.active : ''}`}
              onClick={() => handleDisplayModeChange('mosaic')}
              aria-pressed={currentDisplayMode === 'mosaic'}
              aria-label="Mosaic view"
            >
              ▦ Mosaic
            </button>
          </div>
        )}
        
        {children}
      </div>
    </header>
  );
};

// Search Panel compound component
interface VisualSearchResultsLayoutSearchPanelProps {
  children?: ReactNode;
  visible?: boolean;
  onSearchComplete?: (results: VisualSearchResult[]) => void;
  onError?: (error: string) => void;
}

const VisualSearchResultsLayoutSearchPanel: React.FC<VisualSearchResultsLayoutSearchPanelProps> = ({
  children,
  visible = true,
  onSearchComplete,
  onError
}) => {
  const searchRef = useRef<VisualSearchInterfaceRef>(null);

  const handleSearchComplete = useCallback((results: VisualSearchResult[]) => {
    onSearchComplete?.(results);
  }, [onSearchComplete]);

  const handleSearchError = useCallback((error: string) => {
    onError?.(error);
  }, [onError]);

  return (
    <section 
      className={`${styles.searchPanel} ${visible ? styles.visible : styles.hidden}`}
      role="region"
      aria-label="Visual search interface"
    >
      <div className={styles.searchContainer}>
        <VisualSearchInterface
          ref={searchRef}
          onSearchComplete={handleSearchComplete}
          onError={handleSearchError}
          accessibilityLevel="AAA"
          maxResults={50}
          confidenceThreshold={0.5}
        />
        {children}
      </div>
    </section>
  );
};

// Results Panel compound component
interface VisualSearchResultsLayoutResultsPanelProps {
  children?: ReactNode;
  visible?: boolean;
  results?: VisualSearchResult[];
  displayMode?: 'grid' | 'list' | 'mosaic';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onResultSelect?: (result: VisualSearchResult) => void;
}

const VisualSearchResultsLayoutResultsPanel: React.FC<VisualSearchResultsLayoutResultsPanelProps> = ({
  children,
  visible = true,
  results = [],
  displayMode = 'grid',
  sortBy = 'relevance',
  sortDirection = 'desc',
  onResultSelect
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.product.price - b.product.price;
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'brand':
          comparison = a.product.brand.localeCompare(b.product.brand);
          break;
        case 'relevance':
        default:
          comparison = a.confidence - b.confidence;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [results, sortBy, sortDirection]);

  const handleResultClick = useCallback((result: VisualSearchResult) => {
    onResultSelect?.(result);
  }, [onResultSelect]);

  const handleResultKeyDown = useCallback((event: React.KeyboardEvent, result: VisualSearchResult) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleResultClick(result);
    }
  }, [handleResultClick]);

  return (
    <section 
      className={`${styles.resultsPanel} ${styles[displayMode]} ${visible ? styles.visible : styles.hidden}`}
      role="region"
      aria-label="Search results"
      ref={resultsRef}
    >
      <div className={styles.resultsContainer}>
        {sortedResults.length === 0 ? (
          <div className={styles.emptyResults} role="status" aria-label="No results found">
            <h3>No Results Found</h3>
            <p>Try adjusting your search or filters to find matching products.</p>
          </div>
        ) : (
          <div 
            className={styles.resultsGrid}
            role="grid"
            aria-label={`${sortedResults.length} search results`}
          >
            {sortedResults.map((result, index) => (
              <div
                key={result.id}
                className={styles.resultCard}
                role="gridcell"
                tabIndex={0}
                aria-label={`${result.product.name}, $${result.product.price}, ${Math.round(result.confidence * 100)}% match`}
                onClick={() => handleResultClick(result)}
                onKeyDown={(e) => handleResultKeyDown(e, result)}
                data-result-index={index}
              >
                <div className={styles.resultImage}>
                  <img 
                    src={result.product.image} 
                    alt={result.product.name}
                    loading="lazy"
                  />
                  <div className={styles.confidenceBadge}>
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>
                
                <div className={styles.resultContent}>
                  <h3 className={styles.resultTitle}>{result.product.name}</h3>
                  <p className={styles.resultBrand}>{result.product.brand}</p>
                  <p className={styles.resultPrice}>${result.product.price}</p>
                  <p className={styles.resultCategory}>{result.product.category}</p>
                  
                  {displayMode === 'list' && (
                    <p className={styles.resultDescription}>
                      {result.product.description}
                    </p>
                  )}
                  
                  <div className={styles.matchInfo}>
                    <span className={`${styles.matchType} ${styles[result.matchType]}`}>
                      {result.matchType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

// Details Panel compound component
interface VisualSearchResultsLayoutDetailsPanelProps {
  children?: ReactNode;
  visible?: boolean;
  selectedResult?: VisualSearchResult | null;
  onBack?: () => void;
  onProductView?: (productId: number) => void;
}

const VisualSearchResultsLayoutDetailsPanel: React.FC<VisualSearchResultsLayoutDetailsPanelProps> = ({
  children,
  visible = true,
  selectedResult,
  onBack,
  onProductView
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleProductView = useCallback(() => {
    if (selectedResult) {
      onProductView?.(selectedResult.productId);
    }
  }, [selectedResult, onProductView]);

  if (!selectedResult) {
    return null;
  }

  return (
    <section 
      className={`${styles.detailsPanel} ${visible ? styles.visible : styles.hidden}`}
      role="region"
      aria-label="Product details"
      ref={detailsRef}
    >
      <div className={styles.detailsContainer}>
        <header className={styles.detailsHeader}>
          <button 
            className={styles.backButton}
            onClick={onBack}
            aria-label="Back to results"
          >
            ← Back
          </button>
          <h2>{selectedResult.product.name}</h2>
        </header>
        
        <div className={styles.detailsContent}>
          <div className={styles.detailsImage}>
            <img 
              src={selectedResult.product.image} 
              alt={selectedResult.product.name}
            />
          </div>
          
          <div className={styles.detailsInfo}>
            <div className={styles.priceSection}>
              <span className={styles.price}>${selectedResult.product.price}</span>
              <span className={styles.brand}>{selectedResult.product.brand}</span>
            </div>
            
            <div className={styles.matchSection}>
              <h3>Match Information</h3>
              <p className={styles.confidence}>
                Confidence: {Math.round(selectedResult.confidence * 100)}%
              </p>
              <p className={styles.matchType}>
                Match Type: {selectedResult.matchType}
              </p>
            </div>
            
            <div className={styles.descriptionSection}>
              <h3>Description</h3>
              <p>{selectedResult.product.description}</p>
            </div>
            
            {selectedResult.product.features.length > 0 && (
              <div className={styles.featuresSection}>
                <h3>Features</h3>
                <ul>
                  {selectedResult.product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedResult.matchPoints.length > 0 && (
              <div className={styles.matchPointsSection}>
                <h3>Match Points</h3>
                <ul>
                  {selectedResult.matchPoints.map((point, index) => (
                    <li key={index}>
                      <strong>{point.feature}</strong>: {point.description} 
                      ({Math.round(point.confidence * 100)}% confidence)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.actionsSection}>
              <button 
                className={styles.viewProductButton}
                onClick={handleProductView}
              >
                View Full Product
              </button>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </section>
  );
};

// Controls compound component
interface VisualSearchResultsLayoutControlsProps {
  children?: ReactNode;
  showSortControls?: boolean;
  showFilterControls?: boolean;
  onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: any) => void;
  currentSort?: { by: string; direction: 'asc' | 'desc' };
}

const VisualSearchResultsLayoutControls: React.FC<VisualSearchResultsLayoutControlsProps> = ({
  children,
  showSortControls = true,
  showFilterControls = true,
  onSortChange,
  onFilterChange,
  currentSort = { by: 'relevance', direction: 'desc' }
}) => {
  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, direction] = event.target.value.split(':') as [string, 'asc' | 'desc'];
    onSortChange?.(sortBy, direction);
  }, [onSortChange]);

  return (
    <div className={styles.templateControls} role="toolbar" aria-label="Results controls">
      {showSortControls && (
        <div className={styles.sortControls}>
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={`${currentSort.by}:${currentSort.direction}`}
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="relevance:desc">Most Relevant</option>
            <option value="confidence:desc">Highest Confidence</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="brand:asc">Brand: A to Z</option>
            <option value="brand:desc">Brand: Z to A</option>
          </select>
        </div>
      )}
      
      {showFilterControls && (
        <div className={styles.filterControls}>
          <button className={styles.filterButton} aria-label="Open filters">
            🔽 Filters
          </button>
        </div>
      )}
      
      {children}
    </div>
  );
};

// Footer compound component
interface VisualSearchResultsLayoutFooterProps {
  children?: ReactNode;
  showPagination?: boolean;
  showResultsSummary?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  resultsPerPage?: number;
  onPageChange?: (page: number) => void;
}

const VisualSearchResultsLayoutFooter: React.FC<VisualSearchResultsLayoutFooterProps> = ({
  children,
  showPagination = true,
  showResultsSummary = true,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  resultsPerPage = 20,
  onPageChange
}) => {
  const handlePageChange = useCallback((page: number) => {
    onPageChange?.(page);
  }, [onPageChange]);

  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <footer className={styles.templateFooter} role="contentinfo">
      {showResultsSummary && (
        <div className={styles.resultsSummary} aria-label="Results summary">
          Showing {startResult}-{endResult} of {totalResults} results
        </div>
      )}
      
      {showPagination && totalPages > 1 && (
        <nav className={styles.pagination} role="navigation" aria-label="Pagination">
          <button 
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
      
      {children}
    </footer>
  );
};

// Main template component with compound pattern
const VisualSearchResultsLayoutComponent = forwardRef<VisualSearchResultsLayoutRef, VisualSearchResultsLayoutProps>(
  ({ 
    className = '', 
    defaultView = 'search',
    defaultDisplayMode = 'grid',
    defaultSortBy = 'relevance',
    resultsPerPage = 20,
    enableFiltering = true,
    enableSorting = true,
    enablePagination = true,
    enforceSLA = true,
    accessibilityLevel = 'AAA',
    onResultSelect,
    onProductView,
    onSearchRefinement,
    onPerformanceMetric,
    children
  }, ref) => {
    
    // Performance tracking for <500ms template render SLA
    const renderStartTime = useRef<number>(Date.now());
    const mountTime = useRef<number>(Date.now());
    
    // Template state following Enhanced Design Mode architecture
    const [state, setState] = useState<VisualSearchResultsLayoutState>({
      currentView: defaultView,
      results: [],
      selectedResult: null,
      layoutMode: 'desktop',
      displayMode: defaultDisplayMode,
      sortBy: defaultSortBy,
      sortDirection: 'desc',
      filters: {
        priceRange: [0, 10000],
        categories: [],
        brands: [],
        minConfidence: 0.5
      },
      pagination: {
        currentPage: 1,
        resultsPerPage,
        totalResults: 0
      },
      performanceMetrics: {
        templateRenderTime: 0,
        resultsLoadTime: 0,
        filterTime: 0,
        sortTime: 0,
        accessibilityUpdateTime: 0
      },
      accessibilityContext: {
        currentFocus: '',
        announcementQueue: [],
        navigationHistory: [],
        resultsSummary: ''
      }
    });
    
    // Refs for component coordination
    const containerRef = useRef<HTMLDivElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const resultsPanelRef = useRef<HTMLDivElement>(null);
    const detailsPanelRef = useRef<HTMLDivElement>(null);
    const orchestratorRef = useRef<any>(null);
    const fusionLayerRef = useRef<any>(null);
    const announcementRef = useRef<HTMLDivElement>(null);
    
    // Responsive layout detection
    const detectLayoutMode = useCallback(() => {
      if (!containerRef.current) return 'desktop';
      
      const width = containerRef.current.clientWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }, []);
    
    // Template-level accessibility announcements
    const announceResultsUpdate = useCallback((message: string) => {
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
    
    // View switching with performance tracking
    const switchToView = useCallback((view: 'search' | 'results' | 'detail') => {
      const switchStart = Date.now();
      
      setState(prev => ({
        ...prev,
        currentView: view,
        accessibilityContext: {
          ...prev.accessibilityContext,
          navigationHistory: [...prev.accessibilityContext.navigationHistory, view]
        }
      }));
      
      // Accessibility announcement
      const viewNames = {
        search: 'search interface',
        results: 'results view',
        detail: 'product detail view'
      };
      announceResultsUpdate(`Switched to ${viewNames[view]}`);
      
      // Performance tracking
      const switchTime = Date.now() - switchStart;
      onPerformanceMetric?.('view_switch_time', switchTime);
    }, [announceResultsUpdate, onPerformanceMetric]);
    
    // Update results with performance tracking
    const updateResults = useCallback((results: VisualSearchResult[]) => {
      const updateStart = Date.now();
      
      setState(prev => ({
        ...prev,
        results,
        currentView: 'results',
        pagination: {
          ...prev.pagination,
          totalResults: results.length
        },
        accessibilityContext: {
          ...prev.accessibilityContext,
          resultsSummary: `${results.length} products found`
        }
      }));
      
      announceResultsUpdate(`Search completed. ${results.length} products found.`);
      
      const updateTime = Date.now() - updateStart;
      onPerformanceMetric?.('results_update_time', updateTime);
    }, [announceResultsUpdate, onPerformanceMetric]);
    
    // Select result with navigation
    const selectResult = useCallback((resultId: string) => {
      const result = state.results.find(r => r.id === resultId);
      if (!result) return;
      
      setState(prev => ({
        ...prev,
        selectedResult: result,
        currentView: 'detail'
      }));
      
      announceResultsUpdate(`Selected ${result.product.name}. Viewing product details.`);
      onResultSelect?.(result);
    }, [state.results, announceResultsUpdate, onResultSelect]);
    
    // Focus management
    const focusSearch = useCallback(() => {
      if (searchPanelRef.current) {
        const searchInput = searchPanelRef.current.querySelector('input, button');
        if (searchInput && 'focus' in searchInput) {
          (searchInput as HTMLElement).focus();
        }
      }
    }, []);
    
    const focusResults = useCallback(() => {
      if (resultsPanelRef.current) {
        const firstResult = resultsPanelRef.current.querySelector('[data-result-index="0"]');
        if (firstResult && 'focus' in firstResult) {
          (firstResult as HTMLElement).focus();
        }
      }
    }, []);
    
    // Display mode and sorting
    const setDisplayMode = useCallback((mode: 'grid' | 'list' | 'mosaic') => {
      setState(prev => ({ ...prev, displayMode: mode }));
      announceResultsUpdate(`Changed to ${mode} view`);
    }, [announceResultsUpdate]);
    
    const setSorting = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
      const sortStart = Date.now();
      
      setState(prev => ({ ...prev, sortBy, sortDirection: direction }));
      
      const sortTime = Date.now() - sortStart;
      onPerformanceMetric?.('sort_time', sortTime);
      
      announceResultsUpdate(`Results sorted by ${sortBy}, ${direction}ending order`);
    }, [announceResultsUpdate, onPerformanceMetric]);
    
    // Template accessibility audit
    const auditResultsAccessibility = useCallback(async (): Promise<any[]> => {
      const violations: any[] = [];
      
      if (!containerRef.current) return violations;
      
      const container = containerRef.current;
      
      // Check results accessibility
      const resultCards = container.querySelectorAll('[role="gridcell"]');
      resultCards.forEach((card, index) => {
        if (!card.getAttribute('aria-label')) {
          violations.push({
            rule: 'result_labeling',
            severity: 'medium',
            message: `Result card ${index} missing aria-label`
          });
        }
      });
      
      return violations;
    }, []);
    
    // Performance SLA validation (<500ms template render)
    const validatePerformanceSLA = useCallback((): boolean => {
      return state.performanceMetrics.templateRenderTime <= 500;
    }, [state.performanceMetrics.templateRenderTime]);
    
    // Template metrics getter
    const getTemplateMetrics = useCallback(() => {
      return { ...state.performanceMetrics };
    }, [state.performanceMetrics]);
    
    // Layout responsiveness
    useEffect(() => {
      const handleResize = () => {
        const newMode = detectLayoutMode();
        setState(prev => ({ ...prev, layoutMode: newMode }));
      };
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial detection
      
      return () => window.removeEventListener('resize', handleResize);
    }, [detectLayoutMode]);
    
    // Performance monitoring
    useEffect(() => {
      const renderTime = Date.now() - renderStartTime.current;
      const totalTime = Date.now() - mountTime.current;
      
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          templateRenderTime: renderTime
        }
      }));
      
      onPerformanceMetric?.('template_render_time', renderTime);
      
      // SLA validation
      if (enforceSLA && renderTime > 500) {
        console.warn(`[VisualSearchResultsLayout] Template render SLA violation: ${renderTime}ms > 500ms`);
      }
    }, [onPerformanceMetric, enforceSLA]);
    
    // Expose template API
    useImperativeHandle(ref, () => ({
      switchToView,
      focusSearch,
      focusResults,
      updateResults,
      selectResult,
      clearResults: () => setState(prev => ({ ...prev, results: [], selectedResult: null })),
      setDisplayMode,
      setSorting,
      applyFilters: (filters) => setState(prev => ({ ...prev, filters })),
      getTemplateMetrics,
      validatePerformanceSLA,
      announceResultsUpdate,
      auditResultsAccessibility
    }));
    
    // Event handlers
    const handleSearchComplete = useCallback((results: VisualSearchResult[]) => {
      updateResults(results);
    }, [updateResults]);
    
    const handleResultSelect = useCallback((result: VisualSearchResult) => {
      selectResult(result.id);
    }, [selectResult]);
    
    const handleProductView = useCallback((productId: number) => {
      onProductView?.(productId);
    }, [onProductView]);
    
    const handleBackToResults = useCallback(() => {
      switchToView('results');
    }, [switchToView]);
    
    // Keyboard navigation for template
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Template-level keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 's':
              event.preventDefault();
              switchToView('search');
              break;
            case 'r':
              event.preventDefault();
              switchToView('results');
              break;
            case 'd':
              event.preventDefault();
              switchToView('detail');
              break;
          }
        }
      };
      
      if (containerRef.current) {
        containerRef.current.addEventListener('keydown', handleKeyDown);
        return () => {
          containerRef.current?.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [switchToView]);
    
    return (
      <div 
        className={`${styles.templateContainer} ${styles[state.layoutMode]} ${className}`}
        ref={containerRef}
        role="main"
        aria-label="Visual search results interface"
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

// Attach compound components to main component
const VisualSearchResultsLayout = VisualSearchResultsLayoutComponent as typeof VisualSearchResultsLayoutComponent & VisualSearchResultsLayoutComponents;

VisualSearchResultsLayout.Header = VisualSearchResultsLayoutHeader;
VisualSearchResultsLayout.SearchPanel = VisualSearchResultsLayoutSearchPanel;
VisualSearchResultsLayout.ResultsPanel = VisualSearchResultsLayoutResultsPanel;
VisualSearchResultsLayout.DetailsPanel = VisualSearchResultsLayoutDetailsPanel;
VisualSearchResultsLayout.Controls = VisualSearchResultsLayoutControls;
VisualSearchResultsLayout.Footer = VisualSearchResultsLayoutFooter;

VisualSearchResultsLayout.displayName = 'VisualSearchResultsLayout';

export { VisualSearchResultsLayout };
export type { 
  VisualSearchResultsLayoutProps, 
  VisualSearchResultsLayoutRef,
  VisualSearchResultsLayoutHeaderProps,
  VisualSearchResultsLayoutSearchPanelProps,
  VisualSearchResultsLayoutResultsPanelProps,
  VisualSearchResultsLayoutDetailsPanelProps,
  VisualSearchResultsLayoutControlsProps,
  VisualSearchResultsLayoutFooterProps,
  VisualSearchResult
};
