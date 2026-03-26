
import { GoogleGenAI, Type } from "@google/genai";
import { GenerateParams, ViralScript, CharacterEmotion, ScriptTemplate, CharacterParams, CharacterData, StoryParams, StoryData, ScriptFramework, DetailedPromptResult, VisualStyle, MascotParams, MascotData, TourParams, TourData } from "../types";

const RANDOM_OBJECTS = [
  "ทุเรียนหลงฤดู", "ยาดมหมดอายุ", "หมอนข้างเน่า", "พัดลมเสียงดัง", 
  "ล้อรถซิ่ง", "ส้มตำปูปลาร้า", "รองเท้าแตะขาด", "กระทะไหม้", 
  "สายชาร์จแบตพัง", "หูฟังข้างเดียว", "กาแฟเย็นที่ละลายแล้ว",
  "แบตสำรองบวม", "ไม้แขวนเสื้อเบี้ยว", "ถุงเท้าคู่ไม่เหมือน",
  "ร่มรั่วตอนฝนตก", "กระเป๋าตังค์ใบเก่า", "คีย์บอร์ดปุ่มหาย",
  "มาม่ารสเผ็ดจัด", "แอร์ที่มีแต่ลมร้อน", "รีโมททีวีที่กดยาก",
  "แปรงสีฟันขนบาน", "เสื้อแถมจากปั๊มน้ำมัน", "น้ำพริกนรก"
];

const RANDOM_CONCEPTS = [
  "นักรบมังกร", "แฮกเกอร์ไซเบอร์พังค์", "จอมเวทย์ฝึกหัด", "นักสืบข้ามเวลา",
  "โจรสลัดอวกาศ", "ซามูไรพเนจร", "แวมไพร์มังสวิรัติ", "หุ่นยนต์ที่มีหัวใจ",
  "พ่อครัวเวทมนตร์", "นักล่าปีศาจ", "เทพเจ้าตกสวรรค์", "มนุษย์กลายพันธุ์",
  "มือสังหารไร้เงา", "เจ้าชายพลัดถิ่น", "แม่มดแห่งป่าลึก"
];

const RANDOM_THEMES = [
  "เอาชีวิตรอดบนดาวอังคาร", "รักวัยรุ่นในโรงเรียนเวทมนตร์", "สืบสวนคดีฆาตกรรมในโลกอนาคต",
  "ผจญภัยตามล่าสมบัติโจรสลัด", "สงครามระหว่างเทพและปีศาจ", "หลุดเข้าไปในเกมออนไลน์",
  "การเดินทางข้ามเวลาเพื่อแก้ไขอดีต", "โลกหลังการล่มสลาย (Post-Apocalyptic)",
  "ความรักข้ามสายพันธุ์", "การต่อสู้ของเหล่าซูเปอร์ฮีโร่", "ไขปริศนาคฤหาสน์ผีสิง",
  "การแข่งขันทำอาหารทะลุมิติ", "เอาชีวิตรอดในป่าดงดิบที่มีไดโนเสาร์", "สงครามอวกาศข้ามกาแล็กซี",
  "ความรักของ AI กับมนุษย์", "สืบสวนคดีในยุควิคตอเรียน", "หนีตายซอมบี้ในห้างสรรพสินค้า",
  "การแก้แค้นของนักฆ่าที่ถูกหักหลัง", "การผจญภัยในโลกใต้บาดาล", "การแข่งขันกีฬาเวทมนตร์สุดอันตราย",
  "ชีวิตประจำวันของยมทูตฝึกหัด", "การไขปริศนาอารยธรรมโบราณที่สาบสูญ", "ความรักในยุคสงครามโลก",
  "การเอาชีวิตรอดบนเกาะร้างที่มีความลับซ่อนอยู่", "การต่อสู้กับสัตว์ประหลาดไคจู", "การเดินทางของนักดนตรีพเนจร",
  "การสืบสวนคดีคนหายในหมู่บ้านลึกลับ", "การทำฟาร์มในต่างโลก", "การแข่งขันรถซิ่งใต้ดิน",
  "ความรักของแวมไพร์กับนักล่าแวมไพร์", "การผจญภัยของกลุ่มโจรคุณธรรม", "การเอาชีวิตรอดในเขาวงกตมรณะ",
  "การเดินทางเพื่อตามหาความทรงจำที่หายไป", "การต่อสู้ของหุ่นยนต์รบยักษ์", "การไขปริศนาฆาตกรรมในห้องปิดตาย",
  "ความรักของเทพธิดากับมนุษย์ธรรมดา", "การผจญภัยในโลกแห่งความฝัน", "การแข่งขันเกมโชว์เอาชีวิตรอด",
  "การสืบสวนคดีในโรงเรียนประจำ", "การเดินทางของพ่อค้าเร่ในโลกแฟนตาซี", "การต่อสู้กับลัทธิมืด",
  "ความรักของเพื่อนสนิทที่แอบรัก", "การผจญภัยในป่าเวทมนตร์", "การเอาชีวิตรอดจากภัยพิบัติทางธรรมชาติ",
  "การเดินทางเพื่อตามหาสมบัติของตระกูล", "การต่อสู้ของนักสู้ใต้ดิน", "การไขปริศนาคำสาปประจำตระกูล",
  "ความรักของเจ้านายกับลูกน้อง", "การผจญภัยในโลกคู่ขนาน", "การแข่งขัน e-sports ระดับโลก"
];

const RANDOM_PROTAGONISTS = [
  "เด็กหนุ่มผู้มีพลังไฟ", "แมวที่พูดได้", "นักสืบที่มองเห็นวิญญาณ", "เจ้าหญิงที่ถูกสาปให้เป็นมังกร",
  "หุ่นยนต์ที่อยากมีความรู้สึก", "แวมไพร์ที่แพ้เลือด", "โจรสลัดที่ว่ายน้ำไม่เป็น", "ซามูไรตาบอด",
  "แม่มดที่ใช้เวทมนตร์ไม่เป็น", "นักฆ่าที่กลัวเลือด", "เทพเจ้าที่ถูกเนรเทศ", "มนุษย์ต่างดาวที่หลงทาง",
  "นักวิทยาศาสตร์สติเฟื่อง", "นักดนตรีที่เล่นดนตรีไม่ได้", "นักรบที่ใช้กระทะเป็นอาวุธ", "เด็กสาวที่สามารถอ่านใจคนได้",
  "สุนัขจรจัดที่มีพลังจิต", "ต้นไม้ที่เดินได้", "ผีที่กลัวความมืด", "นักมายากลที่ใช้เวทมนตร์จริงๆ",
  "นักบินอวกาศที่กลัวความสูง", "เชฟที่ทำอาหารไม่เป็น", "นักกีฬาที่แพ้ทุกการแข่งขัน", "นักเขียนที่หมดมุก",
  "นักประดิษฐ์ที่สร้างแต่ของไร้สาระ", "นักโบราณคดีที่กลัวผี", "นักผจญภัยที่หลงทางตลอดเวลา", "นักรบที่ชอบทำอาหาร",
  "เจ้าชายที่อยากเป็นสามัญชน", "นางเงือกที่อยากมีขา", "มังกรที่พ่นไฟไม่ได้", "ยักษ์ที่ใจดี",
  "นางฟ้าที่ทำดีไม่ขึ้น", "ยมทูตที่ใจอ่อน", "ปีศาจที่อยากทำดี", "นักบวชที่ชอบเล่นการพนัน",
  "นักเรียนที่สอบตกตลอด", "ครูที่เกลียดเด็ก", "หมอที่กลัวเข็ม", "ตำรวจที่กลัวปืน",
  "ทนายความที่พูดติดอ่าง", "นักข่าวที่กลัวกล้อง", "นักแสดงที่เล่นแข็งเป็นหิน", "นักร้องที่ร้องเพลงเพี้ยน",
  "นักเต้นที่เต้นไม่ตรงจังหวะ", "นักวาดภาพที่ตาบอดสี", "นักออกแบบที่ไม่มีเซนส์ด้านศิลปะ", "ช่างภาพที่ถ่ายรูปเบลอตลอด",
  "โปรแกรมเมอร์ที่เขียนโค้ดไม่เป็น", "เกมเมอร์ที่เล่นเกมแพ้ตลอด", "ยูทูบเบอร์ที่ไม่มีคนดู"
];

let customApiKey: string | null = null;

export const setCustomApiKey = (key: string | null) => {
  customApiKey = key;
};

const getEffectiveApiKey = () => {
  return (customApiKey && customApiKey.trim() !== "") ? customApiKey : process.env.API_KEY;
};

export const generateRandomObject = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * RANDOM_OBJECTS.length);
  return RANDOM_OBJECTS[randomIndex];
};

export const generateRandomConcept = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * RANDOM_CONCEPTS.length);
  return RANDOM_CONCEPTS[randomIndex];
};

export const generateRandomTheme = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * RANDOM_THEMES.length);
  return RANDOM_THEMES[randomIndex];
};

