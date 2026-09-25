import React from "react";
import { Composition } from "remotion";
import { videoTemplates } from "./templates/TemplateData";
import { ArtisticPortrait } from "./templates/ArtisticPortrait";
import { BusinessIntro } from "./templates/BusinessIntro";
import { SocialStory } from "./templates/SocialStory";
import { MarketingPromo } from "./templates/MarketingPromo";
import { EducationalTemplate } from "./templates/EducationalTemplate";
import { CelebrationTemplate } from "./templates/CelebrationTemplate";
import { PodcastTemplate } from "./templates/PodcastTemplate";
import { GamingTemplate } from "./templates/GamingTemplate";
import { TemplateSelector } from "./components/TemplateSelector";
import { StudioInterface } from "./components/StudioInterface";
import { BeautyControlInterface } from "./components/BeautyControlInterface";

// مكونات القوالب
const templateComponents = {
  "artistic-portrait": ArtisticPortrait,
  "business-intro": BusinessIntro,
  "social-story": SocialStory,
  "marketing-promo": MarketingPromo,
  "educational-template": EducationalTemplate,
  "celebration-template": CelebrationTemplate,
  "podcast-template": PodcastTemplate,
  "gaming-template": GamingTemplate,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* الاستوديو الشامل */}
      <Composition
        id="StudioInterface"
        component={StudioInterface}
        durationInFrames={3600} // دقيقتان للاستكشاف
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* واجهة التحكم بالتأثي��ات الجمالية */}
      <Composition
        id="BeautyControlInterface"
        component={BeautyControlInterface}
        durationInFrames={1800} // 60 ثانية للاستكشاف
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* واجهة اختيار القوالب التفاعلية */}
      <Composition
        id="TemplateSelector"
        component={TemplateSelector}
        durationInFrames={1800} // 60 ثانية للاستكشاف
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* جميع القوالب المتاحة */}
      {videoTemplates.map((template) => {
        const TemplateComponent =
          templateComponents[template.id as keyof typeof templateComponents];

        if (!TemplateComponent) return null;

        return (
          <Composition
            key={template.id}
            id={template.id}
            component={TemplateComponent}
            durationInFrames={template.duration}
            fps={template.fps}
            width={template.width}
            height={template.height}
            defaultProps={{
              title: template.customizableProps.text?.title || "عنوان افتراضي",
              subtitle:
                template.customizableProps.text?.subtitle || "عنوان فرعي",
              description:
                template.customizableProps.text?.description || "وصف افتراضي",
              primaryColor:
                template.customizableProps.colors?.primary || "#4338ca",
              secondaryColor:
                template.customizableProps.colors?.secondary || "#818cf8",
              backgroundColor:
                template.customizableProps.colors?.background || "#1e1b4b",
              animationSpeed: template.customizableProps.animations?.speed || 1,
              ...(template.customizableProps.extras || {}),
            }}
            schema={{
              title: {
                type: "string",
                description: "العنوان الرئيسي",
                defaultValue:
                  template.customizableProps.text?.title || "عنوان افتراضي",
              },
              subtitle: {
                type: "string",
                description: "العنوان الفرعي",
                defaultValue:
                  template.customizableProps.text?.subtitle || "عنوان فرعي",
              },
              description: {
                type: "string",
                description: "ال��صف",
                defaultValue:
                  template.customizableProps.text?.description || "وصف افتراضي",
              },
              primaryColor: {
                type: "string",
                description: "ال��ون الأساسي",
                defaultValue:
                  template.customizableProps.colors?.primary || "#4338ca",
              },
              secondaryColor: {
                type: "string",
                description: "اللون الثانوي",
                defaultValue:
                  template.customizableProps.colors?.secondary || "#818cf8",
              },
              backgroundColor: {
                type: "string",
                description: "لون الخلفية",
                defaultValue:
                  template.customizableProps.colors?.background || "#1e1b4b",
              },
              animationSpeed: {
                type: "number",
                description: "سرعة الحركة",
                defaultValue: template.customizableProps.animations?.speed || 1,
                min: 0.1,
                max: 3,
                step: 0.1,
              },
              // إضافة الخصائص الإضافية ديناميكياً
              ...(template.customizableProps.extras
                ? Object.fromEntries(
                    Object.entries(template.customizableProps.extras).map(
                      ([key, value]) => [
                        key,
                        {
                          type: typeof value === "number" ? "number" : "string",
                          description: key,
                          defaultValue: value,
                        },
                      ],
                    ),
                  )
                : {}),
            }}
          />
        );
      })}

      {/* قوالب تجريبية إضافية */}
      <Composition
        id="ExperimentalTemplate"
        component={ExperimentalTemplate}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          message: "قالب تجريبي للاختبار",
          intensity: 1,
        }}
        schema={{
          message: {
            type: "string",
            description: "رسالة مخصصة",
            defaultValue: "قالب تجريبي للاختبار",
          },
          intensity: {
            type: "number",
            description: "شدة التأثير",
            defaultValue: 1,
            min: 0.1,
            max: 5,
            step: 0.1,
          },
        }}
      />
    </>
  );
};

// قالب تجريبي للاختبار
const ExperimentalTemplate: React.FC<{
  message: string;
  intensity: number;
}> = ({ message, intensity }) => {
  const { useCurrentFrame, interpolate, AbsoluteFill } = require("remotion");
  const frame = useCurrentFrame();

  const rotation = interpolate(frame, [0, 300], [0, 360 * intensity]);
  const scale = 1 + Math.sin(frame * 0.1 * intensity) * 0.3;

  return (
    <AbsoluteFill
      style={{
        background: `hsl(${frame * 2}, 70%, 20%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cairo, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 80,
          color: "white",
          transform: `rotate(${rotation}deg) scale(${scale})`,
          textAlign: "center",
          textShadow: "0 0 30px rgba(255,255,255,0.5)",
          direction: "rtl",
        }}
      >
        {message}
      </div>
    </AbsoluteFill>
  );
};
