// =================================================================
// === محرك كشف الوجوه والأجسام المتقدم بالذكاء الاصطناعي ===
// =================================================================

import { Point2D } from "./BeautyProfileSystem";
import { FaceLandmarks, BodyLandmarks } from "./GeometricWarpEngine";

// ====================================
// === واجهات الكشف المتقدمة ===
// ====================================

export interface DetectionConfig {
  // إعدادات كشف الوجه
  face: {
    enabled: boolean;
    minConfidence: number; // 0.0 - 1.0
    maxFaces: number;
    trackingEnabled: boolean;
    landmarkDetail: "basic" | "detailed" | "full";
  };

  // إعدادات كشف الجسم
  body: {
    enabled: boolean;
    minConfidence: number;
    maxBodies: number;
    trackingEnabled: boolean;
    poseDetail: "basic" | "detailed" | "full";
  };

  // إعدادات الأداء
  performance: {
    useGPU: boolean;
    batchSize: number;
    maxResolution: number;
    enableCaching: boolean;
  };
}

export interface DetectionResult {
  faces: FaceDetectionResult[];
  bodies: BodyDetectionResult[];
  processingTime: number;
  confidence: number;
  metadata: {
    resolution: { width: number; height: number };
    modelVersion: string;
    detectionMethod: string;
  };
}

export interface FaceDetectionResult {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: FaceLandmarks;
  attributes: {
    age?: number;
    gender?: "male" | "female" | "unknown";
    emotion?: string;
    glasses?: boolean;
    beard?: boolean;
    mustache?: boolean;
    smile?: number; // 0.0 - 1.0
    eyesOpen?: number; // 0.0 - 1.0
  };
  confidence: number;
  quality: {
    brightness: number;
    sharpness: number;
    angle: number;
    symmetry: number;
  };
}

export interface BodyDetectionResult {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: BodyLandmarks;
  attributes: {
    height?: number;
    posture?: "standing" | "sitting" | "lying" | "unknown";
    clothing?: string[];
    accessories?: string[];
  };
  confidence: number;
  visibility: { [key: string]: number }; // رؤية كل نقطة (0.0 - 1.0)
}

// ====================================
// === محرك الكشف المتقدم ===
// ====================================

export class AdvancedDetectionEngine {
  private config: DetectionConfig;
  private modelCache: Map<string, any> = new Map();
  private trackingData: Map<string, any> = new Map();

  // إحصائيات الأداء
  private stats = {
    totalDetections: 0,
    averageProcessingTime: 0,
    cacheHits: 0,
    modelLoads: 0,
  };

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = {
      face: {
        enabled: true,
        minConfidence: 0.7,
        maxFaces: 5,
        trackingEnabled: true,
        landmarkDetail: "detailed",
        ...config.face,
      },
      body: {
        enabled: true,
        minConfidence: 0.6,
        maxBodies: 3,
        trackingEnabled: false,
        poseDetail: "detailed",
        ...config.body,
      },
      performance: {
        useGPU: true,
        batchSize: 1,
        maxResolution: 1024,
        enableCaching: true,
        ...config.performance,
      },
    };

