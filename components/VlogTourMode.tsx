import React, { useState } from 'react';
import { VisualStyle, TourData, TourParams, VoiceGender, VoiceTone } from '../types';
import { generateVlogTour, generateImage } from '../services/geminiService';
import { SparklesIcon, MapIcon, ClipboardDocumentIcon, PhotoIcon, VideoCameraIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { downloadImage } from '../services/downloadService';

export const VlogTourMode: React.FC = () => {
  const [characterDna, setCharacterDna] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [locations, setLocations] = useState('');
  const [tone, setTone] = useState('ตื่นเต้น, สนุกสนาน');
  const [atmosphere, setAtmosphere] = useState('สดใส ร่าเริง');
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.Cinematic);
  const [sceneCount, setSceneCount] = useState(5);
  const [enableViralSecrets, setEnableViralSecrets] = useState(true);
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(VoiceGender.Auto);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(VoiceTone.Auto);
  
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<TourData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templateCategories = [
    {
      title: '👻 สยองขวัญ (Horror)',
      items: [
        { name: 'บ้านไม้ร้าง (Haunted)', locations: 'บ้านไม้เก่าร้าง, ห้องใต้หลังคา, สวนรกชัฏ', tone: 'สยองขวัญ, ลึกลับ (Ghost)' },
        { name: 'รพ. ร้าง (Hospital)', locations: 'โรงพยาบาลร้าง, ห้องฉุกเฉินเก่า, ทางเดินมืด', tone: 'สมจริงจนขนลุก (Realistic Horror)' },
        { name: 'การ์ตูนผี (Cartoon)', locations: 'คฤหาสน์ผีสิง, ป่าช้าการ์ตูน, ปราสาทมืด', tone: 'การ์ตูนสยองขวัญ (Cartoon Horror)' },
        { name: 'ผีไทย (Thai Ghost)', locations: 'ศาลาริมน้ำ, ต้นไทรใหญ่, วัดเก่ากลางดึก', tone: 'สยองขวัญแบบไทย (Thai Ghost)' },
        { name: 'โรงเรียนร้าง (School)', locations: 'โรงเรียนร้าง, ห้องเรียนเก่า, ดาดฟ้าตึก', tone: 'สยองขวัญ, ลึกลับ (Ghost)' },
      ]
    },
    {
      title: '🗼 ท่องเที่ยว (Travel)',
      items: [
        { name: 'ญี่ปุ่น (Japan)', locations: 'โตเกียว, โอซาก้า, เกียวโต', tone: 'ตื่นเต้น, สนุกสนาน' },
        { name: 'ยุโรป (Europe)', locations: 'ปารีส, ลอนดอน, โรม', tone: 'โรแมนติก, อบอุ่น' },
        { name: 'ไทย (Thailand)', locations: 'เชียงใหม่, ภูเก็ต, กรุงเทพฯ', tone: 'สนุกสนาน, ร่าเริง' },
        { name: 'ธรรมชาติ (Nature)', locations: 'ยอดเขาสูง, ป่าสน, น้ำตก', tone: 'ผจญภัย, ท้าทาย (Adventure)' },
      ]
    }
  ];

  const handleTemplateSelect = (t: { name: string, locations: string, tone: string }) => {
    setLocations(t.locations);
    setTone(t.tone);
    setSelectedTemplate(t.name);
    toast.success(`เลือกเทมเพลต: ${t.name}`);
  };

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
    if (!locations.trim()) {
      toast.error('กรุณาระบุสถานที่ที่ต้องการไป');
      return;
    }
    
    setLoading(true);
    setResult(null);
    setLoadingStatus('กำลังวางแผนการเดินทาง...');
    
    try {
      const finalDna = characterDna.trim() || 'A charismatic young traveler, friendly and adventurous';
      
      const data = await generateVlogTour({ 
        character_dna: finalDna, 
        referenceImage: referenceImage || undefined,
        locations, 
        style, 
        tone,
        atmosphere,
        sceneCount,
        enableViralSecrets,
        enableVoiceover,
        voiceGender,
        voiceTone
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
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase">⚡ เทมเพลตด่วน (Quick Templates)</label>
            <div className="space-y-4 mt-2">
              {templateCategories.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-2">
                  <h4 className="text-[10px] font-black text-[#0066ff] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 bg-[#0066ff] rounded-full"></span>
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((t, i) => (
                      <motion.button 
                        key={i}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 102, 255, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        animate={selectedTemplate === t.name ? { scale: [1, 1.05, 1] } : {}}
                        onClick={() => handleTemplateSelect(t)}
                        className={`p-2 border rounded-xl text-[10px] font-bold transition-all text-left flex items-center gap-2 ${
                          selectedTemplate === t.name 
                            ? 'bg-[#0066ff]/20 border-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]' 
                            : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                      >
                        {selectedTemplate === t.name ? (
                          <CheckCircleIcon className="w-3 h-3 text-[#0066ff] shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-gray-600"></span>
                        )}
                        {t.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
              🧬 รหัสพันธุกรรมตัวละคร (Character DNA)
              <span className="text-[10px] font-normal lowercase text-gray-600">(Optional / Auto)</span>
            </label>
            <textarea 
              value={characterDna} 
              onChange={e => setCharacterDna(e.target.value)} 
              placeholder="เช่น ชายหนุ่มหล่อ ผมรองทรงสีดำ ใส่แว่นกรอบกลม (หากไม่ใส่ AI จะสุ่มให้เอง)" 
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
            <div className="flex flex-wrap gap-2 mt-2">
              {['ตื่นเต้น, สนุกสนาน', 'สยองขวัญ, ลึกลับ (Ghost)', 'สยองขวัญแบบไทย (Thai Ghost)', 'บ้านร้างสุดหลอน (Haunted House)', 'การ์ตูนสยองขวัญ (Cartoon Horror)', 'สมจริงจนขนลุก (Realistic Horror)', 'ผจญภัย, ท้าทาย (Adventure)', 'โรแมนติก, อบอุ่น', 'ตลก, ร่าเริง'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${tone === t ? 'bg-[#0066ff]/20 border-[#0066ff] text-white' : 'bg-card border-border text-gray-500 hover:text-white hover:border-gray-500'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-gray-500 uppercase">✨ บรรยากาศในภาพ (Atmosphere)</label>
            <input 
              type="text" 
              value={atmosphere} 
              onChange={e => setAtmosphere(e.target.value)} 
              placeholder="เช่น มืดหม่น, สดใส, หมอกลงจัด, แสงแดดอบอุ่น" 
              className="w-full bg-card border border-border rounded-xl p-4 text-white mt-2 focus:outline-none focus:border-[#0066ff]" 
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {['สดใส ร่าเริง', 'มืดหม่น น่ากลัว', 'หมอกลงจัด ลึกลับ', 'แสงแดดอบอุ่น ยามเช้า', 'แสงนีออน ไซเบอร์พังก์', 'ฝนตก ปรอยๆ', 'หิมะตก หนาวเหน็บ', 'แสงสีทอง ยามเย็น'].map(a => (
                <button 
                  key={a}
                  onClick={() => setAtmosphere(a)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${atmosphere === a ? 'bg-[#0066ff]/20 border-[#0066ff] text-white' : 'bg-card border-border text-gray-500 hover:text-white hover:border-gray-500'}`}
                >
                  {a}
                </button>
              ))}
            </div>
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
          
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl mt-4">
            <div>
              <p className="text-sm font-bold text-white">🔥 เปิดโหมด Viral Vlog (The Loop)</p>
              <p className="text-xs text-gray-400 mt-1">เพิ่ม Hook, ลูกเล่นกล้อง และการเล่าเรื่องแบบวนลูป</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enableViralSecrets} onChange={(e) => setEnableViralSecrets(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066ff]"></div>
            </label>
          </div>

          {/* Voiceover Settings */}
          <div className="p-4 bg-card border border-border rounded-xl mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">🎙️ เปิดใช้งานเสียงพากย์ (Voiceover)</p>
                <p className="text-xs text-gray-400 mt-1">เพิ่มบทพูดภาษาไทยใน Video Prompt</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enableVoiceover} onChange={(e) => setEnableVoiceover(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066ff]"></div>
              </label>
            </div>

            {enableVoiceover && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase">เพศของเสียง (Gender)</label>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value as VoiceGender)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-white mt-1 focus:outline-none focus:border-[#0066ff] text-xs"
                  >
                    {Object.values(VoiceGender).map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase">โทนเสียง (Tone)</label>
                  <select
                    value={voiceTone}
                    onChange={(e) => setVoiceTone(e.target.value as VoiceTone)}
                    className="w-full bg-background border border-border rounded-lg p-2 text-white mt-1 focus:outline-none focus:border-[#0066ff] text-xs"
                  >
                    {Object.values(VoiceTone).map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || !locations.trim()} 
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
                    {scene.image_url && (
                      <button 
                        onClick={() => downloadImage(scene.image_url!, `vlog-scene-${idx + 1}.png`)}
                        className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-[#0066ff] transition-all"
                        title="ดาวน์โหลดรูปภาพ"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                          <MapIcon className="w-5 h-5 text-[#0066ff]" /> {scene.location}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#0066ff] uppercase bg-[#0066ff]/10 px-2 py-0.5 rounded-md">
                            {scene.vibe}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase">AI Prompts (Master DNA Locked)</label>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(scene.image_prompt);
                              toast.success('คัดลอก Image Prompt แล้ว');
                            }}
                            className="text-[10px] text-[#0066ff] hover:underline flex items-center gap-1"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" /> Image
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(scene.video_prompt);
                              toast.success('คัดลอก Video Prompt แล้ว');
                            }}
                            className="text-[10px] text-purple-500 hover:underline flex items-center gap-1"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" /> Video
                          </button>
                        </div>
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
