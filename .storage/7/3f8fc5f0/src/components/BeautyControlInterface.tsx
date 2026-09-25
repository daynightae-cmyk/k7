// ================================================================
// === واجهة التحكم بالتأثيرات الجمالية المتقدمة ===
// ================================================================

import React, { useState, useCallback, useEffect, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Sequence } from "remotion";
import {
  BeautyProfile,
  BeautyTemplates,
  beautyProfileManager,
  MakeupSettings,
  FaceRetouchSettings,
  BodyShapingSettings,
} from "../services/BeautyProfileSystem";
import { advancedMediaProcessor } from "../services/AdvancedMediaProcessor";

// =====================================
// === واجهات التحكم والحالة ===
// =====================================

interface BeautyControlState {
  activeProfile: BeautyProfile | null;
  selectedCategory:
    | "makeup"
    | "faceRetouch"
    | "bodyShaping"
    | "hair"
    | "environment";
  selectedSubcategory: string | null;
  isProcessing: boolean;
  previewMode: boolean;
  realTimePreview: boolean;
  uploadedImage: File | null;
  processedImageUrl: string | null;
  comparison: {
    showBefore: boolean;
    splitView: boolean;
    splitPosition: number;
  };
}

interface BeautySliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  icon?: string;
}

interface BeautyToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  description?: string;
  icon?: string;
}

interface ColorPickerProps {
  label: string;
  color: { r: number; g: number; b: number; a: number };
  onChange: (color: { r: number; g: number; b: number; a: number }) => void;
  description?: string;
}

// =====================================
// === المكونات المساعدة ===
// =====================================

