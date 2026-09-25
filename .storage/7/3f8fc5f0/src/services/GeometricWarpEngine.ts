// =================================================================
// === محرك التشويهات الهندسية المتقدم - قوة GPU الخالصة ===
// =================================================================

import { BeautyProfile, Point2D } from "./BeautyProfileSystem";

// ===================================
// === 1. واجهات التشويه المتقدمة ===
// ===================================

export interface WarpPoint {
  source: Point2D;
  target: Point2D;
  radius: number;
  intensity: number;
}

export interface FaceLandmarks {
  // محيط الوجه
  faceContour: Point2D[];

  // العيون
  leftEye: {
    center: Point2D;
    corners: Point2D[];
    outline: Point2D[];
  };
  rightEye: {
    center: Point2D;
    corners: Point2D[];
    outline: Point2D[];
  };

  // الأنف
  nose: {
    tip: Point2D;
    bridge: Point2D[];
    nostrils: Point2D[];
  };

  // الفم والشفاه
  mouth: {
    center: Point2D;
    corners: Point2D[];
    upperLip: Point2D[];
    lowerLip: Point2D[];
  };

  // الحواجب
  leftEyebrow: Point2D[];
  rightEyebrow: Point2D[];

  // الفك والذقن
  jawline: Point2D[];
  chin: Point2D;

  // الجبهة
  forehead: Point2D[];
}

export interface BodyLandmarks {
  // الكتفين والذراعين
  leftShoulder: Point2D;
  rightShoulder: Point2D;
  leftElbow: Point2D;
  rightElbow: Point2D;
  leftWrist: Point2D;
  rightWrist: Point2D;

  // الجذع والخصر
  chest: Point2D[];
  waist: Point2D[];
  hips: Point2D[];

  // الساقين
  leftHip: Point2D;
  rightHip: Point2D;
  leftKnee: Point2D;
  rightKnee: Point2D;
  leftAnkle: Point2D;
  rightAnkle: Point2D;

  // نقاط إضافية للدقة
  neckBase: Point2D;
  spinePoints: Point2D[];
}

export interface WarpOperation {
  id: string;
  type: "liquify" | "bulge" | "pinch" | "twist" | "push" | "pull";
  center: Point2D;
  radius: number;
  intensity: number;
  falloff: "linear" | "smooth" | "sharp";
  direction?: Point2D; // للعمليات الاتجاهية
}

// =======================================
// === 2. شيدرات WebGL المتخصصة ===
// =======================================

export class WarpShaders {
  // الشيدر الرئيسي للتشويه (Vertex Shader)
  static readonly WARP_VERTEX_SHADER = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    
    uniform vec2 u_resolution;
    uniform float u_flipY;
    
    varying vec2 v_texCoord;
    
