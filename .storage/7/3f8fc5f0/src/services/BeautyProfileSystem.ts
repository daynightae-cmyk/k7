// =======================================================================
// === نظام ملفات الجمال المتقدم - الحمض النووي للتأثيرات الجمالية ===
// =======================================================================

// ========================================
// === 1. الواجهات الأساسية للتأثيرات ===
// ========================================

export interface Point2D {
  x: number;
  y: number;
}

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// ==========================================
// === 2. تأثيرات المكياج التفصيلية ===
// ==========================================

export interface LipstickEffect {
  enabled: boolean;
  color: ColorRGBA;
  intensity: number; // 0.0 - 1.0
  gloss: number; // 0.0 - 1.0 (لمعة)
  style: "matte" | "glossy" | "metallic" | "natural";
  feathering: number; // 0.0 - 1.0 (نعومة الحواف)
}

export interface EyeshadowEffect {
  enabled: boolean;
  colors: ColorRGBA[]; // مجموعة ألوان متدرجة
  intensity: number;
  style: "smokey" | "natural" | "dramatic" | "colorful";
  blendMode: "normal" | "multiply" | "overlay" | "soft-light";
  shimmer: number; // 0.0 - 1.0 (بريق)
}

export interface EyelinerEffect {
  enabled: boolean;
  color: ColorRGBA;
  thickness: number; // 1.0 - 10.0
  style: "classic" | "winged" | "dramatic" | "subtle";
  smudge: number; // 0.0 - 1.0 (تشويش للتأثير المدخن)
}

export interface MascaraEffect {
  enabled: boolean;
  color: ColorRGBA;
  intensity: number; // 0.0 - 1.0
  lengthening: number; // 0.0 - 1.0
  volumizing: number; // 0.0 - 1.0
  curl: number; // 0.0 - 1.0
}

export interface BlushEffect {
  enabled: boolean;
  color: ColorRGBA;
  intensity: number;
  style: "natural" | "sculpted" | "subtle" | "vibrant";
  placement: "cheeks" | "temples" | "nose-bridge";
}

export interface FoundationEffect {
  enabled: boolean;
  color: ColorRGBA;
  coverage: number; // 0.0 - 1.0 (خفيف إلى كامل)
  finish: "matte" | "dewy" | "satin" | "natural";
  smoothing: number; // 0.0 - 1.0
}

export interface HighlighterEffect {
  enabled: boolean;
  color: ColorRGBA;
  intensity: number;
  areas: ("cheekbones" | "nose-tip" | "forehead" | "chin" | "inner-corners")[];
  shimmer: number;
}

export interface ContouraEffect {
  enabled: boolean;
  color: ColorRGBA;
  intensity: number;
  areas: ("jawline" | "cheekbones" | "nose-sides" | "forehead-edges")[];
  blending: number; // 0.0 - 1.0
}

// =====================================
// === 3. إعدادات المكياج الشاملة ===
// =====================================

export interface MakeupSettings {
  foundation: FoundationEffect;
  concealer: {
    enabled: boolean;
    coverage: number;
    areas: ("under-eyes" | "blemishes" | "redness")[];
  };
  powder: {
    enabled: boolean;
    intensity: number;
    areas: ("t-zone" | "all-face")[];
  };
  eyebrows: {
    enabled: boolean;
    color: ColorRGBA;
    thickness: number;
    shape: "natural" | "arched" | "straight" | "rounded";
  };
  eyeshadow: EyeshadowEffect;
  eyeliner: EyelinerEffect;
  mascara: MascaraEffect;
  lipstick: LipstickEffect;
  blush: BlushEffect;
  highlighter: HighlighterEffect;
  contour: ContouraEffect;
}

// ============================================
// === 4. تحسينات الوجه والريتوش المتقدم ===
// ============================================

export interface FaceRetouchSettings {
  // === تحسينات البشرة ===
  skinSmoothing: number; // 0.0 - 1.0
  blemishRemoval: number; // 0.0 - 1.0
  wrinkleReduction: number; // 0.0 - 1.0
  poreMinimizing: number; // 0.0 - 1.0
  skinToneEvening: number; // 0.0 - 1.0