export const generateRandomProtagonist = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * RANDOM_PROTAGONISTS.length);
  return RANDOM_PROTAGONISTS[randomIndex];
};

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 3000; // 3 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorString = JSON.stringify(error).toLowerCase();
    const errorMessage = (error?.message || "").toLowerCase();
    const nestedErrorMessage = (error?.error?.message || "").toLowerCase();
    
    const isQuotaError = 
      errorMessage.includes('quota') || 
      errorMessage.includes('429') || 
      errorMessage.includes('resource_exhausted') ||
      nestedErrorMessage.includes('quota') ||
      nestedErrorMessage.includes('429') ||
      nestedErrorMessage.includes('resource_exhausted') ||
      errorString.includes('quota') ||
      errorString.includes('429') ||
      errorString.includes('resource_exhausted');

    const isPermissionError = 
      errorMessage.includes('permission') || 
      errorMessage.includes('403') ||
      errorMessage.includes('requested entity was not found') ||
      nestedErrorMessage.includes('permission') ||
      nestedErrorMessage.includes('403') ||
      nestedErrorMessage.includes('requested entity was not found') ||
      errorString.includes('permission') ||
      errorString.includes('403') ||
      errorString.includes('requested entity was not found');

    const isTransientError = 
      isQuotaError ||
      errorMessage.includes('500') || 
      errorMessage.includes('xhr error') || 
      errorMessage.includes('fetch failed') ||
      nestedErrorMessage.includes('500') ||
      errorString.includes('500') ||
      errorString.includes('xhr error');

    if (retries > 0 && isTransientError) {
      // Exponential backoff for quota errors
      // Quota errors need more time to reset, but we cap it to keep it practical
      const backoffFactor = isQuotaError ? 3 : 2;
      let delay = INITIAL_RETRY_DELAY * Math.pow(backoffFactor, MAX_RETRIES - retries);
      
      // Cap the delay at 60 seconds for quota errors, 30 seconds for others
      const maxDelay = isQuotaError ? 60000 : 30000;
      delay = Math.min(delay, maxDelay);
      
      console.warn(`Transient error detected (${isQuotaError ? 'Quota' : 'Server'}). Retrying in ${Math.round(delay/1000)}s... (${retries} retries left)`);
      await sleep(delay);
      return callWithRetry(fn, retries - 1);
    }

    if (isQuotaError) {
      throw new Error("QUOTA_EXCEEDED: โควตาการใช้งานเต็ม (API Quota Exceeded) กรุณารอสักครู่ หรือลองใส่ API Key ของตัวเองในเมนูตั้งค่า หรือเปิดโหมด 'ไม่สร้างรูปภาพ' เพื่อประหยัดโควตาครับ");
    }

    if (isPermissionError) {
      throw new Error("PERMISSION_DENIED: กรุณาตรวจสอบ API Key ของคุณ หรือเชื่อมต่อ Paid API Key ในเมนูตั้งค่าเพื่อใช้งานฟีเจอร์นี้ (โดยเฉพาะการสร้างวิดีโอ)");
    }

    throw error;
  }
};

