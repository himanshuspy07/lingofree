/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X, Heart, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Trophy, Brain, Loader2 } from 'lucide-react';
import { BaseExercise, Lesson, UserStats } from '../types';
import { sound } from '../sound';
import { speakText } from '../utils';
import { RAW_UNITS } from '../data';

interface LessonOverlayProps {
  lesson: Lesson;
  userStats: UserStats;
  isReviewMode?: boolean; // If playing mistakes queue or custom practices
  onClose: () => void;
  onFinishLesson: (xpEarned: number, incorrectAnswers: BaseExercise[]) => void;
}

// Dynamically generate a fresh set of randomized exercises based on the current unit & lesson indices (making around 10 exercises matching unit context)
function generateDynamicExercises(lessonId: string, baseExercises: BaseExercise[]): BaseExercise[] {
  // If it's custom practice, custom mistakes redemption, or any special custom exercises, respect its custom set
  if (lessonId === 'weak_skills_practice' || lessonId === 'mistakes_redemption') {
    return [...baseExercises];
  }

  const match = lessonId.match(/^u(\d+)_p(\d+)$/);
  if (!match) {
    return [...baseExercises];
  }

  const unitNum = parseInt(match[1], 10);
  const partIdx = parseInt(match[2], 10);

  const raw = RAW_UNITS.find(u => u.id === unitNum);
  if (!raw) {
    return [...baseExercises];
  }

  const exercises: BaseExercise[] = [];
  const rawWords = [...raw.words];

  // Create a randomized but stable offset based on unit & part index
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

  // Generate exactly 12 exercises matching 3 options MCQ constraints perfectly
  for (let i = 1; i <= 12; i++) {
    const exTypeModulo = i % 5;
    
    // Choose distinct word, adjective, filler and template based on offsets and item index i
    const wordIndex = (baseOffset + i) % rawWords.length;
    const randomWord = rawWords[wordIndex];
    
    const adjIndex = (baseOffset + i * 3) % adjectives.length;
    const randomAdj = adjectives[adjIndex];
    
    const filIndex = (baseOffset + i * 7) % fillers.length;
    const randomFil = fillers[filIndex];
    
    const templateIndex = (baseOffset + i * 11) % templates.length;
    const currentSentence = templates[templateIndex](randomWord, randomAdj, randomFil);

    if (exTypeModulo === 0) {
      // 1. Meaning selection (exact 3 options MCQ)
      const otherWords = rawWords.filter(w => w !== randomWord);
      const option1 = `The primary term representing "${randomWord}" in the context of ${raw.title}.`;
      
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
      // 2. Fill in the blank (exact 3 options MCQ)
      const replacedSentence = currentSentence.replace(new RegExp(`\\b${randomWord}\\b`, 'gi'), '_______');
      
      const fillerOptions = ['something', 'always', 'never', 'today', 'people', 'world'].filter(w => w.toLowerCase() !== randomWord.toLowerCase());
      const otherVocabFillers = rawWords.filter(w => w.toLowerCase() !== randomWord.toLowerCase());
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
      // 4. Listening comprehension (exact 3 options MCQ)
      const otherSentences = templates.map((t, idx) => {
        const w = rawWords[(wordIndex + idx + 1) % rawWords.length];
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

// Normalize strings for reliable comparisons (ignores casing, periods, commas, extra spacing)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function LessonOverlay({
  lesson,
  userStats,
  isReviewMode = false,
  onClose,
  onFinishLesson
}: LessonOverlayProps) {
  const [exercises, setExercises] = useState<BaseExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  
  // AI Question Generation States
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selection/Interaction States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambleBank, setScrambleBank] = useState<string[]>([]); // Pooled scramble words
  const [scrambleAnswer, setScrambleAnswer] = useState<{ text: string; bankIdx: number }[]>([]); // Chosen scramble words with their unique bank indices
  const [dictationValue, setDictationValue] = useState('');

  // Assessment States
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswersList, setWrongAnswersList] = useState<BaseExercise[]>([]);

  // Completion/End State
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showRuleIntro, setShowRuleIntro] = useState(lesson.rule ? true : false);

  // Initialize and generate dynamic randomized lesson exercises
  const initializeExercises = async () => {
    setIsLessonFinished(false);
    setWrongAnswersList([]);
    setShowRuleIntro(lesson.rule ? true : false);
    setCurrentIndex(0);
    setHearts(3); // In one lesson user gets only 3 hearts

    const cacheKey = `lingoclimb_cache_${lesson.id}`;
    const cachedData = localStorage.getItem(cacheKey);

    // If cache already exists for this lesson, load it instantly so replays are consistent!
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExercises(parsed);
          setIsLoadingAI(false);
          setAiError(null);
          // Speak initial prompts if applicable
          if (!lesson.rule && parsed[0] && (parsed[0].type === 'listening-comprehension' || parsed[0].type === 'dictation')) {
            setTimeout(() => {
              speakText(parsed[0].audioText || parsed[0].correctAnswer, userStats.settings.textToSpeechEnabled);
            }, 600);
          }
          return;
        }
      } catch (err) {
        console.warn("Corrupted exercise cache found, purging cache key:", cacheKey, err);
        localStorage.removeItem(cacheKey);
      }
    }

    // Try fetching dynamically from Gemini AI server-side!
    setIsLoadingAI(true);
    setAiError(null);

    const match = lesson.id.match(/^u(\d+)_p(\d+)$/);
    let unitNum = 1;
    let partIdx = 1;
    if (match) {
      unitNum = parseInt(match[1], 10);
      partIdx = parseInt(match[2], 10);
    }
    const raw = RAW_UNITS.find(u => u.id === unitNum);

    const isPractice = lesson.id === 'weak_skills_practice' || lesson.id === 'mistakes_redemption';
    let cleanMistakes = [];
    if (isPractice) {
      // Map user's mistake queue to pass cleanly to Gemini
      cleanMistakes = userStats.mistakesQueue.slice(0, 10).map(m => ({
        type: m.type,
        prompt: m.prompt,
        correctAnswer: m.correctAnswer
      }));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds abort

      const payload = {
        unitId: isPractice ? lesson.id : `unit_${unitNum}`,
        unitTitle: isPractice ? (lesson.id === 'mistakes_redemption' ? 'Mistakes Redemption Drill' : 'Weak Skills Practice') : (raw ? raw.title : 'General Study'),
        unitDifficulty: raw ? raw.difficulty : 'B1',
        unitConcept: lesson.rule?.concept || '',
        unitWords: raw ? raw.words : [],
        unitSentences: raw ? raw.sentences : [],
        partIdx,
        partTitle: lesson.title,
        partDesc: lesson.description,
        seed: Math.random().toString(36).substring(2, 9) + Date.now().toString(),
        mistakesQueue: cleanMistakes,
        isPractice
      };

      const resp = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.exercises) && data.exercises.length > 0) {
          const formatted = data.exercises.map((ex: any) => {
            const exId = ex.id || `${lesson.id}_ai_${Math.random().toString(36).substring(2, 7)}`;
            return {
              ...ex,
              id: exId,
            } as BaseExercise;
          });

          // Save to local cache so on replay we receive exact questions!
          localStorage.setItem(cacheKey, JSON.stringify(formatted));

          setExercises(formatted);
          setIsLoadingAI(false);

          // Speak initial prompts if applicable (ONLY if we are not showing the rule introduction first!)
          if (!lesson.rule && formatted[0] && (formatted[0].type === 'listening-comprehension' || formatted[0].type === 'dictation')) {
            setTimeout(() => {
              speakText(formatted[0].audioText || formatted[0].correctAnswer, userStats.settings.textToSpeechEnabled);
            }, 600);
          }
          return;
        }
      }
      throw new Error("Could not parse or generate AI questions, resorting to offline builder");
    } catch (err: any) {
      console.warn("AI Generation failed/timed out, invoking high-performance client-side fallback generator", err);
      const fallbackPool = generateDynamicExercises(lesson.id, lesson.exercises);
      const shuffled = [...fallbackPool].sort(() => Math.random() - 0.5);

      // Save procedurally generated questions so replaying offline keeps them consistent too!
      localStorage.setItem(cacheKey, JSON.stringify(shuffled));

      setExercises(shuffled);
      setIsLoadingAI(false);

      if (!lesson.rule && shuffled[0] && (shuffled[0].type === 'listening-comprehension' || shuffled[0].type === 'dictation')) {
        setTimeout(() => {
          speakText(shuffled[0].audioText || shuffled[0].correctAnswer, userStats.settings.textToSpeechEnabled);
        }, 600);
      }
    }
  };

  useEffect(() => {
    initializeExercises();
  }, [lesson]);

  const handleRetryLesson = () => {
    sound.playClick();
    initializeExercises();
  };

  const currentExercise = exercises[currentIndex];

  // Helper when an exercise has changed
  useEffect(() => {
    if (!currentExercise) return;

    // Reset temporary states
    setSelectedOption(null);
    setDictationValue('');
    setIsAnswered(false);
    setIsCorrect(false);

    // If it's a sentence scramble, prepare the chips
    if (currentExercise.type === 'sentence-scramble') {
      const words = currentExercise.options || currentExercise.correctAnswer.split(' ');
      // Shuffle words inside options or sentence words
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      setScrambleBank(shuffledWords);
      setScrambleAnswer([]);
    }

    // Auto voice output on special exercises (ONLY if showRuleIntro is false)
    if (!showRuleIntro && (currentExercise.type === 'listening-comprehension' || currentExercise.type === 'dictation')) {
      speakText(currentExercise.audioText || currentExercise.correctAnswer, userStats.settings.textToSpeechEnabled);
    }
  }, [currentIndex, currentExercise, showRuleIntro]);

  const handleSpeakInput = () => {
    sound.playClick();
    if (!currentExercise) return;
    speakText(currentExercise.audioText || currentExercise.correctAnswer, userStats.settings.textToSpeechEnabled);
  };

  const handleStartPractice = () => {
    sound.playClick();
    setShowRuleIntro(false);
    if (exercises[0] && (exercises[0].type === 'listening-comprehension' || exercises[0].type === 'dictation')) {
      speakText(exercises[0].audioText || exercises[0].correctAnswer, userStats.settings.textToSpeechEnabled);
    }
  };

  // Add/Remove Word Chips for sentence scramble
  const addWordToAnswer = (word: string, index: number) => {
    sound.playClick();
    if (isAnswered) return;
    if (scrambleAnswer.some(item => item.bankIdx === index)) return;
    setScrambleAnswer([...scrambleAnswer, { text: word, bankIdx: index }]);
  };

  const removeWordFromAnswer = (word: string, index: number) => {
    sound.playClick();
    if (isAnswered) return;
    const nextAnswer = [...scrambleAnswer];
    nextAnswer.splice(index, 1);
    setScrambleAnswer(nextAnswer);
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let correct = false;
    const ans = currentExercise.correctAnswer;

    if (currentExercise.type === 'meaning-selection' || currentExercise.type === 'fill-in-the-blank' || currentExercise.type === 'listening-comprehension') {
      correct = selectedOption === ans;
    } else if (currentExercise.type === 'sentence-scramble') {
      const compiledSentence = scrambleAnswer.map(item => item.text).join(' ');
      correct = normalizeText(compiledSentence) === normalizeText(ans);
    } else if (currentExercise.type === 'dictation') {
      correct = normalizeText(dictationValue) === normalizeText(ans);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      sound.playCorrect();
    } else {
      sound.playIncorrect();
      setHearts(prev => Math.max(0, prev - 1));
      // Accumulate failed exercises for spaced repetition queue
      setWrongAnswersList(prev => [...prev, currentExercise]);
    }
  };

  const handleContinue = () => {
    sound.playClick();
    if (hearts <= 0) {
      setIsLessonFinished(true);
      return;
    }
    // Validate if exercises are done
    if (currentIndex >= exercises.length - 1) {
      triggerConclusion();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const triggerConclusion = () => {
    // Reward calculation based on correct answers and accuracy ratio
    const correctCount = exercises.length - wrongAnswersList.length;
    const accuracyRatio = exercises.length > 0 ? (correctCount / exercises.length) : 0;
    
    // Each correct question gives 3 XP.
    // Plus accuracy bonus: up to +15 XP for perfect performance.
    const baseXP = correctCount * 3;
    let accuracyBonus = 0;
    if (accuracyRatio === 1) {
      accuracyBonus = 15;
    } else if (accuracyRatio >= 0.8) {
      accuracyBonus = 10;
    } else if (accuracyRatio >= 0.5) {
      accuracyBonus = 5;
    } else if (accuracyRatio >= 0.2) {
      accuracyBonus = 2;
    }

    const calculatedXP = isReviewMode ? 10 : (baseXP + accuracyBonus);
    setEarnedXP(calculatedXP);
    setIsLessonFinished(true);
    sound.playLevelUp();
  };

  // Quit prompt handler
  const handleQuit = () => {
    sound.playClick();
    if (window.confirm('Are you sure you want to quit this active lesson? You will lose current progress.')) {
      onClose();
    }
  };

  // Master UI Progress
  const currentProgressPercent = exercises.length > 0
    ? Math.round((currentIndex / exercises.length) * 100)
    : 0;

  if (isLoadingAI || exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#F7F7F7] flex items-center justify-center z-50 px-4">
        <div className="text-center max-w-sm">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-[#4ECDC4]/10 rounded-full flex items-center justify-center text-[#4ECDC4]">
              <Brain className="w-10 h-10 text-[#4ECDC4] animate-pulse" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-0 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold font-heading text-[#2C3E50] mb-2 flex items-center gap-1.5 justify-center">
            AI Lesson Generator <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Gemini is dynamically building exactly <span className="font-extrabold text-[#4ECDC4]">10 fresh challenges</span> tailored to your unit, vocabulary, and difficulty level!
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 rounded-full px-4 py-1.5 inline-flex border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Custom curriculum scale: {lesson.difficulty}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col justify-between overflow-y-auto">
      {/* 2-Column Banner Frame */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-6 flex-grow flex flex-col justify-start">
        
        {/* Navigation Indicator Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            id="lesson-close-btn"
            onClick={handleQuit}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Core Progress Indicator */}
          <div className="flex-grow bg-gray-150 h-3 rounded-full overflow-hidden relative">
            <div
              className="bg-[#4ECDC4] h-full rounded-full transition-all duration-300"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>

          {/* Hearts Panel */}
          <div className="flex items-center gap-1.5 font-bold text-[#FF6B6B]">
            <Heart className="w-6 h-6 fill-[#FF6B6B]" />
            <span id="lesson-hearts-count" className="text-lg tabular-nums">{hearts}</span>
          </div>
        </div>

        {/* main interactive exercise container */}
        <AnimatePresence mode="wait">
          {showRuleIntro && lesson.rule ? (
            <motion.div
              key="rule-intro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-grow flex flex-col justify-start pb-8"
              id="lesson-rule-intro-container"
            >
              {/* Header Label */}
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#4ECDC4]/15 text-[#4ECDC4] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                  📚 Study Guide
                </span>
                <span className="text-gray-400 text-xs font-semibold">
                  Rule &amp; Instructions
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#2C3E50] mb-2 font-heading leading-tight">
                {lesson.title}
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Understand the linguistic rule below before solving the 10 challenge questions.
              </p>

              <div className="space-y-4 mb-8">
                {/* Rule Concept */}
                <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-[#4ECDC4]/20 transition-all">
                  <div className="absolute right-[-10px] top-[-10px] opacity-10">
                    <Sparkles className="w-24 h-24 text-[#4ECDC4]" />
                  </div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                    The Rule
                  </h3>
                  <p className="text-[#2C3E50] text-sm sm:text-base font-bold leading-relaxed">
                    {lesson.rule.concept}
                  </p>
                </div>

                {/* Practical Guidance / How to Do */}
                <div className="bg-amber-50/40 border-2 border-amber-100/40 rounded-3xl p-5 shadow-xs">
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">
                    How to complete this parts:
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-semibold">
                    {lesson.rule.howToDo}
                  </p>
                </div>

                {/* Example sentence */}
                <div className="bg-emerald-50/60 border-2 border-emerald-100/60 rounded-3xl p-5 shadow-xs">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">
                    Realistic Example
                  </h3>
                  <p className="text-emerald-950 text-sm sm:text-base font-black italic select-all">
                    {lesson.rule.example}
                  </p>
                </div>
              </div>

              {/* Start Practice Action */}
              <button
                id="lesson-start-practice-btn"
                onClick={handleStartPractice}
                className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-heading font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg text-lg uppercase tracking-wider mt-auto"
              >
                Let's Practice! <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : !isLessonFinished ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-grow flex flex-col justify-start"
            >
              {/* Challenge Type Header Label */}
              <p className="text-[#4ECDC4] font-extrabold text-xs uppercase tracking-widest mb-1.5">
                {currentExercise.type.replace('-', ' ').toUpperCase()}
              </p>
              
              <h1 className="text-xl sm:text-2xl font-bold text-[#2C3E50] mb-6 font-heading">
                {currentExercise.type === 'listening-comprehension' && 'Tap the audio button to listen and select what you hear:'}
                {currentExercise.type === 'dictation' && 'Listen with audio and type precisely what you hear:'}
                {currentExercise.type === 'meaning-selection' && `Describe the meaning: "${currentExercise.prompt}"`}
                {currentExercise.type === 'fill-in-the-blank' && 'Fill in the blank space appropriately:'}
                {currentExercise.type === 'sentence-scramble' && 'Arrange the phrases into correct English order:'}
              </h1>

              {/* Dynamic Sound Synthesizer Node */}
              {(currentExercise.type === 'listening-comprehension' || currentExercise.type === 'dictation') && (
                <div className="flex justify-center mb-8">
                  <motion.button
                    id="trigger-listen-audio-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSpeakInput}
                    className="w-24 h-24 rounded-full bg-[#4ECDC4]/10 border-2 border-[#4ECDC4] text-[#4ECDC4] flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#4ECDC4]/20"
                  >
                    <Volume2 className="w-10 h-10" />
                  </motion.button>
                </div>
              )}

              {/* In-Context Blanks Layout */}
              {currentExercise.type === 'fill-in-the-blank' && (
                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-6 mb-8 text-[#2C3E50] text-lg sm:text-xl font-medium text-center shadow-sm italic">
                  {currentExercise.prompt}
                </div>
              )}

              {/* Exercise Options Layout: Meaning-Selection / Fill-in-Blank / Listening */}
              {(currentExercise.type === 'meaning-selection' ||
                currentExercise.type === 'fill-in-the-blank' ||
                currentExercise.type === 'listening-comprehension') && (
                <div className="grid grid-cols-1 gap-3 mb-8">
                  {currentExercise.options?.map((option, oIdx) => (
                    <button
                      id={`option-card-${oIdx}`}
                      key={option}
                      onClick={() => {
                        if (isAnswered) return;
                        sound.playClick();
                        setSelectedOption(option);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center text-left ${
                        selectedOption === option
                          ? 'border-[#4ECDC4] bg-[#4ECDC4]/5 shadow-sm font-semibold'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg mr-4 border flex items-center justify-center text-xs font-black ${
                        selectedOption === option ? 'border-[#4ECDC4] bg-[#4ECDC4] text-white' : 'border-gray-300 text-gray-400'
                      }`}>
                        {oIdx + 1}
                      </div>
                      <span className="text-sm sm:text-base">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sentence Scramble Interface */}
              {currentExercise.type === 'sentence-scramble' && (
                <div className="mb-8 flex flex-col justify-start">
                  {/* Scramble Workspace Track */}
                  <div className="min-h-16 bg-[#F7F7F7] border-b-2 border-gray-250 p-4 mb-6 flex flex-wrap gap-2.5 items-center justify-center rounded-2xl">
                    {scrambleAnswer.length === 0 ? (
                      <span className="text-gray-400 text-sm italic py-2">Tap chips below to form sentence</span>
                    ) : (
                      scrambleAnswer.map((item, wIdx) => (
                        <button
                          key={`answer-${item.bankIdx}-${wIdx}`}
                          onClick={() => removeWordFromAnswer(item.text, wIdx)}
                          className="bg-white hover:bg-gray-50 border-2 border-gray-150 px-3 py-2 rounded-xl text-sm font-semibold shadow-sm cursor-pointer hover:border-gray-300 text-gray-800"
                        >
                          {item.text}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scramble Available Chips Pool */}
                  <div className="flex flex-wrap gap-2.5 justify-center py-4">
                    {scrambleBank.map((word, bIdx) => {
                      const isSelected = scrambleAnswer.some(item => item.bankIdx === bIdx);
                      return isSelected ? (
                        <div
                          key={`shadow-${word}-${bIdx}`}
                          className="bg-gray-100 dark:bg-gray-900/40 border-2 border-dashed border-gray-200 dark:border-gray-700/40 px-3 py-2.5 rounded-xl text-sm font-semibold select-none text-transparent pointer-events-none"
                        >
                          {word}
                        </div>
                      ) : (
                        <button
                          key={`active-${word}-${bIdx}`}
                          onClick={() => addWordToAnswer(word, bIdx)}
                          className="bg-white hover:bg-gray-50 border-2 border-gray-150 active:scale-95 px-3 py-2.5 rounded-xl text-sm font-semibold shadow-sm cursor-pointer text-gray-800 hover:border-gray-300"
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dictation Text Area Form */}
              {currentExercise.type === 'dictation' && (
                <div className="mb-8">
                  <textarea
                    id="dictation-input-area"
                    value={dictationValue}
                    onChange={(e) => {
                      if (isAnswered) return;
                      setDictationValue(e.target.value);
                    }}
                    placeholder="Type the English words spoken here..."
                    className="w-full h-32 p-4 border-2 rounded-2xl border-gray-200 focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800 font-sans"
                    disabled={isAnswered}
                  />
                </div>
              )}



            </motion.div>
          ) : hearts === 0 ? (
            /* Out of Hearts - Failure State */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-grow flex flex-col justify-center items-center py-8 text-center"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <Heart className="w-12 h-12 fill-red-500 text-red-500" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-extrabold font-heading text-red-500 mb-2">
                Out of Hearts!
              </h2>
              <p className="text-gray-500 max-w-sm mb-8 text-sm sm:text-base text-center leading-relaxed">
                You made too many mistakes in this lesson. Don't worry! Review the study guide rule and try again to master these concepts.
              </p>

              <div id="lesson-failed-stats" className="bg-red-50/50 border border-red-100 rounded-2xl p-4 w-full max-w-sm mb-8 text-center text-xs sm:text-sm text-red-800">
                <span className="font-bold">❌ Hearts Left: 0 / 3</span>
                <p className="text-gray-500 text-[11px] mt-1">Practicing from mistakes queue will help you consolidate your skills.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md px-4 justify-center">
                <button
                  id="lesson-retry-btn"
                  onClick={handleRetryLesson}
                  className="flex-1 bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-white font-heading font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg text-md uppercase tracking-wider"
                >
                  Retry Lesson <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  id="lesson-failed-quit-btn"
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-750 font-heading font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg text-md"
                >
                  Quit Lesson
                </button>
              </div>
            </motion.div>
          ) : (
            /* Celebration Victory Screen */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-grow flex flex-col justify-center items-center py-8 text-center"
            >
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mb-6 relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <Trophy className="w-12 h-12" />
                </motion.div>
                <div className="absolute top-[-5px] right-[-5px] bg-[#4ECDC4] text-white p-1 rounded-full scale-90 border-2 border-white">
                  <Sparkles className="w-4 h-4 fill-current" />
                </div>
              </div>

              <h2 className="text-3xl font-extrabold font-heading text-[#2C3E50] mb-2">
                Lesson Complete!
              </h2>
              <p className="text-gray-500 max-w-md mb-8 text-sm sm:text-base text-center leading-relaxed">
                Outstanding job! You are taking control of your future by mastering advanced English skills.
              </p>

              {/* Reward stats banner */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md mb-6">
                <div className="bg-[#4ECDC4]/10 p-3 sm:p-4 rounded-2xl border border-[#4ECDC4]/20 flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">XP Earned</span>
                  <span className="text-base sm:text-lg font-black text-[#2C3E50] mt-1">{earnedXP} XP</span>
                </div>

                <div className="bg-[#FF6B6B]/10 p-3 sm:p-4 rounded-2xl border border-[#FF6B6B]/20 flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Accuracy</span>
                  <span className="text-base sm:text-lg font-black text-[#2C3E50] mt-1">
                    {Math.round(((exercises.length - wrongAnswersList.length) / exercises.length) * 100)}%
                  </span>
                </div>

                <div className="bg-amber-100/40 p-3 sm:p-4 rounded-2xl border border-amber-200/50 flex flex-col items-center">
                  <span className="text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Coins Won</span>
                  <span className="text-base sm:text-lg font-black text-amber-600 mt-1 flex items-center gap-1">
                    🪙 {15 + (wrongAnswersList.length === 0 ? 10 : 0)}
                  </span>
                </div>
              </div>

              {/* Dynamic Scorecard Breakdown */}
              <div id="xp-breakdown-card" className="bg-gray-50 border border-gray-150 rounded-2xl p-4 w-full max-w-sm mb-8 text-left text-xs sm:text-sm text-[#2C3E50] space-y-2.5 shadow-xs">
                <p className="font-extrabold text-[10px] text-gray-400 uppercase tracking-widest mb-1">XP &amp; COIN REWARD SCORECARD</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Correct Exercises ({exercises.length - wrongAnswersList.length}/{exercises.length})</span>
                  <span className="font-bold text-[#2C3E50]">+{(exercises.length - wrongAnswersList.length) * 3} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">
                    Accuracy Multiplier ({Math.round(((exercises.length - wrongAnswersList.length) / exercises.length) * 100)}%)
                  </span>
                  <span className="font-bold text-[#4ECDC4]">+{earnedXP - ((exercises.length - wrongAnswersList.length) * 3)} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Base LingoCoin Reward</span>
                  <span className="font-bold text-amber-500">+15 🪙</span>
                </div>
                {wrongAnswersList.length === 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-semibold">✨ Perfect Lesson Bonus</span>
                    <span className="font-black">+10 🪙</span>
                  </div>
                )}
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center text-sm font-black">
                  <span>Grand Rewards:</span>
                  <span className="text-[#FF6B6B] font-black">{earnedXP} XP &amp; {15 + (wrongAnswersList.length === 0 ? 10 : 0)} 🪙</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                <button
                  id="lesson-completion-continue-btn"
                  onClick={() => onFinishLesson(earnedXP, wrongAnswersList)}
                  className="flex-1 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-heading font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg text-md"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="try-new-questions-btn"
                  onClick={async () => {
                    sound.playClick();
                    localStorage.removeItem(`lingoclimb_cache_${lesson.id}`);
                    await initializeExercises();
                  }}
                  className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-205 text-gray-750 font-heading font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-gray-300 text-md"
                >
                  <RefreshCw className="w-4 h-4 text-[#4ECDC4]" /> New Questions
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistent Static Assessment Bottom Sheet */}
      {!isLessonFinished && !showRuleIntro && (
        <div className={`w-full border-t py-6 px-4 md:px-8 mt-auto ${
          !isAnswered
            ? 'bg-white border-gray-150'
            : isCorrect
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            
            <div className="flex items-start gap-3">
              {isAnswered && (
                <div className="mt-0.5">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 fill-red-100" />
                  )}
                </div>
              )}
              
              <div>
                {!isAnswered ? (
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Ready to Submit?</h4>
                    <p className="text-xs text-gray-550 mt-0.5">Make your selection or assemble the puzzle of words.</p>
                  </div>
                ) : isCorrect ? (
                  <div>
                    <h4 className="text-sm font-black text-green-800">Incredible Solution!</h4>
                    <p className="text-xs text-green-700 mt-0.5">Your choice fits the linguistic pattern perfectly.</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-black text-red-800">Not quite correct...</h4>
                    <p className="text-xs text-red-700 mt-0.5 font-bold">
                      Correct Answer: "{currentExercise.correctAnswer}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Check/Submit Button Action */}
            <div>
              {!isAnswered ? (
                <button
                  id="submit-answer-assess-btn"
                  onClick={handleCheckAnswer}
                  disabled={
                    (currentExercise.type === 'meaning-selection' ||
                     currentExercise.type === 'fill-in-the-blank' ||
                     currentExercise.type === 'listening-comprehension')
                      ? !selectedOption
                      : currentExercise.type === 'sentence-scramble'
                      ? scrambleAnswer.length === 0
                      : !dictationValue.trim()
                  }
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold font-heading text-sm text-center shadow-sm cursor-pointer transition-all uppercase tracking-wider ${
                    ((currentExercise.type === 'meaning-selection' ||
                      currentExercise.type === 'fill-in-the-blank' ||
                      currentExercise.type === 'listening-comprehension')
                        ? !selectedOption
                        : currentExercise.type === 'sentence-scramble'
                        ? scrambleAnswer.length === 0
                        : !dictationValue.trim())
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90 hover:shadow-md'
                  }`}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  id="continue-next-exercise-btn"
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-900 border border-slate-750 text-white font-bold font-heading text-sm text-center rounded-2xl cursor-pointer transition-all uppercase tracking-wider"
                >
                  Continue
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
