'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QUESTIONS, scoreAnswers, type Answers } from '@/lib/quiz-engine';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function QuizPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const question = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const progress = ((currentQ) / total) * 100;
  const selectedOption = answers[question.id];
  const isLast = currentQ === total - 1;

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (!selectedOption) return;
    if (isLast) {
      const result = scoreAnswers(answers);
      router.push(`/quiz/result?track=${result}`);
      return;
    }
    setDirection('forward');
    setCurrentQ(q => q + 1);
  };

  const handleBack = () => {
    if (currentQ === 0) return;
    setDirection('back');
    setCurrentQ(q => q - 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-slate-900 text-lg">Secquiz</span>
        </Link>
        <span className="text-sm text-slate-400 font-medium">
          Question {currentQ + 1} of {total}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${progress + (1 / total) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-10">

          {/* Question header */}
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
              Step {currentQ + 1} / {total}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {question.text}
            </h1>
            {question.subtext && (
              <p className="text-slate-400 text-sm md:text-base">{question.subtext}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {question.options.map(option => {
              const isSelected = selectedOption === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 group',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                  )}
                >
                  <span className="text-2xl shrink-0">{option.emoji}</span>
                  <span className={cn(
                    'text-sm md:text-base font-medium leading-snug',
                    isSelected ? 'text-indigo-900' : 'text-slate-700'
                  )}>
                    {option.label}
                  </span>
                  <div className={cn(
                    'ml-auto w-5 h-5 rounded-full border-2 shrink-0 transition-all',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-slate-200 group-hover:border-slate-300'
                  )}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentQ === 0}
              className="h-12 px-5 rounded-xl text-slate-500 hover:text-slate-800 font-semibold gap-2 disabled:opacity-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedOption}
              className={cn(
                'h-12 px-8 rounded-xl font-semibold gap-2 transition-all',
                selectedOption
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {isLast ? 'See My Track' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-slate-300 pb-8">
        Takes less than 2 minutes · No signup required to see results
      </p>
    </div>
  );
}
