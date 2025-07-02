/**
 * Axe Core Accessibility Testing Integration
 * 
 * Automated WCAG AAA compliance testing using Axe Core
 * Integrates with cross-modal testing framework
 */

import { AxeResults, Result, CheckResult, NodeResult } from 'axe-core';

export interface AxeTestConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  tags: string[];
  rules: Record<string, any>;
  exclude?: string[];
  include?: string[];
}

export interface AccessibilityTestResult {
  passed: boolean;
  score: number; // 0-100
  wcagLevel: 'A' | 'AA' | 'AAA' | 'FAIL';
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  inapplicable: AccessibilityRule[];
  incomplete: AccessibilityRule[];
  summary: AccessibilitySummary;
  recommendations: string[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: ViolationNode[];
  wcagLevel: string;
  ruleType: 'wcag21a' | 'wcag21aa' | 'wcag21aaa' | 'best-practice';
}

export interface AccessibilityPass {
  id: string;
  description: string;
  help: string;
  tags: string[];
  nodes: PassNode[];
}

export interface AccessibilityRule {
  id: string;
  description: string;
  help: string;
  tags: string[];
}

export interface ViolationNode {
  html: string;
  target: string[];
  failureSummary: string;
  element: Element | null;
  xpath: string;
  ancestry: string[];
  fixes: FixSuggestion[];
}

export interface PassNode {
  html: string;
  target: string[];
}

export interface FixSuggestion {
  type: 'immediate' | 'architectural' | 'design';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  resources?: string[];
}

export interface AccessibilitySummary {
  totalRules: number;
  violationCount: number;
  passCount: number;
  incompleteCount: number;
  inapplicableCount: number;
  complianceScore: number;
  criticalIssues: number;
  moderateIssues: number;
  minorIssues: number;
}

/**
 * Axe Core Accessibility Tester
 */
export class AxeAccessibilityTester {
  private config: AxeTestConfig;
  private axeInstance: any = null;

  constructor(config?: Partial<AxeTestConfig>) {
    this.config = {
      wcagLevel: 'AAA',
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa'],
      rules: this.getDefaultRules(),
      exclude: [],
      include: [],
      ...config
    };
    
    this.initializeAxe();
  }

  private async initializeAxe(): Promise<void> {
    try {
      // Dynamic import of axe-core for client-side usage
      const axeCore = await import('axe-core');
      this.axeInstance = axeCore.default || axeCore;
      
      // Configure axe with our settings
      this.axeInstance.configure({
        tags: this.config.tags,
        rules: this.config.rules
      });
    } catch (error) {
      console.warn('Axe Core not available, using fallback accessibility testing');
      this.axeInstance = this.createFallbackAxe();
    }
  }

