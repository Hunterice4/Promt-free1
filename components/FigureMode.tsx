
import React, { useState, useRef, useEffect } from 'react';
import { generateFigureImage } from '../services/geminiService';
import { PhotoIcon, SparklesIcon, TrashIcon, ArrowDownTrayIcon, PuzzlePieceIcon, ClockIcon } from '@heroicons/react/24/solid';

export const FigureMode: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('figure_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse figure history', e);
      }
    }
  }, []);

  const saveToHistory = (url: string) => {
    const newHistory = [url, ...history.filter(h => h !== url)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('figure_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการสร้างทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      localStorage.removeItem('figure_history');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!media) return;
    setLoading(true);
    try {
      const imageUrl = await generateFigureImage(media);
      setResult(imageUrl);
      saveToHistory(imageUrl);
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสร้างฟิกเกอร์: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = 'generated-figure.png';
      link.click();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-background">
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              Figure <span className="text-[#0066ff]">Gen</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              เปลี่ยนรูปภาพตัวละครให้เป็นฟิกเกอร์สุดพรีเมียม
            </p>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-[#0066ff] text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
            title="ประวัติการสร้าง"
          >
            <ClockIcon className="w-6 h-6" />
          </button>
        </div>

        {showHistory ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#0066ff]" /> ประวัติฟิกเกอร์
              </h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <TrashIcon className="w-3 h-3" /> ล้างทั้งหมด
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="text-gray-500 text-sm">ยังไม่มีประวัติการสร้าง</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {history.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setResult(url);
                      setShowHistory(false);
                    }}
                    className="aspect-square rounded-xl overflow-hidden border border-border hover:border-[#0066ff] transition-all group relative"
                  >
                    <img src={url} className="w-full h-full object-cover" alt="History" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setShowHistory(false)}
              className="w-full py-3 rounded-xl font-bold bg-card border border-border text-gray-400 hover:text-white transition-all"
            >
              กลับไปหน้าสร้าง
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
              📸 อัปโหลดรูปตัวละคร (Character Image)
            </label>
            
            {!media ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066ff]/50 hover:bg-[#0066ff]/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PhotoIcon className="w-8 h-8 text-gray-500 group-hover:text-[#0066ff]" />
                </div>
                <p className="text-sm font-bold text-gray-500 group-hover:text-white">คลิกเพื่อเลือกไฟล์</p>
                <p className="text-[10px] text-gray-600 mt-1">รองรับ JPG, PNG</p>
              </div>
            ) : (
              <div className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-black">
                <img src={media} className="w-full h-full object-contain" alt="Preview" />
                <button 
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
            <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
              ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
              (Banned words / Sensitive topics)
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !media}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading || !media
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังสร้างฟิกเกอร์...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                <span>สร้างฟิกเกอร์ 1/7 Scale</span>
              </>
            )}
          </button>
        </div>
        )}
      </div>

      {/* Output Section */}
      <div className="w-full lg:w-2/3 bg-[#05050a] border-l border-border lg:h-full lg:overflow-y-auto p-8">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-32 h-32 bg-card rounded-3xl flex items-center justify-center border-2 border-dashed border-border transform -rotate-3">
              <PuzzlePieceIcon className="w-16 h-16 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-white">พร้อมสร้างฟิกเกอร์แล้ว</h3>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              อัปโหลดรูปตัวละครของคุณ แล้วผมจะเนรมิตให้เป็นฟิกเกอร์พรีเมียม <br />บนโต๊ะทำงาน พร้อมกล่องและหน้าจอ Blender
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in flex flex-col items-center">
            <div className="w-full flex items-center justify-between">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                Generated <span className="text-[#0066ff]">Figure</span>
              </h2>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                ดาวน์โหลดรูปภาพ
              </button>
            </div>

            <div className="w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative group">
              <img src={result} className="w-full h-full object-cover" alt="Generated Figure" referrerPolicy="no-referrer" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <SparklesIcon className="w-32 h-32 text-[#0066ff]" />
              </div>
            </div>

            <div className="bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-2xl p-6 text-center w-full max-w-2xl">
              <p className="text-sm text-gray-400">
                <strong className="text-[#0066ff]">Note:</strong> รูปภาพนี้ถูกสร้างขึ้นด้วย AI (Nano-Banana) ในสไตล์ Photorealistic พร้อมรายละเอียดระดับ 4K
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