  // === تحسينات الأسنان ===
  teethWhitening: number; // 0.0 - 1.0
  teethStraightening: number; // 0.0 - 1.0

  // === تحسينات العيون ===
  eyeBrightening: number; // 0.0 - 1.0
  redEyeRemoval: boolean;
  eyebagReduction: number; // 0.0 - 1.0
  eyeLashEnhancement: number; // 0.0 - 1.0

  // === تشوهات هندسية للوجه (Geometric Warps) ===
  faceSlimming: number; // -1.0 to 1.0
  jawSlimming: number; // -1.0 to 1.0
  jawSharpening: number; // 0.0 - 1.0
  chinAdjustment: number; // -1.0 to 1.0
  cheekboneEnhancement: number; // 0.0 - 1.0

  // === تعديلات الأنف ===
  noseSlimming: number; // -1.0 to 1.0
  noseShortening: number; // -1.0 to 1.0
  noseBridgeAdjustment: number; // -1.0 to 1.0
  nostrilReduction: number; // 0.0 - 1.0

  // === تعديلات العيون ===
  eyeEnlarging: number; // 0.0 - 1.0
  eyeShape: number; // -1.0 to 1.0 (round to almond)
  eyeDistance: number; // -1.0 to 1.0
  eyeAngle: number; // -1.0 to 1.0 (upward or downward)

  // === تعديلات الفم والشفاه ===
  lipEnhancement: number; // 0.0 - 1.0
  lipSymmetry: number; // 0.0 - 1.0
  smileEnhancement: number; // 0.0 - 1.0

  // === تعديلات الجبهة ===
  foreheadSmoothing: number; // 0.0 - 1.0
  foreheadSize: number; // -1.0 to 1.0
}

// =====================================
// === 5. تعديلات شكل الجسم المتقدمة ===
// =====================================

export interface BodyShapingSettings {
  // === منطقة الخصر والبطن ===
  waistSlimming: number; // 0.0 - 1.0
  bellyFlattening: number; // 0.0 - 1.0
  waistToHipRatio: number; // -1.0 to 1.0

  // === الساقين والقدمين ===
  legElongation: number; // 0.0 - 1.0
  legSlimming: number; // 0.0 - 1.0
  thighGapEnhancement: number; // 0.0 - 1.0
  calfEnhancement: number; // -1.0 to 1.0

  // === منطقة الكتف والذراعين ===
  shoulderWidening: number; // -1.0 to 1.0
  armSlimming: number; // 0.0 - 1.0
  bicepEnhancement: number; // 0.0 - 1.0

  // === منطقة الصدر ===
  chestEnhancement: number; // -1.0 to 1.0
  chestLifting: number; // 0.0 - 1.0

  // === منطقة الظهر والمؤخرة ===
  backStraightening: number; // 0.0 - 1.0
  buttocksEnhancement: number; // 0.0 - 1.0
  buttocksLifting: number; // 0.0 - 1.0

  // === تحسينات الوضعية ===
  postureCorrection: number; // 0.0 - 1.0
  heightAdjustment: number; // -0.2 to 0.2 (20% max)

  // === تنعيم البشرة للجسم ===
  bodySkinSmoothing: number; // 0.0 - 1.0
  celluliteReduction: number; // 0.0 - 1.0
  stretchMarkReduction: number; // 0.0 - 1.0
  tattooCoverage: number; // 0.0 - 1.0
}

// =====================================
// === 6. تأثيرات الشعر المتقدمة ===
// =====================================

export interface HairSettings {
  colorChange: {
    enabled: boolean;
    color: ColorRGBA;
    highlights: ColorRGBA[];
    intensity: number;
    naturalBlending: number;
  };
  volumeEnhancement: number; // 0.0 - 1.0
  textureChange: {
    enabled: boolean;
    style: "straight" | "wavy" | "curly" | "kinky";
    intensity: number;
  };
  lengthExtension: number; // 0.0 - 1.0
  shineEnhancement: number; // 0.0 - 1.0
  grayHairCoverage: number; // 0.0 - 1.0
}

// =======================================
// === 7. الملف الشامل للتأثيرات ===
// =======================================

export interface BeautyProfile {
  id: string;
  name: string;
  description: string;
  category:
    | "natural"
    | "glamorous"
    | "dramatic"
    | "artistic"
    | "professional"
    | "custom";

