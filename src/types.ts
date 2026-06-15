/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Exercise Types corresponding to requested features
export type ExerciseType =
  | 'meaning-selection'
  | 'fill-in-the-blank'
  | 'sentence-scramble'
  | 'listening-comprehension'
  | 'dictation';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  prompt: string;         // The word, phrase, sentence or request
  audioText?: string;     // The exact text the speech synthesis should read out
  correctAnswer: string;  // Correct answer string (exact word, or assembled sentence, or definition index/string)
  options?: string[];     // Multi-choice options (used for meaning selection, fill-in-the-blank, listening choice)
  hint?: string;          // Helpful context/translation or grammatical hint
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  xpReward: number;
  exercises: BaseExercise[];
  rule?: {
    concept: string;
    howToDo: string;
    example: string;
  };
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface UserStats {
  displayName: string;
  avatarId?: string;
  dailyGoalXP: number;
  currentXP: number;
  level: number;
  streak: number;
  lastActiveDate: string | null; // Keep track of dates (e.g. "YYYY-MM-DD")
  lastBotXpAwardDate?: string; // Keep track of the last calendar date of bot XP increments
  activityLog: Record<string, number>; // Record of dates -> XP earned on that day
  unlockedUnitIndex: number;
  unlockedLessonIndex: number; // For the current unit
  completedLessons: Record<string, { completedCount: number; golden: boolean; highScore: number }>;
  mistakesQueue: BaseExercise[]; // Items users got wrong for redemption drill
  lingocoins: number;
  streakFreezes: number;
  activeWager: boolean;
  activeTitle?: string;
  unlockedTitles?: string[];
  settings: {
    soundEffectsEnabled: boolean;
    textToSpeechEnabled: boolean;
    darkModeEnabled?: boolean;
  };
  leagueId: number; // e.g., 0 = Bronze, 1 = Silver, 2 = Gold, 3 = Sapphire, 4 = Diamond
  leagueResetTimestamp: number; // Timestamp of next Monday reset
  leagueUsers: LeaderboardPlayer[]; // Bot lists
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  xp: number;
  isBot: boolean;
  streak: number;
  avatarSeed: number; // Simple seed to render a unique color avatar
  avatarId?: string;  // Premium avatar preset ID
}