const BeautySlider: React.FC<BeautySliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
  description,
  icon,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "15px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          gap: "8px",
        }}
      >
        {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
        <span
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
            flex: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "12px",
            color: "#3b82f6",
            fontWeight: "500",
            minWidth: "60px",
            textAlign: "right",
          }}
        >
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          height: "6px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${percentage}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
          }}
        />
      </div>

      {description && (
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: "8px",
            lineHeight: "1.4",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

const BeautyToggle: React.FC<BeautyToggleProps> = ({
  label,
  enabled,
  onChange,
  description,
  icon,
}) => {
  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => onChange(!enabled)}
      >
        {icon && <span style={{ fontSize: "16px" }}>{icon}</span>}
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "white",
            flex: 1,
          }}
        >
          {label}
        </span>

        <div
          style={{
            width: "44px",
            height: "24px",
            background: enabled
              ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
              : "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            position: "relative",
            transition: "background 0.3s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: enabled ? "22px" : "2px",
              width: "20px",
              height: "20px",
              background: "white",
              borderRadius: "50%",
              transition: "left 0.3s ease",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>
      </div>

      {description && (
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: "8px",
            lineHeight: "1.4",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  color,
  onChange,
  description,
}) => {
  const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  const hexColor = `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;

  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "12px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "white",
            flex: 1,
          }}
        >
          {label}
        </span>

        <div
          style={{
            width: "32px",
            height: "32px",
            background: colorString,
            borderRadius: "6px",
            border: "2px solid white",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <input
            type="color"
            value={hexColor}
            onChange={(e) => {
              const hex = e.target.value;
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              onChange({ r, g, b, a: color.a });
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <BeautySlider
        label="الشفافية"
        value={color.a}
        min={0}
        max={1}
        step={0.1}
        onChange={(a) => onChange({ ...color, a })}
      />

      {description && (
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255, 255, 255, 0.6)",
            marginTop: "5px",
            lineHeight: "1.4",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

// =====================================
// === الواجهة الرئيسية ===
// =====================================

export const BeautyControlInterface: React.FC = () => {
  const frame = useCurrentFrame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<BeautyControlState>({
    activeProfile: BeautyTemplates.NATURAL_GLOW,
    selectedCategory: "makeup",
    selectedSubcategory: null,
    isProcessing: false,
    previewMode: false,
    realTimePreview: true,
    uploadedImage: null,
    processedImageUrl: null,
    comparison: {
      showBefore: false,
      splitView: false,
      splitPosition: 50,
    },
  });

  // تأثيرات الحركة
  const slideIn = interpolate(frame, [0, 30], [-100, 0]);
  const fadeIn = interpolate(frame, [0, 30], [0, 1]);
  const scaleIn = interpolate(frame, [15, 45], [0.8, 1]);

  // معالجة رفع الصورة
  const handleImageUpload = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (!file || !file.type.startsWith("image/")) {
        alert("يرجى اختيار ملف صورة صالح");
        return;
      }

      setState((prev) => ({
        ...prev,
        uploadedImage: file,
        isProcessing: true,
      }));

      try {
        if (state.activeProfile) {
          const result = await advancedMediaProcessor.processImageAdvanced(
            file,
            state.activeProfile.id,
            {
              outputFormat: "jpg",
              quality: 0.9,
              useGPUAcceleration: true,
              aiEnhancement: {
                autoColorCorrection: true,
                smartCropping: false,
                noiseReduction: true,
                superResolution: false,
              },
            },
          );

          if (result.success && result.outputUrl) {
            setState((prev) => ({
              ...prev,
              processedImageUrl: result.outputUrl!,
              isProcessing: false,
            }));
          } else {
            throw new Error(result.error);
          }
        }
      } catch (error) {
        console.error("خطأ في المعالجة:", error);
        setState((prev) => ({ ...prev, isProcessing: false }));
        alert("فشل في معالجة الصورة");
      }
    },
    [state.activeProfile],
  );

  // تحديث الملف الشخصي
  const updateProfile = useCallback(
    (updates: Partial<BeautyProfile>) => {
      if (!state.activeProfile) return;

      const updatedProfile = { ...state.activeProfile, ...updates };
      setState((prev) => ({ ...prev, activeProfile: updatedProfile }));

      // إعادة معالجة الصورة إذا كان التحديث المباشر مفعل
      if (state.realTimePreview && state.uploadedImage) {
        handleImageUpload(new DataTransfer().files);
      }
    },
    [
      state.activeProfile,
      state.realTimePreview,
      state.uploadedImage,
      handleImageUpload,
    ],
  );

  // رندر قوائم ا��تحكم حسب الفئة
  const renderCategoryControls = () => {
    if (!state.activeProfile) return null;

    switch (state.selectedCategory) {
      case "makeup":
        return renderMakeupControls();
      case "faceRetouch":
        return renderFaceRetouchControls();
      case "bodyShaping":
        return renderBodyShapingControls();
      case "hair":
        return renderHairControls();
      case "environment":
        return renderEnvironmentControls();
      default:
        return null;
    }
  };

  // رندر تحكم المكياج
  const renderMakeupControls = () => {
    const makeup = state.activeProfile!.makeup;

    return (
      <div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          💄 المكياج
        </h3>

        {/* كريم الأساس */}
        <div style={{ marginBottom: "25px" }}>
          <h4
            style={{ fontSize: "16px", color: "#3b82f6", marginBottom: "15px" }}
          >
            Foundation - كريم الأساس
          </h4>

          <BeautyToggle
            label="تفعيل كريم الأساس"
            enabled={makeup.foundation.enabled}
            onChange={(enabled) =>
              updateProfile({
                makeup: {
                  ...makeup,
                  foundation: { ...makeup.foundation, enabled },
                },
              })
            }
            icon="🎨"
            description="يوحد لون البشرة ويخفي العيوب"
          />

          {makeup.foundation.enabled && (
            <>
              <ColorPicker
                label="لون كريم الأساس"
                color={makeup.foundation.color}
                onChange={(color) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      foundation: { ...makeup.foundation, color },
                    },
                  })
                }
                description="اختر اللون المناسب لبشرتك"
              />

              <BeautySlider
                label="التغطية"
                value={makeup.foundation.coverage}
                min={0}
                max={1}
                step={0.1}
                onChange={(coverage) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      foundation: { ...makeup.foundation, coverage },
                    },
                  })
                }
                unit="%"
                icon="🎭"
                description="مستوى تغط��ة العيوب"
              />

              <BeautySlider
                label="التنعيم"
                value={makeup.foundation.smoothing}
                min={0}
                max={1}
                step={0.1}
                onChange={(smoothing) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      foundation: { ...makeup.foundation, smoothing },
                    },
                  })
                }
                unit="%"
                icon="✨"
                description="مستوى تنعيم البشرة"
              />
            </>
          )}
        </div>

        {/* أحمر الشفاه */}
        <div style={{ marginBottom: "25px" }}>
          <h4
            style={{ fontSize: "16px", color: "#ec4899", marginBottom: "15px" }}
          >
            Lipstick - أحمر الشفاه
          </h4>

          <BeautyToggle
            label="تفعيل أحمر الشفاه"
            enabled={makeup.lipstick.enabled}
            onChange={(enabled) =>
              updateProfile({
                makeup: {
                  ...makeup,
                  lipstick: { ...makeup.lipstick, enabled },
                },
              })
            }
            icon="💋"
            description="يضفي لون وحيوية على الشفاه"
          />

          {makeup.lipstick.enabled && (
            <>
              <ColorPicker
                label="لون أحمر الشفاه"
                color={makeup.lipstick.color}
                onChange={(color) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      lipstick: { ...makeup.lipstick, color },
                    },
                  })
                }
                description="اختر لون أحمر الشفاه المفضل"
              />

              <BeautySlider
                label="الكثافة"
                value={makeup.lipstick.intensity}
                min={0}
                max={1}
                step={0.1}
                onChange={(intensity) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      lipstick: { ...makeup.lipstick, intensity },
                    },
                  })
                }
                unit="%"
                icon="🌈"
                description="شدة اللون والظهور"
              />

              <BeautySlider
                label="اللمعة"
                value={makeup.lipstick.gloss}
                min={0}
                max={1}
                step={0.1}
                onChange={(gloss) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      lipstick: { ...makeup.lipstick, gloss },
                    },
                  })
                }
                unit="%"
                icon="✨"
                description="مستوى اللمعان"
              />
            </>
          )}
        </div>

        {/* ظلال العيون */}
        <div style={{ marginBottom: "25px" }}>
          <h4
            style={{ fontSize: "16px", color: "#8b5cf6", marginBottom: "15px" }}
          >
            Eyeshadow - ظلال العيون
          </h4>

          <BeautyToggle
            label="تفعيل ظلال العيون"
            enabled={makeup.eyeshadow.enabled}
            onChange={(enabled) =>
              updateProfile({
                makeup: {
                  ...makeup,
                  eyeshadow: { ...makeup.eyeshadow, enabled },
                },
              })
            }
            icon="👁️"
            description="يبرز جمال العيون ويضفي عمقاً"
          />

          {makeup.eyeshadow.enabled && (
            <>
              <BeautySlider
                label="الكثافة"
                value={makeup.eyeshadow.intensity}
                min={0}
                max={1}
                step={0.1}
                onChange={(intensity) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      eyeshadow: { ...makeup.eyeshadow, intensity },
                    },
                  })
                }
                unit="%"
                icon="🎨"
                description="شدة ظهور ظلال العيون"
              />

              <BeautySlider
                label="البريق"
                value={makeup.eyeshadow.shimmer}
                min={0}
                max={1}
                step={0.1}
                onChange={(shimmer) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      eyeshadow: { ...makeup.eyeshadow, shimmer },
                    },
                  })
                }
                unit="%"
                icon="⭐"
                description="مستوى البريق واللمعان"
              />
            </>
          )}
        </div>

        {/* أحمر الخدود */}
        <div style={{ marginBottom: "25px" }}>
          <h4
            style={{ fontSize: "16px", color: "#f59e0b", marginBottom: "15px" }}
          >
            Blush - أحمر الخدود
          </h4>

          <BeautyToggle
            label="تفعيل أحمر الخدود"
            enabled={makeup.blush.enabled}
            onChange={(enabled) =>
              updateProfile({
                makeup: {
                  ...makeup,
                  blush: { ...makeup.blush, enabled },
                },
              })
            }
            icon="🌸"
            description="يضفي إشراقاً طبيعياً على الخدود"
          />

          {makeup.blush.enabled && (
            <>
              <ColorPicker
                label="لون أحمر الخدود"
                color={makeup.blush.color}
                onChange={(color) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      blush: { ...makeup.blush, color },
                    },
                  })
                }
                description="اختر لون أحمر الخدود"
              />

              <BeautySlider
                label="الكثافة"
                value={makeup.blush.intensity}
                min={0}
                max={1}
                step={0.1}
                onChange={(intensity) =>
                  updateProfile({
                    makeup: {
                      ...makeup,
                      blush: { ...makeup.blush, intensity },
                    },
                  })
                }
                unit="%"
                icon="🌺"
                description="شدة ظهور أحمر الخدود"
              />
            </>
          )}
        </div>
      </div>
    );
  };

  // رندر تحكم تحسينات الوجه
  const renderFaceRetouchControls = () => {
    const faceRetouch = state.activeProfile!.faceRetouch;

    return (
      <div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          ✨ تحسينات الوجه
        </h3>

        {/* تحسينات البشرة */}
        <div style={{ marginBottom: "30px" }}>
          <h4
            style={{ fontSize: "16px", color: "#10b981", marginBottom: "15px" }}
          >
            تحسينات البشرة
          </h4>

          <BeautySlider
            label="تنعيم البشرة"
            value={faceRetouch.skinSmoothing}
            min={0}
            max={1}
            step={0.1}
            onChange={(skinSmoothing) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, skinSmoothing },
              })
            }
            unit="%"
            icon="🧴"
            description="يقلل من ظهور المسام والعيوب"
          />

          <BeautySlider
            label="إزالة العيوب"
            value={faceRetouch.blemishRemoval}
            min={0}
            max={1}
            step={0.1}
            onChange={(blemishRemoval) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, blemishRemoval },
              })
            }
            unit="%"
            icon="🎯"
            description="يخفي البثور والعيوب الصغيرة"
          />

          <BeautySlider
            label="توحيد لون البشرة"
            value={faceRetouch.skinToneEvening}
            min={0}
            max={1}
            step={0.1}
            onChange={(skinToneEvening) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, skinToneEvening },
              })
            }
            unit="%"
            icon="🎨"
            description="يوحد لون البشرة ويقلل التباين"
          />
        </div>

        {/* تحسينات العيون */}
        <div style={{ marginBottom: "30px" }}>
          <h4
            style={{ fontSize: "16px", color: "#3b82f6", marginBottom: "15px" }}
          >
            تحسينات العيون
          </h4>

          <BeautySlider
            label="إشراق العيون"
            value={faceRetouch.eyeBrightening}
            min={0}
            max={1}
            step={0.1}
            onChange={(eyeBrightening) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, eyeBrightening },
              })
            }
            unit="%"
            icon="👁️"
            description="يضفي إشراقاً طبيعياً على العيو��"
          />

          <BeautySlider
            label="تكبير العيون"
            value={faceRetouch.eyeEnlarging}
            min={0}
            max={1}
            step={0.1}
            onChange={(eyeEnlarging) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, eyeEnlarging },
              })
            }
            unit="%"
            icon="👀"
            description="يجعل العيون تبدو أكبر وأكثر تعبيراً"
          />

          <BeautySlider
            label="تقليل الهالات"
            value={faceRetouch.eyebagReduction}
            min={0}
            max={1}
            step={0.1}
            onChange={(eyebagReduction) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, eyebagReduction },
              })
            }
            unit="%"
            icon="💤"
            description="يقلل من ظهور الهالات السوداء"
          />

          <BeautyToggle
            label="إزالة العيون الحمراء"
            enabled={faceRetouch.redEyeRemoval}
            onChange={(redEyeRemoval) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, redEyeRemoval },
              })
            }
            icon="🔴"
            description="يزيل تأثير العيون الحمراء من الفلاش"
          />
        </div>

        {/* تحسينات الأسنان */}
        <div style={{ marginBottom: "30px" }}>
          <h4
            style={{ fontSize: "16px", color: "#f59e0b", marginBottom: "15px" }}
          >
            تحسينات الأسنان والابتسامة
          </h4>

          <BeautySlider
            label="تبييض الأسنان"
            value={faceRetouch.teethWhitening}
            min={0}
            max={1}
            step={0.1}
            onChange={(teethWhitening) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, teethWhitening },
              })
            }
            unit="%"
            icon="🦷"
            description="يجعل الأسنان أكثر بياضاً"
          />

          <BeautySlider
            label="تحسين الابتسامة"
            value={faceRetouch.smileEnhancement}
            min={0}
            max={1}
            step={0.1}
            onChange={(smileEnhancement) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, smileEnhancement },
              })
            }
            unit="%"
            icon="😊"
            description="يحسن شكل الابتسامة"
          />
        </div>

        {/* تحسينات الوجه */}
        <div style={{ marginBottom: "30px" }}>
          <h4
            style={{ fontSize: "16px", color: "#ec4899", marginBottom: "15px" }}
          >
            تشكيل الوجه
          </h4>

          <BeautySlider
            label="تنحيف الوجه"
            value={faceRetouch.faceSlimming}
            min={-1}
            max={1}
            step={0.1}
            onChange={(faceSlimming) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, faceSlimming },
              })
            }
            unit=""
            icon="👤"
            description="يجعل الوجه أكثر نحافة"
          />

          <BeautySlider
            label="تنحيف الفك"
            value={faceRetouch.jawSlimming}
            min={-1}
            max={1}
            step={0.1}
            onChange={(jawSlimming) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, jawSlimming },
              })
            }
            unit=""
            icon="🎭"
            description="يحدد خط الفك"
          />

          <BeautySlider
            label="تنحيف الأنف"
            value={faceRetouch.noseSlimming}
            min={-1}
            max={1}
            step={0.1}
            onChange={(noseSlimming) =>
              updateProfile({
                faceRetouch: { ...faceRetouch, noseSlimming },
              })
            }
            unit=""
            icon="👃"
            description="يجعل الأنف أكثر دقة"
          />
        </div>
      </div>
    );
  };

  // رندر تحكم تشكيل الجسم
  const renderBodyShapingControls = () => {
    const bodyShaping = state.activeProfile!.bodyShaping;

    return (
      <div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          🏃 تشكيل الجسم
        </h3>

        <BeautySlider
          label="تنحيف الخصر"
          value={bodyShaping.waistSlimming}
          min={0}
          max={1}
          step={0.1}
          onChange={(waistSlimming) =>
            updateProfile({
              bodyShaping: { ...bodyShaping, waistSlimming },
            })
          }
          unit="%"
          icon="⏳"
          description="يجعل الخصر أكثر نحافة"
        />

        <BeautySlider
          label="تطويل الساقين"
          value={bodyShaping.legElongation}
          min={0}
          max={1}
          step={0.1}
          onChange={(legElongation) =>
            updateProfile({
              bodyShaping: { ...bodyShaping, legElongation },
            })
          }
          unit="%"
          icon="🦵"
          description="يجعل الساقين تبدوان أطول"
        />

        <BeautySlider
          label="تحسين الوضعية"
          value={bodyShaping.postureCorrection}
          min={0}
          max={1}
          step={0.1}
          onChange={(postureCorrection) =>
            updateProfile({
              bodyShaping: { ...bodyShaping, postureCorrection },
            })
          }
          unit="%"
          icon="🚶"
          description="يحسن وضعية الجسم والعمود الفقري"
        />
      </div>
    );
  };

  // رندر تحكم الشعر (مبسط)
  const renderHairControls = () => {
    return (
      <div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          💇 تحسينات الشعر
        </h3>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
          ميزات تحسين الشعر قريباً...
        </p>
      </div>
    );
  };

  // رندر تحكم البيئة
  const renderEnvironmentControls = () => {
    const environment = state.activeProfile!.environment;

    return (
      <div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          🌅 تحسينات البيئة
        </h3>

        <BeautySlider
          label="شدة الإضاءة"
          value={environment.lightingIntensity}
          min={0.5}
          max={1.5}
          step={0.1}
          onChange={(lightingIntensity) =>
            updateProfile({
              environment: { ...environment, lightingIntensity },
            })
          }
          unit="x"
          icon="💡"
          description="يتحكم في شدة الإضاءة العامة"
        />

        <BeautySlider
          label="ضبابية الخلفية"
          value={environment.backgroundBlur}
          min={0}
          max={1}
          step={0.1}
          onChange={(backgroundBlur) =>
            updateProfile({
              environment: { ...environment, backgroundBlur },
            })
          }
          unit="%"
          icon="🌫️"
          description="يطبق تأثير ضبابي على الخلفية"
        />

        <BeautySlider
          label="تأثير الفينيت"
          value={environment.vignette}
          min={0}
          max={1}
          step={0.1}
          onChange={(vignette) =>
            updateProfile({
              environment: { ...environment, vignette },
            })
          }
          unit="%"
          icon="🎭"
          description="يضفي إطار مظلم حول الحواف"
        />
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        fontFamily: "Cairo, Arial, sans-serif",
        opacity: fadeIn,
        transform: `translateX(${slideIn}px) scale(${scaleIn})`,
        overflow: "hidden",
      }}
    >
      {/* الشريط العلوي */}
      <div
        style={{
          height: "70px",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          ✨ استوديو التجميل الذكي
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📸 رفع صورة
          </button>

          <button
            style={{
              background: state.realTimePreview
                ? "linear-gradient(45deg, #10b981, #34d399)"
                : "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onClick={() =>
              setState((prev) => ({
                ...prev,
                realTimePreview: !prev.realTimePreview,
              }))
            }
          >
            ⚡ المعاينة المباشرة
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100% - 70px)" }}>
        {/* الشريط الجانبي - التحكم */}
        <div
          style={{
            width: "350px",
            background: "rgba(30, 41, 59, 0.8)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {/* فئات التحكم */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              marginBottom: "25px",
            }}
          >
            {[
              { key: "makeup", label: "مكياج", icon: "💄" },
              { key: "faceRetouch", label: "تحسين", icon: "✨" },
              { key: "bodyShaping", label: "جسم", icon: "🏃" },
              { key: "environment", label: "بيئة", icon: "🌅" },
            ].map((category) => (
              <button
                key={category.key}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    selectedCategory: category.key as any,
                  }))
                }
                style={{
                  background:
                    state.selectedCategory === category.key
                      ? "linear-gradient(45deg, #3b82f6, #8b5cf6)"
                      : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "12px 8px",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.3s ease",
                }}
              >
                <span style={{ fontSize: "18px" }}>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          {/* قوالب سريعة */}
          <div style={{ marginBottom: "25px" }}>
            <h4
              style={{ fontSize: "16px", color: "white", marginBottom: "15px" }}
            >
              🎨 القوالب السريعة
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {BeautyTemplates.getAllTemplates().map((template) => (
                <button
                  key={template.id}
                  onClick={() =>
                    setState((prev) => ({ ...prev, activeProfile: template }))
                  }
                  style={{
                    background:
                      state.activeProfile?.id === template.id
                        ? "linear-gradient(45deg, #ec4899, #f9a8d4)"
                        : "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "right",
                    transition: "all 0.3s ease",
                  }}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* التحكم في الفئة المختارة */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "15px",
              padding: "20px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}
          >
            {renderCategoryControls()}
          </div>
        </div>

        {/* منطقة المعاينة */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            position: "relative",
          }}
        >
          {state.isProcessing && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "30px",
                  textAlign: "center",
                  minWidth: "200px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid #3b82f6",
                    borderTop: "4px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 15px",
                  }}
                />
                <p
                  style={{
                    color: "#1e293b",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  جاري المعالجة...
                </p>
              </div>
            </div>
          )}

          {!state.uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "400px",
                height: "400px",
                border: "3px dashed rgba(255, 255, 255, 0.3)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>📸</div>
              <h3
                style={{
                  color: "white",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                ارفع صورة للبدء
              </h3>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  textAlign: "center",
                }}
              >
                اضغط هنا أو اسحب الصورة لرفعها
                <br />
                (JPG, PNG, WebP)
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "20px",
                maxWidth: "100%",
                height: "100%",
                alignItems: "center",
              }}
            >
              {/* الصورة الأصلية */}
              <div
                style={{
                  flex: 1,
                  maxWidth: "45%",
                  textAlign: "center",
                }}
              >
                <h4 style={{ color: "white", marginBottom: "15px" }}>
                  الصورة الأصلية
                </h4>
                <img
                  src={URL.createObjectURL(state.uploadedImage)}
                  alt="الصورة الأصلية"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "500px",
                    borderRadius: "15px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  }}
                />
              </div>

              {/* الصورة المعالجة */}
              {state.processedImageUrl && (
                <div
                  style={{
                    flex: 1,
                    maxWidth: "45%",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ color: "white", marginBottom: "15px" }}>
                    الصورة المحسنة
                  </h4>
                  <img
                    src={state.processedImageUrl}
                    alt="الصورة المحسنة"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "500px",
                      borderRadius: "15px",
                      boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* حقل رفع الملف المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
      />

      {/* CSS للحركات */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};
