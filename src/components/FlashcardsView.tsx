/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RefreshCw, Volume2, CheckCircle2, Bookmark, Award } from 'lucide-react';
import { sound } from '../sound';

interface FlashcardItem {
  id: string;
  word: string;
  category: string;
  meaning: string;
  example: string;
  level: string;
}

const DECK_WORDS: FlashcardItem[] = [
  {
    id: 'fc_1',
    word: 'Acquaintance',
    category: 'Greetings (A1)',
    meaning: 'A person one knows slightly, but who is not a close friend.',
    example: '"Pleasure to make your acquaintance," she said with a warm smile.',
    level: 'A1'
  },
  {
    id: 'fc_2',
    word: 'Farewell',
    category: 'Greetings (A1)',
    meaning: 'An expression of good wishes at parting; a goodbye greeting.',
    example: 'They said a quick farewell before boarding the train to London.',
    level: 'A1'
  },
  {
    id: 'fc_3',
    word: 'Appetizer',
    category: 'Dining (B1)',
    meaning: 'A small dish of food or a drink taken before the main course of a meal to stimulate one\'s appetite.',
    example: 'We ordered a garlic bread appetizer before our main penne pasta plates arrived.',
    level: 'B1'
  },
  {
    id: 'fc_4',
    word: 'Spearhead',
    category: 'Business (B2)',
    meaning: 'To lead a major collaborative effort, initiative, or campaign.',
    example: 'She was chosen to spearhead the new software transition because of her technical credentials.',
    level: 'B2'
  },
  {
    id: 'fc_5',
    word: 'Notwithstanding',
    category: 'Discussion (C1)',
    meaning: 'In spite of; despite; nevertheless.',
    example: 'Notwithstanding the sudden torrential downpour, the outdoor stadium match finished on schedule.',
    level: 'C1'
  },
  {
    id: 'fc_6',
    word: 'Beat around the bush',
    category: 'Idioms (C1)',
    meaning: 'To avoid speaking directly about the main issue or core topic.',
    example: 'Stop beating around the bush and tell me exactly how much the repairs will cost.',
    level: 'C1'
  },
  {
    id: 'fc_7',
    word: 'Cut corners',
    category: 'Idioms (C1)',
    meaning: 'To do something poorly, cheaply, or quickly to save resources at the expense of overall safety/quality.',
    example: 'The developers did not cut corners; they completed complete structural testing cycles.',
    level: 'C1'
  },
  {
    id: 'fc_8',
    word: 'Under the weather',
    category: 'Idioms (B1-C1)',
    meaning: 'Feeling slightly sick, tired, unwell, or out of sorts.',
    example: 'He stayed home from work today because he felt a bit under the weather.',
    level: 'B1'
  }
];

interface FlashcardsViewProps {
  onBack: () => void;
  textToSpeechEnabled: boolean;
}

export default function FlashcardsView({ onBack, textToSpeechEnabled }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const currentCard = DECK_WORDS[currentIndex];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    sound.playClick();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DECK_WORDS.length);
    }, 150);
  };

  const handlePrev = () => {
    sound.playClick();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + DECK_WORDS.length) % DECK_WORDS.length);
    }, 150);
  };

  const handleToggleKnown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    const next = new Set(knownIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setKnownIds(next);
  };

  const speakWord = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    if (!textToSpeechEnabled) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const scorePercentage = Math.round((knownIds.size / DECK_WORDS.length) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4">
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Exit Deck
        </button>
        <span className="text-xs font-black text-[#4ECDC4] bg-[#4ECDC4]/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Flashcard Laboratory
        </span>
      </div>

      {/* Progress Track */}
      <div className="bg-white border border-gray-150 rounded-2xl p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-xs font-bold text-gray-500">Decks Mastered</p>
          <p className="text-xs font-black text-[#2C3E50]">
            {knownIds.size} / {DECK_WORDS.length} Card Words ({scorePercentage}%)
          </p>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4ECDC4] transition-all duration-300"
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* 3D Flippable card layout widget */}
      <div className="w-full h-80 relative cursor-pointer group perspective-1000" onClick={handleFlip}>
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card Front face */}
          <div
            className="absolute inset-0 bg-white border-2 border-gray-150 rounded-3xl p-6 flex flex-col justify-between shadow-md Backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex justify-between items-start">
              <span className="bg-[#4ECDC4]/10 text-[#4ECDC4] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                {currentCard.category}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold">Word {currentIndex + 1} of {DECK_WORDS.length}</span>
                <button
                  onClick={(e) => handleToggleKnown(currentCard.id, e)}
                  className={`p-1.5 rounded-lg border transition-all ${
                    knownIds.has(currentCard.id)
                      ? 'bg-green-50 border-green-200 text-green-500'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600'
                  }`}
                  title="Mark as learned"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            <div className="text-center my-auto flex flex-col items-center">
              <h3 className="text-3xl font-black font-heading text-[#2C3E50] tracking-tight">
                {currentCard.word}
              </h3>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] bg-gray-100 font-bold text-gray-500 px-2 py-0.5 rounded uppercase">
                  {currentCard.level}
                </span>
                {textToSpeechEnabled && (
                  <button
                    onClick={(e) => speakWord(currentCard.word, e)}
                    className="p-1.5 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-lg hover:bg-[#4ECDC4]/20 transition-all"
                    title="Speak word"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Click to Reveal translation</span>
              <span className="text-[#FF6B6B] animate-pulse">Touch to Flip ↺</span>
            </div>
          </div>

          {/* Card Back face */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-[#2C3E50] to-[#34495E] text-white border-2 border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-md rotate-y-180 backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="flex justify-between items-start">
              <span className="bg-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                Definition & Context
              </span>
              <span className="text-[10px] text-white/60 font-bold">Concept Review</span>
            </div>

            <div className="my-auto space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#4ECDC4]">Structural Meaning</p>
                <p className="text-base font-medium mt-1 leading-relaxed text-gray-100">
                  {currentCard.meaning}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF6B6B]">Contextual Example</p>
                <p className="text-sm italic font-light mt-1 text-gray-200">
                  {currentCard.example}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Click to Hide translation</span>
              <span className="text-[#4ECDC4]" onClick={(e) => e.stopPropagation()}>
                {knownIds.has(currentCard.id) ? '✓ MASTERED' : 'STAR TO MARK READY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slider buttons */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={(e) => handleToggleKnown(currentCard.id, e)}
          className={`px-5 py-2.5 rounded-xl border font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
            knownIds.has(currentCard.id)
              ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {knownIds.has(currentCard.id) ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Mark Completed!
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 text-[#4ECDC4]" /> Flag as Known
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-black text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tiny instructions card */}
      <div className="bg-gray-50/50 border border-gray-200 rounded-3xl p-5 mt-8 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs font-bold text-gray-800">Learn actively using 3D flipping effects!</p>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-sm mx-auto">
          Hover or touch the main card to view definitions. Mark words as mastered to advance your percentage track!
        </p>
      </div>
    </div>
  );
}
