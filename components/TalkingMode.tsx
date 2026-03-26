
import React, { useState, useRef, useEffect } from 'react';
import { generateTalkingVideo, generateTalkingFaceDetailed, generateImage, TalkingFaceData, generateRandomFood } from '../services/geminiService';
import { downloadImage } from '../services/downloadService';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  SparklesIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  FaceSmileIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowRightIcon,
  GiftIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { toast, Toaster } from 'sonner';

const FACE_STYLES = [
  { id: 'Cute', name: 'น่ารัก (Cute)', icon: FaceSmileIcon },
  { id: 'Funny', name: 'ตลก (Funny)', icon: SparklesIcon },
  { id: 'Realistic', name: 'สมจริง (Realistic)', icon: VideoCameraIcon },
  { id: 'Angry', name: 'เกรี้ยวกราด (Angry)', icon: SparklesIcon }
];

export const TalkingMode: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [foodItem, setFoodItem] = useState('');
  const [faceStyle, setFaceStyle] = useState('Cute');
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<TalkingFaceData | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [hasPaidKey, setHasPaidKey] = useState<boolean | null>(null);
  const [history, setHistory] = useState<{data: TalkingFaceData, imageUrl: string | null}[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('talking_face_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse talking face history', e);
      }
    }
  }, []);

  const saveToHistory = (data: TalkingFaceData, imageUrl: string | null) => {
    setHistory(prev => {
      const newHistory = [{data, imageUrl}, ...prev.filter(h => h.data.image_prompt !== data.image_prompt)].slice(0, 20);
      localStorage.setItem('talking_face_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการสร้างทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      localStorage.removeItem('talking_face_history');
    }
  };

  useEffect(() => {
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
    if (!foodItem && !media) {
      toast.error('กรุณากรอกของกินหรืออัปโหลดรูปภาพ');
      return;
    }
    setLoading(true);
    try {
      const data = await generateTalkingFaceDetailed(faceStyle, media || undefined, foodItem);
      setGeneratedData(data);
      setResult(null);
      setGeneratedImageUrl(null);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (!skipImages) {
        toast.info('กำลังสร้างรูปภาพโดยใช้รูปของคุณเป็นต้นแบบ...');
        try {
          const url = await generateImage(data.image_prompt, media || undefined);
          setGeneratedImageUrl(url);
          setMedia(url);
          saveToHistory(data, url);
          toast.success('สร้างรูปภาพสำเร็จ!');
        } catch (imgErr) {
          console.error("Image generation failed:", imgErr);
          saveToHistory(data, null);
          toast.error("สร้างรูปภาพไม่สำเร็จ แต่คุณยังสามารถก๊อปปี้ Prompt ไปเจนเองได้");
        }
      } else {
        saveToHistory(data, null);
        toast.success('สร้าง Prompt สำเร็จ! (ข้ามการสร้างรูปภาพตามที่ตั้งค่าไว้)');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการสร้าง Prompt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomFood = async () => {
    const food = await generateRandomFood();
    setFoodItem(food);
    toast.success('สุ่มของกิน: ' + food);
  };

  const handleGenerateImage = async () => {
    if (!generatedData) return;
    setImageLoading(true);
    try {
      const url = await generateImage(generatedData.image_prompt, media || undefined);
      setGeneratedImageUrl(url);
      setMedia(url); // Set as current media so it can be used for video
      saveToHistory(generatedData, url);
      toast.success('สร้างรูปภาพสำเร็จ!');
    } catch (error: any) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการสร้างรูปภาพ: " + error.message);
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!media || !generatedData) {
      toast.error('กรุณามีรูปภาพและสร้าง Prompt ก่อน');
      return;
    }
    setVideoLoading(true);
    try {
      const videoUrl = await generateTalkingVideo(generatedData.video_prompt, media);
      setResult(videoUrl);
      toast.success('สร้างวิดีโอสำเร็จ!');
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("PERMISSION_DENIED")) {
        const aistudio = (window as any).aistudio;
        if (aistudio?.openSelectKey) {
          if (confirm("คุณยังไม่ได้เชื่อมต่อ Paid API Key หรือ Key ของคุณไม่มีสิทธิ์ใช้งานฟีเจอร์นี้ ต้องการเชื่อมต่อตอนนี้เลยไหม? (จำเป็นสำหรับการสร้างวิดีโอ)")) {
            await aistudio.openSelectKey();
            setHasPaidKey(true);
          }
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("เกิดข้อผิดพลาดในการสร้างวิดีโอ: " + error.message);
      }
    } finally {
      setVideoLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('คัดลอกแล้ว');
  };

  const clearMedia = () => {
    setMedia(null);
    setResult(null);
    setGeneratedData(null);
    setGeneratedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-background">
      <Toaster position="top-center" richColors />
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              Talking <span className="text-[#0066ff]">Face</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              ปลุกเสกสิ่งของ/อวัยวะ ให้พูดได้! (เทรน Viral)
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
                <ClockIcon className="w-5 h-5 text-[#0066ff]" /> ประวัติหน้าพูดได้
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
                      setGeneratedData(h.data);
                      setGeneratedImageUrl(h.imageUrl);
                      if (h.imageUrl) setMedia(h.imageUrl);
                      setShowHistory(false);
                    }}
                    className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-[#0066ff] transition-all text-left group"
                  >
                    {h.imageUrl ? (
                      <img src={h.imageUrl} alt="Talking Face" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                        <FaceSmileIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate group-hover:text-[#0066ff] transition-colors">{h.data.image_prompt.substring(0, 30)}...</h4>
                      <p className="text-gray-500 text-[10px] truncate">Talking Face Prompt</p>
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
            {/* Food Item Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GiftIcon className="w-4 h-4 text-[#0066ff]" /> ของกินที่ต้องการ (Food Item)
              </span>
              <button 
                onClick={handleRandomFood}
                className="text-[#0066ff] hover:underline flex items-center gap-1"
              >
                <ArrowPathIcon className="w-3 h-3" /> สุ่มออโต้
              </button>
            </label>
            <input 
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="เช่น ทุเรียน, พิซซ่า, มังคุด..."
              className="w-full bg-card border border-border rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#0066ff]"
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
              📸 อัปโหลดรูป (สิ่งของ/อวัยวะ)
            </label>
            {!media ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066ff]/50 hover:bg-[#0066ff]/5 transition-all group"
              >
                <PhotoIcon className="w-12 h-12 text-gray-600 group-hover:text-[#0066ff] mb-2" />
                <p className="text-sm font-bold text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
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
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {/* Face Style */}
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">สไตล์ใบหน้า</label>
            <div className="grid grid-cols-2 gap-2">
              {FACE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setFaceStyle(style.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    faceStyle === style.id 
                      ? 'bg-[#0066ff] border-[#0066ff] text-white shadow-lg shadow-[#0066ff]/20' 
                      : 'bg-card border-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <style.icon className="w-4 h-4 shrink-0" />
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
            <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
              ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
              (Banned words / Sensitive topics)
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || (!foodItem && !media)}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading || (!foodItem && !media)
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            <span>{loading ? 'กำลังประมวลผล...' : 'สร้าง Prompt (รูปภาพ & วิดีโอ)'}</span>
          </button>

          {hasPaidKey === false && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-500/80 leading-relaxed">
                  <strong>จำเป็นต้องใช้ Paid API Key:</strong> ฟีเจอร์สร้างวิดีโอ (Veo) ต้องใช้ API Key จากโปรเจกต์ Google Cloud ที่เปิดการเรียกเก็บเงินแล้ว
                </p>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="w-full py-2 bg-yellow-500 text-black rounded-lg text-xs font-black hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
              >
                <KeyIcon className="w-4 h-4" />
                เชื่อมต่อ Paid API Key
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-[#05050a] lg:h-full lg:overflow-y-auto p-8 flex flex-col items-center justify-center">
        {!generatedData && !result ? (
          <div className="text-center space-y-6 opacity-50">
            <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center border-2 border-dashed border-border mx-auto">
              <FaceSmileIcon className="w-16 h-16 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-500">พร้อมปลุกเสกแล้ว</h3>
            <p className="text-gray-400 max-w-sm">
              อัปโหลดรูปสิ่งของหรืออวัยวะของคุณ <br />หรือพิมพ์ของกินที่ต้องการเพื่อสร้าง Prompt ใหม่ได้เลย!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8 animate-fade-in flex flex-col items-center">
            {/* Prompt Results */}
            {generatedData && (
              <div className="w-full space-y-8">
                {/* Image Prompt */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <PhotoIcon className="w-5 h-5 text-[#0066ff]" /> Image Prompt
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopy(generatedData.image_prompt, 'image')}
                        className={`p-2 rounded-lg transition-all ${
                          copied === 'image' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {copied === 'image' ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={handleGenerateImage}
                        disabled={imageLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-[#0066ff] text-white hover:bg-[#0055dd] transition-all disabled:opacity-50"
                      >
                        {imageLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                        {imageLoading ? 'กำลังเจนรูป...' : 'เจนรูปภาพ'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#0a1125] border border-[#0066ff]/20 rounded-2xl p-4 text-gray-300 text-xs italic leading-relaxed">
                    {generatedData.image_prompt}
                  </div>
                </div>

                {/* Video Prompt */}
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <VideoCameraIcon className="w-5 h-5 text-purple-500" /> Video Prompt
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopy(generatedData.video_prompt, 'video')}
                        className={`p-2 rounded-lg transition-all ${
                          copied === 'video' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {copied === 'video' ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={handleGenerateVideo}
                        disabled={videoLoading || !media}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50"
                      >
                        {videoLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <VideoCameraIcon className="w-4 h-4" />}
                        {videoLoading ? 'กำลังเจนวิดีโอ...' : 'เจนวิดีโอ (Paid Key)'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#1a0b25] border border-purple-500/20 rounded-2xl p-4 text-gray-300 text-xs italic leading-relaxed">
                    {generatedData.video_prompt}
                  </div>
                </div>
              </div>
            )}

            {/* Video Result */}
            {result && (
              <div className="w-full space-y-8 animate-scale-in flex flex-col items-center">
                <div className="w-full flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Talking <span className="text-[#0066ff]">Result</span>
                  </h2>
                  <button 
                    onClick={() => downloadImage(result, 'talking-face')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white transition-all"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    ดาวน์โหลด
                  </button>
                </div>

                <div className="w-full aspect-[9/16] bg-card border border-border rounded-3xl overflow-hidden shadow-2xl relative group">
                  <video src={result} controls autoPlay loop className="w-full h-full object-contain bg-black" />
                </div>
              </div>
            )}

            <div className="bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-2xl p-6 text-center w-full">
              <p className="text-sm text-gray-400">
                <strong className="text-[#0066ff]">Tip:</strong> ก๊อปปี้ <span className="font-bold">Master Prompt</span> ไปวางในเครื่องมืออย่าง <span className="underline">Flow</span>, <span className="underline">Gemini</span> หรือ <span className="underline">Grok</span> ได้เลย!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