  // الإعدادات الأساسية
  makeup: MakeupSettings;
  faceRetouch: FaceRetouchSettings;
  bodyShaping: BodyShapingSettings;
  hair: HairSettings;

  // إعدادات متقدمة
  environment: {
    lighting: "natural" | "studio" | "golden-hour" | "dramatic";
    lightingIntensity: number;
    backgroundBlur: number;
    vignette: number;
  };

  // معلومات إضافية
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
    usageCount: number;
    rating: number;
  };
}

// ========================================
// === 8. القوالب الجاهزة المتقدمة ===
// ========================================

export class BeautyTemplates {
  // قالب المكياج الطبيعي
  static readonly NATURAL_GLOW: BeautyProfile = {
    id: "natural-glow",
    name: "الإشراق الطبيعي",
    description: "مكياج طبيعي يبرز الجمال الأصلي",
    category: "natural",
    makeup: {
      foundation: {
        enabled: true,
        color: { r: 245, g: 222, b: 179, a: 0.3 },
        coverage: 0.3,
        finish: "dewy",
        smoothing: 0.4,
      },
      concealer: {
        enabled: true,
        coverage: 0.5,
        areas: ["under-eyes", "blemishes"],
      },
      powder: { enabled: false, intensity: 0, areas: [] },
      eyebrows: {
        enabled: true,
        color: { r: 101, g: 67, b: 33, a: 0.8 },
        thickness: 0.6,
        shape: "natural",
      },
      eyeshadow: {
        enabled: true,
        colors: [
          { r: 222, g: 184, b: 135, a: 0.4 },
          { r: 205, g: 133, b: 63, a: 0.2 },
        ],
        intensity: 0.3,
        style: "natural",
        blendMode: "normal",
        shimmer: 0.1,
      },
      eyeliner: {
        enabled: true,
        color: { r: 101, g: 67, b: 33, a: 0.6 },
        thickness: 1.5,
        style: "subtle",
        smudge: 0.2,
      },
      mascara: {
        enabled: true,
        color: { r: 101, g: 67, b: 33, a: 0.8 },
        intensity: 0.6,
        lengthening: 0.7,
        volumizing: 0.4,
        curl: 0.5,
      },
      lipstick: {
        enabled: true,
        color: { r: 205, g: 92, b: 92, a: 0.5 },
        intensity: 0.4,
        gloss: 0.3,
        style: "natural",
        feathering: 0.8,
      },
      blush: {
        enabled: true,
        color: { r: 255, g: 182, b: 193, a: 0.3 },
        intensity: 0.3,
        style: "natural",
        placement: "cheeks",
      },
      highlighter: {
        enabled: true,
        color: { r: 255, g: 255, b: 255, a: 0.2 },
        intensity: 0.3,
        areas: ["cheekbones", "nose-tip"],
        shimmer: 0.4,
      },
      contour: {
        enabled: false,
        color: { r: 139, g: 69, b: 19, a: 0.2 },
        intensity: 0,
        areas: [],
        blending: 0.8,
      },
    },
    faceRetouch: {
      skinSmoothing: 0.3,
      blemishRemoval: 0.6,
      wrinkleReduction: 0.2,
      poreMinimizing: 0.3,
      skinToneEvening: 0.4,
      teethWhitening: 0.3,
      teethStraightening: 0.1,
      eyeBrightening: 0.4,
      redEyeRemoval: true,
      eyebagReduction: 0.3,
      eyeLashEnhancement: 0.2,
      faceSlimming: 0,
      jawSlimming: 0,
      jawSharpening: 0,
      chinAdjustment: 0,
      cheekboneEnhancement: 0.1,
      noseSlimming: 0,
      noseShortening: 0,
      noseBridgeAdjustment: 0,
      nostrilReduction: 0,
      eyeEnlarging: 0.1,
      eyeShape: 0,
      eyeDistance: 0,
      eyeAngle: 0,
      lipEnhancement: 0.1,
      lipSymmetry: 0.2,
      smileEnhancement: 0.2,
      foreheadSmoothing: 0.2,
      foreheadSize: 0,
    },
    bodyShaping: {
      waistSlimming: 0,
      bellyFlattening: 0,
      waistToHipRatio: 0,
      legElongation: 0,
      legSlimming: 0,
      thighGapEnhancement: 0,
      calfEnhancement: 0,
      shoulderWidening: 0,
      armSlimming: 0,
      bicepEnhancement: 0,
      chestEnhancement: 0,
      chestLifting: 0,
      backStraightening: 0.2,
      buttocksEnhancement: 0,
      buttocksLifting: 0,
      postureCorrection: 0.3,
      heightAdjustment: 0,
      bodySkinSmoothing: 0.2,
      celluliteReduction: 0,
      stretchMarkReduction: 0,
      tattooCoverage: 0,
    },
    hair: {
      colorChange: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        highlights: [],
        intensity: 0,
        naturalBlending: 0,
      },
      volumeEnhancement: 0.2,
      textureChange: { enabled: false, style: "natural", intensity: 0 },
      lengthExtension: 0,
      shineEnhancement: 0.3,
      grayHairCoverage: 0,
    },
    environment: {
      lighting: "natural",
      lightingIntensity: 0.8,
      backgroundBlur: 0.1,
      vignette: 0.1,
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: "النظام",
      version: "1.0.0",
      tags: ["طبيعي", "يومي", "ناعم"],
      usageCount: 0,
      rating: 4.8,
    },
  };

  // قالب المكياج الجلام الليلي
  static readonly GLAM_NIGHT: BeautyProfile = {
    id: "glam-night",
    name: "السهرة الساحرة",
    description: "مكياج جلام مثالي للمناسبات الليلية",
    category: "glamorous",
    makeup: {
      foundation: {
        enabled: true,
        color: { r: 245, g: 222, b: 179, a: 0.8 },
        coverage: 0.7,
        finish: "matte",
        smoothing: 0.6,
      },
      concealer: {
        enabled: true,
        coverage: 0.8,
        areas: ["under-eyes", "blemishes", "redness"],
      },
      powder: { enabled: true, intensity: 0.6, areas: ["t-zone"] },
      eyebrows: {
        enabled: true,
        color: { r: 64, g: 64, b: 64, a: 0.9 },
        thickness: 0.8,
        shape: "arched",
      },
      eyeshadow: {
        enabled: true,
        colors: [
          { r: 128, g: 0, b: 128, a: 0.8 },
          { r: 64, g: 64, b: 64, a: 0.6 },
          { r: 0, g: 0, b: 0, a: 0.4 },
        ],
        intensity: 0.8,
        style: "smokey",
        blendMode: "multiply",
        shimmer: 0.6,
      },
      eyeliner: {
        enabled: true,
        color: { r: 0, g: 0, b: 0, a: 0.9 },
        thickness: 4.0,
        style: "dramatic",
        smudge: 0.1,
      },
      mascara: {
        enabled: true,
        color: { r: 0, g: 0, b: 0, a: 1.0 },
        intensity: 0.9,
        lengthening: 0.8,
        volumizing: 0.8,
        curl: 0.7,
      },
      lipstick: {
        enabled: true,
        color: { r: 139, g: 0, b: 0, a: 0.8 },
        intensity: 0.8,
        gloss: 0.4,
        style: "glossy",
        feathering: 0.9,
      },
      blush: {
        enabled: true,
        color: { r: 205, g: 92, b: 92, a: 0.4 },
        intensity: 0.4,
        style: "sculpted",
        placement: "cheeks",
      },
      highlighter: {
        enabled: true,
        color: { r: 255, g: 215, b: 0, a: 0.6 },
        intensity: 0.7,
        areas: ["cheekbones", "nose-tip", "forehead", "chin", "inner-corners"],
        shimmer: 0.8,
      },
      contour: {
        enabled: true,
        color: { r: 139, g: 69, b: 19, a: 0.5 },
        intensity: 0.6,
        areas: ["jawline", "cheekbones", "nose-sides"],
        blending: 0.7,
      },
    },
    faceRetouch: {
      skinSmoothing: 0.6,
      blemishRemoval: 0.8,
      wrinkleReduction: 0.5,
      poreMinimizing: 0.6,
      skinToneEvening: 0.7,
      teethWhitening: 0.7,
      teethStraightening: 0.3,
      eyeBrightening: 0.6,
      redEyeRemoval: true,
      eyebagReduction: 0.6,
      eyeLashEnhancement: 0.5,
      faceSlimming: 0.2,
      jawSlimming: 0.3,
      jawSharpening: 0.4,
      chinAdjustment: 0.1,
      cheekboneEnhancement: 0.5,
      noseSlimming: 0.2,
      noseShortening: 0.1,
      noseBridgeAdjustment: 0.1,
      nostrilReduction: 0.2,
      eyeEnlarging: 0.3,
      eyeShape: 0.2,
      eyeDistance: 0,
      eyeAngle: 0.1,
      lipEnhancement: 0.4,
      lipSymmetry: 0.5,
      smileEnhancement: 0.3,
      foreheadSmoothing: 0.4,
      foreheadSize: 0,
    },
    bodyShaping: {
      waistSlimming: 0.3,
      bellyFlattening: 0.2,
      waistToHipRatio: 0.2,
      legElongation: 0.2,
      legSlimming: 0.1,
      thighGapEnhancement: 0.1,
      calfEnhancement: 0.1,
      shoulderWidening: 0.1,
      armSlimming: 0.2,
      bicepEnhancement: 0,
      chestEnhancement: 0.2,
      chestLifting: 0.3,
      backStraightening: 0.4,
      buttocksEnhancement: 0.2,
      buttocksLifting: 0.2,
      postureCorrection: 0.5,
      heightAdjustment: 0.05,
      bodySkinSmoothing: 0.4,
      celluliteReduction: 0.3,
      stretchMarkReduction: 0.2,
      tattooCoverage: 0,
    },
    hair: {
      colorChange: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        highlights: [],
        intensity: 0,
        naturalBlending: 0,
      },
      volumeEnhancement: 0.6,
      textureChange: { enabled: false, style: "wavy", intensity: 0.3 },
      lengthExtension: 0.2,
      shineEnhancement: 0.7,
      grayHairCoverage: 0,
    },
    environment: {
      lighting: "dramatic",
      lightingIntensity: 1.0,
      backgroundBlur: 0.3,
      vignette: 0.4,
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: "النظام",
      version: "1.0.0",
      tags: ["جلام", "سهرة", "مميز", "جذاب"],
      usageCount: 0,
      rating: 4.9,
    },
  };

  // قالب بدون مكياج (تحسينات طبيعية فقط)
  static readonly NO_MAKEUP: BeautyProfile = {
    id: "no-makeup",
    name: "بدون مكياج",
    description: "تحسينات طبيعية دون مكياج",
    category: "natural",
    makeup: {
      foundation: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        coverage: 0,
        finish: "natural",
        smoothing: 0,
      },
      concealer: { enabled: false, coverage: 0, areas: [] },
      powder: { enabled: false, intensity: 0, areas: [] },
      eyebrows: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        thickness: 0,
        shape: "natural",
      },
      eyeshadow: {
        enabled: false,
        colors: [],
        intensity: 0,
        style: "natural",
        blendMode: "normal",
        shimmer: 0,
      },
      eyeliner: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        thickness: 0,
        style: "subtle",
        smudge: 0,
      },
      mascara: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        intensity: 0,
        lengthening: 0,
        volumizing: 0,
        curl: 0,
      },
      lipstick: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        intensity: 0,
        gloss: 0,
        style: "natural",
        feathering: 0,
      },
      blush: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        intensity: 0,
        style: "natural",
        placement: "cheeks",
      },
      highlighter: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        intensity: 0,
        areas: [],
        shimmer: 0,
      },
      contour: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        intensity: 0,
        areas: [],
        blending: 0,
      },
    },
    faceRetouch: {
      skinSmoothing: 0.2,
      blemishRemoval: 0.3,
      wrinkleReduction: 0.1,
      poreMinimizing: 0.2,
      skinToneEvening: 0.2,
      teethWhitening: 0.2,
      teethStraightening: 0,
      eyeBrightening: 0.2,
      redEyeRemoval: true,
      eyebagReduction: 0.2,
      eyeLashEnhancement: 0,
      faceSlimming: 0,
      jawSlimming: 0,
      jawSharpening: 0,
      chinAdjustment: 0,
      cheekboneEnhancement: 0,
      noseSlimming: 0,
      noseShortening: 0,
      noseBridgeAdjustment: 0,
      nostrilReduction: 0,
      eyeEnlarging: 0,
      eyeShape: 0,
      eyeDistance: 0,
      eyeAngle: 0,
      lipEnhancement: 0,
      lipSymmetry: 0,
      smileEnhancement: 0,
      foreheadSmoothing: 0.1,
      foreheadSize: 0,
    },
    bodyShaping: {
      waistSlimming: 0,
      bellyFlattening: 0,
      waistToHipRatio: 0,
      legElongation: 0,
      legSlimming: 0,
      thighGapEnhancement: 0,
      calfEnhancement: 0,
      shoulderWidening: 0,
      armSlimming: 0,
      bicepEnhancement: 0,
      chestEnhancement: 0,
      chestLifting: 0,
      backStraightening: 0.1,
      buttocksEnhancement: 0,
      buttocksLifting: 0,
      postureCorrection: 0.2,
      heightAdjustment: 0,
      bodySkinSmoothing: 0.1,
      celluliteReduction: 0,
      stretchMarkReduction: 0,
      tattooCoverage: 0,
    },
    hair: {
      colorChange: {
        enabled: false,
        color: { r: 0, g: 0, b: 0, a: 0 },
        highlights: [],
        intensity: 0,
        naturalBlending: 0,
      },
      volumeEnhancement: 0,
      textureChange: { enabled: false, style: "natural", intensity: 0 },
      lengthExtension: 0,
      shineEnhancement: 0.1,
      grayHairCoverage: 0,
    },
    environment: {
      lighting: "natural",
      lightingIntensity: 0.7,
      backgroundBlur: 0,
      vignette: 0,
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      author: "النظام",
      version: "1.0.0",
      tags: ["طبيعي", "خالي", "بسيط"],
      usageCount: 0,
      rating: 4.5,
    },
  };

  // الحصول على جميع القوالب المتاحة
  static getAllTemplates(): BeautyProfile[] {
    return [this.NATURAL_GLOW, this.GLAM_NIGHT, this.NO_MAKEUP];
  }

  // البحث عن قالب بالمعرف
  static getTemplateById(id: string): BeautyProfile | null {
    const templates = this.getAllTemplates();
    return templates.find((template) => template.id === id) || null;
  }

  // الحصول على القوالب حسب الفئة
  static getTemplatesByCategory(category: string): BeautyProfile[] {
    return this.getAllTemplates().filter(
      (template) => template.category === category,
    );
  }

  // إنشاء قالب مخصص من ملف موجود
  static createCustomTemplate(
    baseProfile: BeautyProfile,
    name: string,
    description: string,
  ): BeautyProfile {
    return {
      ...baseProfile,
      id: `custom-${Date.now()}`,
      name,
      description,
      category: "custom",
      metadata: {
        ...baseProfile.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: "المستخدم",
        version: "1.0.0",
        usageCount: 0,
        rating: 0,
      },
    };
  }
}

