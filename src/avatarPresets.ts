/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AvatarPreset {
  id: string;
  emoji: string;
  label: string;
  bgGradient: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'owl', emoji: '🦉', label: 'Lingo Owl', bgGradient: 'from-emerald-400 to-teal-500' },
  { id: 'fox', emoji: '🦊', label: 'Clever Fox', bgGradient: 'from-orange-400 to-amber-500' },
  { id: 'panda', emoji: '🐼', label: 'Zen Panda', bgGradient: 'from-slate-450 to-slate-700' },
  { id: 'lion', emoji: '🦁', label: 'Proud Lion', bgGradient: 'from-yellow-400 to-orange-500' },
  { id: 'koala', emoji: '🐨', label: 'Lazy Koala', bgGradient: 'from-sky-400 to-indigo-500' },
  { id: 'dino', emoji: '🦖', label: 'Dino Scholar', bgGradient: 'from-green-400 to-emerald-500' },
  { id: 'unicorn', emoji: '🦄', label: 'Creative Unicorn', bgGradient: 'from-pink-400 to-purple-500' },
  { id: 'cat', emoji: '🐱', label: 'Smart Cat', bgGradient: 'from-amber-300 to-orange-400' },
  { id: 'puppy', emoji: '🐶', label: 'Active Puppy', bgGradient: 'from-blue-405 to-indigo-600' },
  { id: 'frog', emoji: '🐸', label: 'Grammar Frog', bgGradient: 'from-lime-400 to-green-550' },
];

export function getAvatarById(id?: string): AvatarPreset {
  return AVATAR_PRESETS.find(a => a.id === id) || AVATAR_PRESETS[0];
}