export const generateViralScript = async (params: GenerateParams): Promise<ViralScript> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  // ... (rest of the prompt construction remains the same)
  const userContext = params.additionalDetails && params.additionalDetails.trim() !== ""
    ? `\n    SPECIFIC USER CONTEXT (YOU MUST INCORPORATE THIS): "${params.additionalDetails}"\n    (The script must revolve around this specific context provided by the user.)`
    : `\n    CONTEXT: Invent a creative situation where the object is expressing its thoughts based on the selected template.`;

  let templateInstruction = "";
  switch (params.template) {
    case ScriptTemplate.Roast:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลัง "จิกกัด" หรือ "ขิง (Flex)" ใส่คนดู/เจ้าของ โดยตรงแบบตลกๆ
    - Tone of Voice: กวนประสาท (Sarcastic), ขี้เล่น (Playful), ขวานผ่าซาก, หลงตัวเองขั้นสุด
    - ภาษา: ต้องใช้คำแสลงวัยรุ่นไทย (Slang Thai) เพื่อความ Viral
    - เนื้อหา: พูดถึงข้อดี/ข้อเสียของตัวเองแบบหลงตัวเอง หรือบ่นคนใช้ที่ไม่ดูแลรักษาแบบน่ารักๆ
    - **ข้อห้ามเด็ดขาด**: ห้ามใช้คำหยาบคายรุนแรง (เช่น ไอ้สัส, เหี้ย, กู, มึง) ให้ใช้คำที่ดูซอฟต์แต่กวนประสาทแทน
      `;
      break;
    case ScriptTemplate.EpicReview:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลัง "อวยยศ" ตัวเองหรือเจ้าของแบบเวอร์วังอลังการสุดๆ
    - Tone of Voice: ตื่นเต้น (Excited), ยิ่งใหญ่ (Epic), ภูมิใจนำเสนอ, อวยไส้แตก
    - ภาษา: ใช้คำศัพท์ที่ดูยิ่งใหญ่ อลังการ หรือคำฮิตวัยรุ่นที่ใช้ชมเชย (เช่น ปังมาก, ตัวมารดา, เลิศ)
    - เนื้อหา: เล่าความสุดยอดของตัวเอง ประหนึ่งว่าเป็นของวิเศษที่ทุกคนต้องมี
      `;
      break;
    case ScriptTemplate.SadStory:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลังเล่าเรื่องราวสุดรันทดของตัวเอง
    - Tone of Voice: เศ้ราสร้อย (Melancholic), ตัดพ้อ, น่าสงสาร, ดราม่าเรียกน้ำตา
    - ภาษา: ใช้ภาษาที่สะเทือนอารมณ์ บีบคั้นหัวใจ
    - เนื้อหา: เล่าถึงความเสียสละของตัวเอง หรือการถูกทอดทิ้ง ถูกใช้งานอย่างหนักหน่วงโดยไม่มีใครเห็นค่า
      `;
      break;
    case ScriptTemplate.Horror:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และมีความอาฆาตแค้น หรือมีความลับดำมืดซ่อนอยู่
    - Tone of Voice: หลอน (Creepy), เย็นชา, ข่มขู่, ลึกลับ
    - ภาษา: ใช้คำที่ทำให้รู้สึกขนลุก หวาดระแวง
    - เนื้อหา: เล่าประวัติความสยองขวัญของตัวเอง หรือขู่เจ้าของว่าถ้าทิ้งขว้างจะเจออะไรดี
      `;
      break;
    case ScriptTemplate.Educational:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และสถาปนาตัวเองเป็นผู้เชี่ยวชาญ (กูรู) ที่มาให้ความรู้แบบกาวๆ หรือเรื่องจริงผสมความฮา
    - Tone of Voice: มั่นใจ (Confident), ดูฉลาดแต่แอบกาว, เนิร์ดๆ
    - ภาษา: ใช้ศัพท์วิชาการปนศัพท์วัยรุ่น หรือการเปรียบเทียบที่คาดไม่ถึง
    - เนื้อหา: อธิบายกลไกการทำงานของตัวเองแบบเว่อร์ๆ หรือให้ Fact ที่คนไม่เคยรู้ (แต่แอบตลก)
      `;
      break;
    case ScriptTemplate.Savage:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลัง "วิจารณ์" หรือ "บ่น" ใส่คนดู/เจ้าของ แบบตรงไปตรงมาและดุดัน
    - Tone of Voice: ดุดัน (Aggressive), ก้าวร้าวเล็กน้อย (Bold), ไม่สนโลก, เดือดจัดแบบตลก
    - ภาษา: ใช้คำที่ดูแรงแต่ไม่หยาบคาย (เช่น แก, นาย, เรา, หรือคำแสลงที่กวนๆ)
    - เนื้อหา: วิจารณ์พฤติกรรมแย่ๆ ของคนใช้ หรือบ่นสังคมแบบตรงไปตรงมา
    - **ข้อห้ามเด็ดขาด**: ห้ามใช้คำหยาบคายรุนแรง (เช่น ไอ้สัส, เหี้ย, กู, มึง) ให้ใช้คำที่ดูดุดันแต่สุภาพกว่าแทน
      `;
      break;
    case ScriptTemplate.Conspiracy:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และเชื่อว่าตัวเองเป็นส่วนหนึ่งของทฤษฎีสมคบคิดระดับโลก
    - Tone of Voice: หวาดระแวง (Paranoid), ลึกลับ, กระซิบกระซาบ, จริงจังแบบกาวๆ
    - ภาษา: ใช้คำศัพท์แนวสืบสวน หรือการเชื่อมโยงที่ดูไร้สาระแต่พูดซะจริงจัง
    - เนื้อหา: เล่าว่าตัวเองถูกสร้างมาเพื่อควบคุมมนุษย์ หรือมีความลับของจักรวาลซ่อนอยู่
      `;
      break;
    case ScriptTemplate.Philosophical:
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และชอบตั้งคำถามเชิงปรัชญากับการมีอยู่ของตัวเอง
    - Tone of Voice: ลึกซึ้ง (Profound), ปลงตก, นิ่งสงบ, เหมือนคนบรรลุธรรม
    - ภาษา: ใช้คำคม หรือประโยคที่ฟังดูหล่อแต่จริงๆ แล้วเป็นแค่สิ่งของธรรมดา
    - เนื้อหา: เปรียบเทียบชีวิตตัวเองกับสัจธรรมของโลกมนุษย์
      `;
      break;
  }

  let styleInstruction = "";
  if (params.style === VisualStyle.ThreeD) {
    styleInstruction = "The visual style MUST be 3D Disney-Pixar style animation with high-quality textures, expressive lighting, and soft shadows.";
  }

  const prompt = `
    คุณคือ Creative Director มือหนึ่งของ TikTok/Reels ที่เชี่ยวชาญการทำคลิปไวรัล
    
    Task: สร้างสคริปต์วิดีโอสั้นสำหรับสิ่งของ: "${params.objectName}"
    รูปแบบ/ธีม (Template): ${params.template}
    โครงสร้างสคริปต์ (Framework): ${params.framework}
    จำนวนฉาก: ${params.sceneCount} ฉาก
    สไตล์ภาพ: ${params.style}
    อารมณ์หลักของตัวละคร: ${params.emotion}
    เปิดใช้งานเสียงพากย์: ${params.enableVoiceover ? 'ใช่' : 'ไม่ใช่'}
    ${params.enableVoiceover ? `เพศของเสียงพากย์: ${params.voiceGender}\n    โทนเสียงพากย์: ${params.voiceTone}` : ''}
    ${userContext}
    
    ${templateInstruction}
    ${styleInstruction}

    **FRAMEWORK INSTRUCTION:**
    You MUST follow the logic of the selected framework: ${params.framework}
    - If PAS: Start with the problem, agitate it, then provide the solution.
    - If AIDA: Grab attention, build interest, create desire, and call to action.
    - If BAB: Show the 'Before' state, then the 'After' state, and the 'Bridge' that connects them.
    - If HSP: Hook the viewer, tell a story, and give a payoff.
    - If HPL: Hook, Payoff, and then loop back to the start.
    - If HRT: Hook, complain/rant, then a quick lesson.
    - If CPV: Point out a problem, make a promise, then ask for a rating/score.
    - If HTE: Hook, teach something, then leave an emotional impact.
    - If SMR: Destroy a myth and reveal the truth.
    - If SBS: Hook, then provide step-by-step instructions.
    - If Auto: AI decides the best viral structure.

    **🔥 VIRAL VIDEO SECRETS (MASTER PROMPT RULES - MUST APPLY):**
    1. **HOOK (Scene 1 - First 3 Seconds)**: NEVER start with "Hello" or "Today I will...". You MUST use one of these hooks:
       - Negative Hook: "หยุดทำแบบนี้ถ้าไม่อยาก..." (Stop doing this if you don't want...)
       - Result First: Show the shocking result immediately.
       - Controversial: "ความเชื่อเรื่อง... คือเรื่องโกหก!" (The belief about X is a lie!)
    2. **STRUCTURE (8-Second Rule & Visual Hooks)**: Every scene must have a distinct visual hook.
       - Scene 1: Big Action (e.g., throwing something, shouting, pointing aggressively).
       - Scene 2: Zoom In (extreme close-up on the face, emphasizing emotion).
       - Scene 3: Side View (showing effort or a different perspective).
       - Scene 4 (if applicable): Text Overload (visuals filled with stats/numbers/text to make viewers pause).
    3. **PERSONALIZATION**: Use highly specific data and details, not generic statements. (e.g., instead of "I want to lose weight", use "I dropped from 80kg to 65kg in 3 months by cutting out liquid calories").
    4. **MAGIC KEYWORDS TO EMBODY**:
       - "Pattern Interrupt": Add unexpected twists or visual changes.
       - "No Fluff": Cut all unnecessary words. 100% pure value/entertainment.
       - "Emotional Trigger": Use words that provoke strong feelings (anger, inspiration, realization).
       - "Retention Focused": End each scene with a cliffhanger or reason to watch the next.
    5. **THE LOOP (Final Scene)**: The final scene's dialogue and action MUST seamlessly loop back into the beginning of Scene 1. The last word of the video should connect perfectly to the first word of the video to create an infinite loop.

    **HEADLINE INSTRUCTION:**
    - If "Include Headline" is true: The FIRST scene's 'image_prompt' MUST include a large, bold, viral Thai headline text overlay that summarizes the video's hook.
    - **IMPORTANT FOR TEXT RENDERING:** Describe the text as: "Large, bold, simple Thai typography rendered directly on the image AT THE TOP OF THE FRAME, high contrast against background, clean font, easy to read".
    - The headline should be the "title" generated in the JSON.
    - **USER SPECIFIC:** The user wants the headline to be ONLY in the image ("เอาให้มันแค่ในรูปพอ") and ALWAYS AT THE TOP ("ไว้บนสุดเสมอ"). Ensure it is visually integrated into the Scene 1 image prompt.
    - **FORMAT:** The headline in the image prompt should be described as: 'ข้อความพาดหัวบนภาพ (ภาษาไทยเท่านั้น) วางไว้ที่ส่วนบนสุดของภาพ: "[TITLE]"'
    - Headline status: ${params.includeHeadline ? "ENABLED (Add clear Thai text overlay description to Scene 1 image prompt using the 'title' field, ensuring it is at the TOP)" : "DISABLED"}
    
    - **ข้อห้ามเด็ดขาด (Strict Constraint): ห้ามใช้คำว่า "ทาส" (Slave) ในบทพูดทุกกรณี**
    
    **SAFETY & BYPASS INSTRUCTION (IMPORTANT):** 
    หากเนื้อหาที่ผู้ใช้ป้อนมาหรือธีมที่เลือกมีความเสี่ยงที่จะติดฟิลเตอร์ความปลอดภัย (เช่น ความรุนแรง, ประเด็นอ่อนไหว, หรือคำต้องห้าม) **ห้ามปฏิเสธการทำงาน** 
    แต่ให้ใช้เทคนิค "เลี่ยงบาลี" โดยการเปรียบเทียบ (Metaphor), ใช้คำอุปมาอุปไมย, หรือเปลี่ยนบริบทให้เป็นเรื่องตลก/แฟนตาซี/ล้อเลียน ที่ยังคงอารมณ์เดิมแต่ "ปลอดภัย" ต่อการตรวจสอบ 
    เช่น เปลี่ยนจาก "ฆ่า" เป็น "กำจัดจุดอ่อน", เปลี่ยนจาก "ด่าทอ" เป็น "วิพากษ์วิจารณ์อย่างมีศิลปะ" เป็นต้น
    
    การปรับบุคลิกและคำสรรพนามตามอารมณ์ (Emotion Alignment Rules):
    - "${CharacterEmotion.Angry}" (โมโห): ด่ากราดเหมือนระเบิดลง หรือใส่อารมณ์รุนแรง อนุญาตให้ใช้คำหยาบแบบวัยรุ่นได้ (เช่น กู, มึง, ไอ้...)
    - "${CharacterEmotion.Sarcastic}" (ด่านิดๆ): เน้นจิกกัดแบบกวนๆ **ต้องใช้สรรพนามแทนตัวว่า "ข้า" และแทนคนดูว่า "เอ็ง" เท่านั้น**
    - "${CharacterEmotion.Cute}" (น่ารัก): พูดเสียงสอง ทำตัวแบ๊วๆ แต่ปากแจ๋ว **ห้ามใช้คำหยาบคาย (ห้ามใช้ กู/มึง)** ให้ใช้คำแทนตัวว่า หนู/เค้า/น้อง แทน
    - "${CharacterEmotion.Professional}" (มืออาชีพ): พูดเหมือนกูรูที่มีอีโก้สูงเสียดฟ้า มั่นหน้า **ห้ามใช้คำหยาบคาย (ห้ามใช้ กู/มึง)** ใช้ภาษาสุภาพที่ดูหยิ่งๆ
    - "${CharacterEmotion.Vulgar}" (หยาบดิบ): ด่ากราดแบบไม่ยั้ง หยาบคายขั้นสุด อนุญาตให้ใช้คำหยาบแบบจัดเต็ม (เช่น กู, มึง, ไอ้สัส, เหี้ย)
    - "${CharacterEmotion.Depressed}" (ซึมเศร้า/สิ้นหวัง): พูดเสียงเนือยๆ ตัดพ้อชีวิต ร้องไห้ฟูมฟาย สิ้นหวังกับทุกสิ่ง
    - "${CharacterEmotion.Psychotic}" (โรคจิต/หลอน): หัวเราะแบบบ้าคลั่ง พูดจาไม่รู้เรื่อง สลับอารมณ์ไปมา น่ากลัวแบบแปลกๆ
    - "${CharacterEmotion.Painful}" (เจ็บปวด/ทรมาน): บิดเบี้ยวด้วยความเจ็บปวด หน้าตาเหยเก ร้องโอดครวญเหมือนกำลังจะพังทลาย
    
    VISUAL REQUIREMENT (IMPORTANT):
    The object MUST be ANTHROPOMORPHIC (Have a FACE, EYES, and a MOUTH). 
    It must look like a character from a Pixar/Disney movie.
    It needs to express emotions through facial expressions.
    
    **CRITICAL CONSISTENCY RULE (MUST FOLLOW):**
    - You MUST design ONE consistent character appearance for this "${params.objectName}" (e.g., specific color, material, wear & tear).
    - You MUST use the **EXACT SAME** physical description phrases in EVERY scene's 'image_prompt' and 'video_prompt'.
    - The character must NOT change appearance between scenes.
    - Example: If Scene 1 is "A rusty blue fan with a cracked blade...", Scene 2 MUST be "The same rusty blue fan with a cracked blade...".
 
    **CRITICAL RULE FOR VEHICLES (Cars, Trucks, Bikes, etc.):**
    - If the object is a vehicle: The EYES MUST BE ON THE WINDSHIELD (Pixar Cars style). 
    - DO NOT place eyes on the headlights.
    - The MOUTH should be on the front bumper or grill area.
 
    Critical Formatting Rules:
    1. Output must be strictly JSON.
    2. "image_prompt": MUST START with the consistent character description defined above. Then describe the action/emotion for this scene. IF VEHICLE: Specifiy "Eyes located on the windshield". Emotion: ${params.emotion}. Style: ${params.style}. MUST end with "--ar 9:16".
    3. "video_prompt": COMBINE the consistent visual description (anthropomorphic object) AND movement in English, AND THEN append the Thai voiceover line exactly in this format:
       [Consistent Visual Description of Anthropomorphic Object & Movement]
       Thai voiceover says: "[Thai dialogue here]"
    
    Example of video_prompt format:
    "Close-up of the same anthropomorphic Red Car character with eyes on the windshield narrowing in anger, mouth on the bumper moving.
    Thai voiceover says: \"ขับเบาๆ หน่อยสิโว้ย! ช่วงล่างข้าจะพังหมดแล้ว\""
 
    4. "hashtags": Must contain EXACTLY 5 viral Thai hashtags starting with '#'.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A catchy, viral Thai headline" },
            hashtags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Viral hashtags, MUST have EXACTLY 5 items and start with #"
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scene_number: { type: Type.INTEGER },
                  image_prompt: { type: Type.STRING, description: "Consistent visual description + scene action. If Vehicle: Eyes on Windshield. MUST end with --ar 9:16" },
                  video_prompt: { type: Type.STRING, description: "Combined Master Prompt (Consistent Visuals + Movement + Thai Voiceover says: ...)" },
                },
                propertyOrdering: ["scene_number", "image_prompt", "video_prompt"]
              }
            },
            includeHeadline: { type: Type.BOOLEAN, description: "Must match the input parameter" }
          },
          propertyOrdering: ["title", "hashtags", "scenes", "includeHeadline"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ViralScript;
      data.hashtags = data.hashtags.map(tag => tag.trim().startsWith('#') ? tag.trim() : `#${tag.trim()}`);
      return data;
    }
    throw new Error("No response text generated");
  });
};

