
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
  ThreeD = "3D Animation",
  Realistic = "Realistic",
  Anime = "Anime",
  Cinematic = "Cinematic",
  PixelArt = "Pixel Art",
  Cyberpunk = "Cyberpunk",
  Watercolor = "Watercolor",
  ComicBook = "Comic Book",
  Claymation = "Claymation",
  Retro80s = "Retro 80s",
  Gothic = "Gothic",
  Minimalist = "Minimalist"
}

export enum CharacterEmotion {
  Angry = "โมโห",
  Sarcastic = "ด่านิดๆ",
  Vulgar = "หยาบดิบ (ด่ากราด)",
  Cute = "น่ารัก",
  Professional = "มืออาชีพ",
  Depressed = "ซึมเศร้า/สิ้นหวัง",
  Psychotic = "โรคจิต/หลอน",
  Painful = "เจ็บปวด/ทรมาน"
}

export enum ScriptTemplate {
  Roast = "Roast Master (กวนประสาท/ด่า)",
  Savage = "Savage (หยาบดิบ/ด่ากราด)",
  EpicReview = "Epic Review (อวยยศ/เวอร์วัง)",
  SadStory = "Drama (เศร้า/เรียกน้ำตา)",
  Horror = "Horror (หลอน/สยองขวัญ)",
  Educational = "Fake Facts (สาระแบบกาวๆ)",
  Conspiracy = "Conspiracy (ทฤษฎีสมคบคิด)",
  Philosophical = "Philosophical (ปรัชญาจ๋าๆ)"
}

export enum ScriptFramework {
  Auto = "Auto (AI กำหนด)",
  PAS = "PAS: ปัญหา - กระตุ้น → แก้ไข",
  AIDA = "AIDA: ดึงดูด → สนใจ → อยาก → ทำ",
  BAB = "BAB: ก่อน - หลัง - ตัวเชื่อม",
  HSP = "HSP: Hook - เล่าเรื่อง - Payoff",
  HPL = "HPL: Hook - Payoff → วนลูป",
  HRT = "HRT: Hook - บ่น → สอนสั้น",
  CPV = "CPV: ชี้ปัญหา - สัญญา → ขอคะแนน",
  HTE = "HTE: Hook - สอน » ทิ้งอารมณ์",
  SMR = "SMR: ทำลาย Myth + เฉลยจริง",
  SBS = "SBS: Hook - ขั้นตอน (Step-by-Step)"
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
  action: string;
  script: string;
  camera_movement: string;
  duration_plan: string;
  vibe: string;
  sound_fx: string;
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
  sceneCount: number;
}
