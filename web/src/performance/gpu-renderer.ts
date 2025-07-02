/**
 * GPU-Accelerated Rendering Pipeline
 * 
 * Implements WebGL-based image processing for 30fps performance
 * Provides hardware-accelerated operations for camera feed processing
 */

export interface GPUProcessingOptions {
  width: number;
  height: number;
  format: 'RGBA' | 'RGB' | 'GRAYSCALE';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  enableAntialiasing?: boolean;
  preserveDrawingBuffer?: boolean;
}

export interface GPUProcessingResult {
  processedData: ImageData;
  processingTime: number;
  memoryUsed: number;
  fps: number;
}

export interface GPUShaderProgram {
  vertex: string;
  fragment: string;
  uniforms: Record<string, any>;
}

// Standard vertex shader for image processing
const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shaders for different processing operations
const FRAGMENT_SHADERS = {
  // Basic pass-through for performance testing
  passthrough: `
    precision mediump float;
    uniform sampler2D u_image;
    varying vec2 v_texCoord;
    
    void main() {
      gl_FragColor = texture2D(u_image, v_texCoord);
    }
  `,
  
  // Real-time color enhancement
  enhance: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_brightness;
    uniform float u_contrast;
    uniform float u_saturation;
    varying vec2 v_texCoord;
    
    void main() {
      vec4 color = texture2D(u_image, v_texCoord);
      
      // Brightness adjustment
      color.rgb += u_brightness;
      
      // Contrast adjustment
      color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;
      
      // Saturation adjustment
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, u_saturation);
      
      gl_FragColor = color;
    }
  `,
  
  // Edge detection for accessibility
  edges: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    varying vec2 v_texCoord;
    
    void main() {
      vec2 onePixel = vec2(1.0) / u_resolution;
      
      vec4 colorL = texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0));
      vec4 colorR = texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0));
      vec4 colorU = texture2D(u_image, v_texCoord + vec2(0.0, -onePixel.y));
      vec4 colorD = texture2D(u_image, v_texCoord + vec2(0.0, onePixel.y));
      
      vec4 edgeX = abs(colorL - colorR);
      vec4 edgeY = abs(colorU - colorD);
      vec4 edge = sqrt(edgeX * edgeX + edgeY * edgeY);
      
      gl_FragColor = vec4(edge.rgb, 1.0);
    }
  `,
  
  // Accessibility high contrast mode
  highContrast: `
    precision mediump float;
    uniform sampler2D u_image;
    uniform float u_threshold;
    varying vec2 v_texCoord;
    
    void main() {
      vec4 color = texture2D(u_image, v_texCoord);
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      if (luminance > u_threshold) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, color.a);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, color.a);
      }
    }
  `
};

