/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Crown, Star, Lock, Play, Flame, Sparkles } from 'lucide-react';
import { CURRICULUM } from '../data';
import { Lesson, UserStats } from '../types';
import { sound } from '../sound';

interface PathViewProps {
  userStats: UserStats;
  onSelectLesson: (lesson: Lesson, isReview: boolean) => void;
}

export default function PathView({ userStats, onSelectLesson }: PathViewProps) {
  // Check if all lessons of a unit are completed
  const isUnitCompleted = (unitIndex: number): boolean => {
    if (unitIndex < 0 || unitIndex >= CURRICULUM.length) return false;
    return CURRICULUM[unitIndex].lessons.every(
      lesson => !!userStats.completedLessons[lesson.id]?.completedCount
    );
  };

  // Check if a lesson is unlocked
  // A lesson is unlocked if:
  // 1. It belongs to Unit 0, and the previous lesson (if any) is completed, or it's the very first lesson.
  // 2. Or, for UnitIdx > 0, the previous Unit is 100% completed, and the previous lesson (if any) in the current unit is completed.
  const isLessonUnlocked = (unitIdx: number, lessonIdx: number): boolean => {
    // Lesson 0 of Unit 0 is always unlocked
    if (unitIdx === 0 && lessonIdx === 0) return true;

    // A unit (unitIdx > 0) is unlocked only if the previous unit is fully completed
    if (unitIdx > 0) {
      if (!isUnitCompleted(unitIdx - 1)) {
        return false;
      }
    }

    // Lesson 0 of an unlocked unit is always unlocked
    if (lessonIdx === 0) return true;

    // Within an unlocked unit, lesson L (L > 0) is unlocked if physical previous lesson of same unit U is completed
    const prevLessonId = CURRICULUM[unitIdx].lessons[lessonIdx - 1].id;
    return !!userStats.completedLessons[prevLessonId]?.completedCount;
  };

  const handleLessonClick = (lesson: Lesson, unlocked: boolean, isGolden: boolean) => {
    sound.playClick();
    if (!unlocked) {
      // Just shake or do nothing if locked
      return;
    }
    // Launch lesson (isReview = isGolden to possibly toggle harder variants)
    onSelectLesson(lesson, isGolden);
  };

  // Serpentine offset pattern for standard Duolingo curve
  const getSerpentineOffset = (idx: number) => {
    const pattern = [
      'translate-x-0',
      'translate-x-8 sm:translate-x-12',
      'translate-x-12 sm:translate-x-20',
      'translate-x-8 sm:translate-x-12',
      'translate-x-0',
      '-translate-x-8 sm:-translate-x-12',
      '-translate-x-12 sm:-translate-x-20',
      '-translate-x-8 sm:-translate-x-12'
    ];
    return pattern[idx % pattern.length];
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-4">
      {/* Upper Status Panel */}
      <div className="bg-white rounded-2xl border border-gray-150 p-4 mb-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[#FF6B6B] fill-[#FF6B6B]" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Streak</p>
            <p className="text-sm font-extrabold text-[#2C3E50]">{userStats.streak} Days</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Crowns</p>
            <p className="text-sm font-extrabold text-[#2C3E50]">
              {Object.keys(userStats.completedLessons).length + CURRICULUM.filter((_, idx) => isUnitCompleted(idx)).length} Total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total XP</p>
            <p className="text-sm font-extrabold text-[#2C3E50]">{userStats.currentXP} XP</p>
          </div>
        </div>
      </div>

      {/* Curriculum Path Loop */}
      {CURRICULUM.map((unit, unitIdx) => {

        // Calculate completed golden lessons in this unit
        const totalLessons = unit.lessons.length;
        const goldenCount = unit.lessons.filter(
          (less) => userStats.completedLessons[less.id]?.golden
        ).length;
        const completionRate = Math.round((goldenCount / totalLessons) * 100);

        return (
          <div key={unit.id} className="mb-10 relative">
            {/* Unit Header Card */}
            <div className={`bg-gradient-to-tr ${isUnitCompleted(unitIdx) ? 'from-amber-500 to-yellow-500' : 'from-[#FF6B6B] to-[#FF8E8E]'} text-white p-5 rounded-3xl shadow-md mb-8 relative overflow-hidden`}>
              <div className="absolute right-[-10px] top-[-10px] opacity-10">
                <Sparkles className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <p className="text-xs font-bold uppercase tracking-widest text-[#FFF0F0]">
                  {unit.id.replace('_', ' ').toUpperCase()}
                </p>
                {isUnitCompleted(unitIdx) && (
                  <span className="flex items-center gap-1 bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">
                    <Crown className="w-3 h-3 fill-current text-white animate-bounce" /> Unit Crown Earned
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-heading leading-tight mb-1">
                {unit.title}
              </h3>
              <p className="text-xs text-[#FFF0F0] mb-4 text-gray-100 italic">
                {unit.description}
              </p>

              {/* Progress inside unit */}
              <div className="bg-black/10 rounded-full h-2.5 overflow-hidden w-full relative mb-1">
                <div
                  className="bg-white h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-[#FFF0F0] mt-1.5 font-bold">
                <span>{goldenCount} / {totalLessons} Golden</span>
                <span>{completionRate}% Complete</span>
              </div>
            </div>

            {/* Vertical Nodes Container */}
            <div className="flex flex-col items-center relative py-4">
              {unit.lessons.map((lesson, lessonIdx) => {
                const unlocked = isLessonUnlocked(unitIdx, lessonIdx);
                const completeInfo = userStats.completedLessons[lesson.id];
                const isGolden = !!completeInfo?.golden;
                const offset = getSerpentineOffset(lessonIdx);

                return (
                  <div key={lesson.id} className="flex flex-col items-center relative mb-12">
                    {/* SVG Connector lines */}
                    {lessonIdx < totalLessons - 1 && (
                      <div className="absolute top-20 bottom-[-48px] w-1 bg-gray-200 -z-10 blur-[0.5px]">
                        <div
                          className={`w-full h-full rounded transition-all duration-500 ${
                            isGolden ? 'bg-yellow-400' : unlocked ? 'bg-[#4ECDC4]' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                    
                    {/* Serpent Node */}
                    <div className={`transition-transform duration-300 ${offset}`}>
                      <div className="relative group flex flex-col items-center">
                        
                        {/* Hover Tooltip / Status text */}
                        <div className="absolute bottom-22 bg-white text-gray-800 border border-gray-150 py-1.5 px-3.5 rounded-xl shadow-lg text-xs font-semibold whitespace-nowrap z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <p className="font-bold text-gray-900">{lesson.title}</p>
                          <p className="text-gray-500 font-sans mt-0.5">
                            {!unlocked ? 'Locked' : isGolden ? `Completed (Replay for Hard Mode)` : `${lesson.description}`}
                          </p>
                        </div>

                        {/* Node Round Widget */}
                        <button
                          id={`node-btn-${lesson.id}`}
                          onClick={() => handleLessonClick(lesson, unlocked, isGolden)}
                          disabled={!unlocked}
                          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 relative transition-all duration-200 cursor-pointer ${
                            !unlocked
                              ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                              : isGolden
                              ? 'bg-yellow-400 border-yellow-500 hover:scale-105 shadow-md active:bg-yellow-500 text-white'
                              : 'bg-white border-[#4ECDC4] text-[#4ECDC4] hover:scale-105 hover:bg-gray-50 shadow-md active:scale-95'
                          }`}
                        >
                          {/* Crown or Star overlay */}
                          {isGolden ? (
                            <motion.div
                              animate={{ rotate: [0, -10, 10, 0] }}
                              transition={{ repeat: Infinity, duration: 4 }}
                              className="absolute -top-3.5 bg-yellow-400 border-2 border-white rounded-full p-1"
                            >
                              <Crown className="w-4 h-4 text-white fill-white" />
                            </motion.div>
                          ) : (
                            unlocked && (
                              <div className="absolute -top-3.5 bg-[#4ECDC4] border-2 border-white rounded-full p-1">
                                <Star className="w-4 h-4 text-white fill-white" />
                              </div>
                            )
                          )}

                          {/* Inner Node Graphic */}
                          {!unlocked ? (
                            <Lock className="w-7 h-7 text-gray-400" />
                          ) : isGolden ? (
                            <Crown className="w-8 h-8 text-white fill-white" />
                          ) : (
                            <Play className="w-8 h-8 fill-current ml-1" />
                          )}

                          {/* Level counter/Indicator */}
                          {unlocked && (
                            <span className="absolute -bottom-2 bg-slate-800 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700 tracking-wide">
                              {isGolden ? '🏆 Completed' : '👉 Start'}
                            </span>
                          )}
                        </button>

                        {/* Node Label Text */}
                        <div className="text-center mt-3 max-w-[140px]">
                          <p className="text-xs font-bold text-[#2C3E50]">{lesson.title}</p>
                          <p className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
                            {lesson.difficulty}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
