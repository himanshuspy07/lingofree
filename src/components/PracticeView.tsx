/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Flame, Trash2, ShieldAlert, Swords, Star, BookOpen, Layers, BookMarked } from 'lucide-react';
import { UserStats, Lesson, BaseExercise } from '../types';
import { CURRICULUM } from '../data';
import { sound } from '../sound';
import FlashcardsView from './FlashcardsView';
import GrammarGuideView from './GrammarGuideView';

interface PracticeViewProps {
  userStats: UserStats;
  onStartPractice: (dummyLesson: Lesson) => void;
  onClearMistakes: () => void;
}

export default function PracticeView({ userStats, onStartPractice, onClearMistakes }: PracticeViewProps) {
  const [activeMode, setActiveMode] = useState<'menu' | 'flashcards' | 'grammar'>('menu');
  const mistakesCount = userStats.mistakesQueue.length;

  // Compile a weak skills practice block containing randomized questions from curriculum
  const handleStartWeakSkills = () => {
    sound.playClick();
    
    // Choose 10 random questions throughout the curriculum
    const allQuestions: BaseExercise[] = [];
    CURRICULUM.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        allQuestions.push(...lesson.exercises);
      });
    });

    // Shuffle and pick 10
    const weakSkillsPool = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 10);

    const dummyLesson: Lesson = {
      id: 'weak_skills_practice',
      title: 'Weak Skills Review',
      description: 'Strengthen verbs, grammar concepts, and listening comprehension.',
      difficulty: 'B1',
      xpReward: 10,
      exercises: weakSkillsPool
    };

    onStartPractice(dummyLesson);
  };

  // Compile redemption drill lesson using actual incorrect elements in queue
  const handleStartRedemption = () => {
    sound.playClick();
    if (mistakesCount === 0) return;

    // Pick unique exercises
    const uniqueMistakes: BaseExercise[] = [];
    const idsSeen = new Set<string>();
    userStats.mistakesQueue.forEach(ex => {
      if (!idsSeen.has(ex.id)) {
        uniqueMistakes.push(ex);
        idsSeen.add(ex.id);
      }
    });

    const dummyLesson: Lesson = {
      id: 'mistakes_redemption',
      title: 'Error Redemption Drill',
      description: 'Repeat specific phrases you recently struggled with.',
      difficulty: 'A2',
      xpReward: 12,
      exercises: uniqueMistakes.slice(0, 12) // cap at 12 exercises
    };

    onStartPractice(dummyLesson);
  };

  if (activeMode === 'flashcards') {
    return (
      <FlashcardsView
        onBack={() => setActiveMode('menu')}
        textToSpeechEnabled={userStats.settings.textToSpeechEnabled}
      />
    );
  }

  if (activeMode === 'grammar') {
    return (
      <GrammarGuideView
        onBack={() => setActiveMode('menu')}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-4">
      {/* Banner Intro */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6 font-sans">
        <div className="flex-grow">
          <span className="bg-[#4ECDC4]/10 text-[#4ECDC4] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Review Laboratory
          </span>
          <h2 className="text-2xl font-black font-heading mt-2 text-[#2C3E50]">
            Smart Practice Labs
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Retain what you learn forever. Practice targets weak retention points, reviews past mistakes, and houses comprehensive reference sets.
          </p>
        </div>
        <div className="w-24 h-24 bg-gradient-to-tr from-[#4ECDC4] to-cyan-400 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg relative">
          <Brain className="w-12 h-12" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-1.5 -right-1.5 bg-[#FF6B6B] p-1 rounded-full border border-white"
          >
            <Sparkles className="w-4 h-4 text-white fill-white" />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Module 1: Mistakes Redemption Drill Card */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between hover:border-gray-250 transition-all relative">
          <div>
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
              mistakesCount > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#2C3E50] font-heading">
              Error Redemption Drill
            </h3>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">
              Targeted exercises you previously got incorrect. Clear this queue to earn XP and fully optimize your memory retention!
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                mistakesCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {mistakesCount} Unresolved Mistakes
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              id="start-redemption-drill-btn"
              onClick={handleStartRedemption}
              disabled={mistakesCount === 0}
              className={`flex-grow font-bold py-3 px-4 rounded-xl text-xs text-center uppercase tracking-wider Transition-all cursor-pointer ${
                mistakesCount === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border'
                  : 'bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90 hover:shadow-sm'
              }`}
            >
              Practice Mistakes
            </button>
            {mistakesCount > 0 && (
              <button
                id="clear-mistakes-queue-btn"
                onClick={() => {
                  sound.playClick();
                  if (window.confirm('Do you want to wipe all pending cached mistakes from local storage?')) {
                    onClearMistakes();
                  }
                }}
                className="p-3 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-500 rounded-xl transition-all hover:bg-gray-100 cursor-pointer"
                title="Clear queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Module 2: Weak Skills Warm-Up Card */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between hover:border-gray-250 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/10 text-[#4ECDC4] mb-4 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#2C3E50] font-heading">
              Weak Skills Warm-up
            </h3>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">
              Curates ten randomized challenges across the vocabulary pool, combining definitions, scrambled arrays, listening trials, and grammar tests.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4ECDC4]/10 text-[#4ECDC4]">
                10 Random Challenges
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              id="start-weak-skills-btn"
              onClick={handleStartWeakSkills}
              className="w-full bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider Transition-all cursor-pointer hover:shadow-sm text-center"
            >
              Start General Practice
            </button>
          </div>
        </div>

        {/* Module 3: Vocabulary Flashcard Laboratory (Feature 1) */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between hover:border-gray-250 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 mb-4 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#2C3E50] font-heading">
              Vocabulary Deck Lab
            </h3>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">
              Unlockable, physical-like double-sided memorization cards with 3D-rotations. Stars key lexical items to check retention.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-55 text-amber-600">
                8 Academic Cards
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              id="start-flashcards-btn"
              onClick={() => {
                sound.playClick();
                setActiveMode('flashcards');
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider Transition-all cursor-pointer hover:shadow-sm text-center"
            >
              Enter Deck Lab
            </button>
          </div>
        </div>

        {/* Module 4: Grammar & Phrase Sandbox (Feature 2) */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm flex flex-col justify-between hover:border-gray-250 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-coral/10 text-coral mb-4 flex items-center justify-center">
              <BookMarked className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#2C3E50] font-heading">
              Grammar Rule Sandbox
            </h3>
            <p className="text-xs text-gray-450 mt-1 leading-relaxed">
              Explore essential syntax rules, adjectives serialization logic, polite request modals, and common warning pitfall tips.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-coral/10 text-coral">
                CEFR A1-C1 Guides
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              id="start-grammar-btn"
              onClick={() => {
                sound.playClick();
                setActiveMode('grammar');
              }}
              className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider Transition-all cursor-pointer hover:shadow-sm text-center"
            >
              Open Grammar Labs
            </button>
          </div>
        </div>
      </div>

      {/* Spaced learning suggestion panel */}
      <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 mt-6 flex items-start gap-3">
        <div className="text-amber-500 mt-0.5">💡</div>
        <div>
          <h4 className="text-xs font-bold text-gray-800">Spaced Repetition Tip</h4>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
            Scientific studies show reviewing past errors 24-hours after failure increases long-term retention up to 80%. Re-doing golden crown nodes also sharpens grammar reflexes!
          </p>
        </div>
      </div>
    </div>
  );
}
