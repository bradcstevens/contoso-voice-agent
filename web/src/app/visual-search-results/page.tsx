'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VisualSearchResultsLayout, VisualSearchResultsLayoutRef } from '@/components/messaging/visualsearchresultslayout';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

// Define the result interface matching the template
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

// Mock data for demonstration - in production this would come from API
const generateMockResults = (searchQuery?: string): VisualSearchResult[] => {
  const categories = ['Clothing', 'Electronics', 'Home & Garden', 'Sports', 'Books'];
  const brands = ['Contoso', 'Adventure Works', 'Northwind', 'Tailspin Toys', 'Fourth Coffee'];
  
  const mockProducts = [
    {
      name: 'Professional Hiking Boots',
      category: 'Sports',
      brand: 'Adventure Works',
      price: 149.99,
      description: 'Waterproof hiking boots with advanced traction and comfort technology.',
      features: ['Waterproof', 'Breathable', 'Durable Sole', 'Ankle Support'],
      image: '/images/1/242e7165-7c79-4f97-8e63-280f9f8982e2.png'
    },
    {
      name: 'Smart Wireless Headphones',
      category: 'Electronics',
      brand: 'Contoso',
      price: 199.99,
      description: 'High-quality wireless headphones with noise cancellation and smart features.',
      features: ['Noise Cancellation', 'Wireless', 'Smart Controls', 'Long Battery'],
      image: '/images/2/5b73df27-5275-4437-b7cf-45b1eee175fb.png'
    },
    {
      name: 'Outdoor Camping Tent',
      category: 'Sports',
      brand: 'Adventure Works',
      price: 299.99,
      description: 'Four-season camping tent with advanced weather protection.',
      features: ['Waterproof', 'Easy Setup', 'Spacious', 'Lightweight'],
      image: '/images/3/09887388-3a47-4198-ab19-e18d23768ac5.png'
    },
    {
      name: 'Coffee Maker Deluxe',
      category: 'Home & Garden',
      brand: 'Fourth Coffee',
      price: 89.99,
      description: 'Premium coffee maker with programmable features and thermal carafe.',
      features: ['Programmable', 'Thermal Carafe', 'Auto Shutoff', 'Easy Clean'],
      image: '/images/4/0889d8c0-bb85-4b77-a749-15682f693c49.png'
    },
    {
      name: 'Running Shoes Pro',
      category: 'Sports',
      brand: 'Adventure Works',
      price: 129.99,
      description: 'Professional running shoes with advanced cushioning and support.',
      features: ['Cushioned', 'Breathable', 'Lightweight', 'Durable'],
      image: '/images/5/0a9b0b18-0304-41a2-8367-155479b77985.png'
    }
  ];

  return mockProducts.map((product, index) => ({
    id: `result-${index + 1}`,
    productId: index + 1,
    confidence: 0.95 - (index * 0.1), // Decreasing confidence
    matchType: index === 0 ? 'exact' : index < 3 ? 'similar' : 'category',
    product,
    matchPoints: [
      { feature: 'Color', confidence: 0.9, description: 'Similar color scheme' },
      { feature: 'Material', confidence: 0.8, description: 'Matching material type' },
      { feature: 'Style', confidence: 0.85, description: 'Similar design style' }
    ]
  })) as VisualSearchResult[];
};