    void main() {
      // تحويل الإحداثيات من مساحة الصورة إلى مساحة WebGL
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      
      gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  // الشيدر الأساسي للتشويه (Fragment Shader)
  static readonly WARP_FRAGMENT_SHADER = `
    precision mediump float;
    
    uniform sampler2D u_image;
    uniform vec2 u_textureSize;
    uniform vec2 u_warpCenter;
    uniform float u_warpRadius;
    uniform float u_warpIntensity;
    uniform int u_warpType;
    
    varying vec2 v_texCoord;
    
    // دالة التشويه السائل (Liquify)
    vec2 liquifyWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance) * intensity;
        
        // تطبيق منحنى سلس للتأثير
        warpFactor = smoothstep(0.0, 1.0, warpFactor);
        
        // حساب الإزاحة الجديدة
        vec2 direction = normalize(offset);
        vec2 warpOffset = direction * warpFactor * 0.1;
        
        return coord + warpOffset;
      }
      
      return coord;
    }
    
    // دالة التشويه المنتفخ (Bulge)
    vec2 bulgeWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance * normalizedDistance) * intensity;
        
        vec2 direction = normalize(offset);
        return coord + direction * warpFactor * 0.05;
      }
      
      return coord;
    }
    
    // دالة التشويه المقروص (Pinch)
    vec2 pinchWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance) * intensity;
        
        vec2 direction = normalize(offset);
        return coord - direction * warpFactor * 0.03;
      }
      
      return coord;
    }
    
    // دالة التشويه الملتوي (Twist)
    vec2 twistWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float angle = (1.0 - normalizedDistance) * intensity * 0.5;
        
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        
        mat2 rotationMatrix = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);
        vec2 rotatedOffset = rotationMatrix * offset;
        
        return center + rotatedOffset;
      }
      
      return coord;
    }
    
    void main() {
      vec2 coord = v_texCoord;
      
      // تطبيق نوع التشويه المحدد
      if (u_warpType == 0) {
        coord = liquifyWarp(coord, u_warpCenter, u_warpRadius, u_warpIntensity);
      } else if (u_warpType == 1) {
        coord = bulgeWarp(coord, u_warpCenter, u_warpRadius, u_warpIntensity);
      } else if (u_warpType == 2) {
        coord = pinchWarp(coord, u_warpCenter, u_warpRadius, u_warpIntensity);
      } else if (u_warpType == 3) {
        coord = twistWarp(coord, u_warpCenter, u_warpRadius, u_warpIntensity);
      }
      
      // التأكد من أن الإحداثيات ضمن النطاق المسموح
      coord = clamp(coord, 0.0, 1.0);
      
      gl_FragColor = texture2D(u_image, coord);
    }
  `;

  // شيدر متقدم للتشويهات المتعددة
  static readonly MULTI_WARP_FRAGMENT_SHADER = `
    precision mediump float;
    
    uniform sampler2D u_image;
    uniform vec2 u_textureSize;
    
    // مصفوفة تشويهات متعددة (حد أقصى 8 تشويهات)
    uniform vec2 u_warpCenters[8];
    uniform float u_warpRadii[8];
    uniform float u_warpIntensities[8];
    uniform int u_warpTypes[8];
    uniform int u_warpCount;
    
    varying vec2 v_texCoord;
    
    // نفس دوال التشويه من الشيدر السابق
    vec2 liquifyWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance) * intensity;
        warpFactor = smoothstep(0.0, 1.0, warpFactor);
        
        vec2 direction = normalize(offset);
        vec2 warpOffset = direction * warpFactor * 0.1;
        
        return coord + warpOffset;
      }
      
      return coord;
    }
    
    vec2 bulgeWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance * normalizedDistance) * intensity;
        
        vec2 direction = normalize(offset);
        return coord + direction * warpFactor * 0.05;
      }
      
      return coord;
    }
    
    vec2 pinchWarp(vec2 coord, vec2 center, float radius, float intensity) {
      vec2 offset = coord - center;
      float distance = length(offset);
      
      if (distance < radius && distance > 0.0) {
        float normalizedDistance = distance / radius;
        float warpFactor = (1.0 - normalizedDistance) * intensity;
        
        vec2 direction = normalize(offset);
        return coord - direction * warpFactor * 0.03;
      }
      
      return coord;
    }
    
    void main() {
      vec2 coord = v_texCoord;
      
      // تطبيق جميع التشويهات بالتتابع
      for (int i = 0; i < 8; i++) {
        if (i >= u_warpCount) break;
        
        if (u_warpTypes[i] == 0) {
          coord = liquifyWarp(coord, u_warpCenters[i], u_warpRadii[i], u_warpIntensities[i]);
        } else if (u_warpTypes[i] == 1) {
          coord = bulgeWarp(coord, u_warpCenters[i], u_warpRadii[i], u_warpIntensities[i]);
        } else if (u_warpTypes[i] == 2) {
          coord = pinchWarp(coord, u_warpCenters[i], u_warpRadii[i], u_warpIntensities[i]);
        }
      }
      
      coord = clamp(coord, 0.0, 1.0);
      gl_FragColor = texture2D(u_image, coord);
    }
  `;
}

// ==========================================
// === 3. محرك التشويهات الجيومتري ===
// ==========================================

export class GeometricWarpEngine {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private multiWarpProgram: WebGLProgram | null = null;

  // المخازن والأنسجة
  private vertexBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;

  // المواقع في الشيدر
  private locations: {
    [key: string]: WebGLUniformLocation | number | null;
  } = {};

  constructor() {
    this.canvas = document.createElement("canvas");
    this.initializeWebGL();
  }