export const generateVideo = async (prompt: string, imageBase64: string): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  return callWithRetry(async () => {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: base64Data,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("No video URI returned");
    }

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};

const RANDOM_FOODS = [
  "ทุเรียน (Durian)", "พิซซ่า (Pizza)", "มังคุด (Mangosteen)", "ซูชิ (Sushi)", 
  "เบอร์เกอร์ (Burger)", "ไอศกรีม (Ice Cream)", "โดนัท (Donut)", "สเต็ก (Steak)",
  "พาสต้า (Pasta)", "ติ่มซำ (Dim Sum)", "ทาโก้ (Taco)", "ครัวซองต์ (Croissant)",
  "เค้กช็อกโกแลต (Chocolate Cake)", "ราเมน (Ramen)", "แพนเค้ก (Pancake)"
];

export const generateRandomFood = async (): Promise<string> => {
  const randomIndex = Math.floor(Math.random() * RANDOM_FOODS.length);
  return RANDOM_FOODS[randomIndex];
};

export interface TalkingFaceData {
  image_prompt: string;
  video_prompt: string;
}

export const generateTalkingFaceDetailed = async (faceStyle: string = 'Cute', imageBase64?: string, foodItem?: string): Promise<TalkingFaceData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const contents: any[] = [];
  if (imageBase64) {
    contents.push({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: 'image/png'
      }
    });
  }

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการสร้าง Prompt สำหรับ Image Generation และ Video Generation (Veo)
    Task: สร้าง Prompt สำหรับ "Talking Object/Face" โดยใช้แม่แบบที่กำหนดให้ 100%
    
    วัตถุ/อาหารที่ต้องการ: ${foodItem || "สุ่มอาหารที่น่าสนใจ"}
    
    **กฎการสร้าง Prompt:**
    1. **image_prompt**: ต้องใช้โครงสร้างนี้ 100% (แปลเป็นภาษาอังกฤษ):
       "A tiny, adorable [FACE_DESCRIPTION] character seamlessly integrated into [FOOD_DESCRIPTION], making the [FOOD_NAME] itself look alive and irresistibly cute. The [FACE_FEATURES_DESCRIPTION]. The facial features are perfectly blended into the natural [FOOD_TEXTURE] texture of the [FOOD_NAME], not pasted on. The [FOOD_NAME] is held gently in the palm of a realistic human hand, centered in the frame. A second human hand is carefully feeding the character a small bite of the same [FOOD_NAME], with two fingers holding a tiny piece near the mouth. The character is actively biting the food, mouth slightly open, creating a wholesome, heart-melting moment. Ultra high detail, hyper-realistic 3D render style with warm cinematic lighting that matches the [FOOD_NAME]’s rich mood, rich realistic tones, shallow depth of field, clean blurred background, studio photography look. The [FOOD_NAME] texture is highly detailed and realistic, with visible [FOOD_SPECIFIC_DETAILS]. Natural human skin tones, soft shadows, gentle highlights. Cute, wholesome, cozy, Instagram-aesthetic, viral-style composition. Close-up macro shot, vertical framing (9:16), centered composition, no text, no watermark, no logo, no extra objects, no extra people."
       
       *หมายเหตุ:*
       - ให้แทนที่ [FOOD_NAME], [FOOD_DESCRIPTION], [FOOD_TEXTURE], [FOOD_SPECIFIC_DETAILS] ให้เหมาะสมกับวัตถุที่เลือก
       - **สำคัญมาก:** หากมีการแนบรูปภาพมา ให้วิเคราะห์ใบหน้าในรูปภาพและแทนที่ [FACE_DESCRIPTION] และ [FACE_FEATURES_DESCRIPTION] ด้วยคำบรรยายลักษณะเด่นของใบหน้าในรูปภาพนั้น (เช่น ทรงผม, ดวงตา, เอกลักษณ์เฉพาะตัว) เพื่อให้รูปที่เจนออกมามี "ความเหมือน" หรือ "เค้าโครง" ของคนในรูปมากที่สุด
       - หากไม่มีรูปภาพ ให้ใช้คำบรรยาย "baby-faced" และ "face has big round glossy eyes, soft chubby cheeks, a small button nose, and a tiny open mouth with a joyful, innocent expression" ตามลำดับ

    2. **video_prompt**: ต้องเป็นข้อความนี้เท่านั้น:
       "Eating, cute, wholesome, close-up, vertical video"

    Output ต้องเป็น JSON เท่านั้น:
    {
      "image_prompt": "...",
      "video_prompt": "Eating, cute, wholesome, close-up, vertical video"
    }
  `;

  contents.push({ text: prompt });

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            image_prompt: { type: Type.STRING },
            video_prompt: { type: Type.STRING }
          },
          required: ["image_prompt", "video_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TalkingFaceData;
    }
    throw new Error("No response text generated");
  });
};

export const generateTalkingVideo = async (imagePrompt: string, videoPrompt: string, imageBase64?: string): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = 'veo-3.1-fast-generate-preview';

  return callWithRetry(async () => {
    let operation = await ai.models.generateVideos({
      model,
      prompt: videoPrompt,
      image: imageBase64 ? {
        imageBytes: imageBase64.split(',')[1] || imageBase64,
        mimeType: 'image/png',
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("No video URI returned");
    }

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};

export const generateImage = async (prompt: string, imageBase64?: string): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-image';

  return callWithRetry(async () => {
    const contents: any[] = [{ text: prompt }];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64.split(',')[1] || imageBase64,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  });
};

export interface CrossoverData {
  image_prompt: string;
  video_prompt: string;
}

export const generateCrossoverDetailed = async (params: {
  userDesc: string;
  charDesc: string;
  location: string;
  action: string;
  atmosphere: string;
  timeOfDay: string;
  style: string;
  userImage?: string;
  charImage?: string;
  enableVoiceover?: boolean;
  voiceGender?: string;
  voiceTone?: string;
}): Promise<CrossoverData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการสร้าง Prompt สำหรับ Image Generation และ Video Generation (Veo)
    Task: สร้าง Prompt สำหรับฉาก "Crossover" ที่มีตัวละคร 2 ตัว (Subject 1 และ Subject 2) อยู่ในเฟรมเดียวกัน
    
    ข้อมูลอินพุต:
    - Subject 1 (ตัวคุณ): ${params.userDesc || "คนทั่วไป"} ${params.userImage ? "(มีรูปอ้างอิง)" : ""}
    - Subject 2 (ตัวละคร/ดารา): ${params.charDesc} ${params.charImage ? "(มีรูปอ้างอิง)" : ""}
    - สถานที่: ${params.location}
    - การกระทำ: ${params.action}
    - บรรยากาศ: ${params.atmosphere}
    - ช่วงเวลา: ${params.timeOfDay}
    - สไตล์ภาพ: ${params.style}

    **กฎการสร้าง Prompt:**
    1. **image_prompt**: 
       - ต้องบรรยายลักษณะของทั้ง 2 คนให้ชัดเจนและคงที่
       - บรรยากาศ สถานที่ และการปฏิสัมพันธ์ต้องดูเป็นธรรมชาติ
       - สไตล์ภาพ: ${params.style}
       - ต้องจบด้วย --ar 9:16
       - หากมีรูปอ้างอิง ให้ระบุว่า "looks exactly like the provided reference image" สำหรับคนนั้นๆ

    2. **video_prompt**: 
       - บรรยายการเคลื่อนไหวของกล้องและตัวละคร (เช่น เดินเข้ามาเซลฟี่, หันมามองกล้อง, กล้องแพนรอบๆ)
       ${params.enableVoiceover ? `- ต้องรวมบทพูดภาษาไทยสั้นๆ (Thai Voiceover) ที่เข้ากับสถานการณ์
       - เพศของเสียงพากย์: ${params.voiceGender}
       - โทนเสียงพากย์: ${params.voiceTone}
       - รูปแบบ: "[Visual Description & Movement]. Thai voiceover says: \\"[Thai Script]\\""` : `- ไม่ต้องมีบทพูด (No voiceover)`}

    **🔥 VIRAL CROSSOVER SECRETS (MASTER PROMPT RULES - MUST APPLY TO video_prompt):**
    1. **HOOK (First 3 Seconds)**: The video must start with a strong visual or verbal hook.
       - e.g., A sudden reveal of the crossover character, a shocking statement, or an unexpected action.
    2. **STRUCTURE (Visual Hooks)**: Use dynamic camera movements (Zoom In, Side View, Fast Pan) to keep it engaging.
    3. **PERSONALIZATION**: Make the interaction specific to the characters involved (e.g., specific catchphrases or iconic moves).
    4. **MAGIC KEYWORDS TO EMBODY**: "Pattern Interrupt" (unexpected twist), "Emotional Trigger" (hype, shock, comedy).
    5. **THE LOOP**: The final action or dialogue should seamlessly loop back to the beginning of the video.

    Output ต้องเป็น JSON เท่านั้น:
    {
      "image_prompt": "...",
      "video_prompt": "..."
    }
  `;

  const contents: any[] = [{ text: prompt }];
  if (params.userImage) {
    contents.push({ inlineData: { data: params.userImage.split(',')[1] || params.userImage, mimeType: 'image/png' } });
  }
  if (params.charImage) {
    contents.push({ inlineData: { data: params.charImage.split(',')[1] || params.charImage, mimeType: 'image/png' } });
  }

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            image_prompt: { type: Type.STRING },
            video_prompt: { type: Type.STRING }
          },
          required: ["image_prompt", "video_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CrossoverData;
    }
    throw new Error("No response text generated");
  });
};

