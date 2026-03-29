
import React, { useState } from 'react';
import { ViralScript, Scene } from '../types';
import { ClipboardDocumentIcon, CheckIcon, VideoCameraIcon, PhotoIcon, FireIcon, ArrowTopRightOnSquareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { downloadImage } from '../services/downloadService';

interface OutputSectionProps {
  data: ViralScript | null;
  loading: boolean;
  loadingStatus?: string;
}

export const OutputSection: React.FC<OutputSectionProps> = ({ data, loading, loadingStatus }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyHeader = () => {
    if (!data) return;
    const textToCopy = `${data.title}\n\n${data.hashtags.join(' ')}`;
    handleCopy(textToCopy, 'header');
  };

  if (loading && !data) {
    return (
      <div className="w-full lg:w-1/2 bg-[#07070e] p-8 flex flex-col items-center justify-center space-y-6 border-l border-border h-1/2 lg:h-full min-h-[300px] overflow-y-auto custom-scrollbar">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-[#0066ff]/10 border-t-[#0066ff] rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">
            ⚡
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">กำลังสร้าง...</h3>
          <p className="text-gray-400 font-medium italic">"{loadingStatus || 'กำลังสร้างเนื้อหา...'}"</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full lg:w-1/2 bg-[#07070e] p-8 flex flex-col items-center justify-center text-center border-l border-border h-1/2 lg:h-full min-h-[300px] overflow-y-auto custom-scrollbar">
        <div className="w-32 h-32 bg-card rounded-3xl flex items-center justify-center mb-6 border-2 border-dashed border-border transform rotate-3">
            <FireIcon className="w-16 h-16 text-gray-700" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">ยินดีต้อนรับสู่ Autodraw Pro</h3>
        <p className="text-gray-400 max-w-sm leading-relaxed mb-12">
          เลือกของและอารมณ์ที่ต้องการทางด้านซ้าย แล้วรอดูการวาดภาพประกอบและสคริปต์ที่นี่
        </p>
        
        {/* Footer for Empty State */}
        <div className="mt-auto pt-8 border-t border-border/50 w-full max-w-md text-center">
          <p className="text-slate-300 text-sm font-medium leading-relaxed">
            🔥 ถ้าชอบอย่าลืมกดติดตามและแชร์ต่อเพื่อเป็นกำลังใจ ชอบเครื่องมือ AI เจ๋งๆ <br />แบบนี้ติดตามต่อได้ที่{' '}
            <a 
              href="https://www.facebook.com/ByteVerseAI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300 transition-all font-bold"
            >
              Facebook: ByteVerse AI
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 bg-[#05050a] border-l border-border h-1/2 lg:h-full overflow-y-auto custom-scrollbar">
      <div className="p-8 space-y-10 flex flex-col min-h-full">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-card to-[#070e20] rounded-3xl p-8 border border-border shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FireIcon className="w-64 h-64 text-[#0066ff]" />
           </div>
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
               <span className="bg-[#0066ff] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase inline-block">Pro Content</span>
               <button 
                 onClick={copyHeader}
                 className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-xl border border-white/10 transition-all flex items-center gap-2 text-xs font-bold"
                 title="Copy Title + Hashtags"
               >
                 {copiedId === 'header' ? (
                   <><CheckIcon className="w-4 h-4 text-green-500" /> คัดลอกแล้ว!</>
                 ) : (
                   <><ClipboardDocumentIcon className="w-4 h-4" /> คัดลอกหัวเรื่อง</>
                 )}
               </button>
             </div>
             
             <h2 className="text-4xl font-black text-white mb-6 leading-tight">
               {data.title}
             </h2>
             <div className="flex flex-wrap gap-2">
               {data.hashtags.map((tag, idx) => (
                 <span key={idx} className="bg-white/5 text-gray-300 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 hover:border-[#0066ff]/50 transition-colors cursor-default">
                   {tag}
                 </span>
               ))}
             </div>
           </div>
        </div>

        {/* Loading Progress for Images */}
        {loading && loadingStatus && (
          <div className="flex items-center gap-4 bg-[#0066ff]/10 p-4 rounded-2xl border border-[#0066ff]/20 animate-pulse">
            <div className="w-5 h-5 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#00aaff] text-sm font-bold">{loadingStatus}</span>
          </div>
        )}

        {/* Scenes List */}
        <div className="space-y-16">
          {data.scenes.map((scene: Scene) => (
            <div key={scene.scene_number} className="group relative">
               {/* Disclaimer for Text Rendering */}
               {scene.scene_number === 1 && scene.image_url && (
                 <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-center gap-3">
                   <span className="text-lg">⚠️</span>
                   <p className="text-[10px] text-yellow-500/80 font-bold leading-tight">
                     AI อาจจะยังวาดตัวอักษรภาษาไทยได้ไม่สมบูรณ์ 100% (อาจมีสระหายหรือเพี้ยน) <br />
                     แนะนำให้ใช้ภาพเป็นพื้นหลังแล้วนำไปใส่ข้อความเองในแอปตัดต่อเพื่อความสวยงามครับ
                   </p>
                 </div>
               )}
               {/* Connector Line */}
               {scene.scene_number !== data.scenes.length && (
                 <div className="absolute left-10 top-20 bottom-[-64px] w-1 bg-gradient-to-b from-[#0066ff]/40 to-transparent -z-10"></div>
               )}

               <div className="flex flex-col md:flex-row gap-8">
                 {/* Scene Number Badge & Image */}
                 <div className="flex-shrink-0 space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0055dd] to-[#00aaff] flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-[#0066ff]/20 transform group-hover:scale-110 transition-transform">
                      {scene.scene_number}
                    </div>
                    
                    {/* Generated Image Preview */}
                    <div className="w-48 aspect-[9/16] bg-card rounded-2xl border border-border overflow-hidden relative group/img shadow-xl">
                      {scene.scene_number === 1 && data.includeHeadline && (
                        <div className="absolute top-2 left-2 z-20 bg-[#0066ff] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase shadow-lg">
                          Headline
                        </div>
                      )}
                      {scene.image_url ? (
                        <>
                          <img 
                            src={scene.image_url} 
                            alt={`Scene ${scene.scene_number}`} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <a 
                              href="https://labs.google/fx/th/tools/flow"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#0066ff] hover:bg-[#0055dd] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all"
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4" /> สร้างวิดีโอใน Flow
                            </a>
                            <button 
                              onClick={() => downloadImage(scene.image_url!, `autodraw-scene-${scene.scene_number}.png`)}
                              className="text-white font-bold text-xs flex items-center gap-1 hover:text-[#00aaff] transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" /> ดาวน์โหลดรูปภาพ
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-4 text-center">
                          <PhotoIcon className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-40">
                            {loading ? 'Drawing...' : 'No Image'}
                          </span>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Content Card */}
                 <div className="flex-grow space-y-6 w-full">
                    
                    {/* Image Prompt */}
                    <PromptBox 
                      label="พ้อมต์รูปภาพ"
                      icon={<PhotoIcon className="w-5 h-5" />}
                      content={scene.image_prompt}
                      onCopy={() => handleCopy(scene.image_prompt, `img-${scene.scene_number}`)}
                      isCopied={copiedId === `img-${scene.scene_number}`}
                    />

                    {/* Video Master Prompt */}
                    <PromptBox 
                      label="พ้อมต์หลัก (สำหรับ Video AI)"
                      icon={<VideoCameraIcon className="w-5 h-5" />}
                      content={scene.video_prompt}
                      onCopy={() => handleCopy(scene.video_prompt, `vid-${scene.scene_number}`)}
                      isCopied={copiedId === `vid-${scene.scene_number}`}
                      isHighlight
                    />
                  </div>
               </div>
            </div>
          ))}
        </div>
        
        {/* Pro Tip Box */}
        <div className="bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-3xl p-8 text-center border-dashed">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-[#0066ff]/10 rounded-full mb-4">
                <FireIcon className="w-6 h-6 text-[#0066ff]" />
             </div>
             <p className="text-gray-300 text-sm leading-relaxed max-w-lg mx-auto">
                <strong className="text-[#0066ff]">Pro Tip:</strong> ก๊อปปี้ <span className="font-bold">The Master Prompt</span> ไปวางในเครื่องมืออย่าง <span className="underline">Flow</span>, <span className="underline">Gemini</span> หรือ <span className="underline">Grok</span> ได้เลย ทุกอย่างพร้อมทำคลิปแล้ว!
             </p>
        </div>

        {/* Footer Section - Positioned at bottom center with line */}
        <div className="mt-auto pt-10 pb-6 text-center border-t border-border/50">
          <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-2xl mx-auto">
            🔥 ถ้าชอบอย่าลืมกดติดตามและแชร์ต่อเพื่อเป็นกำลังใจ ชอบเครื่องมือ AI เจ๋งๆ <br />แบบนี้ติดตามต่อได้ที่{' '}
            <a 
              href="https://www.facebook.com/ByteVerseAI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300 transition-all font-bold"
            >
              Facebook: ByteVerse AI
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

const PromptBox = ({ 
    label, 
    icon, 
    content, 
    onCopy, 
    isCopied, 
    isHighlight = false 
}: { 
    label: string, 
    icon: React.ReactNode, 
    content: string, 
    onCopy: () => void, 
    isCopied: boolean,
    isHighlight?: boolean
}) => (
  <div className={`rounded-2xl border transition-all duration-500 overflow-hidden shadow-lg ${isHighlight ? 'bg-[#0a1125] border-[#0066ff]/40 hover:border-[#0066ff] ring-1 ring-[#0066ff]/10' : 'bg-card border-border hover:border-gray-500'}`}>
    <div className={`px-5 py-3 border-b flex justify-between items-center ${isHighlight ? 'bg-[#0066ff]/15 border-[#0066ff]/20' : 'bg-[#151726] border-border'}`}>
      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isHighlight ? 'text-[#00aaff]' : 'text-gray-400'}`}>
        {icon}
        {label}
      </div>
      <button 
        onClick={onCopy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
            isCopied 
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Copy to clipboard"
      >
        {isCopied ? (
            <>
                <CheckIcon className="w-4 h-4" />
                <span>เรียบร้อย</span>
            </>
        ) : (
            <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span>คัดลอก</span>
            </>
        )}
      </button>
    </div>
    <div className="p-5">
      <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isHighlight ? 'text-white font-medium' : 'text-gray-400'}`}>
        {content}
      </p>
    </div>
  </div>
);
