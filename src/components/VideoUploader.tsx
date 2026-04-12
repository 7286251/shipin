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
  const [numFrames, setNumFrames] = useState(5);

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
        className={`relative rounded-3xl p-16 text-center transition-all duration-300 ease-in-out ${
          isDragging ? 'neo-inset border-2 border-pink-300' : 'neo-outset border-2 border-transparent'
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
          <div className="p-6 neo-outset rounded-full">
            <Upload className="w-10 h-10 text-pink-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-pink-600">点击或拖拽上传视频</h3>
            <p className="text-pink-400 mt-3 font-medium">支持 MP4, WebM, MOV 等常见格式</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`neo-inset rounded-3xl p-8 max-w-md mx-auto ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-pink-600 font-bold flex items-center">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            提取分镜数量
          </h4>
          <span className="neo-outset px-4 py-1.5 rounded-full text-pink-600 font-bold">
            {numFrames} 帧
          </span>
        </div>
        <input 
          type="range" 
          min="3" 
          max="10" 
          value={numFrames} 
          onChange={(e) => setNumFrames(Number(e.target.value))}
          className="w-full h-3 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
          disabled={isLoading}
        />
        <div className="flex justify-between text-pink-400 text-sm mt-3 font-medium">
          <span>3</span>
          <span>10</span>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-5 neo-inset rounded-2xl flex items-center text-pink-600"
        >
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 text-pink-500" />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}
    </div>
  );
};
