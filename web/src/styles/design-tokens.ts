/**
 * DESIGN TOKENS - CONTOSO VOICE AGENT
 * 
 * Design tokens for atomic design system implementation
 * with multi-modal, accessibility, and performance considerations.
 */

// ===========================
// CORE FOUNDATION TOKENS
// ===========================

export const CoreTokens = {
  // Color Palette - Enhanced semantic system
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary brand
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    
    // Neutral Scale
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
      1000: '#000000'
    },
    
    // Semantic Colors
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    
    // Multi-Modal Status Colors
    multimodal: {
      voice: {
        idle: '#a1a1aa',
        listening: '#10b981',
        processing: '#f59e0b',
        speaking: '#3b82f6',
        error: '#ef4444'
      },
      camera: {
        idle: '#a1a1aa',
        requesting: '#f59e0b',
        active: '#10b981',
        capturing: '#3b82f6',
        processing: '#f59e0b',
        error: '#ef4444',
        denied: '#dc2626'
      },
      text: {
        idle: '#71717a',
        typing: '#3b82f6',
        sending: '#f59e0b',
        sent: '#10b981',
        error: '#ef4444'
      },
      coordination: {
        syncing: '#ec4899',
        synchronized: '#10b981',
        conflict: '#f59e0b',
        error: '#ef4444'
      }
    }
  },

  // Typography Scale
  typography: {
    // Font Families
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },
    
    // Font Sizes - Fluid scale
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    
    // Font Weights
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    
    // Line Heights
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },

  // Spacing Scale - 8px base unit
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px (touch target)
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
    40: '10rem',      // 160px
    48: '12rem',      // 192px
    64: '16rem',      // 256px
    80: '20rem',      // 320px
    96: '24rem'       // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    none: 'none'
  }
};

// ===========================
// MULTI-MODAL SPECIFIC TOKENS
// ===========================

export const MultiModalTokens = {
  // Camera-Specific Tokens
  camera: {
    touchTarget: {
      minimum: '44px',
      recommended: '48px',
      large: '56px'
    },
    
    controls: {
      capture: { size: '64px', iconSize: '32px' },
      settings: { size: '48px', iconSize: '24px' },
      permission: { size: '56px', iconSize: '28px' }
    },
    
    animations: {
      focus: '300ms ease-out',
      capture: '150ms ease-out',
      permission: '400ms ease-out',
      transition: '200ms ease-out'
    },
    
    performance: {
      targetFps: 30,
      maxWidth: 1920,
      maxHeight: 1080,
      jpegQuality: 0.8,
      processingTimeout: 3000
    }
  },

  // Voice Processing Tokens
  voice: {
    audio: {
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
      bufferSize: 4096
    },
    
    vad: {
      threshold: 0.3,
      debounceMs: 300,
      silenceThresholdMs: 1000
    },
    
    animations: {
      listening: '500ms ease-in-out',
      speaking: '300ms ease-out',
      processing: '200ms ease-in-out'
    }
  },

  // Accessibility Tokens
  accessibility: {
    focus: {
      width: '2px',
      color: '#0ea5e9',
      offset: '2px',
      style: 'solid'
    },
    
    contrast: {
      aa: 4.5,
      aaa: 7.0,
      aaLarge: 3.0,
      aaaLarge: 4.5
    },
    
    motion: {
      none: '0ms',
      reduced: '150ms',
      normal: '300ms'
    }
  }
};

// ===========================
// RESPONSIVE BREAKPOINTS
// ===========================

export const ResponsiveTokens = {
  breakpoints: {
    xs: '320px',      // Small mobile
    sm: '480px',      // Mobile
    md: '640px',      // Large mobile/small tablet
    lg: '768px',      // Tablet
    xl: '1024px',     // Small desktop
    '2xl': '1280px',  // Desktop
    '3xl': '1440px',  // Large desktop
    '4xl': '1920px'   // Ultra-wide
  },

  containers: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px'
  },

  grid: {
    columns: 12,
    gutter: {
      xs: '16px',
      sm: '20px',
      md: '24px',
      lg: '32px',
      xl: '40px'
    }
  }
};

// ===========================
// COMPONENT TOKENS
// ===========================

export const ComponentTokens = {
  button: {
    padding: {
      xs: '8px 12px',
      sm: '10px 16px',
      md: '12px 20px',
      lg: '16px 24px',
      xl: '20px 32px'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px'
    }
  },

  input: {
    padding: {
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 20px'
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px'
    },
    fontSize: {
      sm: '14px',
      md: '16px',
      lg: '18px'
    }
  }
};

// ===========================
// EXPORT DEFAULT TOKENS
// ===========================

export const DesignTokens = {
  ...CoreTokens,
  multimodal: MultiModalTokens,
  responsive: ResponsiveTokens,
  components: ComponentTokens
};

export default DesignTokens;
