import React, { useState, useCallback } from 'react';
import { InputSection } from './InputSection';
import { OutputSection } from './OutputSection';
import { generateViralScript, generateRandomObject, generateImage } from '../services/geminiService';
import { VisualStyle, ViralScript, CharacterEmotion, ScriptTemplate, ScriptFramework } from '../types';

export const ObjectMode: React.FC = () => {
  const [objectName, setObjectName] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [template, setTemplate] = useState<ScriptTemplate>(ScriptTemplate.Roast);
  const [framework, setFramework] = useState<ScriptFramework>(ScriptFramework.Auto);
  const [includeHeadline, setIncludeHeadline] = useState(false);
  const [style, setStyle] = useState<VisualStyle>(VisualStyle.ThreeD);
  const [emotion, setEmotion] = useState<CharacterEmotion>(CharacterEmotion.Angry);
  const [sceneCount, setSceneCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<ViralScript | null>(null);

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
        sceneCount
      });
      
      setResult(scriptData);
      
      const skipImages = localStorage.getItem('skip_images') === 'true';
      if (skipImages) {
        setLoading(false);
        setLoadingStatus('');
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
          const isQuota = err?.message?.includes('429') || 
                          err?.error?.message?.includes('429') ||
                          JSON.stringify(err).includes('429') ||
                          JSON.stringify(err).includes('RESOURCE_EXHAUSTED');
          
          if (isQuota) {
            setLoadingStatus(`โควตาเต็ม! ข้ามภาพที่ ${i + 1}... (ลองเปิดโหมด 'ไม่สร้างรูปภาพ' ในเมนูตั้งค่า)`);
          } else {
            setLoadingStatus(`วาดภาพที่ ${i + 1} ไม่สำเร็จ...`);
          }
          completedCount++;
        }
      }
    } catch (error: any) {
      console.error("Failed to generate content", error);
      let errorMessage = "เกิดข้อผิดพลาดในการสร้างคอนเทนต์ กรุณาลองใหม่ หรือเช็ค API Key";
      
      if (error?.message?.includes('500') || error?.message?.includes('xhr error')) {
        errorMessage = "ระบบขัดข้องชั่วคราว (Gemini API 500) กรุณาลองใหม่อีกครั้งในอีกสักครู่";
      } else if (error?.message?.includes('429') || error?.message?.includes('Quota exceeded') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "โควตาการใช้งานเต็ม (API Quota Exceeded) กรุณารอสักครู่ หรือลองใส่ API Key ของตัวเองในเมนูตั้งค่า หรือเปิดโหมด 'ไม่สร้างรูปภาพ' เพื่อประหยัดโควตาครับ";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  }, [objectName, additionalDetails, template, style, emotion, sceneCount]);

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-full">
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
        sceneCount={sceneCount}
        setSceneCount={setSceneCount}
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
