/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Swords } from 'lucide-react';
import { sound } from '../sound';

interface OnboardingProps {
  onComplete: (name: string, dailyGoal: number) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const xpGoals = [
    { value: 10, label: 'Casual', description: '10 XP per day (~1 lesson)' },
    { value: 20, label: 'Regular', description: '20 XP per day (~2 lessons)' },
    { value: 30, label: 'Serious', description: '30 XP per day (~3 lessons)' },
    { value: 50, label: 'Intense', description: '50 XP per day (~5 lessons)' }
  ];

  const handleNextStep = () => {
    sound.playClick();
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter a valid display name to continue.');
        return;
      }
      if (name.length > 20) {
        setError('Your name should be under 20 characters.');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!dailyGoal) {
        setError('Please select a daily target XP goal.');
        return;
      }
      onComplete(name.trim(), dailyGoal);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-150"
      >
        {/* Dynamic Logo Aspect */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg relative">
            <Swords className="w-8 h-8 text-white" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold font-heading text-[#2C3E50] text-center mb-2">
              Welcome to LingoFree!
            </h2>
            <p className="text-gray-500 text-center mb-6 text-sm">
              The 100% free English school that operates fully offline. Let\'s get you configured!
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What is your name?
              </label>
              <input
                id="onboarding-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Future English Master"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] text-gray-800 font-sans text-base transition-all"
                maxLength={20}
              />
              {error && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold font-heading text-[#2C3E50] text-center mb-2">
              Select Your Daily Goal
            </h2>
            <p className="text-gray-500 text-center mb-6 text-sm">
              Establishing a target helps keep your learning streak burning bright!
            </p>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {xpGoals.map((g) => (
                <button
                  id={`goal-btn-${g.value}`}
                  key={g.value}
                  onClick={() => {
                    sound.playClick();
                    setDailyGoal(g.value);
                    if (error) setError('');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    dailyGoal === g.value
                      ? 'border-[#4ECDC4] bg-[#4ECDC4]/10 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`font-bold transition-all text-sm uppercase tracking-wide ${dailyGoal === g.value ? 'text-[#2C3E50]' : 'text-gray-600'}`}>
                      {g.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.description}</p>
                  </div>
                  {dailyGoal === g.value && (
                    <div className="w-5 h-5 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-2 font-medium mb-4 text-center">
                {error}
              </p>
            )}
          </div>
        )}

        <button
          id="onboarding-next-btn"
          onClick={handleNextStep}
          className="w-full bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 text-white font-bold py-4 px-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all text-center flex items-center justify-center font-heading text-lg"
        >
          {step === 1 ? 'Next Step' : 'Start Learning!'}
        </button>

        <div className="flex justify-center mt-6 gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${step === 1 ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${step === 2 ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
        </div>
      </motion.div>
    </div>
  );
}
