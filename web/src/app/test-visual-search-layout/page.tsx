'use client';

import React, { useRef, useState } from 'react';
import { 
  VisualSearchResultsLayout, 
  VisualSearchResultsLayoutRef,
  VisualSearchResult 
} from '../../components/messaging/visualsearchresultslayout';

// Sample search results for testing
const mockSearchResults: VisualSearchResult[] = [
  {
    id: 'result_1',
    productId: 1,
    confidence: 0.95,
    matchType: 'exact',
    product: {
      name: 'TrailMaster Pro Backpack',
      price: 199.99,
      description: 'Professional hiking backpack with advanced ventilation system and multiple compartments.',
      category: 'Backpacks',
      brand: 'Contoso Outdoor',
      image: '/images/1/242e7165-7c79-4f97-8e63-280f9f8982e2.png',
      features: ['70L capacity', 'Rain cover included', 'Padded laptop compartment', 'Hydration compatible']
    },
    matchPoints: [
      { feature: 'Color', confidence: 0.98, description: 'Deep forest green matches perfectly' },
      { feature: 'Compartments', confidence: 0.92, description: 'Multiple pockets configuration' }
    ]
  },
  {
    id: 'result_2',
    productId: 5,
    confidence: 0.87,
    matchType: 'similar',
    product: {
      name: 'Alpine Explorer Tent',
      price: 299.99,
      description: '4-season tent designed for extreme weather conditions with reinforced guy lines.',
      category: 'Tents',
      brand: 'Contoso Outdoor',
      image: '/images/5/0a9b0b18-0304-41a2-8367-155479b77985.png',
      features: ['4-season design', 'Easy setup', 'Vestibule included', 'Storm-tested']
    },
    matchPoints: [
      { feature: 'Design', confidence: 0.85, description: 'Similar outdoor styling' },
      { feature: 'Brand', confidence: 0.90, description: 'Same brand family' }
    ]
  },
  {
    id: 'result_3',
    productId: 10,
    confidence: 0.76,
    matchType: 'category',
    product: {
      name: 'Summit Climbing Harness',
      price: 89.99,
      description: 'Lightweight climbing harness with adjustable leg loops and gear loops.',
      category: 'Climbing Gear',
      brand: 'Contoso Outdoor',
      image: '/images/10/024934d4-5630-4ec2-a439-29bd7a9f28a0.png',
      features: ['Lightweight design', 'Adjustable fit', 'Multiple gear loops', 'CE certified']
    },
    matchPoints: [
      { feature: 'Category', confidence: 0.78, description: 'Outdoor gear category match' },
      { feature: 'Usage', confidence: 0.74, description: 'Adventure sports equipment' }
    ]
  }
];

export default function TestVisualSearchLayout() {
  const layoutRef = useRef<VisualSearchResultsLayoutRef>(null);
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'detail'>('search');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'mosaic'>('grid');
  const [searchResults, setSearchResults] = useState<VisualSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<VisualSearchResult | null>(null);

  const handleMockSearch = () => {
    // Simulate search results loading
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      layoutRef.current?.updateResults(mockSearchResults);
    }, 1000);
  };

  const handleViewSwitch = (view: 'search' | 'results' | 'detail') => {
    setCurrentView(view);
    layoutRef.current?.switchToView(view);
  };

  const handleDisplayModeChange = (mode: 'grid' | 'list' | 'mosaic') => {
    setDisplayMode(mode);
    layoutRef.current?.setDisplayMode(mode);
  };

  const handleResultSelect = (result: VisualSearchResult) => {
    setSelectedResult(result);
    setCurrentView('detail');
  };

  const handleProductView = (productId: number) => {
    console.log('Viewing product:', productId);
    alert(`Would navigate to product ${productId} page`);
  };

  const handleSortChange = (sortBy: string, direction: 'asc' | 'desc') => {
    layoutRef.current?.setSorting(sortBy, direction);
  };

  const handlePerformanceMetric = (metric: string, value: number) => {
    console.log(`Performance metric: ${metric} = ${value}ms`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '1rem', 
        background: '#f5f5f5', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          VisualSearchResultsLayout Template Test
        </h1>
        
        <button 
          onClick={handleMockSearch}
          style={{
            padding: '0.5rem 1rem',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Load Mock Results
        </button>
        
        <button 
          onClick={() => layoutRef.current?.clearResults()}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
        
        <button 
          onClick={() => {
            const metrics = layoutRef.current?.getTemplateMetrics();
            console.log('Template metrics:', metrics);
            alert(`Template metrics: ${JSON.stringify(metrics, null, 2)}`);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Get Metrics
        </button>
        
        <button 
          onClick={async () => {
            const violations = await layoutRef.current?.auditResultsAccessibility();
            console.log('Accessibility violations:', violations);
            alert(`Found ${violations?.length || 0} accessibility violations`);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Audit A11y
        </button>
      </div>
      
      <VisualSearchResultsLayout
        ref={layoutRef}
        defaultView="search"
        defaultDisplayMode="grid"
        defaultSortBy="relevance"
        resultsPerPage={20}
        enableFiltering={true}
        enableSorting={true}
        enablePagination={true}
        enforceSLA={true}
        accessibilityLevel="AAA"
        onResultSelect={handleResultSelect}
        onProductView={handleProductView}
        onPerformanceMetric={handlePerformanceMetric}
        style={{ flex: 1 }}
      >
        {/* Header with navigation controls */}
        <VisualSearchResultsLayout.Header
          showViewSwitcher={true}
          showDisplayModeToggle={true}
          onViewSwitch={handleViewSwitch}
          onDisplayModeChange={handleDisplayModeChange}
          currentView={currentView}
          currentDisplayMode={displayMode}
        />

        {/* Search Panel for initiating searches */}
        <VisualSearchResultsLayout.SearchPanel
          visible={currentView === 'search'}
          onSearchComplete={(results) => {
            setSearchResults(results);
            setCurrentView('results');
          }}
          onError={(error) => {
            console.error('Search error:', error);
            alert(`Search error: ${error}`);
          }}
        />

        {/* Results Panel showing search results */}
        <VisualSearchResultsLayout.ResultsPanel
          visible={currentView === 'results'}
          results={searchResults}
          displayMode={displayMode}
          sortBy="relevance"
          sortDirection="desc"
          onResultSelect={handleResultSelect}
        />

        {/* Details Panel for selected product */}
        <VisualSearchResultsLayout.DetailsPanel
          visible={currentView === 'detail'}
          selectedResult={selectedResult}
          onBack={() => handleViewSwitch('results')}
          onProductView={handleProductView}
        />

        {/* Controls for sorting and filtering */}
        <VisualSearchResultsLayout.Controls
          showSortControls={true}
          showFilterControls={true}
          onSortChange={handleSortChange}
          onFilterChange={(filters) => {
            console.log('Filters changed:', filters);
          }}
          currentSort={{ by: 'relevance', direction: 'desc' }}
        />

        {/* Footer with pagination and summary */}
        <VisualSearchResultsLayout.Footer
          showPagination={true}
          showResultsSummary={true}
          currentPage={1}
          totalPages={Math.ceil(searchResults.length / 20)}
          totalResults={searchResults.length}
          resultsPerPage={20}
          onPageChange={(page) => {
            console.log('Page changed to:', page);
          }}
        />
      </VisualSearchResultsLayout>
    </div>
  );
}