// =========================================
// === 9. فئة إدارة ملفات الجمال ===
// =========================================

export class BeautyProfileManager {
  private profiles: Map<string, BeautyProfile> = new Map();
  private activeProfile: BeautyProfile | null = null;

  constructor() {
    this.loadDefaultTemplates();
  }

  // تحميل القوالب الافتراضية
  private loadDefaultTemplates(): void {
    BeautyTemplates.getAllTemplates().forEach((template) => {
      this.profiles.set(template.id, template);
    });
  }

  // إنشاء ملف جديد
  createProfile(profile: BeautyProfile): boolean {
    try {
      this.profiles.set(profile.id, { ...profile });
      return true;
    } catch (error) {
      console.error("Failed to create beauty profile:", error);
      return false;
    }
  }

  // تحديث ملف موجود
  updateProfile(id: string, updates: Partial<BeautyProfile>): boolean {
    try {
      const existingProfile = this.profiles.get(id);
      if (!existingProfile) return false;

      const updatedProfile = {
        ...existingProfile,
        ...updates,
        metadata: {
          ...existingProfile.metadata,
          ...updates.metadata,
          updatedAt: new Date(),
        },
      };

      this.profiles.set(id, updatedProfile);
      return true;
    } catch (error) {
      console.error("Failed to update beauty profile:", error);
      return false;
    }
  }

