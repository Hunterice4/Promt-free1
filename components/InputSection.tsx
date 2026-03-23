
import React, { useState } from 'react';
import { VisualStyle, CharacterEmotion, ScriptTemplate, ScriptFramework } from '../types';
import { SparklesIcon, FaceSmileIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

interface InputSectionProps {
  objectName: string;
  setObjectName: (val: string) => void;
  additionalDetails: string;
  setAdditionalDetails: (val: string) => void;
  template: ScriptTemplate;
  setTemplate: (val: ScriptTemplate) => void;
  framework: ScriptFramework;
  setFramework: (val: ScriptFramework) => void;
  includeHeadline: boolean;
  setIncludeHeadline: (val: boolean) => void;
  style: VisualStyle;
  setStyle: (val: VisualStyle) => void;
  emotion: CharacterEmotion;
  setEmotion: (val: CharacterEmotion) => void;
  sceneCount: number;
  setSceneCount: (val: number) => void;
  onGenerate: () => void;
  onAutoGenObject: () => Promise<void>;
  loading: boolean;
}

const emotionOptions = [
  { type: CharacterEmotion.Angry, label: 'โมโห', icon: '😡' },
  { type: CharacterEmotion.Sarcastic, label: 'ด่านิดๆ', icon: '😏' },
  { type: CharacterEmotion.Vulgar, label: 'หยาบดิบ', icon: '🤬' },
  { type: CharacterEmotion.Cute, label: 'น่ารัก', icon: '🥰' },
  { type: CharacterEmotion.Professional, label: 'มืออาชีพ', icon: '🧐' },
  { type: CharacterEmotion.Depressed, label: 'ซึมเศร้า', icon: '😭' },
  { type: CharacterEmotion.Psychotic, label: 'โรคจิต', icon: '🤪' },
  { type: CharacterEmotion.Painful, label: 'เจ็บปวด', icon: '😫' },
];

export const InputSection: React.FC<InputSectionProps> = ({
  objectName,
  setObjectName,
  additionalDetails,
  setAdditionalDetails,
  template,
  setTemplate,
  framework,
  setFramework,
  includeHeadline,
  setIncludeHeadline,
  style,
  setStyle,
  emotion,
  setEmotion,
  sceneCount,
  setSceneCount,
  onGenerate,
  onAutoGenObject,
  loading
}) => {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggest = async () => {
    setIsSuggesting(true);
    await onAutoGenObject();
    setIsSuggesting(false);
  };

  return (
    <div className="w-full lg:w-1/3 p-6 space-y-8 flex flex-col lg:h-full lg:overflow-y-auto bg-[#0a0a14] border-r border-border lg:custom-scrollbar">
      <div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          Autodraw <span className="text-[#0066ff]">Pro</span>
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          ปลุกเสกสิ่งของให้มีชีวิต พร้อมวาดภาพประกอบสุดโปร
        </p>
      </div>

      <div className="space-y-6">
        {/* Object Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
            👻 สิ่งของที่ต้องการปลุกเสก
          </label>
          <div className="relative group">
            <input
              type="text"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
              placeholder="เช่น ทุเรียน, ล้อรถยนต์..."
              className="w-full bg-card border border-border rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 transition-all placeholder-gray-600"
            />
            <button
              onClick={handleSuggest}
              disabled={isSuggesting}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                isSuggesting 
                ? 'bg-gray-800 text-gray-600' 
                : 'bg-[#0066ff]/10 text-[#0066ff] hover:bg-[#0066ff] hover:text-white'
              }`}
              title="สุ่มไอเดียสิ่งของ"
            >
              <SparklesIcon className={`w-5 h-5 ${isSuggesting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Additional Details Input (Optional) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <PencilSquareIcon className="w-4 h-4" /> รายละเอียดเพิ่มเติม (Optional)
          </label>
          <input
            type="text"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="เช่น พูดถึงวิธีการดูแลรักษา, บ่นเจ้าของ..."
            className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 transition-all placeholder-gray-600"
          />
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" /> รูปแบบเนื้อหา (Template)
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as ScriptTemplate)}
            className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 transition-all appearance-none cursor-pointer"
          >
            {Object.values(ScriptTemplate).map((t) => (
              <option key={t} value={t} className="bg-[#0a0a14] text-white">
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Framework Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" /> โครงสร้างสคริปต์ (Framework)
          </label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value as ScriptFramework)}
            className="w-full bg-card border border-border rounded-xl p-4 text-white focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 transition-all appearance-none cursor-pointer"
          >
            {Object.values(ScriptFramework).map((f) => (
              <option key={f} value={f} className="bg-[#0a0a14] text-white">
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Headline Toggle */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div className="space-y-1">
            <label className="text-xs font-black text-white uppercase tracking-wider">พาดหัวเรื่อง (Headline)</label>
            <p className="text-[10px] text-gray-500">ใส่พาดหัวในรูปแรกของวิดีโอ</p>
          </div>
          <button
            onClick={() => setIncludeHeadline(!includeHeadline)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              includeHeadline ? 'bg-[#0066ff]' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeHeadline ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Character Emotion Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <FaceSmileIcon className="w-4 h-4" /> อารมณ์ตัวละคร
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {emotionOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setEmotion(opt.type)}
                className={`p-4 rounded-xl text-sm font-bold transition-all duration-300 border flex items-center gap-3 ${
                  emotion === opt.type
                    ? 'bg-[#0066ff]/10 border-[#0066ff] text-white blue-glow'
                    : 'bg-card border-border text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Style Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
            🎨 สไตล์ภาพ
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(VisualStyle).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`p-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  style === s
                    ? 'bg-[#0066ff]/10 border-[#0066ff] text-white blue-glow'
                    : 'bg-card border-border text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Scene Count */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">
            🎬 จำนวนฉาก (Max 4)
          </label>
          <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border w-fit">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setSceneCount(num)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black transition-all duration-300 ${
                  sceneCount === num
                    ? 'bg-[#0066ff] text-white shadow-lg shadow-[#0066ff]/30'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-auto space-y-4">
        <div className="px-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-2">
          <p className="text-[10px] text-red-400 font-bold text-center leading-tight">
            ⚠️ ระบบอาจปฏิเสธการสร้างเนื้อหาที่ผิดกฎเกณฑ์ความปลอดภัย <br />
            (Banned words / Sensitive topics)
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading || !objectName.trim()}
          className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-[#0066ff]/20 ${
            loading || !objectName.trim()
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-[#0066ff] text-white hover:bg-[#0055dd] active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>กำลังสร้างเนื้อหา...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6" />
              <span>สร้างคอนเทนต์สุดเดือด</span>
            </>
          )}
        </button>

        <div className="text-center pb-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Created by</p>
          <a 
            href="https://www.facebook.com/ByteVerseAI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#0066ff] text-xs font-black hover:underline"
          >
            Facebook: ByteVerse AI
          </a>
        </div>
      </div>
    </div>
  );
};
