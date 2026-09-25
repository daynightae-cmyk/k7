// ================================================================
// === فنان الرسم والتأثيرات المتقدم - سحر المكياج الرقمي ===
// ================================================================

import {
  BeautyProfile,
  ColorRGBA,
  MakeupSettings,
  FaceRetouchSettings,
  Point2D,
} from "./BeautyProfileSystem";
import { FaceLandmarks } from "./GeometricWarpEngine";

// ===============================================
// === 1. أدوات الرسم والفرش المتخصصة ===
// ===============================================

export interface Brush {
  size: number;
  opacity: number;
  hardness: number; // 0.0 - 1.0 (soft to hard)
  flow: number; // 0.0 - 1.0 (paint flow rate)
  spacing: number; // 0.1 - 3.0 (brush stroke spacing)
  angle: number; // 0 - 360 degrees
  roundness: number; // 0.0 - 1.0 (circular to elliptical)
}

export interface BlendMode {
  type:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "soft-light"
    | "hard-light"
    | "color-dodge"
    | "color-burn"
    | "darken"
    | "lighten";
  opacity: number;
}

export interface TexturePattern {
  type: "noise" | "stipple" | "canvas" | "paper" | "skin" | "shimmer";
  intensity: number;
  scale: number;
}

// ===============================================
// === 2. كاشف ألوان البشرة الذكي ===
// ===============================================

export class SkinToneAnalyzer {
  // تحليل درجة لون البشرة من المعالم
  static analyzeSkinTone(
    canvas: HTMLCanvasElement,
    faceLandmarks: FaceLandmarks,
  ): ColorRGBA {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { r: 245, g: 222, b: 179, a: 1 };

    // أخذ عينات من مناطق متعددة في الوجه
    const samplePoints = [
      // الجبهة
      {
        x: faceLandmarks.forehead[Math.floor(faceLandmarks.forehead.length / 2)]
          .x,
        y: faceLandmarks.forehead[Math.floor(faceLandmarks.forehead.length / 2)]
          .y,
      },
      // الخدود
      {
        x: (faceLandmarks.leftEye.center.x + faceLandmarks.mouth.center.x) / 2,
        y: (faceLandmarks.leftEye.center.y + faceLandmarks.mouth.center.y) / 2,
      },
      {
        x: (faceLandmarks.rightEye.center.x + faceLandmarks.mouth.center.x) / 2,
        y: (faceLandmarks.rightEye.center.y + faceLandmarks.mouth.center.y) / 2,
      },
      // الذقن
      { x: faceLandmarks.chin.x, y: faceLandmarks.chin.y - 20 },
    ];

    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let validSamples = 0;

    samplePoints.forEach((point) => {
      try {
        const imageData = ctx.getImageData(point.x - 2, point.y - 2, 5, 5);
        const data = imageData.data;

        // حساب متوسط اللون في المنطقة المحيطة
        let regionR = 0,
          regionG = 0,
          regionB = 0,
          pixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          regionR += data[i];
          regionG += data[i + 1];
          regionB += data[i + 2];
          pixels++;
        }

        if (pixels > 0) {
          totalR += regionR / pixels;
          totalG += regionG / pixels;
          totalB += regionB / pixels;
          validSamples++;
        }
      } catch (error) {
        // تجاهل النقاط خارج حدود الصورة
      }
    });

    if (validSamples === 0) {
      return { r: 245, g: 222, b: 179, a: 1 }; // لون افتراضي
    }

