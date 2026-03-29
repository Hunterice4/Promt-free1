
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMediaToPromptDetailed, analyzeUrlToPromptDetailed } from '../services/geminiService';
import { DetailedPromptResult } from '../types';
import { saveHistoryItem } from '../services/historyService';
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
  HashtagIcon,
  LightBulbIcon,
  InformationCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';

export const PromptGenMode: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [urlContent, setUrlContent] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetailedPromptResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState('Standard');
  const [backgroundOnly, setBackgroundOnly] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result as string);
        setMimeType(file.type);
        setUrlContent(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      // Try to fetch as media first
      const response = await fetch(`/api/proxy-media?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.error) {
        // If not media, try to fetch as text/HTML
        const textResponse = await fetch(`/api/proxy-url?url=${encodeURIComponent(url)}`);
        const textData = await textResponse.json();
        if (textData.error) throw new Error(textData.error);
        
        setUrlContent(textData.content);
        setMedia(null);
        setMimeType('text/html');
        setResult(null);
      } else {
        setMedia(data.data);
        setMimeType(data.mimeType);
        setUrlContent(null);
        setResult(null);
      }
    } catch (error: any) {
      alert("ไม่สามารถดึงข้อมูลจากลิงก์ได้: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!media && !urlContent) return;
    setLoading(true);
    try {
      let detailedResult;
      if (urlContent) {
        detailedResult = await analyzeUrlToPromptDetailed(urlContent);
      } else if (media) {
        detailedResult = await analyzeMediaToPromptDetailed(media, mimeType, analysisMode, backgroundOnly);
      }
      
      if (detailedResult) {
        setResult(detailedResult);
        await saveHistoryItem('Prompt Generator', detailedResult.title, detailedResult);
      }
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearAll = () => {
    setMedia(null);
    setMimeType('');
    setUrlContent(null);
    setUrl('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const modes = [
    { id: 'Standard', label: 'มาตรฐาน', icon: SparklesIcon },
    { id: 'Cinematic', label: 'ภาพยนตร์', icon: VideoCameraIcon },
    { id: 'Anime', label: 'อนิเมะ', icon: PhotoIcon },
    { id: 'Cyberpunk', label: 'ไซเบอร์พังก์', icon: LightBulbIcon },
    { id: 'Technical', label: 'เทคนิค', icon: InformationCircleIcon },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full h-full overflow-hidden bg-background">
      {/* Sidebar Input */}
      <div className="w-full lg:w-1/2 p-6 space-y-8 flex flex-col h-1/2 lg:h-full overflow-y-auto bg-[#0a0a14] border-r border-border shrink-0 custom-scrollbar">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            Prompt <span className="text-[#0066ff]">Generator</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            ดึง Prompt, Hashtag และไอเดียจากรูปภาพหรือวิดีโอ
          </p>
        </div>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" /> เลือกสไตล์การวิเคราะห์
            </label>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAnalysisMode(mode.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    analysisMode === mode.id
                      ? 'bg-[#0066ff] border-[#0066ff] text-white shadow-lg shadow-[#0066ff]/20'
                      : 'bg-card border-border text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Only Toggle */}
          <div className="space-y-2">
            <button
              onClick={() => setBackgroundOnly(!backgroundOnly)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black transition-all border ${
                backgroundOnly
                  ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-card border-border text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${backgroundOnly ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                  <GlobeAltIcon className="w-4 h-4" />
                </div>
                <span>วิเคราะห์พื้นหลังอย่างเดียว</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${backgroundOnly ? 'bg-purple-500' : 'bg-gray-700'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${backgroundOnly ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
            <p className="text-[10px] text-gray-500 italic px-1">
              * AI จะข้ามการวิเคราะห์คนและเสื้อผ้า แล้วเน้นไปที่สภาพแวดล้อม แสง และบรรยากาศแทน
            </p>
          </div>

          {/* URL Input */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> วางลิงก์รูปภาพ/วิดีโอ/เว็บ
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
              <PhotoIcon className="w-4 h-4" />
              <VideoCameraIcon className="w-4 h-4" />
              อัปโหลดรูปภาพ/วิดีโอ
            </label>
            {!media && !urlContent ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-card border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0066ff]/50 hover:bg-[#0066ff]/5 transition-all group"
              >
                <div className="flex gap-2 mb-2">
                  <PhotoIcon className="w-8 h-8 text-gray-600 group-hover:text-[#0066ff] transition-colors" />
                  <VideoCameraIcon className="w-8 h-8 text-gray-600 group-hover:text-[#0066ff] transition-colors" />
                </div>
                <p className="text-xs font-bold text-gray-500">คลิกเพื่อเลือกไฟล์ (รูปภาพ หรือ วิดีโอ)</p>
                <p className="text-[10px] text-gray-600 mt-1">รองรับ MP4, MOV, WebM, PNG, JPG, WebP</p>
              </div>
            ) : urlContent ? (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border border-border bg-[#0066ff]/10 flex flex-col items-center justify-center p-6 text-center">
                <GlobeAltIcon className="w-12 h-12 text-[#0066ff] mb-3" />
                <p className="text-sm font-bold text-white">ดึงข้อมูลจากลิงก์สำเร็จ</p>
                <p className="text-[10px] text-gray-400 mt-1 truncate w-full px-4">{url}</p>
                <button 
                  onClick={clearAll}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border border-border bg-black">
                {mimeType.startsWith('video') ? (
                  <video src={media!} className="w-full h-full object-contain" controls />
                ) : (
                  <img src={media!} className="w-full h-full object-contain" alt="Preview" />
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

          <button
            onClick={handleAnalyze}
            disabled={loading || (!media && !urlContent)}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              loading || (!media && !urlContent)
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
            }`}
          >
            {loading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <SparklesIcon className="w-6 h-6" />}
            <span>{loading ? 'กำลังวิเคราะห์...' : 'สร้าง Prompt & Hashtag'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:w-1/2 bg-[#05050a] h-1/2 lg:h-full overflow-y-auto p-8 custom-scrollbar">
        {!result ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <SparklesIcon className="w-24 h-24 text-gray-800" />
            <h3 className="text-xl font-bold text-gray-500">อัปโหลดสื่อเพื่อเริ่มการวิเคราะห์</h3>
            <p className="text-gray-400 max-w-sm text-sm">
              ระบบจะช่วยแกะ Prompt, คิดชื่อเรื่อง, คำอธิบาย และ Hashtag ให้คุณโดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest flex items-center gap-2">
                    <InformationCircleIcon className="w-4 h-4" /> ชื่อเรื่อง (Title)
                  </h4>
                  <button onClick={() => handleCopy(result.title, 'title')} className="text-gray-500 hover:text-white transition-colors">
                    {copied === 'title' ? <CheckIcon className="w-4 h-4 text-green-500" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-lg font-bold text-white">{result.title}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest flex items-center gap-2">
                    <ClipboardDocumentIcon className="w-4 h-4" /> คำอธิบาย (Description)
                  </h4>
                  <button onClick={() => handleCopy(result.description, 'desc')} className="text-gray-500 hover:text-white transition-colors">
                    {copied === 'desc' ? <CheckIcon className="w-4 h-4 text-green-500" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{result.description}</p>
              </div>
            </div>

            {/* Prompt Result */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-[#0066ff]" /> AI Generation Prompt
                </h4>
                <button 
                  onClick={() => handleCopy(result.prompt, 'prompt')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copied === 'prompt' ? 'bg-green-500 text-white' : 'bg-[#0066ff] text-white hover:bg-[#0055dd]'
                  }`}
                >
                  {copied === 'prompt' ? <CheckIcon className="w-3 h-3" /> : <DocumentDuplicateIcon className="w-3 h-3" />}
                  {copied === 'prompt' ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-300 leading-relaxed font-medium italic">"{result.prompt}"</p>
              </div>
            </div>

            {/* Hashtags */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest flex items-center gap-2">
                  <HashtagIcon className="w-4 h-4" /> Hashtags แนะนำ
                </h4>
                <button 
                  onClick={() => handleCopy(result.hashtags.join(' '), 'hashtags')}
                  className="text-xs font-bold text-gray-500 hover:text-white"
                >
                  {copied === 'hashtags' ? 'คัดลอกแล้ว' : 'คัดลอกทั้งหมด'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.hashtags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-white/5 border border-border rounded-full text-xs font-bold text-gray-400 hover:text-[#0066ff] hover:border-[#0066ff]/50 transition-all cursor-default">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Hacks / Tips */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4" /> เทคนิคเพิ่มเติม (Hacks & Tips)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.hacks.map((hack, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-white/5 rounded-xl border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-500 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{hack}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
