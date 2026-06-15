/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Flame, Star, Trophy, ClipboardCheck, Sparkles, ShieldCheck, HeartCrack } from 'lucide-react';
import { UserStats } from '../types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  checkUnlocked: (stats: UserStats) => boolean;
  getProgress: (stats: UserStats) => { current: number; target: number; label: string };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'First Step',
    description: 'Launch your academic career by finishing your first lesson.',
    icon: <Award className="w-6 h-6" />,
    colorClass: 'text-amber-500 fill-amber-500/10',
    bgClass: 'bg-amber-50 border-amber-100',
    checkUnlocked: (stats) => Object.keys(stats.completedLessons).length > 0,
    getProgress: (stats) => {
      const count = Object.keys(stats.completedLessons).length;
      return {
        current: count > 0 ? 1 : 0,
        target: 1,
        label: `${count} / 1 Completed`
      };
    }
  },
  {
    id: 'ach_streak_lord',
    title: 'Streak Star',
    description: 'Keep your dedication blazing for 2 or more consecutive days.',
    icon: <Flame className="w-6 h-6" />,
    colorClass: 'text-orange-500 fill-orange-500/10',
    bgClass: 'bg-orange-50 border-orange-100',
    checkUnlocked: (stats) => stats.streak >= 2,
    getProgress: (stats) => {
      return {
        current: Math.min(2, stats.streak),
        target: 2,
        label: `${stats.streak} / 2 Days`
      };
    }
  },
  {
    id: 'ach_xp_titan',
    title: 'XP Pioneer',
    description: 'Earn 100 or more accumulated XP across any practice.',
    icon: <Star className="w-6 h-6" />,
    colorClass: 'text-yellow-500 fill-yellow-500/10',
    bgClass: 'bg-yellow-50 border-yellow-105',
    checkUnlocked: (stats) => stats.currentXP >= 100,
    getProgress: (stats) => {
      return {
        current: Math.min(100, stats.currentXP),
        target: 100,
        label: `${stats.currentXP} / 100 XP`
      };
    }
  },
  {
    id: 'ach_linguistic_guru',
    title: 'Elite Scholar',
    description: 'Level up your mental prowess to Level 3 or higher.',
    icon: <Trophy className="w-6 h-6" />,
    colorClass: 'text-[#4ECDC4] fill-[#4ECDC4]/10',
    bgClass: 'bg-teal-50 border-teal-100',
    checkUnlocked: (stats) => stats.level >= 3,
    getProgress: (stats) => {
      return {
        current: Math.min(3, stats.level),
        target: 3,
        label: `Level ${stats.level} / Level 3`
      };
    }
  },
  {
    id: 'ach_perfection',
    title: 'Mistake Eradicator',
    description: 'Maintain high accuracy. Have exactly 0 pending mistakes in your queue.',
    icon: <ShieldCheck className="w-6 h-6" />,
    colorClass: 'text-emerald-500 fill-emerald-500/10',
    bgClass: 'bg-emerald-50 border-emerald-100',
    checkUnlocked: (stats) => stats.mistakesQueue.length === 0 && Object.keys(stats.completedLessons).length > 0,
    getProgress: (stats) => {
      const mistakes = stats.mistakesQueue.length;
      return {
        current: mistakes === 0 ? 1 : 0,
        target: 1,
        label: mistakes === 0 ? '0 Mistakes ✓' : `${mistakes} errors left`
      };
    }
  }
];

interface AchievementsSectionProps {
  userStats: UserStats;
}

export default function AchievementsSection({ userStats }: AchievementsSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-150 animate-pulse" />
        <h3 className="text-lg font-black font-heading text-[#2C3E50]">Academy Badge Milestones</h3>
      </div>
      
      <p className="text-xs text-gray-400 mt-0.5 mb-5 leading-relaxed">
        Collect achievements by reviewing, maintaining daily targets, and keeping mistake laboratories fully empty!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = ach.checkUnlocked(userStats);
          const progress = ach.getProgress(userStats);
          const percent = Math.min(100, Math.round((progress.current / progress.target) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                unlocked 
                  ? `${ach.bgClass} shadow-xs hover:scale-[1.01]`
                  : 'bg-gray-50/50 border-gray-200 opacity-70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  unlocked 
                    ? `${ach.colorClass} border-transparent bg-white/80 shadow-xs` 
                    : 'text-gray-400 border-gray-200 bg-gray-100'
                }`}>
                  {ach.icon}
                </div>
                <div>
                  <h4 className={`text-sm font-bold leading-tight ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-normal mt-1 pr-1 font-medium">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Progress Slider block */}
              <div className="mt-4">
                <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <span>{unlocked ? '❖ Award Unlocked' : 'In Progress'}</span>
                  <span className={unlocked ? 'text-emerald-600' : 'text-gray-500'}>
                    {progress.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      unlocked ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
