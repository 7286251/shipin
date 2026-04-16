import { GoogleGenAI, Type } from "@google/genai";
import { VideoAnalysisResult, ImageAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeVideoFrames = async (framesBase64: string[]): Promise<VideoAnalysisResult> => {
  const parts = framesBase64.map(frame => ({
    inlineData: {
      data: frame,
      mimeType: 'image/jpeg'
    }
  }));

  const prompt = `
你是一个专业的视频分析师和AI提示词工程师。
请快速分析提供的视频关键帧，并生成一份详细的分析报告和专业的AI视频生成提示词。

特别要求：请严格按照提供的关键帧数量（共 ${framesBase64.length} 张），逐一生成对应数量的场景分析。必须且只能生成 ${framesBase64.length} 个场景。

请以JSON格式返回结果，包含以下字段：
1. scenes: 场景分析数组（必须包含 ${framesBase64.length} 个元素），每个场景包含：
   - timestamp: 场景描述（如 "场景 1"）
   - cameraLanguage: 镜头语言（景别、运镜、角度等）
   - narrative: 叙事手法（动作、情绪、情节推进）
   - visualStyle: 视觉风格（光影、色彩、构图）
2. overallPrompt: 综合生成的专业AI视频提示词（英文，包含主题、环境、光影、摄像机运动、风格等细节，适合Midjourney/Runway/Sora等AI工具）
3. overallPromptZh: overallPrompt的中文翻译
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        ...parts
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                cameraLanguage: { type: Type.STRING },
                narrative: { type: Type.STRING },
                visualStyle: { type: Type.STRING }
              },
              required: ["timestamp", "cameraLanguage", "narrative", "visualStyle"]
            }
          },
          overallPrompt: { type: Type.STRING },
          overallPromptZh: { type: Type.STRING }
        },
        required: ["scenes", "overallPrompt", "overallPromptZh"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis");
  }

  return JSON.parse(response.text) as VideoAnalysisResult;
};

export const analyzeImages = async (imagesBase64: string[]): Promise<ImageAnalysisResult> => {
  const parts = imagesBase64.map(img => ({
    inlineData: {
      data: img,
      mimeType: 'image/jpeg'
    }
  }));

  const prompt = `
你是一个顶级的AI绘画提示词工程师和图像解析专家。
请深度分析我提供的 ${imagesBase64.length} 张参考图，精准拆解图片里的所有核心元素，并反推生成一套最接近原图风格的1:1专业Prompt。
这套Prompt需要高度适配目前排名前10的生图大模型（如：豆包、即梦、Midjourney、Stable Diffusion等），方便用户一键复制进行二创生图。

特别要求：
1. 反推的精准Prompt必须极其详细、丰富、充满自信，字数在500词左右。要像大师一样描绘每一个光影、材质、构图、氛围和人物细节。
2. 图像元素深度拆解和模型适配建议需要同时提供英文版和中文版。

请以JSON格式返回结果，包含以下字段：
1. elementDeconstruction: 图像元素深度拆解（英文版），必须包含以下子字段：
   - style: 整体风格
   - action: 人物动作/姿态
   - clothing: 着装/服饰细节
   - hairstyle: 发型细节
   - facialFeatures: 脸部/面部特征
   - environment: 环境/背景/光影
2. elementDeconstructionZh: 图像元素深度拆解（中文版），字段同上
3. precisePrompt: 反推的精准英文提示词（500词左右，极其详细丰富，1:1还原）
4. precisePromptZh: precisePrompt的中文翻译
5. modelRecommendations: 模型适配建议（英文版，简述这套提示词在豆包、即梦等主流模型上的使用建议或参数设置）
6. modelRecommendationsZh: 模型适配建议（中文版）
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        ...parts
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          elementDeconstruction: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING },
              action: { type: Type.STRING },
              clothing: { type: Type.STRING },
              hairstyle: { type: Type.STRING },
              facialFeatures: { type: Type.STRING },
              environment: { type: Type.STRING }
            },
            required: ["style", "action", "clothing", "hairstyle", "facialFeatures", "environment"]
          },
          elementDeconstructionZh: {
            type: Type.OBJECT,
            properties: {
              style: { type: Type.STRING },
              action: { type: Type.STRING },
              clothing: { type: Type.STRING },
              hairstyle: { type: Type.STRING },
              facialFeatures: { type: Type.STRING },
              environment: { type: Type.STRING }
            },
            required: ["style", "action", "clothing", "hairstyle", "facialFeatures", "environment"]
          },
          precisePrompt: { type: Type.STRING },
          precisePromptZh: { type: Type.STRING },
          modelRecommendations: { type: Type.STRING },
          modelRecommendationsZh: { type: Type.STRING }
        },
        required: ["elementDeconstruction", "elementDeconstructionZh", "precisePrompt", "precisePromptZh", "modelRecommendations", "modelRecommendationsZh"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate image analysis");
  }

  return JSON.parse(response.text) as ImageAnalysisResult;
};
