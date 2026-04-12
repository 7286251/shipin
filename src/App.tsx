import React, { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { extractFrames } from './lib/videoUtils';
import { analyzeVideoFrames } from './services/geminiService';
import { VideoAnalysisResult, ExtractedFrame } from './types';
import { Loader2, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = async (file: File, numFrames: number) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setFrames([]);

    try {
      setProgressText('正在提取视频关键分镜...');
      const extractedData = await extractFrames(file, numFrames);
      
      const extractedFrames: ExtractedFrame[] = extractedData.map((data, index) => ({
        id: `frame-${index}`,
        base64: data.base64,
        dataUrl: `data:image/jpeg;base64,${data.base64}`,
        highResBlobUrl: data.highResBlobUrl
      }));
      setFrames(extractedFrames);

      setProgressText('AI 正在深度分析镜头语言与视觉风格...');
      const base64Frames = extractedData.map(d => d.base64);
      const analysisResult = await analyzeVideoFrames(base64Frames);
      setResult(analysisResult);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '处理视频时发生错误');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="min-h-screen neo-bg text-pink-900 font-sans selection:bg-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-5 neo-outset rounded-3xl mb-8"
          >
            <Film className="w-12 h-12 text-pink-400" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-pink-600 mb-6"
          >
            视频分析提示词生成器
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-pink-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            智能分析视频内容，自动提取关键分镜。深度解析镜头语言、叙事手法和视觉风格，一键生成专业的AI视频提示词，释放您的创作灵感。
          </motion.p>
        </div>

        {/* Main Content */}
        {!result && (
          <VideoUploader onVideoSelect={handleVideoSelect} isLoading={isProcessing} />
        )}

        {/* Loading State */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 flex flex-col items-center justify-center p-16 neo-outset rounded-[40px] max-w-3xl mx-auto"
            >
              <Loader2 className="w-16 h-16 text-pink-400 animate-spin mb-8" />
              <h3 className="text-2xl font-bold text-pink-600">{progressText}</h3>
              <p className="text-pink-400 mt-3 font-medium">这可能需要几分钟时间，请耐心等待</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-8 neo-inset rounded-3xl text-center max-w-3xl mx-auto"
          >
            <p className="text-pink-600 text-lg font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-6 px-8 py-3 neo-button text-pink-600 font-bold rounded-xl"
            >
              重试
            </button>
          </motion.div>
        )}

        {/* Results */}
        {result && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-center mb-10">
              <button 
                onClick={() => { setResult(null); setFrames([]); }}
                className="px-8 py-3 neo-button text-pink-600 font-bold rounded-xl"
              >
                分析新视频
              </button>
            </div>
            <AnalysisResults result={result} frames={frames} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
