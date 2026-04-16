import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface VideoUploaderProps {
  onVideoSelect: (file: File, numFrames: number) => void;
  isLoading: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numFrames, setNumFrames] = useState(13);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file, numFrames);
    } else {
      setError('请上传有效的视频文件 (MP4, WebM, MOV等)');
    }
  }, [onVideoSelect, numFrames]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file, numFrames);
    } else if (file) {
      setError('请上传有效的视频文件 (MP4, WebM, MOV等)');
    }
  }, [onVideoSelect, numFrames]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative brutal-card p-16 text-center transition-all duration-300 ease-in-out ${
          isDragging ? 'bg-[#90FFA9] translate-x-[4px] translate-y-[4px] shadow-none' : 'bg-[#FF90E8]'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-6 brutal-border bg-white rounded-full brutal-shadow-sm">
            <Upload className="w-12 h-12 text-black" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-black uppercase tracking-tight">点击或拖拽上传视频</h3>
            <p className="text-black mt-3 font-bold text-lg">支持 MP4, WebM, MOV 等常见格式</p>
            <p className="text-black bg-white inline-block px-3 py-1 border-2 border-black mt-4 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">自动提取并分析人物特征</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`brutal-card bg-white p-8 max-w-md mx-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-black font-black flex items-center text-xl uppercase">
            <SlidersHorizontal className="w-6 h-6 mr-2" />
            提取分镜数量
          </h4>
          <span className="bg-[#FFC900] brutal-border px-4 py-1.5 text-black font-black">
            {numFrames} 张
          </span>
        </div>
        <input 
          type="range" 
          min="5" 
          max="20" 
          value={numFrames} 
          onChange={(e) => setNumFrames(Number(e.target.value))}
          className="w-full h-4 bg-[#f0f0f0] brutal-border appearance-none cursor-pointer accent-black"
          disabled={isLoading}
        />
        <div className="flex justify-between text-black font-bold mt-3">
          <span>5</span>
          <span>20</span>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-5 brutal-card bg-[#FF5C5C] flex items-center text-black"
        >
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 text-black" />
          <p className="font-bold">{error}</p>
        </motion.div>
      )}
    </div>
  );
};
