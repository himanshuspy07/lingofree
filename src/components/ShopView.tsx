/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Shield, Flame, Sparkles, Award, Check, Coins, Ticket, Dice1 } from 'lucide-react';
import { UserStats } from '../types';
import { sound } from '../sound';

interface ShopViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  badge?: string;
  bgGradient: string;
}

export default function ShopView({ userStats, onUpdateStats }: ShopViewProps) {
  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);

  // Trigger quick temporary status banner
  const showNotification = (message: string, isError: boolean = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // 1. Buy Streak Freeze helper
  const buyStreakFreeze = () => {
    sound.playClick();
    const currentFreezes = userStats.streakFreezes ?? 0;
    const price = 150;

    if (currentFreezes >= 2) {
      showNotification('You already have the maximum of 2 Streak Freezes active!', true);
      return;
    }

    if (userStats.lingocoins < price) {
      showNotification('Insufficient LingoCoins! Complete more lessons to earn coins.', true);
      return;
    }

    const nextStats: UserStats = {
      ...userStats,
      lingocoins: userStats.lingocoins - price,
      streakFreezes: currentFreezes + 1
    };
    onUpdateStats(nextStats);
    showNotification('🛡️ Streak Freeze purchased successfully! Your streak is protected.');
  };

  // 2. Double or Nothing wager helper
  const buyWager = () => {
    sound.playClick();
    const price = 50;

    if (userStats.activeWager) {
      showNotification('You already have an active Double or Nothing wager running!', true);
      return;
    }

    if (userStats.lingocoins < price) {
      showNotification('Insufficient LingoCoins!', true);
      return;
    }

    const nextStats: UserStats = {
      ...userStats,
      lingocoins: userStats.lingocoins - price,
      activeWager: true
    };
    onUpdateStats(nextStats);
    showNotification('🎲 Wager Placed! Reach a 7-day streak to claim your 100 LingoCoins payout.');
  };

  // 3. Golden Booster helper (+30 XP boost)
  const buyGoldenTicket = () => {
    sound.playClick();
    const price = 100;

    if (userStats.lingocoins < price) {
      showNotification('Insufficient LingoCoins!', true);
      return;
    }

    const priceSubtractedCoins = userStats.lingocoins - price;
    const nextXP = userStats.currentXP + 30;

    // Check level-up from the XP helper calculation (progressive bracket)
    const getLevelFromXP = (xp: number): number => {
      let level = 1;
      while (true) {
        const threshold = 50 * (level) * (level + 3); // match level formula
        if (xp >= threshold) {
          level++;
        } else {
          break;
        }
      }
      return level;
    };
    const nextLevel = getLevelFromXP(nextXP);

    // Update in-league player scorecard XP as well to remain synchronized
    const updatedWeeklyLeagueUsers = userStats.leagueUsers.map(u => {
      if (!u.isBot) {
        return { ...u, xp: u.xp + 30 };
      }
      return u;
    });

    const nextStats: UserStats = {
      ...userStats,
      lingocoins: priceSubtractedCoins,
      currentXP: nextXP,
      level: nextLevel,
      leagueUsers: updatedWeeklyLeagueUsers
    };
    onUpdateStats(nextStats);
    showNotification('🎫 XP Boost Claimed! You instantly gained +30 XP!');
  };

  // Academic Prestige Titles definition
  const PREMIUM_TITLES = [
    { title: '🇬🇧 Grammar Ambassador', price: 100, color: 'text-sky-600 bg-sky-50' },
    { title: '🚀 Vocab Rocket', price: 150, color: 'text-amber-600 bg-amber-50' },
    { title: '👑 Fluency Royalty', price: 200, color: 'text-purple-600 bg-purple-50' },
    { title: '⚡ Oxford Legend', price: 250, color: 'text-[#FF6B6B] bg-[#FF6B6B]/10' },
    { title: '🧠 Polyglot Master', price: 300, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const handleTitleAction = (titleText: string, price: number) => {
    sound.playClick();
    const unlocked = userStats.unlockedTitles ?? ['Starter Student'];
    const isUnlocked = unlocked.includes(titleText);

    if (isUnlocked) {
      // Toggle Equipping
      const nextStats: UserStats = {
        ...userStats,
        activeTitle: userStats.activeTitle === titleText ? 'Starter Student' : titleText
      };
      onUpdateStats(nextStats);
      showNotification(
        userStats.activeTitle === titleText 
          ? 'Default title equipped.' 
          : `Equipped your prestigious title: "${titleText}"!`
      );
    } else {
      // Purchase Flow
      if (userStats.lingocoins < price) {
        showNotification('Insufficient LingoCoins for this premium title!', true);
        return;
      }

      const nextStats: UserStats = {
        ...userStats,
        lingocoins: userStats.lingocoins - price,
        unlockedTitles: [...unlocked, titleText],
        activeTitle: titleText // Auto-equip on purchase!
      };
      onUpdateStats(nextStats);
      showNotification(`🎉 Congratulations! Unlocked & equipped: "${titleText}"`);
    }
  };

  const streakFreezesQuantity = userStats.streakFreezes ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8" id="shop-view-screen">
      
      {/* Dynamic Pop notification banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 border font-heading font-bold text-sm ${
              notification.isError
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span className="text-xl">{notification.isError ? '⚠️' : '🎉'}</span>
            <p className="flex-grow leading-tight">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Summary HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-3xl p-6 border border-gray-150 shadow-xs mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100/50 text-amber-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              LingoFree Store
            </span>
            <span className="text-gray-400 text-xs font-semibold">
              Spend Coins &amp; Power Up
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2C3E50] font-heading tracking-tight leading-tight">
            Academy Market
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Keep your streak protected and unlock titles to outrank friends!
          </p>
        </div>

        {/* Dynamic Balance Counter Box */}
        <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-inner shrink-0 w-full sm:w-auto">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-[10px] text-amber-600 uppercase tracking-widest leading-none">Your Balance</p>
            <p className="text-2xl font-black text-amber-950 mt-1 tabular-nums">{userStats.lingocoins ?? 0} <span className="text-xs text-amber-600 font-bold">LingoCoins</span></p>
          </div>
        </div>
      </div>

      {/* Grid of Main Utility PowerUps */}
      <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4 font-heading flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-[#FF6B6B]" /> Power-Up Utilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Item 1: Streak Freeze */}
        <div className="bg-white border-2 border-gray-150 rounded-3xl p-5 flex flex-col justify-between hover:border-sky-300 transition-all shadow-xs relative group overflow-hidden">
          {/* Badge indicator */}
          <div className="absolute top-3 right-3 bg-sky-100 text-sky-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
            Shield Item
          </div>

          <div className="pt-2">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2C3E50] font-heading">
              Streak Freeze
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Active Inventory: <span className="text-sky-600 font-black tabular-nums">{streakFreezesQuantity} / 2</span>
            </p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-3">
              Automatically keeps your daily streak intact if you miss a whole day of practice. Restores automatically.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">🪙 150 Coins</p>
            </div>
            <button
              onClick={buyStreakFreeze}
              disabled={streakFreezesQuantity >= 2}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs font-heading uppercase tracking-wider transition-all select-none cursor-pointer ${
                streakFreezesQuantity >= 2
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-sky-500 active:bg-sky-600 text-white hover:shadow-md'
              }`}
            >
              {streakFreezesQuantity >= 2 ? 'Max Active' : 'Purchase'}
            </button>
          </div>
        </div>

        {/* Item 2: Double or Nothing Streak Wager */}
        <div className="bg-white border-2 border-gray-150 rounded-3xl p-5 flex flex-col justify-between hover:border-rose-300 transition-all shadow-xs relative group overflow-hidden">
          <div className="absolute top-3 right-3 bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
            Double Or None
          </div>

          <div className="pt-2">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-[#FF6B6B] mb-4 group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-lg font-black text-[#2C3E50] font-heading">
              Double or Nothing
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Status: <span className={userStats.activeWager ? 'text-emerald-500 font-black' : 'text-gray-400 font-bold'}>{userStats.activeWager ? '🔥 WAGER ACTIVE' : 'Inactive'}</span>
            </p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-3">
              Bet 50 LingoCoins to win 100 LingoCoins! Rewarded automatically the instant you hit a 7-day daily active streak.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">🪙 50 Coins</p>
            </div>
            <button
              onClick={buyWager}
              disabled={userStats.activeWager}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs font-heading uppercase tracking-wider transition-all select-none cursor-pointer ${
                userStats.activeWager
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#FF6B6B] active:bg-[#FF6B6B]/90 text-white hover:shadow-md'
              }`}
            >
              {userStats.activeWager ? 'Bet Active' : 'Place Wager'}
            </button>
          </div>
        </div>

        {/* Item 3: Golden Booster Ticket (+30 XP Boost) */}
        <div className="bg-white border-2 border-gray-150 rounded-3xl p-5 flex flex-col justify-between hover:border-amber-300 transition-all shadow-xs relative group overflow-hidden">
          <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
            Instant Rank-Up
          </div>

          <div className="pt-2">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-[#2C3E50] font-heading">
              Golden XP Booster
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Reward: <span className="text-amber-600 font-black">+30 XP instantly</span>
            </p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-3">
              Gain 30 XP points instantly to surge ahead in the Simulated Leagues and accelerate through level thresholds!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">🪙 100 Coins</p>
            </div>
            <button
              onClick={buyGoldenTicket}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs font-heading uppercase tracking-wider transition-all select-none cursor-pointer hover:shadow-md"
            >
              Use Ticket
            </button>
          </div>
        </div>

      </div>

      {/* Section 2: Academic Prestige Titles Vault */}
      <div className="bg-slate-50 border border-gray-150 rounded-3xl p-6 shadow-xs">
        <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-1 font-heading flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-500" /> Academic prestige Titles
        </h2>
        <p className="text-gray-400 text-xs mb-6">
          Title badges appear next to your avatar in simulated brackets and on your main student stats card!
        </p>

        <div className="space-y-4">
          {PREMIUM_TITLES.map((t) => {
            const unlockedList = userStats.unlockedTitles ?? ['Starter Student'];
            const isUnlocked = unlockedList.includes(t.title);
            const isEquipped = userStats.activeTitle === t.title;

            return (
              <div
                key={t.title}
                className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#FF6B6B]/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-lg shrink-0 ${t.color}`}>
                    🎓
                  </div>
                  <div>
                    <span className="font-heading font-black text-slate-700 text-sm sm:text-base">
                      {t.title}
                    </span>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">
                      {isUnlocked ? (
                        <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Unlocked &amp; Owned
                        </span>
                      ) : (
                        `Show off this premium badge on the public boards. Premium upgrade.`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  {!isUnlocked && (
                    <div className="text-left sm:text-right pr-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Price</p>
                      <p className="text-xs font-black text-amber-600 mt-1">🪙 {t.price} Coins</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleTitleAction(t.title, t.price)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer font-heading select-none ${
                      isEquipped
                        ? 'bg-emerald-500 active:bg-emerald-600 text-white shadow-sm'
                        : isUnlocked
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 font-black'
                        : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                    }`}
                  >
                    {isEquipped ? 'Equipped ✓' : isUnlocked ? 'Equip Badge' : 'Unlock Title'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