export class GPURenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private programs: Map<string, WebGLProgram> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();
  private framebuffers: Map<string, WebGLFramebuffer> = new Map();
  private vertexBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  
  // Performance monitoring
  private frameCount = 0;
  private lastFrameTime = 0;
  private fps = 0;
  private memoryTracker = new Map<string, number>();
  
  // Processing queue for 30fps target
  private processingQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private targetFPS = 30;
  private frameInterval = 1000 / 30; // ~33.33ms per frame
  
  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas || this.createCanvas();
    this.initialize();
  }
  
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    return canvas;
  }
  
  private initialize(): boolean {
    if (!this.canvas) return false;
    
    // Initialize WebGL context with performance optimizations
    this.gl = this.canvas.getContext('webgl', {
      antialias: false, // Disable for performance
      depth: false,     // Not needed for 2D image processing
      stencil: false,   // Not needed
      alpha: false,     // Opaque canvas for performance
      preserveDrawingBuffer: false, // Don't preserve for performance
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
    
    if (!this.gl) {
      console.error('WebGL not supported');
      return false;
    }
    
    // Enable required extensions for performance
    const ext = this.gl.getExtension('OES_texture_float');
    if (!ext) {
      console.warn('Float textures not supported, using reduced precision');
    }
    
    this.setupBuffers();
    this.compileShaders();
    
    return true;
  }
  
  private setupBuffers(): void {
    if (!this.gl) return;
    
    // Create vertex buffer for quad covering entire canvas
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    // Create texture coordinate buffer
    const texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0
    ]);
    
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }
  
  private compileShaders(): void {
    if (!this.gl) return;
    
    // Compile all shader programs
    Object.entries(FRAGMENT_SHADERS).forEach(([name, fragmentSource]) => {
      const program = this.createShaderProgram(VERTEX_SHADER, fragmentSource);
      if (program) {
        this.programs.set(name, program);
      }
    });
  }
  
  private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null;
    
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = this.gl.createProgram();
    if (!program) return null;
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }
  
  /**
   * Process image data with GPU acceleration
   */
  public async processImage(
    imageData: ImageData | HTMLImageElement | HTMLVideoElement,
    operation: 'passthrough' | 'enhance' | 'edges' | 'highContrast' = 'passthrough',
    options: Partial<GPUProcessingOptions> = {}
  ): Promise<GPUProcessingResult> {
    const startTime = performance.now();
    
    if (!this.gl || !this.canvas) {
      throw new Error('GPU renderer not initialized');
    }
    
    // Set canvas size based on options or image size
    const width = options.width || (imageData as ImageData).width || 1920;
    const height = options.height || (imageData as ImageData).height || 1080;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
    
    // Create texture from image data
    const texture = this.createTexture(imageData);
    if (!texture) {
      throw new Error('Failed to create texture');
    }
    
    // Get shader program
    const program = this.programs.get(operation);
    if (!program) {
      throw new Error(`Shader program '${operation}' not found`);
    }
    
    // Use shader program
    this.gl.useProgram(program);
    
    // Set up vertex attributes
    this.setupVertexAttributes(program);
    
    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    // Set uniforms based on operation
    this.setUniforms(program, operation, { width, height });
    
    // Draw quad
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    
    // Read processed data
    const processedData = new ImageData(width, height);
    this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, processedData.data);
    
    // Clean up texture
    this.gl.deleteTexture(texture);
    
    // Calculate performance metrics
    const processingTime = performance.now() - startTime;
    this.updateFPS();
    
    return {
      processedData,
      processingTime,
      memoryUsed: this.estimateMemoryUsage(width, height),
      fps: this.fps
    };
  }
  
  private createTexture(imageData: ImageData | HTMLImageElement | HTMLVideoElement): WebGLTexture | null {
    if (!this.gl) return null;
    
    const texture = this.gl.createTexture();
    if (!texture) return null;
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    // Set texture parameters for performance
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    // Upload image data
    if (imageData instanceof ImageData) {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData);
    } else {
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData);
    }
    
    return texture;
  }
  
  private setupVertexAttributes(program: WebGLProgram): void {
    if (!this.gl) return;
    
    // Position attribute
    const positionLocation = this.gl.getAttribLocation(program, 'a_position');
    if (positionLocation >= 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    // Texture coordinate attribute
    const texCoordLocation = this.gl.getAttribLocation(program, 'a_texCoord');
    if (texCoordLocation >= 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
      this.gl.enableVertexAttribArray(texCoordLocation);
      this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
  }
  
  private setUniforms(program: WebGLProgram, operation: string, options: any): void {
    if (!this.gl) return;
    
    // Set image uniform
    const imageLocation = this.gl.getUniformLocation(program, 'u_image');
    if (imageLocation) {
      this.gl.uniform1i(imageLocation, 0);
    }
    
    // Set operation-specific uniforms
    switch (operation) {
      case 'enhance':
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_brightness'), 0.1);
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_contrast'), 1.2);
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_saturation'), 1.1);
        break;
        
      case 'edges':
        this.gl.uniform2f(this.gl.getUniformLocation(program, 'u_resolution'), options.width, options.height);
        break;
        
      case 'highContrast':
        this.gl.uniform1f(this.gl.getUniformLocation(program, 'u_threshold'), 0.5);
        break;
    }
  }
  
  private updateFPS(): void {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFrameTime >= 1000) { // Update every second
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }
  
  private estimateMemoryUsage(width: number, height: number): number {
    // Estimate GPU memory usage for texture (RGBA = 4 bytes per pixel)
    return width * height * 4;
  }
  
  /**
   * Process video stream at 30fps target
   */
  public async processVideoStream(
    video: HTMLVideoElement,
    operation: string = 'passthrough',
    onFrame?: (result: GPUProcessingResult) => void
  ): Promise<void> {
    const processFrame = async () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        try {
          const result = await this.processImage(video, operation as any);
          onFrame?.(result);
          
          // Maintain 30fps by scheduling next frame appropriately
          const nextFrameDelay = Math.max(0, this.frameInterval - result.processingTime);
          setTimeout(processFrame, nextFrameDelay);
        } catch (error) {
          console.error('Frame processing error:', error);
          requestAnimationFrame(processFrame);
        }
      } else {
        requestAnimationFrame(processFrame);
      }
    };
    
    processFrame();
  }
  
  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): {
    fps: number;
    frameCount: number;
    memoryUsage: number;
    isProcessing: boolean;
  } {
    return {
      fps: this.fps,
      frameCount: this.frameCount,
      memoryUsage: Array.from(this.memoryTracker.values()).reduce((a, b) => a + b, 0),
      isProcessing: this.isProcessing
    };
  }
  
  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (!this.gl) return;
    
    // Clean up programs
    this.programs.forEach(program => {
      this.gl?.deleteProgram(program);
    });
    this.programs.clear();
    
    // Clean up textures
    this.textures.forEach(texture => {
      this.gl?.deleteTexture(texture);
    });
    this.textures.clear();
    
    // Clean up framebuffers
    this.framebuffers.forEach(framebuffer => {
      this.gl?.deleteFramebuffer(framebuffer);
    });
    this.framebuffers.clear();
    
    // Clean up buffers
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.texCoordBuffer) {
      this.gl.deleteBuffer(this.texCoordBuffer);
    }
    
    this.gl = null;
    this.canvas = null;
  }
}

/**
 * GPU Renderer Singleton for performance
 */
export const gpuRenderer = new GPURenderer();

/**
 * Utility function for quick image processing
 */
export async function processImageGPU(
  imageData: ImageData | HTMLImageElement | HTMLVideoElement,
  operation: 'passthrough' | 'enhance' | 'edges' | 'highContrast' = 'passthrough',
  options?: Partial<GPUProcessingOptions>
): Promise<GPUProcessingResult> {
  return gpuRenderer.processImage(imageData, operation, options);
}

/**
 * Utility function for video stream processing
 */
export async function processVideoStreamGPU(
  video: HTMLVideoElement,
  operation: string = 'passthrough',
  onFrame?: (result: GPUProcessingResult) => void
): Promise<void> {
  return gpuRenderer.processVideoStream(video, operation, onFrame);
}