  private getDefaultRules(): Record<string, any> {
    return {
      // WCAG 2.1 Level A Rules
      'area-alt': { enabled: true },
      'aria-allowed-attr': { enabled: true },
      'aria-command-name': { enabled: true },
      'aria-hidden-body': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'aria-input-field-name': { enabled: true },
      'aria-meter-name': { enabled: true },
      'aria-progressbar-name': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-required-children': { enabled: true },
      'aria-required-parent': { enabled: true },
      'aria-roledescription': { enabled: true },
      'aria-roles': { enabled: true },
      'aria-tooltip-name': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'aria-valid-attr': { enabled: true },
      'audio-caption': { enabled: true },
      'blink': { enabled: true },
      'button-name': { enabled: true },
      'bypass': { enabled: true },
      'color-contrast': { enabled: true },
      'definition-list': { enabled: true },
      'dlitem': { enabled: true },
      'document-title': { enabled: true },
      'duplicate-id-active': { enabled: true },
      'duplicate-id-aria': { enabled: true },
      'duplicate-id': { enabled: true },
      'empty-heading': { enabled: true },
      'focus-order-semantics': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'frame-title': { enabled: true },
      'heading-order': { enabled: true },
      'hidden-content': { enabled: true },
      'html-has-lang': { enabled: true },
      'html-lang-valid': { enabled: true },
      'html-xml-lang-mismatch': { enabled: true },
      'image-alt': { enabled: true },
      'input-button-name': { enabled: true },
      'input-image-alt': { enabled: true },
      'keyboard': { enabled: true },
      'label': { enabled: true },
      'landmark-banner-is-top-level': { enabled: true },
      'landmark-complementary-is-top-level': { enabled: true },
      'landmark-contentinfo-is-top-level': { enabled: true },
      'landmark-main-is-top-level': { enabled: true },
      'landmark-no-duplicate-banner': { enabled: true },
      'landmark-no-duplicate-contentinfo': { enabled: true },
      'landmark-no-duplicate-main': { enabled: true },
      'landmark-one-main': { enabled: true },
      'landmark-unique': { enabled: true },
      'link-name': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'marquee': { enabled: true },
      'meta-refresh': { enabled: true },
      'meta-viewport': { enabled: true },
      'nested-interactive': { enabled: true },
      'no-autoplay-audio': { enabled: true },
      'object-alt': { enabled: true },
      'page-has-heading-one': { enabled: true },
      'presentation-role-conflict': { enabled: true },
      'role-img-alt': { enabled: true },
      'scrollable-region-focusable': { enabled: true },
      'select-name': { enabled: true },
      'server-side-image-map': { enabled: true },
      'svg-img-alt': { enabled: true },
      'tabindex': { enabled: true },
      'table-duplicate-name': { enabled: true },
      'table-fake-caption': { enabled: true },
      'td-has-header': { enabled: true },
      'td-headers-attr': { enabled: true },
      'th-has-data-cells': { enabled: true },
      'valid-lang': { enabled: true },
      'video-caption': { enabled: true },

      // WCAG 2.1 Level AA Rules
      'color-contrast-enhanced': { enabled: this.config.wcagLevel === 'AAA' },
      'focus-order-semantics': { enabled: true },
      'link-in-text-block': { enabled: true },

      // WCAG 2.1 Level AAA Rules (for maximum accessibility)
      'target-size': { enabled: this.config.wcagLevel === 'AAA' },
      'focus-order-semantics': { enabled: this.config.wcagLevel === 'AAA' }
    };
  }

  public async testElement(element: Element | string): Promise<AccessibilityTestResult> {
    if (!this.axeInstance) {
      await this.initializeAxe();
    }

    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;

    if (!targetElement) {
      return this.createFailedResult('Target element not found');
    }

    try {
      const axeResults: AxeResults = await this.axeInstance.run(targetElement, {
        tags: this.config.tags,
        rules: this.config.rules
      });

      return this.processAxeResults(axeResults);
    } catch (error) {
      console.error('Axe accessibility test failed:', error);
      return this.createFailedResult(`Test execution failed: ${error}`);
    }
  }

  public async testMultipleElements(selectors: string[]): Promise<AccessibilityTestResult[]> {
    const results: AccessibilityTestResult[] = [];
    
    for (const selector of selectors) {
      const result = await this.testElement(selector);
      results.push(result);
    }
    
    return results;
  }

  public async testModalityComponents(modality: 'camera' | 'voice' | 'text', level: 'atomic' | 'molecular' | 'organism'): Promise<AccessibilityTestResult> {
    const selectors = this.getModalitySelectors(modality, level);
    const results = await this.testMultipleElements(selectors);
    
    return this.aggregateResults(results, `${modality}-${level}`);
  }

  private getModalitySelectors(modality: string, level: string): string[] {
    const selectorMap: Record<string, Record<string, string[]>> = {
      camera: {
        atomic: [
          '[data-testid="camera-permission-button"]',
          '[data-testid="camera-feed-display"]',
          '[data-testid="capture-button"]',
          '[data-testid="camera-status-indicator"]',
          '[data-testid="camera-control-icon"]'
        ],
        molecular: [
          '[data-testid="camera-permission-flow"]',
          '[data-testid="camera-feed-container"]',
          '[data-testid="capture-interface"]',
          '[data-testid="camera-error-handler"]',
          '[data-testid="visual-analysis-display"]'
        ],
        organism: [
          '[data-testid="advanced-camera-widget"]',
          '[data-testid="visual-search-interface"]',
          '[data-testid="multi-modal-orchestrator"]',
          '[data-testid="camera-settings-panel"]'
        ]
      },
      voice: {
        atomic: [
          '[data-testid="voice-button"]',
          '[data-testid="voice-indicator"]',
          '[data-testid="voice-status"]'
        ],
        molecular: [
          '[data-testid="voice-recorder"]',
          '[data-testid="voice-player"]',
          '[data-testid="voice-controller"]'
        ],
        organism: [
          '[data-testid="voice-orchestrator"]',
          '[data-testid="multi-modal-orchestrator"]'
        ]
      },
      text: {
        atomic: [
          'input[type="text"]',
          'textarea',
          'button[type="button"]'
        ],
        molecular: [
          'form',
          '[data-testid="text-search"]',
          '[data-testid="text-chat"]'
        ],
        organism: [
          '[data-testid="chat-interface"]',
          '[data-testid="search-interface"]'
        ]
      }
    };

    return selectorMap[modality]?.[level] || [`[data-testid="${modality}-${level}"]`];
  }