  // تهيئة WebGL والشيدرات
  private initializeWebGL(): boolean {
    try {
      this.gl = this.canvas.getContext("webgl", {
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });

      if (!this.gl) {
        console.error("WebGL غير مدعوم في هذا المتصفح");
        return false;
      }

      // إنشاء البرامج
      this.program = this.createShaderProgram(
        WarpShaders.WARP_VERTEX_SHADER,
        WarpShaders.WARP_FRAGMENT_SHADER,
      );

      this.multiWarpProgram = this.createShaderProgram(
        WarpShaders.WARP_VERTEX_SHADER,
        WarpShaders.MULTI_WARP_FRAGMENT_SHADER,
      );

      if (!this.program || !this.multiWarpProgram) {
        console.error("فشل في إنشاء برامج الشيدر");
        return false;
      }

      // إعداد الأشكال الهندسية
      this.setupGeometry();

      // الحصول على مواقع المتغيرات
      this.getShaderLocations();

      return true;
    } catch (error) {
      console.error("فشل في تهيئة WebGL:", error);
      return false;
    }
  }

  // إنشاء برنامج شيدر
  private createShaderProgram(
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram | null {
    if (!this.gl) return null;

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexSource,
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource,
    );

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error(
        "فشل في ربط برنامج الشيدر:",
        this.gl.getProgramInfoLog(program),
      );
      return null;
    }

    return program;
  }

  // تجميع شيدر
  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("فشل في تجميع الشيدر:", this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // إعداد الأشكال الهندسية
  private setupGeometry(): void {
    if (!this.gl) return;

    // مربع كامل للشاشة
    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);

    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    // إنشاء المخازن
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }

  // الحصول على مواقع المتغيرات في الشيدر
  private getShaderLocations(): void {
    if (!this.gl || !this.program) return;

    this.locations = {
      // مواقع المتغيرات
      a_position: this.gl.getAttribLocation(this.program, "a_position"),
      a_texCoord: this.gl.getAttribLocation(this.program, "a_texCoord"),

      // مواقع المتغيرات الموحدة
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
      u_flipY: this.gl.getUniformLocation(this.program, "u_flipY"),
      u_image: this.gl.getUniformLocation(this.program, "u_image"),
      u_textureSize: this.gl.getUniformLocation(this.program, "u_textureSize"),
      u_warpCenter: this.gl.getUniformLocation(this.program, "u_warpCenter"),
      u_warpRadius: this.gl.getUniformLocation(this.program, "u_warpRadius"),
      u_warpIntensity: this.gl.getUniformLocation(
        this.program,
        "u_warpIntensity",
      ),
      u_warpType: this.gl.getUniformLocation(this.program, "u_warpType"),
    };
  }

  // تطبيق جميع التشويهات على صورة
  async applyAllWarps(
    imageSource: HTMLImageElement | HTMLCanvasElement,
    faceLandmarks: FaceLandmarks | null,
    bodyLandmarks: BodyLandmarks | null,
    beautyProfile: BeautyProfile,
  ): Promise<HTMLCanvasElement> {
    if (!this.gl || !this.program) {
      throw new Error("WebGL غير مهيأ بشكل صحيح");
    }

    // تحديد حجم الكانفاس
    this.canvas.width = imageSource.width;
    this.canvas.height = imageSource.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // إنشاء النسيج من الصورة
    this.texture = this.createTextureFromImage(imageSource);
    if (!this.texture) {
      throw new Error("فشل في إنشاء النسيج");
    }

    // تجميع عمليات التشويه
    const warpOperations = this.generateWarpOperations(
      faceLandmarks,
      bodyLandmarks,
      beautyProfile,
    );

    // تطبيق التشويهات
    if (warpOperations.length <= 8) {
      // استخدام الشيدر المتعدد للكفاءة
      await this.applyMultipleWarps(warpOperations);
    } else {
      // تطبيق التشويهات واحدة تلو الأخرى
      for (const operation of warpOperations) {
        await this.applySingleWarp(operation);
      }
    }

    return this.canvas;
  }