    return {
      r: Math.round(totalR / validSamples),
      g: Math.round(totalG / validSamples),
      b: Math.round(totalB / validSamples),
      a: 1,
    };
  }

  // تحديد نوع البشرة (فاتحة، متوسطة، داكنة)
  static getSkinType(
    skinTone: ColorRGBA,
  ): "light" | "medium" | "dark" | "very-dark" {
    const brightness =
      skinTone.r * 0.299 + skinTone.g * 0.587 + skinTone.b * 0.114;

    if (brightness > 200) return "light";
    if (brightness > 150) return "medium";
    if (brightness > 100) return "dark";
    return "very-dark";
  }

  // توليد ألوان مكياج متناسقة مع لون البشرة
  static generateHarmoniousColors(skinTone: ColorRGBA): {
    foundation: ColorRGBA;
    blush: ColorRGBA;
    lipstick: ColorRGBA;
    eyeshadow: ColorRGBA[];
  } {
    const skinType = this.getSkinType(skinTone);

    switch (skinType) {
      case "light":
        return {
          foundation: {
            r: skinTone.r + 5,
            g: skinTone.g + 5,
            b: skinTone.b + 10,
            a: 0.6,
          },
          blush: { r: 255, g: 182, b: 193, a: 0.4 },
          lipstick: { r: 205, g: 92, b: 92, a: 0.7 },
          eyeshadow: [
            { r: 222, g: 184, b: 135, a: 0.5 },
            { r: 205, g: 133, b: 63, a: 0.3 },
          ],
        };

      case "medium":
        return {
          foundation: { r: skinTone.r, g: skinTone.g, b: skinTone.b, a: 0.6 },
          blush: { r: 220, g: 120, b: 120, a: 0.5 },
          lipstick: { r: 165, g: 42, b: 42, a: 0.8 },
          eyeshadow: [
            { r: 160, g: 82, b: 45, a: 0.6 },
            { r: 101, g: 67, b: 33, a: 0.4 },
          ],
        };

      case "dark":
        return {
          foundation: {
            r: skinTone.r - 5,
            g: skinTone.g - 5,
            b: skinTone.b - 5,
            a: 0.7,
          },
          blush: { r: 180, g: 80, b: 80, a: 0.6 },
          lipstick: { r: 139, g: 0, b: 0, a: 0.9 },
          eyeshadow: [
            { r: 139, g: 69, b: 19, a: 0.7 },
            { r: 101, g: 67, b: 33, a: 0.5 },
          ],
        };

      case "very-dark":
        return {
          foundation: {
            r: skinTone.r - 10,
            g: skinTone.g - 5,
            b: skinTone.b,
            a: 0.8,
          },
          blush: { r: 160, g: 60, b: 60, a: 0.7 },
          lipstick: { r: 128, g: 0, b: 32, a: 1.0 },
          eyeshadow: [
            { r: 101, g: 67, b: 33, a: 0.8 },
            { r: 64, g: 64, b: 64, a: 0.6 },
          ],
        };
    }
  }
}

// ===============================================
// === 3. مكتبة الفلاتر والتأثيرات ===
// ===============================================

export class FilterLibrary {
  // فلتر تنعيم البشرة المتقدم
  static applySkinSmoothing(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    intensity: number,
  ): ImageData {
    const smoothedData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    );

    // تطبيق تنعيم أكثر دقة في مناطق البشرة
    const skinAreas = this.getSkinAreas(
      faceLandmarks,
      imageData.width,
      imageData.height,
    );

    for (const area of skinAreas) {
      this.applySelectiveBlur(smoothedData, area, intensity * 3);
    }