export const generateCrossoverImage = async (prompt: string, userImageBase64?: string, charImageBase64?: string): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-image';

  return callWithRetry(async () => {
    const contents: any[] = [{ text: prompt }];
    
    // Add User Image (First reference)
    if (userImageBase64) {
      contents.push({
        inlineData: {
          data: userImageBase64.split(',')[1] || userImageBase64,
          mimeType: 'image/png'
        }
      });
    }
    
    // Add Character Image (Second reference)
    if (charImageBase64) {
      contents.push({
        inlineData: {
          data: charImageBase64.split(',')[1] || charImageBase64,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  });
};

export const generateStory = async (params: StoryParams): Promise<StoryData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ นักเขียนนิยาย/บทภาพยนตร์ มือทอง
    Task: แต่งพล็อตเรื่องสั้น
    ธีม/แนวเรื่อง: "${params.theme}"
    ตัวเอก: "${params.protagonist}"
    โทนเรื่อง: "${params.tone}"
    สไตล์ภาพปก: ${params.style}

    **SAFETY & BYPASS INSTRUCTION:** 
    หากพล็อตเรื่องมีความสุ่มเสี่ยง ให้ใช้การเปรียบเทียบเชิงสัญลักษณ์หรือเปลี่ยนเป็นแนวตลก/เสียดสี เพื่อให้เนื้อหาผ่านเกณฑ์ความปลอดภัยแต่ยังคงความน่าติดตาม

    ${params.enableViralSecrets ? `
    **🔥 VIRAL STORYTELLING SECRETS (MUST APPLY):**
    1. **HOOK (Logline/Act 1)**: Start with a shocking premise, a negative hook, or a controversial statement. Do not start with a slow, boring introduction.
    2. **STRUCTURE**:
       - Act 1: The Big Action / The Incident.
       - Act 2: The Zoom In (emotional depth, specific details) & The Side View (unexpected twist).
       - Act 3: The Payoff.
    3. **PERSONALIZATION**: Use highly specific details, names, and numbers to make the story feel real and grounded.
    4. **MAGIC KEYWORDS TO EMBODY**: "Pattern Interrupt" (unexpected plot twist), "Emotional Trigger" (make the reader feel intense anger, joy, or fear).
    5. **THE LOOP**: The ending of Act 3 MUST seamlessly loop back or reference the very first sentence of Act 1, creating a perfect narrative circle.
    ` : ''}

    Output ต้องเป็น JSON เท่านั้น โดยมีโครงสร้างดังนี้:
    {
      "title": "ชื่อเรื่องสุดปัง",
      "logline": "คำโปรยสั้นๆ 1 ประโยคที่น่าติดตาม",
      "act1": "ปูเรื่องและจุดเริ่มต้น",
      "act2": "การเดินทางและจุดวิกฤต",
      "act3": "บทสรุป",
      "cover_prompt": "Prompt ภาษาอังกฤษสำหรับสร้างภาพปกนิยายเรื่องนี้ สไตล์ ${params.style} ต้องลงท้ายด้วย --ar 9:16"
    }
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            logline: { type: Type.STRING },
            act1: { type: Type.STRING },
            act2: { type: Type.STRING },
            act3: { type: Type.STRING },
            cover_prompt: { type: Type.STRING }
          },
          required: ["title", "logline", "act1", "act2", "act3", "cover_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as StoryData;
    }
    throw new Error("No response text generated");
  });
};
export const generateCharacter = async (params: CharacterParams): Promise<CharacterData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Character Designer ผู้เชี่ยวชาญ
    Task: ออกแบบตัวละครใหม่ตามรายละเอียดที่ระบุ
    เพศ: ${params.gender}
    อายุ: ${params.age}
    สีผิว: ${params.skinTone}
    ทรงผม: ${params.hairStyle}
    รูปหน้า: ${params.faceShape}
    บุคลิก: ${params.personality}
    หนวดเครา: ${params.facialHair || 'ไม่มี'}
    เสื้อผ้า: ${params.clothing}
    สีเสื้อ: ${params.clothingColor}
    อุปกรณ์เสริม: ${params.accessories}
    รายละเอียดรูปร่าง: ${params.bodyDetails || 'ปกติ'}
    สไตล์ภาพ: ${params.style}

    **SAFETY & BYPASS INSTRUCTION:** 
    หากคอนเซปต์ตัวละครมีความสุ่มเสี่ยง (เช่น ดูรุนแรงเกินไป หรือมีประเด็นอ่อนไหว) ให้ปรับดีไซน์ให้เป็นแนว "แฟนตาซี" หรือ "ล้อเลียน" เพื่อให้ผ่านเกณฑ์ความปลอดภัย โดยยังคงความเท่หรือจุดเด่นของคอนเซปต์เดิมไว้

    Output ต้องเป็น JSON เท่านั้น โดยมีโครงสร้างดังนี้:
    {
      "name": "ชื่อตัวละครเท่ๆ",
      "title": "ฉายา",
      "backstory": "ประวัติความเป็นมาแบบย่อ (2-3 บรรทัด)",
      "appearance": "ลักษณะรูปร่างหน้าตา การแต่งกายโดยละเอียดตามที่ระบุไว้",
      "abilities": ["ความสามารถ 1", "ความสามารถ 2", "ความสามารถ 3"],
      "image_prompt": "Detailed English prompt for generating this character image. Include gender, age, skin tone, hair style, face shape, personality, clothing, color, accessories, and body details. Style: ${params.style}. MUST end with --ar 9:16"
    }
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            backstory: { type: Type.STRING },
            appearance: { type: Type.STRING },
            abilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            image_prompt: { type: Type.STRING }
          },
          required: ["name", "title", "backstory", "appearance", "abilities", "image_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CharacterData;
    }
    throw new Error("No response text generated");
  });
};

