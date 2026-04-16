import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ImageAnalysisResult } from '../types';
import { Sparkles, Copy, Check, Layers, User, Shirt, Scissors, Smile, Image as ImageIcon, Cpu } from 'lucide-react';

interface ImageAnalysisResultsProps {
  result: ImageAnalysisResult;
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

export const ImageAnalysisResults: React.FC<ImageAnalysisResultsProps> = ({ result }) => {
  const [isZh, setIsZh] = useState(true);

  const deconstruction = isZh ? result.elementDeconstructionZh : result.elementDeconstruction;

  const deconstructionItems = [
    { icon: <Layers className="w-6 h-6" />, label: isZh ? '整体风格' : 'Style', value: deconstruction.style, color: 'bg-[#FF90E8]' },
    { icon: <User className="w-6 h-6" />, label: isZh ? '人物动作/姿态' : 'Action', value: deconstruction.action, color: 'bg-[#80C6FF]' },
    { icon: <Shirt className="w-6 h-6" />, label: isZh ? '着装/服饰细节' : 'Clothing', value: deconstruction.clothing, color: 'bg-[#90FFA9]' },
    { icon: <Scissors className="w-6 h-6" />, label: isZh ? '发型细节' : 'Hairstyle', value: deconstruction.hairstyle, color: 'bg-[#FFC900]' },
    { icon: <Smile className="w-6 h-6" />, label: isZh ? '脸部/面部特征' : 'Facial Features', value: deconstruction.facialFeatures, color: 'bg-[#FF90E8]' },
    { icon: <ImageIcon className="w-6 h-6" />, label: isZh ? '环境/背景/光影' : 'Environment', value: deconstruction.environment, color: 'bg-[#80C6FF]' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 mt-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-4xl font-black text-black flex items-center uppercase tracking-tight">
          <Sparkles className="w-10 h-10 mr-3 text-black" />
          深度解析报告
        </h2>
        <button 
          onClick={() => setIsZh(!isZh)}
          className="brutal-button-secondary px-6 py-3 text-lg text-black font-black uppercase"
        >
          {isZh ? 'Switch to English' : '切换至中文'}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card p-8 bg-[#FFC900] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles className="w-40 h-40 text-black" />
        </div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-4">
            <h3 className="text-2xl font-black text-black flex items-center uppercase">
              <Sparkles className="w-8 h-8 mr-2 text-black" />
              1:1 精准反推 Prompt
            </h3>
          </div>
          <CopyBtn text={isZh ? result.precisePromptZh : result.precisePrompt} />
        </div>
        <div className="brutal-border bg-white p-6 font-mono text-lg text-black leading-relaxed break-words relative z-10 font-bold">
          {isZh ? result.precisePromptZh : result.precisePrompt}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="brutal-card p-8 bg-white"
      >
        <h3 className="text-2xl font-black text-black mb-6 flex items-center uppercase">
          <Layers className="w-8 h-8 mr-2 text-black" />
          图像元素深度拆解
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deconstructionItems.map((item, index) => (
            <div key={index} className="brutal-border p-6 bg-[#f8f8f8] flex flex-col">
              <h4 className={`text-lg font-black text-black uppercase tracking-wider flex items-center mb-4 ${item.color} px-3 py-1 brutal-border inline-flex self-start`}>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </h4>
              <p className="text-black text-lg leading-relaxed font-bold flex-grow">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="brutal-card p-8 bg-[#90FFA9]"
      >
        <h3 className="text-2xl font-black text-black mb-4 flex items-center uppercase">
          <Cpu className="w-8 h-8 mr-2 text-black" />
          {isZh ? '模型适配建议' : 'Model Recommendations'}
        </h3>
        <div className="brutal-border p-6 bg-white">
          <p className="text-black leading-relaxed text-xl font-bold">{isZh ? result.modelRecommendationsZh : result.modelRecommendations}</p>
        </div>
      </motion.div>

    </div>
  );
};