    return smoothedData;
  }

  // تبييض الأسنان
  static applyTeethWhitening(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    intensity: number,
  ): void {
    const teethArea = this.getTeethArea(faceLandmarks);
    if (!teethArea.length) return;

    const data = imageData.data;

    for (const point of teethArea) {
      const index = (point.y * imageData.width + point.x) * 4;
      if (index >= 0 && index < data.length - 3) {
        // زيادة السطوع مع الحفاظ على الدرجة اللونية
        const factor = 1 + intensity * 0.3;
        data[index] = Math.min(255, data[index] * factor); // R
        data[index + 1] = Math.min(255, data[index + 1] * factor); // G
        data[index + 2] = Math.min(255, data[index + 2] * factor); // B
      }
    }
  }

  // إشراق العيون
  static applyEyeBrightening(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    intensity: number,
  ): void {
    const eyeAreas = [
      this.getEyeArea(faceLandmarks.leftEye),
      this.getEyeArea(faceLandmarks.rightEye),
    ];

    const data = imageData.data;

    for (const eyeArea of eyeAreas) {
      for (const point of eyeArea) {
        const index = (point.y * imageData.width + point.x) * 4;
        if (index >= 0 && index < data.length - 3) {
          // زيادة التباين والسطوع
          const factor = 1 + intensity * 0.2;
          data[index] = Math.min(255, data[index] * factor);
          data[index + 1] = Math.min(255, data[index + 1] * factor);
          data[index + 2] = Math.min(255, data[index + 2] * factor);
        }
      }
    }
  }

  // إزالة الهالات السوداء
  static reduceEyeBags(
    ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    intensity: number,
  ): void {
    const eyeBagAreas = [
      this.getEyeBagArea(faceLandmarks.leftEye),
      this.getEyeBagArea(faceLandmarks.rightEye),
    ];

    for (const area of eyeBagAreas) {
      this.applyColorCorrection(imageData, area, intensity);
    }
  }

  // تطبيق تشويش انتقائي
  private static applySelectiveBlur(
    imageData: ImageData,
    area: Point2D[],
    intensity: number,
  ): void {
    const data = imageData.data;
    const width = imageData.width;

    for (const point of area) {
      const centerIndex = (point.y * width + point.x) * 4;
      if (centerIndex < 0 || centerIndex >= data.length - 3) continue;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      const radius = Math.ceil(intensity);

      // أخذ عينات من المنطقة المحيطة
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sampleX = point.x + dx;
          const sampleY = point.y + dy;

          if (
            sampleX >= 0 &&
            sampleX < width &&
            sampleY >= 0 &&
            sampleY < imageData.height
          ) {
            const sampleIndex = (sampleY * width + sampleX) * 4;

            r += data[sampleIndex];
            g += data[sampleIndex + 1];
            b += data[sampleIndex + 2];
            count++;
          }
        }
      }

      if (count > 0) {
        const blendFactor = intensity * 0.7;
        data[centerIndex] =
          data[centerIndex] * (1 - blendFactor) + (r / count) * blendFactor;
        data[centerIndex + 1] =
          data[centerIndex + 1] * (1 - blendFactor) + (g / count) * blendFactor;
        data[centerIndex + 2] =
          data[centerIndex + 2] * (1 - blendFactor) + (b / count) * blendFactor;
      }
    }
  }

  // تصحيح اللون للهالات
  private static applyColorCorrection(
    imageData: ImageData,
    area: Point2D[],
    intensity: number,
  ): void {
    const data = imageData.data;
    const width = imageData.width;

    for (const point of area) {
      const index = (point.y * width + point.x) * 4;
      if (index < 0 || index >= data.length - 3) continue;

      // تقليل اللون الأزرق والبنفسجي (الهالات)
      const blueFactor = 1 - intensity * 0.3;
      data[index + 2] = data[index + 2] * blueFactor; // تقليل الأزرق

      // زيادة اللون الأحمر والأصفر قليلاً
      const warmFactor = 1 + intensity * 0.1;
      data[index] = Math.min(255, data[index] * warmFactor);
      data[index + 1] = Math.min(255, data[index + 1] * warmFactor);
    }
  }

  // تحديد مناطق ا��بشرة
  private static getSkinAreas(
    faceLandmarks: FaceLandmarks,
    width: number,
    height: number,
  ): Point2D[][] {
    const areas: Point2D[][] = [];

    // منطقة الجبهة
    areas.push(this.generateAreaFromPoints(faceLandmarks.forehead, 10));

    // منطقة الخدود
    const leftCheek = this.generateCheekArea(faceLandmarks, "left");
    const rightCheek = this.generateCheekArea(faceLandmarks, "right");
    areas.push(leftCheek, rightCheek);

    // منطقة الذقن
    areas.push(this.generateAreaFromPoints([faceLandmarks.chin], 15));

    return areas;
  }

  // توليد منطقة من نقاط
  private static generateAreaFromPoints(
    points: Point2D[],
    radius: number,
  ): Point2D[] {
    const area: Point2D[] = [];

    for (const point of points) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy <= radius * radius) {
            area.push({ x: point.x + dx, y: point.y + dy });
          }
        }
      }
    }

    return area;
  }

  // توليد منطقة الخد
  private static generateCheekArea(
    faceLandmarks: FaceLandmarks,
    side: "left" | "right",
  ): Point2D[] {
    const eye =
      side === "left" ? faceLandmarks.leftEye : faceLandmarks.rightEye;
    const mouth = faceLandmarks.mouth;

    const centerX = (eye.center.x + mouth.center.x) / 2;
    const centerY = (eye.center.y + mouth.center.y) / 2;

    return this.generateAreaFromPoints([{ x: centerX, y: centerY }], 25);
  }

  // تحديد منطقة الأسنان
  private static getTeethArea(faceLandmarks: FaceLandmarks): Point2D[] {
    const teeth: Point2D[] = [];
    const mouth = faceLandmarks.mouth;

    // منطقة بين الشفاه
    const teethY =
      (mouth.upperLip[Math.floor(mouth.upperLip.length / 2)].y +
        mouth.lowerLip[Math.floor(mouth.lowerLip.length / 2)].y) /
      2;

    const leftX = mouth.corners[0].x;
    const rightX = mouth.corners[1].x;

    for (let x = leftX + 5; x < rightX - 5; x += 2) {
      for (let y = teethY - 3; y <= teethY + 3; y++) {
        teeth.push({ x, y });
      }
    }

    return teeth;
  }

  // تحديد منطقة العين
  private static getEyeArea(eye: any): Point2D[] {
    const area: Point2D[] = [];
    const center = eye.center;
    const radius = 20;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          area.push({ x: center.x + dx, y: center.y + dy });
        }
      }
    }

    return area;
  }

  // تحديد منطقة الهالات
  private static getEyeBagArea(eye: any): Point2D[] {
    const area: Point2D[] = [];
    const center = eye.center;

    // منطقة تحت العين
    for (let dy = 5; dy <= 15; dy++) {
      for (let dx = -15; dx <= 15; dx++) {
        area.push({ x: center.x + dx, y: center.y + dy });
      }
    }

    return area;
  }
}

