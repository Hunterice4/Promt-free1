import React, { useState, useCallback, useEffect } from 'react';
import { VisualStyle, MascotParams, MascotData } from '../types';
import { generateMascotDNA, generateMascotScene, generateImage } from '../services/geminiService';
import { downloadImage } from '../services/downloadService';
import { SparklesIcon, UserIcon, PhotoIcon, ClipboardDocumentIcon, ArrowRightIcon, CheckCircleIcon, BookOpenIcon, ClockIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { Tooltip } from './Tooltip';
import { toast, Toaster } from 'sonner';
import { PromptLibrary } from './PromptLibrary';

export const MascotLockMode: React.FC = () => {
  const [dna, setDna] = useState('');
  const [gender, setGender] = useState('ชาย');
  const [age, setAge] = useState('วัยรุ่น');
  const [hair, setHair] = useState('ผมรองทรงสีดำ');
  const [features, setFeatures] = useState('ใส่แว่นกรอบกลม, มีหนวดเคราเล็กน้อย');
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.ThreeD);
  
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [step, setStep] = useState(1); // 1: DNA, 2: Sheet, 3: Scene
  
  const [mascotData, setMascotData] = useState<MascotData | null>(null);
  const [sceneAction, setSceneAction] = useState('');
  const [sceneResult, setSceneResult] = useState<{ prompt: string, url?: string } | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [history, setHistory] = useState<MascotData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('mascot_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse mascot history', e);
      }
    }
  }, []);

  const saveToHistory = (data: MascotData) => {
    const newHistory = [data, ...history.filter(h => h.master_dna !== data.master_dna)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('mascot_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการสร้างทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      localStorage.removeItem('mascot_history');
    }
  };

  const handleGenerateDNA = async () => {
    if (!dna.trim()) {
      toast.error('กรุณากรอกคอนเซปต์ตัวละคร');
      return;
    }
    setLoading(true);
    setLoadingStatus('กำลังวิเคราะห์รหัสพันธุกรรม (Master DNA)...');
    try {
      const data = await generateMascotDNA({ dna, gender, age, hair, features, style });
      setMascotData(data);
      setStep(2);
      toast.success('วิเคราะห์ Master DNA สำเร็จ!');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้าง DNA');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleGenerateSheet = async () => {
    if (!mascotData) return;
    setLoading(true);
    setLoadingStatus('กำลังสร้างแม่พิมพ์ (Character Sheet)...');
    try {
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        toast.info('ข้ามการสร้างรูปภาพตามที่ตั้งค่าไว้');
        setStep(3);
        saveToHistory(mascotData);
        return;
      }
      const imageUrl = await generateImage(mascotData.character_sheet_prompt);
      const finalData = { ...mascotData, character_sheet_url: imageUrl };
      setMascotData(finalData);
      setStep(3);
      saveToHistory(finalData);
      toast.success('สร้าง Character Sheet สำเร็จ!');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const handleGenerateScene = async () => {
    if (!mascotData || !sceneAction.trim()) return;
    setLoading(true);
    setLoadingStatus('กำลังสร้างสถานการณ์ใหม่ (Hybrid Method)...');
    try {
      const prompt = await generateMascotScene(mascotData.master_dna, sceneAction, style);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        setSceneResult({ prompt });
        toast.success('สร้าง Prompt สำเร็จ!');
        return;
      }

      const imageUrl = await generateImage(prompt);
      setSceneResult({ prompt, url: imageUrl });
      toast.success('สร้างรูปภาพสถานการณ์ใหม่สำเร็จ!');
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้างสถานการณ์');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const reset = () => {
    setStep(1);
    setMascotData(null);
    setSceneResult(null);
    setSceneAction('');
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      <Toaster position="top-center" richColors />
      
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-6 bg-[#0a0a14] border-r border-border overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0066ff]/20 rounded-lg">
              <UserIcon className="w-6 h-6 text-[#0066ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Mascot <span className="text-[#0066ff]">Lock</span></h1>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">เทคนิคล็อกหน้า Mascot ถาวร</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-[#0066ff] text-white' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
              title="ประวัติการสร้าง"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
              title="คลัง Prompt ตัวอย่าง"
            >
              <BookOpenIcon className="w-5 h-5 text-gray-500 group-hover:text-[#0066ff] transition-colors" />
            </button>
          </div>
        </div>

        <PromptLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />

        {showHistory ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#0066ff]" /> ประวัติ Mascot
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
              <div className="grid grid-cols-1 gap-3">
                {history.map((h, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setMascotData(h);
                      setStep(3);
                      setShowHistory(false);
                    }}
                    className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-[#0066ff] transition-all text-left group"
                  >
                    {h.character_sheet_url ? (
                      <img src={h.character_sheet_url} alt="Mascot" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-[#0066ff] transition-colors">{h.master_dna}</h4>
                      <p className="text-gray-500 text-[10px] truncate">Mascot DNA</p>
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
          <>
            {/* Steps Indicator */}
            <div className="flex items-center justify-between px-2 py-4 bg-card rounded-2xl border border-border">
              <StepItem num={1} active={step >= 1} label="DNA" />
              <div className={`h-px flex-1 mx-2 ${step > 1 ? 'bg-[#0066ff]' : 'bg-gray-700'}`} />
              <StepItem num={2} active={step >= 2} label="Sheet" />
              <div className={`h-px flex-1 mx-2 ${step > 2 ? 'bg-[#0066ff]' : 'bg-gray-700'}`} />
              <StepItem num={3} active={step >= 3} label="Hybrid" />
            </div>

            {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-400 leading-relaxed">
                <span className="font-bold">STEP 1:</span> สร้าง "รหัสพันธุกรรม" (Master DNA) <br/>
                ระบุรายละเอียดหน้าตาให้ชัดเจนที่สุด เพื่อใช้เป็นฐานในทุกรูป
              </p>
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1">
                🧬 คอนเซปต์ตัวละคร
                <Tooltip content="เช่น ชายหนุ่มมาดกวน, สาวน้อยนักเวทย์, หุ่นยนต์ใจดี" />
              </label>
              <input 
                type="text" 
                value={dna} 
                onChange={e => setDna(e.target.value)} 
                placeholder="เช่น ชายหนุ่มหล่อมาดกวน" 
                className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff]" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-gray-500 uppercase">เพศ</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none">
                  <option>ชาย</option>
                  <option>หญิง</option>
                  <option>ไม่ระบุ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-gray-500 uppercase">ช่วงวัย</label>
                <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="เช่น วัยรุ่น, ผู้ใหญ่" className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase">ทรงผม / สีผม</label>
              <input type="text" value={hair} onChange={e => setHair(e.target.value)} placeholder="เช่น ผมรองทรงสีดำ" className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none" />
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase">จุดเด่นบนใบหน้า</label>
              <textarea 
                value={features} 
                onChange={e => setFeatures(e.target.value)} 
                placeholder="เช่น ใส่แว่นกรอบกลม, มีไฝที่ใต้ตาซ้าย" 
                className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none h-20 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase">🎨 สไตล์ภาพ</label>
              <select value={style} onChange={e => setStyle(e.target.value as VisualStyle)} className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none">
                {Object.values(VisualStyle).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button 
              onClick={handleGenerateDNA} 
              disabled={loading || !dna.trim()} 
              className="w-full py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 hover:bg-[#0055dd] transition-all disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : <><SparklesIcon className="w-6 h-6"/> วิเคราะห์ DNA</>}
            </button>
          </div>
        )}

        {step === 2 && mascotData && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-xs text-green-400 leading-relaxed">
                <span className="font-bold">STEP 2:</span> สร้าง "แม่พิมพ์" (Character Sheet) <br/>
                เราจะสร้างภาพที่มีครบทุกมุม เพื่อให้ AI จำโครงสร้างหน้าได้แม่นยำ
              </p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">Master DNA ที่ได้:</label>
              <p className="text-sm text-white font-bold">{mascotData.master_dna}</p>
            </div>

            <div className="bg-card p-4 rounded-xl border border-border space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">Prompt สำหรับ Character Sheet:</label>
              <p className="text-[10px] text-gray-400 italic leading-tight">{mascotData.character_sheet_prompt}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-gray-400 hover:text-white transition-all">ย้อนกลับ</button>
              <button 
                onClick={handleGenerateSheet} 
                disabled={loading} 
                className="flex-[2] py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 hover:bg-[#0055dd] transition-all"
              >
                {loading ? <LoadingSpinner /> : <><PhotoIcon className="w-6 h-6"/> สร้างแม่พิมพ์</>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && mascotData && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-purple-500/5 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-purple-400 leading-relaxed">
                <span className="font-bold">STEP 3:</span> วิธีล็อกหน้าใช้งานจริง (Hybrid Method) <br/>
                ระบุชุด การกระทำ หรือสถานที่ใหม่ โดย AI จะล็อกหน้าเดิมไว้ให้
              </p>
            </div>

            <div>
              <label className="text-xs font-black text-gray-500 uppercase">🎬 สถานการณ์ใหม่ที่ต้องการ</label>
              <textarea 
                value={sceneAction} 
                onChange={e => setSceneAction(e.target.value)} 
                placeholder="เช่น สวมชุดสูททักซิโด้ ยืนนำเสนองานในออฟฟิศ" 
                className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none h-32 resize-none"
              />
              <p className="text-[10px] text-gray-500 mt-2 italic">* ระบบจะใช้ Master DNA เดิมร่วมกับคำสั่งใหม่นี้</p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleGenerateScene} 
                disabled={loading || !sceneAction.trim()} 
                className="w-full py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 hover:bg-[#0055dd] transition-all disabled:opacity-50"
              >
                {loading ? <LoadingSpinner /> : <><SparklesIcon className="w-6 h-6"/> เจนภาพสถานการณ์ใหม่</>}
              </button>
              <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-all text-sm">เริ่มสร้างตัวละครใหม่</button>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Output Section */}
      <div className="w-full lg:w-2/3 p-6 lg:p-12 bg-background overflow-y-auto custom-scrollbar flex flex-col items-center">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 border-4 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin"></div>
            <p className="text-[#0066ff] font-bold animate-pulse">{loadingStatus}</p>
          </div>
        )}

        {!loading && step === 1 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 max-w-md text-center">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border border-border">
              <UserIcon className="w-12 h-12 opacity-20" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">เริ่มสร้าง Mascot ของคุณ</h2>
              <p className="text-sm leading-relaxed">กรอกรายละเอียดรหัสพันธุกรรม (DNA) ในแถบด้านซ้าย เพื่อเริ่มกระบวนการล็อกหน้าถาวร</p>
            </div>
          </div>
        )}

        {!loading && step === 2 && mascotData && (
          <div className="w-full max-w-2xl space-y-8 animate-fade-in">
             <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">Master DNA Analysis</h2>
                <div className="inline-block px-4 py-1 bg-[#0066ff]/10 rounded-full border border-[#0066ff]/20">
                  <span className="text-[#0066ff] font-bold text-xs">🧬 รหัสพันธุกรรมพร้อมใช้งาน</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
                  <h3 className="font-black text-white flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" /> DNA Summary
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{mascotData.master_dna}</p>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
                  <h3 className="font-black text-white flex items-center gap-2">
                    <ClipboardDocumentIcon className="w-5 h-5 text-[#0066ff]" /> Character Sheet Prompt
                  </h3>
                  <p className="text-[10px] text-gray-400 italic leading-tight">{mascotData.character_sheet_prompt}</p>
                </div>
             </div>

             <div className="p-6 bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0066ff] flex items-center justify-center text-white font-black">2</div>
                  <div>
                    <h4 className="font-bold text-white">พร้อมสร้างแม่พิมพ์?</h4>
                    <p className="text-xs text-gray-500">กดปุ่ม "สร้างแม่พิมพ์" ด้านซ้ายเพื่อดูผลลัพธ์</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-6 h-6 text-[#0066ff] animate-bounce-x" />
             </div>
          </div>
        )}

        {!loading && step === 3 && mascotData && (
          <div className="w-full max-w-4xl space-y-10 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-2">Character Sheet & Hybrid Generation</h2>
              <p className="text-gray-500 text-sm">นี่คือแม่พิมพ์และผลลัพธ์จากการล็อกหน้า</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Character Sheet Display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-sm uppercase tracking-widest">แม่พิมพ์ (Character Sheet)</h3>
                  {mascotData.character_sheet_url && (
                    <button 
                      onClick={() => downloadImage(mascotData.character_sheet_url!, `mascot-sheet-${mascotData.master_dna.substring(0, 10)}`)}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#0066ff] hover:underline"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3" /> Download Sheet
                    </button>
                  )}
                </div>
                {mascotData.character_sheet_url ? (
                  <img src={mascotData.character_sheet_url} className="w-full rounded-3xl border border-border shadow-2xl" alt="Character Sheet" />
                ) : (
                  <div className="w-full aspect-video bg-card rounded-3xl border border-dashed border-border flex items-center justify-center">
                    <p className="text-gray-600 text-xs italic">ข้ามการสร้างรูปภาพแม่พิมพ์</p>
                  </div>
                )}
              </div>

              {/* Scene Result Display */}
              <div className="space-y-4">
                <h3 className="font-black text-white text-sm uppercase tracking-widest">ผลลัพธ์สถานการณ์ใหม่</h3>
                {sceneResult ? (
                  <div className="space-y-4">
                    {sceneResult.url ? (
                      <div className="relative group">
                        <img src={sceneResult.url} className="w-full rounded-3xl border border-[#0066ff]/30 shadow-2xl shadow-[#0066ff]/10" alt="Scene Result" />
                        <button 
                          onClick={() => downloadImage(sceneResult.url!, `mascot-scene-${mascotData.master_dna.substring(0, 10)}`)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold gap-2 rounded-3xl"
                        >
                          <ArrowDownTrayIcon className="w-8 h-8" />
                          <span>Download Result</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] bg-card rounded-3xl border border-border flex items-center justify-center p-8 text-center">
                        <div>
                          <p className="text-[#0066ff] font-bold mb-2">สร้างเฉพาะ Prompt สำเร็จ!</p>
                          <p className="text-[10px] text-gray-500 italic break-all">{sceneResult.prompt}</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-card p-4 rounded-2xl border border-border">
                      <label className="text-[10px] font-black text-gray-500 uppercase">Hybrid Prompt:</label>
                      <p className="text-[10px] text-gray-400 italic mt-1">{sceneResult.prompt}</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/4] bg-card rounded-3xl border border-dashed border-border flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <SparklesIcon className="w-12 h-12 opacity-10" />
                    <p className="text-xs italic">รอการสร้างสถานการณ์ใหม่จากแถบด้านซ้าย...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StepItem = ({ num, active, label }: { num: number, active: boolean, label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${active ? 'bg-[#0066ff] text-white' : 'bg-gray-800 text-gray-600'}`}>
      {num}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? 'text-white' : 'text-gray-600'}`}>{label}</span>
  </div>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
