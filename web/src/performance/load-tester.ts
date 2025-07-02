/**
 * Load Testing Framework
 * 
 * Implements concurrent user simulation and performance testing
 * Supports up to 10k concurrent users with real-time metrics
 */

export interface LoadTestConfig {
  maxConcurrentUsers: number;
  rampUpDuration: number;      // ms to reach max users
  testDuration: number;        // ms to run test
  rampDownDuration: number;    // ms to ramp down
  scenarioWeights: Record<string, number>; // Scenario distribution
  targetEndpoints: string[];
  performanceThresholds: {
    responseTime: number;      // Max acceptable response time
    errorRate: number;         // Max acceptable error rate
    throughput: number;        // Min required throughput (req/sec)
  };
}

export interface UserScenario {
  name: string;
  weight: number;
  actions: ScenarioAction[];
  thinkTime: { min: number; max: number }; // Random delay between actions
}

export interface ScenarioAction {
  type: 'camera' | 'voice' | 'text' | 'analysis' | 'validation' | 'custom';
  name: string;
  execute: (userContext: UserContext) => Promise<ActionResult>;
  timeout: number;
  retries: number;
  expectedDuration: number;
}

export interface UserContext {
  userId: string;
  sessionId: string;
  startTime: number;
  actionsCompleted: number;
  errors: number;
  totalResponseTime: number;
  currentScenario: string;
  userData: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  dataTransferred: number;
  metadata: Record<string, any>;
}

export interface LoadTestMetrics {
  timestamp: number;
  activeUsers: number;
  totalRequestsSent: number;
  totalResponsesReceived: number;
  successfulResponses: number;
  failedResponses: number;
  averageResponseTime: number;
  percentileResponseTimes: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  throughput: number;          // requests per second
  errorRate: number;           // percentage
  dataTransferRate: number;    // bytes per second
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface LoadTestResult {
  testId: string;
  config: LoadTestConfig;
  startTime: number;
  endTime: number;
  duration: number;
  finalMetrics: LoadTestMetrics;
  thresholdsPassed: boolean;
  detailedResults: {
    userResults: UserResult[];
    timeSeriesMetrics: LoadTestMetrics[];
    errorBreakdown: Record<string, number>;
    scenarioPerformance: Record<string, ScenarioMetrics>;
  };
}

export interface UserResult {
  userId: string;
  scenario: string;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  totalDuration: number;
  averageResponseTime: number;
  errors: string[];
}

export interface ScenarioMetrics {
  name: string;
  totalExecutions: number;
  successRate: number;
  averageResponseTime: number;
  throughput: number;
  errorBreakdown: Record<string, number>;
}

/**
 * Virtual user implementation
 */
class VirtualUser {
  private context: UserContext;
  private isActive = false;
  private currentAction: Promise<void> | null = null;
  
  constructor(
    userId: string,
    private scenario: UserScenario,
    private onActionComplete: (userId: string, result: ActionResult) => void,
    private onUserComplete: (userId: string, result: UserResult) => void
  ) {
    this.context = {
      userId,
      sessionId: `session_${userId}_${Date.now()}`,
      startTime: Date.now(),
      actionsCompleted: 0,
      errors: 0,
      totalResponseTime: 0,
      currentScenario: scenario.name,
      userData: {}
    };
  }
  
  /**
   * Start user simulation
   */
  public async start(): Promise<void> {
    this.isActive = true;
    
    try {
      for (const action of this.scenario.actions) {
        if (!this.isActive) break;
        
        // Execute action
        const result = await this.executeAction(action);
        this.onActionComplete(this.context.userId, result);
        
        // Update context
        this.context.actionsCompleted++;
        this.context.totalResponseTime += result.responseTime;
        
        if (!result.success) {
          this.context.errors++;
        }
        
        // Think time (random delay)
        if (this.isActive) {
          const thinkTime = this.randomBetween(
            this.scenario.thinkTime.min,
            this.scenario.thinkTime.max
          );
          await this.delay(thinkTime);
        }
      }
    } finally {
      this.onUserComplete(this.context.userId, this.createUserResult());
    }
  }
  
  /**
   * Stop user simulation
   */
  public stop(): void {
    this.isActive = false;
  }
  
  private async executeAction(action: ScenarioAction): Promise<ActionResult> {
    const startTime = performance.now();
    
    try {
      // Execute with timeout
      const result = await Promise.race([
        action.execute(this.context),
        this.timeoutPromise(action.timeout)
      ]);
      
      const responseTime = performance.now() - startTime;
      
      return {
        ...result,
        responseTime
      };
      
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      return {
        success: false,
        responseTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        dataTransferred: 0,
        metadata: {}
      };
    }
  }
  