// ===============================================
// === 4. فنان المكياج الرقمي الأساسي ===
// ===============================================

export class OverlayArtist {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private skinTone: ColorRGBA | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  // الدالة الرئيسية لتطبيق جميع التأثيرات
  async applyAllEffects(
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    beautyProfile: BeautyProfile,
  ): Promise<void> {
    // وضع الصورة الأساسية
    this.ctx.putImageData(imageData, 0, 0);

    // تحليل لون البشرة
    this.skinTone = SkinToneAnalyzer.analyzeSkinTone(
      this.canvas,
      faceLandmarks,
    );

    // تطبيق التحسينات الأساسية أولاً
    await this.applyFaceRetouching(
      imageData,
      faceLandmarks,
      beautyProfile.faceRetouch,
    );

    // ثم تطبيق المكياج
    await this.applyMakeup(faceLandmarks, beautyProfile.makeup);
  }

  // تطبيق تحسينات الوجه
  private async applyFaceRetouching(
    imageData: ImageData,
    faceLandmarks: FaceLandmarks,
    retouchSettings: FaceRetouchSettings,
  ): Promise<void> {
    // تنعيم البشرة
    if (retouchSettings.skinSmoothing > 0) {
      const smoothedData = FilterLibrary.applySkinSmoothing(
        this.ctx,
        imageData,
        faceLandmarks,
        retouchSettings.skinSmoothing,
      );
      this.ctx.putImageData(smoothedData, 0, 0);
    }

    // تبييض الأسنان
    if (retouchSettings.teethWhitening > 0) {
      const currentData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      FilterLibrary.applyTeethWhitening(
        this.ctx,
        currentData,
        faceLandmarks,
        retouchSettings.teethWhitening,
      );
      this.ctx.putImageData(currentData, 0, 0);
    }

    // إشراق العيون
    if (retouchSettings.eyeBrightening > 0) {
      const currentData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      FilterLibrary.applyEyeBrightening(
        this.ctx,
        currentData,
        faceLandmarks,
        retouchSettings.eyeBrightening,
      );
      this.ctx.putImageData(currentData, 0, 0);
    }

    // تقليل الهالات
    if (retouchSettings.eyebagReduction > 0) {
      const currentData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      FilterLibrary.reduceEyeBags(
        this.ctx,
        currentData,
        faceLandmarks,
        retouchSettings.eyebagReduction,
      );
      this.ctx.putImageData(currentData, 0, 0);
    }
  }

