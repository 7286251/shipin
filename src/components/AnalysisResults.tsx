import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoAnalysisResult, ExtractedFrame } from '../types';
import { Sparkles, Download, FileText, Film, Copy, Check, X, Loader2, Users } from 'lucide-react';

interface AnalysisResultsProps {
  result: VideoAnalysisResult;
  frames: ExtractedFrame[];
  videoFile: File | null;
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
      className="brutal-button-secondary p-2 rounded-none text-black hover:text-black flex-shrink-0"
      title="复制"
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  );
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, frames, videoFile }) => {
  const [isZhPrompt, setIsZhPrompt] = useState(false);
  const [downloadModal, setDownloadModal] = useState<{ isOpen: boolean, frameIndex: number | null, blobUrl: string | null }>({ isOpen: false, frameIndex: null, blobUrl: null });
  const [dlFormat, setDlFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [dlResolution, setDlResolution] = useState<'original' | '1080' | '1440' | '2160'>('original');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = () => {
    const reportContent = `
视频分析报告
===================

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-4xl font-black text-black flex items-center uppercase tracking-tight">
          <Sparkles className="w-10 h-10 mr-3 text-black" />
          分析报告
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-6 py-3 brutal-button-secondary text-black font-black"
          >
            <Download className="w-6 h-6 mr-2" />
            下载完整报告
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-8 bg-[#90FFA9] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-40 h-40 text-black" />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-4">
            <h3 className="text-2xl font-black text-black flex items-center uppercase">
              <Sparkles className="w-8 h-8 mr-2 text-black" />
              专业AI视频提示词 (Prompt)
            </h3>
            <button 
              onClick={() => setIsZhPrompt(!isZhPrompt)}
              className="brutal-button-secondary px-4 py-2 text-sm text-black font-black uppercase"
            >
              {isZhPrompt ? '显示英文' : '中文翻译'}
            </button>
          </div>
          <CopyBtn text={isZhPrompt ? result.overallPromptZh : result.overallPrompt} />
        </div>
        <div className="brutal-border bg-white p-6 font-mono text-lg text-black leading-relaxed break-words relative z-10 font-bold">
          {isZhPrompt ? result.overallPromptZh : result.overallPrompt}
        </div>
      </motion.div>

      <div className="space-y-8">
        <h3 className="text-4xl font-black text-black mt-16 mb-8 px-2 uppercase tracking-tight">关键分镜分析</h3>
        {result.scenes.map((scene, index) => {
          const combinedText = `镜头语言：${scene.cameraLanguage}\n叙事手法：${scene.narrative}\n视觉风格：${scene.visualStyle}`;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="brutal-card bg-white flex flex-col md:flex-row p-6 gap-8"
            >
              <div className="md:w-1/3 brutal-border bg-[#f0f0f0] overflow-hidden relative group">
                {frames[index] ? (
                  <>
                    <img 
                      src={frames[index].dataUrl} 
                      alt={`Frame ${index + 1}`} 
                      className="w-full h-full object-cover aspect-video"
                    />
                    <button 
                      onClick={() => openDownloadModal(frames[index].highResBlobUrl, index)}
                      className="absolute bottom-3 right-3 brutal-button-secondary p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="下载预览图"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full aspect-video flex items-center justify-center text-black">
                    <Film className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#FFC900] brutal-border text-black font-black text-sm px-4 py-2 uppercase">
                  {scene.timestamp}
                </div>
              </div>
              
              <div className="md:w-2/3 flex flex-col">
                <div className="brutal-border p-6 bg-[#f8f8f8] flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-xl font-black text-black uppercase tracking-wider flex items-center">
                      <FileText className="w-6 h-6 mr-2" />
                      分镜综合分析
                    </h4>
                    <CopyBtn text={combinedText} />
                  </div>
                  <div className="space-y-6 text-black text-lg leading-relaxed">
                    <p><strong className="text-black bg-[#FF90E8] px-2 py-1 brutal-border inline-block mb-2 font-black">镜头语言</strong><br/><span className="font-bold">{scene.cameraLanguage}</span></p>
                    <p><strong className="text-black bg-[#80C6FF] px-2 py-1 brutal-border inline-block mb-2 font-black">叙事手法</strong><br/><span className="font-bold">{scene.narrative}</span></p>
                    <p><strong className="text-black bg-[#90FFA9] px-2 py-1 brutal-border inline-block mb-2 font-black">视觉风格</strong><br/><span className="font-bold">{scene.visualStyle}</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {downloadModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="brutal-card bg-white p-10 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-black uppercase">下载预览图设置</h3>
                <button onClick={() => setDownloadModal({ isOpen: false, frameIndex: null, blobUrl: null })} className="text-black hover:bg-[#FF5C5C] brutal-border p-1 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-black text-black mb-4 uppercase">图片格式</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDlFormat('jpeg')}
                      className={`flex-1 py-3 font-black uppercase transition-all ${dlFormat === 'jpeg' ? 'brutal-button bg-[#FF90E8]' : 'brutal-button-secondary'}`}
                    >
                      JPG
                    </button>
                    <button 
                      onClick={() => setDlFormat('png')}
                      className={`flex-1 py-3 font-black uppercase transition-all ${dlFormat === 'png' ? 'brutal-button bg-[#FF90E8]' : 'brutal-button-secondary'}`}
                    >
                      PNG (无损)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-black text-black mb-4 uppercase">分辨率</label>
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
                        className={`py-3 font-black uppercase transition-all ${dlResolution === res.id ? 'brutal-button bg-[#90FFA9]' : 'brutal-button-secondary'}`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={executeDownload}
                  disabled={isDownloading}
                  className="w-full py-4 mt-8 brutal-button text-xl flex items-center justify-center"
                >
                  {isDownloading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Download className="w-6 h-6 mr-3" />}
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