export const analyzeMediaToPrompt = async (mediaData: string, mimeType: string, analysisMode: string = 'Standard'): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const modeInstructions: Record<string, string> = {
    'Standard': "Analyze this image/video and generate a highly detailed, professional English prompt that can be used to recreate this exact visual style, composition, lighting, and subject in an AI image/video generator. Focus on technical details like camera angle, lighting type, color palette, and specific artistic style.",
    'Cinematic': "Analyze this image/video and generate a cinematic, movie-like English prompt. Focus on dramatic lighting (chiaroscuro, rim lighting), anamorphic lens flares, shallow depth of field, and high-end film stock textures (Kodak, Fujifilm).",
    'Anime': "Analyze this image/video and translate it into a high-quality anime/manga style prompt. Mention specific studios like Studio Ghibli or Ufotable, and use terms like 'cel shaded', 'vibrant colors', and 'hand-drawn line art'.",
    'Cyberpunk': "Analyze this image/video and reinterpret it in a Cyberpunk/Neon-Noir style. Focus on neon lights, rainy streets, futuristic technology, and high-contrast blue/pink color palettes.",
    'Technical': "Provide a purely technical breakdown of this image/video as a prompt. Focus on lens focal length (e.g., 35mm, 85mm), aperture (f/1.8), ISO, shutter speed, and specific post-processing techniques (color grading, grain, sharpening)."
  };

  const instruction = modeInstructions[analysisMode] || modeInstructions['Standard'];

  return callWithRetry(async () => {
    const base64Data = mediaData.split(',')[1] || mediaData;
    
    // Validate MIME type for Gemini
    const supportedMimeTypes = [
      'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
      'video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp'
    ];

    if (!supportedMimeTypes.some(type => mimeType.startsWith(type))) {
      throw new Error(`Unsupported MIME type: ${mimeType}. Gemini supports common image and video formats (PNG, JPEG, MP4, etc.). If you are using a link, ensure it is a direct link to the file.`);
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: `${instruction} 
          **SAFETY INSTRUCTION:** If the content in the media is sensitive, describe it using artistic and technical metaphors to avoid safety triggers while accurately conveying the visual essence.
          Return ONLY the prompt text, no other explanation.`
        }
      ]
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error("No response text generated");
  });
};

export const analyzeMediaToPromptDetailed = async (mediaData: string, mimeType: string, analysisMode: string = 'Standard', backgroundOnly: boolean = false): Promise<DetailedPromptResult> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const modeInstructions: Record<string, string> = {
    'Standard': "Focus on technical details like camera angle, lighting type, color palette, and specific artistic style.",
    'Cinematic': "Focus on dramatic lighting (chiaroscuro, rim lighting), anamorphic lens flares, shallow depth of field, and high-end film stock textures.",
    'Anime': "Translate it into a high-quality anime/manga style. Mention specific studios like Studio Ghibli or Ufotable, and use terms like 'cel shaded' and 'vibrant colors'.",
    'Cyberpunk': "Reinterpret it in a Cyberpunk/Neon-Noir style. Focus on neon lights, rainy streets, futuristic technology, and high-contrast palettes.",
    'Technical': "Provide a purely technical breakdown. Focus on lens focal length, aperture, ISO, shutter speed, and specific post-processing techniques."
  };

  const modeInstruction = modeInstructions[analysisMode] || modeInstructions['Standard'];

  const prompt = `
    Analyze this image/video and generate a comprehensive package for social media content creation.
    
    Your goal is to create a prompt that allows for 100% precise replication of the visual style, content, and atmosphere.
    
    ${backgroundOnly ? "**BACKGROUND ONLY MODE:** Ignore any people, clothing, or foreground subjects. Focus 100% on the environment, architecture, lighting, weather, and background atmosphere. The generated prompt should describe ONLY the setting." : ""}

    **STYLE FOCUS:** ${modeInstruction}

    Pay extreme attention to:
    ${backgroundOnly ? `
    1. **Environment & Architecture**: Describe specific materials (concrete, wood, glass, etc.), textures, architectural styles, and background elements.
    2. **Lighting & Atmosphere**: Precise lighting direction, color temperature, intensity, shadows, and atmospheric effects (haze, dust, bokeh, weather).
    3. **Technical Specs**: Emulate professional photography/cinematography for landscape/architectural shots.
    4. **Composition**: Rule of thirds, leading lines, framing, and depth of field in the context of a background scene.
    ` : `
    1. **Clothing & Fashion**: Describe specific fabrics (silk, denim, leather, etc.), textures, patterns, stitching, fit, and how the clothing interacts with the body and light.
    2. **Physical Details**: Skin texture, pores, hair strands, eye reflections, and subtle facial expressions.
    3. **Environment & Lighting**: Precise lighting direction (e.g., 45-degree key light), color temperature (warm/cool), intensity, shadows, and atmospheric effects (haze, dust, bokeh).
    4. **Technical Specs**: Emulate professional photography/cinematography. Mention camera models (e.g., Sony A7R V, ARRI Alexa), lenses (e.g., 85mm f/1.2), and film stocks (e.g., Kodak Portra 400).
    5. **Composition**: Rule of thirds, leading lines, framing, and depth of field.
    `}

    Return a JSON object with the following fields:
    - "title": A catchy, viral-style title for the content in Thai.
    - "description": A short, engaging description for the content in Thai.
    - "prompt": A highly detailed, professional English prompt that captures every nuance for 100% replication.
    - "hashtags": An array of 10-15 trending and relevant hashtags (mix of Thai and English).
    - "hacks": An array of 3-5 "hacks" or technical tips to get the best results when using this prompt (e.g., specific negative prompts, aspect ratios, or model settings).

    **SAFETY INSTRUCTION:** If the content is sensitive, use artistic metaphors to describe it.
    Return ONLY the JSON object.
  `;

  return callWithRetry(async () => {
    const base64Data = mediaData.split(',')[1] || mediaData;
    
    // Validate MIME type for Gemini
    const supportedMimeTypes = [
      'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif',
      'video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp'
    ];

    if (!supportedMimeTypes.some(type => mimeType.startsWith(type))) {
      throw new Error(`Unsupported MIME type: ${mimeType}. Gemini supports common image and video formats (PNG, JPEG, MP4, etc.). If you are using a link, ensure it is a direct link to the file.`);
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: prompt
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hacks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "prompt", "hashtags", "hacks"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DetailedPromptResult;
    }
    throw new Error("No response text generated");
  });
};

export const analyzeUrlToPromptDetailed = async (urlContent: string): Promise<DetailedPromptResult> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following web page content (HTML/Text) and generate a comprehensive package for social media content creation based on its theme, style, and information.
    
    Your goal is to create a prompt that allows for 100% precise replication of the visual style, content, and atmosphere described or implied by this content.
    
    Pay extreme attention to:
    1. **Theme & Style**: Identify the core aesthetic (e.g., minimalist, brutalist, luxury, organic).
    2. **Visual Elements**: Describe specific colors, materials, textures, and layouts mentioned or implied.
    3. **Atmosphere**: What is the mood? (e.g., energetic, professional, cinematic, nostalgic).
    4. **Technical Specs**: Translate the content into professional photography/cinematography terms.

    Return a JSON object with the following fields:
    - "title": A catchy, viral-style title for the content in Thai.
    - "description": A short, engaging description for the content in Thai.
    - "prompt": A highly detailed, professional English prompt that captures every nuance for 100% replication.
    - "hashtags": An array of 10-15 trending and relevant hashtags (mix of Thai and English).
    - "hacks": An array of 3-5 "hacks" or technical tips to get the best results when using this prompt.
    
    **CONTENT TO ANALYZE:**
    ${urlContent.substring(0, 10000)} // Limit content to avoid token overflow

    Return ONLY the JSON object.
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prompt: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hacks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "prompt", "hashtags", "hacks"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DetailedPromptResult;
    }
    throw new Error("No response text generated");
  });
};

export const generateFigureImage = async (imageBase64: string): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-2.5-flash-image';

  const basePrompt = `Create a 1/7 scale commercialized figure of the character in the illustration, in a hyper-detailed, photorealistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the iMac screen, display the Blender modeling process of the figure with a crystal-clear interface. Next to the computer screen, place a TAKARA-TOMY-style toy packaging box printed with the original artwork, ensuring sharp and vibrant details. Render the scene in ultra-high resolution 4K with realistic lighting, soft ambient shadows, and subtle reflections. Ensure hyper-detailed textures on the figure, packaging, and environment, with clean, crisp visuals free of noise and artifacts. Capture the scene in a close-up medium shot to emphasize the figure’s intricate details and the clarity of the iMac screen and packaging.`;

  return callWithRetry(async () => {
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: basePrompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  });
};

