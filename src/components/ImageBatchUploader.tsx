import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageBatchUploaderProps {
  onImagesSelect: (files: File[]) => void;
  isLoading: boolean;
}

export const ImageBatchUploader: React.FC<ImageBatchUploaderProps> = ({ onImagesSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = (files: FileList | File[]) => {
    setError(null);
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setError('请上传有效的图片文件 (JPG, PNG 等)');
      return;
    }
    
    const newFiles = [...selectedFiles, ...validFiles].slice(0, 20); // Max 20 images
    setSelectedFiles(newFiles);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [selectedFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Reset input so the same files can be selected again if needed
    e.target.value = '';
  }, [selectedFiles]);

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = () => {
    if (selectedFiles.length < 10) {
      setError('为了保证分析质量，建议至少上传 10 张图片 (当前 ' + selectedFiles.length + ' 张)');
      // We still allow them to proceed if they really want, but show a warning.
      // Actually, let's enforce it or just warn. Let's enforce min 1 for now, but warn if < 10.
      if (selectedFiles.length === 0) {
        setError('请至少上传 1 张图片');
        return;
      }
    }
    onImagesSelect(selectedFiles);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative brutal-card p-12 text-center transition-all duration-300 ease-in-out ${
          isDragging ? 'bg-[#90FFA9] translate-x-[4px] translate-y-[4px] shadow-none' : 'bg-[#80C6FF]'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
          disabled={isLoading || selectedFiles.length >= 20}
        />
        
        <div className="flex flex-col items-center justify-center space-y-6 relative z-0">
          <div className="p-6 brutal-border bg-white rounded-full brutal-shadow-sm">
            <ImageIcon className="w-12 h-12 text-black" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-black uppercase tracking-tight">批量上传参考图</h3>
            <p className="text-black mt-3 font-bold text-lg">支持 10-20 张图片，精准反推 1:1 Prompt</p>
            <p className="text-black bg-white inline-block px-3 py-1 border-2 border-black mt-4 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              已选择 {selectedFiles.length}/20 张
            </p>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-5 brutal-card bg-[#FF5C5C] flex items-center text-black"
        >
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 text-black" />
          <p className="font-bold">{error}</p>
        </motion.div>
      )}

      {selectedFiles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card bg-white p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-2xl font-black text-black uppercase">已选图片预览</h4>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-black font-bold underline hover:text-[#FF5C5C]"
              disabled={isLoading}
            >
              清空全部
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative aspect-square brutal-border bg-[#f0f0f0] group">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
                <button
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                  className="absolute -top-2 -right-2 bg-[#FF5C5C] text-black brutal-border p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 bg-black text-white text-xs font-bold px-2 py-1 w-full truncate">
                  {file.name}
                </div>
              </div>
            ))}
            
            {selectedFiles.length < 20 && (
              <div className="relative aspect-square brutal-border bg-[#f0f0f0] flex items-center justify-center border-dashed hover:bg-[#90FFA9] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInput}
                  disabled={isLoading}
                />
                <Upload className="w-8 h-8 text-black opacity-50" />
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isLoading || selectedFiles.length === 0}
            className="w-full py-4 brutal-button text-xl flex items-center justify-center uppercase"
          >
            开始深度解析并反推 Prompt
          </button>
        </motion.div>
      )}
    </div>
  );
};
