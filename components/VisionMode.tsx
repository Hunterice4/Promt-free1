
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMediaToPrompt, generateImage, generateVideo } from '../services/geminiService';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  ClipboardDocumentIcon, 
  CheckIcon, 
  SparklesIcon, 
  TrashIcon, 
  LinkIcon, 
  ArrowPathIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/solid';

const ANALYSIS_MODES = [
  { id: 'Standard', name: 'มาตรฐาน', icon: SparklesIcon },
  { id: 'Cinematic', name: 'ภาพยนตร์', icon: VideoCameraIcon },
  { id: 'Anime', name: 'อนิเมะ', icon: PhotoIcon },
  { id: 'Cyberpunk', name: 'ไซเบอร์พังค์', icon: SparklesIcon },
  { id: 'Technical', name: 'เทคนิคอล', icon: ClipboardDocumentIcon }
];

export const VisionMode: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('Standard');
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const [genLoading, setGenLoading] = useState<'image' | 'video' | null>(null);
  const [genResult, setGenResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
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
        setMimeType(file.type);
        setResult('');
        setGenResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/proxy-media?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMedia(data.data);
      setMimeType(data.mimeType);
      setResult('');
      setGenResult(null);
    } catch (error: any) {
      alert("ไม่สามารถดึงข้อมูลจากลิงก์ได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!media) return;
    setLoading(true);
    try {
      const prompt = await analyzeMediaToPrompt(media, mimeType, analysisMode);
      setResult(prompt);
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!result) return;
    setGenLoading('image');
    try {
      const imageUrl = await generateImage(result);
      setGenResult({ type: 'image', url: imageUrl });
    } catch (error: any) {
      alert("สร้างรูปภาพไม่สำเร็จ: " + error.message);
    } finally {
      setGenLoading(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!result || !media) return;
    setGenLoading('video');
    try {
      const videoUrl = await generateVideo(result, media);
      setGenResult({ type: 'video', url: videoUrl });
    } catch (error: any) {
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
        alert("สร้างวิดีโอไม่สำเร็จ: " + error.message);
      }
    } finally {
      setGenLoading(null);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setMedia(null);
    setMimeType('');
    setUrl('');
    setResult('');
    setGenResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full bg-background">
      {/* Sidebar Input */}
      <div className="w-full lg:w-[400px] p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Media <span className="text-[#0066ff]">Vision Pro</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            วิเคราะห์ แกะ Prompt และเจนต่อให้ครบจบในที่เดียว
          </p>
        </div>

        <div className="space-y-6">
          {/* URL Input */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> วางลิงก์รูปภาพ/วิดีโอ
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0066ff]"
              />
              <button 
                type="submit"
                disabled={loading || !url}
                className="p-3 bg-[#0066ff] text-white rounded-xl hover:bg-[#0055dd] disabled:opacity-50 transition-all"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a14] px-2 text-gray-500 font-black">หรือ</span></div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <PhotoIcon className="w-4 h-4" /> อัปโหลดไฟล์
            </label>
            {!media ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066ff]/50 hover:bg-[#0066ff]/5 transition-all group"
              >
                <PhotoIcon className="w-8 h-8 text-gray-600 group-hover:text-[#0066ff] mb-2" />
                <p className="text-xs font-bold text-gray-500">เลือกไฟล์สื่อ</p>
              </div>
            ) : (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border border-border bg-black">
                {mimeType.startsWith('video') ? (
                  <video src={media} className="w-full h-full object-contain" controls />
                ) : (
                  <img src={media} className="w-full h-full object-contain" alt="Preview" />
                )}
                <button 
                  onClick={clearAll}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
          </div>

          {/* Analysis Modes */}
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">โหมดการวิเคราะห์</label>
            <div className="grid grid-cols-2 gap-2">
              {ANALYSIS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAnalysisMode(mode.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    analysisMode === mode.id 
                      ? 'bg-[#0066ff] border-[#0066ff] text-white shadow-lg shadow-[#0066ff]/20' 
                      : 'bg-card border-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <mode.icon className="w-4 h-4 shrink-0" />
                  {mode.name}
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
            onClick={handleAnalyze}
            disabled={loading || !media}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading || !media
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            <span>{loading ? 'กำลังประมวลผล...' : 'แกะ Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#05050a] lg:h-full lg:overflow-y-auto p-8 space-y-8">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <SparklesIcon className="w-24 h-24 text-gray-800" />
            <h3 className="text-xl font-bold text-gray-500">รอรับผลการวิเคราะห์...</h3>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Prompt Result */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Prompt <span className="text-[#0066ff]">Result</span></h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
              </div>
              <textarea 
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full h-48 bg-card border border-border rounded-2xl p-6 text-gray-300 leading-relaxed font-medium focus:outline-none focus:border-[#0066ff] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleGenerateImage}
                disabled={!!genLoading}
                className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-border rounded-2xl hover:bg-[#0066ff]/10 hover:border-[#0066ff]/50 transition-all group"
              >
                {genLoading === 'image' ? (
                  <ArrowPathIcon className="w-8 h-8 text-[#0066ff] animate-spin" />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-500 group-hover:text-[#0066ff]" />
                )}
                <div className="text-left">
                  <h4 className="font-bold text-white">Generate Image</h4>
                  <p className="text-xs text-gray-500">สร้างรูปภาพใหม่จาก Prompt นี้</p>
                </div>
              </button>
            </div>

            {hasPaidKey === false && (
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-500">จำเป็นต้องใช้ Paid API Key</h4>
                    <p className="text-sm text-yellow-500/70 leading-relaxed">
                      ฟีเจอร์การสร้างวิดีโอ (Veo) และภาพความละเอียดสูง จำเป็นต้องใช้ API Key จากโปรเจกต์ Google Cloud ที่เปิดการเรียกเก็บเงินแล้ว (Paid Project)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleOpenKeySelector}
                  className="w-full py-3 bg-yellow-500 text-black rounded-xl font-black hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                >
                  <KeyIcon className="w-5 h-5" />
                  เชื่อมต่อ Paid API Key เพื่อปลดล็อก
                </button>
              </div>
            )}

            {/* Generation Result */}
            {genResult && (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">ผลลัพธ์การสร้าง</h3>
                  <a 
                    href={genResult.url} 
                    download={`generated-${genResult.type}`}
                    className="flex items-center gap-2 text-[#0066ff] hover:underline text-sm font-bold"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> ดาวน์โหลด
                  </a>
                </div>
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
                  {genResult.type === 'video' ? (
                    <video src={genResult.url} controls className="w-full aspect-[9/16] object-contain bg-black" />
                  ) : (
                    <img src={genResult.url} className="w-full aspect-[9/16] object-contain bg-black" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