  // حذف ملف
  deleteProfile(id: string): boolean {
    try {
      // منع حذف القوالب الافتراضية
      const defaultIds = BeautyTemplates.getAllTemplates().map((t) => t.id);
      if (defaultIds.includes(id)) {
        console.warn("Cannot delete default template");
        return false;
      }

      return this.profiles.delete(id);
    } catch (error) {
      console.error("Failed to delete beauty profile:", error);
      return false;
    }
  }

  // الحصول على ملف بالمعرف
  getProfile(id: string): BeautyProfile | null {
    return this.profiles.get(id) || null;
  }

  // الحصول على جميع الملفات
  getAllProfiles(): BeautyProfile[] {
    return Array.from(this.profiles.values());
  }

  // تعيين الملف النشط
  setActiveProfile(id: string): boolean {
    const profile = this.profiles.get(id);
    if (profile) {
      this.activeProfile = { ...profile };
      return true;
    }
    return false;
  }

  // الحصول على الملف النشط
  getActiveProfile(): BeautyProfile | null {
    return this.activeProfile ? { ...this.activeProfile } : null;
  }

  // تطبيق تحديثات على الملف النشط
  updateActiveProfile(updates: Partial<BeautyProfile>): void {
    if (this.activeProfile) {
      this.activeProfile = {
        ...this.activeProfile,
        ...updates,
        metadata: {
          ...this.activeProfile.metadata,
          updatedAt: new Date(),
        },
      };
    }
  }

