
import React, { useState, useEffect } from 'react';
import { ObjectMode } from './components/ObjectMode';
import { CharacterMode } from './components/CharacterMode';
import { StoryMode } from './components/StoryMode';
import { VisionMode } from './components/VisionMode';
import { FigureMode } from './components/FigureMode';
import { MovieSetMode } from './components/MovieSetMode';
import { TalkingMode } from './components/TalkingMode';
import { setCustomApiKey } from './services/geminiService';
import { CubeIcon, UserIcon, BookOpenIcon, Cog6ToothIcon, XMarkIcon, KeyIcon, PhotoIcon, EyeIcon, PuzzlePieceIcon, FaceSmileIcon, SparklesIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'object' | 'character' | 'story' | 'vision' | 'figure' | 'talking' | 'movie'>('object');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [skipImages, setSkipImages] = useState(localStorage.getItem('skip_images') === 'true');
  const [hasPaidKey, setHasPaidKey] = useState<boolean | null>(null);

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
      setHasPaidKey(true); // Assume success as per instructions
    }
  };

  useEffect(() => {
    setCustomApiKey(apiKey);
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('skip_images', skipImages.toString());
  }, [skipImages]);

  // Security: Disable Right Click & F12
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
      }
      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-16 lg:h-20 bg-[#0a0a14] border-b border-border flex items-center px-4 lg:px-8 z-50 shrink-0 justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="text-[#0066ff] font-black text-xl lg:text-2xl tracking-tighter">ROAST MASTER</div>
          
          <nav className="hidden md:flex items-center gap-1">
            <TabButton 
              active={activeTab === 'object'} 
              onClick={() => setActiveTab('object')} 
              icon={<CubeIcon className="w-5 h-5" />} 
              label="ปลุกเสกสิ่งของ" 
            />
            <TabButton 
              active={activeTab === 'character'} 
              onClick={() => setActiveTab('character')} 
              icon={<UserIcon className="w-5 h-5" />} 
              label="สร้างตัวละคร" 
            />
            <TabButton 
              active={activeTab === 'story'} 
              onClick={() => setActiveTab('story')} 
              icon={<BookOpenIcon className="w-5 h-5" />} 
              label="แต่งเนื้อเรื่อง" 
            />
            <TabButton 
              active={activeTab === 'vision'} 
              onClick={() => setActiveTab('vision')} 
              icon={<EyeIcon className="w-5 h-5" />} 
              label="แกะ Prompt" 
            />
            <TabButton 
              active={activeTab === 'figure'} 
              onClick={() => setActiveTab('figure')} 
              icon={<PuzzlePieceIcon className="w-5 h-5" />} 
              label="เจนฟิกเกอร์" 
            />
            <TabButton 
              active={activeTab === 'movie'} 
              onClick={() => setActiveTab('movie')} 
              icon={<SparklesIcon className="w-5 h-5" />} 
              label="Abandoned Movie" 
            />
            <TabButton 
              active={activeTab === 'talking'} 
              onClick={() => setActiveTab('talking')} 
              icon={<FaceSmileIcon className="w-5 h-5" />} 
              label="หน้าพูดได้" 
            />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu (Simplified for now) */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
             <button onClick={() => setActiveTab('object')} className={`p-2 rounded-lg ${activeTab === 'object' ? 'text-[#0066ff]' : 'text-gray-500'}`}><CubeIcon className="w-5 h-5" /></button>
             <button onClick={() => setActiveTab('figure')} className={`p-2 rounded-lg ${activeTab === 'figure' ? 'text-[#0066ff]' : 'text-gray-500'}`}><PuzzlePieceIcon className="w-5 h-5" /></button>
             <button onClick={() => setActiveTab('movie')} className={`p-2 rounded-lg ${activeTab === 'movie' ? 'text-[#0066ff]' : 'text-gray-500'}`}><SparklesIcon className="w-5 h-5" /></button>
             <button onClick={() => setActiveTab('talking')} className={`p-2 rounded-lg ${activeTab === 'talking' ? 'text-[#0066ff]' : 'text-gray-500'}`}><FaceSmileIcon className="w-5 h-5" /></button>
          </div>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
            title="ตั้งค่า"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0a14] border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6 text-[#0066ff]" /> ตั้งค่า (Settings)
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* API Key Input */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <KeyIcon className="w-4 h-4" /> Gemini API Key
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ใส่ API Key ของคุณที่นี่..."
                    className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500">
                  * หากไม่ใส่ จะใช้ Key ส่วนกลางของระบบ (ถ้ามี)
                </p>
              </div>

              {/* Paid Key Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-yellow-500" /> Paid API Key (For Video/Veo)
                </label>
                <button 
                  onClick={handleOpenKeySelector}
                  className={`w-full p-4 rounded-xl border font-bold transition-all flex items-center justify-between ${
                    hasPaidKey 
                      ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                      : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20'
                  }`}
                >
                  <span>{hasPaidKey ? '✓ เชื่อมต่อ Paid Key แล้ว' : 'เชื่อมต่อ Paid Key (สำหรับวิดีโอ)'}</span>
                  <KeyIcon className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-gray-500">
                  * จำเป็นสำหรับการสร้างวิดีโอ (Veo) และภาพความละเอียดสูง ดูรายละเอียดที่ <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[#0066ff] underline">Billing Docs</a>
                </p>
              </div>

              {/* Skip Images Toggle */}
              <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0066ff]/10 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-[#0066ff]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">ไม่สร้างรูปภาพ</h4>
                    <p className="text-[10px] text-gray-500">เจนเฉพาะข้อความ (เร็วขึ้นมาก)</p>
                  </div>
                </div>
                <button
                  onClick={() => setSkipImages(!skipImages)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    skipImages ? 'bg-[#0066ff]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      skipImages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-4 rounded-xl font-black bg-[#0066ff] text-white hover:bg-[#0055dd] transition-all active:scale-95"
              >
                บันทึกและปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-background">
        {activeTab === 'object' && <ObjectMode />}
        {activeTab === 'character' && <CharacterMode />}
        {activeTab === 'story' && <StoryMode />}
        {activeTab === 'vision' && <VisionMode />}
        {activeTab === 'figure' && <FigureMode />}
        {activeTab === 'movie' && <MovieSetMode />}
        {activeTab === 'talking' && <TalkingMode />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
      active 
        ? 'bg-[#0066ff]/10 text-[#0066ff]' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
