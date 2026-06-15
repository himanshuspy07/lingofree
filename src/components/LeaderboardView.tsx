/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Shield, HelpCircle, Swords, Award, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { UserStats } from '../types';
import { LEAGUE_NAMES } from '../data';
import { getAvatarById } from '../avatarPresets';

interface LeaderboardViewProps {
  userStats: UserStats;
}

// Map league indexes to decorative colors and icons
const LEAGUE_THEMES: Record<number, { bg: string; border: string; text: string; label: string }> = {
  0: { bg: 'from-amber-600 to-amber-800', border: 'border-amber-750', text: 'text-amber-600', label: 'Bronze League' },
  1: { bg: 'from-slate-300 to-slate-400', border: 'border-slate-350', text: 'text-slate-600', label: 'Silver League' },
  2: { bg: 'from-yellow-400 to-yellow-650', border: 'border-yellow-550', text: 'text-yellow-600', label: 'Gold League' },
  3: { bg: 'from-[#4ECDC4] to-cyan-500', border: 'border-cyan-450', text: 'text-cyan-600', label: 'Sapphire League' },
  4: { bg: 'from-[#FF6B6B] to-rose-600', border: 'border-rose-550', text: 'text-[#FF6B6B]', label: 'Ruby League' },
  5: { bg: 'from-blue-600 to-indigo-600', border: 'border-blue-650', text: 'text-indigo-600', label: 'Diamond League' }
};

export default function LeaderboardView({ userStats }: LeaderboardViewProps) {
  const currentLevelTheme = LEAGUE_THEMES[userStats.leagueId] || LEAGUE_THEMES[0];
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = userStats.leagueResetTimestamp - Date.now();
      if (difference <= 0) {
        setTimeLeft('Restructuring league...');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [userStats.leagueResetTimestamp]);

  // Combine bot and user state and generate sorted list
  const userScoreInLeague = userStats.leagueUsers.find(p => !p.isBot)?.xp || 0;
  
  // Sort list descendengly
  const sortedPlayers = [...userStats.leagueUsers].sort((a, b) => b.xp - a.xp);
  const userRankIdx = sortedPlayers.findIndex(p => !p.isBot);

  // Generate background color for specific rankings
  const getRankBadgeStyles = (index: number) => {
    if (index === 0) return 'bg-yellow-400 text-white';
    if (index === 1) return 'bg-slate-300 text-[#2C3E50]';
    if (index === 2) return 'bg-amber-600 text-white';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-24 pt-4">
      {/* Immersive League Header */}
      <div className={`bg-gradient-to-tr ${currentLevelTheme.bg} text-white rounded-3xl p-6 shadow-md mb-6 relative overflow-hidden`}>
        <div className="absolute right-[-24px] top-[-24px] opacity-10">
          <Shield className="w-48 h-48" />
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[#FFF0F0]">
              Weekly League Competitors
            </span>
            <h2 className="text-3xl font-black font-heading mt-2">
              {currentLevelTheme.label}
            </h2>
          </div>
          
          <div className="bg-black/15 text-white/95 text-xs px-3 py-2 rounded-2xl border border-white/20 text-right backdrop-blur-sm">
            <p className="font-semibold uppercase tracking-wider text-[10px] text-gray-200">Reset In</p>
            <p className="font-extrabold text-sm tabular-nums mt-0.5">{timeLeft}</p>
          </div>
        </div>

        <p className="text-xs text-white/90 mt-4 max-w-sm italic">
          Earn XP by doing lessons to climb divisions. The **Top 3 players** promote to the next league every Monday!
        </p>
      </div>

      {/* Promotion Zone Notification Alert */}
      {userRankIdx <= 2 ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mb-6 flex items-center gap-3">
          <Award className="w-6 h-6 text-green-600 shrink-0" />
          <div className="text-xs font-semibold">
            <span className="font-bold block">Promotion Position!</span>
            You are currently ranked #{userRankIdx + 1}. Hang on to promote to the next tier!
          </div>
        </div>
      ) : userRankIdx >= sortedPlayers.length - 2 && userStats.leagueId > 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div className="text-xs font-semibold justify-center">
            <span className="font-bold block">Danger Zone!</span>
            You are in danger of being demoted. Do some lessons or practice mistakes to regain safety!
          </div>
        </div>
      ) : (
        <div className="bg-[#4ECDC4]/5 border border-[#4ECDC4]/20 text-cyan-800 p-4 rounded-2xl mb-6 flex items-center gap-3">
          <Swords className="w-6 h-6 text-[#4ECDC4] shrink-0" />
          <div className="text-xs font-semibold">
            <span className="font-bold block">Safety Zone</span>
            You are currently ranked #{userRankIdx + 1}. Climb {userRankIdx - 2} more spot(s) to enter the top-tier Promotion zone.
          </div>
        </div>
      )}

      {/* Competitors List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-150 overflow-hidden divide-y divide-gray-100">
        <div className="p-4 bg-gray-50/50 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>Learner</span>
          <span>Weekly XP</span>
        </div>

        {sortedPlayers.map((player, pIdx) => {
          const isUser = !player.isBot;
          
          return (
            <div
              key={player.id}
              className={`p-4 flex items-center justify-between transition-all ${
                isUser ? 'bg-[#4ECDC4]/10 font-bold border-l-4 border-l-[#4ECDC4]' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {/* Left Segment: Rankings & Profiles */}
              <div className="flex items-center gap-3.5">
                {/* Score Index Ball */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold tabular-nums ${getRankBadgeStyles(pIdx)}`}>
                  {pIdx + 1}
                </div>

                {/* Avatar Ball */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold relative shadow-sm border border-black/10 ${
                    isUser
                      ? `bg-gradient-to-tr ${getAvatarById(userStats.avatarId).bgGradient} text-xl shadow-inner`
                      : player.avatarId
                      ? `bg-gradient-to-tr ${getAvatarById(player.avatarId).bgGradient} text-xl shadow-inner`
                      : ''
                  }`}
                  style={(!isUser && !player.avatarId) ? {
                    backgroundColor: `hsl(${(player.avatarSeed * 37) % 360}, 65%, 50%)`
                  } : undefined}
                >
                  {isUser
                    ? getAvatarById(userStats.avatarId).emoji
                    : player.avatarId
                    ? getAvatarById(player.avatarId).emoji
                    : player.name.substring(0, 1)}
                  {/* Small gold crown for ranked #1 */}
                  {pIdx === 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 p-0.5 rounded-full border border-white">
                      <Trophy className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Name & Streak Display */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm ${isUser ? 'text-[#2C3E50] font-black' : 'text-gray-700 font-semibold'}`}>
                      {player.name}
                    </p>
                    {isUser && (
                      <span className="bg-[#4ECDC4] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 leading-none mt-0.5">
                    🔥 {player.streak} day streak {isUser && userStats.activeTitle && userStats.activeTitle !== 'Starter Student' && `• 🎓 ${userStats.activeTitle}`}
                  </p>
                </div>
              </div>

              {/* Right Segment: Scores */}
              <div className="text-right flex items-center gap-1">
                <span className={`text-base font-black tracking-tight ${isUser ? 'text-[#4ECDC4]' : 'text-[#2C3E50]'}`}>
                  {player.xp}
                </span>
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
