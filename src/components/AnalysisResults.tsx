import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoAnalysisResult, ExtractedFrame } from '../types';
import { Sparkles, Download, FileText, Film, Copy, Check, X, Loader2 } from 'lucide-react';

interface AnalysisResultsProps {
  result: VideoAnalysisResult;
  frames: ExtractedFrame[];
}

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="neo-button p-2 rounded-full text-pink-500 hover:text-pink-600 flex-shrink-0"
      title="复制"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, frames }) => {
  const [isZhPrompt, setIsZhPrompt] = useState(false);
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean, frameIndex: number | null, blobUrl: string | null }>({ isOpen: false, frameIndex: null, blobUrl: null });
  const [dlFormat, setDlFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [dlResolution, setDlResolution] = useState<'original' | '1080' | '1440' | '2160'>('original');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = () => {
    const reportContent = `
视频分析报告
===================

整体风格总结:
${result.summary}

专业AI视频提示词 (Prompt):
${result.overallPrompt}

中文翻译:
${result.overallPromptZh}

-------------------
分镜详细分析:
${result.scenes.map((scene, index) => `
场景 ${index + 1}: ${scene.timestamp}
- 镜头语言: ${scene.cameraLanguage}
- 叙事手法: ${scene.narrative}
- 视觉风格: ${scene.visualStyle}
`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_analysis_report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openDownloadModal = (blobUrl: string, index: number) => {
    setDownloadModal({ isOpen: true, frameIndex: index, blobUrl });
  };

  const executeDownload = async () => {
    if (downloadModal.frameIndex === null || !downloadModal.blobUrl) return;
    setIsDownloading(true);
    try {
      const img = new Image();
      img.src = downloadModal.blobUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let targetWidth = img.naturalWidth;
      let targetHeight = img.naturalHeight;
      const aspect = targetWidth / targetHeight;

      if (dlResolution !== 'original') {
        targetHeight = parseInt(dlResolution, 10);
        targetWidth = Math.round(targetHeight * aspect);
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        const mimeType = dlFormat === 'png' ? 'image/png' : 'image/jpeg';
        const quality = dlFormat === 'jpeg' ? 1.0 : undefined;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const resLabel = dlResolution === 'original' ? 'Original' : `${dlResolution}p`;
            a.download = `scene-${downloadModal.frameIndex! + 1}-${resLabel}.${dlFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          setIsDownloading(false);
          setDownloadModal({ isOpen: false, frameIndex: null, blobUrl: null });
        }, mimeType, quality);
      } else {
        setIsDownloading(false);
      }
    } catch (e) {
      console.error("Download failed", e);
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 mt-12 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-pink-600 flex items-center">
          <Sparkles className="w-8 h-8 mr-3 text-pink-400" />
          分析报告
        </h2>
        <button
          onClick={handleDownloadReport}
          className="flex items-center px-6 py-3 neo-button text-pink-600 font-medium rounded-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          下载完整报告
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neo-outset rounded-3xl p-8"
      >
        <h3 className="text-xl font-semibold text-pink-600 mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-pink-400" />
          整体风格总结
        </h3>
        <div className="neo-inset p-6 rounded-2xl">
          <p className="text-pink-800 leading-relaxed text-lg">{result.summary}</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neo-outset rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-32 h-32 text-pink-300" />
        </div>
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-pink-600 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-pink-400" />
              专业AI视频提示词 (Prompt)
            </h3>
            <button 
              onClick={() => setIsZhPrompt(!isZhPrompt)}
              className="neo-button px-4 py-1.5 rounded-full text-sm text-pink-600 font-medium"
            >
              {isZhPrompt ? '显示英文' : '中文翻译'}
            </button>
          </div>
          <CopyBtn text={isZhPrompt ? result.overallPromptZh : result.overallPrompt} />
        </div>
        <div className="neo-inset rounded-2xl p-6 font-mono text-sm text-pink-900 leading-relaxed break-words relative z-10">
          {isZhPrompt ? result.overallPromptZh : result.overallPrompt}
        </div>
      </motion.div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-pink-600 mt-12 mb-8 px-2">关键分镜分析</h3>
        {result.scenes.map((scene, index) => {
          const combinedText = `镜头语言：${scene.cameraLanguage}\n叙事手法：${scene.narrative}\n视觉风格：${scene.visualStyle}`;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="neo-outset rounded-3xl overflow-hidden flex flex-col md:flex-row p-4 gap-6"
            >
              <div className="md:w-1/3 neo-inset rounded-2xl overflow-hidden relative group">
                {frames[index] ? (
                  <>
                    <img 
                      src={frames[index].dataUrl} 
                      alt={`Frame ${index + 1}`} 
                      className="w-full h-full object-cover aspect-video opacity-90 transition-opacity group-hover:opacity-100"
                    />
                    <button 
                      onClick={() => openDownloadModal(frames[index].highResBlobUrl, index)}
                      className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md text-pink-600 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      title="下载预览图"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full aspect-video flex items-center justify-center text-pink-300">
                    <Film className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/60 backdrop-blur-md text-pink-700 font-medium text-xs px-3 py-1.5 rounded-full shadow-sm">
                  {scene.timestamp}
                </div>
              </div>
              
              <div className="md:w-2/3 flex flex-col">
                <div className="neo-inset p-6 rounded-2xl flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-bold text-pink-500 uppercase tracking-wider flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      分镜综合分析
                    </h4>
                    <CopyBtn text={combinedText} />
                  </div>
                  <div className="space-y-4 text-pink-900 text-sm leading-relaxed">
                    <p><strong className="text-pink-600 block mb-1">镜头语言：</strong>{scene.cameraLanguage}</p>
                    <p><strong className="text-pink-600 block mb-1">叙事手法：</strong>{scene.narrative}</p>
                    <p><strong className="text-pink-600 block mb-1">视觉风格：</strong>{scene.visualStyle}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {downloadModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="neo-outset bg-[#FFE4E6] p-8 rounded-3xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-pink-600">下载预览图设置</h3>
                <button onClick={() => setDownloadModal({ isOpen: false, frameIndex: null, blobUrl: null })} className="text-pink-400 hover:text-pink-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-pink-500 mb-3">图片格式</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDlFormat('jpeg')}
                      className={`flex-1 py-2 rounded-xl font-medium transition-all ${dlFormat === 'jpeg' ? 'neo-inset text-pink-600' : 'neo-outset text-pink-400'}`}
                    >
                      JPG
                    </button>
                    <button 
                      onClick={() => setDlFormat('png')}
                      className={`flex-1 py-2 rounded-xl font-medium transition-all ${dlFormat === 'png' ? 'neo-inset text-pink-600' : 'neo-outset text-pink-400'}`}
                    >
                      PNG (无损)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-pink-500 mb-3">分辨率</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'original', label: '原画 (Original)' },
                      { id: '1080', label: '1K (1080p)' },
                      { id: '1440', label: '2K (1440p)' },
                      { id: '2160', label: '4K (2160p)' }
                    ].map(res => (
                      <button 
                        key={res.id}
                        onClick={() => setDlResolution(res.id as any)}
                        className={`py-2 rounded-xl font-medium transition-all ${dlResolution === res.id ? 'neo-inset text-pink-600' : 'neo-outset text-pink-400'}`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={executeDownload}
                  disabled={isDownloading}
                  className="w-full py-3 mt-4 neo-button text-pink-600 font-bold rounded-xl flex items-center justify-center"
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                  {isDownloading ? '处理中...' : '确认下载'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
