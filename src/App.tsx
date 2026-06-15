/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Flame, Trophy, Sparkles, User, Dumbbell, ShieldAlert, ShoppingBag } from 'lucide-react';
import { UserStats, Lesson, BaseExercise } from './types';
import { CURRICULUM } from './data';
import {
  STORAGE_KEY,
  createDefaultState,
  getLevelFromXP,
  simulateBotProgress,
  checkLeagueReset,
  getMondayTimestamp
} from './utils';
import { sound } from './sound';
import { getAvatarById } from './avatarPresets';

// Component imports
import Onboarding from './components/Onboarding';
import PathView from './components/PathView';
import PracticeView from './components/PracticeView';
import LeaderboardView from './components/LeaderboardView';
import ProfileView from './components/ProfileView';
import LessonOverlay from './components/LessonOverlay';
import ShopView from './components/ShopView';

export default function App() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'path' | 'practice' | 'leaderboard' | 'profile' | 'shop'>('path');
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; isReview: boolean } | null>(null);

  // Load state on startup
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        let parsed = JSON.parse(raw) as UserStats;
        // Ensure new store fields exist for backwards compatibility with older sessions
        if (parsed.lingocoins === undefined) parsed.lingocoins = 150;
        if (parsed.streakFreezes === undefined) parsed.streakFreezes = 0;
        if (parsed.activeWager === undefined) parsed.activeWager = false;
        if (parsed.activeTitle === undefined) parsed.activeTitle = 'Starter Student';
        if (parsed.unlockedTitles === undefined) parsed.unlockedTitles = ['Starter Student'];
        if (parsed.avatarId === undefined) parsed.avatarId = 'owl';
        if (parsed.settings === undefined) {
          parsed.settings = { soundEffectsEnabled: true, textToSpeechEnabled: true, darkModeEnabled: false };
        } else if (parsed.settings.darkModeEnabled === undefined) {
          parsed.settings.darkModeEnabled = false;
        }

        // Run league reset check if Monday passed
        parsed = checkLeagueReset(parsed);
        // Feed in initial bot advancements to simulate changes while offline
        parsed = simulateBotProgress(parsed);
        setStats(parsed);
      } catch (e) {
        console.error('Error restoring localStorage profile:', e);
      }
    }
  }, []);

  // Update sound controller state when stats preferences change
  useEffect(() => {
    if (stats) {
      sound.setEnabled(stats.settings.soundEffectsEnabled);
    }
  }, [stats?.settings.soundEffectsEnabled]);

  // Synchronize dark-mode body/html class based on settings state
  useEffect(() => {
    if (stats?.settings?.darkModeEnabled) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [stats?.settings?.darkModeEnabled]);

  // Helper to persist updated stats state
  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (name: string, dailyGoal: number) => {
    const freshStats = createDefaultState(name, dailyGoal);
    // Add player item into league pool
    freshStats.leagueUsers.push({
      id: 'user_player',
      name,
      xp: 0,
      isBot: false,
      streak: 0,
      avatarSeed: 0
    });
    saveStats(freshStats);
  };

  // Reset Progress Handler
  const handleResetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStats(null);
    setActiveTab('path');
    setActiveLesson(null);
  };

  // Handle setting updates
  const handleUpdateSettings = (updater: (prev: UserStats['settings']) => UserStats['settings']) => {
    if (!stats) return;
    const nextSettings = updater(stats.settings);
    saveStats({
      ...stats,
      settings: nextSettings
    });
  };

  // Launch a standard curriculum lesson or custom mistake redeemer practice
  const handleSelectLesson = (lesson: Lesson, isReview: boolean) => {
    setActiveLesson({ lesson, isReview });
  };

  const handleClearMistakesQueue = () => {
    if (!stats) return;
    saveStats({
      ...stats,
      mistakesQueue: []
    });
  };

  // Complete a lesson/practice successfully
  const handleFinishLesson = (xpEarned: number, failedExercises: BaseExercise[]) => {
    if (!stats || !activeLesson) return;

    sound.playClick();
    const completingLesson = activeLesson.lesson;
    const isCustomPractice = completingLesson.id === 'weak_skills_practice' || completingLesson.id === 'mistakes_redemption';

    const nextXP = stats.currentXP + xpEarned;
    const nextLevel = getLevelFromXP(nextXP);

    // Calculate dates to update active streak with streak freeze protection
    const todayStr = new Date().toISOString().split('T')[0];
    let nextStreak = stats.streak;
    let nextStreakFreezes = stats.streakFreezes ?? 0;

    if (stats.lastActiveDate !== todayStr) {
      if (stats.lastActiveDate === null) {
        nextStreak = 1;
      } else {
        // Calculate calendar days between last activity and today
        const lastDate = new Date(stats.lastActiveDate);
        const todayDate = new Date(todayStr);
        const diffMs = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          nextStreak += 1; // Streak maintained
        } else {
          // If a day was missed, check for protective Streak Freeze inventory
          if (nextStreakFreezes > 0) {
            nextStreakFreezes -= 1;
            nextStreak += 1; // Saved from reset, count today as incrementing streak
          } else {
            nextStreak = 1; // No freezes, reset streak back to 1
          }
        }
      }
    }

    // Calculate LingoCoins gained: 15 baseline plus perfect mark accuracy bonuses
    let coinsEarned = 15;
    if (failedExercises.length === 0) {
      coinsEarned += 10; // +10 Perfect Lesson bonus!
    }

    // Double or Nothing Wager Payout Check
    let nextWager = stats.activeWager ?? false;
    if (nextWager && nextStreak >= 7) {
      coinsEarned += 100; // Collect 100 coin payout
      nextWager = false;
    }

    const nextCoins = (stats.lingocoins ?? 0) + coinsEarned;

    // Update daily activity log
    const nextActivityLog = { ...stats.activityLog };
    nextActivityLog[todayStr] = (nextActivityLog[todayStr] || 0) + xpEarned;

    // Update completed lesson details
    const nextCompletedLessons = { ...stats.completedLessons };
    let promotedPaths = {
      unlockedUnitIndex: stats.unlockedUnitIndex,
      unlockedLessonIndex: stats.unlockedLessonIndex
    };

    if (!isCustomPractice) {
      const currentCompletedInfo = nextCompletedLessons[completingLesson.id] || {
        completedCount: 0,
        golden: false,
        highScore: 0
      };

      const updatedCount = currentCompletedInfo.completedCount + 1;
      nextCompletedLessons[completingLesson.id] = {
        completedCount: updatedCount,
        golden: true, // turning golden immediately on first complete as user path requirement
        highScore: Math.max(currentCompletedInfo.highScore, xpEarned)
      };

      // Check path index increments
      // Find where we are in curriculum to advance the user's unlocked bounds
      let targetUnitIdx = stats.unlockedUnitIndex;
      let targetLessonIdx = stats.unlockedLessonIndex;

      const activeUnitIndex = CURRICULUM.findIndex(u => u.lessons.some(l => l.id === completingLesson.id));
      if (activeUnitIndex !== -1) {
        const activeLessonIndex = CURRICULUM[activeUnitIndex].lessons.findIndex(l => l.id === completingLesson.id);

        // If the user completed the lesson that maps to their currently unlocked threshold, unlock next
        if (activeUnitIndex === stats.unlockedUnitIndex && activeLessonIndex === stats.unlockedLessonIndex) {
          const currentUnitLessonsCount = CURRICULUM[activeUnitIndex].lessons.length;
          
          if (activeLessonIndex < currentUnitLessonsCount - 1) {
            targetLessonIdx = activeLessonIndex + 1;
          } else {
            // End of current unit, verify all lessons/parts in this unit have been completed at least once
            const allOfUnitCompleted = CURRICULUM[activeUnitIndex].lessons.every(lesson => {
              if (lesson.id === completingLesson.id) return true; // completing right now
              return !!nextCompletedLessons[lesson.id]?.completedCount;
            });

            if (allOfUnitCompleted) {
              if (activeUnitIndex < CURRICULUM.length - 1) {
                targetUnitIdx = activeUnitIndex + 1;
                targetLessonIdx = 0;
              }
            } else {
              // Stay on this lesson index as more lessons need completion
              targetLessonIdx = activeLessonIndex;
            }
          }
        }
      }

      promotedPaths = {
        unlockedUnitIndex: targetUnitIdx,
        unlockedLessonIndex: targetLessonIdx
      };
    }

    // Update Mistakes Queue - filter duplicates
    const nextMistakesQueue = [...stats.mistakesQueue];
    failedExercises.forEach(ex => {
      if (!nextMistakesQueue.some(m => m.id === ex.id)) {
        nextMistakesQueue.push(ex);
      }
    });

    // If it was mistakes redemption drill, we clear matching items from mistake queue on successful finish
    let clearedMistakesQueue = nextMistakesQueue;
    if (completingLesson.id === 'mistakes_redemption') {
      const solvedIds = completingLesson.exercises.map(ex => ex.id);
      clearedMistakesQueue = nextMistakesQueue.filter(m => !solvedIds.includes(m.id));
    }

    // Update simulated multiplayer league scorecard for user
    const updatedWeeklyLeagueUsers = stats.leagueUsers.map(u => {
      if (!u.isBot) {
        return {
          ...u,
          xp: u.xp + xpEarned,
          streak: nextStreak
        };
      }
      return u;
    });

    const updatedStatsState: UserStats = {
      ...stats,
      currentXP: nextXP,
      level: nextLevel,
      streak: nextStreak,
      lastActiveDate: todayStr,
      activityLog: nextActivityLog,
      completedLessons: nextCompletedLessons,
      unlockedUnitIndex: promotedPaths.unlockedUnitIndex,
      unlockedLessonIndex: promotedPaths.unlockedLessonIndex,
      mistakesQueue: clearedMistakesQueue,
      leagueUsers: updatedWeeklyLeagueUsers,
      lingocoins: nextCoins,
      streakFreezes: nextStreakFreezes,
      activeWager: nextWager
    };

    // Trigger secondary bots simulator boost to create responsive opponent scores
    const fullyUpdatedWithBots = simulateBotProgress(updatedStatsState);

    saveStats(fullyUpdatedWithBots);
    setActiveLesson(null);
  };

  // Tab change wrapper to slightly simulate competitor live progress dynamically!
  const handleTabChange = (target: 'path' | 'practice' | 'leaderboard' | 'profile' | 'shop') => {
    sound.playClick();
    setActiveTab(target);

    // Randomize dynamic bot updates on tab click to enhance visual rivalry!
    if (stats) {
      const advancedState = simulateBotProgress(stats);
      saveStats(advancedState);
    }
  };

  // Root rendering routing wrapper
  if (!stats) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#2C3E50] flex flex-col md:flex-row antialiased font-sans">
      
      {/* 1. Desktop Sidebar (md: display min) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-gray-150 p-6 sticky top-0 h-screen z-40 shrink-0">
        <div>
          {/* Custom Styled Brand / Logo */}
          <div className="flex items-center gap-2.5 mb-10 px-2">
            <div className="w-10 h-10 bg-[#FF6B6B] rounded-xl flex items-center justify-center font-heading font-black text-white text-lg tracking-wider shadow">
              LF
            </div>
            <div>
              <p className="font-heading font-black text-base text-[#2C3E50] tracking-tight leading-none">LingoFree</p>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">Free English School</p>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav className="flex flex-col gap-2">
            <button
              id="sidebar-path-tab"
              onClick={() => handleTabChange('path')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold font-heading text-sm transition-all cursor-pointer ${
                activeTab === 'path'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Compass className="w-5 h-5 shrink-0" /> Learning Path
            </button>

            <button
              id="sidebar-practice-tab"
              onClick={() => handleTabChange('practice')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold font-heading text-sm transition-all cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Dumbbell className="w-5 h-5 shrink-0" /> Review & Labs
            </button>

            <button
              id="sidebar-leaderboard-tab"
              onClick={() => handleTabChange('leaderboard')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold font-heading text-sm transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Trophy className="w-5 h-5 shrink-0" /> Simulated League
            </button>

            <button
              id="sidebar-shop-tab"
              onClick={() => handleTabChange('shop')}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl font-bold font-heading text-sm transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 shrink-0" /> Academy Shop
              </div>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                🪙 {stats.lingocoins ?? 0}
              </span>
            </button>

            <button
              id="sidebar-profile-tab"
              onClick={() => handleTabChange('profile')}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold font-heading text-sm transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5 shrink-0" /> Student Profile
            </button>
          </nav>
        </div>

        {/* Small desktop footer profile clip */}
        <div className="bg-gray-50/50 p-3.5 border border-gray-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarById(stats.avatarId).bgGradient} flex items-center justify-center font-bold text-white text-base shadow-inner border border-black/5 shrink-0`}>
              {getAvatarById(stats.avatarId).emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate max-w-[105px] text-gray-800 leading-tight">{stats.displayName}</p>
              <p className="text-[9px] text-[#FF6B6B] font-extrabold uppercase mt-0.5 truncate max-w-[105px] tracking-tight">
                {stats.activeTitle || 'Starter Student'}
              </p>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Lv. {stats.level}</p>
            </div>
          </div>
          <Flame className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B] shrink-0" />
        </div>
      </aside>

      {/* 2. Main content block containing matching views */}
      <main className="flex-grow min-h-screen relative overflow-x-hidden flex flex-col justify-start">
        {/* Mobile Header Banner Bar */}
        <header className="md:hidden bg-white border-b border-gray-150 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6B6B] text-white font-black font-heading rounded-lg flex items-center justify-center text-sm shadow-sm">
              LF
            </div>
            <span className="font-heading font-black text-[#2C3E50] text-sm tracking-tight">LingoFree</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-0.5 bg-[#FF6B6B]/10 text-[#FF6B6B] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-current" /> {stats.streak}
            </div>
            <div className="flex items-center gap-0.5 bg-yellow-100 text-yellow-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" /> {stats.currentXP} XP
            </div>
            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold text-xs">
              🪙 {stats.lingocoins ?? 0}
            </div>
          </div>
        </header>

        {/* Dynamic sub tab rendering */}
        <div className="flex-grow">
          {activeTab === 'path' && (
            <PathView userStats={stats} onSelectLesson={handleSelectLesson} />
          )}

          {activeTab === 'practice' && (
            <PracticeView
              userStats={stats}
              onStartPractice={(dummy) => handleSelectLesson(dummy, true)}
              onClearMistakes={handleClearMistakesQueue}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView userStats={stats} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userStats={stats}
              onUpdateStats={saveStats}
              onUpdateSettings={handleUpdateSettings}
              onResetApp={handleResetApp}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView
              userStats={stats}
              onUpdateStats={saveStats}
            />
          )}
        </div>

        {/* 3. Mobile sticky bottom tab navigation */}
        <nav className="md:hidden bg-white border-t border-gray-150 fixed bottom-0 left-0 right-0 py-2 px-6 flex justify-between items-center z-40 shadow-lg">
          <button
            id="mobile-path-tab"
            onClick={() => handleTabChange('path')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'path' ? 'text-[#FF6B6B]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-bold">Path</span>
          </button>

          <button
            id="mobile-practice-tab"
            onClick={() => handleTabChange('practice')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'practice' ? 'text-[#FF6B6B]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Dumbbell className="w-6 h-6" />
            <span className="text-[10px] font-bold">Practice</span>
          </button>

          <button
            id="mobile-leaderboard-tab"
            onClick={() => handleTabChange('leaderboard')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'leaderboard' ? 'text-[#FF6B6B]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] font-bold">Leagues</span>
          </button>

          <button
            id="mobile-shop-tab"
            onClick={() => handleTabChange('shop')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'shop' ? 'text-[#FF6B6B]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-bold">Shop</span>
          </button>

          <button
            id="mobile-profile-tab"
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              activeTab === 'profile' ? 'text-[#FF6B6B]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>
      </main>

      {/* 4. Overlay stage for active lessons (Modal format) */}
      <AnimatePresence>
        {activeLesson && (
          <LessonOverlay
            lesson={activeLesson.lesson}
            userStats={stats}
            isReviewMode={activeLesson.isReview}
            onClose={() => {
              sound.playClick();
              setActiveLesson(null);
            }}
            onFinishLesson={handleFinishLesson}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
