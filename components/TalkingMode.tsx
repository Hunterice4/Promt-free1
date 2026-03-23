
import React, { useState, useRef, useEffect } from 'react';
import { generateTalkingVideo, getTalkingVideoPrompt } from '../services/geminiService';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  SparklesIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  FaceSmileIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/solid';

const FACE_STYLES = [
  { id: 'Cute', name: 'น่ารัก (Cute)', icon: FaceSmileIcon },
  { id: 'Funny', name: 'ตลก (Funny)', icon: SparklesIcon },
  { id: 'Realistic', name: 'สมจริง (Realistic)', icon: VideoCameraIcon },
  { id: 'Angry', name: 'เกรี้ยวกราด (Angry)', icon: SparklesIcon }
];

export const TalkingMode: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [faceStyle, setFaceStyle] = useState('Cute');
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasPaidKey, setHasPaidKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!media || !script) return;
    setLoading(true);
    try {
      const prompt = getTalkingVideoPrompt(script, faceStyle);
      setGeneratedPrompt(prompt);
      setResult(null);
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสร้าง Prompt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!media || !script) return;
    setVideoLoading(true);
    try {
      const videoUrl = await generateTalkingVideo(script, media, faceStyle);
      setResult(videoUrl);
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
          alert(error.message);
        }
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างวิดีโอ: " + error.message);
      }
    } finally {
      setVideoLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setResult(null);
    setGeneratedPrompt(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = 'talking-object.mp4';
      link.click();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-background">
      {/* Input Section */}
      <div className="w-full lg:w-1/3 p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Talking <span className="text-[#0066ff]">Face</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            ปลุกเสกสิ่งของ/อวัยวะ ให้พูดได้! (เทรน Viral)
          </p>
        </div>

        <div className="space-y-6">
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

          {/* Script Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" /> บทพูด (Script)
            </label>
            <textarea 
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="พิมพ์สิ่งที่อยากให้มันพูด..."
              className="w-full h-32 bg-card border border-border rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#0066ff] resize-none"
            />
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
            disabled={loading || !media || !script}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading || !media || !script
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            <span>{loading ? 'กำลังประมวลผล...' : 'สร้าง Prompt สำหรับวิดีโอ'}</span>
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
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-[#05050a] lg:h-full lg:overflow-y-auto p-8 flex flex-col items-center justify-center">
        {!generatedPrompt && !result ? (
          <div className="text-center space-y-6 opacity-50">
            <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center border-2 border-dashed border-border mx-auto">
              <FaceSmileIcon className="w-16 h-16 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-500">พร้อมปลุกเสกแล้ว</h3>
            <p className="text-gray-400 max-w-sm">
              อัปโหลดรูปสิ่งของหรืออวัยวะของคุณ <br />แล้วใส่บทพูดที่ต้องการได้เลย!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-8 animate-fade-in flex flex-col items-center">
            {/* Prompt Result */}
            {generatedPrompt && (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    The <span className="text-[#0066ff]">Master Prompt</span>
                  </h2>
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white'
                    }`}
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}
                  </button>
                </div>
                <div className="bg-[#0a1125] border border-[#0066ff]/40 rounded-3xl p-6 text-white text-sm leading-relaxed font-medium shadow-2xl">
                  {generatedPrompt}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={handleGenerateVideo}
                    disabled={videoLoading || !media}
                    className={`flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                      videoLoading || !media
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-white/5 border border-border text-white hover:bg-[#0066ff]/10 hover:border-[#0066ff]/50'
                    }`}
                  >
                    {videoLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <VideoCameraIcon className="w-6 h-6" />}
                    <span>{videoLoading ? 'กำลังเสกวิดีโอ...' : 'สร้างวิดีโอจริง (ต้องใช้ Paid Key)'}</span>
                  </button>
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
                    onClick={handleDownload}
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
