/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X, Heart, Sparkles, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { BaseExercise, Lesson, UserStats } from '../types';
import { sound } from '../sound';
import { speakText } from '../utils';

interface LessonOverlayProps {
  lesson: Lesson;
  userStats: UserStats;
  isReviewMode?: boolean; // If playing mistakes queue or custom practices
  onClose: () => void;
  onFinishLesson: (xpEarned: number, incorrectAnswers: BaseExercise[]) => void;
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
  const [hearts, setHearts] = useState(5);
  
  // Selection/Interaction States
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambleBank, setScrambleBank] = useState<string[]>([]); // Pooled scramble words
  const [scrambleAnswer, setScrambleAnswer] = useState<string[]>([]); // Chosen scramble words
  const [dictationValue, setDictationValue] = useState('');

  // Assessment States
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswersList, setWrongAnswersList] = useState<BaseExercise[]>([]);

  // Completion/End State
  const [isLessonFinished, setIsLessonFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showRuleIntro, setShowRuleIntro] = useState(lesson.rule ? true : false);

  // Initialize Lesson Cards
  useEffect(() => {
    // Slicing or copying the embedded questions
    const pool = [...lesson.exercises];
    // In review mode or standard playback, let's shuffle them to keep repeat plays fresh!
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setExercises(shuffled);
    setCurrentIndex(0);
    setHearts(5);
    setIsLessonFinished(false);
    setWrongAnswersList([]);
    setShowRuleIntro(lesson.rule ? true : false);

    // Speak initial prompts if applicable (ONLY if we are not showing the rule introduction first!)
    if (!lesson.rule && shuffled[0] && (shuffled[0].type === 'listening-comprehension' || shuffled[0].type === 'dictation')) {
      setTimeout(() => {
        speakText(shuffled[0].audioText || shuffled[0].correctAnswer, userStats.settings.textToSpeechEnabled);
      }, 600);
    }
  }, [lesson]);

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
    setScrambleAnswer([...scrambleAnswer, word]);
    const nextBank = [...scrambleBank];
    nextBank.splice(index, 1);
    setScrambleBank(nextBank);
  };

  const removeWordFromAnswer = (word: string, index: number) => {
    sound.playClick();
    if (isAnswered) return;
    const nextAnswer = [...scrambleAnswer];
    nextAnswer.splice(index, 1);
    setScrambleAnswer(nextAnswer);
    setScrambleBank([...scrambleBank, word]);
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    if (isAnswered) return;

    let correct = false;
    const ans = currentExercise.correctAnswer;

    if (currentExercise.type === 'meaning-selection' || currentExercise.type === 'fill-in-the-blank' || currentExercise.type === 'listening-comprehension') {
      correct = selectedOption === ans;
    } else if (currentExercise.type === 'sentence-scramble') {
      const compiledSentence = scrambleAnswer.join(' ');
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
    // Validate if hearts are zero or exercises are done
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

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#F7F7F7] flex items-center justify-center z-50">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-[#4ECDC4] mx-auto mb-4" />
          <p className="font-heading font-bold text-[#2C3E50]">Loading Lesson Syllabus...</p>
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
                Understand the linguistic rule below before solving the 3 exercises.
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
                      scrambleAnswer.map((word, wIdx) => (
                        <button
                          key={`${word}-${wIdx}`}
                          onClick={() => removeWordFromAnswer(word, wIdx)}
                          className="bg-white hover:bg-gray-50 border-2 border-gray-150 px-3 py-2 rounded-xl text-sm font-semibold shadow-sm cursor-pointer hover:border-gray-300 text-gray-800"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scramble Available Chips Pool */}
                  <div className="flex flex-wrap gap-2.5 justify-center py-4">
                    {scrambleBank.map((word, bIdx) => (
                      <button
                        key={`${word}-${bIdx}`}
                        onClick={() => addWordToAnswer(word, bIdx)}
                        className="bg-white hover:bg-gray-50 border-2 border-gray-150 active:scale-95 px-3 py-2.5 rounded-xl text-sm font-semibold shadow-sm cursor-pointer text-gray-800 hover:border-gray-300"
                      >
                        {word}
                      </button>
                    ))}
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

              {/* Context Hint / Warning */}
              {currentExercise.hint && (
                <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl text-gray-500 text-xs italic mb-4">
                  💡 **Hint:** {currentExercise.hint}
                </div>
              )}

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

              {/* Out of Hearts Warning but Free Continue Option */}
              {hearts === 0 && (
                <div className="bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 p-4 rounded-2xl mb-8 max-w-sm text-center">
                  <p className="text-xs text-[#FF6B6B] font-semibold">
                    ⚠️ You finished with 0 hearts left! Practice mistakes in the Review tab to rebuild your shield.
                  </p>
                </div>
              )}

              <button
                id="lesson-completion-continue-btn"
                onClick={() => onFinishLesson(earnedXP, wrongAnswersList)}
                className="w-full max-w-sm bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-heading font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg text-lg"
              >
                Continue to Path <ArrowRight className="w-5 h-5" />
              </button>
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
