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
  summary: string;
}

export interface ExtractedFrame {
  id: string;
  base64: string;
  dataUrl: string;
  highResBlobUrl: string;
}
