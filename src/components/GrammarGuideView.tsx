/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Compass, Bookmark, CheckCircle2, ChevronDown, ChevronUp, Star, Award, Columns, BookOpen, AlertCircle } from 'lucide-react';
import { sound } from '../sound';

interface GrammarRule {
  id: string;
  title: string;
  level: string;
  description: string;
  structure: string;
  examples: { original: string; reason: string }[];
  commonMistake: { bad: string; good: string; tip: string };
}

const GRAMMAR_DATABASE: GrammarRule[] = [
  {
    id: 'gr_1',
    level: 'A1-A2',
    title: 'The Auxiliary "To Be" Conjugation',
    description: 'The foundation of greetings, identity, and personal description. Matches subjects to appropriate present linking registers.',
    structure: 'Subject + am/is/are + Adjective/Noun/Adverb',
    examples: [
      { original: 'I am a diligent scholar.', reason: 'First-person singular uses "am".' },
      { original: 'You are original and wise.', reason: 'Second-person linking uses "are".' },
      { original: 'He is from London originally.', reason: 'Third-person singular uses "is".' }
    ],
    commonMistake: {
      bad: 'Where you are from originally?',
      good: 'Where are you from originally?',
      tip: 'In English interrogative questions, the helping verb "to be" must prefix the subject.'
    }
  },
  {
    id: 'gr_2',
    level: 'A2',
    title: 'Adjective Placement Order',
    description: 'When using multiple qualifiers to describe an object, adjectives must be aligned in a specific logical hierarchy.',
    structure: 'Quantity ➔ Opinion ➔ Size ➔ Pattern/Shape ➔ Age ➔ Color ➔ Origin ➔ Material',
    examples: [
      { original: 'I see a beautiful, white cloud.', reason: 'Opinion ("beautiful") precedes color ("white").' },
      { original: 'Three red ink pens are on the table.', reason: 'Quantity ("three") precedes color ("red").' }
    ],
    commonMistake: {
      bad: 'He wore a red elegant suit.',
      good: 'He wore an elegant red suit.',
      tip: 'Subjective evaluation / opinion adjectives ("elegant") always precede physical characteristics like color ("red").'
    }
  },
  {
    id: 'gr_3',
    level: 'B1',
    title: 'Polite Interrogative Requests',
    description: 'Master requests in restaurant, hotel, and daily transit scenarios. Avoid direct imperatives which sound demanding.',
    structure: 'Could / Would + Subject + verb + please?',
    examples: [
      { original: 'Could I have the check, please?', reason: 'Subtly requests restaurant billing.' },
      { original: 'I would like to book a private table.', reason: 'Subtly states preferences elegantly.' }
    ],
    commonMistake: {
      bad: 'Bring me a cup of tap water now.',
      good: 'Could you please bring me a cup of water?',
      tip: 'Using "Could you..." or "Would you..." shifts imperative commands into polite, cooperative requests.'
    }
  },
  {
    id: 'gr_4',
    level: 'B2',
    title: 'The STAR Method for Professional Interviews',
    description: 'Answering situational interview questions requires setting structural context clearly and outlining achievements.',
    structure: 'Situation ➔ Task ➔ Action taken ➔ Result achieved',
    examples: [
      { original: 'I managed cross-functional teams to increase client retention by 25%.', reason: 'Explicitly outlines Task, action, and metric-based Result.' }
    ],
    commonMistake: {
      bad: 'My last job was good, I did lots of sales and everything went great.',
      good: 'In my previous position, I spearheaded our CRM migration to automate client leads, lowering response times by 30%.',
      tip: 'Replace vague feelings with precise active verbs ("spearheaded", "designed") and objective metrics.'
    }
  },
  {
    id: 'gr_5',
    level: 'C1',
    title: 'Transitional Caveats & Contrast Markers',
    description: 'Used when weighing complex parameters during academic debates or presenting contradictory analytics.',
    structure: 'Notwithstanding + Noun OR Subject + verb, however + opposing clause',
    examples: [
      { original: 'Notwithstanding the sudden sales decline, our user base grew recursively.', reason: 'Contrasts downside factor with upside benefit.' },
      { original: 'I understand your perspective, however it rests on a problematic set of assumptions.', reason: 'Polite academic disagreement.' }
    ],
    commonMistake: {
      bad: 'On the one hand profits fell but but hand we grew.',
      good: 'On the one hand, profits fell; on the other hand, our user base grew.',
      tip: 'Ensure relative structures like "On the one hand..." match perfectly with "on the other hand...".'
    }
  }
];

