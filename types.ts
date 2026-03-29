
export interface Scene {
  scene_number: number;
  image_prompt: string;
  video_prompt: string; // Must contain the "Thai voiceover says: ..." part
  image_url?: string; // Generated image URL (base64)
}

export interface ViralScript {
  title: string;
  hashtags: string[];
  scenes: Scene[];
  includeHeadline?: boolean;
}

export enum VisualStyle {
  ThreeD = "แอนิเมชัน 3 มิติ (3D Animation)",
  Realistic = "สมจริง (Realistic)",
  Anime = "อนิเมะ (Anime)",
  Cinematic = "ภาพยนตร์ (Cinematic)",
  PixelArt = "พิกเซลอาร์ต (Pixel Art)",
  Cyberpunk = "ไซเบอร์พังค์ (Cyberpunk)",
  Watercolor = "สีน้ำ (Watercolor)",
  ComicBook = "หนังสือการ์ตูน (Comic Book)",
  Claymation = "ดินปั้น (Claymation)",
  Retro80s = "เรโทรยุค 80 (Retro 80s)",
  Gothic = "กอธิค (Gothic)",
  Minimalist = "มินิมอล (Minimalist)",
  StudioPortrait = "ภาพถ่ายสตูดิโอ (Studio Portrait)",
  OilPainting = "ภาพวาดสีน้ำมัน (Oil Painting)",
  Sketch = "ภาพสเก็ตช์ดินสอ (Pencil Sketch)",
  NeonLight = "แสงนีออน (Neon Light)",
  Vaporwave = "เวเปอร์เวฟ (Vaporwave)",
  Steampunk = "สตีมพังค์ (Steampunk)"
}

export enum CharacterEmotion {
  Angry = "โมโห (Angry)",
  Sarcastic = "จิกกัด (Sarcastic)",
  Vulgar = "ดุดัน/บ่นตรงๆ (Vulgar)",
  Cute = "น่ารัก (Cute)",
  Professional = "มืออาชีพ (Professional)",
  Depressed = "ซึมเศร้า/สิ้นหวัง (Depressed)",
  Psychotic = "โรคจิต/หลอน (Psychotic)",
  Painful = "เจ็บปวด/ทรมาน (Painful)"
}

export enum VoiceGender {
  Auto = "ไม่ระบุ (Auto)",
  Male = "ผู้ชาย (Male)",
  Female = "ผู้หญิง (Female)"
}

export enum VoiceTone {
  Auto = "ไม่ระบุ (Auto)",
  Energetic = "ร่าเริง/พลังเยอะ (Energetic)",
  Calm = "นุ่มนวล/ฟังสบาย (Calm)",
  Serious = "จริงจัง/น่าเชื่อถือ (Serious)",
  Playful = "ขี้เล่น/กวนๆ (Playful)",
  Storytelling = "นักเล่าเรื่อง/น่าติดตาม (Storytelling)"
}

export enum ScriptTemplate {
  Roast = "กวนประสาท/จิกกัด (Roast Master)",
  Savage = "ดุดัน/บ่นตรงๆ (Savage)",
  EpicReview = "อวยยศ/เวอร์วัง (Epic Review)",
  SadStory = "เศร้า/เรียกน้ำตา (Drama)",
  Horror = "หลอน/สยองขวัญ (Horror)",
  Educational = "สาระแบบกาวๆ (Fake Facts)",
  Conspiracy = "ทฤษฎีสมคบคิด (Conspiracy)",
  Philosophical = "ปรัชญาจ๋าๆ (Philosophical)"
}

export enum ScriptFramework {
  Auto = "AI กำหนด (Auto)",
  PAS = "ปัญหา - กระตุ้น → แก้ไข (PAS)",
  AIDA = "ดึงดูด → สนใจ → อยาก → ทำ (AIDA)",
  BAB = "ก่อน - หลัง - ตัวเชื่อม (BAB)",
  HSP = "Hook - เล่าเรื่อง - Payoff (HSP)",
  HPL = "Hook - Payoff → วนลูป (HPL)",
  HRT = "Hook - บ่น → สอนสั้น (HRT)",
  CPV = "ชี้ปัญหา - สัญญา → ขอคะแนน (CPV)",
  HTE = "Hook - สอน » ทิ้งอารมณ์ (HTE)",
  SMR = "ทำลาย Myth + เฉลยจริง (SMR)",
  SBS = "Hook - ขั้นตอน (SBS: Step-by-Step)"
}

export interface GenerateParams {
  objectName: string;
  additionalDetails?: string;
  style: VisualStyle;
  emotion: CharacterEmotion;
  sceneCount: number;
  template: ScriptTemplate;
  framework: ScriptFramework;
  includeHeadline: boolean;
  enableViralSecrets?: boolean;
  enableVoiceover?: boolean;
  voiceGender?: VoiceGender;
  voiceTone?: VoiceTone;
}

export interface CharacterData {
  name: string;
  title: string;
  backstory: string;
  appearance: string;
  abilities: string[];
  image_prompt: string;
  image_url?: string;
}

export interface StoryData {
  title: string;
  logline: string;
  act1: string;
  act2: string;
  act3: string;
  cover_prompt: string;
  cover_url?: string;
}

export interface CharacterParams {
  concept: string;
  gender: string;
  age: string;
  skinTone: string;
  hairStyle: string;
  faceShape: string;
  personality: string;
  facialHair?: string;
  clothing: string;
  clothingColor: string;
  accessories: string;
  bodyDetails?: string;
  style: VisualStyle;
}

export interface StoryParams {
  theme: string;
  protagonist: string;
  tone: string;
  style: VisualStyle;
  enableViralSecrets?: boolean;
}

export interface DetailedPromptResult {
  title: string;
  description: string;
  prompt: string;
  hashtags: string[];
  hacks: string[];
}

export interface MascotParams {
  dna: string;
  gender: string;
  age: string;
  hair: string;
  features: string;
  style: VisualStyle;
}

export interface MascotData {
  master_dna: string;
  character_sheet_prompt: string;
  character_sheet_url?: string;
}

export interface TourScene {
  location: string;
  vibe: string;
  image_prompt: string;
  video_prompt: string;
  image_url?: string;
}

export interface TourData {
  title: string;
  introduction: string;
  scenes: TourScene[];
}

export interface TourParams {
  character_dna: string;
  referenceImage?: string;
  locations: string;
  style: VisualStyle;
  tone: string;
  atmosphere?: string;
  sceneCount: number;
  enableViralSecrets?: boolean;
  enableVoiceover?: boolean;
  voiceGender?: VoiceGender;
  voiceTone?: VoiceTone;
}

export interface CinematicScene {
  scene_number: number;
  time_range: string;
  description: string;
  image_prompt: string;
  video_prompt: string;
  voiceover?: string;
  image_url?: string;
  video_url?: string;
}

export interface CinematicData {
  title: string;
  overall_description: string;
  visual_consistency?: string; // Detailed description of main subject/environment for consistency
  scenes: CinematicScene[];
  negative_prompt: string;
}

export interface CinematicParams {
  concept: string;
  style: VisualStyle;
  duration: number;
  sceneCount: number;
}

export interface FigureData {
  url: string;
  prompt: string;
}
