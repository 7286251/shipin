import React, { useState } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { ImageBatchUploader } from './components/ImageBatchUploader';
import { ImageAnalysisResults } from './components/ImageAnalysisResults';
import { extractFrames } from './lib/videoUtils';
import { fileToBase64 } from './lib/imageUtils';
import { analyzeVideoFrames, analyzeImages } from './services/geminiService';
import { VideoAnalysisResult, ExtractedFrame, ImageAnalysisResult } from './types';
import { Loader2, Film, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [mode, setMode] = useState<'video' | 'image'>('video');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  
  // Video State
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Image State
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = async (file: File, numFrames: number) => {
    setIsProcessing(true);
    setError(null);
    setVideoResult(null);
    setFrames([]);
    setVideoFile(file);

    try {
      setProgressText('正在初始化视频处理...');
      const extractedData = await extractFrames(file, numFrames, (current, total) => {
        setProgressText(`正在精准提取第 ${current}/${total} 帧...`);
      });
      
      const extractedFrames: ExtractedFrame[] = extractedData.map((data, index) => ({
        id: `frame-${index}`,
        base64: data.base64,
        dataUrl: `data:image/jpeg;base64,${data.base64}`,
        highResBlobUrl: data.highResBlobUrl
      }));
      setFrames(extractedFrames);

      setProgressText('AI 正在深度解析镜头语言与视觉风格...');
      const base64Frames = extractedData.map(d => d.base64);
      const analysisResult = await analyzeVideoFrames(base64Frames);
      setVideoResult(analysisResult);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '处理视频时发生错误');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleImagesSelect = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setImageResult(null);

    try {
      setProgressText(`正在处理 ${files.length} 张图片...`);
      const base64Images: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgressText(`正在读取第 ${i + 1}/${files.length} 张图片...`);
        const base64 = await fileToBase64(files[i]);
        base64Images.push(base64);
      }

      setProgressText('AI 正在深度拆解图像元素并反推 Prompt...');
      const analysisResult = await analyzeImages(base64Images);
      setImageResult(analysisResult);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '处理图片时发生错误');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <div className="min-h-screen brutal-bg text-black font-sans selection:bg-[#FFC900]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-5 brutal-card bg-[#FFC900] mb-8"
          >
            {mode === 'video' ? <Film className="w-12 h-12 text-black" /> : <ImageIcon className="w-12 h-12 text-black" />}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tighter text-black mb-6 uppercase"
          >
            {mode === 'video' ? '视频分析提示词生成器' : '多图精准反推提示词'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-black max-w-2xl mx-auto font-bold leading-relaxed bg-white p-4 brutal-border brutal-shadow-sm"
          >
            {mode === 'video' 
              ? '智能分析视频内容，自动提取关键分镜。深度解析镜头语言、叙事手法和视觉风格，一键生成专业的AI视频提示词。'
              : '上传10-20张参考图，AI深度拆解风格、动作、着装、发型、脸部等核心元素，反推1:1精准Prompt，适配豆包、即梦等主流大模型。'}
          </motion.p>
        </div>

        {/* Mode Toggle */}
        {!isProcessing && !videoResult && !imageResult && (
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => setMode('video')} 
              className={`px-8 py-4 font-black uppercase text-xl transition-all ${mode === 'video' ? 'brutal-button bg-[#FF90E8]' : 'brutal-button-secondary'}`}
            >
              视频分镜分析
            </button>
            <button 
              onClick={() => setMode('image')} 
              className={`px-8 py-4 font-black uppercase text-xl transition-all ${mode === 'image' ? 'brutal-button bg-[#90FFA9]' : 'brutal-button-secondary'}`}
            >
              多图精准反推
            </button>
          </div>
        )}

        {/* Main Content */}
        {!videoResult && !imageResult && mode === 'video' && (
          <VideoUploader onVideoSelect={handleVideoSelect} isLoading={isProcessing} />
        )}

        {!videoResult && !imageResult && mode === 'image' && (
          <ImageBatchUploader onImagesSelect={handleImagesSelect} isLoading={isProcessing} />
        )}

        {/* Loading State */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 flex flex-col items-center justify-center p-16 brutal-card bg-white max-w-3xl mx-auto"
            >
              <Loader2 className="w-16 h-16 text-black animate-spin mb-8" />
              <h3 className="text-3xl font-black text-black uppercase">{progressText}</h3>
              <p className="text-black mt-3 font-bold bg-[#90FFA9] px-4 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">这可能需要几分钟时间，请耐心等待</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && !isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-8 brutal-card bg-white text-center max-w-3xl mx-auto"
          >
            <p className="text-black text-xl font-bold">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-6 px-8 py-4 brutal-button text-xl"
            >
              重试
            </button>
          </motion.div>
        )}

        {/* Results */}
        {videoResult && !isProcessing && mode === 'video' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-center mb-10">
              <button 
                onClick={() => { setVideoResult(null); setFrames([]); setVideoFile(null); }}
                className="px-8 py-4 brutal-button text-xl"
              >
                分析新视频
              </button>
            </div>
            <AnalysisResults result={videoResult} frames={frames} videoFile={videoFile} />
          </motion.div>
        )}

        {imageResult && !isProcessing && mode === 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-center mb-10">
              <button 
                onClick={() => { setImageResult(null); }}
                className="px-8 py-4 brutal-button text-xl"
              >
                返回首页
              </button>
            </div>
            <ImageAnalysisResults result={imageResult} />
          </motion.div>
        )}

      </div>
    </div>
  );
}
