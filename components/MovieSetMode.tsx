
import React, { useState } from 'react';
import { generateMovieSetPrompt, generateImage } from '../services/geminiService';
import { SparklesIcon, TrashIcon, PhotoIcon, VideoCameraIcon, UserIcon, UsersIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

export const MovieSetMode: React.FC = () => {
  const [char1, setChar1] = useState('Harry Potter');
  const [char2, setChar2] = useState('Hermione Granger');
  const [mode, setMode] = useState<'ai_gen' | '1char' | '2chars'>('ai_gen');
  const [loading, setLoading] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState<string | null>(null);
  const [autoGenerateImage, setAutoGenerateImage] = useState(true);
  const [hasPaidKey, setHasPaidKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio?.hasSelectedApiKey) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasPaidKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio?.openSelectKey) {
      await aistudio.openSelectKey();
      setHasPaidKey(true);
    }
  };

  const handleGenerate = async () => {
    if (mode !== 'ai_gen' && !char1) return;
    if (mode === '2chars' && !char2) return;
    
    setLoading(true);
    setImageResult(null);
    setImagePrompt(null);
    setVideoPrompt(null);
    try {
      let concept = "";
      if (mode === 'ai_gen') {
        concept = "A mysterious unknown character";
      } else if (mode === '1char') {
        concept = char1;
      } else {
        concept = `${char1} and ${char2}`;
      }
      
      // Get a detailed prompt for the image
      const prompts = await generateMovieSetPrompt(concept, true);
      const parsed = JSON.parse(prompts);
      setImagePrompt(parsed.image_prompt);
      setVideoPrompt(parsed.video_prompt);
      
      if (autoGenerateImage) {
        const imageUrl = await generateImage(parsed.image_prompt);
        setImageResult(imageUrl);
      }
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-background">
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Abandoned <span className="text-[#0066ff]">Movie</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            สร้างคลิปไวรัลกองถ่ายหนังร้างสุดหลอน
          </p>
        </div>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-card border border-border rounded-xl">
            <button 
              onClick={() => setMode('ai_gen')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] transition-all ${mode === 'ai_gen' ? 'bg-[#0066ff] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <SparklesIcon className="w-3 h-3" /> AI คิดให้
            </button>
            <button 
              onClick={() => setMode('1char')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] transition-all ${mode === '1char' ? 'bg-[#0066ff] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <UserIcon className="w-3 h-3" /> 1 คน
            </button>
            <button 
              onClick={() => setMode('2chars')}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold text-[10px] transition-all ${mode === '2chars' ? 'bg-[#0066ff] text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <UsersIcon className="w-3 h-3" /> 2 คน
            </button>
          </div>

          <div className="space-y-4">
            {mode !== 'ai_gen' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  👤 ชื่อตัวละคร {mode === '2chars' ? '1' : ''} / ชื่อเรื่อง
                </label>
                <input 
                  type="text"
                  value={char1}
                  onChange={(e) => setChar1(e.target.value)}
                  placeholder="เช่น Harry Potter"
                  className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff]"
                />
              </div>
            )}

            {mode === '2chars' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  👤 ชื่อตัวละคร 2
                </label>
                <input 
                  type="text"
                  value={char2}
                  onChange={(e) => setChar2(e.target.value)}
                  placeholder="เช่น Hermione Granger"
                  className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <input 
              type="checkbox" 
              id="autoGen"
              checked={autoGenerateImage}
              onChange={(e) => setAutoGenerateImage(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#0066ff] focus:ring-[#0066ff]"
            />
            <label htmlFor="autoGen" className="text-sm font-bold text-gray-300 cursor-pointer">
              เปิดการเจนรูปภาพอัตโนมัติ
            </label>
          </div>

          <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
            <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
              ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
              (Banned words / Sensitive topics)
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || (mode === '1char' && !char1) || (mode === '2chars' && (!char1 || !char2))}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SparklesIcon className="w-6 h-6" />
            )}
            <span>{loading ? 'กำลังประมวลผล...' : 'สร้างพ้อมและรูปภาพ'}</span>
          </button>

          {hasPaidKey === false && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-3 animate-fade-in mt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5">⚠️</div>
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  <strong>จำเป็นต้องใช้ Paid API Key:</strong> ฟีเจอร์สร้างรูปภาพคุณภาพสูง ต้องใช้ API Key จากโปรเจกต์ Google Cloud ที่เปิดการเรียกเก็บเงินแล้ว
                </p>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="w-full py-2 bg-yellow-500 text-black rounded-lg text-xs font-black hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <span>🔑</span>
                เชื่อมต่อ Paid API Key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-[#05050a] lg:h-full lg:overflow-y-auto p-8 flex flex-col items-center">
        {!imageResult && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <div className="w-32 h-32 bg-card rounded-3xl flex items-center justify-center border-2 border-dashed border-border transform rotate-3">
              <SparklesIcon className="w-16 h-16 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-500">พร้อมเนรมิตความหลอน</h3>
            <p className="text-gray-400 max-w-sm">
              ใส่ชื่อตัวละครที่คุณชอบ <br />แล้วผมจะพาพวกเขาไปอยู่ในกองถ่ายหนังร้าง
            </p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#0066ff] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-bold animate-pulse">กำลังเจนรูปภาพสไตล์ Abandoned Movie...</p>
          </div>
        )}

        {(imageResult || imagePrompt) && (
          <div className="w-full max-w-4xl space-y-8 animate-fade-in">
            <div className="flex flex-col items-center gap-8">
              {/* Image Result */}
              {imageResult && (
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <PhotoIcon className="w-5 h-5 text-[#0066ff]" /> รูปภาพที่สร้าง
                    </h3>
                    <button 
                      onClick={() => handleDownload(imageResult, 'movie-set-image.png')}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="aspect-[9/16] bg-card rounded-3xl overflow-hidden border border-border shadow-2xl">
                    <img src={imageResult} className="w-full h-full object-cover" alt="Generated Movie Set" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}

              {imagePrompt && (
                <div className="w-full space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <PhotoIcon className="w-4 h-4" /> Image Prompt (พ้อมสร้างภาพ)
                      </h4>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(imagePrompt);
                          alert("คัดลอกพ้อมสร้างภาพแล้ว!");
                        }}
                        className="text-xs font-bold text-[#0066ff] hover:underline"
                      >
                        คัดลอก
                      </button>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed italic font-serif">"{imagePrompt}"</p>
                  </div>

                  {videoPrompt && (
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <VideoCameraIcon className="w-4 h-4" /> Video Prompt (พ้อมสร้างวิดีโอ)
                        </h4>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(videoPrompt);
                            alert("คัดลอกพ้อมสร้างวิดีโอแล้ว!");
                          }}
                          className="text-xs font-bold text-purple-500 hover:underline"
                        >
                          คัดลอก
                        </button>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed italic font-serif">"{videoPrompt}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400">
                <strong className="text-[#0066ff]">Tip:</strong> นำพ้อม (Prompt) นี้ไปใช้ใน <span className="font-bold">Luma Dream Machine</span>, <span className="font-bold">Kling AI</span> หรือ <span className="font-bold">Runway Gen-3</span> เพื่อสร้างวิดีโอสุดหลอน!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
