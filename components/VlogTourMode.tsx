import React, { useState } from 'react';
import { VisualStyle, TourData, TourParams } from '../types';
import { generateVlogTour, generateImage } from '../services/geminiService';
import { SparklesIcon, MapIcon, ClipboardDocumentIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { toast, Toaster } from 'sonner';

export const VlogTourMode: React.FC = () => {
  const [characterDna, setCharacterDna] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [locations, setLocations] = useState('');
  const [tone, setTone] = useState('ตื่นเต้น, สนุกสนาน');
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.Cinematic);
  const [sceneCount, setSceneCount] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<TourData | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!characterDna.trim() || !locations.trim()) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setLoadingStatus('กำลังวางแผนการเดินทาง...');
    
    try {
      const data = await generateVlogTour({ 
        character_dna: characterDna, 
        referenceImage: referenceImage || undefined,
        locations, 
        style, 
        tone,
        sceneCount
      });
      setResult(data);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        setLoading(false);
        setLoadingStatus('');
        return;
      }

      // Generate images for each scene sequentially to avoid overwhelming the API
      const updatedScenes = [...data.scenes];
      for (let i = 0; i < updatedScenes.length; i++) {
        setLoadingStatus(`กำลังวาดภาพฉากที่ ${i + 1}: ${updatedScenes[i].location}...`);
        try {
          const imageUrl = await generateImage(updatedScenes[i].image_prompt);
          updatedScenes[i] = { ...updatedScenes[i], image_url: imageUrl };
          setResult({ ...data, scenes: updatedScenes });
        } catch (imgErr) {
          console.error(`Error generating image for scene ${i}:`, imgErr);
        }
      }
      
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้าง Vlog Tour');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full">
      <Toaster position="top-center" richColors />
      
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-6 bg-[#0a0a14] border-r border-border overflow-y-auto custom-scrollbar">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Vlog <span className="text-[#0066ff]">Tour</span></h1>
          <p className="text-gray-400 text-sm">พาทัวร์สถานที่ต่างๆ ด้วยตัวละครของคุณ</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
              🧬 ตัวละครต้นแบบ (Character Reference)
              <span className="text-[10px] font-normal lowercase text-gray-600">(Optional)</span>
            </label>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-xl hover:border-[#0066ff] transition-all cursor-pointer bg-card group">
                {referenceImage ? (
                  <img src={referenceImage} alt="Reference" className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <>
                    <PhotoIcon className="w-8 h-8 text-gray-600 group-hover:text-[#0066ff]" />
                    <span className="text-[10px] text-gray-500 mt-1">อัปโหลดรูปตัวละคร</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
              {referenceImage && (
                <button 
                  onClick={() => setReferenceImage(null)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-[10px] font-bold"
                >
                  ลบรูป
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase">🧬 รหัสพันธุกรรมตัวละคร (Character DNA)</label>
            <textarea 
              value={characterDna} 
              onChange={e => setCharacterDna(e.target.value)} 
              placeholder="เช่น ชายหนุ่มหล่อ ผมรองทรงสีดำ ใส่แว่นกรอบกลม (หรือก๊อป Master DNA มาใส่)" 
              className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff] h-24 resize-none"
            />
          </div>
          
          <div>
            <label className="text-xs font-black text-gray-500 uppercase">📍 สถานที่ที่ต้องการไป (Tour Route)</label>
            <input 
              type="text" 
              value={locations} 
              onChange={e => setLocations(e.target.value)} 
              placeholder="เช่น ปารีส, ลอนดอน, โตเกียว" 
              className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff]" 
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase">🎭 โทนของ Vlog</label>
            <input 
              type="text" 
              value={tone} 
              onChange={e => setTone(e.target.value)} 
              placeholder="เช่น ตื่นเต้น, สนุกสนาน, ลึกลับ" 
              className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff]" 
            />
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase">🎨 สไตล์ภาพ</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.values(VisualStyle).slice(0, 6).map(s => (
                <button 
                  key={s} 
                  onClick={() => setStyle(s)} 
                  className={`p-3 rounded-xl text-xs font-bold border transition-all ${style === s ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex justify-between">
              🎬 จำนวนฉาก <span>{sceneCount} ฉาก</span>
            </label>
            <input 
              type="range" 
              min="3" 
              max="10" 
              value={sceneCount} 
              onChange={e => setSceneCount(parseInt(e.target.value))} 
              className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer mt-4 accent-[#0066ff]" 
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>3 ฉาก</span>
              <span>10 ฉาก</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || !characterDna.trim() || !locations.trim()} 
          className="w-full py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 hover:bg-[#0055dd] transition-all disabled:opacity-50 mt-6"
        >
          {loading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : <><SparklesIcon className="w-6 h-6"/> เริ่มการเดินทาง</>}
        </button>
      </div>

      {/* Output Section */}
      <div className="w-full lg:w-2/3 p-6 lg:p-12 bg-background overflow-y-auto custom-scrollbar">
        {loading && !result && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 border-4 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin"></div>
            <p className="text-[#0066ff] font-bold animate-pulse">{loadingStatus}</p>
          </div>
        )}

        {result && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-white">{result.title}</h2>
              <p className="text-gray-400 italic leading-relaxed max-w-2xl mx-auto">{result.introduction}</p>
            </div>

            {loading && loadingStatus && (
              <div className="flex items-center gap-4 bg-[#0066ff]/10 p-4 rounded-2xl border border-[#0066ff]/20 animate-pulse">
                <div className="w-5 h-5 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#00aaff] text-sm font-bold">{loadingStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {result.scenes.map((scene, idx) => (
                <div key={idx} className="bg-card rounded-3xl border border-border overflow-hidden group hover:border-[#0066ff]/50 transition-all shadow-xl">
                  <div className="aspect-[9/16] bg-black relative">
                    {scene.image_url ? (
                      <img src={scene.image_url} alt={scene.location} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <PhotoIcon className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Scene {idx + 1}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-[#0066ff]" /> {scene.location}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 font-bold">{scene.action}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <label className="text-[10px] font-black text-[#0066ff] uppercase block mb-1">🎥 Camera</label>
                        <p className="text-[11px] text-gray-300 leading-tight">{scene.camera_movement}</p>
                      </div>
                      <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <label className="text-[10px] font-black text-[#0066ff] uppercase block mb-1">⏱️ Duration</label>
                        <p className="text-[11px] text-gray-300 leading-tight">{scene.duration_plan}</p>
                      </div>
                    </div>

                    <div className="bg-[#0066ff]/5 p-4 rounded-2xl border border-[#0066ff]/10">
                      <label className="text-[10px] font-black text-[#0066ff] uppercase block mb-2 flex items-center gap-2">
                        💬 Script (8s) <span className="text-[9px] font-normal text-gray-500">มู้ด: {scene.vibe}</span>
                      </label>
                      <p className="text-sm text-white font-medium leading-relaxed">"{scene.script}"</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase">Prompts</label>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(scene.image_prompt);
                            toast.success('คัดลอก Image Prompt แล้ว');
                          }}
                          className="text-[10px] text-[#0066ff] hover:underline flex items-center gap-1"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3" /> Copy Image
                        </button>
                      </div>
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-start gap-2">
                          <PhotoIcon className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                          <p className="text-[9px] text-gray-500 italic leading-tight break-all">{scene.image_prompt}</p>
                        </div>
                        <div className="flex items-start gap-2 border-t border-white/5 pt-2">
                          <VideoCameraIcon className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                          <p className="text-[9px] text-gray-500 italic leading-tight break-all">{scene.video_prompt}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !result && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-6 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border border-border">
              <MapIcon className="w-12 h-12 opacity-20" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">พร้อมออกเดินทางหรือยัง?</h2>
              <p className="text-sm leading-relaxed">ระบุรหัสพันธุกรรมตัวละครและสถานที่ที่คุณอยากไป แล้ว AI จะสร้างแผนการเดินทางสุดประทับใจให้คุณ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
