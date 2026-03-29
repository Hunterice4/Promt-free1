import React, { useState, useRef } from 'react';
import { 
  CinematicData, 
  VisualStyle,
  CinematicParams
} from '../types';
import { 
  generateCinematicPrompt, 
  generateImage, 
  generateVideo
} from '../services/geminiService';
import { saveHistoryItem } from '../services/historyService';
import { 
  Film, 
  Sparkles, 
  Loader2, 
  Play, 
  Image as ImageIcon,
  Video,
  AlertCircle,
  Zap,
  X,
  Plus,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MovieMasterMode: React.FC = () => {
  const [params, setParams] = useState<CinematicParams>({
    concept: '',
    style: VisualStyle.Cinematic,
    duration: 16,
    sceneCount: 2
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CinematicData | null>(null);
  const [generatingMedia, setGeneratingMedia] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!params.concept) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await generateCinematicPrompt(params);
      setResult(data);
      
      // Auto-generate images for all scenes sequentially
      const updatedScenes = [...data.scenes];
      let currentResult = { ...data };

      for (let i = 0; i < updatedScenes.length; i++) {
        const key = `${i}-image`;
        setGeneratingMedia(prev => ({ ...prev, [key]: true }));
        try {
          // Use reference image for first scene, or previous image for consistency
          let refImg = referenceImage || undefined;
          if (i > 0 && updatedScenes[i - 1].image_url) {
            refImg = updatedScenes[i - 1].image_url;
          }

          const imageUrl = await generateImage(updatedScenes[i].image_prompt, refImg);
          updatedScenes[i] = { ...updatedScenes[i], image_url: imageUrl };
          currentResult = { ...currentResult, scenes: [...updatedScenes] };
          setResult({ ...currentResult });
          
          if (i < updatedScenes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (err) {
          console.error(`Failed to auto-generate image for scene ${i}`, err);
        } finally {
          setGeneratingMedia(prev => ({ ...prev, [key]: false }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate movie');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMedia = async (sceneIndex: number, type: 'image' | 'video') => {
    if (!result) return;
    
    const key = `${sceneIndex}-${type}`;
    setGeneratingMedia(prev => ({ ...prev, [key]: true }));
    
    try {
      const scene = result.scenes[sceneIndex];
      if (type === 'image') {
        let refImg = referenceImage || undefined;
        if (sceneIndex > 0 && result.scenes[sceneIndex - 1].image_url) {
          refImg = result.scenes[sceneIndex - 1].image_url;
        }

        const imageUrl = await generateImage(scene.image_prompt, refImg);
        const updatedScenes = [...result.scenes];
        updatedScenes[sceneIndex] = { ...scene, image_url: imageUrl };
        const updatedResult = { ...result, scenes: updatedScenes };
        setResult(updatedResult);
        
        await saveHistoryItem(
          'movie-master',
          `${result.title} - Scene ${scene.scene_number}`,
          {
            prompt: scene.image_prompt,
            imageUrl: imageUrl,
            metadata: {
              scene_number: scene.scene_number,
              time_range: scene.time_range,
              description: scene.description
            }
          }
        );
      } else {
        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
          setShowKeyDialog(true);
          setGeneratingMedia(prev => ({ ...prev, [key]: false }));
          return;
        }

        if (!scene.image_url) {
          setError("กรุณาสร้างรูปภาพ Master Frame ก่อนเพื่อใช้เป็นจุดเริ่มต้นของวิดีโอ");
          setGeneratingMedia(prev => ({ ...prev, [key]: false }));
          return;
        }

        const videoUrl = await generateVideo(scene.video_prompt, scene.image_url);
        window.open(videoUrl, '_blank');
      }
    } catch (err: any) {
      if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('entity was not found')) {
        setShowKeyDialog(true);
      } else {
        setError(err.message || `Failed to generate ${type}`);
      }
    } finally {
      setGeneratingMedia(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-3">
          <Film className="w-10 h-10 text-orange-500" />
          Movie <span className="text-orange-500">Master</span>
        </h2>
        <p className="text-muted-foreground font-medium">
          สร้างหนังคุณภาพสูงแบบง่ายที่สุด แค่พิมพ์คอนเซปต์แล้วกดปุ่มเดียว
        </p>
      </div>

      <div className="bg-card p-8 rounded-3xl border shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-32 h-32 text-orange-500" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                🎬 คอนเซปต์หนังของคุณ
              </label>
              <button 
                onClick={async () => {
                  const { generateRandomTheme } = await import('../services/geminiService');
                  const theme = await generateRandomTheme();
                  setParams({ ...params, concept: theme });
                }}
                className="text-[10px] font-black text-orange-500 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> สุ่มคอนเซปต์
              </button>
            </div>
            <textarea
              value={params.concept}
              onChange={(e) => setParams({ ...params, concept: e.target.value })}
              placeholder="เช่น รถสปอร์ตวิ่งกลางสายฝนตอนกลางคืน โดยมี @ เป็นคนขับ..."
              className="w-full h-24 p-4 rounded-2xl border bg-background resize-none focus:ring-2 focus:ring-orange-500 outline-none transition-all text-lg font-medium"
            />
            <p className="text-[10px] text-orange-500 font-bold">Tip: ใช้ @ แทนตัวละครหลักเพื่อให้ AI คุมโทนหน้าตาให้เหมือนกัน</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">สไตล์ภาพ</label>
              <select
                value={params.style}
                onChange={(e) => setParams({ ...params, style: e.target.value as VisualStyle })}
                className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-orange-500 outline-none font-bold"
              >
                {Object.values(VisualStyle).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">รูปอ้างอิง (ถ้ามี)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  {referenceImage ? 'เปลี่ยนรูป' : 'อัปโหลด'}
                </button>
                {referenceImage && (
                  <div className="relative group">
                    <img src={referenceImage} className="w-10 h-10 object-cover rounded-lg border border-zinc-700" />
                    <button onClick={() => setReferenceImage(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-orange-500 transition-colors"
          >
            <Settings2 className="w-3 h-3" />
            ตั้งค่าขั้นสูง (ความยาว/จำนวนฉาก)
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ความยาวรวม (วินาที)</label>
                    <input
                      type="number"
                      value={params.duration}
                      onChange={(e) => setParams({ ...params, duration: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border bg-background focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">จำนวนฉาก</label>
                    <input
                      type="number"
                      value={params.sceneCount}
                      onChange={(e) => setParams({ ...params, sceneCount: parseInt(e.target.value) })}
                      className="w-full p-2 rounded-lg border bg-background focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGenerate}
            disabled={loading || !params.concept}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:bg-gray-800 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            คลิกเดียวเสกหนัง (บท + ภาพ)
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{result.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{result.overall_description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.scenes.map((scene, idx) => (
                <div key={idx} className="bg-card rounded-3xl border shadow-lg overflow-hidden flex flex-col">
                  <div className="p-5 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Scene {scene.scene_number} ({scene.time_range})
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
                      "{scene.description}"
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateMedia(idx, 'image')}
                        disabled={generatingMedia[`${idx}-image`]}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        {generatingMedia[`${idx}-image`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        เจนภาพ Master
                      </button>
                      <button
                        onClick={() => handleGenerateMedia(idx, 'video')}
                        disabled={generatingMedia[`${idx}-video`]}
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        {generatingMedia[`${idx}-video`] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                        เจนวิดีโอ (Veo)
                      </button>
                    </div>
                  </div>

                  <div className="aspect-video bg-black relative flex items-center justify-center border-t border-border">
                    {scene.image_url ? (
                      <img 
                        src={scene.image_url} 
                        alt={`Scene ${scene.scene_number}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center space-y-2 text-gray-600">
                        <ImageIcon className="w-10 h-10 mx-auto opacity-20" />
                        <p className="text-[10px] uppercase font-black tracking-widest">No Image</p>
                      </div>
                    )}
                    {generatingMedia[`${idx}-image`] && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                      </div>
                    )}
                    {generatingMedia[`${idx}-video`] && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 text-center">
                        <div className="space-y-2">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">Generating Video...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showKeyDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a14] w-full max-w-md rounded-3xl border border-border shadow-2xl p-8 space-y-6">
            <div className="flex items-center gap-4 text-yellow-500">
              <AlertCircle className="w-10 h-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight">Paid API Key Required</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              การสร้างวิดีโอด้วย Veo 3.1 จำเป็นต้องใช้ API Key ของคุณเอง (Paid Google Cloud Project) 
              กรุณาเลือก Key ที่รองรับเพื่อดำเนินการต่อ
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await (window as any).aistudio?.openSelectKey();
                  setShowKeyDialog(false);
                }}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-black hover:bg-orange-600 transition-all active:scale-95"
              >
                เลือก API Key
              </button>
              <button
                onClick={() => setShowKeyDialog(false)}
                className="w-full py-4 bg-gray-800 text-gray-400 rounded-xl font-black hover:text-white transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieMasterMode;