    this.initializeModels();
  }

  // تهيئة النماذج
  private async initializeModels(): Promise<void> {
    try {
      // في التطبيق الحقيقي سنحمل نماذج TensorFlow.js أو MediaPipe
      console.log("تهيئة نماذج كشف الوجوه والأجسام...");

      if (this.config.face.enabled) {
        await this.loadFaceDetectionModel();
      }

      if (this.config.body.enabled) {
        await this.loadBodyDetectionModel();
      }

      console.log("تم تحميل جميع النماذج بنجاح");
    } catch (error) {
      console.error("فشل في تهيئة النماذج:", error);
    }
  }

  // تحميل نموذج كشف الوجه
  private async loadFaceDetectionModel(): Promise<void> {
    // محاكاة تحميل نموذج متقدم
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.modelCache.set("face_detection", {
      type: "mediapipe_face_mesh",
      version: "1.0.0",
      landmarks: 468, // عدد النقاط في MediaPipe Face Mesh
      loaded: true,
    });

    this.stats.modelLoads++;
  }

  // تحميل نموذج كشف الجسم
  private async loadBodyDetectionModel(): Promise<void> {
    // محاكاة تحميل نموذج متقدم
    await new Promise((resolve) => setTimeout(resolve, 1200));

    this.modelCache.set("body_detection", {
      type: "mediapipe_pose",
      version: "1.0.0",
      landmarks: 33, // عدد النقاط في MediaPipe Pose
      loaded: true,
    });

    this.stats.modelLoads++;
  }

  // الكشف الشامل
  async detectAll(
    imageSource: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  ): Promise<DetectionResult> {
    const startTime = performance.now();

    try {
      // تحضير الصورة
      const preparedImage = await this.prepareImage(imageSource);

      // تشغيل الكشف بشكل متوازي
      const [faceResults, bodyResults] = await Promise.all([
        this.config.face.enabled
          ? this.detectFaces(preparedImage)
          : Promise.resolve([]),
        this.config.body.enabled
          ? this.detectBodies(preparedImage)
          : Promise.resolve([]),
      ]);

      const processingTime = performance.now() - startTime;

      // تحديث الإحصائيات
      this.updateStats(processingTime);

      // حساب الثقة الإجمالية
      const allConfidences = [
        ...faceResults.map((f) => f.confidence),
        ...bodyResults.map((b) => b.confidence),
      ];
      const overallConfidence =
        allConfidences.length > 0
          ? allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length
          : 0;

      return {
        faces: faceResults,
        bodies: bodyResults,
        processingTime,
        confidence: overallConfidence,
        metadata: {
          resolution: {
            width: preparedImage.width,
            height: preparedImage.height,
          },
          modelVersion: "1.0.0",
          detectionMethod: "hybrid_ai",
        },
      };
    } catch (error) {
      console.error("فشل في عملية الكشف:", error);
      throw error;
    }
  }

  // كشف الوجوه المتقدم
  private async detectFaces(
    image: HTMLCanvasElement,
  ): Promise<FaceDetectionResult[]> {
    if (!this.modelCache.has("face_detection")) {
      throw new Error("نموذج كشف الوجوه غير محمل");
    }

    // محاكاة كشف متقدم للوجوه
    const faces: FaceDetectionResult[] = [];

    // في التطبيق الحقيقي سنستخدم MediaPipe أو TensorFlow.js
    const mockFace = await this.generateMockFaceDetection(image);
    if (mockFace) {
      faces.push(mockFace);
    }

    // تطبيق التتبع إذا كان مفعلاً
    if (this.config.face.trackingEnabled) {
      await this.updateFaceTracking(faces);
    }

    return faces.filter(
      (face) => face.confidence >= this.config.face.minConfidence,
    );
  }

  // كشف الأجسام المتقدم
  private async detectBodies(
    image: HTMLCanvasElement,
  ): Promise<BodyDetectionResult[]> {
    if (!this.modelCache.has("body_detection")) {
      throw new Error("نموذج كشف الأجسام غير محمل");
    }

    // محاكاة كشف متقدم للأجسام
    const bodies: BodyDetectionResult[] = [];

    const mockBody = await this.generateMockBodyDetection(image);
    if (mockBody) {
      bodies.push(mockBody);
    }

    return bodies.filter(
      (body) => body.confidence >= this.config.body.minConfidence,
    );
  }

  // تحضير الصورة للمعالجة
  private async prepareImage(
    source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // تحديد الأبعاد المناسبة
    let width: number, height: number;

    if (source instanceof HTMLImageElement) {
      width = source.naturalWidth;
      height = source.naturalHeight;
    } else if (source instanceof HTMLCanvasElement) {
      width = source.width;
      height = source.height;
    } else {
      // HTMLVideoElement
      width = source.videoWidth;
      height = source.videoHeight;
    }

    // تطبيق قيود الدقة للأداء
    const maxRes = this.config.performance.maxResolution;
    if (width > maxRes || height > maxRes) {
      const scale = Math.min(maxRes / width, maxRes / height);
      width *= scale;
      height *= scale;
    }

    canvas.width = width;
    canvas.height = height;

    // رسم الصورة مع تحسينات الأداء
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, width, height);

    return canvas;
  }

  // توليد كشف وجه وهمي (للتطوير)
  private async generateMockFaceDetection(
    image: HTMLCanvasElement,
  ): Promise<FaceDetectionResult | null> {
    // محاكاة كشف وجه واقعي
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    const faceWidth = Math.min(image.width, image.height) * 0.6;
    const faceHeight = faceWidth * 1.3;

    // تحقق بسيط من وجود محتوى في المر��ز
    const ctx = image.getContext("2d")!;
    const imageData = ctx.getImageData(centerX - 50, centerY - 50, 100, 100);

    // تحليل بسيط للون للتأكد من وجود محتوى
    let totalBrightness = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (imageData.data.length / 4);

    // إذا كانت المنطقة فارغة أو مظلمة جداً، لا يوجد وجه
    if (avgBrightness < 20) {
      return null;
    }

    return {
      id: "face_" + Date.now(),
      boundingBox: {
        x: centerX - faceWidth / 2,
        y: centerY - faceHeight / 2,
        width: faceWidth,
        height: faceHeight,
      },
      landmarks: await this.generateDetailedFaceLandmarks(
        image,
        centerX,
        centerY,
        faceWidth,
        faceHeight,
      ),
      attributes: {
        age: Math.round(Math.random() * 40 + 20),
        gender: Math.random() > 0.5 ? "female" : "male",
        emotion: this.getRandomEmotion(),
        glasses: Math.random() > 0.7,
        beard: Math.random() > 0.6,
        mustache: Math.random() > 0.8,
        smile: Math.random() * 0.8 + 0.1,
        eyesOpen: Math.random() * 0.3 + 0.7,
      },
      confidence: Math.random() * 0.3 + 0.7,
      quality: {
        brightness: avgBrightness / 255,
        sharpness: Math.random() * 0.4 + 0.6,
        angle: (Math.random() - 0.5) * 20,
        symmetry: Math.random() * 0.3 + 0.7,
      },
    };
  }

  // توليد كشف جسم وهمي
  private async generateMockBodyDetection(
    image: HTMLCanvasElement,
  ): Promise<BodyDetectionResult | null> {
    const centerX = image.width / 2;
    const shoulderY = image.height * 0.3;

    return {
      id: "body_" + Date.now(),
      boundingBox: {
        x: centerX - 100,
        y: shoulderY - 50,
        width: 200,
        height: image.height * 0.7,
      },
      landmarks: await this.generateDetailedBodyLandmarks(image, centerX),
      attributes: {
        height: Math.round(Math.random() * 30 + 160), // 160-190cm
        posture: this.getRandomPosture(),
        clothing: this.getRandomClothing(),
        accessories: [],
      },
      confidence: Math.random() * 0.3 + 0.6,
      visibility: this.generateVisibilityMap(),
    };
  }

  // توليد معالم وجه مفصلة
  private async generateDetailedFaceLandmarks(
    image: HTMLCanvasElement,
    centerX: number,
    centerY: number,
    faceWidth: number,
    faceHeight: number,
  ): Promise<FaceLandmarks> {
    // استخدام خوارزميات هندسية لتوليد نقاط واقعية
    const landmarks: FaceLandmarks = {
      faceContour: this.generateFaceContour(
        centerX,
        centerY,
        faceWidth,
        faceHeight,
      ),

      leftEye: {
        center: { x: centerX - faceWidth * 0.2, y: centerY - faceHeight * 0.1 },
        corners: [
          { x: centerX - faceWidth * 0.25, y: centerY - faceHeight * 0.1 },
          { x: centerX - faceWidth * 0.15, y: centerY - faceHeight * 0.1 },
        ],
        outline: this.generateEyeOutline(
          centerX - faceWidth * 0.2,
          centerY - faceHeight * 0.1,
        ),
      },

      rightEye: {
        center: { x: centerX + faceWidth * 0.2, y: centerY - faceHeight * 0.1 },
        corners: [
          { x: centerX + faceWidth * 0.15, y: centerY - faceHeight * 0.1 },
          { x: centerX + faceWidth * 0.25, y: centerY - faceHeight * 0.1 },
        ],
        outline: this.generateEyeOutline(
          centerX + faceWidth * 0.2,
          centerY - faceHeight * 0.1,
        ),
      },

      nose: {
        tip: { x: centerX, y: centerY + faceHeight * 0.05 },
        bridge: this.generateNoseBridge(centerX, centerY, faceHeight),
        nostrils: [
          { x: centerX - 8, y: centerY + faceHeight * 0.05 },
          { x: centerX + 8, y: centerY + faceHeight * 0.05 },
        ],
      },

      mouth: {
        center: { x: centerX, y: centerY + faceHeight * 0.25 },
        corners: [
          { x: centerX - faceWidth * 0.12, y: centerY + faceHeight * 0.25 },
          { x: centerX + faceWidth * 0.12, y: centerY + faceHeight * 0.25 },
        ],
        upperLip: this.generateLipCurve(
          centerX,
          centerY + faceHeight * 0.23,
          faceWidth * 0.12,
          true,
        ),
        lowerLip: this.generateLipCurve(
          centerX,
          centerY + faceHeight * 0.27,
          faceWidth * 0.12,
          false,
        ),
      },

      leftEyebrow: this.generateEyebrow(
        centerX - faceWidth * 0.2,
        centerY - faceHeight * 0.18,
        faceWidth * 0.15,
      ),
      rightEyebrow: this.generateEyebrow(
        centerX + faceWidth * 0.2,
        centerY - faceHeight * 0.18,
        faceWidth * 0.15,
      ),

      jawline: this.generateJawline(centerX, centerY, faceWidth, faceHeight),
      chin: { x: centerX, y: centerY + faceHeight * 0.45 },

      forehead: this.generateForehead(
        centerX,
        centerY - faceHeight * 0.3,
        faceWidth * 0.4,
      ),
    };

    return landmarks;
  }

  // توليد معالم جسم مفصلة
  private async generateDetailedBodyLandmarks(
    image: HTMLCanvasElement,
    centerX: number,
  ): Promise<BodyLandmarks> {
    const shoulderY = image.height * 0.3;
    const waistY = image.height * 0.55;
    const hipY = image.height * 0.65;

    return {
      leftShoulder: { x: centerX - 80, y: shoulderY },
      rightShoulder: { x: centerX + 80, y: shoulderY },
      leftElbow: { x: centerX - 100, y: shoulderY + 60 },
      rightElbow: { x: centerX + 100, y: shoulderY + 60 },
      leftWrist: { x: centerX - 110, y: shoulderY + 120 },
      rightWrist: { x: centerX + 110, y: shoulderY + 120 },

      chest: this.generateChestPoints(centerX, shoulderY + 30, 70),
      waist: this.generateWaistPoints(centerX, waistY, 50),
      hips: this.generateHipPoints(centerX, hipY, 80),

      leftHip: { x: centerX - 40, y: hipY },
      rightHip: { x: centerX + 40, y: hipY },
      leftKnee: { x: centerX - 35, y: hipY + 100 },
      rightKnee: { x: centerX + 35, y: hipY + 100 },
      leftAnkle: { x: centerX - 30, y: image.height - 50 },
      rightAnkle: { x: centerX + 30, y: image.height - 50 },

      neckBase: { x: centerX, y: shoulderY - 20 },
      spinePoints: [
        { x: centerX, y: shoulderY },
        { x: centerX, y: waistY },
        { x: centerX, y: hipY },
      ],
    };
  }

  // دوال مساعدة لتوليد النقاط

  private generateFaceContour(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ): Point2D[] {
    const points: Point2D[] = [];
    const radiusX = width / 2;
    const radiusY = height / 2;

    // توليد محيط بيضاوي للوجه مع تفاصيل واقعية
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * 2 * Math.PI;
      // إضافة تنويع طفيف للحصول على شكل أكثر طبيعية
      const variation = Math.sin(angle * 3) * 0.1 + 1;
      const x = centerX + radiusX * Math.cos(angle) * variation;
      const y = centerY + radiusY * Math.sin(angle) * variation;
      points.push({ x, y });
    }

    return points;
  }

  private generateEyeOutline(centerX: number, centerY: number): Point2D[] {
    const points: Point2D[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 2 * Math.PI;
      const x = centerX + 15 * Math.cos(angle);
      const y = centerY + 8 * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }

  private generateNoseBridge(
    centerX: number,
    centerY: number,
    faceHeight: number,
  ): Point2D[] {
    return [
      { x: centerX, y: centerY - faceHeight * 0.1 },
      { x: centerX - 2, y: centerY - faceHeight * 0.05 },
      { x: centerX, y: centerY },
      { x: centerX + 1, y: centerY + faceHeight * 0.02 },
      { x: centerX, y: centerY + faceHeight * 0.05 },
    ];
  }

  private generateLipCurve(
    centerX: number,
    centerY: number,
    width: number,
    isUpper: boolean,
  ): Point2D[] {
    const points: Point2D[] = [];
    const numPoints = 8;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = centerX + (t - 0.5) * width * 2;

      // منحنى بيزيه للشفاه
      let y: number;
      if (isUpper) {
        y = centerY - Math.sin(t * Math.PI) * 5;
      } else {
        y = centerY + Math.sin(t * Math.PI) * 8;
      }

      points.push({ x, y });
    }

    return points;
  }

  private generateEyebrow(
    centerX: number,
    centerY: number,
    width: number,
  ): Point2D[] {
    const points: Point2D[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const x = centerX + (t - 0.5) * width * 2;
      const y = centerY - Math.sin(t * Math.PI) * 4;
      points.push({ x, y });
    }
    return points;
  }

  private generateJawline(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ): Point2D[] {
    const points: Point2D[] = [];
    // نصف دائرة سفلية للفك
    for (let i = 0; i <= 12; i++) {
      const angle = Math.PI * (i / 12);
      const x = centerX + (width / 2) * Math.cos(angle);
      const y = centerY + (height / 2) * Math.sin(angle) * 0.8;
      points.push({ x, y });
    }
    return points;
  }

  private generateForehead(
    centerX: number,
    centerY: number,
    width: number,
  ): Point2D[] {
    return [
      { x: centerX - width, y: centerY },
      { x: centerX - width / 2, y: centerY - 10 },
      { x: centerX, y: centerY - 15 },
      { x: centerX + width / 2, y: centerY - 10 },
      { x: centerX + width, y: centerY },
    ];
  }

  private generateChestPoints(
    centerX: number,
    centerY: number,
    width: number,
  ): Point2D[] {
    const points: Point2D[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const x = centerX + width * Math.cos(angle);
      const y = centerY + width * 0.6 * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  }

  private generateWaistPoints(
    centerX: number,
    centerY: number,
    width: number,
  ): Point2D[] {
    return [
      { x: centerX - width, y: centerY },
      { x: centerX + width, y: centerY },
    ];
  }

  private generateHipPoints(
    centerX: number,
    centerY: number,
    width: number,
  ): Point2D[] {
    return [
      { x: centerX - width, y: centerY },
      { x: centerX + width, y: centerY },
    ];
  }

  // دوال مساعدة للخصائص العشوائية
  private getRandomEmotion(): string {
    const emotions = [
      "happy",
      "sad",
      "neutral",
      "surprised",
      "angry",
      "fear",
      "disgust",
    ];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  private getRandomPosture(): "standing" | "sitting" | "lying" | "unknown" {
    const postures = ["standing", "sitting", "lying", "unknown"];
    return postures[Math.floor(Math.random() * postures.length)] as any;
  }

  private getRandomClothing(): string[] {
    const items = [
      "shirt",
      "pants",
      "dress",
      "jacket",
      "skirt",
      "jeans",
      "blouse",
    ];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];

    for (let i = 0; i < numItems; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }

    return selected;
  }

  private generateVisibilityMap(): { [key: string]: number } {
    const bodyParts = [
      "nose",
      "leftEye",
      "rightEye",
      "leftEar",
      "rightEar",
      "leftShoulder",
      "rightShoulder",
      "leftElbow",
      "rightElbow",
      "leftWrist",
      "rightWrist",
      "leftHip",
      "rightHip",
      "leftKnee",
      "rightKnee",
      "leftAnkle",
      "rightAnkle",
    ];

    const visibility: { [key: string]: number } = {};

    bodyParts.forEach((part) => {
      visibility[part] = Math.random() * 0.3 + 0.7; // 0.7 - 1.0
    });

    return visibility;
  }

  // تحديث التتبع
  private async updateFaceTracking(
    faces: FaceDetectionResult[],
  ): Promise<void> {
    // محاكاة تتبع الوجوه عبر الإطارات
    faces.forEach((face) => {
      if (this.trackingData.has(face.id)) {
        const prevData = this.trackingData.get(face.id);
        // تحديث بيانات التتبع
        this.trackingData.set(face.id, {
          ...prevData,
          lastSeen: Date.now(),
          trajectory: [...(prevData.trajectory || []), face.boundingBox],
        });
      } else {
        this.trackingData.set(face.id, {
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          trajectory: [face.boundingBox],
        });
      }
    });
  }

  // تحديث الإحصائيات
  private updateStats(processingTime: number): void {
    this.stats.totalDetections++;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.totalDetections - 1) +
        processingTime) /
      this.stats.totalDetections;
  }

  // إحصائيات الأداء
  getPerformanceStats() {
    return {
      ...this.stats,
      modelsLoaded: this.modelCache.size,
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate:
        this.stats.cacheHits / Math.max(this.stats.totalDetections, 1),
    };
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // تنظيف الموارد
  dispose(): void {
    this.modelCache.clear();
    this.trackingData.clear();
  }

  // تحديث الإعدادات
  updateConfig(newConfig: Partial<DetectionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      face: { ...this.config.face, ...newConfig.face },
      body: { ...this.config.body, ...newConfig.body },
      performance: { ...this.config.performance, ...newConfig.performance },
    };
  }
}

// إنشاء نسخة واحدة من محرك الكشف
export const advancedDetectionEngine = new AdvancedDetectionEngine({
  face: {
    enabled: true,
    minConfidence: 0.7,
    maxFaces: 3,
    trackingEnabled: true,
    landmarkDetail: "detailed",
  },
  body: {
    enabled: true,
    minConfidence: 0.6,
    maxBodies: 2,
    trackingEnabled: false,
    poseDetail: "detailed",
  },
  performance: {
    useGPU: true,
    batchSize: 1,
    maxResolution: 1024,
    enableCaching: true,
  },
});