  // تطبيق تشويه واحد
  private async applySingleWarp(operation: WarpOperation): Promise<void> {
    if (!this.gl || !this.program) return;

    this.gl.useProgram(this.program);

    // ربط النسيج
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.uniform1i(this.locations.u_image as WebGLUniformLocation, 0);

    // تعيين المعاملات
    this.gl.uniform2f(
      this.locations.u_resolution as WebGLUniformLocation,
      this.canvas.width,
      this.canvas.height,
    );
    this.gl.uniform1f(this.locations.u_flipY as WebGLUniformLocation, -1);
    this.gl.uniform2f(
      this.locations.u_textureSize as WebGLUniformLocation,
      this.canvas.width,
      this.canvas.height,
    );

    // معاملات التشويه
    this.gl.uniform2f(
      this.locations.u_warpCenter as WebGLUniformLocation,
      operation.center.x / this.canvas.width,
      operation.center.y / this.canvas.height,
    );
    this.gl.uniform1f(
      this.locations.u_warpRadius as WebGLUniformLocation,
      operation.radius / Math.max(this.canvas.width, this.canvas.height),
    );
    this.gl.uniform1f(
      this.locations.u_warpIntensity as WebGLUniformLocation,
      operation.intensity,
    );
    this.gl.uniform1i(
      this.locations.u_warpType as WebGLUniformLocation,
      this.getWarpTypeIndex(operation.type),
    );

    // رسم المثلثات
    this.drawQuad();
  }

  // تطبيق تشويهات متعددة في مرة واحدة
  private async applyMultipleWarps(operations: WarpOperation[]): Promise<void> {
    if (!this.gl || !this.multiWarpProgram) return;

    this.gl.useProgram(this.multiWarpProgram);

    // إعداد المصفوفات للتشويهات المتعددة
    const centers: number[] = [];
    const radii: number[] = [];
    const intensities: number[] = [];
    const types: number[] = [];

    for (let i = 0; i < 8; i++) {
      if (i < operations.length) {
        const op = operations[i];
        centers.push(
          op.center.x / this.canvas.width,
          op.center.y / this.canvas.height,
        );
        radii.push(op.radius / Math.max(this.canvas.width, this.canvas.height));
        intensities.push(op.intensity);
        types.push(this.getWarpTypeIndex(op.type));
      } else {
        centers.push(0, 0);
        radii.push(0);
        intensities.push(0);
        types.push(0);
      }
    }

    // تعيين المعاملات
    const centersLocation = this.gl.getUniformLocation(
      this.multiWarpProgram,
      "u_warpCenters",
    );
    const radiiLocation = this.gl.getUniformLocation(
      this.multiWarpProgram,
      "u_warpRadii",
    );
    const intensitiesLocation = this.gl.getUniformLocation(
      this.multiWarpProgram,
      "u_warpIntensities",
    );
    const typesLocation = this.gl.getUniformLocation(
      this.multiWarpProgram,
      "u_warpTypes",
    );
    const countLocation = this.gl.getUniformLocation(
      this.multiWarpProgram,
      "u_warpCount",
    );

    this.gl.uniform2fv(centersLocation, centers);
    this.gl.uniform1fv(radiiLocation, radii);
    this.gl.uniform1fv(intensitiesLocation, intensities);
    this.gl.uniform1iv(typesLocation, types);
    this.gl.uniform1i(countLocation, operations.length);

    this.drawQuad();
  }

  // رسم المربع
  private drawQuad(): void {
    if (!this.gl) return;

    // ربط المخازن والمتغيرات
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.enableVertexAttribArray(this.locations.a_position as number);
    this.gl.vertexAttribPointer(
      this.locations.a_position as number,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.enableVertexAttribArray(this.locations.a_texCoord as number);
    this.gl.vertexAttribPointer(
      this.locations.a_texCoord as number,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    );

    // رسم المثلثات
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  // إنشاء نسيج من صورة
  private createTextureFromImage(
    image: HTMLImageElement | HTMLCanvasElement,
  ): WebGLTexture | null {
    if (!this.gl) return null;

    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // تحميل الصورة
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image,
    );

    // إعدادات النسيج
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR,
    );

    return texture;
  }

