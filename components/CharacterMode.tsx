import React, { useState, useEffect } from 'react';
import { VisualStyle, CharacterData } from '../types';
import { generateCharacter, generateImage, generateRandomConcept } from '../services/geminiService';
import { SparklesIcon, UserIcon, ClockIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { downloadImage } from '../services/downloadService';
import { Tooltip } from './Tooltip';

export const CharacterMode: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [gender, setGender] = useState('ชาย');
  const [age, setAge] = useState('30');
  const [skinTone, setSkinTone] = useState('ผิวขาว');
  const [hairStyle, setHairStyle] = useState('ผมยาวสีดำ');
  const [faceShape, setFaceShape] = useState('คนไทย');
  const [personality, setPersonality] = useState('Friendly');
  const [facialHair, setFacialHair] = useState('');
  const [clothing, setClothing] = useState('แขนยาว สปอร์ต');
  const [clothingColor, setClothingColor] = useState('ขาว');
  const [accessories, setAccessories] = useState('');
  const [bodyDetails, setBodyDetails] = useState('');
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.Anime);
  const [loading, setLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<CharacterData | null>(null);
  const [history, setHistory] = useState<CharacterData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('character_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse character history', e);
      }
    }
  }, []);

  const saveToHistory = (data: CharacterData) => {
    const newHistory = [data, ...history.filter(h => h.name !== data.name)].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('character_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการสร้างทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      localStorage.removeItem('character_history');
    }
  };

  const skinTones = ['ผิวขาว', 'ผิวขาวเหลือง', 'ผิวสองสี', 'ผิวสีน้ำผึ้ง', 'ผิวเข้ม', 'ผิวแทน'];
  const hairStyles = ['ผมยาวสีดำ', 'ผมสั้นทรงนักเรียน', 'ผมบ๊อบ', 'ผมดัดลอน', 'ผมมัดหางม้า', 'ผมทรงสกินเฮด', 'ผมยาวสีทอง', 'ผมทรงโมฮอว์ก'];
  const faceShapes = ['คนไทย', 'เอเชียตะวันออก', 'ตะวันตก', 'การ์ตูนดิสนีย์', 'อนิเมะ', 'ล้ำยุค/ไซเบอร์'];
  const personalities = ['เป็นมิตร', 'กล้าหาญ', 'ลึกลับ', 'เย็นชา', 'ร่าเริง', 'ฉลาดหลักแหลม', 'ชั่วร้าย', 'ตลกขบขัน'];
  const clothingOptions = ['เสื้อเอวลอย (Crop Top)', 'แขนยาว สปอร์ต', 'ชุดไทยประยุกต์', 'ชุดเกราะนักรบ', 'ชุดนักเรียน', 'ชุดสูททางการ', 'ชุดลำลองเสื้อยืด', 'ชุดแฟนตาซี', 'ชุดไซเบอร์พังค์'];
  const clothingColors = ['ขาว', 'ดำ', 'แดง', 'น้ำเงิน'];

  const handleSuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggestedConcept = await generateRandomConcept();
      setConcept(suggestedConcept);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    setResult(null);
    setLoadingStatus('กำลังออกแบบตัวละคร...');
    try {
      const data = await generateCharacter({ 
        concept, 
        gender, 
        age, 
        skinTone, 
        hairStyle, 
        faceShape, 
        personality, 
        facialHair: gender === 'ชาย' ? facialHair : '', 
        clothing, 
        clothingColor, 
        accessories, 
        bodyDetails,
        style 
      });
      setResult(data);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        saveToHistory(data);
        setLoading(false);
        setLoadingStatus('');
        return;
      }

      setLoadingStatus('กำลังวาดภาพตัวละคร...');
      const imageUrl = await generateImage(data.image_prompt);
      const finalData = { ...data, image_url: imageUrl };
      setResult(finalData);
      saveToHistory(finalData);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "เกิดข้อผิดพลาดในการสร้างตัวละคร";
      
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-white">Character <span className="text-[#0066ff]">Creator</span></h1>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-[#0066ff] text-white' : 'bg-card text-gray-400 hover:text-white'}`}
              title="ประวัติการสร้าง"
            >
              <ClockIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-400 text-sm">ออกแบบตัวละครสุดเท่ พร้อมประวัติและพลัง</p>
        </div>
        
        {showHistory ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#0066ff]" /> ประวัติการสร้าง
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
                      setResult(h);
                      setShowHistory(false);
                    }}
                    className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-[#0066ff] transition-all text-left group"
                  >
                    {h.image_url ? (
                      <img src={h.image_url} alt={h.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-[#0066ff] transition-colors">{h.name}</h4>
                      <p className="text-gray-500 text-[10px] truncate">{h.title}</p>
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
            {/* Concept */}
            <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              💡 คอนเซปต์ตัวละคร
              <Tooltip content="ไอเดียหลักของตัวละคร เช่น นักรบมังกร, แฮกเกอร์ไซเบอร์พังค์" />
            </label>
            <div className="relative group mt-2">
              <input type="text" value={concept} onChange={e => setConcept(e.target.value)} placeholder="เช่น นักรบมังกร, แฮกเกอร์ไซเบอร์พังค์" className="w-full bg-card border border-border rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
              <button
                onClick={handleSuggest}
                disabled={isSuggesting}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                  isSuggesting 
                  ? 'bg-gray-800 text-gray-600' 
                  : 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white'
                }`}
                title="สุ่มไอเดียคอนเซปต์"
              >
                <SparklesIcon className={`w-5 h-5 ${isSuggesting ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Gender & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase flex items-center">
                เพศ
                <Tooltip content="ระบุเพศของตัวละคร" />
              </label>
              <div className="flex gap-2 mt-2">
                {['ชาย', 'หญิง'].map(g => (
                  <button key={g} onClick={() => setGender(g)} className={`flex-1 py-3 rounded-xl font-bold border transition-all ${gender === g ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase flex items-center">
                อายุ
                <Tooltip content="ระบุอายุของตัวละคร (มีผลต่อรูปลักษณ์)" />
              </label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              สีผิว
              <Tooltip content="เลือกสีผิวที่ต้องการ" />
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {skinTones.map(t => (
                <button key={t} onClick={() => setSkinTone(t)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${skinTone === t ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Hairstyle */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              ทรงผม
              <Tooltip content="เลือกทรงผมและสีผม" />
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {hairStyles.map(h => (
                <button key={h} onClick={() => setHairStyle(h)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${hairStyle === h ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{h}</button>
              ))}
            </div>
          </div>

          {/* Face Shape */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              โครงหน้า / สัญชาติ
              <Tooltip content="ระบุโครงหน้าหรือสัญชาติ" />
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {faceShapes.map(f => (
                <button key={f} onClick={() => setFaceShape(f)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${faceShape === f ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{f}</button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              บุคลิก
              <Tooltip content="ระบุลักษณะนิสัยของตัวละคร" />
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {personalities.map(p => (
                <button key={p} onClick={() => setPersonality(p)} className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${personality === p ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{p}</button>
              ))}
            </div>
          </div>

          {/* Facial Hair (Male only) */}
          {gender === 'ชาย' && (
            <div>
              <label className="text-xs font-black text-gray-500 uppercase flex items-center">
                หนวดเครา
                <Tooltip content="ระบุหนวดเครา (สำหรับตัวละครชาย)" />
              </label>
              <input type="text" value={facialHair} onChange={e => setFacialHair(e.target.value)} placeholder="เช่น หนวดบางๆ, เคราเต็มใบหน้า" className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
            </div>
          )}

          {/* Clothing */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              เสื้อผ้า
              <Tooltip content="เลือกสไตล์การแต่งกาย" />
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {clothingOptions.map(c => (
                <button key={c} onClick={() => setClothing(c)} className={`p-2 rounded-lg text-xs font-bold border transition-all ${clothing === c ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Clothing Color */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              สีเสื้อ
              <Tooltip content="เลือกสีหลักของเสื้อผ้า" />
            </label>
            <div className="flex gap-2 mt-2">
              {clothingColors.map(c => (
                <button key={c} onClick={() => setClothingColor(c)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${clothingColor === c ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              อุปกรณ์เสริม
              <Tooltip content="ระบุอุปกรณ์เสริม เช่น แว่นตา, ดาบ, กระเป๋า" />
            </label>
            <input type="text" value={accessories} onChange={e => setAccessories(e.target.value)} placeholder="เช่น แว่นกันแดด, ดาบ, กระเป๋าเป้" className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
          </div>

          {/* Body Details */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              รายละเอียดรูปร่าง
              <Tooltip content="ระบุรายละเอียดรูปร่าง เช่น มีกล้ามเนื้อ, เอวบาง" />
            </label>
            <input type="text" value={bodyDetails} onChange={e => setBodyDetails(e.target.value)} placeholder="เช่น หุ่นนางแบบ, มีกล้ามเนื้อ, นมใหญ่, เอวบาง" className="w-full bg-card border border-border rounded-xl p-3 text-white mt-2 focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20" />
          </div>

          {/* Visual Style */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase flex items-center">
              🎨 สไตล์ภาพ
              <Tooltip content="เลือกสไตล์ภาพที่ต้องการสร้าง" />
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.values(VisualStyle).map(s => (
                <button key={s} onClick={() => setStyle(s)} className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${style === s ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' : 'bg-card border-border text-gray-400 hover:text-white hover:border-gray-500'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        )}

        <div className="pt-4 mt-auto space-y-4">
          <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
            <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
              ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
              (Banned words / Sensitive topics)
            </p>
          </div>
          <button onClick={handleGenerate} disabled={loading || !concept.trim()} className="w-full py-4 rounded-xl font-black text-lg bg-[#0066ff] text-white flex justify-center items-center gap-2 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-[#0055dd] transition-all active:scale-95">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังสร้าง...</span>
              </>
            ) : <><SparklesIcon className="w-6 h-6"/> สร้างตัวละคร</>}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-full lg:w-2/3 p-6 lg:p-12 bg-background overflow-y-auto custom-scrollbar flex flex-col items-center">
        {loading && !result && (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-16 h-16 border-4 border-[#0066ff]/30 border-t-[#0066ff] rounded-full animate-spin"></div>
            <p className="text-[#0066ff] font-bold animate-pulse">{loadingStatus}</p>
          </div>
        )}
        {result && (
          <div className="max-w-3xl w-full space-y-8 animate-fade-in">
            {loading && loadingStatus && (
              <div className="flex items-center gap-4 bg-[#0066ff]/10 p-4 rounded-2xl border border-[#0066ff]/20 animate-pulse mb-4">
                <div className="w-5 h-5 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#00aaff] text-sm font-bold">{loadingStatus}</span>
              </div>
            )}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black text-white">{result.name}</h2>
              <p className="text-xl text-[#0066ff] font-bold">{result.title}</p>
            </div>
            
            {result.image_url ? (
              <div className="relative group/img w-full max-w-md mx-auto">
                <img src={result.image_url} alt={result.name} className="w-full rounded-2xl shadow-2xl shadow-[#0066ff]/20 border border-white/10" />
                <button 
                  onClick={() => downloadImage(result.image_url!, `character-${result.name}.png`)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm gap-2 rounded-2xl"
                >
                  <ArrowDownTrayIcon className="w-6 h-6" /> Download Image
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto aspect-[9/16] bg-card rounded-2xl flex items-center justify-center border border-border">
                <p className="text-gray-500">No Image</p>
              </div>
            )}

            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="text-lg font-black text-white border-b border-border pb-2">📖 ประวัติ (Backstory)</h3>
              <p className="text-gray-300 leading-relaxed">{result.backstory}</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="text-lg font-black text-white border-b border-border pb-2">👁️ รูปลักษณ์ (Appearance)</h3>
              <p className="text-gray-300 leading-relaxed">{result.appearance}</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <h3 className="text-lg font-black text-white border-b border-border pb-2">⚔️ ความสามารถ (Abilities)</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                {result.abilities.map((ability, idx) => (
                  <li key={idx}>{ability}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            <UserIcon className="w-24 h-24 opacity-20" />
            <p className="text-lg font-bold">กรอกคอนเซปต์แล้วกดสร้างตัวละครได้เลย!</p>
          </div>
        )}
      </div>
    </div>
  );
};
