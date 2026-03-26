import React, { useState } from 'react';
import { VisualStyle, VoiceGender, VoiceTone } from '../types';
import { generateCrossoverDetailed, generateCrossoverImage, CrossoverData } from '../services/geminiService';
import { SparklesIcon, PhotoIcon, UserGroupIcon, MapPinIcon, CheckCircleIcon, ArrowDownTrayIcon, ClipboardIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { downloadImage } from '../services/downloadService';

interface CrossoverSlot {
  charImage: string | null;
  charDesc: string;
  location: string;
  action: string;
  atmosphere: string;
  timeOfDay: string;
  imagePrompt?: string;
  videoPrompt?: string;
}

export const CrossoverMode: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userDesc, setUserDesc] = useState('');
  
  const [imageCount, setImageCount] = useState(1);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  
  const [slots, setSlots] = useState<CrossoverSlot[]>([
    { charImage: null, charDesc: '', location: '', action: 'ยืนโพสท่าถ่ายรูปคู่กัน', atmosphere: 'โรแมนติก', timeOfDay: 'พระอาทิตย์ตก' },
    { charImage: null, charDesc: '', location: '', action: 'ยืนโพสท่าถ่ายรูปคู่กัน', atmosphere: 'โรแมนติก', timeOfDay: 'พระอาทิตย์ตก' },
    { charImage: null, charDesc: '', location: '', action: 'ยืนโพสท่าถ่ายรูปคู่กัน', atmosphere: 'โรแมนติก', timeOfDay: 'พระอาทิตย์ตก' },
    { charImage: null, charDesc: '', location: '', action: 'ยืนโพสท่าถ่ายรูปคู่กัน', atmosphere: 'โรแมนติก', timeOfDay: 'พระอาทิตย์ตก' },
  ]);

  const [style, setStyle] = useState<VisualStyle>(VisualStyle.Cinematic);
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(VoiceGender.Auto);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(VoiceTone.Auto);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showVideoGen, setShowVideoGen] = useState(false);

  const atmospheres = ['โรแมนติก', 'กดดัน/ตึงเครียด', 'สดใส/ร่าเริง', 'ลึกลับ', 'อบอุ่น', 'เศร้า/เหงา', 'ดุดัน/ทรงพลัง'];
  const times = ['เที่ยงวัน (แดดจัด)', 'เช้าตรู่ (หมอกลง)', 'พระอาทิตย์ตก (Golden Hour)', 'กลางคืน (มืดสนิท)', 'กลางคืน (แสงนีออน)', 'ฝนตกหนัก', 'หิมะตก'];

  const templateCategories = [
    {
      title: '📸 แฟนมีต & ชิลล์ (Fanmeet & Chill)',
      items: [
        { name: 'เซลฟี่คู่กัน', action: 'กำลังเซลฟี่ด้วยกันอย่างสนิทสนม ยิ้มแย้ม', location: 'คาเฟ่สไตล์มินิมอล แสงแดดอ่อนๆ' },
        { name: 'เดินช้อปปิ้ง', action: 'เดินเล่นช้อปปิ้งด้วยกัน ถือแก้วกาแฟ', location: 'ถนนคนเดินย่านชินจูกุ ญี่ปุ่น' },
        { name: 'ขอลายเซ็น', action: 'กำลังขอลายเซ็นด้วยความตื่นเต้น', location: 'งานอีเวนต์แฟนมีตติ้ง แสงไฟสว่าง' },
      ]
    },
    {
      title: '⚔️ แอคชั่น & ต่อสู้ (Action & Battle)',
      items: [
        { name: 'หันหลังชนกัน', action: 'ยืนหันหลังชนกัน เตรียมพร้อมต่อสู้ ถืออาวุธ', location: 'ซากปรักหักพังของเมืองที่ถูกทำลาย' },
        { name: 'ปล่อยพลังคู่', action: 'กำลังปล่อยพลังเวทย์มนตร์โจมตีศัตรูพร้อมกัน', location: 'สนามรบมิติควอนตัม' },
        { name: 'ขี่มอเตอร์ไซค์', action: 'ซ้อนท้ายมอเตอร์ไซค์หนีการตามล่าด้วยความเร็วสูง', location: 'เมืองไซเบอร์พังค์ยามค่ำคืน' },
      ]
    },
    {
      title: '✨ แฟนตาซี (Fantasy World)',
      items: [
        { name: 'ขี่มังกร', action: 'นั่งอยู่บนหลังมังกรที่กำลังบินทะยานขึ้นฟ้า', location: 'เหนือหมู่เมฆและปราสาทลอยฟ้า' },
        { name: 'ผิงไฟในป่า', action: 'นั่งผิงไฟพูดคุยกันอย่างอบอุ่น', location: 'ป่าเอลฟ์ที่มีหิ่งห้อยเรืองแสง' },
        { name: 'งานเต้นรำ', action: 'จับมือเต้นรำกันอย่างสง่างาม', location: 'ห้องโถงปราสาทราชวังสุดหรูหรา' },
      ]
    },
    {
      title: '🏫 ชีวิตวัยเรียน (School Life)',
      items: [
        { name: 'โต๊ะเรียนติดกัน', action: 'นั่งเรียนโต๊ะติดกันริมหน้าต่าง แอบมองกัน', location: 'ห้องเรียนมัธยมปลายญี่ปุ่นยามเย็น' },
        { name: 'กินข้าวบนดาดฟ้า', action: 'นั่งกินข้าวกล่องเบนโตะด้วยกัน', location: 'ดาดฟ้าโรงเรียน ท้องฟ้าสดใส' },
        { name: 'กางร่มกลับบ้าน', action: 'เดินกางร่มคันเดียวกันกลับบ้าน', location: 'ถนนทางเดินที่มีซากุระร่วงหล่นกลางสายฝน' },
      ]
    },
    {
      title: '👻 สยองขวัญ (Horror & Survival)',
      items: [
        { name: 'ซ่อนตัวในตู้', action: 'แอบซ่อนตัวอยู่ในตู้แคบๆ ด้วยความหวาดกลัว เอามือปิดปาก', location: 'บ้านร้างสุดหลอน' },
        { name: 'สำรวจบ้านร้าง', action: 'เดินถือไฟฉายสำรวจความมืดด้วยความระแวง', location: 'โรงพยาบาลร้างบรรยากาศน่าขนลุก' },
        { name: 'หนีซอมบี้', action: 'วิ่งหนีฝูงซอมบี้สุดชีวิต', location: 'เมืองร้างหลังวันสิ้นโลก' },
      ]
    }
  ];

  const updateSlot = (index: number, data: Partial<CrossoverSlot>) => {
    setSlots(prev => prev.map((s, i) => i === index ? { ...s, ...data } : s));
  };

  const currentSlot = slots[activeSlotIndex];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'char') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'user') setUserImage(reader.result as string);
        else updateSlot(activeSlotIndex, { charImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (t: { name: string, action: string, location: string }) => {
    updateSlot(activeSlotIndex, { action: t.action, location: t.location });
    setSelectedTemplate(t.name);
    toast.success(`เลือกเทมเพลตสำหรับรูปที่ ${activeSlotIndex + 1}: ${t.name}`);
  };

  const handleGenerate = async () => {
    // Validate all active slots
    for (let i = 0; i < imageCount; i++) {
      if (!slots[i].charDesc.trim()) {
        toast.error(`กรุณาระบุชื่อตัวละครสำหรับรูปที่ ${i + 1}`);
        setActiveSlotIndex(i);
        return;
      }
      if (!slots[i].location.trim() || !slots[i].action.trim()) {
        toast.error(`กรุณาระบุสถานที่และการกระทำสำหรับรูปที่ ${i + 1}`);
        setActiveSlotIndex(i);
        return;
      }
    }
    
    setLoading(true);
    setLoadingProgress(0);
    setResultImages([]);
    
    try {
      const newImages: string[] = [];
      const updatedSlots = [...slots];
      
      for (let i = 0; i < imageCount; i++) {
        setLoadingProgress(Math.round(((i) / imageCount) * 100));
        const slot = slots[i];
        
        // Generate detailed prompts first
        const crossoverData = await generateCrossoverDetailed({
          userDesc,
          charDesc: slot.charDesc,
          location: slot.location,
          action: slot.action,
          atmosphere: slot.atmosphere,
          timeOfDay: slot.timeOfDay,
          style,
          userImage: userImage || undefined,
          charImage: slot.charImage || undefined,
          enableVoiceover,
          voiceGender,
          voiceTone
        });

        // Store prompts in slot
        updatedSlots[i] = {
          ...slot,
          imagePrompt: crossoverData.image_prompt,
          videoPrompt: crossoverData.video_prompt
        };
        setSlots([...updatedSlots]);

        // Generate the image using the prompt
        const imageUrl = await generateCrossoverImage(crossoverData.image_prompt, userImage || undefined, slot.charImage || undefined);
        newImages.push(imageUrl);
        setResultImages([...newImages]);
      }
      
      setLoadingProgress(100);
      toast.success(`สร้างภาพ Crossover สำเร็จ ${imageCount} รูป!`);
    } catch (error: any) {
      console.error('Error generating crossover image:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการสร้างภาพ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <Toaster position="top-center" richColors />
      
      {/* Left Panel - Controls */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
            <UserGroupIcon className="w-6 h-6 text-[#0066ff]" />
            Crossover Gen
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            พาตัวเองไปยืนข้างตัวละครโปรด ดารา หรือใครก็ได้ในจักรวาลที่คุณเลือก!
          </p>

          <div className="space-y-6">
            {/* Image Count & Slot Selection */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">จำนวนรูปที่ต้องการสร้าง</label>
                <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        setImageCount(num);
                        if (activeSlotIndex >= num) setActiveSlotIndex(0);
                      }}
                      className={`px-4 py-2 text-sm font-bold transition-all ${
                        imageCount === num ? 'bg-[#0066ff] text-white' : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {imageCount > 1 && (
                <div className="flex gap-2 p-1 bg-background/50 rounded-xl border border-border/50">
                  {Array.from({ length: imageCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlotIndex(i)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        activeSlotIndex === i 
                          ? 'bg-[#0066ff] text-white shadow-lg' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      รูปที่ {i + 1}
                      {slots[i].charDesc && <span className="block text-[8px] font-normal truncate px-1 opacity-70">{slots[i].charDesc}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Section (Global) */}
            <div className="p-4 bg-background/50 rounded-xl border border-border/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-[#0066ff] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                ตัวคุณ (Subject 1 - ใช้ร่วมกันทุกรูป)
              </h3>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">รูปหน้าของคุณ (ไม่บังคับ)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-card/80 text-white rounded-xl border border-border transition-colors text-sm">
                      <PhotoIcon className="w-4 h-4" />
                      {userImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'user')} />
                  </label>
                  {userImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
                      <img src={userImage} alt="User" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">การแต่งตัว / ลักษณะ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={userDesc}
                  onChange={(e) => setUserDesc(e.target.value)}
                  placeholder="เช่น ใส่เสื้อแจ็คเก็ตสีแดง, สวมแว่นตา"
                  className="w-full p-2.5 bg-card border border-border rounded-xl text-white text-sm focus:outline-none focus:border-[#0066ff] transition-colors"
                />
              </div>
            </div>

            {/* Character Section (Per Slot) */}
            <div className="p-4 bg-[#0066ff]/5 rounded-xl border border-[#0066ff]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#0066ff] text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                ข้อมูลรูปที่ {activeSlotIndex + 1}
              </div>
              
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-[#0066ff] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                ตัวละคร / ดารา (Subject 2)
              </h3>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">ชื่อตัวละคร หรือ ลักษณะ <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={currentSlot.charDesc}
                  onChange={(e) => updateSlot(activeSlotIndex, { charDesc: e.target.value })}
                  placeholder="เช่น Iron Man, Gojo Satoru, ผู้หญิงผมบลอนด์"
                  className="w-full p-2.5 bg-card border border-border rounded-xl text-white text-sm focus:outline-none focus:border-[#0066ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">รูปอ้างอิงตัวละคร (ไม่บังคับ)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-card/80 text-white rounded-xl border border-border transition-colors text-sm">
                      <PhotoIcon className="w-4 h-4" />
                      {currentSlot.charImage ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'char')} />
                  </label>
                  {currentSlot.charImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
                      <img src={currentSlot.charImage} alt="Character" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scene & Action (Per Slot) */}
            <div className="p-4 bg-background/50 rounded-xl border border-border/50">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-[#0066ff] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
                สถานที่และการกระทำ
              </h3>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">สถานที่ (Location) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={currentSlot.location}
                    onChange={(e) => updateSlot(activeSlotIndex, { location: e.target.value })}
                    placeholder="เช่น ปารีส, ยานอวกาศ, ป่าเวทมนตร์"
                    className="w-full pl-9 p-2.5 bg-card border border-border rounded-xl text-white text-sm focus:outline-none focus:border-[#0066ff] transition-colors"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-400 mb-1">การกระทำ (Action) <span className="text-red-400">*</span></label>
                <textarea
                  value={currentSlot.action}
                  onChange={(e) => updateSlot(activeSlotIndex, { action: e.target.value })}
                  placeholder="เช่น ยืนหันหลังชนกันเตรียมต่อสู้, นั่งจิบกาแฟ"
                  className="w-full p-2.5 bg-card border border-border rounded-xl text-white text-sm focus:outline-none focus:border-[#0066ff] transition-colors h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">บรรยากาศ</label>
                  <select
                    value={currentSlot.atmosphere}
                    onChange={(e) => updateSlot(activeSlotIndex, { atmosphere: e.target.value })}
                    className="w-full p-2 bg-card border border-border rounded-lg text-white text-xs focus:outline-none focus:border-[#0066ff]"
                  >
                    {atmospheres.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">ช่วงเวลา</label>
                  <select
                    value={currentSlot.timeOfDay}
                    onChange={(e) => updateSlot(activeSlotIndex, { timeOfDay: e.target.value })}
                    className="w-full p-2 bg-card border border-border rounded-lg text-white text-xs focus:outline-none focus:border-[#0066ff]"
                  >
                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Voiceover Settings */}
            <div className="p-4 bg-background/50 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="bg-[#0066ff] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
                  เสียงพากย์ (Voiceover)
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={enableVoiceover} onChange={(e) => setEnableVoiceover(e.target.checked)} />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0066ff]"></div>
                </label>
              </div>

              {enableVoiceover && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">เพศของเสียง</label>
                    <select
                      value={voiceGender}
                      onChange={(e) => setVoiceGender(e.target.value as VoiceGender)}
                      className="w-full p-2 bg-card border border-border rounded-lg text-white text-xs focus:outline-none focus:border-[#0066ff]"
                    >
                      {Object.values(VoiceGender).map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-400 mb-1 uppercase tracking-wider">โทนเสียง</label>
                    <select
                      value={voiceTone}
                      onChange={(e) => setVoiceTone(e.target.value as VoiceTone)}
                      className="w-full p-2 bg-card border border-border rounded-lg text-white text-xs focus:outline-none focus:border-[#0066ff]"
                    >
                      {Object.values(VoiceTone).map(tone => (
                        <option key={tone} value={tone}>{tone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Style (Global) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">สไตล์ภาพรวม</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as VisualStyle)}
                className="w-full p-3 bg-card border border-border rounded-xl text-white text-sm focus:outline-none focus:border-[#0066ff] appearance-none"
              >
                {Object.values(VisualStyle).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                loading 
                  ? 'bg-[#0066ff]/50 cursor-not-allowed' 
                  : 'bg-[#0066ff] hover:bg-[#0052cc] hover:shadow-[0_0_20px_rgba(0,102,255,0.4)]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังสร้างภาพ Crossover...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  สร้างภาพ Crossover
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Templates & Output */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        
        {/* Templates Section */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[#0066ff]" />
            ไอเดียเทมเพลต (คลิกเพื่อเลือก)
          </h3>
          
          <div className="space-y-4">
            {templateCategories.map((category, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-medium text-gray-400 mb-2">{category.title}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.items.map((t, i) => (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 102, 255, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      animate={selectedTemplate === t.name ? { scale: [1, 1.05, 1] } : {}}
                      onClick={() => handleTemplateSelect(t)}
                      className={`p-2 border rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 ${
                        selectedTemplate === t.name 
                          ? 'bg-[#0066ff]/20 border-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]' 
                          : 'bg-background border-border text-gray-400 hover:text-white hover:border-gray-500'
                      }`}
                    >
                      {selectedTemplate === t.name ? (
                        <CheckCircleIcon className="w-3.5 h-3.5 text-[#0066ff] shrink-0" />
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

        {/* Output Section */}
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex-1 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">ผลลัพธ์ (Result)</h3>
            {resultImages.length > 0 && (
              <span className="text-xs text-gray-500">{resultImages.length} รูปที่สร้างเสร็จ</span>
            )}
          </div>
          
          <div className="flex-1 bg-background rounded-xl border border-border flex items-center justify-center overflow-hidden relative p-4">
            {loading ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#0066ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-4 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm animate-pulse">กำลังผสานจักรวาล... ({loadingProgress}%)</p>
                </div>
              </div>
            ) : resultImages.length > 0 ? (
              <div className={`grid gap-4 w-full h-full ${
                resultImages.length === 1 ? 'grid-cols-1' : 
                resultImages.length === 2 ? 'grid-cols-2' : 
                'grid-cols-2'
              }`}>
                {resultImages.map((img, idx) => (
                  <div key={idx} className="relative group aspect-[9/16] bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                    <img 
                      src={img} 
                      alt={`Result ${idx + 1}`} 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => downloadImage(img, `crossover-${slots[idx].charDesc.replace(/\s+/g, '-') || 'character'}-${idx + 1}`)}
                        className="p-2 bg-[#0066ff] text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                        title="ดาวน์โหลด"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 flex flex-col items-center gap-3">
                <UserGroupIcon className="w-12 h-12 opacity-20" />
                <p>ภาพ Crossover ของคุณจะแสดงที่นี่</p>
              </div>
            )}
          </div>

          {/* Prompt Display Section */}
          <AnimatePresence>
            {resultImages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ClipboardIcon className="w-4 h-4 text-[#0066ff]" />
                    Prompts สำหรับนำไปใช้งานต่อ
                  </h4>
                  {imageCount > 1 && (
                    <button 
                      onClick={() => setShowVideoGen(!showVideoGen)}
                      className="text-xs font-bold text-[#0066ff] hover:underline flex items-center gap-1"
                    >
                      <VideoCameraIcon className="w-3 h-3" />
                      {showVideoGen ? 'ซ่อนโหมดวิดีโอ' : 'โหมดทำวิดีโอต่อเนื่อง'}
                    </button>
                  )}
                </div>

                {showVideoGen && imageCount >= 2 && (
                  <div className="p-4 bg-[#0066ff]/10 border border-[#0066ff]/30 rounded-xl mb-4">
                    <h5 className="text-xs font-bold text-[#0066ff] mb-2 uppercase tracking-wider">ไอเดียทำวิดีโอ (Video Transition)</h5>
                    <p className="text-[11px] text-gray-400 mb-3">
                      ใช้รูปที่ 1 เป็น <b>Start Image</b> และรูปที่ 2 เป็น <b>End Image</b> เพื่อสร้างวิดีโอที่เหมือนคุณเดินจากคนหนึ่งไปหาอีกคนหนึ่ง
                    </p>
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-500 mb-1">Video Prompt แนะนำ:</p>
                        <p className="text-xs text-white italic">
                          "The camera pans smoothly from the first person to the second person, showing a seamless transition in the same environment. The user walks from one selfie to another. Cinematic lighting."
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText("The camera pans smoothly from the first person to the second person, showing a seamless transition in the same environment. The user walks from one selfie to another. Cinematic lighting.");
                          toast.success('คัดลอก Video Prompt แนะนำแล้ว');
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <ClipboardIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slots.slice(0, imageCount).map((slot, idx) => (
                    <div key={idx} className="bg-background/50 border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold bg-[#0066ff] text-white px-2 py-0.5 rounded uppercase">รูปที่ {idx + 1}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Image Prompt</label>
                            <button 
                              onClick={() => {
                                if (slot.imagePrompt) {
                                  navigator.clipboard.writeText(slot.imagePrompt);
                                  toast.success(`คัดลอก Image Prompt รูปที่ ${idx + 1} แล้ว`);
                                }
                              }}
                              className="text-[10px] text-[#0066ff] hover:underline"
                            >
                              คัดลอก
                            </button>
                          </div>
                          <div className="p-2 bg-black/30 rounded border border-border text-[11px] text-gray-300 line-clamp-2 hover:line-clamp-none transition-all cursor-help">
                            {slot.imagePrompt || 'ยังไม่มีข้อมูล'}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Video Prompt (Veo)</label>
                            <button 
                              onClick={() => {
                                if (slot.videoPrompt) {
                                  navigator.clipboard.writeText(slot.videoPrompt);
                                  toast.success(`คัดลอก Video Prompt รูปที่ ${idx + 1} แล้ว`);
                                }
                              }}
                              className="text-[10px] text-[#0066ff] hover:underline"
                            >
                              คัดลอก
                            </button>
                          </div>
                          <div className="p-2 bg-black/30 rounded border border-border text-[11px] text-gray-300 line-clamp-2 hover:line-clamp-none transition-all cursor-help">
                            {slot.videoPrompt || 'ยังไม่มีข้อมูล'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
