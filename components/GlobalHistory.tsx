import React, { useEffect, useState } from 'react';
import { getHistoryItems, deleteHistoryItem, clearAllHistory, HistoryItem } from '../services/historyService';
import { TrashIcon, ClockIcon, ArrowDownTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { downloadImage } from '../services/downloadService';
import { toast, Toaster } from 'sonner';

export const GlobalHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const items = await getHistoryItems();
    setHistory(items);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัตินี้?')) {
      await deleteHistoryItem(id);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      loadHistory();
    }
  };

  const handleClearAll = async () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติทั้งหมด?')) {
      await clearAllHistory();
      setSelectedItem(null);
      loadHistory();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`คัดลอก ${label} แล้ว!`);
  };

  const renderResultPreview = (result: any, mode: string) => {
    if (!result) return null;
    
    // Try to find image URLs in the result object
    let imageUrls: string[] = [];
    
    if (typeof result === 'string' && result.startsWith('data:image')) {
      imageUrls.push(result);
    } else if (typeof result === 'object') {
      if (result.url && typeof result.url === 'string' && result.url.startsWith('data:image')) {
        imageUrls.push(result.url);
      }
      if (result.imageUrl && typeof result.imageUrl === 'string' && result.imageUrl.startsWith('data:image')) {
        imageUrls.push(result.imageUrl);
      }
      if (result.image_url && typeof result.image_url === 'string' && result.image_url.startsWith('data:image')) {
        imageUrls.push(result.image_url);
      }
      if (result.images && Array.isArray(result.images)) {
        imageUrls = [...imageUrls, ...result.images.filter((img: any) => typeof img === 'string' && img.startsWith('data:image'))];
      }
      // Check for scenes with images
      if (result.scenes && Array.isArray(result.scenes)) {
        result.scenes.forEach((scene: any) => {
          if (scene.image_url && typeof scene.image_url === 'string' && scene.image_url.startsWith('data:image')) {
            imageUrls.push(scene.image_url);
          }
        });
      }
      // Check for data.imageUrl (Talking Face)
      if (result.data && result.imageUrl && typeof result.imageUrl === 'string' && result.imageUrl.startsWith('data:image')) {
        imageUrls.push(result.imageUrl);
      }
    }

    // Deduplicate
    imageUrls = [...new Set(imageUrls)];

    // Crossover Mode Specific Rendering
    if (mode === 'Crossover' && result.slots) {
      return (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button 
              onClick={() => {
                const allPrompts = result.slots.map((s: any, i: number) => `--- รูปที่ ${i+1} ---\nImage: ${s.imagePrompt}\nVideo: ${s.videoPrompt}`).join('\n\n');
                handleCopy(allPrompts, 'พ้อมต์ทั้งหมด');
              }}
              className="px-4 py-2 bg-green-600/20 border border-green-600/50 text-green-400 rounded-xl text-xs font-bold hover:bg-green-600/30 transition-all flex items-center gap-2"
            >
              <ClipboardIcon className="w-4 h-4" />
              คัดลอกพ้อมต์ทั้งหมด
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.slots.map((slot: any, idx: number) => (
              <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                <div className="relative group">
                  <img 
                    src={result.images[idx]} 
                    alt={`Crossover ${idx}`} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => downloadImage(result.images[idx], `crossover-${idx}.png`)}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-[#0066ff] transition-all"
                      title="ดาวน์โหลดรูปภาพ"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-4 flex-1 bg-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-[#00aaff] uppercase tracking-widest">Image Prompt</h4>
                      <button 
                        onClick={() => handleCopy(slot.imagePrompt, 'Image Prompt')}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                        title="คัดลอกพ้อมต์รูปภาพ"
                      >
                        <ClipboardIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 italic line-clamp-3">"{slot.imagePrompt}"</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Video Prompt</h4>
                      <button 
                        onClick={() => handleCopy(slot.videoPrompt, 'Video Prompt')}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                        title="คัดลอกพ้อมต์วิดีโอ"
                      >
                        <ClipboardIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 italic line-clamp-3">"{slot.videoPrompt}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Story or Vlog Mode Specific Rendering
    if ((mode === 'Story' || mode === 'VlogTour') && result.scenes) {
      return (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button 
              onClick={() => {
                const allPrompts = result.scenes.map((s: any, i: number) => `--- ฉากที่ ${i+1} ---\nImage: ${s.image_prompt}\nVideo: ${s.video_prompt}`).join('\n\n');
                handleCopy(allPrompts, 'พ้อมต์ทั้งหมด');
              }}
              className="px-4 py-2 bg-green-600/20 border border-green-600/50 text-green-400 rounded-xl text-xs font-bold hover:bg-green-600/30 transition-all flex items-center gap-2"
            >
              <ClipboardIcon className="w-4 h-4" />
              คัดลอกพ้อมต์ทั้งหมด
            </button>
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Full Prompt</h4>
              <button 
                onClick={() => handleCopy(result.storyPrompt || result.vlogPrompt || result.prompt, 'Prompt')}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <ClipboardIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-sm italic">"{result.storyPrompt || result.vlogPrompt || result.prompt}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.scenes.map((scene: any, idx: number) => (
              <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                {scene.image_url && (
                  <div className="relative group">
                    <img 
                      src={scene.image_url} 
                      alt={`Scene ${idx + 1}`} 
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => downloadImage(scene.image_url, `scene-${idx + 1}.png`)}
                        className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-[#0066ff] transition-all"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-4 flex-1 bg-white/5">
                  <h5 className="text-[10px] font-black text-[#0066ff] uppercase tracking-widest mb-2">Scene {idx + 1}</h5>
                  <p className="text-xs text-gray-300 leading-relaxed">{scene.text || scene.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Check for DetailedPromptResult (Prompt Generator)
    if (result.title && result.prompt && result.hashtags && result.hacks) {
      return (
        <div className="space-y-8">
          {imageUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-border pb-2">รูปภาพที่สร้าง</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`Generated ${idx}`} className="w-full rounded-xl border border-border" />
                    <button 
                      onClick={() => downloadImage(url, `generated-${idx}.png`)}
                      className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 hover:bg-[#0066ff] transition-all"
                      title="ดาวน์โหลดรูปภาพ"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest">ชื่อเรื่อง (Title)</h4>
              <p className="text-lg font-bold text-white">{result.title}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest">คำอธิบาย (Description)</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{result.description}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">AI Generation Prompt</h4>
              <button 
                onClick={() => handleCopy(result.prompt, 'Prompt')}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <ClipboardIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 leading-relaxed font-medium italic">"{result.prompt}"</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest">Hashtags แนะนำ</h4>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 bg-white/5 border border-border rounded-full text-xs font-bold text-gray-400">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest">เทคนิคเพิ่มเติม (Hacks & Tips)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.hacks.map((hack: string, idx: number) => (
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
      );
    }

    // Default fallback
    const prompt = result.prompt || result.image_prompt || result.imagePrompt;
    const videoPrompt = result.video_prompt || result.videoPrompt;
    const description = result.description || result.desc;

    return (
      <div className="space-y-6">
        {imageUrls.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border pb-2">รูปภาพที่สร้าง</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img src={url} alt={`Generated ${idx}`} className="w-full rounded-xl border border-border" />
                  <button 
                    onClick={() => downloadImage(url, `generated-${idx}.png`)}
                    className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 hover:bg-[#0066ff] transition-all"
                    title="ดาวน์โหลดรูปภาพ"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {prompt && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Image Generation Prompt</h4>
              <button 
                onClick={() => handleCopy(prompt, 'Prompt')}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <ClipboardIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-sm italic">"{prompt}"</p>
            </div>
          </div>
        )}

        {videoPrompt && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest">Video Generation Prompt</h4>
              <button 
                onClick={() => handleCopy(videoPrompt, 'Video Prompt')}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                <ClipboardIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-sm italic">"{videoPrompt}"</p>
            </div>
          </div>
        )}

        {description && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h4 className="text-xs font-black text-[#0066ff] uppercase tracking-widest">คำอธิบาย (Description)</h4>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-border pb-2 opacity-50">ข้อมูลดิบ (JSON)</h3>
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              ดูข้อมูลดิบ (Raw JSON)
            </summary>
            <pre className="bg-[#0a0a14] p-4 rounded-xl overflow-x-auto text-sm text-gray-300 whitespace-pre-wrap font-mono mt-2 border border-border/50">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-background text-foreground">
      {/* Sidebar: History List */}
      <div className="w-full lg:w-1/3 p-6 space-y-4 bg-[#0a0a14] border-r border-border overflow-y-auto custom-scrollbar h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-[#0066ff]" />
            ประวัติการสร้าง
          </h2>
          {history.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-500 hover:text-red-400 transition-colors"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            ยังไม่มีประวัติการสร้าง
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedItem?.id === item.id ? 'bg-[#0066ff]/10 border-[#0066ff]' : 'bg-card border-border hover:border-gray-500'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-gray-800 rounded-md text-gray-300">
                    {item.mode}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-white line-clamp-2">{item.input || 'ไม่มีชื่อ'}</h3>
                <p className="text-xs text-gray-500 mt-2">{formatDate(item.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: History Details */}
      <div className="w-full lg:w-2/3 p-6 overflow-y-auto custom-scrollbar bg-[#05050a] h-full">
        {selectedItem ? (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h2 className="text-2xl font-black text-white mb-2">{selectedItem.input || 'รายละเอียด'}</h2>
              <div className="flex gap-4 text-sm text-gray-400 mb-6">
                <span>โหมด: <span className="text-[#0066ff] font-bold">{selectedItem.mode}</span></span>
                <span>เวลา: {formatDate(selectedItem.timestamp)}</span>
              </div>
              
              <div className="space-y-4">
                {renderResultPreview(selectedItem.result, selectedItem.mode)}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            เลือกรายการทางซ้ายเพื่อดูรายละเอียด
          </div>
        )}
      </div>
    </div>
  );
};