  private processAxeResults(axeResults: AxeResults): AccessibilityTestResult {
    const violations = this.processViolations(axeResults.violations);
    const passes = this.processPasses(axeResults.passes);
    const inapplicable = this.processInapplicable(axeResults.inapplicable);
    const incomplete = this.processIncomplete(axeResults.incomplete);
    
    const summary = this.calculateSummary(violations, passes, inapplicable, incomplete);
    const wcagLevel = this.determineWCAGLevel(summary);
    const score = this.calculateComplianceScore(summary);
    const recommendations = this.generateRecommendations(violations);

    return {
      passed: violations.length === 0 && incomplete.length === 0,
      score,
      wcagLevel,
      violations,
      passes,
      inapplicable,
      incomplete,
      summary,
      recommendations
    };
  }

  private processViolations(violations: Result[]): AccessibilityViolation[] {
    return violations.map(violation => ({
      id: violation.id,
      impact: violation.impact as 'minor' | 'moderate' | 'serious' | 'critical',
      tags: violation.tags,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      wcagLevel: this.extractWCAGLevel(violation.tags),
      ruleType: this.extractRuleType(violation.tags),
      nodes: violation.nodes.map(node => this.processViolationNode(node, violation))
    }));
  }

  private processViolationNode(node: NodeResult, violation: Result): ViolationNode {
    const element = this.findElementByTarget(node.target);
    const xpath = this.generateXPath(element);
    const ancestry = this.getElementAncestry(element);
    const fixes = this.generateFixSuggestions(violation, node);

    return {
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary || violation.help,
      element,
      xpath,
      ancestry,
      fixes
    };
  }

  private processPasses(passes: Result[]): AccessibilityPass[] {
    return passes.map(pass => ({
      id: pass.id,
      description: pass.description,
      help: pass.help,
      tags: pass.tags,
      nodes: pass.nodes.map(node => ({
        html: node.html,
        target: node.target
      }))
    }));
  }

  private processInapplicable(inapplicable: Result[]): AccessibilityRule[] {
    return inapplicable.map(rule => ({
      id: rule.id,
      description: rule.description,
      help: rule.help,
      tags: rule.tags
    }));
  }

  private processIncomplete(incomplete: Result[]): AccessibilityRule[] {
    return incomplete.map(rule => ({
      id: rule.id,
      description: rule.description,
      help: rule.help,
      tags: rule.tags
    }));
  }

  private calculateSummary(
    violations: AccessibilityViolation[],
    passes: AccessibilityPass[],
    inapplicable: AccessibilityRule[],
    incomplete: AccessibilityRule[]
  ): AccessibilitySummary {
    const criticalIssues = violations.filter(v => v.impact === 'critical').length;
    const moderateIssues = violations.filter(v => v.impact === 'serious' || v.impact === 'moderate').length;
    const minorIssues = violations.filter(v => v.impact === 'minor').length;
    
    const totalRules = violations.length + passes.length + inapplicable.length + incomplete.length;
    const complianceScore = totalRules > 0 ? Math.round((passes.length / totalRules) * 100) : 0;

    return {
      totalRules,
      violationCount: violations.length,
      passCount: passes.length,
      incompleteCount: incomplete.length,
      inapplicableCount: inapplicable.length,
      complianceScore,
      criticalIssues,
      moderateIssues,
      minorIssues
    };
  }

  private determineWCAGLevel(summary: AccessibilitySummary): 'A' | 'AA' | 'AAA' | 'FAIL' {
    if (summary.criticalIssues > 0) return 'FAIL';
    if (summary.complianceScore < 70) return 'FAIL';
    if (summary.complianceScore >= 95 && summary.moderateIssues === 0) return 'AAA';
    if (summary.complianceScore >= 85) return 'AA';
    return 'A';
  }