  private timeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Action timeout after ${timeout}ms`)), timeout);
    });
  }
  
  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private createUserResult(): UserResult {
    const totalDuration = Date.now() - this.context.startTime;
    
    return {
      userId: this.context.userId,
      scenario: this.scenario.name,
      totalActions: this.context.actionsCompleted,
      successfulActions: this.context.actionsCompleted - this.context.errors,
      failedActions: this.context.errors,
      totalDuration,
      averageResponseTime: this.context.actionsCompleted > 0 
        ? this.context.totalResponseTime / this.context.actionsCompleted 
        : 0,
      errors: []
    };
  }
}

/**
 * Load test orchestrator
 */
export class LoadTester {
  private activeUsers: Map<string, VirtualUser> = new Map();
  private testMetrics: LoadTestMetrics[] = [];
  private actionResults: ActionResult[] = [];
  private userResults: UserResult[] = [];
  private isRunning = false;
  private testStartTime = 0;
  private metricsInterval: NodeJS.Timeout | null = null;
  
  /**
   * Define common test scenarios
   */
  public static getStandardScenarios(): UserScenario[] {
    return [
      {
        name: 'camera_basic',
        weight: 0.4,
        actions: [
          {
            type: 'camera',
            name: 'initialize_camera',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate camera initialization
              await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
              
              return {
                success: Math.random() > 0.05, // 95% success rate
                responseTime: performance.now() - start,
                dataTransferred: 1024,
                metadata: { action: 'camera_init' }
              };
            },
            timeout: 1000,
            retries: 2,
            expectedDuration: 100
          },
          {
            type: 'camera',
            name: 'capture_frame',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate frame capture
              await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 25));
              
              return {
                success: Math.random() > 0.02, // 98% success rate
                responseTime: performance.now() - start,
                dataTransferred: 512 * 1024, // 512KB frame
                metadata: { action: 'frame_capture' }
              };
            },
            timeout: 500,
            retries: 1,
            expectedDuration: 50
          }
        ],
        thinkTime: { min: 100, max: 500 }
      },
      
      {
        name: 'voice_processing',
        weight: 0.3,
        actions: [
          {
            type: 'voice',
            name: 'start_recording',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate voice recording start
              await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 40));
              
              return {
                success: Math.random() > 0.03, // 97% success rate
                responseTime: performance.now() - start,
                dataTransferred: 2048,
                metadata: { action: 'voice_start' }
              };
            },
            timeout: 800,
            retries: 2,
            expectedDuration: 80
          },
          {
            type: 'voice',
            name: 'process_audio',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate audio processing
              await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
              
              return {
                success: Math.random() > 0.08, // 92% success rate (more complex)
                responseTime: performance.now() - start,
                dataTransferred: 128 * 1024, // 128KB audio
                metadata: { action: 'audio_process' }
              };
            },
            timeout: 1500,
            retries: 1,
            expectedDuration: 200
          }
        ],
        thinkTime: { min: 200, max: 800 }
      },
      
      {
        name: 'multimodal_analysis',
        weight: 0.2,
        actions: [
          {
            type: 'analysis',
            name: 'visual_analysis',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate visual analysis
              await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
              
              return {
                success: Math.random() > 0.1, // 90% success rate (AI processing)
                responseTime: performance.now() - start,
                dataTransferred: 64 * 1024, // 64KB analysis result
                metadata: { action: 'visual_analysis' }
              };
            },
            timeout: 2000,
            retries: 1,
            expectedDuration: 300
          },
          {
            type: 'validation',
            name: 'wcag_validation',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate WCAG validation
              await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));
              
              return {
                success: Math.random() > 0.05, // 95% success rate
                responseTime: performance.now() - start,
                dataTransferred: 8 * 1024, // 8KB validation result
                metadata: { action: 'wcag_validation' }
              };
            },
            timeout: 1000,
            retries: 2,
            expectedDuration: 150
          }
        ],
        thinkTime: { min: 300, max: 1000 }
      },
      
      {
        name: 'text_interaction',
        weight: 0.1,
        actions: [
          {
            type: 'text',
            name: 'send_message',
            execute: async (ctx) => {
              const start = performance.now();
              
              // Simulate text message
              await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 10));
              
              return {
                success: Math.random() > 0.01, // 99% success rate
                responseTime: performance.now() - start,
                dataTransferred: 1024,
                metadata: { action: 'text_message' }
              };
            },
            timeout: 500,
            retries: 1,
            expectedDuration: 30
          }
        ],
        thinkTime: { min: 50, max: 200 }
      }
    ];
  }
  
  /**
   * Run load test
   */
  public async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.testStartTime = Date.now();
    this.isRunning = true;
    
    console.log(`Starting load test ${testId} with ${config.maxConcurrentUsers} users`);
    
    // Reset state
    this.activeUsers.clear();
    this.testMetrics = [];
    this.actionResults = [];
    this.userResults = [];
    
    // Start metrics collection
    this.startMetricsCollection();
    
    try {
      // Ramp up users
      await this.rampUpUsers(config);
      
      // Run test for specified duration
      await this.delay(config.testDuration);
      
      // Ramp down users
      await this.rampDownUsers(config);
      
    } finally {
      this.isRunning = false;
      this.stopMetricsCollection();
    }
    
    const endTime = Date.now();
    const finalMetrics = this.calculateCurrentMetrics();
    
    return {
      testId,
      config,
      startTime: this.testStartTime,
      endTime,
      duration: endTime - this.testStartTime,
      finalMetrics,
      thresholdsPassed: this.checkThresholds(finalMetrics, config.performanceThresholds),
      detailedResults: {
        userResults: [...this.userResults],
        timeSeriesMetrics: [...this.testMetrics],
        errorBreakdown: this.calculateErrorBreakdown(),
        scenarioPerformance: this.calculateScenarioPerformance()
      }
    };
  }
  
  private async rampUpUsers(config: LoadTestConfig): Promise<void> {
    const scenarios = LoadTester.getStandardScenarios();
    const rampUpInterval = config.rampUpDuration / config.maxConcurrentUsers;
    
    for (let i = 0; i < config.maxConcurrentUsers; i++) {
      if (!this.isRunning) break;
      
      // Select scenario based on weights
      const scenario = this.selectScenario(scenarios, config.scenarioWeights);
      
      // Create and start user
      const userId = `user_${i}_${Date.now()}`;
      const user = new VirtualUser(
        userId,
        scenario,
        (userId, result) => this.onActionComplete(userId, result),
        (userId, result) => this.onUserComplete(userId, result)
      );
      
      this.activeUsers.set(userId, user);
      user.start(); // Don't await - run concurrently
      
      // Delay before starting next user
      await this.delay(rampUpInterval);
    }
    
    console.log(`Ramped up to ${this.activeUsers.size} concurrent users`);
  }
  
  private async rampDownUsers(config: LoadTestConfig): Promise<void> {
    const users = Array.from(this.activeUsers.values());
    const rampDownInterval = config.rampDownDuration / users.length;
    
    for (const user of users) {
      user.stop();
      await this.delay(rampDownInterval);
    }
    
    // Wait for all users to complete
    const remainingUsers = Array.from(this.activeUsers.values());
    await Promise.all(remainingUsers.map(user => 
      new Promise<void>(resolve => {
        const checkComplete = () => {
          if (!this.activeUsers.has(user['context'].userId)) {
            resolve();
          } else {
            setTimeout(checkComplete, 100);
          }
        };
        checkComplete();
      })
    ));
    
    console.log('All users completed');
  }
  
  private selectScenario(scenarios: UserScenario[], weights: Record<string, number>): UserScenario {
    const random = Math.random();
    let cumulative = 0;
    
    for (const scenario of scenarios) {
      const weight = weights[scenario.name] || scenario.weight;
      cumulative += weight;
      
      if (random <= cumulative) {
        return scenario;
      }
    }
    
    return scenarios[0]; // Fallback
  }
  
  private onActionComplete(userId: string, result: ActionResult): void {
    this.actionResults.push({
      ...result,
      metadata: { ...result.metadata, userId, timestamp: Date.now() }
    });
  }
  
  private onUserComplete(userId: string, result: UserResult): void {
    this.userResults.push(result);
    this.activeUsers.delete(userId);
  }
  
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = this.calculateCurrentMetrics();
      this.testMetrics.push(metrics);
    }, 1000); // Collect metrics every second
  }
  
  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
  
  private calculateCurrentMetrics(): LoadTestMetrics {
    const now = Date.now();
    const recentResults = this.actionResults.filter(r => 
      now - (r.metadata.timestamp || 0) <= 60000 // Last minute
    );
    
    const responseTimes = recentResults.map(r => r.responseTime).sort((a, b) => a - b);
    const successfulResponses = recentResults.filter(r => r.success).length;
    
    return {
      timestamp: now,
      activeUsers: this.activeUsers.size,
      totalRequestsSent: this.actionResults.length,
      totalResponsesReceived: this.actionResults.length,
      successfulResponses,
      failedResponses: this.actionResults.length - successfulResponses,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      percentileResponseTimes: {
        p50: this.percentile(responseTimes, 0.5),
        p90: this.percentile(responseTimes, 0.9),
        p95: this.percentile(responseTimes, 0.95),
        p99: this.percentile(responseTimes, 0.99)
      },
      throughput: recentResults.length / 60, // per second over last minute
      errorRate: recentResults.length > 0 
        ? (recentResults.length - successfulResponses) / recentResults.length 
        : 0,
      dataTransferRate: recentResults.reduce((sum, r) => sum + r.dataTransferred, 0) / 60,
      resourceUtilization: this.getResourceUtilization()
    };
  }
  
  private percentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }
  
  private getResourceUtilization(): { cpu: number; memory: number; network: number } {
    // Simplified resource utilization estimation
    const activeUsers = this.activeUsers.size;
    const maxUsers = 10000;
    
    return {
      cpu: Math.min(100, (activeUsers / maxUsers) * 80 + Math.random() * 20),
      memory: Math.min(100, (activeUsers / maxUsers) * 70 + Math.random() * 15),
      network: Math.min(100, (activeUsers / maxUsers) * 60 + Math.random() * 25)
    };
  }
  
  private checkThresholds(metrics: LoadTestMetrics, thresholds: LoadTestConfig['performanceThresholds']): boolean {
    return metrics.averageResponseTime <= thresholds.responseTime &&
           metrics.errorRate <= thresholds.errorRate &&
           metrics.throughput >= thresholds.throughput;
  }
  
  private calculateErrorBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    this.actionResults.forEach(result => {
      if (!result.success) {
        const errorType = result.errorMessage || 'unknown_error';
        breakdown[errorType] = (breakdown[errorType] || 0) + 1;
      }
    });
    
    return breakdown;
  }
  
  private calculateScenarioPerformance(): Record<string, ScenarioMetrics> {
    const scenarios: Record<string, ScenarioMetrics> = {};
    
    this.userResults.forEach(result => {
      if (!scenarios[result.scenario]) {
        scenarios[result.scenario] = {
          name: result.scenario,
          totalExecutions: 0,
          successRate: 0,
          averageResponseTime: 0,
          throughput: 0,
          errorBreakdown: {}
        };
      }
      
      const scenario = scenarios[result.scenario];
      scenario.totalExecutions++;
      scenario.successRate = (scenario.successRate * (scenario.totalExecutions - 1) + 
        (result.successfulActions / result.totalActions)) / scenario.totalExecutions;
      scenario.averageResponseTime = (scenario.averageResponseTime * (scenario.totalExecutions - 1) + 
        result.averageResponseTime) / scenario.totalExecutions;
    });
    
    return scenarios;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Stop running test
   */
  public stop(): void {
    this.isRunning = false;
    this.activeUsers.forEach(user => user.stop());
  }
  
  /**
   * Get current test status
   */
  public getStatus(): {
    isRunning: boolean;
    activeUsers: number;
    totalActions: number;
    currentMetrics: LoadTestMetrics | null;
  } {
    return {
      isRunning: this.isRunning,
      activeUsers: this.activeUsers.size,
      totalActions: this.actionResults.length,
      currentMetrics: this.isRunning ? this.calculateCurrentMetrics() : null
    };
  }
}

// Export default configurations
export const DEFAULT_LOAD_TEST_CONFIG: LoadTestConfig = {
  maxConcurrentUsers: 1000,
  rampUpDuration: 60 * 1000,      // 1 minute
  testDuration: 5 * 60 * 1000,    // 5 minutes
  rampDownDuration: 30 * 1000,    // 30 seconds
  scenarioWeights: {
    camera_basic: 0.4,
    voice_processing: 0.3,
    multimodal_analysis: 0.2,
    text_interaction: 0.1
  },
  targetEndpoints: [],
  performanceThresholds: {
    responseTime: 200,    // 200ms max response time
    errorRate: 0.05,      // 5% max error rate
    throughput: 100       // 100 requests/second minimum
  }
};

export const STRESS_TEST_CONFIG: LoadTestConfig = {
  ...DEFAULT_LOAD_TEST_CONFIG,
  maxConcurrentUsers: 10000,
  rampUpDuration: 5 * 60 * 1000,   // 5 minutes
  testDuration: 10 * 60 * 1000,    // 10 minutes
  rampDownDuration: 2 * 60 * 1000, // 2 minutes
  performanceThresholds: {
    responseTime: 500,    // 500ms max response time for stress test
    errorRate: 0.1,       // 10% max error rate for stress test
    throughput: 500       // 500 requests/second minimum
  }
};

// Global load tester instance
export const loadTester = new LoadTester();

/**
 * Utility function to run a quick performance test
 */
export async function runQuickLoadTest(users: number = 100): Promise<LoadTestResult> {
  const config: LoadTestConfig = {
    ...DEFAULT_LOAD_TEST_CONFIG,
    maxConcurrentUsers: users,
    rampUpDuration: 10 * 1000,     // 10 seconds
    testDuration: 30 * 1000,       // 30 seconds
    rampDownDuration: 5 * 1000     // 5 seconds
  };
  
  return loadTester.runLoadTest(config);
}

/**
 * Utility function to run stress test
 */
export async function runStressTest(): Promise<LoadTestResult> {
  return loadTester.runLoadTest(STRESS_TEST_CONFIG);
}