export default function VisualSearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const layoutRef = useRef<VisualSearchResultsLayoutRef>(null);
  
  // Page state management
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<VisualSearchResult | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'detail'>('search');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'mosaic'>('grid');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, number>>({});
  
  // Filters state
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    categories: [] as string[],
    brands: [] as string[],
    minConfidence: 0.5
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    resultsPerPage: 20,
    totalResults: 0
  });

  // Initialize from URL parameters
  useEffect(() => {
    const query = searchParams.get('q');
    const view = searchParams.get('view') as 'search' | 'results' | 'detail';
    
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
    
    if (view && ['search', 'results', 'detail'].includes(view)) {
      setCurrentView(view);
    }
  }, [searchParams]);

  // Search functionality
  const handleSearch = useCallback(async (query: string) => {
    console.log('Performing visual search for:', query);
    setIsLoading(true);
    setCurrentView('results');
    
    try {
      // Simulate API call with loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock results
      const mockResults = generateMockResults(query);
      setResults(mockResults);
      setPagination(prev => ({
        ...prev,
        totalResults: mockResults.length,
        currentPage: 1
      }));
      
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('q', query);
      newParams.set('view', 'results');
      router.push(`?${newParams.toString()}`);
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, router]);

  // Result selection
  const handleResultSelect = useCallback((result: VisualSearchResult) => {
    console.log('Selected result:', result);
    setSelectedResult(result);
    setCurrentView('detail');
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', 'detail');
    newParams.set('product', result.productId.toString());
    router.push(`?${newParams.toString()}`);
  }, [searchParams, router]);

  // Product view
  const handleProductView = useCallback((productId: number) => {
    console.log('Viewing product:', productId);
    // In a real app, this would navigate to a product detail page
    router.push(`/products/${productId}`);
  }, [router]);

  // Search refinement
  const handleSearchRefinement = useCallback((newFilters: any) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    
    // Apply filters to results
    const filteredResults = results.filter(result => {
      const price = result.product.price;
      const priceInRange = price >= newFilters.priceRange[0] && price <= newFilters.priceRange[1];
      const categoryMatch = newFilters.categories.length === 0 || newFilters.categories.includes(result.product.category);
      const brandMatch = newFilters.brands.length === 0 || newFilters.brands.includes(result.product.brand);
      const confidenceMatch = result.confidence >= newFilters.minConfidence;
      
      return priceInRange && categoryMatch && brandMatch && confidenceMatch;
    });
    
    setResults(filteredResults);
    setPagination(prev => ({
      ...prev,
      totalResults: filteredResults.length,
      currentPage: 1
    }));
  }, [results]);

  // Performance metric tracking
  const handlePerformanceMetric = useCallback((metric: string, value: number) => {
    console.log('Performance metric:', metric, '=', value);
    setPerformanceMetrics(prev => ({ ...prev, [metric]: value }));
  }, []);

  // View switching
  const handleViewSwitch = useCallback((view: 'search' | 'results' | 'detail') => {
    console.log('Switching to view:', view);
    setCurrentView(view);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', view);
    if (view === 'search') {
      newParams.delete('product');
    }
    router.push(`?${newParams.toString()}`);
  }, [searchParams, router]);

  // Display mode change
  const handleDisplayModeChange = useCallback((mode: 'grid' | 'list' | 'mosaic') => {
    console.log('Changing display mode to:', mode);
    setDisplayMode(mode);
  }, []);

  // Sorting
  const handleSortChange = useCallback((sortBy: 'relevance' | 'price' | 'confidence' | 'brand', direction: 'asc' | 'desc') => {
    console.log('Changing sort to:', sortBy, direction);
    setSortBy(sortBy);
    setSortDirection(direction);
  }, []);

  // Back to results
  const handleBackToResults = useCallback(() => {
    setCurrentView('results');
    setSelectedResult(null);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', 'results');
    newParams.delete('product');
    router.push(`?${newParams.toString()}`);
  }, [searchParams, router]);

  // Search completion handler for search panel
  const handleSearchComplete = useCallback((searchResults: VisualSearchResult[]) => {
    console.log('Search completed with results:', searchResults.length);
    setResults(searchResults);
    setCurrentView('results');
    setPagination(prev => ({
      ...prev,
      totalResults: searchResults.length,
      currentPage: 1
    }));
  }, []);

  // Error handler
  const handleError = useCallback((error: string) => {
    console.error('Visual search error:', error);
    // In a real app, show user-friendly error message
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Visual Search Results</h1>
        <div className={styles.statusIndicators}>
          <span className={`${styles.indicator} ${isLoading ? styles.loading : styles.ready}`}>
            {isLoading ? "Searching..." : "Ready"}
          </span>
          <span className={`${styles.indicator} ${results.length > 0 ? styles.active : styles.inactive}`}>
            Results: {results.length}
          </span>
          <span className={`${styles.indicator} ${selectedResult ? styles.active : styles.inactive}`}>
            {selectedResult ? `Product: ${selectedResult.product.name}` : "No Product Selected"}
          </span>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <VisualSearchResultsLayout
          ref={layoutRef}
          defaultView={currentView}
          defaultDisplayMode={displayMode}
          defaultSortBy={sortBy}
          resultsPerPage={pagination.resultsPerPage}
          enableFiltering={true}
          enableSorting={true}
          enablePagination={true}
          enforceSLA={true}
          accessibilityLevel="AAA"
          onResultSelect={handleResultSelect}
          onProductView={handleProductView}
          onSearchRefinement={handleSearchRefinement}
          onPerformanceMetric={handlePerformanceMetric}
        >
          <VisualSearchResultsLayout.Header
            showViewSwitcher={true}
            showDisplayModeToggle={true}
            onViewSwitch={handleViewSwitch}
            onDisplayModeChange={handleDisplayModeChange}
            currentView={currentView}
            currentDisplayMode={displayMode}
          />

          <div className={styles.mainContent}>
            <VisualSearchResultsLayout.SearchPanel
              visible={currentView === 'search'}
              onSearchComplete={handleSearchComplete}
              onError={handleError}
            />

            <VisualSearchResultsLayout.ResultsPanel
              visible={currentView === 'results'}
              results={results}
              displayMode={displayMode}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onResultSelect={handleResultSelect}
            />

            <VisualSearchResultsLayout.DetailsPanel
              visible={currentView === 'detail'}
              selectedResult={selectedResult}
              onBack={handleBackToResults}
              onProductView={handleProductView}
            />
          </div>

          <VisualSearchResultsLayout.Controls
            showSortControls={currentView === 'results'}
            showFilterControls={currentView === 'results'}
            onSortChange={handleSortChange}
            onFilterChange={handleSearchRefinement}
            currentSort={{ by: sortBy, direction: sortDirection }}
          />

          <VisualSearchResultsLayout.Footer
            showPagination={currentView === 'results'}
            showResultsSummary={true}
            currentPage={pagination.currentPage}
            totalResults={pagination.totalResults}
            resultsPerPage={pagination.resultsPerPage}
            onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          />
        </VisualSearchResultsLayout>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Searching for visual matches...</p>
        </div>
      )}

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
          <div className={styles.stateInfo}>
            <p><strong>View:</strong> {currentView}</p>
            <p><strong>Results:</strong> {results.length}</p>
            <p><strong>Display:</strong> {displayMode}</p>
            <p><strong>Sort:</strong> {sortBy} ({sortDirection})</p>
          </div>
        </div>
      )}
    </div>
  );
} 