  private calculateComplianceScore(summary: AccessibilitySummary): number {
    // Weight different types of violations
    const criticalWeight = 4;
    const moderateWeight = 2;
    const minorWeight = 1;
    
    const totalPenalty = (
      summary.criticalIssues * criticalWeight +
      summary.moderateIssues * moderateWeight +
      summary.minorIssues * minorWeight
    );
    
    const maxScore = 100;
    const penalty = Math.min(totalPenalty * 5, maxScore); // Max 5 points per weighted violation
    
    return Math.max(0, maxScore - penalty);
  }

  private generateRecommendations(violations: AccessibilityViolation[]): string[] {
    const recommendations: string[] = [];
    
    // Group violations by impact and provide targeted recommendations
    const criticalViolations = violations.filter(v => v.impact === 'critical');
    const seriousViolations = violations.filter(v => v.impact === 'serious');
    const moderateViolations = violations.filter(v => v.impact === 'moderate');
    
    if (criticalViolations.length > 0) {
      recommendations.push(`🚨 CRITICAL: Fix ${criticalViolations.length} critical accessibility issues immediately`);
      criticalViolations.forEach(v => {
        recommendations.push(`   • ${v.help} (${v.id})`);
      });
    }
    
    if (seriousViolations.length > 0) {
      recommendations.push(`⚠️ HIGH PRIORITY: Address ${seriousViolations.length} serious accessibility issues`);
    }
    
    if (moderateViolations.length > 0) {
      recommendations.push(`📋 MEDIUM PRIORITY: Resolve ${moderateViolations.length} moderate accessibility issues`);
    }
    
    // Add specific recommendations based on common violation patterns
    const violationIds = violations.map(v => v.id);
    
    if (violationIds.includes('color-contrast')) {
      recommendations.push('🎨 Improve color contrast ratios to meet WCAG AAA standards (7:1 for normal text)');
    }
    
    if (violationIds.includes('keyboard')) {
      recommendations.push('⌨️ Ensure all interactive elements are keyboard accessible');
    }
    
    if (violationIds.includes('aria-label') || violationIds.includes('label')) {
      recommendations.push('🏷️ Add proper labels and ARIA attributes for screen readers');
    }
    
    if (violationIds.includes('heading-order')) {
      recommendations.push('📋 Fix heading hierarchy to follow proper semantic structure');
    }
    
    return recommendations;
  }

  private generateFixSuggestions(violation: Result, node: NodeResult): FixSuggestion[] {
    const fixes: FixSuggestion[] = [];
    
    // Generate specific fix suggestions based on violation type
    switch (violation.id) {
      case 'color-contrast':
        fixes.push({
          type: 'immediate',
          priority: 'critical',
          description: 'Increase color contrast ratio',
          implementation: 'Update CSS color values to meet 7:1 contrast ratio for AAA compliance',
          effort: 'low',
          resources: ['WebAIM Contrast Checker', 'Color Oracle']
        });
        break;
        
      case 'aria-label':
      case 'label':
        fixes.push({
          type: 'immediate',
          priority: 'high',
          description: 'Add accessible label',
          implementation: 'Add aria-label attribute or associate with label element',
          effort: 'low',
          resources: ['ARIA Authoring Practices Guide']
        });
        break;
        
      case 'keyboard':
        fixes.push({
          type: 'architectural',
          priority: 'high',
          description: 'Implement keyboard navigation',
          implementation: 'Add tabindex, keydown event handlers, and focus management',
          effort: 'medium',
          resources: ['Keyboard Accessibility Guidelines']
        });
        break;
        
      case 'heading-order':
        fixes.push({
          type: 'design',
          priority: 'medium',
          description: 'Fix heading hierarchy',
          implementation: 'Reorganize heading levels to follow logical structure (h1->h2->h3)',
          effort: 'medium',
          resources: ['Semantic HTML Guidelines']
        });
        break;
        
      default:
        fixes.push({
          type: 'immediate',
          priority: 'medium',
          description: violation.help,
          implementation: `See: ${violation.helpUrl}`,
          effort: 'medium'
        });
    }
    
    return fixes;
  }