interface GrammarGuideViewProps {
  onBack: () => void;
}

export default function GrammarGuideView({ onBack }: GrammarGuideViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'A1-A2' | 'A2' | 'B1' | 'B2' | 'C1'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    sound.playClick();
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const filteredRules = selectedLevel === 'ALL'
    ? GRAMMAR_DATABASE
    : GRAMMAR_DATABASE.filter((rule) => rule.level === selectedLevel);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4">
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Exit Guide
        </button>
        <span className="text-xs font-black text-[#FF6B6B] bg-[#FF6B6B]/10 px-3 py-1 rounded-full uppercase tracking-wider">
          Grammar Labs
        </span>
      </div>

      {/* Description header */}
      <div className="mb-6">
        <h3 className="text-lg font-black font-heading text-[#2C3E50]">Academic Reference Sandbox</h3>
        <p className="text-xs text-gray-500 mt-1">
          Review core structural templates, master native order preferences, and study detailed warnings on frequent pitfalls.
        </p>
      </div>

      {/* Level Filters List */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {(['ALL', 'A1-A2', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              sound.playClick();
              setSelectedLevel(lvl);
              setExpandedId(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              selectedLevel === lvl
                ? 'bg-[#FF6B6B] text-white shadow-sm'
                : 'bg-white border border-gray-150 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Database Expansion list cards */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const isExpanded = expandedId === rule.id;

          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-2xl transition-all overflow-hidden shadow-sm ${
                isExpanded ? 'border-coral/50 ring-2 ring-coral/5' : 'border-gray-150 hover:border-gray-250'
              }`}
            >
              {/* Header block press */}
              <div
                onClick={() => toggleExpand(rule.id)}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-coral/10 text-coral flex items-center justify-center font-heading font-black text-xs">
                    {rule.level}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">
                      {rule.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">
                      Grammar Rule #{rule.id.replace('gr_', '')}
                    </p>
                  </div>
                </div>

                <div className="text-gray-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsed view expansion container */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 bg-gray-50/50"
                  >
                    <div className="p-4 space-y-4 text-xs">
                      {/* Structure formula block */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-coral">Core Formula</p>
                        <div className="bg-white border border-gray-150 p-3 rounded-xl mt-1 font-mono text-[10px] text-gray-800 font-bold overflow-x-auto select-all">
                          {rule.structure}
                        </div>
                      </div>

                      {/* Rule Description details */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Detailed Context</p>
                        <p className="text-gray-600 mt-1 leading-relaxed">
                          {rule.description}
                        </p>
                      </div>

                      {/* Practice Examples bullet list */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-teal-600">Golden Standard Examples</p>
                        <ul className="space-y-2 mt-2">
                          {rule.examples.map((ex, idx) => (
                            <li key={idx} className="bg-white border border-teal-100 p-2.5 rounded-xl flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black flex items-center justify-center shrink-0">✓</span>
                              <div>
                                <p className="font-semibold text-gray-800 italic">{ex.original}</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{ex.reason}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Common Mistake warning box */}
                      <div className="bg-red-50/50 border border-red-150 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-red-500 mb-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">Common Pitfall Warning</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 text-[11px]">
                          <div className="p-2 bg-white rounded-lg border border-red-100">
                            <span className="text-[9px] font-black uppercase text-red-500 block">❌ Incorrect Form</span>
                            <span className="text-gray-500 block italic mt-0.5">{rule.commonMistake.bad}</span>
                          </div>

                          <div className="p-2 bg-teal-50 rounded-lg border border-teal-100/50">
                            <span className="text-[9px] font-black uppercase text-teal-600 block">✅ Appropriate Form</span>
                            <span className="text-gray-800 font-bold block italic mt-0.5">{rule.commonMistake.good}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-gray-500 mt-2.5 italic">
                          <span className="font-bold text-gray-700">Reflex Tip</span> {rule.commonMistake.tip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Tiny helper card */}
      <div className="bg-slate-50 border border-gray-200 rounded-3xl p-5 mt-8 text-center">
        <div className="flex justify-center mb-2">
          <BookOpen className="w-5 h-5 text-coral" />
        </div>
        <p className="text-xs font-bold text-gray-800">Learn systematic structures!</p>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          The alignment rules here are strictly tested inside active path levels. Keeping these guidelines handy will help you achieve 100% scores on matching tests!
        </p>
      </div>
    </div>
  );
}
