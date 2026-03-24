import React from 'react';
import { ClipboardDocumentIcon, XMarkIcon, VideoCameraIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('คัดลอก Prompt แล้ว!');
  };

  const categories = [
    {
      id: 'elderly',
      title: '🧓 หมวดหมู่: วัยแก่ (Elderly)',
      characters: [
        {
          name: 'โงกุน (Goku)',
          scenes: [
            {
              title: 'ฉากที่ 1: รูปลักษณ์พื้นฐาน',
              prompt: 'Pixar-style 3D render, elderly Son Goku, signature gravity-defying spiky hairstyle but in snow-white color, 7 distinct hair spikes, wrinkled face with kind eyes, wearing a tattered master roshi style undershirt, warm morning sunlight, cinematic lighting, highly detailed skin textures, 8k resolution, --ar 9:16'
            },
            {
              title: 'ฉากที่ 2: แสงสว่างจากดราก้อนบอล',
              prompt: 'Pixar-style 3D render, close up of elderly Goku with his iconic wild spiky white hair silhouette, holding the glowing 4-star Dragon Ball, amber glow illuminating his face and white hair, crystal stream background, forest at dusk, cinematic bokeh, --ar 9:16'
            },
            {
              title: 'ฉากที่ 3: ท่าเตรียมต่อสู้',
              prompt: 'Pixar-style 3D render, elderly Goku in a martial arts stance, his signature spiky white hair blowing in the wind, wearing a faded orange Gi, vast grassy field, dramatic storm clouds, cinematic angle from below, epic scale, --ar 9:16'
            },
            {
              title: 'ฉากที่ 4: ยอดเขาแห่งความทรงจำ',
              prompt: 'Pixar-style 3D render, silhouette of elderly Goku with distinct spiky hair shape, standing on a mountain peak at sunset, golden aura particles floating away, Kinto-un cloud waiting in the sky, masterpiece, emotional ending, --ar 9:16'
            }
          ]
        },
        {
          name: 'Sonic',
          scenes: [
            {
              title: 'ฉากที่ 1: หน้าผาแห่งความหลัง',
              prompt: 'Pixar-style 3D render, elderly Sonic the Hedgehog with pale blue fur and grey quills, wrinkled face, wearing tattered red sneakers, standing on a grassy cliff of Green Hill Zone at sunrise, nostalgic atmosphere, cinematic lighting, highly detailed textures, 8k resolution, --ar 9:16'
            },
            {
              title: 'ฉากที่ 2: โรงจอดเครื่องบินเก่า',
              prompt: 'Pixar-style 3D render, elderly Sonic sitting in a dusty hangar, leaning against a rusted red biplane, holding a golden ring that has lost its glow, soft dust motes in the air, global illumination, bokeh, emotional scene, --ar 9:16'
            },
            {
              title: 'ฉากที่ 3: ซากปรักหักพังของหุ่นยนต์',
              prompt: 'Pixar-style 3D render, elderly Sonic walking slowly with a wooden cane through a jungle of rusted robot remains, sunlight filtering through trees, detailed metallic textures, film still, --ar 9:16'
            },
            {
              title: 'ฉากที่ 4: พระอาทิตย์ตกริมทะเล',
              prompt: 'Pixar-style 3D render, elderly Sonic seen from behind sitting on a rock by the ocean at sunset, beautiful orange sky, sparkling water, highly detailed fur, peaceful ending, cinematic masterpiece, --ar 9:16'
            }
          ]
        }
      ]
    }
  ];

  const videoPrompt = 'Thai voiceover says: "ไม่ว่าวันนี้จะช้าลงแค่ไหน... แต่มันเป็นการเดินทางที่คุ้มค่าที่สุดเลยล่ะ"';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f0f1a] border border-border w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0066ff]/20 rounded-lg">
              <ClipboardDocumentIcon className="w-6 h-6 text-[#0066ff]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Prompt Library</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">คลังคำสั่งตัวอย่างระดับมือโปร</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-6">
              <h3 className="text-lg font-black text-[#0066ff] border-l-4 border-[#0066ff] pl-4">{cat.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cat.characters.map((char) => (
                  <div key={char.name} className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full w-fit">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-white">{char.name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      {char.scenes.map((scene, idx) => (
                        <div key={idx} className="group bg-card border border-border rounded-2xl p-4 hover:border-[#0066ff]/50 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                              <PhotoIcon className="w-3 h-3" /> {scene.title}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(scene.prompt)}
                              className="p-1.5 bg-[#0066ff]/10 text-[#0066ff] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="คัดลอก Prompt"
                            >
                              <ClipboardDocumentIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 italic leading-tight line-clamp-3">{scene.prompt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Video Prompt Section */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-black text-purple-500 border-l-4 border-purple-500 pl-4 mb-4 flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5" /> วีดีโอ Prompt (Voiceover)
            </h3>
            <div className="group bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all relative">
              <p className="text-sm text-purple-200 font-medium italic">"{videoPrompt.replace('Thai voiceover says: ', '')}"</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] text-purple-500/60 font-bold uppercase">Copy this for video generation</span>
                <button 
                  onClick={() => copyToClipboard(videoPrompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl font-bold text-xs hover:bg-purple-600 transition-all"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" /> คัดลอกวีดีโอ Prompt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-card border-t border-border text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">💡 เคล็ดลับ: ใช้ Prompt เหล่านี้เป็นแนวทางในการสร้างตัวละครของคุณเอง</p>
        </div>
      </div>
    </div>
  );
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);