  // توليد عمليات التشويه من ملف الجمال
  private generateWarpOperations(
    faceLandmarks: FaceLandmarks | null,
    bodyLandmarks: BodyLandmarks | null,
    beautyProfile: BeautyProfile,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    if (faceLandmarks) {
      // تنحيف الوجه
      if (beautyProfile.faceRetouch.faceSlimming !== 0) {
        operations.push(
          ...this.generateFaceSlimmingWarps(
            faceLandmarks,
            beautyProfile.faceRetouch.faceSlimming,
          ),
        );
      }

      // تنحيف الفك
      if (beautyProfile.faceRetouch.jawSlimming !== 0) {
        operations.push(
          ...this.generateJawSlimmingWarps(
            faceLandmarks,
            beautyProfile.faceRetouch.jawSlimming,
          ),
        );
      }

      // تكبير العيون
      if (beautyProfile.faceRetouch.eyeEnlarging !== 0) {
        operations.push(
          ...this.generateEyeEnlargingWarps(
            faceLandmarks,
            beautyProfile.faceRetouch.eyeEnlarging,
          ),
        );
      }

      // تنحيف الأنف
      if (beautyProfile.faceRetouch.noseSlimming !== 0) {
        operations.push(
          ...this.generateNoseSlimmingWarps(
            faceLandmarks,
            beautyProfile.faceRetouch.noseSlimming,
          ),
        );
      }

      // تحسين الابتسامة
      if (beautyProfile.faceRetouch.smileEnhancement !== 0) {
        operations.push(
          ...this.generateSmileEnhancementWarps(
            faceLandmarks,
            beautyProfile.faceRetouch.smileEnhancement,
          ),
        );
      }
    }

    if (bodyLandmarks) {
      // تنحيف الخصر
      if (beautyProfile.bodyShaping.waistSlimming !== 0) {
        operations.push(
          ...this.generateWaistSlimmingWarps(
            bodyLandmarks,
            beautyProfile.bodyShaping.waistSlimming,
          ),
        );
      }

      // تطويل الساقين
      if (beautyProfile.bodyShaping.legElongation !== 0) {
        operations.push(
          ...this.generateLegElongationWarps(
            bodyLandmarks,
            beautyProfile.bodyShaping.legElongation,
          ),
        );
      }

      // تحسين الوضعية
      if (beautyProfile.bodyShaping.postureCorrection !== 0) {
        operations.push(
          ...this.generatePostureCorrectionWarps(
            bodyLandmarks,
            beautyProfile.bodyShaping.postureCorrection,
          ),
        );
      }
    }

    return operations;
  }

  // توليد تشويهات تنحيف الوجه
  private generateFaceSlimmingWarps(
    landmarks: FaceLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    // تنحيف جانبي الوجه
    const leftSide = landmarks.faceContour.slice(
      0,
      landmarks.faceContour.length / 4,
    );
    const rightSide = landmarks.faceContour.slice(
      (3 * landmarks.faceContour.length) / 4,
    );

    leftSide.forEach((point) => {
      operations.push({
        id: `face-slim-left-${Date.now()}-${Math.random()}`,
        type: "pinch",
        center: point,
        radius: 50,
        intensity: Math.abs(intensity) * 0.5,
        falloff: "smooth",
      });
    });

    rightSide.forEach((point) => {
      operations.push({
        id: `face-slim-right-${Date.now()}-${Math.random()}`,
        type: "pinch",
        center: point,
        radius: 50,
        intensity: Math.abs(intensity) * 0.5,
        falloff: "smooth",
      });
    });

    return operations;
  }

  // توليد تشويهات تنحيف الفك
  private generateJawSlimmingWarps(
    landmarks: FaceLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    landmarks.jawline.forEach((point) => {
      operations.push({
        id: `jaw-slim-${Date.now()}-${Math.random()}`,
        type: "pinch",
        center: point,
        radius: 40,
        intensity: Math.abs(intensity) * 0.6,
        falloff: "smooth",
      });
    });

    return operations;
  }

  // توليد تشويهات تكبير العيون
  private generateEyeEnlargingWarps(
    landmarks: FaceLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    // تكبير العين اليسرى
    operations.push({
      id: `eye-enlarge-left-${Date.now()}`,
      type: "bulge",
      center: landmarks.leftEye.center,
      radius: 35,
      intensity: intensity * 0.7,
      falloff: "smooth",
    });

    // تكبير العين اليمنى
    operations.push({
      id: `eye-enlarge-right-${Date.now()}`,
      type: "bulge",
      center: landmarks.rightEye.center,
      radius: 35,
      intensity: intensity * 0.7,
      falloff: "smooth",
    });

    return operations;
  }