  private aggregateResults(results: AccessibilityTestResult[], testName: string): AccessibilityTestResult {
    if (results.length === 0) {
      return this.createFailedResult('No test results to aggregate');
    }
    
    if (results.length === 1) {
      return results[0];
    }
    
    // Aggregate multiple results into a single comprehensive result
    const allViolations = results.flatMap(r => r.violations);
    const allPasses = results.flatMap(r => r.passes);
    const allInapplicable = results.flatMap(r => r.inapplicable);
    const allIncomplete = results.flatMap(r => r.incomplete);
    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];
    
    const summary = this.calculateSummary(allViolations, allPasses, allInapplicable, allIncomplete);
    const wcagLevel = this.determineWCAGLevel(summary);
    const score = this.calculateComplianceScore(summary);
    
    return {
      passed: allViolations.length === 0 && allIncomplete.length === 0,
      score,
      wcagLevel,
      violations: allViolations,
      passes: allPasses,
      inapplicable: allInapplicable,
      incomplete: allIncomplete,
      summary,
      recommendations: allRecommendations
    };
  }

  private createFailedResult(errorMessage: string): AccessibilityTestResult {
    return {
      passed: false,
      score: 0,
      wcagLevel: 'FAIL',
      violations: [],
      passes: [],
      inapplicable: [],
      incomplete: [],
      summary: {
        totalRules: 0,
        violationCount: 0,
        passCount: 0,
        incompleteCount: 0,
        inapplicableCount: 0,
        complianceScore: 0,
        criticalIssues: 0,
        moderateIssues: 0,
        minorIssues: 0
      },
      recommendations: [errorMessage]
    };
  }

  // Utility methods
  private extractWCAGLevel(tags: string[]): string {
    const wcagTag = tags.find(tag => tag.startsWith('wcag'));
    return wcagTag || 'unknown';
  }

  private extractRuleType(tags: string[]): 'wcag21a' | 'wcag21aa' | 'wcag21aaa' | 'best-practice' {
    if (tags.includes('wcag21aaa')) return 'wcag21aaa';
    if (tags.includes('wcag21aa')) return 'wcag21aa';
    if (tags.includes('wcag21a')) return 'wcag21a';
    return 'best-practice';
  }

  private findElementByTarget(target: string[]): Element | null {
    try {
      const selector = target[0];
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }

  private generateXPath(element: Element | null): string {
    if (!element) return '';
    
    const parts: string[] = [];
    let current: Element | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const part = index > 1 ? `${tagName}[${index}]` : tagName;
      parts.unshift(part);
      
      current = current.parentElement;
    }
    
    return parts.length ? '/' + parts.join('/') : '';
  }

  private getElementAncestry(element: Element | null): string[] {
    const ancestry: string[] = [];
    let current = element;
    
    while (current) {
      let identifier = current.tagName.toLowerCase();
      
      if (current.id) {
        identifier += `#${current.id}`;
      } else if (current.className) {
        const classes = current.className.toString().split(' ').filter(c => c);
        if (classes.length > 0) {
          identifier += `.${classes[0]}`;
        }
      }
      
      ancestry.unshift(identifier);
      current = current.parentElement;
    }
    
    return ancestry;
  }

  private createFallbackAxe(): any {
    // Fallback implementation when axe-core is not available
    return {
      run: async (element: Element) => {
        console.warn('Using fallback accessibility testing - install axe-core for full functionality');
        
        // Basic accessibility checks
        const violations: any[] = [];
        const passes: any[] = [];
        
        // Check for missing alt text
        const images = element.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt && !img.getAttribute('aria-label')) {
            violations.push({
              id: 'image-alt',
              impact: 'critical',
              tags: ['wcag2a', 'wcag21a'],
              description: 'Images must have alternate text',
              help: 'Add alt attribute to img elements',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
              nodes: [{
                html: img.outerHTML,
                target: [`img:nth-child(${index + 1})`],
                failureSummary: 'Missing alt attribute'
              }]
            });
          } else {
            passes.push({
              id: 'image-alt',
              description: 'Images have alternate text',
              help: 'Alt attribute present',
              tags: ['wcag2a', 'wcag21a'],
              nodes: [{
                html: img.outerHTML,
                target: [`img:nth-child(${index + 1})`]
              }]
            });
          }
        });
        
        return {
          violations,
          passes,
          inapplicable: [],
          incomplete: []
        };
      },
      configure: () => {}
    };
  }
}

export default AxeAccessibilityTester;