  // تطبيق المكياج الكامل
  private async applyMakeup(
    faceLandmarks: FaceLandmarks,
    makeupSettings: MakeupSettings,
  ): Promise<void> {
    // ترتيب تطبيق المكياج مهم!

    // 1. كريم الأساس أولاً
    if (makeupSettings.foundation.enabled) {
      await this.applyFoundation(faceLandmarks, makeupSettings.foundation);
    }

    // 2. الكونتور والهايلايتر
    if (makeupSettings.contour.enabled) {
      await this.applyContour(faceLandmarks, makeupSettings.contour);
    }

    if (makeupSettings.highlighter.enabled) {
      await this.applyHighlighter(faceLandmarks, makeupSettings.highlighter);
    }

    // 3. أحمر الخدود
    if (makeupSettings.blush.enabled) {
      await this.applyBlush(faceLandmarks, makeupSettings.blush);
    }

    // 4. مكياج العيون
    if (makeupSettings.eyeshadow.enabled) {
      await this.applyEyeshadow(faceLandmarks, makeupSettings.eyeshadow);
    }

    if (makeupSettings.eyeliner.enabled) {
      await this.applyEyeliner(faceLandmarks, makeupSettings.eyeliner);
    }

    if (makeupSettings.mascara.enabled) {
      await this.applyMascara(faceLandmarks, makeupSettings.mascara);
    }

    // 5. الحواجب
    if (makeupSettings.eyebrows.enabled) {
      await this.applyEyebrows(faceLandmarks, makeupSettings.eyebrows);
    }

    // 6. أحمر الشفاه أخيراً
    if (makeupSettings.lipstick.enabled) {
      await this.applyLipstick(faceLandmarks, makeupSettings.lipstick);
    }
  }

  // تطبيق كريم الأساس
  private async applyFoundation(
    faceLandmarks: FaceLandmarks,
    foundation: any,
  ): Promise<void> {
    this.ctx.save();

    // إنشاء قناع الوجه
    const faceMask = this.createFaceMask(faceLandmarks);
    this.ctx.clip(faceMask);

    // تطبيق اللون
    this.ctx.globalAlpha = foundation.coverage;
    this.ctx.globalCompositeOperation = "multiply";

    const color = this.adjustColorForSkinTone(foundation.color);
    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    this.ctx.fill(faceMask);

    this.ctx.restore();
  }

  // تطبيق الكونتور
  private async applyContour(
    faceLandmarks: FaceLandmarks,
    contour: any,
  ): Promise<void> {
    this.ctx.save();

    for (const area of contour.areas) {
      const contourPath = this.createContourPath(faceLandmarks, area);

      this.ctx.globalAlpha = contour.intensity;
      this.ctx.globalCompositeOperation = "multiply";

      const gradient = this.createContourGradient(contourPath, contour.color);
      this.ctx.fillStyle = gradient;
      this.ctx.fill(contourPath);

      // تطبيق تشويش للمزج
      this.blurArea(contourPath, contour.blending * 5);
    }

    this.ctx.restore();
  }

  // تطبيق الهايلايتر
  private async applyHighlighter(
    faceLandmarks: FaceLandmarks,
    highlighter: any,
  ): Promise<void> {
    this.ctx.save();

    for (const area of highlighter.areas) {
      const highlightPath = this.createHighlightPath(faceLandmarks, area);

      this.ctx.globalAlpha = highlighter.intensity;
      this.ctx.globalCompositeOperation = "screen";

      const gradient = this.createShimmerGradient(
        highlightPath,
        highlighter.color,
        highlighter.shimmer,
      );
      this.ctx.fillStyle = gradient;
      this.ctx.fill(highlightPath);
    }

    this.ctx.restore();
  }

  // تطبيق أحمر الخدود
  private async applyBlush(
    faceLandmarks: FaceLandmarks,
    blush: any,
  ): Promise<void> {
    this.ctx.save();

    const leftCheek = this.getBlushArea(faceLandmarks, "left");
    const rightCheek = this.getBlushArea(faceLandmarks, "right");

    [leftCheek, rightCheek].forEach((cheekPath) => {
      this.ctx.globalAlpha = blush.intensity;
      this.ctx.globalCompositeOperation = "multiply";

      const gradient = this.createBlushGradient(cheekPath, blush.color);
      this.ctx.fillStyle = gradient;
      this.ctx.fill(cheekPath);
    });

    this.ctx.restore();
  }

