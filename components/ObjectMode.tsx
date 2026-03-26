import React, { useState, useCallback, useEffect } from 'react';
import { InputSection } from './InputSection';
import { OutputSection } from './OutputSection';
import { generateViralScript, generateRandomObject, generateImage } from '../services/geminiService';
import { VisualStyle, ViralScript, CharacterEmotion, ScriptTemplate, ScriptFramework, VoiceGender, VoiceTone } from '../types';
import { toast, Toaster } from 'sonner';

export const ObjectMode: React.FC = () => {
  const [objectName, setObjectName] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [template, setTemplate] = useState<ScriptTemplate>(ScriptTemplate.Roast);
  const [framework, setFramework] = useState<ScriptFramework>(ScriptFramework.Auto);
  const [includeHeadline, setIncludeHeadline] = useState(true);
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.ThreeD);
  const [emotion, setEmotion] = useState<CharacterEmotion>(CharacterEmotion.Angry);
  const [enableVoiceover, setEnableVoiceover] = useState(true);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(VoiceGender.Auto);
  const [voiceTone, setVoiceTone] = useState<VoiceTone>(VoiceTone.Auto);
  const [sceneCount, setSceneCount] = useState(1);
  const [skipImages, setSkipImages] = useState(() => localStorage.getItem('skip_images') === 'true');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<ViralScript | null>(null);

  useEffect(() => {
    localStorage.setItem('skip_images', String(skipImages));
  }, [skipImages]);

  const handleAutoGenObject = useCallback(async () => {
    try {
      const suggestedName = await generateRandomObject();
      setObjectName(suggestedName);
    } catch (error) {
      console.error("Auto Gen Failed", error);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!objectName.trim()) return;

    setLoading(true);
    setResult(null);
    setLoadingStatus('กำลังปั้นสคริปต์สุดเดือด...');

    try {
      const scriptData = await generateViralScript({
        objectName,
        additionalDetails,
        template,
        framework,
        includeHeadline,
        style,
        emotion,
        enableVoiceover,
        voiceGender,
        voiceTone,
        sceneCount
      });
      
      setResult(scriptData);
      
      if (skipImages) {
        setLoading(false);
        setLoadingStatus('');
        toast.success('สร้างสคริปต์สำเร็จ! (ข้ามการสร้างรูปภาพตามที่ตั้งค่าไว้)');
        return;
      }

      const updatedScenes = [...scriptData.scenes];
      let completedCount = 0;
      
      setLoadingStatus(`กำลังวาดภาพประกอบ (0/${updatedScenes.length})...`);
      
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        try {
          const imageUrl = await generateImage(scene.image_prompt);
          completedCount++;
          setLoadingStatus(`กำลังวาดภาพประกอบ (${completedCount}/${updatedScenes.length})...`);
          
          setResult(prev => {
            if (!prev) return prev;
            const newScenes = [...prev.scenes];
            newScenes[i] = { ...newScenes[i], image_url: imageUrl };
            return { ...prev, scenes: newScenes };
          });
          
          // Small delay between images to avoid rate limits
          if (i < updatedScenes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (err: any) {
          console.error(`Failed image ${i}`, err);
          const errorMsg = err?.message || JSON.stringify(err);
          const isQuota = errorMsg.includes('429') || 
                          errorMsg.includes('RESOURCE_EXHAUSTED') ||
                          errorMsg.includes('QUOTA_EXCEEDED');
          
          const isPermission = errorMsg.includes('403') || 
                               errorMsg.includes('PERMISSION_DENIED');

          if (isQuota) {
            toast.error(`โควตาเต็ม! ข้ามภาพที่ ${i + 1}`, {
              description: "กรุณารอสักครู่ หรือลองเปิดโหมด 'ไม่สร้างรูปภาพ' เพื่อประหยัดโควตา",
              duration: 5000,
            });
            setLoadingStatus(`โควตาเต็ม! ข้ามภาพที่ ${i + 1}...`);
          } else if (isPermission) {
            toast.error(`API Key ไม่ถูกต้อง!`, {
              description: "กรุณาตรวจสอบ API Key ของคุณในเมนูตั้งค่า",
              duration: 5000,
            });
            setLoadingStatus(`API Key ไม่ถูกต้อง...`);
          } else {
            setLoadingStatus(`วาดภาพที่ ${i + 1} ไม่สำเร็จ...`);
          }
          completedCount++;
        }
      }
    } catch (error: any) {
      console.error("Failed to generate content", error);
      const errorMsg = error?.message || "";
      
      if (errorMsg.includes('500') || errorMsg.includes('xhr error')) {
        toast.error("ระบบขัดข้องชั่วคราว (Gemini API 500)", {
          description: "กรุณาลองใหม่อีกครั้งในอีกสักครู่",
        });
      } else if (errorMsg.includes('429') || errorMsg.includes('Quota exceeded') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('QUOTA_EXCEEDED')) {
        toast.error("โควตาการใช้งานเต็ม!", {
          description: "กรุณารอสักครู่ หรือเปิดโหมด 'ไม่สร้างรูปภาพ' เพื่อประหยัดโควตา",
          duration: 6000,
        });
      } else if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED')) {
        toast.error("API Key ไม่ถูกต้อง!", {
          description: "กรุณาตรวจสอบ API Key ของคุณในเมนูตั้งค่า",
          duration: 6000,
        });
      } else {
        toast.error("เกิดข้อผิดพลาดในการสร้างคอนเทนต์", {
          description: "กรุณาลองใหม่ หรือเช็ค API Key ของคุณ",
        });
      }
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  }, [objectName, additionalDetails, template, framework, includeHeadline, style, emotion, enableVoiceover, voiceGender, voiceTone, sceneCount, skipImages]);

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full">
      <Toaster position="top-center" richColors />
      <InputSection
        objectName={objectName}
        setObjectName={setObjectName}
        additionalDetails={additionalDetails}
        setAdditionalDetails={setAdditionalDetails}
        template={template}
        setTemplate={setTemplate}
        framework={framework}
        setFramework={setFramework}
        includeHeadline={includeHeadline}
        setIncludeHeadline={setIncludeHeadline}
        style={style}
        setStyle={setStyle}
        emotion={emotion}
        setEmotion={setEmotion}
        enableVoiceover={enableVoiceover}
        setEnableVoiceover={setEnableVoiceover}
        voiceGender={voiceGender}
        setVoiceGender={setVoiceGender}
        voiceTone={voiceTone}
        setVoiceTone={setVoiceTone}
        sceneCount={sceneCount}
        setSceneCount={setSceneCount}
        skipImages={skipImages}
        setSkipImages={setSkipImages}
        onGenerate={handleGenerate}
        onAutoGenObject={handleAutoGenObject}
        loading={loading}
      />
      <OutputSection
        data={result}
        loading={loading}
        loadingStatus={loadingStatus}
      />
    </div>
  );
};