  // البحث في الملفات
  searchProfiles(query: string): BeautyProfile[] {
    const searchTerm = query.toLowerCase();
    return this.getAllProfiles().filter(
      (profile) =>
        profile.name.toLowerCase().includes(searchTerm) ||
        profile.description.toLowerCase().includes(searchTerm) ||
        profile.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        ),
    );
  }

  // الحصول على الملفات حسب الفئة
  getProfilesByCategory(category: string): BeautyProfile[] {
    return this.getAllProfiles().filter(
      (profile) => profile.category === category,
    );
  }

  // تصدير ملف
  exportProfile(id: string): string | null {
    const profile = this.profiles.get(id);
    if (profile) {
      return JSON.stringify(profile, null, 2);
    }
    return null;
  }

  // استيراد ملف
  importProfile(jsonData: string): boolean {
    try {
      const profile: BeautyProfile = JSON.parse(jsonData);

      // التحقق من صحة البيانات
      if (this.validateProfile(profile)) {
        // إنشاء معرف جديد لتجنب التضارب
        profile.id = `imported-${Date.now()}`;
        profile.metadata.createdAt = new Date();
        profile.metadata.updatedAt = new Date();

        this.profiles.set(profile.id, profile);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to import beauty profile:", error);
      return false;
    }
  }

  // التحقق من صحة ملف الجمال
  private validateProfile(profile: any): boolean {
    return (
      profile &&
      typeof profile.id === "string" &&
      typeof profile.name === "string" &&
      profile.makeup &&
      profile.faceRetouch &&
      profile.bodyShaping &&
      profile.metadata
    );
  }

  // إحصائيات الاستخدام
  getUsageStats(): {
    totalProfiles: number;
    customProfiles: number;
    defaultProfiles: number;
    mostUsedProfile: BeautyProfile | null;
  } {
    const allProfiles = this.getAllProfiles();
    const customProfiles = allProfiles.filter((p) => p.category === "custom");
    const defaultProfiles = allProfiles.filter((p) => p.category !== "custom");
    const mostUsedProfile = allProfiles.reduce(
      (max, profile) =>
        profile.metadata.usageCount > (max?.metadata.usageCount || 0)
          ? profile
          : max,
      null as BeautyProfile | null,
    );

    return {
      totalProfiles: allProfiles.length,
      customProfiles: customProfiles.length,
      defaultProfiles: defaultProfiles.length,
      mostUsedProfile,
    };
  }
}

// إنشاء نسخة واحدة من مدير ملفات الجمال
export const beautyProfileManager = new BeautyProfileManager();