  // تطبيق ظلال العيون
  private async applyEyeshadow(
    faceLandmarks: FaceLandmarks,
    eyeshadow: any,
  ): Promise<void> {
    this.ctx.save();

    const leftEyePath = this.createEyeshadowPath(faceLandmarks.leftEye);
    const rightEyePath = this.createEyeshadowPath(faceLandmarks.rightEye);

    [leftEyePath, rightEyePath].forEach((eyePath) => {
      this.ctx.globalAlpha = eyeshadow.intensity;
      this.ctx.globalCompositeOperation = eyeshadow.blendMode;

      const gradient = this.createEyeshadowGradient(eyePath, eyeshadow.colors);
      this.ctx.fillStyle = gradient;
      this.ctx.fill(eyePath);

      // إضافة بريق إذا كان مطلوباً
      if (eyeshadow.shimmer > 0) {
        this.addShimmerEffect(eyePath, eyeshadow.shimmer);
      }
    });

    this.ctx.restore();
  }

  // تطبيق كحل العيون
  private async applyEyeliner(
    faceLandmarks: FaceLandmarks,
    eyeliner: any,
  ): Promise<void> {
    this.ctx.save();

    this.ctx.strokeStyle = `rgba(${eyeliner.color.r}, ${eyeliner.color.g}, ${eyeliner.color.b}, ${eyeliner.color.a})`;
    this.ctx.lineWidth = eyeliner.thickness;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // رسم كحل العين اليسرى
    this.drawEyeliner(faceLandmarks.leftEye, eyeliner.style);

    // رسم كحل العين اليمنى
    this.drawEyeliner(faceLandmarks.rightEye, eyeliner.style);

    // تطبيق تشويش إذا كان مطلوباً
    if (eyeliner.smudge > 0) {
      this.applyEyelinerSmudge(faceLandmarks, eyeliner.smudge);
    }

    this.ctx.restore();
  }

  // تطبيق الماسكارا
  private async applyMascara(
    faceLandmarks: FaceLandmarks,
    mascara: any,
  ): Promise<void> {
    this.ctx.save();

    // تكثيف وتطويل الرموش
    const leftLashes = this.generateLashes(faceLandmarks.leftEye, mascara);
    const rightLashes = this.generateLashes(faceLandmarks.rightEye, mascara);

    this.ctx.strokeStyle = `rgba(${mascara.color.r}, ${mascara.color.g}, ${mascara.color.b}, ${mascara.color.a})`;
    this.ctx.lineWidth = 1.5;

    [...leftLashes, ...rightLashes].forEach((lash) => {
      this.drawLash(lash, mascara);
    });

    this.ctx.restore();
  }

  // تطبيق تحديد الحواجب
  private async applyEyebrows(
    faceLandmarks: FaceLandmarks,
    eyebrows: any,
  ): Promise<void> {
    this.ctx.save();

    this.ctx.strokeStyle = `rgba(${eyebrows.color.r}, ${eyebrows.color.g}, ${eyebrows.color.b}, ${eyebrows.color.a})`;
    this.ctx.lineWidth = eyebrows.thickness;

    // رسم الحاجب الأيسر
    this.drawEyebrow(faceLandmarks.leftEyebrow, eyebrows.shape);

    // رسم الحاجب الأيمن
    this.drawEyebrow(faceLandmarks.rightEyebrow, eyebrows.shape);

    this.ctx.restore();
  }

  // تطبيق أحمر الشفاه
  private async applyLipstick(
    faceLandmarks: FaceLandmarks,
    lipstick: any,
  ): Promise<void> {
    this.ctx.save();

    const lipPath = this.createLipPath(faceLandmarks.mouth);

    this.ctx.globalAlpha = lipstick.intensity;
    this.ctx.globalCompositeOperation = "multiply";

    // تطبيق اللون الأساسي
    this.ctx.fillStyle = `rgba(${lipstick.color.r}, ${lipstick.color.g}, ${lipstick.color.b}, ${lipstick.color.a})`;
    this.ctx.fill(lipPath);

    // إضافة اللمعة إذا كانت مطلوب��
    if (lipstick.gloss > 0) {
      this.addLipGloss(lipPath, lipstick.gloss);
    }

    // تطبيق التدرج الناعم للحواف
    if (lipstick.feathering > 0) {
      this.featherLipEdges(lipPath, lipstick.feathering);
    }

    this.ctx.restore();
  }

  // === دوال مساعدة للرسم ===

  // إنشاء قناع الوجه
  private createFaceMask(faceLandmarks: FaceLandmarks): Path2D {
    const path = new Path2D();

    // رسم محيط الوجه
    path.moveTo(faceLandmarks.faceContour[0].x, faceLandmarks.faceContour[0].y);
    for (let i = 1; i < faceLandmarks.faceContour.length; i++) {
      path.lineTo(
        faceLandmarks.faceContour[i].x,
        faceLandmarks.faceContour[i].y,
      );
    }
    path.closePath();

    return path;
  }

