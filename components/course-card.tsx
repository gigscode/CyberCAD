'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, ArrowRight, TrendingUp, Lock, CreditCard, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  progress?: number;
  duration?: string;
  instructor?: string;
  registrarsCount?: number;
  color?: 'mint' | 'peach' | 'lavender' | 'yellow' | string;
  /** Enrollment status of this course for the current learner */
  learnerStatus?: 'enrolled' | 'completed' | 'available';
  /** Price in kobo — shown on the enroll CTA */
  priceKobo?: number;
  onClick?: () => void;
  /** Called when learner clicks the enroll CTA on an available course */
  onEnroll?: (e: React.MouseEvent) => void;
}

export function CourseCard({
  title,
  subtitle,
  icon = '📚',
  progress = 0,
  duration = 'N/A',
  instructor = 'Instructor',
  registrarsCount,
  color = 'lavender',
  learnerStatus = 'available',
  priceKobo,
  onClick,
  onEnroll,
}: CourseCardProps) {

  const colorClasses: Record<string, string> = {
    mint:     'bg-emerald-50 text-emerald-600 border-emerald-100',
    peach:    'bg-orange-50  text-orange-600  border-orange-100',
    lavender: 'bg-violet-50  text-violet-600  border-violet-100',
    yellow:   'bg-amber-50   text-amber-600   border-amber-100',
  };
  const colorClass = colorClasses[color] || 'bg-slate-50 text-slate-600 border-slate-100';

  const isLocked    = learnerStatus === 'available';
  const isEnrolled  = learnerStatus === 'enrolled';
  const isCompleted = learnerStatus === 'completed';

  const priceLabel = priceKobo
    ? `₦${(priceKobo / 100).toLocaleString('en-NG')}`
    : 'Enroll Now';

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      className={cn(
        'group relative bg-white rounded-[28px] border shadow-sm transition-all duration-300 overflow-hidden flex flex-col',
        isLocked
          ? 'border-slate-100 hover:border-orange-200 hover:shadow-md cursor-default'
          : 'border-slate-100 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
      )}
    >
      {/* Top colour accent bar */}
      <div className={cn(
        'h-1 w-full',
        isCompleted ? 'bg-emerald-400' : isEnrolled ? 'bg-orange-400' : 'bg-slate-100 group-hover:bg-orange-200 transition-colors',
      )} />

      {/* Subtle background circle */}
      <div className={cn(
        'absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.07] group-hover:scale-150 transition-transform duration-700 pointer-events-none',
        colorClass.split(' ')[0],
      )} />

      <div className="relative z-10 flex flex-col flex-1 p-5 md:p-6 space-y-4">

        {/* Header row: icon + status badge */}
        <div className="flex justify-between items-start">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-transform group-hover:rotate-6',
            colorClass,
          )}>
            {icon}
          </div>

          {/* Status pill — top right */}
          {isCompleted && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Completed
            </span>
          )}
          {isEnrolled && progress > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> {progress}%
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-full">
              <Lock className="w-3 h-3" /> Not enrolled
            </span>
          )}
        </div>

        {/* Title & description — always fully visible */}
        <div className="flex-1 space-y-1.5">
          <h3 className={cn(
            'text-[1.05rem] font-semibold leading-snug tracking-tight',
            isLocked
              ? 'text-slate-900 group-hover:text-orange-600 transition-colors'
              : 'text-slate-900 group-hover:text-orange-600 transition-colors',
          )}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-50 w-full" />

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {duration}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px] md:max-w-none">{instructor}</span>
            </span>
            {registrarsCount !== undefined && (
              <span className="flex items-center gap-1.5 text-orange-600">
                <TrendingUp className="w-3.5 h-3.5" /> {registrarsCount}
              </span>
            )}
          </div>

          {/* Arrow shown only for enrolled/completed — navigates into course */}
          {!isLocked && (
            <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-orange-600">
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Progress bar for enrolled courses */}
        {isEnrolled && progress > 0 && (
          <Progress value={progress} className="h-1.5 bg-slate-100" />
        )}

        {/* ── Enroll CTA — only for locked/available courses ──────── */}
        {isLocked && (
          <Button
            size="sm"
            className="w-full h-11 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-100 active:scale-95 transition-all mt-1"
            onClick={(e) => {
              e.stopPropagation();
              onEnroll?.(e);
            }}
          >
            <CreditCard className="w-4 h-4 mr-2 shrink-0" />
            {priceLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
