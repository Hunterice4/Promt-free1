
import React, { useState, useEffect } from 'react';
import { ObjectMode } from './components/ObjectMode';
import { CharacterMode } from './components/CharacterMode';
import { MascotLockMode } from './components/MascotLockMode';
import { StoryMode } from './components/StoryMode';
import { VisionMode } from './components/VisionMode';
import { FigureMode } from './components/FigureMode';
import { MovieSetMode } from './components/MovieSetMode';
import { TalkingMode } from './components/TalkingMode';
import { PromptGenMode } from './components/PromptGenMode';
import { VlogTourMode } from './components/VlogTourMode';
import { CrossoverMode } from './components/CrossoverMode';
import MovieMasterMode from './components/MovieMasterMode';
import { CubeIcon, UserIcon, BookOpenIcon, Cog6ToothIcon, XMarkIcon, KeyIcon, PhotoIcon, EyeIcon, PuzzlePieceIcon, FaceSmileIcon, SparklesIcon, HashtagIcon, VideoCameraIcon, MapIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/solid';
import { Toaster } from 'sonner';

import { GlobalHistory } from './components/GlobalHistory';
import { ClockIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'object' | 'character' | 'mascot' | 'story' | 'vision' | 'figure' | 'talking' | 'movie' | 'moviemaster' | 'promptgen' | 'vlogtour' | 'crossover' | 'history'>('moviemaster');
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
      <Toaster position="top-center" richColors />
      {/* Top Navigation Bar */}
      <div className="h-20 lg:h-24 bg-[#0a0a14] border-b border-border flex items-center px-4 lg:px-8 z-50 shrink-0 justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 lg:gap-10">
          <div className="text-[#0066ff] font-black text-xl lg:text-2xl tracking-tighter shrink-0">ROAST MASTER</div>
          
          <nav className="hidden md:flex items-center gap-6">
            {/* Group: Featured */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-[#00aaff] uppercase tracking-[0.2em] px-2 opacity-80">แนะนำ</span>
              <div className="flex items-center gap-1">
                <TabButton 
                  active={activeTab === 'crossover'} 
                  onClick={() => setActiveTab('crossover')} 
                  icon={<UserGroupIcon className="w-4 h-4 text-[#00aaff]" />} 
                  label="รวมร่างตัวละคร" 
                  isNew
                />
                <TabButton 
                  active={activeTab === 'vlogtour'} 
                  onClick={() => setActiveTab('vlogtour')} 
                  icon={<MapIcon className="w-4 h-4 text-[#00aaff]" />} 
                  label="พาเที่ยว Vlog" 
                />
              </div>
            </div>

            <div className="w-px h-10 bg-border/50" />

            {/* Group: Creation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-purple-500 uppercase tracking-[0.2em] px-2 opacity-80">การสร้าง</span>
              <div className="flex items-center gap-1">
                <TabButton 
                  active={activeTab === 'object'} 
                  onClick={() => setActiveTab('object')} 
                  icon={<CubeIcon className="w-4 h-4" />} 
                  label="ปลุกเสกสิ่งของ" 
                />
                <TabButton 
                  active={activeTab === 'story'} 
                  onClick={() => setActiveTab('story')} 
                  icon={<BookOpenIcon className="w-4 h-4" />} 
                  label="แต่งเนื้อเรื่อง" 
                />
                <TabButton 
                  active={activeTab === 'movie'} 
                  onClick={() => setActiveTab('movie')} 
                  icon={<SparklesIcon className="w-4 h-4" />} 
                  label="หนังร้างสยองขวัญ" 
                />
                <TabButton 
                  active={activeTab === 'moviemaster'} 
                  onClick={() => setActiveTab('moviemaster')} 
                  icon={<VideoCameraIcon className="w-4 h-4 text-orange-500" />} 
                  label="สร้างหนัง (Movie Master)" 
                  isNew
                />
              </div>
            </div>

            <div className="w-px h-10 bg-border/50" />

            {/* Group: Character */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em] px-2 opacity-80">ตัวละคร</span>
              <div className="flex items-center gap-1">
                <TabButton 
                  active={activeTab === 'character'} 
                  onClick={() => setActiveTab('character')} 
                  icon={<UserIcon className="w-4 h-4" />} 
                  label="สร้างตัวละคร" 
                />
                <TabButton 
                  active={activeTab === 'mascot'} 
                  onClick={() => setActiveTab('mascot')} 
                  icon={<UserIcon className="w-4 h-4 text-yellow-500" />} 
                  label="มาสคอต" 
                />
                <TabButton 
                  active={activeTab === 'talking'} 
                  onClick={() => setActiveTab('talking')} 
                  icon={<FaceSmileIcon className="w-4 h-4" />} 
                  label="หน้าพูดได้" 
                />
                <TabButton 
                  active={activeTab === 'figure'} 
                  onClick={() => setActiveTab('figure')} 
                  icon={<PuzzlePieceIcon className="w-4 h-4" />} 
                  label="เจนฟิกเกอร์" 
                />
              </div>
            </div>

            <div className="w-px h-10 bg-border/50" />

            {/* Group: Analysis */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.2em] px-2 opacity-80">วิเคราะห์ & พ้อมต์</span>
              <div className="flex items-center gap-1">
                <TabButton 
                  active={activeTab === 'vision'} 
                  onClick={() => setActiveTab('vision')} 
                  icon={<EyeIcon className="w-4 h-4" />} 
                  label="แกะ Prompt" 
                />
                <TabButton 
                  active={activeTab === 'promptgen'} 
                  onClick={() => setActiveTab('promptgen')} 
                  icon={<HashtagIcon className="w-4 h-4" />} 
                  label="สร้างพ้อมต์" 
                />
              </div>
            </div>
            <div className="w-px h-10 bg-border/50" />

            {/* Group: History */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-pink-500 uppercase tracking-[0.2em] px-2 opacity-80">ประวัติ</span>
              <div className="flex items-center gap-1">
                <TabButton 
                  active={activeTab === 'history'} 
                  onClick={() => setActiveTab('history')} 
                  icon={<ClockIcon className="w-4 h-4 text-pink-500" />} 
                  label="ประวัติ" 
                />
              </div>
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Mobile Menu (Grouped) */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[180px] sm:max-w-[250px] py-1 border-r border-border/30 pr-2 mr-1">
             <div className="flex items-center gap-1 px-1 border-r border-border/30">
                <button onClick={() => setActiveTab('crossover')} className={`p-2 rounded-lg transition-all ${activeTab === 'crossover' ? 'bg-[#00aaff]/10 text-[#00aaff]' : 'text-gray-500'}`} title="รวมร่างตัวละคร"><UserGroupIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('vlogtour')} className={`p-2 rounded-lg transition-all ${activeTab === 'vlogtour' ? 'bg-[#00aaff]/10 text-[#00aaff]' : 'text-gray-500'}`} title="พาเที่ยว Vlog"><MapIcon className="w-5 h-5" /></button>
             </div>
             <div className="flex items-center gap-1 px-1 border-r border-border/30">
                <button onClick={() => setActiveTab('object')} className={`p-2 rounded-lg transition-all ${activeTab === 'object' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="ปลุกเสกสิ่งของ"><CubeIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('story')} className={`p-2 rounded-lg transition-all ${activeTab === 'story' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="แต่งเนื้อเรื่อง"><BookOpenIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('movie')} className={`p-2 rounded-lg transition-all ${activeTab === 'movie' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="หนังร้างสยองขวัญ"><SparklesIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('moviemaster')} className={`p-2 rounded-lg transition-all ${activeTab === 'moviemaster' ? 'bg-orange-500/10 text-orange-500' : 'text-gray-500'}`} title="สร้างหนัง (Movie Master)"><VideoCameraIcon className="w-5 h-5" /></button>
             </div>
             <div className="flex items-center gap-1 px-1 border-r border-border/30">
                <button onClick={() => setActiveTab('character')} className={`p-2 rounded-lg transition-all ${activeTab === 'character' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="สร้างตัวละคร"><UserIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('mascot')} className={`p-2 rounded-lg transition-all ${activeTab === 'mascot' ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-500'}`} title="มาสคอต"><UserIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('talking')} className={`p-2 rounded-lg transition-all ${activeTab === 'talking' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="หน้าพูดได้"><FaceSmileIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('figure')} className={`p-2 rounded-lg transition-all ${activeTab === 'figure' ? 'bg-[#0066ff]/10 text-[#0066ff]' : 'text-gray-500'}`} title="เจนฟิกเกอร์"><PuzzlePieceIcon className="w-5 h-5" /></button>
             </div>
             <div className="flex items-center gap-1 px-1 border-r border-border/30">
                <button onClick={() => setActiveTab('vision')} className={`p-2 rounded-lg transition-all ${activeTab === 'vision' ? 'bg-green-500/10 text-green-500' : 'text-gray-500'}`} title="แกะ Prompt"><EyeIcon className="w-5 h-5" /></button>
                <button onClick={() => setActiveTab('promptgen')} className={`p-2 rounded-lg transition-all ${activeTab === 'promptgen' ? 'bg-green-500/10 text-green-500' : 'text-gray-500'}`} title="สร้างพ้อมต์"><HashtagIcon className="w-5 h-5" /></button>
             </div>
             <div className="flex items-center gap-1 px-1">
                <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-pink-500/10 text-pink-500' : 'text-gray-500'}`} title="ประวัติการสร้าง"><ClockIcon className="w-5 h-5" /></button>
             </div>
          </div>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 lg:p-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
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
        {activeTab === 'mascot' && <MascotLockMode />}
        {activeTab === 'story' && <StoryMode />}
        {activeTab === 'vision' && <VisionMode />}
        {activeTab === 'figure' && <FigureMode />}
        {activeTab === 'movie' && <MovieSetMode />}
        {activeTab === 'moviemaster' && <MovieMasterMode />}
        {activeTab === 'talking' && <TalkingMode />}
        {activeTab === 'promptgen' && <PromptGenMode />}
        {activeTab === 'vlogtour' && <VlogTourMode />}
        {activeTab === 'crossover' && <CrossoverMode />}
        {activeTab === 'history' && <GlobalHistory />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, isNew }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, isNew?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all relative shrink-0 ${
      active 
        ? 'bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/20' 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="whitespace-nowrap">{label}</span>
    {isNew && (
      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
      </span>
    )}
  </button>
);

export default App;
