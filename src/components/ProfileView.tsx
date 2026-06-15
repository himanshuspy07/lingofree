/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Trophy, RefreshCw, Volume2, Gamepad2, Settings2, UserCheck, Shield, Edit2, Moon } from 'lucide-react';
import { UserStats } from '../types';
import { getXPNeededForLevel, getLevelFromXP } from '../utils';
import { sound } from '../sound';
import AchievementsSection from './AchievementsSection';
import { AVATAR_PRESETS, getAvatarById } from '../avatarPresets';

interface ProfileViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onUpdateSettings: (updater: (prev: UserStats['settings']) => UserStats['settings']) => void;
  onResetApp: () => void;
}

export default function ProfileView({
  userStats,
  onUpdateStats,
  onUpdateSettings,
  onResetApp,
}: ProfileViewProps) {
  // Modal toggle state variables
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userStats.displayName);
  const [selectedAvatarId, setSelectedAvatarId] = useState(userStats.avatarId || 'owl');

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetInput, setResetInput] = useState('');

  // Get current date string for "YYYY-MM-DD" matching
  const getTodayDateString = (): string => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1050);
    return local.toISOString().split('T')[0];
  };

  const todayKey = getTodayDateString();
  const todayXP = userStats.activityLog[todayKey] || 0;
  const todayGoalRate = Math.min(100, Math.round((todayXP / userStats.dailyGoalXP) * 100));

  // XP Progress towards next level
  const currentXP = userStats.currentXP;
  const currentLevel = userStats.level;
  const thisLevelThreshold = getXPNeededForLevel(currentLevel);
  const nextLevelThreshold = getXPNeededForLevel(currentLevel + 1);
  const levelXPVolume = nextLevelThreshold - thisLevelThreshold;
  const levelXPProgress = Math.max(0, currentXP - thisLevelThreshold);
  const levelProgressPercent = Math.min(100, Math.round((levelXPProgress / levelXPVolume) * 100));

  const handleToggleSoundEffects = () => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      soundEffectsEnabled: !prev.soundEffectsEnabled,
    }));
  };

  const handleToggleTTS = () => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      textToSpeechEnabled: !prev.textToSpeechEnabled,
    }));
  };

  const handleToggleDarkMode = () => {
    sound.playClick();
    onUpdateSettings((prev) => ({
      ...prev,
      darkModeEnabled: !prev.darkModeEnabled,
    }));
  };

  // Open modern reset confirmation popup modal
  const handleTriggerResetClick = () => {
    sound.playClick();
    setResetInput('');
    setIsConfirmingReset(true);
  };

  // Handle saving the user profile
  const handleSaveProfile = () => {
    sound.playClick();
    const trimmed = editName.trim();
    if (!trimmed) return;

    // Synchronize display-name inside leaderboard league player lists as well
    const updatedLeagueUsers = userStats.leagueUsers.map((u) => {
      if (!u.isBot) {
        return { ...u, name: trimmed };
      }
      return u;
    });

    onUpdateStats({
      ...userStats,
      displayName: trimmed,
      avatarId: selectedAvatarId,
      leagueUsers: updatedLeagueUsers,
    });

    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-26 pt-4" id="profile-view-screen">
      
      {/* Profile Core Header */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${getAvatarById(userStats.avatarId).bgGradient} text-white flex items-center justify-center font-black text-4xl shadow-md border border-gray-100 shrink-0 relative group`}>
            {getAvatarById(userStats.avatarId).emoji}
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h2 className="text-2xl font-black font-heading text-[#2C3E50]">
                {userStats.displayName}
              </h2>
              <Shield className="w-5 h-5 text-[#4ECDC4] fill-[#4ECDC4]/10 hidden sm:block" />
            </div>
            <p className="text-xs text-[#FF6B6B] font-extrabold tracking-wide uppercase mt-1">
              🎓 {userStats.activeTitle || 'Starter Student'}
            </p>
            <div className="flex items-center gap-1.5 mt-2 bg-gray-100 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active learning status</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setEditName(userStats.displayName);
            setSelectedAvatarId(userStats.avatarId || 'owl');
            setIsEditingProfile(true);
          }}
          className="px-4 py-2.5 rounded-2xl border border-gray-150 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all cursor-pointer flex items-center gap-2 font-heading font-extrabold text-xs uppercase tracking-wider shrink-0 w-full sm:w-auto justify-center"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit Profile
        </button>
      </div>

      {/* Level Tier Progress Tracker */}
      <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-bold text-gray-700">Level {currentLevel} Scholar</p>
          <p className="text-xs text-gray-500 font-semibold">
            {currentXP} / {nextLevelThreshold} total XP
          </p>
        </div>

        {/* Level bar slider */}
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden relative">
          <div
            className="bg-gradient-to-r from-[#4ECDC4] to-[#FF6B6B] h-full rounded-full transition-all duration-505"
            style={{ width: `${levelProgressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">
          <span>Level {currentLevel} ({thisLevelThreshold} XP)</span>
          <span>{nextLevelThreshold - currentXP} XP to Level {currentLevel + 1}</span>
        </div>
      </div>

      {/* Bento Stats Block */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Performance Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        {/* Stat card 1: Streak */}
        <div className="bg-[#FF6B6B]/5 rounded-2xl border border-[#FF6B6B]/15 p-4 flex flex-col justify-start">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]/10 text-[#FF6B6B] flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Current Streak</span>
          <span className="text-xl sm:text-2xl font-black text-[#2C3E50] mt-1 pr-1">{userStats.streak} Days</span>
        </div>

        {/* Stat card 2: Goal progress stats */}
        <div className="bg-[#4ECDC4]/5 rounded-2xl border border-[#4ECDC4]/15 p-4 flex flex-col justify-start">
          <div className="w-8 h-8 rounded-lg bg-[#4ECDC4]/10 text-[#4ECDC4] flex items-center justify-center mb-3">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Today Goal</span>
          <span className="text-xl sm:text-2xl font-black text-[#2C3E50] mt-1">{todayGoalRate}%</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wide">
            ({todayXP}/{userStats.dailyGoalXP} XP)
          </span>
        </div>

        {/* Stat card 3: LingoCoins Balance */}
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/45 p-4 flex flex-col justify-start">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm mb-3">
            🪙
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">LingoCoins</span>
          <span className="text-xl sm:text-2xl font-black text-amber-800 mt-1">{userStats.lingocoins ?? 0}</span>
          <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide mt-1">
            {userStats.activeWager ? '🎲 Wager Active' : 'Store Balance'}
          </span>
        </div>
      </div>

      {/* Achievements Section */}
      <AchievementsSection userStats={userStats} />

      {/* Application Control Toggles */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Preferences & Accessibility</h3>
      <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden divide-y divide-gray-100 mb-6">
        
        {/* Toggle 1: Sound Effects */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Programmatic Sound Effects</p>
              <p className="text-xs text-gray-500">Audio feedback notes on validation</p>
            </div>
          </div>
          
          <button
            id="toggle-sound-effects-btn"
            onClick={handleToggleSoundEffects}
            className={`w-14 h-8 rounded-full p-1 transition-all ${
              userStats.settings.soundEffectsEnabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${
              userStats.settings.soundEffectsEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Toggle 2: TTS speech feedback */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Dynamic Text-to-Speech</p>
              <p className="text-xs text-gray-500">Enables SpeechSynthesis audio prompts</p>
            </div>
          </div>
          
          <button
            id="toggle-tts-btn"
            onClick={handleToggleTTS}
            className={`w-14 h-8 rounded-full p-1 transition-all ${
              userStats.settings.textToSpeechEnabled ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${
              userStats.settings.textToSpeechEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Toggle 3: Dark Mode setting */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Midnight Dark Mode</p>
              <p className="text-xs text-gray-500">Enable deep navy background for night study</p>
            </div>
          </div>
          
          <button
            id="toggle-dark-mode-btn"
            onClick={handleToggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-all ${
              userStats.settings.darkModeEnabled ? 'bg-indigo-500' : 'bg-gray-200'
            }`}
          >
            <div className={`bg-white w-6 h-6 rounded-full shadow-sm transition-transform ${
              userStats.settings.darkModeEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Danger Zone Controls */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3 px-1">Settings & Hazard Zones</h3>
      <div className="bg-red-50/50 rounded-3xl border border-red-200 p-6">
        <h4 className="text-sm font-bold text-[#2C3E50] font-heading">Reset Educational Account Data</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Wipes profiles, caches, active levels, daily streaks, coin balances, and leaderboard metrics. All settings revert to defaults.
        </p>
        <button
          id="hard-reset-app-btn"
          onClick={handleTriggerResetClick}
          className="mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Wipe & Reset App
        </button>
      </div>

      {/* ----------------- MODAL 1: EDIT PROFILE OVERLAY ----------------- */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-150 shadow-2xl relative space-y-6"
            >
              <div>
                <h3 className="text-xl font-extrabold text-[#2C3E50] font-heading">
                  Edit Personal Profile
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Customize your learning public handle and select a cute mascot.
                </p>
              </div>

              {/* Display name field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                  Display Username
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={16}
                  placeholder="Anonymous Student"
                  className="w-full px-4 py-3 font-heading font-black text-slate-700 bg-gray-50 border-2 border-gray-150 rounded-2xl focus:border-[#4ECDC4] outline-none transition-all text-sm"
                />
              </div>

              {/* Mascot Selection Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                  Choose Pre-uploaded Avatar Mascot
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatarId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedAvatarId(preset.id);
                        }}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border-2 transition-all p-1 ${
                          isSelected
                            ? 'border-[#4ECDC4] bg-emerald-50/10 scale-102 shadow-xs'
                            : 'border-transparent hover:border-gray-200 bg-gray-50/70 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr ${preset.bgGradient} flex items-center justify-center text-lg sm:text-2xl shadow-inner border border-black/5`}>
                          {preset.emoji}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-500 mt-1 truncate max-w-full">
                          {preset.label.split(' ')[1] || preset.label}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black border border-white">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsEditingProfile(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-700 font-extrabold text-xs uppercase tracking-wider font-heading transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!editName.trim()}
                  className="flex-1 py-3 py-2.5 rounded-xl bg-[#4ECDC4] hover:bg-[#4ECDC4]/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-xs uppercase tracking-wider font-heading transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL 2: RESET SECURITY OVERLAY ----------------- */}
      <AnimatePresence>
        {isConfirmingReset && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-150 shadow-2xl relative space-y-4"
            >
              <div>
                <h3 className="text-xl font-extrabold text-red-650 font-heading">
                  Irreversible Reset Guard
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  You are about to completely wipe all statistics, current progress, milestones, streaks, active items, and balances. This action is irreversible.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 font-bold">
                  To acknowledge and confirm, type exact verification phrase:
                </p>
                <div className="bg-rose-50 border border-rose-200 text-rose-800 py-2 px-3 rounded-xl text-center text-xs font-black tracking-wide select-all">
                  Clear My Data
                </div>
                <input
                  type="text"
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder="Type 'Clear My Data' here..."
                  className="w-full px-4 py-3 font-heading font-bold text-slate-800 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-red-400 outline-none transition-all text-sm text-center focus:ring-0"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsConfirmingReset(false);
                    setResetInput('');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-slate-750 font-extrabold text-xs uppercase tracking-wider font-heading transition-all cursor-pointer"
                >
                  Keep My Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (resetInput === 'Clear My Data') {
                      sound.playClick();
                      setIsConfirmingReset(false);
                      onResetApp();
                    }
                  }}
                  disabled={resetInput !== 'Clear My Data'}
                  className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider font-heading transition-all cursor-pointer ${
                    resetInput === 'Clear My Data'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md active:bg-rose-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-150'
                  }`}
                >
                  Delete Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
