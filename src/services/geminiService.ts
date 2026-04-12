import { GoogleGenAI, Type } from "@google/genai";
import { VideoAnalysisResult } from "../types";

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
请分析提供的视频关键帧，并生成一份详细的分析报告和专业的AI视频生成提示词。

请以JSON格式返回结果，包含以下字段：
1. scenes: 场景分析数组，每个场景包含：
   - timestamp: 场景描述（如 "场景 1"）
   - cameraLanguage: 镜头语言（景别、运镜、角度等）
   - narrative: 叙事手法（动作、情绪、情节推进）
   - visualStyle: 视觉风格（光影、色彩、构图）
2. overallPrompt: 综合生成的专业AI视频提示词（英文，包含主题、环境、光影、摄像机运动、风格等细节，适合Midjourney/Runway/Sora等AI工具）
3. overallPromptZh: overallPrompt的中文翻译
4. summary: 视频整体风格总结（中文）
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
          overallPromptZh: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["scenes", "overallPrompt", "overallPromptZh", "summary"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis");
  }

  return JSON.parse(response.text) as VideoAnalysisResult;
};
