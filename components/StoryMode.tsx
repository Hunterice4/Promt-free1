import React, { useState } from 'react';
import { VisualStyle, StoryData } from '../types';
import { generateStory, generateImage, generateRandomTheme, generateRandomProtagonist } from '../services/geminiService';
import { downloadImage } from '../services/downloadService';
import { SparklesIcon, BookOpenIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

export const StoryMode: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [protagonist, setProtagonist] = useState('');
  const [tone, setTone] = useState('ตื่นเต้น ระทึกขวัญ');
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.Cinematic);
  const [enableViralSecrets, setEnableViralSecrets] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSuggestingTheme, setIsSuggestingTheme] = useState(false);
  const [isSuggestingProtagonist, setIsSuggestingProtagonist] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<StoryData | null>(null);

  const handleSuggestTheme = async () => {
    setIsSuggestingTheme(true);
    try {
      const suggestedTheme = await generateRandomTheme();
      setTheme(suggestedTheme);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingTheme(false);
    }
  };

  const handleSuggestProtagonist = async () => {
    setIsSuggestingProtagonist(true);
    try {
      const suggestedProtagonist = await generateRandomProtagonist();
      setProtagonist(suggestedProtagonist);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingProtagonist(false);
    }
  };

  const handleGenerate = async () => {
    if (!theme.trim() || !protagonist.trim()) return;
    setLoading(true);
    setResult(null);
    setLoadingStatus('กำลังแต่งเนื้อเรื่อง...');
    try {
      const data = await generateStory({ theme, protagonist, tone, style, enableViralSecrets });
      setResult(data);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        setLoading(false);
        setLoadingStatus('');
        return;
      }

      setLoadingStatus('กำลังวาดภาพปก...');
      const imageUrl = await generateImage(data.cover_prompt);
      setResult({ ...data, cover_url: imageUrl });
    } catch (err: any) {
      console.error(err);
      let errorMessage = "เกิดข้อผิดพลาดในการสร้างเนื้อเรื่อง";
      
      const isQuota = err?.message?.includes('429') || 
                      err?.error?.message?.includes('429') ||
                      JSON.stringify(err).includes('429') ||
                      JSON.stringify(err).includes('RESOURCE_EXHAUSTED');

      if (err?.message?.includes('500') || err?.message?.includes('xhr error')) {
        errorMessage = "ระบบขัดข้องชั่วคราว (Gemini API 500) กรุณาลองใหม่อีกครั้งในอีกสักครู่";
      } else if (isQuota) {
        errorMessage = "โควตาการใช้งานเต็ม (API Quota Exceeded) กรุณารอสักครู่ หรือลองใส่ API Key ของตัวเองในเมนูตั้งค่า หรือเปิดโหมด 'ไม่สร้างรูปภาพ' เพื่อประหยัดโควตาครับ";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-6 bg-[#0a0a14] border-r border-border overflow-y-auto custom-scrollbar">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Story <span className="text-[#0066ff]">Generator</span></h1>
          <p className="text-gray-400 text-sm">แต่งพล็อตเรื่องสั้น พร้อมภาพปกนิยาย</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase">ธีม / แนวเรื่อง</label>
            <div className="relative group mt-2">
              <input type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="เช่น เอาชีวิตรอดบนดาวอังคาร, รักวัยรุ่น" className="w-full bg-card border border-border rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
              <button
                onClick={handleSuggestTheme}
                disabled={isSuggestingTheme}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                  isSuggestingTheme 
                  ? 'bg-gray-800 text-gray-600' 
                  : 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white'
                }`}
                title="สุ่มไอเดียธีมเรื่อง"
              >
                <SparklesIcon className={`w-5 h-5 ${isSuggestingTheme ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase">ตัวเอก</label>
            <div className="relative group mt-2">
              <input type="text" value={protagonist} onChange={e => setProtagonist(e.target.value)} placeholder="เช่น เด็กหนุ่มผู้มีพลังไฟ, แมวที่พูดได้" className="w-full bg-card border border-border rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
              <button
                onClick={handleSuggestProtagonist}
                disabled={isSuggestingProtagonist}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                  isSuggestingProtagonist 
                  ? 'bg-gray-800 text-gray-600' 
                  : 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white'
                }`}
                title="สุ่มไอเดียตัวเอก"
              >
                <SparklesIcon className={`w-5 h-5 ${isSuggestingProtagonist ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase">โทนเรื่อง</label>
            <input type="text" value={tone} onChange={e => setTone(e.target.value)} placeholder="เช่น ตื่นเต้น, เศร้า, ตลกขบขัน" className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase">🎨 สไตล์ภาพปก</label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {Object.values(VisualStyle).map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`p-3 rounded-xl text-sm font-bold border transition-all ${style === s ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{s}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div>
              <p className="text-sm font-bold text-white">🔥 เปิดโหมด Viral Story (The Loop)</p>
              <p className="text-xs text-gray-400 mt-1">เพิ่ม Hook, จุดหักมุม และการเล่าเรื่องแบบวนลูป</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enableViralSecrets} onChange={(e) => setEnableViralSecrets(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066ff]"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 mt-auto space-y-4">
          <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
            <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
              ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
              (Banned words / Sensitive topics)
            </p>
          </div>
          <button onClick={handleGenerate} disabled={loading || !theme.trim() || !protagonist.trim()} className="w-full py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-[#0055dd] transition-all active:scale-95">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังสร้าง...</span>
              </>
            ) : <><SparklesIcon className="w-6 h-6"/> แต่งเนื้อเรื่อง</>}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-full lg:w-2/3 p-6 lg:p-12 bg-background overflow-y-auto custom-scrollbar flex flex-col items-center">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 border-4 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin"></div>
            <p className="text-[#0066ff] font-bold animate-pulse">{loadingStatus}</p>
          </div>
        )}
        {!loading && result && (
          <div className="max-w-3xl w-full space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-white">{result.title}</h2>
              <p className="text-xl text-[#0066ff] font-bold italic">"{result.logline}"</p>
            </div>
            
            {result.cover_url ? (
              <div className="relative group/img w-full max-w-md mx-auto">
                <img src={result.cover_url} alt={result.title} className="w-full rounded-2xl shadow-2xl shadow-[#0066ff]/20 border border-white/10" />
                <button 
                  onClick={() => downloadImage(result.cover_url!, `story-cover-${result.title.substring(0, 20)}`)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold text-sm gap-2 rounded-2xl"
                >
                  <ArrowDownTrayIcon className="w-8 h-8" />
                  <span>Download Cover</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto aspect-[9/16] bg-card rounded-2xl flex items-center justify-center border border-border">
                <p className="text-gray-500">No Image</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <h3 className="text-xl font-black text-[#0066ff]">องก์ที่ 1: จุดเริ่มต้น</h3>
                <p className="text-gray-300 leading-relaxed">{result.act1}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <h3 className="text-xl font-black text-[#0066ff]">องก์ที่ 2: เผชิญหน้าและวิกฤต</h3>
                <p className="text-gray-300 leading-relaxed">{result.act2}</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border space-y-3">
                <h3 className="text-xl font-black text-[#0066ff]">องก์ที่ 3: บทสรุป</h3>
                <p className="text-gray-300 leading-relaxed">{result.act3}</p>
              </div>
            </div>
          </div>
        )}
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <BookOpenIcon className="w-24 h-24 opacity-20" />
            <p className="text-lg font-bold">กำหนดธีมและตัวเอก แล้วเริ่มแต่งเรื่องได้เลย!</p>
          </div>
        )}
      </div>
    </div>
  );
};