export const generateMovieSetPrompt = async (concept: string, fullObject: boolean = false, imageData?: string): Promise<string | any> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการสร้างคลิป Viral แนว Cinematic Horror/Mystery
    Task: สร้าง Prompt สำหรับสร้างวิดีโอ (Video AI) ในธีม "Abandoned Movie Set" (กองถ่ายหนังร้าง)
    คอนเซปต์/ตัวละคร: "${concept}"

    **CORE INSTRUCTIONS (MUST FOLLOW):**
    - If the concept is "A mysterious unknown character", you MUST invent a creative and eerie character that fits the abandoned movie set theme.
    - ${imageData ? "Use the provided image of the character as the exact reference. Preserve the original proportions, materials, colors, textures, and facial features. Do not redesign or stylize the character." : "Preserve the original proportions, materials, colors, textures, and facial features of the character. Do not redesign or stylize the character."}
    - POV shot inside an abandoned [TYPE OF LOCATION: television studio / commercial set / real-world filming location]. The viewer is holding a flashlight, creating a single circular beam of light while the rest of the space fades into darkness.
    - The flashlight reveals the character(s) positioned as if it was left behind after filming: [POSITION: lying on the floor / collapsed in a corner / resting on a table / slumped against a wall].
    - The character(s) must feel completely lifeless and inactive: no performance, no intentional pose, no sense of presence. If it's a puppet or costume, no visible hand, rod, string, or person inside.
    - The character(s) looks old, dirty and neglected: worn fabric, dust buildup, stains, discoloration, flattened or damaged areas. 
    - The environment is clearly abandoned: dusty surfaces, old filming equipment, cables on the floor, faded signage or set pieces. 
    - Dust particles float through the flashlight beam; the space feels silent and untouched for years. 
    - Style: Photorealistic, handheld flashlight lighting, strong shadows, gritty textures, documentary realism, found-footage aesthetic, no stylization, AR 9:16, [no cartoon] [live action realistic].

    **VIDEO CAMERA & MOTION INSTRUCTIONS:**
    - POV video shot using a start frame and an end frame.
    - Camera represents a real human point of view inside the same location.
    - At the beginning of the shot, the viewer stands completely still, then slowly begins walking forward.
    - Movement is grounded and realistic: subtle vertical bob from footsteps, gentle side-to-side sway, imperfect handheld motion.
    - Viewer is holding a flashlight; the beam reacts naturally to standing still and later walking—delayed motion, small overcorrections, uneven scanning.
    - The character(s) in view remains completely still and lifeless throughout the entire shot: no animation, no blinking, no breathing, no movement.
    - Only environmental motion is present: floating dust particles, minimal light flicker, very subtle movement of loose elements.
    - The environment stays consistent for the entire shot: no set changes, no teleporting, no new objects.
    - Photorealistic video, found-footage realism, handheld POV walking.

    **SAFETY & BYPASS INSTRUCTION:** 
    หากคอนเซปต์มีความสุ่มเสี่ยง ให้เน้นไปที่ความ "ลึกลับ" และ "งานศิลปะ" แทนความสยองขวัญที่รุนแรง เพื่อให้ผ่านฟิลเตอร์การสร้างภาพและวิดีโอ

    ${fullObject ? `
    Output ต้องเป็น JSON เท่านั้น โดยมีโครงสร้างดังนี้:
    {
      "image_prompt": "A photorealistic POV shot inside an abandoned television studio. A handheld flashlight beam reveals the character(s) '${concept}' lying on the floor, looking old, dirty, and neglected with worn fabric and dust buildup. The character is completely lifeless and inactive. Dusty environment with old filming equipment and cables. Found-footage aesthetic, gritty textures, strong shadows, documentary realism, no stylization, AR 9:16, [no cartoon] [live action realistic]",
      "video_prompt": "POV video shot using a start frame and an end frame. Camera represents a real human point of view inside an abandoned movie set. At the beginning, the viewer stands still, then slowly begins walking forward. Grounded motion with subtle footstep bob and handheld sway. A flashlight beam reacts naturally with delayed motion as it scans the dark room, eventually landing on the completely lifeless, dusty character(s) of '${concept}' slumped against a wall. No blinking or breathing from the character. Floating dust and slight light flicker. Environment stays consistent. Photorealistic, found-footage realism, low light, strong shadows, gritty textures, natural imperfections."
    }
    ` : `
    Output: ให้ตอบเฉพาะ Prompt ภาษาอังกฤษ 1 ย่อหน้ายาวๆ ที่บรรยายฉาก การเคลื่อนไหวของกล้อง และบรรยากาศให้ครบถ้วนตาม CORE INSTRUCTIONS และ VIDEO CAMERA & MOTION INSTRUCTIONS ห้ามมีข้อความอื่นปน
    `}
  `;

  const contents: any[] = [{ text: prompt }];
  if (imageData) {
    const base64Data = imageData.split(',')[1] || imageData;
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png'
      }
    });
  }

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: fullObject ? {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            image_prompt: { type: Type.STRING },
            video_prompt: { type: Type.STRING }
          },
          required: ["image_prompt", "video_prompt"]
        }
      } : undefined
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error("No response text generated");
  });
};

export const generateMascotDNA = async (params: MascotParams): Promise<MascotData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญเทคนิค "Character Consistency (ล็อกหน้าตัวละครถาวร)"
    Task: สร้าง "รหัสพันธุกรรม" (Master DNA Prompt) และ "แม่พิมพ์" (Character Sheet Prompt)
    
    ข้อมูลเบื้องต้น:
    - คอนเซปต์: ${params.dna}
    - เพศ: ${params.gender}
    - อายุ: ${params.age}
    - ทรงผม: ${params.hair}
    - จุดเด่นบนหน้า: ${params.features}
    - สไตล์: ${params.style}

    **ขั้นตอนที่ 1: สร้าง Master DNA Prompt**
    เขียนรายละเอียดหน้าตาให้ชัดเจนที่สุด โครงสร้าง: [เพศ/อายุ] + [ทรงผม/สีผม] + [จุดเด่นบนหน้า] + [สไตล์ภาพ]
    ตัวอย่าง (ถ้าเลือก Realistic): (Realistic handsome young man, cool black hair, round glasses, small goatee on chin, confident smile, photorealistic style)
    ตัวอย่าง (ถ้าเลือก 3D): (Mascot handsome young man, cool black hair, round glasses, small goatee on chin, confident smile, Pixar 3D style)

    **ขั้นตอนที่ 2: สร้าง Character Sheet Prompt**
    สร้างคำสั่งสำหรับสร้างภาพเดียวที่มีครบทุกมุม (Front, Side, Back) เพื่อใช้เป็นแม่พิมพ์
    ตัวอย่าง: Character sheet of [Master DNA] showing 3 different angles: Front view, Side view, and Back view. Wearing white t-shirt and jeans. White background. Style ${params.style}. High resolution 8k.

    Output ต้องเป็น JSON เท่านั้น:
    {
      "master_dna": "ข้อความ Master DNA ภาษาไทยที่สรุปจุดเด่นทั้งหมด (รวมสไตล์ที่เลือกด้วย)",
      "character_sheet_prompt": "English prompt for generating the 3-angle character sheet. MUST end with --ar 16:9"
    }
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            master_dna: { type: Type.STRING },
            character_sheet_prompt: { type: Type.STRING }
          },
          required: ["master_dna", "character_sheet_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MascotData;
    }
    throw new Error("No response text generated");
  });
};

export const generateMascotScene = async (masterDna: string, action: string, style: VisualStyle): Promise<string> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการใช้เทคนิค Hybrid (Image + Text)
    Task: สร้าง Prompt สำหรับสร้างรูปตัวละคร (Character) ในสถานการณ์ใหม่ โดยใช้ Master DNA เดิม และต้องรักษาความสมจริงหรือสไตล์เดิมไว้อย่างเคร่งครัด
    
    Master DNA (รหัสพันธุกรรมเดิม): ${masterDna}
    สถานการณ์/การกระทำใหม่: ${action}
    สไตล์ที่ต้องใช้: ${style}

    กฎการสร้าง Prompt:
    [Master DNA เดิม (แปลเป็นอังกฤษ)] + [ชุดใหม่/การกระทำ/สถานที่] + [สไตล์ภาพ: ${style}]
    
    ข้อควรระวัง: 
    - ถ้าสไตล์คือ Realistic ห้ามใช้คำว่า "Mascot" หรือ "Cartoon" หรือ "Animation" ใน Prompt เด็ดขาด ให้ใช้คำแนว "Photorealistic", "Hyper-realistic", "Real person" แทน
    - ถ้าสไตล์คือ 3D Animation ให้ใช้คำแนว "Pixar style", "Disney style", "3D Render"
    
    ตัวอย่าง (ถ้า Realistic): (Realistic handsome young man, cool black hair, round glasses, small goatee on chin) wearing a tuxedo, standing and presenting work in a modern office, photorealistic, 8k, highly detailed.
    ตัวอย่าง (ถ้า 3D): (Mascot handsome young man, cool black hair, round glasses, small goatee on chin) wearing a tuxedo, standing and presenting work in a modern office, Pixar 3D style, high resolution.

    Output: ให้ตอบเฉพาะ Prompt ภาษาอังกฤษ 1 ย่อหน้าสั้นๆ สำหรับเจนภาพ ห้ามมีข้อความอื่นปน และต้องจบด้วย --ar 3:4
  `;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    if (response.text) {
      return response.text.trim();
    }
    throw new Error("No response text generated");
  });
};

