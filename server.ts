import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Initialize Gemini SDK with User-Agent set for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side AI questions generator
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const {
        unitId,
        unitTitle,
        unitDifficulty,
        unitConcept,
        unitWords = [],
        unitSentences = [],
        partIdx,
        partTitle,
        partDesc,
        seed,
        mistakesQueue = [],
        isPractice = false,
      } = req.body;

      console.log(`[API] Web Request: Generating AI exercises for ${unitId} Part ${partIdx} (Difficulty: ${unitDifficulty}) | isPractice: ${isPractice} | seed ${seed}`);

      // Adjusting difficulty instructions based on the unitCEFR difficulty
      let difficultyInstruction = "";
      if (unitDifficulty === "A1" || unitDifficulty === "A2") {
        difficultyInstruction = "Keep vocabulary simple, sentences short (4-8 words), and grammar basic. Focus on foundational words.";
      } else if (unitDifficulty === "B1" || unitDifficulty === "B2") {
        difficultyInstruction = "Provide moderate grammatical complexity (10-15 word clauses, descriptive adverbs). Ask about idioms, phrasal verbs, or contextual usage.";
      } else {
        difficultyInstruction = "Provide highly advanced academic or career-level English. Sentences can be 15-25 words long, utilizing advanced tenses, professional concepts, and nuanced dictionary meanings.";
      }

      const systemInstruction = `You are an expert ESL (English as a Second Language) curriculum developer.
Your job is to generate exactly 12 unique, diverse, highly educational, and fun English learning exercises based on the requested level and criteria.
Each exercise must fit one of the following exact types:
- 'meaning-selection': Ask for the correct definition of a word. Prompt is e.g. "Select the correct English definition for '[word]'". Options has exactly 3 items (A, B, C), in which one must be the exact correct definition.
- 'fill-in-the-blank': Fill an omitted word in a sentence. The prompt must have a clear gap marker: '_______' (7 underscores). correctAnswer is the omitted word. Options has exactly 3 items (A, B, C).
- 'sentence-scramble': Reorder shuffled words. correctAnswer is a complete, well-formed sentence (e.g. "We need to plan our project today."). Options represents the tokenized words of that same sentence shuffled, e.g. ["our", "plan", "project", "today.", "We", "need", "to"]. Prompt is: "Arrange the words to form this statement:".
- 'listening-comprehension': Listening comprehension which relies on audio read. The prompt must be: "Listen closely and select what is dictated:". audioText is the target sentence. Options has exactly 3 choices. correctAnswer is the exact target sentence.
- 'dictation': Listen and type out what is heard. Prompt is: "Listen and type the sentence perfectly:". audioText is the target sentence. correctAnswer is the exact target sentence. No options should be provided (empty or omitted options array).

CRITICAL REQUIREMENTS:
1. Do NOT repeat or recycle the exact same questions or vocabulary words within this lesson or across any other lessons in the unit. Sometime previous lessons' questions are repeated. Fix this and ensure unique questions.
2. Mix exercise types randomly, but make sure at least 3 distinct exercise types are represented in this 12-question lesson.
3. Every multiple-choice question ('meaning-selection', 'fill-in-the-blank', 'listening-comprehension') must have EXACTLY 3 unique options, only one of which is correct.
4. Scale difficulty precisely based on the requested CEFR. Ensure all text, prompts, and options are strictly in English. No other language must be used.
5. Use random Seed value "${seed}" to ensure variations and zero overlap with prior trials.
6. Ensure the output is valid JSON matching the requested schema. Respond with RAW JSON of exactly 12 exercises, no markdown codeblock wraps.`;

      let promptText = "";
      if (isPractice) {
        promptText = `Generate a 12-question English PRACTICE lesson targeting the learner's weak areas and mistake history. The questions must use only English, with NO other language. The user's past mistakes, weak structures, or words of concern are: ${JSON.stringify(mistakesQueue)}. Design new, clean, non-repetitive exercises addressing these exact words, structures or tenses to help them master these concepts. Use random seed: "${seed}" to stay fresh.`;
      } else {
        promptText = `Generate a 12-question English lesson for a learner at "${unitTitle}" level, lesson "${partIdx}" of 5. The questions must use only English, with NO other language. Focus on grammar and vocabulary related to the concept: "${unitConcept}". Words to integrate: ${JSON.stringify(unitWords)}. Target phrases: ${JSON.stringify(unitSentences)}. Use random seed "${seed}" to ensure zero overlap with prior lessons. All 12 questions must be unique.`;
      }

      // Standard resilient generator with model fallback and retries (e.g. handling 503 unavailability)
      let response;
      let lastError;
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      
      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;
        while (attempts < maxAttempts) {
          try {
            console.log(`[API] Attempting generation with model ${modelName} (Attempt ${attempts + 1}/${maxAttempts})...`);
            response = await ai.models.generateContent({
              model: modelName,
              contents: promptText,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  description: "List of exactly 12 exercises for this part",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "A unique random string ID for this exercise" },
                      type: { 
                        type: Type.STRING, 
                        enum: ["meaning-selection", "fill-in-the-blank", "sentence-scramble", "listening-comprehension", "dictation"],
                        description: "Type of exercise"
                      },
                      prompt: { type: Type.STRING, description: "The descriptive instruction or sentence with blanks" },
                      audioText: { type: Type.STRING, description: "Required for dictation/listening types. This represents the target sentence read aloud. Optional for others." },
                      correctAnswer: { type: Type.STRING, description: "The correct option or completed exact string" },
                      options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "List of multiple options (exactly 3 options for MCQ) or tokenized word chips for scramble."
                      }
                    },
                    required: ["id", "type", "prompt", "correctAnswer"]
                  }
                }
              }
            });
            if (response) break;
          } catch (err: any) {
            lastError = err;
            attempts++;
            console.warn(`[API WARN] Model ${modelName} attempt ${attempts} failed:`, err.message || err);
            // Brief backoff before next attempt
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
        if (response) {
          console.log(`[API] Success: Exercises generated successfully using model: ${modelName}`);
          break;
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to generate content after trying multiple models and retries");
      }

      const text = response.text?.trim() || "[]";
      const parsedExercises = JSON.parse(text);

      res.json({ exercises: parsedExercises });
    } catch (error: any) {
      console.warn("[API QUOTA LIMIT / ERROR] Safely degrading to high-performance local procedural ESL generator:", error.message || error);
      
      const {
        unitId = "unit_1",
        unitTitle = "General Study",
        unitWords = [],
        partIdx = 1
      } = req.body;

      const unitNum = typeof unitId === "string" ? parseInt(unitId.replace("unit_", ""), 10) || 1 : 1;
      const lessonId = `u${unitNum}_p${partIdx}`;

      const fallbackExercises = generateServerFallbackExercises(lessonId, unitWords, partIdx, unitTitle);
      res.json({ exercises: fallbackExercises, offlineFallback: true });
    }
  });

  function generateServerFallbackExercises(
    lessonId: string,
    rawWords: string[],
    partIdx: number,
    unitTitle: string
  ) {
    const exercises: any[] = [];
    const words = rawWords && rawWords.length > 0 ? rawWords : ["learning", "english", "study", "practice", "fluent", "vocabulary", "grammar", "comprehension", "phrase", "accent"];
    
    let unitNum = 1;
    const match = lessonId.match(/u(\d+)/);
    if (match) {
      unitNum = parseInt(match[1], 10);
    }
    const baseOffset = (unitNum * 17) + (partIdx * 23);

    const adjectives = ["beautiful", "amazing", "wonderful", "special", "happy", "little", "grand", "simple", "modern", "vivid", "silent", "perfect", "clear", "fresh"];
    const fillers = ["today", "tomorrow", "tonight", "every day", "right now", "with friends", "carefully", "always", "sometimes", "perfectly"];

    const templates = [
      (w: string, adj: string, fil: string) => `I want an elegant ${w} ${fil}.`,
      (w: string, adj: string, fil: string) => `The ${adj} ${w} is sleeping ${fil}.`,
      (w: string, adj: string, fil: string) => `We saw a very ${adj} ${w} ${fil}.`,
      (w: string, adj: string, fil: string) => `He loves to keep a ${adj} ${w} nearby.`,
      (w: string, adj: string, fil: string) => `Can you see that ${adj} ${w} over there?`,
      (w: string, adj: string, fil: string) => `Please bring me a fresh ${w} ${fil}.`,
      (w: string, adj: string, fil: string) => `The master explained the concept of ${w} ${fil}.`,
      (w: string, adj: string, fil: string) => `It is important to observe the ${w} with care.`,
      (w: string, adj: string, fil: string) => `We completed this study about ${w} perfectly.`,
      (w: string, adj: string, fil: string) => `They will discuss the details of ${w} ${fil}.`
    ];

    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    // Generate exactly 12 exercises for fallback
    for (let i = 1; i <= 12; i++) {
      const exTypeModulo = i % 5;
      
      const wordIndex = (baseOffset + i) % words.length;
      const randomWord = words[wordIndex];
      
      const adjIndex = (baseOffset + i * 3) % adjectives.length;
      const randomAdj = adjectives[adjIndex];
      
      const filIndex = (baseOffset + i * 7) % fillers.length;
      const randomFil = fillers[filIndex];
      
      const templateIndex = (baseOffset + i * 11) % templates.length;
      const currentSentence = templates[templateIndex](randomWord, randomAdj, randomFil);

      if (exTypeModulo === 0) {
        // 1. Meaning selection
        const otherWords = words.filter(w => w !== randomWord);
        const option1 = `The primary term representing "${randomWord}" in the context of ${unitTitle}.`;
        
        const distWord1 = otherWords[0] || "alternative";
        const distWord2 = otherWords[1] || "concept";

        const option2 = `Our vocabulary key definition representing "${distWord1}".`;
        const option3 = `The distinct study phrase relating to "${distWord2}".`;

        exercises.push({
          id: `${lessonId}_fallback_${i}_ms`,
          type: 'meaning-selection',
          prompt: `Select the correct English definition for "${randomWord}"`,
          correctAnswer: option1,
          options: shuffle([option1, option2, option3])
        });
      } else if (exTypeModulo === 1) {
        // 2. Fill in the blank
        const replacedSentence = currentSentence.replace(new RegExp(`\\b${randomWord}\\b`, 'gi'), '_______');
        
        const fillerOptions = ['something', 'always', 'never', 'today', 'people', 'world'].filter(w => w.toLowerCase() !== randomWord.toLowerCase());
        const otherVocabFillers = words.filter(w => w.toLowerCase() !== randomWord.toLowerCase());
        const fillOption1 = otherVocabFillers[0] || fillerOptions[0];
        const fillOption2 = otherVocabFillers[1] || fillerOptions[1];

        exercises.push({
          id: `${lessonId}_fallback_${i}_fitb`,
          type: 'fill-in-the-blank',
          prompt: `Select the missing word to complete this unit pattern: "${replacedSentence}"`,
          correctAnswer: randomWord,
          options: shuffle([randomWord, fillOption1, fillOption2])
        });
      } else if (exTypeModulo === 2) {
        // 3. Sentence scramble
        const scrambleWords = currentSentence.split(' ');

        exercises.push({
          id: `${lessonId}_fallback_${i}_scramble`,
          type: 'sentence-scramble',
          prompt: `Arrange the words to form this clean statement:`,
          correctAnswer: currentSentence,
          options: shuffle(scrambleWords)
        });
      } else if (exTypeModulo === 3) {
        // 4. Listening comprehension
        const otherSentences = templates.map((t, idx) => {
          const w = words[(wordIndex + idx + 1) % words.length];
          return t(w, adjectives[(adjIndex + idx) % adjectives.length], fillers[(filIndex + idx) % fillers.length]);
        });
        const dist1 = otherSentences[0] || `An alternative spoken grammatical statement.`;
        const dist2 = otherSentences[1] || `Please stand outside and check the weather pattern.`;

        exercises.push({
          id: `${lessonId}_fallback_${i}_listening`,
          type: 'listening-comprehension',
          prompt: `Listen closely and select what sound is dictated:`,
          audioText: currentSentence,
          correctAnswer: currentSentence,
          options: shuffle([currentSentence, dist1, dist2])
        });
      } else {
        // 5. Dictation
        exercises.push({
          id: `${lessonId}_fallback_${i}_dict`,
          type: 'dictation',
          prompt: `Listen and type the sentence perfectly:`,
          audioText: currentSentence,
          correctAnswer: currentSentence
        });
      }
    }
    return exercises;
  }

  // Vite/Build Middleware configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 and interface 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Duolingo Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
