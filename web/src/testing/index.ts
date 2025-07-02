/**
 * Cross-Modal Testing Framework - Main Entry Point
 * 
 * Comprehensive testing infrastructure for camera, voice, and text modalities
 * across atomic, molecular, and organism abstraction levels
 */

import { crossModalTester, type CrossModalTestConfig, type CrossModalTestResult } from './cross-modal-tester';
import { axeAccessibilityTester, testAccessibility, testModalityAccessibility } from './axe-accessibility';
import { handoffTester, testHandoff, testAllHandoffs, type HandoffResult } from './handoff-tester';
import { loadTester, type LoadTestConfig } from '../performance/load-tester';
import { cacheManager } from '../performance/cache-manager';

export interface TestSuite {
  id: string;
  name: string;
  config: CrossModalTestConfig;
  includeAccessibility: boolean;
  includeHandoffTesting: boolean;
  includeLoadTesting: boolean;
  generateReports: boolean;
}

export interface TestSuiteResult {
  suiteId: string;
  startTime: number;
  endTime: number;
  overallSuccess: boolean;
  crossModalResults: CrossModalTestResult;
  handoffResults?: Map<string, HandoffResult>;
  loadTestResults?: any;
  accessibilityResults?: any;
  reports: {
    crossModal?: string;
    handoff?: string;
    accessibility?: string;
    combined?: string;
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageLatency: number;
    accessibilityScore: number;
    performanceScore: number;
    handoffScore: number;
  };
}

/**
 * Main Testing Orchestrator
 */
export class TestingOrchestrator {
  private isInitialized = false;
  private activeSuites = new Map<string, any>();
  
  /**
   * Initialize testing framework
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[Testing] Initializing cross-modal testing framework...');
    
    try {
      // Initialize accessibility testing
      await axeAccessibilityTester.initialize();
      
      // Initialize cache for test data
      await cacheManager.initialize();
      
      this.isInitialized = true;
      console.log('[Testing] Framework initialized successfully');
      
    } catch (error) {
      console.error('[Testing] Failed to initialize framework:', error);
      throw error;
    }
  }
  
  /**
   * Run comprehensive test suite
   */
  public async runTestSuite(suite: TestSuite): Promise<TestSuiteResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const startTime = Date.now();
    console.log(`[Testing] Running test suite: ${suite.name}`);
    
    // Track active suite
    this.activeSuites.set(suite.id, { startTime, config: suite.config });
    