  // توليد تشويهات تنحيف الأنف
  private generateNoseSlimmingWarps(
    landmarks: FaceLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    landmarks.nose.nostrils.forEach((point) => {
      operations.push({
        id: `nose-slim-${Date.now()}-${Math.random()}`,
        type: "pinch",
        center: point,
        radius: 25,
        intensity: Math.abs(intensity) * 0.8,
        falloff: "sharp",
      });
    });

    return operations;
  }

  // توليد تشويهات تحسين الابتسامة
  private generateSmileEnhancementWarps(
    landmarks: FaceLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    landmarks.mouth.corners.forEach((point) => {
      operations.push({
        id: `smile-enhance-${Date.now()}-${Math.random()}`,
        type: "push",
        center: point,
        radius: 20,
        intensity: intensity * 0.4,
        falloff: "smooth",
        direction: { x: 0, y: -1 }, // رفع زوايا الفم
      });
    });

    return operations;
  }

  // توليد تشويهات تنحيف الخصر
  private generateWaistSlimmingWarps(
    landmarks: BodyLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    landmarks.waist.forEach((point) => {
      operations.push({
        id: `waist-slim-${Date.now()}-${Math.random()}`,
        type: "pinch",
        center: point,
        radius: 80,
        intensity: intensity * 0.6,
        falloff: "smooth",
      });
    });

    return operations;
  }

  // توليد تشويهات تطويل الساقين
  private generateLegElongationWarps(
    landmarks: BodyLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    // تطويل الفخذين
    const leftThighMid = {
      x: (landmarks.leftHip.x + landmarks.leftKnee.x) / 2,
      y: (landmarks.leftHip.y + landmarks.leftKnee.y) / 2,
    };

    const rightThighMid = {
      x: (landmarks.rightHip.x + landmarks.rightKnee.x) / 2,
      y: (landmarks.rightHip.y + landmarks.rightKnee.y) / 2,
    };

    operations.push({
      id: `leg-elongate-left-${Date.now()}`,
      type: "push",
      center: leftThighMid,
      radius: 60,
      intensity: intensity * 0.3,
      falloff: "smooth",
      direction: { x: 0, y: 1 },
    });

    operations.push({
      id: `leg-elongate-right-${Date.now()}`,
      type: "push",
      center: rightThighMid,
      radius: 60,
      intensity: intensity * 0.3,
      falloff: "smooth",
      direction: { x: 0, y: 1 },
    });

    return operations;
  }

  // توليد تشويهات تحسين الوضعية
  private generatePostureCorrectionWarps(
    landmarks: BodyLandmarks,
    intensity: number,
  ): WarpOperation[] {
    const operations: WarpOperation[] = [];

    // تقويم العمود الفقري
    landmarks.spinePoints.forEach((point, index) => {
      operations.push({
        id: `posture-correct-${index}-${Date.now()}`,
        type: "push",
        center: point,
        radius: 40,
        intensity: intensity * 0.2,
        falloff: "smooth",
        direction: { x: -0.1, y: 0 }, // تحريك للخلف قليلاً
      });
    });

    return operations;
  }

  // تحويل نوع التشويه إلى فهرس
  private getWarpTypeIndex(type: string): number {
    switch (type) {
      case "liquify":
        return 0;
      case "bulge":
        return 1;
      case "pinch":
        return 2;
      case "twist":
        return 3;
      case "push":
        return 4;
      case "pull":
        return 5;
      default:
        return 0;
    }
  }

  // تنظيف الموارد
  dispose(): void {
    if (this.gl) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
      if (this.multiWarpProgram) {
        this.gl.deleteProgram(this.multiWarpProgram);
      }
      if (this.vertexBuffer) {
        this.gl.deleteBuffer(this.vertexBuffer);
      }
      if (this.texCoordBuffer) {
        this.gl.deleteBuffer(this.texCoordBuffer);
      }
      if (this.texture) {
        this.gl.deleteTexture(this.texture);
      }
    }
  }
}

// إنشاء نسخة واحدة من محرك التشويه
export const geometricWarpEngine = new GeometricWarpEngine();
