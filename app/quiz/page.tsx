'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QUESTIONS, scoreAnswers, type Answers } from '@/lib/quiz-engine';
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const Q_COLORS = [
  { gradient: 'from-orange-500 to-red-700', light: 'bg-orange-50', border: 'border-orange-200', selectedBg: 'bg-orange-50', selectedBorder: 'border-orange-500', selectedText: 'text-orange-900', radioBg: 'bg-orange-600', dot: 'bg-orange-500', pill: 'bg-orange-600' },
  { gradient: 'from-rose-500 to-pink-600',     light: 'bg-rose-50',   border: 'border-rose-200',   selectedBg: 'bg-rose-50',   selectedBorder: 'border-rose-500',   selectedText: 'text-rose-900',   radioBg: 'bg-rose-600',   dot: 'bg-rose-500',   pill: 'bg-rose-600'   },
  { gradient: 'from-amber-500 to-orange-500',  light: 'bg-amber-50',  border: 'border-amber-200',  selectedBg: 'bg-amber-50',  selectedBorder: 'border-amber-500',  selectedText: 'text-amber-900',  radioBg: 'bg-amber-500',  dot: 'bg-amber-500',  pill: 'bg-amber-500'  },
  { gradient: 'from-emerald-500 to-teal-600',  light: 'bg-emerald-50',border: 'border-emerald-200',selectedBg: 'bg-emerald-50',selectedBorder: 'border-emerald-500',selectedText: 'text-emerald-900',radioBg: 'bg-emerald-600',dot: 'bg-emerald-500',pill: 'bg-emerald-600'},
  { gradient: 'from-cyan-500 to-blue-600',     light: 'bg-cyan-50',   border: 'border-cyan-200',   selectedBg: 'bg-cyan-50',   selectedBorder: 'border-cyan-500',   selectedText: 'text-cyan-900',   radioBg: 'bg-cyan-600',   dot: 'bg-cyan-500',   pill: 'bg-cyan-600'   },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animating, setAnimating] = useState(false);

  const question = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const progress = ((currentQ + 1) / total) * 100;
  const selectedOption = answers[question.id];
  const isLast = currentQ === total - 1;
  const color = Q_COLORS[currentQ % Q_COLORS.length];

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
  };

  const handleNext = () => {
    if (!selectedOption || animating) return;
    if (isLast) {
      const result = scoreAnswers(answers);
      router.push(`/quiz/result?track=${result}`);
      return;
    }
    setAnimating(true);
    setTimeout(() => { setCurrentQ(q => q + 1); setAnimating(false); }, 200);
  };

  const handleBack = () => {
    if (currentQ === 0 || animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrentQ(q => q - 1); setAnimating(false); }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Nav */}
      <nav className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-md shadow-orange-200">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Sec<span className="text-orange-600">quiz</span></span>
        </Link>
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={cn(
              'h-2 rounded-full transition-all duration-500',
              i < currentQ  ? cn('w-6', color.dot) :
              i === currentQ ? cn('w-8', color.dot) :
              'w-2 bg-slate-200'
            )} />
          ))}
        </div>
        <span className="text-sm text-slate-400 font-medium hidden md:block">
          {currentQ + 1} of {total}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div className={cn('h-full bg-gradient-to-r transition-all duration-700 ease-out', color.gradient)}
          style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className={cn(
          'w-full max-w-2xl transition-all duration-200',
          animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        )}>

          {/* Question pill */}
          <div className="mb-7">
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r shadow-lg',
              color.gradient
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Step {currentQ + 1} / {total}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              {question.text}
            </h1>
            {question.subtext && (
              <p className="text-slate-500 text-sm md:text-base">{question.subtext}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3 mb-8">
            {question.options.map(option => {
              const isSelected = selectedOption === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'group w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? cn('shadow-lg', color.selectedBg, color.selectedBorder)
                      : cn('bg-white border-slate-100 hover:border-slate-200 hover:shadow-md')
                  )}
                >
                  {/* Emoji bubble */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all duration-200',
                    isSelected ? 'bg-white shadow-sm scale-110' : 'bg-slate-50 group-hover:bg-slate-100'
                  )}>
                    {option.emoji}
                  </div>

                  <span className={cn(
                    'flex-1 text-sm md:text-base font-medium leading-snug transition-colors',
                    isSelected ? cn(color.selectedText, 'font-semibold') : 'text-slate-700 group-hover:text-slate-900'
                  )}>
                    {option.label}
                  </span>

                  {/* Radio */}
                  <div className={cn(
                    'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    isSelected ? cn('border-transparent', color.radioBg) : 'border-slate-200 group-hover:border-slate-300'
                  )}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentQ === 0}
              className="h-12 px-5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold gap-2 disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedOption}
              className={cn(
                'h-12 px-8 rounded-xl font-bold gap-2 transition-all duration-300 text-white active:scale-95',
                selectedOption
                  ? cn('bg-gradient-to-r shadow-xl', color.gradient)
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              )}
            >
              {isLast ? (
                <><CheckCircle2 className="w-4 h-4" /> See My Track</>
              ) : (
                <>Next Question <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pb-6">
        Takes less than 2 minutes · No signup required to see results
      </p>
    </div>
  );
}
