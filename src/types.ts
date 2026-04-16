export interface SceneAnalysis {
  timestamp: string;
  cameraLanguage: string;
  narrative: string;
  visualStyle: string;
}

export interface VideoAnalysisResult {
  scenes: SceneAnalysis[];
  overallPrompt: string;
  overallPromptZh: string;
}

export interface ExtractedFrame {
  id: string;
  base64: string;
  dataUrl: string;
  highResBlobUrl: string;
}

export interface ImageAnalysisResult {
  elementDeconstruction: {
    style: string;
    action: string;
    clothing: string;
    hairstyle: string;
    facialFeatures: string;
    environment: string;
  };
  elementDeconstructionZh: {
    style: string;
    action: string;
    clothing: string;
    hairstyle: string;
    facialFeatures: string;
    environment: string;
  };
  precisePrompt: string;
  precisePromptZh: string;
  modelRecommendations: string;
  modelRecommendationsZh: string;
}