    const result: TestSuiteResult = {
      suiteId: suite.id,
      startTime,
      endTime: 0,
      overallSuccess: false,
      crossModalResults: {} as CrossModalTestResult,
      reports: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        averageLatency: 0,
        accessibilityScore: 0,
        performanceScore: 0,
        handoffScore: 0
      }
    };
    
    try {
      // 1. Run cross-modal tests
      console.log('[Testing] Running cross-modal tests...');
      result.crossModalResults = await crossModalTester.runTests();
      
      // 2. Run handoff tests if enabled
      if (suite.includeHandoffTesting) {
        console.log('[Testing] Running handoff tests...');
        result.handoffResults = await handoffTester.runAllHandoffTests();
      }
      
      // 3. Run load tests if enabled
      if (suite.includeLoadTesting) {
        console.log('[Testing] Running load tests...');
        result.loadTestResults = await this.runLoadTests(suite.config);
      }
      
      // 4. Run additional accessibility tests if enabled
      if (suite.includeAccessibility) {
        console.log('[Testing] Running additional accessibility tests...');
        result.accessibilityResults = await this.runAccessibilityTests();
      }
      
      // 5. Generate reports if enabled
      if (suite.generateReports) {
        console.log('[Testing] Generating reports...');
        result.reports = await this.generateReports(result);
      }
      
      // Calculate summary
      result.summary = this.calculateSummary(result);
      result.overallSuccess = this.determineOverallSuccess(result);
      
    } catch (error) {
      console.error(`[Testing] Test suite ${suite.id} failed:`, error);
      result.overallSuccess = false;
    } finally {
      result.endTime = Date.now();
      this.activeSuites.delete(suite.id);
    }
    
    console.log(`[Testing] Test suite completed: ${result.overallSuccess ? '✅' : '❌'} (${result.endTime - result.startTime}ms)`);
    
    return result;
  }
  
  private async runLoadTests(config: CrossModalTestConfig): Promise<any> {
    const loadConfig: LoadTestConfig = {
      scenarios: [
        {
          name: 'Camera Processing Load',
          users: config.concurrentUsers,
          duration: 30000, // 30 seconds
          rampUpTime: 5000,
          rampDownTime: 5000,
          actions: [
            { type: 'camera', weight: 1, params: { resolution: '1080p' } }
          ]
        },
        {
          name: 'Voice Processing Load',
          users: Math.floor(config.concurrentUsers * 0.8),
          duration: 30000,
          rampUpTime: 5000,
          rampDownTime: 5000,
          actions: [
            { type: 'voice', weight: 1, params: { realtime: true } }
          ]
        },
        {
          name: 'Text Processing Load',
          users: config.concurrentUsers,
          duration: 20000,
          rampUpTime: 2000,
          rampDownTime: 2000,
          actions: [
            { type: 'text', weight: 1, params: { complexity: 'high' } }
          ]
        },
        {
          name: 'Multi-Modal Load',
          users: Math.floor(config.concurrentUsers * 0.5),
          duration: 45000,
          rampUpTime: 10000,
          rampDownTime: 5000,
          actions: [
            { type: 'camera', weight: 0.4, params: { resolution: '720p' } },
            { type: 'voice', weight: 0.3, params: { realtime: true } },
            { type: 'text', weight: 0.3, params: { complexity: 'medium' } }
          ]
        }
      ],
      thresholds: {
        latency: { p95: config.performanceThresholds.latency },
        errorRate: { max: 0.05 }, // 5% max error rate
        throughput: { min: 100 } // 100 requests/second minimum
      }
    };
    
    return loadTester.runLoadTest(loadConfig);
  }
  
  private async runAccessibilityTests(): Promise<any> {
    const results = {
      modalityTests: {},
      crossModalTests: {},
      complianceScore: 0
    };
    
    // Test each modality at each level
    for (const modality of ['camera', 'voice', 'text'] as const) {
      results.modalityTests[modality] = {};
      
      for (const level of ['atomic', 'molecular', 'organism'] as const) {
        try {
          const result = await testModalityAccessibility(modality, level);
          results.modalityTests[modality][level] = result;
        } catch (error) {
          console.warn(`[Testing] Accessibility test failed for ${modality}-${level}:`, error);
        }
      }
    }
    
    // Test cross-modal accessibility
    results.crossModalTests = await axeAccessibilityTester.testCrossModalAccessibility();
    
    // Calculate overall compliance score
    results.complianceScore = this.calculateAccessibilityScore(results);
    
    return results;
  }
  
  private calculateAccessibilityScore(results: any): number {
    // Calculate weighted accessibility score
    let totalScore = 0;
    let count = 0;
    
    // Modality tests (60% weight)
    for (const modalityResults of Object.values(results.modalityTests)) {
      for (const levelResult of Object.values(modalityResults as any)) {
        if (levelResult && typeof levelResult === 'object' && 'violations' in levelResult) {
          const score = (levelResult as any).violations.length === 0 ? 1 : 0.8;
          totalScore += score * 0.6;
          count++;
        }
      }
    }
    
    // Cross-modal tests (40% weight)
    if (results.crossModalTests && results.crossModalTests.overallScore) {
      totalScore += (results.crossModalTests.overallScore / 100) * 0.4;
      count++;
    }
    
    return count > 0 ? totalScore / count : 0;
  }
  
  private async generateReports(result: TestSuiteResult): Promise<{
    crossModal?: string;
    handoff?: string;
    accessibility?: string;
    combined?: string;
  }> {
    const reports: any = {};
    
    // Generate cross-modal report
    reports.crossModal = crossModalTester.generateReport(result.crossModalResults);
    
    // Generate handoff report
    if (result.handoffResults) {
      reports.handoff = handoffTester.generateHandoffReport(result.handoffResults);
    }
    
    // Generate accessibility report
    if (result.accessibilityResults) {
      reports.accessibility = this.generateAccessibilityReport(result.accessibilityResults);
    }
    
    // Generate combined report
    reports.combined = this.generateCombinedReport(result, reports);
    
    return reports;
  }
  
  private generateAccessibilityReport(results: any): string {
    return `
# Accessibility Test Report

## Overall Compliance Score
${(results.complianceScore * 100).toFixed(1)}%

## Modality Test Results
${Object.entries(results.modalityTests).map(([modality, levels]) => `
### ${modality.charAt(0).toUpperCase() + modality.slice(1)}
${Object.entries(levels as any).map(([level, result]) => `
- **${level}**: ${(result as any)?.violations?.length === 0 ? '✅ Compliant' : '❌ Issues found'}
`).join('')}
`).join('')}

## Cross-Modal Accessibility
- **Handoff Accessibility**: ${results.crossModalTests.handoffAccessibility}%
- **Context Accessibility**: ${results.crossModalTests.contextAccessibility}%
- **Overall Score**: ${results.crossModalTests.overallScore}%
    `;
  }
  
  private generateCombinedReport(result: TestSuiteResult, reports: any): string {
    const { summary } = result;
    
    return `
# Comprehensive Cross-Modal Testing Report

## Executive Summary
- **Test Suite**: ${result.suiteId}
- **Duration**: ${result.endTime - result.startTime}ms
- **Overall Success**: ${result.overallSuccess ? '✅ PASS' : '❌ FAIL'}

## Key Metrics
- **Total Tests**: ${summary.totalTests}
- **Success Rate**: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%
- **Average Latency**: ${summary.averageLatency.toFixed(2)}ms
- **Accessibility Score**: ${(summary.accessibilityScore * 100).toFixed(1)}%
- **Performance Score**: ${(summary.performanceScore * 100).toFixed(1)}%
- **Handoff Score**: ${(summary.handoffScore * 100).toFixed(1)}%

## Test Categories

### Cross-Modal Testing
${reports.crossModal ? '✅ Completed' : '❌ Not run'}

### Handoff Testing
${reports.handoff ? '✅ Completed' : '❌ Not run'}

### Accessibility Testing
${reports.accessibility ? '✅ Completed' : '❌ Not run'}

### Load Testing
${result.loadTestResults ? '✅ Completed' : '❌ Not run'}

## Detailed Reports
See individual section reports below for comprehensive details.

---

${reports.crossModal || ''}

---

${reports.handoff || ''}

---

${reports.accessibility || ''}
    `;
  }
  
  private calculateSummary(result: TestSuiteResult): TestSuiteResult['summary'] {
    const crossModal = result.crossModalResults.summary;
    
    let totalTests = crossModal.totalTests;
    let passedTests = crossModal.passedTests;
    let failedTests = crossModal.failedTests;
    let totalLatency = crossModal.averageLatency * crossModal.totalTests;
    
    // Add handoff test results
    if (result.handoffResults) {
      const handoffResults = Array.from(result.handoffResults.values());
      totalTests += handoffResults.length;
      passedTests += handoffResults.filter(r => r.success).length;
      failedTests += handoffResults.filter(r => !r.success).length;
      totalLatency += handoffResults.reduce((sum, r) => sum + r.actualLatency, 0);
    }
    
    // Calculate scores
    const accessibilityScore = result.accessibilityResults?.complianceScore || crossModal.accessibilityScore;
    const performanceScore = crossModal.performanceScore;
    const handoffScore = result.handoffResults ? 
      Array.from(result.handoffResults.values()).reduce((sum, r) => sum + r.stateConsistency, 0) / result.handoffResults.size :
      0;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      averageLatency: totalTests > 0 ? totalLatency / totalTests : 0,
      accessibilityScore,
      performanceScore,
      handoffScore
    };
  }
  
  private determineOverallSuccess(result: TestSuiteResult): boolean {
    const { summary } = result;
    
    // Success criteria
    const passRate = summary.totalTests > 0 ? summary.passedTests / summary.totalTests : 0;
    const criteriaPassRate = passRate >= 0.95; // 95% pass rate
    const criteriaLatency = summary.averageLatency <= 200; // 200ms average
    const criteriaAccessibility = summary.accessibilityScore >= 0.9; // 90% accessibility
    const criteriaPerformance = summary.performanceScore >= 0.8; // 80% performance
    const criteriaHandoff = summary.handoffScore >= 0.9; // 90% handoff success
    
    return criteriaPassRate && criteriaLatency && criteriaAccessibility && 
           criteriaPerformance && (summary.handoffScore === 0 || criteriaHandoff);
  }
  
  /**
   * Quick test utility for specific scenarios
   */
  public async quickTest(options: {
    modalities?: ('camera' | 'voice' | 'text')[];
    levels?: ('atomic' | 'molecular' | 'organism')[];
    includeHandoffs?: boolean;
    includeAccessibility?: boolean;
  }): Promise<TestSuiteResult> {
    const config: CrossModalTestConfig = {
      modalities: options.modalities || ['camera', 'voice', 'text'],
      abstractionLevels: options.levels || ['atomic', 'molecular', 'organism'],
      testDuration: 30000,
      concurrentUsers: 50,
      performanceThresholds: {
        latency: 200,
        fps: 25,
        wcagCompliance: 0.9
      },
      accessibility: {
        enableAxeCore: options.includeAccessibility || false,
        wcagLevel: 'AAA',
        testScreenReader: false
      }
    };
    
    const suite: TestSuite = {
      id: `quick-test-${Date.now()}`,
      name: 'Quick Cross-Modal Test',
      config,
      includeAccessibility: options.includeAccessibility || false,
      includeHandoffTesting: options.includeHandoffs || false,
      includeLoadTesting: false,
      generateReports: true
    };
    
    return this.runTestSuite(suite);
  }
  
  /**
   * Benchmark test for performance analysis
   */
  public async benchmarkTest(): Promise<TestSuiteResult> {
    const suite: TestSuite = {
      id: `benchmark-${Date.now()}`,
      name: 'Cross-Modal Performance Benchmark',
      config: {
        modalities: ['camera', 'voice', 'text'],
        abstractionLevels: ['atomic', 'molecular', 'organism'],
        testDuration: 60000,
        concurrentUsers: 1000,
        performanceThresholds: {
          latency: 100,
          fps: 30,
          wcagCompliance: 0.95
        },
        accessibility: {
          enableAxeCore: true,
          wcagLevel: 'AAA',
          testScreenReader: true
        }
      },
      includeAccessibility: true,
      includeHandoffTesting: true,
      includeLoadTesting: true,
      generateReports: true
    };
    
    return this.runTestSuite(suite);
  }
  
  /**
   * Get active test suites
   */
  public getActiveSuites(): string[] {
    return Array.from(this.activeSuites.keys());
  }
  
  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.activeSuites.clear();
    axeAccessibilityTester.dispose();
    this.isInitialized = false;
  }
}

// Export main orchestrator instance
export const testingOrchestrator = new TestingOrchestrator();

// Export all testing utilities
export {
  // Main components
  crossModalTester,
  axeAccessibilityTester,
  handoffTester,
  
  // Utility functions
  testAccessibility,
  testModalityAccessibility,
  testHandoff,
  testAllHandoffs,
  
  // Types
  type CrossModalTestConfig,
  type CrossModalTestResult,
  type HandoffResult,
  type TestSuite,
  type TestSuiteResult
};

// Default export
export default testingOrchestrator;