  // تعديل اللون حسب لون البشرة
  private adjustColorForSkinTone(color: ColorRGBA): ColorRGBA {
    if (!this.skinTone) return color;

    // مزج اللون مع لون البشرة للحصول على تناغم طبيعي
    return {
      r: Math.round((color.r + this.skinTone.r) / 2),
      g: Math.round((color.g + this.skinTone.g) / 2),
      b: Math.round((color.b + this.skinTone.b) / 2),
      a: color.a,
    };
  }

  // إنشاء تدرج للكونتور
  private createContourGradient(
    path: Path2D,
    color: ColorRGBA,
  ): CanvasGradient {
    const bounds = this.getPathBounds(path);
    const gradient = this.ctx.createRadialGradient(
      bounds.centerX,
      bounds.centerY,
      0,
      bounds.centerX,
      bounds.centerY,
      bounds.radius,
    );

    gradient.addColorStop(
      0,
      `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
    );
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    return gradient;
  }

  // إنشاء تدرج للهايلايتر مع بريق
  private createShimmerGradient(
    path: Path2D,
    color: ColorRGBA,
    shimmer: number,
  ): CanvasGradient {
    const bounds = this.getPathBounds(path);
    const gradient = this.ctx.createRadialGradient(
      bounds.centerX,
      bounds.centerY,
      0,
      bounds.centerX,
      bounds.centerY,
      bounds.radius,
    );

    const shimmerColor = {
      r: Math.min(255, color.r + shimmer * 50),
      g: Math.min(255, color.g + shimmer * 50),
      b: Math.min(255, color.b + shimmer * 50),
      a: color.a,
    };

    gradient.addColorStop(
      0,
      `rgba(${shimmerColor.r}, ${shimmerColor.g}, ${shimmerColor.b}, ${shimmerColor.a})`,
    );
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    return gradient;
  }

  // الحصول على حدود المسار
  private getPathBounds(path: Path2D): {
    centerX: number;
    centerY: number;
    radius: number;
  } {
    // تقريب بسيط - في التطبيق الحقيقي سنحتاج لحساب أكثر دقة
    return {
      centerX: this.canvas.width / 2,
      centerY: this.canvas.height / 2,
      radius: 50,
    };
  }

  // دوال أخرى مبسطة للمساحة
  private createContourPath(
    faceLandmarks: FaceLandmarks,
    area: string,
  ): Path2D {
    return new Path2D();
  }
  private createHighlightPath(
    faceLandmarks: FaceLandmarks,
    area: string,
  ): Path2D {
    return new Path2D();
  }
  private getBlushArea(faceLandmarks: FaceLandmarks, side: string): Path2D {
    return new Path2D();
  }
  private createBlushGradient(path: Path2D, color: ColorRGBA): CanvasGradient {
    return this.createContourGradient(path, color);
  }
  private createEyeshadowPath(eye: any): Path2D {
    return new Path2D();
  }
  private createEyeshadowGradient(
    path: Path2D,
    colors: ColorRGBA[],
  ): CanvasGradient {
    return this.createContourGradient(path, colors[0]);
  }
  private addShimmerEffect(path: Path2D, shimmer: number): void {}
  private drawEyeliner(eye: any, style: string): void {}
  private applyEyelinerSmudge(
    faceLandmarks: FaceLandmarks,
    smudge: number,
  ): void {}
  private generateLashes(eye: any, mascara: any): any[] {
    return [];
  }
  private drawLash(lash: any, mascara: any): void {}
  private drawEyebrow(eyebrow: Point2D[], shape: string): void {}
  private createLipPath(mouth: any): Path2D {
    return new Path2D();
  }
  private addLipGloss(path: Path2D, gloss: number): void {}
  private featherLipEdges(path: Path2D, feathering: number): void {}
  private blurArea(path: Path2D, amount: number): void {}
}

// إنشاء نسخة للاستخدام العام
export const overlayArtist = {
  createArtist: (canvas: HTMLCanvasElement) => new OverlayArtist(canvas),
  SkinToneAnalyzer,
  FilterLibrary,
};
