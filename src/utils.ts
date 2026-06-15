/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserStats, LeaderboardPlayer, BaseExercise } from './types';

// Browser-based Text to Speech with optimized settings for language learning
export function speakText(text: string, enabled: boolean) {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel(); // Stop playing overlapping sentences
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Clean, slightly deliberate pace for foreigners
      utterance.pitch = 1.0;

      // Select high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const americanVoice = voices.find(
        v => v.lang.startsWith('en-US') && (v.name.includes('Google') || v.name.includes('Natural'))
      ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));

      if (americanVoice) {
        utterance.voice = americanVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }
}

// Convert XP to Level in a progressive bracket:
// Level 1: 0 - 99 XP
// Level 2: 100 - 249 XP (needs +150)
// Level 3: 250 - 449 XP (needs +200)
// Level 4: 450 - 699 XP (needs +250)
// Level 5: 700 - 999 XP (needs +300)
// For Level L: XP needed = 50 * L * (L + 1)
export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (true) {
    const nextLevelThreshold = getXPNeededForLevel(level + 1);
    if (xp >= nextLevelThreshold) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

export function getXPNeededForLevel(level: number): number {
  if (level <= 1) return 0;
  // Level 2: 100 XP
  // Level 3: 250 XP
  // Level 4: 450 XP
  // Level 5: 700 XP
  // Level 6: 1000 XP
  return 50 * (level - 1) * (level + 2);
}

// Mock Bot Usernames (Indian first names without trailing surnames or "bot" labels)
export const BOT_NAMES = [
  'Aarav',
  'Ananya',
  'Vihaan',
  'Ishita',
  'Arjun',
  'Diya',
  'Kabir',
  'Sneha',
  'Rohan',
  'Aditya'
];

const PRESET_AVATAR_IDS = ['owl', 'fox', 'panda', 'lion', 'koala', 'dino', 'unicorn', 'cat', 'puppy', 'frog'];

// Generate an array of bot players for the league
export function generateInitialBots(userDisplayName: string): LeaderboardPlayer[] {
  const players: LeaderboardPlayer[] = BOT_NAMES.map((name, idx) => ({
    id: `bot_${idx}`,
    name,
    xp: Math.floor(Math.random() * 80) + 10, // starts with some initial XP
    isBot: true,
    streak: Math.floor(Math.random() * 8) + 1,
    avatarSeed: idx + 1,
    avatarId: PRESET_AVATAR_IDS[idx % PRESET_AVATAR_IDS.length]
  }));

  return players;
}

// Calculate the start of the week (Monday) to detect resets
export function getMondayTimestamp(): number {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

// Single key constant for local storage configuration
export const STORAGE_KEY = 'lingo_free_app_state_v1';

// Generate default clean user profile structure
export function createDefaultState(displayName: string, dailyGoalXP: number): UserStats {
  const initTimestamp = getMondayTimestamp();
  const bots = generateInitialBots(displayName);

  return {
    displayName,
    avatarId: 'owl',
    dailyGoalXP,
    currentXP: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    activityLog: {},
    unlockedUnitIndex: 0,
    unlockedLessonIndex: 0,
    completedLessons: {},
    mistakesQueue: [], // blank queue
    lingocoins: 150, // Sweet starting coin reserve!
    streakFreezes: 0,
    activeWager: false,
    activeTitle: 'Starter Student',
    unlockedTitles: ['Starter Student'],
    settings: {
      soundEffectsEnabled: true,
      textToSpeechEnabled: true,
      darkModeEnabled: false
    },
    leagueId: 0, // start at Bronze League (0)
    leagueResetTimestamp: initTimestamp + 7 * 24 * 60 * 60 * 1000, // +1 week
    leagueUsers: bots
  };
}

// Award calendar day XP to bots (20 to 60 XP per calendar day elapsed)
export function awardDailyBotXp(stats: UserStats): UserStats {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = stats.lastBotXpAwardDate || stats.lastActiveDate;

  if (!lastDate) {
    // First time initializing this daily tracker, set it to today and do not award yet
    return {
      ...stats,
      lastBotXpAwardDate: todayStr
    };
  }

  if (lastDate === todayStr) {
    // Already awarded for today
    return stats;
  }

  // Calculate the number of calendar days elapsed
  const lastD = new Date(lastDate);
  const todayD = new Date(todayStr);
  const diffMs = todayD.getTime() - lastD.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays >= 1) {
    const updatedUsers = stats.leagueUsers.map(u => {
      if (!u.isBot) return u;
      
      let additionalXP = 0;
      for (let i = 0; i < diffDays; i++) {
        additionalXP += Math.floor(Math.random() * (60 - 20 + 1)) + 20; // 20 to 60 XP per calendar day
      }

      return {
        ...u,
        xp: u.xp + additionalXP
      };
    });

    updatedUsers.sort((a, b) => b.xp - a.xp);

    return {
      ...stats,
      lastBotXpAwardDate: todayStr,
      leagueUsers: updatedUsers
    };
  }

  return stats;
}

// Simulate hourly progress of bots to make the league look super dynamic!
export function simulateBotProgress(stats: UserStats): UserStats {
  // First, apply calendar day bot XP check
  const statsWithDailyBotXp = awardDailyBotXp(stats);

  // Then apply the standard small hourly/random increments
  const updatedUsers = statsWithDailyBotXp.leagueUsers.map(u => {
    if (!u.isBot) return u;
    // 60% chance to gain 5-15 XP
    if (Math.random() > 0.4) {
      return {
        ...u,
        xp: u.xp + Math.floor(Math.random() * 15) + 3
      };
    }
    return u;
  });

  // Sort by XP descending
  updatedUsers.sort((a, b) => b.xp - a.xp);

  return {
    ...statsWithDailyBotXp,
    leagueUsers: updatedUsers
  };
}

// Check and perform league resets if timestamp has elapsed
export function checkLeagueReset(stats: UserStats): UserStats {
  const now = Date.now();
  if (now >= stats.leagueResetTimestamp) {
    // Determine user status
    const sortedUsers = [...stats.leagueUsers].sort((a, b) => b.xp - a.xp);
    const userIndex = sortedUsers.findIndex(u => !u.isBot);

    // If in top 3, promote league index. If bottom 2 (and leagueId > 0), demote.
    let nextLeagueId = stats.leagueId;
    if (userIndex <= 2 && stats.leagueId < 5) {
      nextLeagueId = stats.leagueId + 1;
    } else if (userIndex >= sortedUsers.length - 2 && stats.leagueId > 0) {
      nextLeagueId = stats.leagueId - 1;
    }

    const nextResetTimestamp = getMondayTimestamp() + 7 * 24 * 60 * 60 * 1000;
    // Generate fresh bots with slightly higher baseline XP matching higher leagues
    const baselineBotXP = nextLeagueId * 150;
    const nextBots = BOT_NAMES.map((name, idx) => ({
      id: `bot_${idx}`,
      name,
      xp: baselineBotXP + Math.floor(Math.random() * 120) + 15,
      isBot: true,
      streak: Math.floor(Math.random() * 12) + 1,
      avatarSeed: Math.floor(Math.random() * 100),
      avatarId: PRESET_AVATAR_IDS[idx % PRESET_AVATAR_IDS.length]
    }));

    // Inject user with reset sub-XP
    const freshLeagueList = [
      ...nextBots,
      {
        id: 'user_player',
        name: stats.displayName,
        xp: 0, // Reset weekly counter
        isBot: false,
        streak: stats.streak,
        avatarSeed: 0
      }
    ].sort((a, b) => b.xp - a.xp);

    return {
      ...stats,
      leagueId: nextLeagueId,
      leagueResetTimestamp: nextResetTimestamp,
      leagueUsers: freshLeagueList
    };
  }
  return stats;
}
