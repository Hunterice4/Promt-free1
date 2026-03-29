
import { GoogleGenAI, Type } from "@google/genai";
import { GenerateParams, ViralScript, CharacterEmotion, ScriptTemplate, CharacterParams, CharacterData, StoryParams, StoryData, ScriptFramework, DetailedPromptResult, VisualStyle, MascotParams, MascotData, TourParams, TourData, CinematicParams, CinematicData, FigureData } from "../types";

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
  "การเอาชีวิตรอดบนเกาะร้างที่มีความลับซ่อนอยู่", "การต่อสู้กับสัตว์ประหลาดไคจู"
];

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
  const randomIndex = Math.floor(Math.random() * RANDOM_CONCEPTS.length);
  return RANDOM_CONCEPTS[randomIndex];
};

const getEffectiveApiKey = () => {
  return process.env.GEMINI_API_KEY || '';
};

const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error.status === 429) {
      console.warn(`Rate limited. Retrying in 2 seconds... (\${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callWithRetry(fn, retries - 1);
    }
    throw error;
  }
};

export const generateViralScript = async (params: GenerateParams): Promise<ViralScript> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  let templateInstruction = "";
  if (params.template.includes("Comedy")) {
    templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลังบ่นเรื่องราวของตัวเองแบบตลกขบขัน
    - Tone of Voice: ประชดประชัน (Sarcastic), ตลก, จิกกัดมนุษย์
    - ภาษา: ใช้ภาษาพูดวัยรุ่นไทย มีคำสร้อย เช่น "โอ้ยยย", "คือแบบ", "สภาพพพ"
    - เนื้อหา: บ่นเรื่องที่ต้องเจอทุกวัน หรือพฤติกรรมแปลกๆ ของมนุษย์ที่ทำกับสิ่งของนี้
    `;
  } else if (params.template.includes("Drama")) {
      templateInstruction = `
    Personality (สำคัญมาก):
    - สิ่งของนี้ "มีชีวิต" และกำลังเล่าเรื่องราวสุดรันทดของตัวเอง
    - Tone of Voice: เศร้าสร้อย (Melancholic), ตัดพ้อ, น่าสงสาร, ดราม่าเรียกน้ำตา
    - ภาษา: ใช้ภาษาที่สะเทือนอารมณ์ บีบคั้นหัวใจ เน้นคำที่แสดงความน้อยเนื้อต่ำใจ
    - เนื้อหา: เล่าถึงความเสียสละของตัวเอง หรือการถูกทอดทิ้ง ถูกใช้งานอย่างหนัก
    `;
  }

  let styleInstruction = "";
  if (params.style === VisualStyle.ThreeD) {
    styleInstruction = "The visual style MUST be 3D Disney-Pixar style animation with high-quality textures, expressive lighting, and soft shadows.";
  }

  const prompt = `
    คุณคือ Creative Director มือหนึ่งของ TikTok/Reels ที่เชี่ยวชาญการทำคลิปไวรัล
    
    Task: สร้างสคริปต์วิดีโอสั้นสำหรับสิ่งของ: "${params.objectName}"
    
    ${templateInstruction}
    ${styleInstruction}
    
    **VIRAL SCRIPT FORMULA (MUST FOLLOW STRICTLY):**
    1. **THE HOOK (Scene 1)**: Must grab attention in the first 3 seconds.
       - Visual: Extreme close-up or unexpected action.
       - Audio: A bold statement, a weird question, or an angry shout.
       - Examples: "หยุดเลื่อน! ถ้าคุณยังใช้ฉันแบบผิดๆ", "รู้ไหมว่าฉันต้องทนอะไรบ้าง?", "นี่คือสิ่งที่พวกมนุษย์ไม่เคยรู้..."
    2. **THE ESCALATION (Scene 2-3)**: Build the emotion or the joke.
       - Visual: Show the struggle, the ridiculousness, or the "truth".
       - Audio: Explain the pain, the conspiracy, or the savage truth with high energy.
    3. **THE CLIMAX/PUNCHLINE (Scene 4)**: The peak of the emotion.
       - Visual: Dramatic lighting, intense action.
       - Audio: The most memorable line.
    4. **THE LOOP (Final Scene)**: The final scene's dialogue and action MUST seamlessly loop back into the beginning of Scene 1. The last word of the video should connect perfectly to the first word of the video to create an infinite loop.
    
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
    
    VISUAL REQUIREMENT (IMPORTANT):
    The object MUST be ANTHROPOMORPHIC (Have a FACE, EYES, and a MOUTH). 
    It must look like a character from a Pixar/Disney movie.
    It needs to express emotions through facial expressions.

�ือนกำลังจะพังทลาย
    
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
  charPersonality?: string;
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
  sequenceIndex?: number;
  totalScenes?: number;
  isVlogJourney?: boolean;
}): Promise<CrossoverData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const sequenceContext = params.sequenceIndex !== undefined && params.totalScenes !== undefined
    ? `\n    SEQUENCE CONTEXT: This is scene ${params.sequenceIndex + 1} of ${params.totalScenes}. 
       ${params.isVlogJourney ? `VLOG JOURNEY MODE: The user is on a journey meeting multiple characters. 
       In this specific scene, the user is interacting with ${params.charDesc} ${params.charPersonality ? `(Personality: ${params.charPersonality})` : ""}. 
       If this is NOT the first scene, the video_prompt MUST describe a smooth, realistic transition. 
       DO NOT use "warping" or sudden jumps. 
       Instead, use a "PAN RIGHT" camera movement from the previous character/location to find ${params.charDesc}. 
       The camera should feel like a handheld selfie stick or POV vlog camera, showing the movement and the environment during the pan.` : `If this is not the first scene, describe the transition or movement from the previous character/location to this one.`}
       Make it feel like a continuous vlog or journey.`
    : "";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการสร้าง Prompt สำหรับ Image Generation และ Video Generation (Veo)
    Task: สร้าง Prompt สำหรับฉาก "Crossover" ที่มีตัวละคร 2 ตัว (Subject 1 และ Subject 2) อยู่ในเฟรมเดียวกัน
    
    ข้อมูลอินพุต:
    - Subject 1 (ตัวคุณ): ${params.userDesc || "A person"} ${params.userImage ? "(มีรูปอ้างอิง)" : ""}
    - Subject 2 (ตัวละคร/ดารา): ${params.charDesc} ${params.charImage ? "(มีรูปอ้างอิง)" : ""}
    - นิสัย/สไตล์ Subject 2: ${params.charPersonality || "ตามบุคลิกจริงของตัวละคร"}
    - สถานที่: ${params.location}
    - การกระทำ: ${params.action}
    - บรรยากาศ: ${params.atmosphere}
    - ช่วงเวลา: ${params.timeOfDay}
    - สไตล์ภาพ: ${params.style}
    ${sequenceContext}

    **กฎการสร้าง Prompt (เน้นความสมจริงและเอฟเฟกต์):**
    1. **image_prompt**: 
       - ต้องบรรยายลักษณะของทั้ง 2 คนให้ชัดเจนและคงที่
       - **CHARACTER PERSONALITY (CRITICAL)**: วิเคราะห์ชื่อและลักษณะของ Subject 2 (${params.charDesc}) รวมถึงนิสัย (${params.charPersonality || "ตามบุคลิกจริง"}) และต้องให้แสดงออก (Expression), ท่าทาง (Pose), และการปฏิสัมพันธ์ (Interaction) ที่ตรงตามบุคลิกจริงของตัวละครนั้นๆ อย่างเคร่งครัด (เช่น ถ้าเป็น Jason Voorhees ต้องดูสุขุม นิ่งเงียบ น่าเกรงขาม ไม่ยิ้มแย้มหรือทำท่าทางร่าเริงผิดปกติ, ถ้าเป็นตัวละครที่ดุดันก็ต้องดูดุดัน)
       - **HYPER-REALISM & CINEMATIC EFFECTS**: เพิ่มรายละเอียดเกี่ยวกับผิวสัมผัสที่สมจริง (Subsurface scattering, realistic skin pores), แสงเงาที่ตกกระทบแบบ Ray-tracing (Dynamic lighting, Ray-traced reflections), เอฟเฟกต์บรรยากาศที่ลึกซึ้ง (Volumetric fog, Light bloom, Dust particles dancing in light, Lens flare, Depth of field/Bokeh)
       - บรรยากาศ สถานที่ และการปฏิสัมพันธ์ต้องดูเป็นธรรมชาติและมีความสมจริงสูง (Photorealistic, 8k resolution, Masterpiece)
       - สไตล์ภาพ: ${params.style}
       - ต้องจบด้วย --ar 9:16
       - หากมีรูปอ้างอิง ให้ระบุว่า "looks exactly like the provided reference image" สำหรับคนนั้นๆ
       - บรรยายการจัดแสง (Lighting) เช่น Cinematic lighting, Volumetric lighting, Rim light เพื่อให้ตัวละครดูโดดเด่น

    2. **video_prompt**: 
       - บรรยายการเคลื่อนไหวของกล้องและตัวละครอย่างละเอียด (เช่น เดินเข้ามาเซลฟี่, หันมามองกล้องพร้อมรอยยิ้ม, กล้องแพนรอบๆ แบบ Cinematic)
       - **WALK TO SELFIE ACTION**: หากอยู่ในโหมด Vlog Journey ให้บรรยายการ "เดินไปหา" และ "โพสท่าถ่ายรูป" ร่วมกันอย่างเป็นธรรมชาติ
       - **CHARACTER CONSISTENCY**: การเคลื่อนไหวและปฏิกิริยาของ Subject 2 ต้องสมจริงตามบุคลิก (In-character) ห้ามทำท่าทางที่ขัดกับสไตล์ดั้งเดิมของตัวละครนั้นๆ โดยเด็ดขาด
       - **DYNAMIC MOVEMENT**: หากเป็นฉากต่อเนื่อง ให้บรรยายการเดิน (Walking), การเคลื่อนที่ (Moving), หรือการเปลี่ยนมุมกล้องที่ดูเหมือนเรากำลังถ่าย Vlog จริงๆ (Handheld camera shake, realistic focus hunting)
       ${params.enableVoiceover ? `- ต้องรวมบทพูดภาษาไทยสั้นๆ (Thai Voiceover) ที่เข้ากับสถานการณ์และบุคลิกของตัวละคร
       - เพศของเสียงพากย์: ${params.voiceGender}
       - โทนเสียงพากย์: ${params.voiceTone}
       - รูปแบบ: "[Visual Description & Movement]. Thai voiceover says: \\"[Thai Script]\\""` : `- ไม่ต้องมีบทพูด (No voiceover)`}

    **🔥 VIRAL CROSSOVER SECRETS (MASTER PROMPT RULES - MUST APPLY TO video_prompt):**
    1. **HOOK (First 3 Seconds)**: The video must start with a strong visual or verbal hook.
    2. **STRUCTURE (Visual Hooks)**: Use dynamic camera movements (Zoom In, Side View, Fast Pan) to keep it engaging.
    3. **PERSONALIZATION**: Make the interaction specific to the characters involved.
    4. **MAGIC KEYWORDS TO EMBODY**: "Pattern Interrupt", "Emotional Trigger", "Cinematic Atmosphere", "Realistic Interaction".
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

export const generateFigureImage = async (imageBase64?: string, name?: string, style: 'Figure' | 'Trompe' | 'Animal' = 'Figure'): Promise<FigureData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3.1-flash-image-preview';

  let basePrompt = '';
  
  if (style === 'Figure') {
    const subject = name || "a legendary cyber-samurai with glowing neon armor";
    basePrompt = `Create a 1/7 scale commercialized figure of ${subject} ${imageBase64 ? 'based on the illustration' : ''}, in a hyper-detailed, photorealistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the iMac screen, display the Blender modeling process of the figure with a crystal-clear interface. Next to the computer screen, place a TAKARA-TOMY-style toy packaging box printed with the original artwork, ensuring sharp and vibrant details. Render the scene in ultra-high resolution 4K with realistic lighting, soft ambient shadows, and subtle reflections. Ensure hyper-detailed textures on the figure, packaging, and environment, with clean, crisp visuals free of noise and artifacts. Capture the scene in a close-up medium shot to emphasize the figure’s intricate details and the clarity of the iMac screen and packaging.`;
  } else if (style === 'Trompe') {
    const subject = name || "a majestic mythical dragon with iridescent scales";
    basePrompt = `A stunning Trompe L'oeil 3D composition, where ${imageBase64 ? `the subject in the uploaded image` : subject} appears to physically tear through a clean white drawing paper and emerge from a graphite sketch into the real world. The subject's upper body is fully rendered in hyper-realistic color and texture, while the lower body remains a 2D pencil sketch on paper. Shot from an aerial (top-down) perspective using a 24mm lens to capture the entire drawing desk environment, including oversized pencils and erasers scattered around. The lighting is a blend of flat studio light for the paper area and dramatic side lighting with volumetric effects for the emerging 3D figure, casting realistic shadows that fall back onto the sketch. Hyper-detailed, 8k resolution, cinematic lighting.`;
  } else {
    const subject = name || "a majestic white tiger with glowing blue eyes";
    basePrompt = `Professional animal photography of ${imageBase64 ? `the animal in the uploaded image` : subject}, featuring glowing eyes and surrounded by swirling smoke and cinematic light effects. This is a full-body shot photography from a front view, captured as a macro lens portrait with a high-resolution digital camera. The image must showcase hyper-realistic texture of the animal's fur, skin, or scales. Apply professional color grading, dramatic atmosphere, ultra-high resolution 4K, and realistic lighting.`;
  }

  return callWithRetry(async () => {
    const contents: any[] = [];
    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: 'image/png',
        },
      });
    }
    contents.push({ text: basePrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
        tools: [
          {
            googleSearch: {
              searchTypes: {
                webSearch: {},
                imageSearch: {},
              }
            },
          },
        ],
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          url: `data:image/png;base64,${part.inlineData.data}`,
          prompt: basePrompt
        };
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
    ตัวอย่าง (ถ้าสไตล์มีคำว่า Realistic): (Realistic handsome young man, cool black hair, round glasses, small goatee on chin, confident smile, photorealistic style)
    ตัวอย่าง (ถ้าสไตล์มีคำว่า 3D): (Mascot handsome young man, cool black hair, round glasses, small goatee on chin, confident smile, Pixar 3D style)

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
    - ถ้าสไตล์มีคำว่า Realistic ห้ามใช้คำว่า "Mascot" หรือ "Cartoon" หรือ "Animation" ใน Prompt เด็ดขาด ให้ใช้คำแนว "Photorealistic", "Hyper-realistic", "Real person" แทน
    - ถ้าสไตล์มีคำว่า 3D Animation ให้ใช้คำแนว "Pixar style", "Disney style", "3D Render"
    
    ตัวอย่าง (ถ้าสไตล์มีคำว่า Realistic): (Realistic handsome young man, cool black hair, round glasses, small goatee on chin) wearing a tuxedo, standing and presenting work in a modern office, photorealistic, 8k, highly detailed.
    ตัวอย่าง (ถ้าสไตล์มีคำว่า 3D): (Mascot handsome young man, cool black hair, round glasses, small goatee on chin) wearing a tuxedo, standing and presenting work in a modern office, Pixar 3D style, high resolution.

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
       - **video_prompt** ต้องเป็น "Master Prompt" ที่รวมทุกอย่างเข้าด้วยกัน: [Consistent Visual Description] + [Detailed Action/Movement] + [Camera Angle] + [Atmosphere] + [Specific Points of Interest] + [Thai Voiceover Script]
       - **บทพูด (Thai Script) ต้องสั้นและกระชับมาก (Very Concise):** สำหรับคลิป 8 วินาที (ไม่ควรเกิน 10-15 คำ หรือ 1-2 ประโยคสั้นๆ) เพื่อให้พูดจบในเวลา
       - รูปแบบของ video_prompt:
         "[Visual Description of Character & Environment]. [Detailed Action & Camera Movement]. Atmosphere: [Vibe]. Featuring: [Specific Points of Interest]. Thai voiceover says: \"[Thai Script]\""
    
    7. **การระบุจุดเด่นของสถานที่ (Points of Interest):**
       - หากมีการระบุตัวละครหรือสถานที่ที่ชัดเจน ให้คุณจินตนาการและระบุ "จุดเด่นที่ต้องเห็นในกล้อง" ของสถานที่นั้นๆ ลงไปใน Prompt ด้วย เพื่อให้ภาพและวิดีโอมีรายละเอียดที่สมจริงและตรงตามคอนเซปต์
       - **ตัวอย่างเช่น:** บรรยายบรรยากาศบ้านร้างสไตล์จูออน (Ju-On Atmosphere)
         - รายละเอียดสถานที่: บ้านพักอาศัย 2 ชั้นสไตล์ญี่ปุ่นดั้งเดิมที่ถูกทิ้งร้าง บรรยากาศปกคลุมด้วยความเสื่อมโทรมขั้นสุด พื้นผิวทุกอย่างเต็มไปด้วยฝุ่นหนาและคราบน้ำแห้งกรัง วอลเปเปอร์เก่าขาดรุ่งริ่งเผยให้เห็นผนังปูนด้านล่างที่ขึ้นราดำเป็นหย่อมๆ แสงสว่างส่องเข้าไม่ถึง ทำให้ในบ้านดูมืดสลัวแม้จะเป็นเวลากลางวัน
         - จุดเด่นที่ต้องเห็นในกล้อง:
           - บันไดไม้สยองขวัญ: บันไดไม้แคบๆ ที่เก่าและฝุ่นจับหนา ทอดตัวขึ้นไปยังชั้น 2 ที่มืดมิดสนิทจนมองไม่เห็นปลายทาง
           - ปากทางห้องใต้หลังคา: ช่องสี่เหลี่ยมบนเพดานที่เปิดอ้าทิ้งไว้ มีเศษผ้าม่านเก่าขาดห้อยลงมา ดูอับชื้นและน่าขนลุกเหมือนมีบางอย่างซ่อนอยู่ข้างบนนั้น
           - โถงทางเดินบีบคั้น: ทางเดินที่แคบและอึดอัด มีข้าวของเครื่องใช้เก่าๆ ถูกทิ้งขว้างกระจัดกระจาย สร้างเงาตะคุ่มตามมุมมืด
           - ประตูโชจิฉีกขาด: ประตูเลื่อนกระดาษที่ขาดวิ่น เห็นเพียงโครงไม้หักๆ เพิ่มความรู้สึกของสถานที่ที่เคยเกิดโศกนาฏกรรม
         - อารมณ์และโทน (Mood & Tone): เน้นความรู้สึกถูกกดทับ (Oppressive), ความเงียบที่ชวนให้ประสาทเสีย, กลิ่นอับชื้นของราไม้ และความรู้สึกเหมือนถูก "บางอย่าง" จับจ้องจากมุมมืดตลอดเวลา
       - ให้นำจุดเด่นและบรรยากาศเหล่านี้ไปแปลเป็นภาษาอังกฤษและใส่ใน \`image_prompt\` และ \`video_prompt\` อย่างแนบเนียน

    8. แต่ละฉากต้องมี:
       - location: ชื่อสถานที่
       - vibe: มู้ดของฉาก
       - image_prompt: Prompt ภาษาอังกฤษสำหรับเจนภาพนิ่ง (Master Frame) โดยต้องรวม [Master DNA], [Camera Angle/Action] และ [Specific Points of Interest] เข้าด้วยกัน สไตล์ ${params.style} จบด้วย --ar 9:16
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

export const generateQuickMovie = async (concept: string, style: VisualStyle = VisualStyle.Cinematic): Promise<CinematicData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Movie Director ผู้เชี่ยวชาญการสร้างคลิปสั้น Viral (8-16 วินาที) ที่เน้นความง่ายแต่ทรงพลัง
    Task: สร้าง "Quick Movie Script" สำหรับวิดีโอ 2 ฉาก (ฉากละ 8 วินาที รวม 16 วินาที)
    
    คอนเซปต์: "${concept}"
    สไตล์: ${style}

    **🔥 VIRAL MOVIE SECRETS (MUST APPLY):**
    1. **HOOK (Scene 1 - First 3 Seconds)**: ต้องมี Hook ที่แรงทันที ไม่ว่าจะเป็นภาพที่น่าตกใจ หรือประโยคเปิดที่ทำให้คนหยุดดู
    2. **VISUAL CONTINUITY**: บรรยายรายละเอียดของตัวละครหลักหรือวัตถุหลัก (Main Subject) และสภาพแวดล้อม (Environment) อย่างละเอียด เพื่อให้ AI เจนภาพได้เหมือนกันทุกฉาก
    3. **THE LOOP**: ฉากจบของฉากที่ 2 ต้องสามารถวนกลับมาเริ่มฉากที่ 1 ได้อย่างแนบเนียน (Seamless Loop)
    4. **EMOTIONAL PAYOFF**: ฉากที่ 2 ต้องมีจุดพีคหรือบทสรุปที่ทิ้งอารมณ์ให้คนดู

    **กฎการสร้าง (STRICT RULES):**
    1. **Title**: ชื่อเรื่องภาษาไทยสั้นๆ เท่ๆ
    2. **Overall Description**: บรรยายภาพรวมสั้นๆ (ภาษาอังกฤษ)
    3. **Visual Consistency**: บรรยายรายละเอียดของตัวละครหลักและสภาพแวดล้อมอย่างละเอียด (ภาษาอังกฤษ)
    4. **Scenes**: ต้องมี 2 ฉาก (Scene 1: 0.0-8.0s, Scene 2: 8.0-16.0s)
       - **description**: บรรยายเหตุการณ์สั้นๆ (ภาษาอังกฤษ)
       - **voiceover**: บทพูดหรือเสียงบรรยายสั้นๆ (ภาษาไทย)
       - **image_prompt**: พ้อมสำหรับเจนภาพ Master Frame (ภาษาอังกฤษ) ต้องจบด้วย --ar 9:16 และต้องรวมรายละเอียดจาก Visual Consistency เข้าไปด้วย
       - **video_prompt**: พ้อมสำหรับเจนวิดีโอ (ภาษาอังกฤษ) โดยใช้รูปแบบ Master Prompt:
         "[Visual Description & Movement]. Thai voiceover says: \"[Thai Script]\""
         (หากไม่มีบทพูด ให้ตัดส่วน Thai voiceover says ออก)
    5. **Negative Prompt**: สิ่งที่ไม่ต้องการสั้นๆ

    Output ต้องเป็น JSON เท่านั้น:
    {
      "title": "...",
      "overall_description": "...",
      "visual_consistency": "...",
      "scenes": [
        {
          "scene_number": 1,
          "time_range": "0.0-8.0 seconds",
          "description": "...",
          "voiceover": "...",
          "image_prompt": "...",
          "video_prompt": "..."
        },
        {
          "scene_number": 2,
          "time_range": "8.0-16.0 seconds",
          "description": "...",
          "voiceover": "...",
          "image_prompt": "...",
          "video_prompt": "..."
        }
      ],
      "negative_prompt": "..."
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
            title: { type: Type.STRING },
            overall_description: { type: Type.STRING },
            visual_consistency: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scene_number: { type: Type.INTEGER },
                  time_range: { type: Type.STRING },
                  description: { type: Type.STRING },
                  voiceover: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  video_prompt: { type: Type.STRING }
                },
                required: ["scene_number", "time_range", "description", "voiceover", "image_prompt", "video_prompt"]
              }
            },
            negative_prompt: { type: Type.STRING }
          },
          required: ["title", "overall_description", "visual_consistency", "scenes", "negative_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CinematicData;
    }
    throw new Error("No response text generated");
  });
};

export const generateCinematicPrompt = async (params: CinematicParams): Promise<CinematicData> => {
  const apiKey = getEffectiveApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    คุณคือ AI Prompt Engineer ผู้เชี่ยวชาญการสร้างบทภาพยนตร์และโฆษณาระดับโลก (World-class Cinematic Director)
    Task: สร้าง "Master Prompt" สำหรับวิดีโอ (Video AI) โดยใช้โครงสร้างที่กำหนดให้
    
    คอนเซปต์: "${params.concept}"
    สไตล์: ${params.style}
    รวมเวลา: ${params.duration} วินาที (แบ่งเป็น ${params.sceneCount} ฉาก ฉากละ ${params.duration / params.sceneCount} วินาที)

    **🔥 VIRAL MOVIE SECRETS (MUST APPLY):**
    1. **HOOK (Scene 1)**: ต้องมี Hook ที่ดึงดูดสายตาทันที (Visual Hook)
    2. **VISUAL CONSISTENCY**: บรรยายลักษณะของตัวละคร/วัตถุหลักให้คงที่ตลอดทุกฉาก
    3. **DYNAMIC MOTION**: บรรยายการเคลื่อนไหวของกล้อง (Camera Movement) ให้ดูเป็นมืออาชีพ
    4. **THE LOOP**: ฉากสุดท้ายต้องสามารถวนกลับมาเริ่มฉากแรกได้

    **โครงสร้างที่ต้องทำตาม (MUST FOLLOW STRUCTURE):**
    1. **Title**: ชื่อเรื่องภาษาไทยที่น่าสนใจ
    2. **Overall Description**: ประโยคเปิดที่บรรยายภาพรวม (เหมือนตัวอย่าง: "One person appears on screen, @, [TIME] seconds, top-tier [THEME] quality, cinematic shots...")
    3. **Visual Consistency**: บรรยายรายละเอียดของตัวละครหลักและสภาพแวดล้อมอย่างละเอียด (ภาษาอังกฤษ)
    4. **Scenes**: แบ่งเป็น ${params.sceneCount} ฉาก โดยแต่ละฉากต้องระบุ:
       - **time_range**: ช่วงเวลา (เช่น 0.0-8.0 seconds)
       - **description**: บรรยายเหตุการณ์ในฉากนั้นแบบละเอียด (ภาษาอังกฤษ)
       - **voiceover**: บทพูดหรือเสียงบรรยายสั้นๆ (ภาษาไทย)
       - **image_prompt**: พ้อมสำหรับเจนภาพนิ่ง (Master Frame) ของฉากนั้น (ภาษาอังกฤษ) ต้องจบด้วย --ar 9:16 และต้องรวมรายละเอียดจาก Visual Consistency เข้าไปด้วย
       - **video_prompt**: พ้อมสำหรับเจนวิดีโอของฉากนั้น (ภาษาอังกฤษ) โดยใช้รูปแบบ Master Prompt:
         "[Visual Description & Movement]. Thai voiceover says: \"[Thai Script]\""
         (หากไม่มีบทพูด ให้ตัดส่วน Thai voiceover says ออก)
    5. **Negative Prompt**: รายการสิ่งที่ไม่ต้องการ (Negative aspects)

    Output ต้องเป็น JSON เท่านั้น:
    {
      "title": "...",
      "overall_description": "...",
      "visual_consistency": "...",
      "scenes": [
        {
          "scene_number": 1,
          "time_range": "...",
          "description": "...",
          "voiceover": "...",
          "image_prompt": "...",
          "video_prompt": "..."
        },
        ...
      ],
      "negative_prompt": "..."
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
            title: { type: Type.STRING },
            overall_description: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scene_number: { type: Type.INTEGER },
                  time_range: { type: Type.STRING },
                  description: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  video_prompt: { type: Type.STRING }
                },
                required: ["scene_number", "time_range", "description", "image_prompt", "video_prompt"]
              }
            },
            negative_prompt: { type: Type.STRING }
          },
          required: ["title", "overall_description", "scenes", "negative_prompt"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CinematicData;
    }
    throw new Error("No response text generated");
  });
};