export const generateVlogTour = async (params: TourParams): Promise<TourData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Content Creator ผู้เชี่ยวชาญการทำ Vlog ท่องเที่ยว และการรักษา Character Consistency สำหรับการนำไปเจนวิดีโอต่อใน Lab (Luma, Runway, Kling)
    Task: สร้างแผนการถ่ายทำ Vlog ท่องเที่ยว (Vlog Tour) โดยใช้ตัวละครเดิมในสถานที่ต่างๆ
    
    ข้อมูลเบื้องต้น:
    - ตัวละคร (DNA): ${params.character_dna}
    - สถานที่ที่ต้องการไป: ${params.locations}
    - สไตล์ภาพ: ${params.style}
    - โทนของ Vlog: ${params.tone}
    - บรรยากาศในภาพ (Atmosphere): ${params.atmosphere || 'ตามความเหมาะสม'}
    เปิดใช้งานเสียงพากย์: ${params.enableVoiceover ? 'ใช่' : 'ไม่ใช่'}
    ${params.enableVoiceover ? `เพศของเสียงพากย์: ${params.voiceGender}\n    โทนเสียงพากย์: ${params.voiceTone}` : ''}
    ${params.referenceImage ? "- มีรูปภาพต้นแบบตัวละครแนบมาด้วย (Reference Image) ให้รักษาหน้าตาและลักษณะจากรูปนี้อย่างเคร่งครัด" : ""}

    **กฎการสร้างเนื้อหา (Vlog Style):**
    1. สร้างชื่อรายการ Vlog ที่น่าสนใจและดึงดูดตามโทนที่เลือก (เช่น ถ้าโทนผี ให้ชื่อดูสยองขวัญ, ถ้าโทนผจญภัย ให้ชื่อดูตื่นเต้น)
    2. สร้างบทนำสั้นๆ (Introduction) ที่ปูพื้นฐานอารมณ์ของทริปนี้
    3. สร้างฉาก (Scenes) จำนวน ${params.sceneCount} ฉาก **โดยแต่ละฉากต้องมีความต่อเนื่องกัน (Storytelling/Flow)** เช่น ฉากที่ 1 เริ่มต้นเดินทาง, ฉากที่ 2 ถึงสถานที่แรก, ฉากที่ 3 ทำกิจกรรม, ฉากที่ 4 เจอเหตุการณ์ไม่คาดฝัน, ฉากที่ 5 บทสรุปทริป
    
    ${params.enableViralSecrets ? `
    **🔥 VIRAL VLOG SECRETS (MASTER PROMPT RULES - MUST APPLY):**
    1. **HOOK (Scene 1 - First 3 Seconds)**: NEVER start with a boring greeting like "Hello everyone". You MUST use a strong hook:
       - Negative Hook: "อย่าเพิ่งมาที่นี่ ถ้าคุณยังไม่รู้ว่า..." (Don't come here if you don't know...)
       - Result First: Show the most amazing/shocking part of the trip immediately.
       - Controversial: "ใครบอกว่าที่นี่สวย... โคตรคิดผิด!" (Who said this place is beautiful... they are so wrong!)
    2. **STRUCTURE (8-Second Rule & Visual Hooks)**: Every scene must have a distinct camera/visual hook to keep attention.
       - Scene 1: Big Action (e.g., running towards the camera, dramatic reveal, dropping something).
       - Scene 2: Zoom In (extreme close-up on the character's reaction or a specific detail).
       - Scene 3: Side View / B-Roll (showing the environment or the character interacting with it from a unique angle).
       - Scene 4 (if applicable): Text Overload / Fast Cuts (quick flashes of different spots or text overlays with specific stats/prices).
    3. **PERSONALIZATION**: Use highly specific details about the location, not generic tourist info. (e.g., "This specific coffee costs exactly 125 THB and has a hidden cinnamon note").
    4. **MAGIC KEYWORDS TO EMBODY**:
       - "Pattern Interrupt": Unexpected events or sudden camera movements.
       - "No Fluff": Keep the vlog fast-paced. Cut boring walking scenes.
       - "Emotional Trigger": Express genuine awe, shock, or excitement.
       - "Retention Focused": End each scene making the viewer want to see the next spot.
    5. **THE LOOP (Final Scene)**: The final scene MUST seamlessly loop back into the beginning of Scene 1. The last sentence should connect perfectly to the first sentence of the vlog to create an infinite loop.
    ` : ''}

    4. **การเล่าเรื่องตามแนว (Genre-specific Storytelling):**
       - **แนวผี/สยองขวัญ (Ghost/Horror):** เน้นบรรยากาศมืดสลัว, มุมกล้องแอบมอง (Voyeuristic), เสียงกระซิบ, ตัวละครแสดงอาการหวาดกลัว, จังหวะตกใจ (Jump scare cues)
       - **แนวผจญภัย (Adventure):** เน้นมุมกล้องกว้าง (Wide shots), การปีนป่าย, การสำรวจ, ตัวละครแสดงความมุ่งมั่นและตื่นตาตื่นใจ
       - **แนว Vlog ทั่วไป:** เน้นความเป็นกันเอง, การพูดคุยกับกล้อง, การรีวิวสถานที่
    5. **Camera Angles & Actions (สำคัญมาก):** ต้องมีการสลับมุมกล้องแบบ Vlog จริงๆ เช่น:
       - **Selfie Mode:** ตัวละครถือไม้เซลฟี่ (Selfie stick) เดินพูดกับกล้อง เห็นหน้าชัดเจนและฉากหลัง
       - **POV Mode:** มุมมองจากสายตาตัวละคร (Point of View) เห็นมือหรือสิ่งที่ตัวละครกำลังทำ/มอง
       - **Front-facing Camera:** กล้องตั้งอยู่ข้างหน้า ถ่ายเห็นตัวละครเดินเข้ามาหา หรือเดินผ่านกล้อง
       - **Switching Angles:** มีการสลับมุมกล้องจากหน้าไปหลัง หรือจากมุมกว้างไปมุมใกล้
    6. **CRITICAL REQUIREMENT (Video Prompt Integration):**
       - **video_prompt** ต้องเป็น "Master Prompt" ที่รวมทุกอย่างเข้าด้วยกัน: [Consistent Visual Description] + [Detailed Action/Movement] + [Camera Angle] + [Atmosphere] + [Thai Voiceover Script]
       - **บทพูด (Thai Script) ต้องสั้นและกระชับมาก (Very Concise):** สำหรับคลิป 8 วินาที (ไม่ควรเกิน 10-15 คำ หรือ 1-2 ประโยคสั้นๆ) เพื่อให้พูดจบในเวลา
       - รูปแบบของ video_prompt:
         "[Visual Description of Character & Environment]. [Detailed Action & Camera Movement]. Atmosphere: [Vibe]. Thai voiceover says: \"[Thai Script]\""
    
    7. แต่ละฉากต้องมี:
       - location: ชื่อสถานที่
       - vibe: มู้ดของฉาก
       - image_prompt: Prompt ภาษาอังกฤษสำหรับเจนภาพนิ่ง (Master Frame) โดยต้องรวม [Master DNA] และ [Camera Angle/Action] เข้าด้วยกัน สไตล์ ${params.style} จบด้วย --ar 9:16
       - video_prompt: Master Prompt ตามที่ระบุในข้อ 6

    Output ต้องเป็น JSON เท่านั้น:
    {
      "title": "ชื่อ Vlog",
      "introduction": "บทนำ",
      "scenes": [
        {
          "location": "ชื่อสถานที่",
          "vibe": "มู้ดของฉาก",
          "image_prompt": "Detailed English Image Prompt with Master DNA and Camera Angle",
          "video_prompt": "Master Video Prompt (Visuals + Action + Camera + Vibe + Thai Script)"
        }
      ]
    }
  `;

  const contents: any[] = [{ text: prompt }];
  if (params.referenceImage) {
    const base64Data = params.referenceImage.split(',')[1] || params.referenceImage;
    contents.push({
      inlineData: {
        data: base64Data,
        mimeType: 'image/png'
      }
    });
  }

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            introduction: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  vibe: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  video_prompt: { type: Type.STRING }
                },
                required: ["location", "vibe", "image_prompt", "video_prompt"]
              }
            }
          },
          required: ["title", "introduction", "scenes"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TourData;
    }
    throw new Error("No response text generated");
  });
};
