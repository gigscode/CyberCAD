'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TRACKS, buildWhatsAppUrl, type TrackKey } from '@/lib/quiz-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowRight, Check, MessageSquare, Clock, Briefcase,
  ShieldCheck, RefreshCw, BookOpen, Star, Zap,
} from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const trackKey = (searchParams.get('track') ?? 'foundations') as TrackKey;
  const track = TRACKS[trackKey] ?? TRACKS['foundations'];

  const [course, setCourse] = useState<any>(null);
  const [altTracks] = useState<TrackKey[]>(
    (Object.keys(TRACKS) as TrackKey[]).filter(k => k !== trackKey).slice(0, 2)
  );

  // Fetch matching published course from Supabase by slug
  useEffect(() => {
    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, description, price_kobo, level, duration')
        .eq('is_published', true)
        .ilike('name', `%${track.title.split(' ')[0]}%`)
        .maybeSingle();
      setCourse(data);
    };
    fetchCourse();
  }, [trackKey]);

  const priceNaira = (track.priceKobo / 100).toLocaleString('en-NG');
  const whatsappUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '2348000000000',
    track.title
  );

  const handleEnrol = () => {
    if (course?.id) {
      router.push(`/register?course=${course.id}&track=${trackKey}`);
    } else {
      router.push(`/register?track=${trackKey}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="h-16 border-b border-slate-100 flex items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-slate-900 text-lg">Secquiz</span>
        </Link>
        <button
          onClick={() => router.push('/quiz')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retake quiz
        </button>
      </nav>

      {/* Hero result banner */}
      <div className={cn('bg-gradient-to-br text-white py-16 px-6', track.color)}>
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="text-6xl mb-4">{track.icon}</div>
          <Badge className="bg-white/20 text-white border-white/30 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 backdrop-blur-sm">
            Your recommended track
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {track.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto leading-relaxed">
            {track.tagline}
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-sm font-semibold text-white/70">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {track.duration}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Self-paced
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Certificate included
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

        {/* About this track */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Why this track fits you</h2>
          <p className="text-slate-600 leading-relaxed text-base">{track.description}</p>
        </section>

        {/* Roles */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Roles you'll qualify for</h2>
          <div className="flex flex-wrap gap-2">
            {track.roles.map(role => (
              <div key={role} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio project — the key selling point */}
        <section className={cn('rounded-3xl p-7 border-2', track.accentColor, 'border-current/10 space-y-3')}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            <h2 className="text-lg font-bold">Your portfolio project</h2>
          </div>
          <p className="text-sm leading-relaxed font-medium opacity-90">
            {track.portfolio}
          </p>
          <p className="text-xs opacity-70 font-medium">
            You graduate with a real, employer-ready document — not just a certificate.
          </p>
        </section>

        {/* What's included */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">What's included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Full curriculum access (lifetime)',
              'Video lessons — YouTube, optimised for Nigerian bandwidth',
              'Auto-graded quizzes after every lesson',
              'Written assignments graded with expert feedback',
              'Capstone project with professional review',
              'WhatsApp mentorship support',
              'Certificate of completion',
              'Self-paced — no deadlines, no expiry',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing + CTA */}
        <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                One-time payment · Permanent access
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900">₦{priceNaira}</span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Average entry-level cyber salary in Nigeria: ₦120k–₦200k/month.
                This pays back in under 2 months.
              </p>
            </div>
            <div className="space-y-3 md:text-right">
              <Button
                onClick={handleEnrol}
                size="lg"
                className={cn(
                  'w-full md:w-auto h-14 px-10 rounded-2xl font-bold text-base gap-2 shadow-xl transition-all active:scale-95 bg-gradient-to-r text-white',
                  track.color
                )}
              >
                Enrol Now — Pay Securely
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-[11px] text-slate-400 font-medium">
                Powered by Paystack · Instant access on payment
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">✅ Secure Paystack payment</span>
            <span className="flex items-center gap-1.5">✅ Instant course access</span>
            <span className="flex items-center gap-1.5">✅ No recurring fees</span>
            <span className="flex items-center gap-1.5">✅ Nigerian Naira pricing</span>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="flex flex-col md:flex-row items-center gap-5 bg-green-50 border border-green-100 rounded-3xl p-7">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-slate-900 text-base">Have questions before you enrol?</h3>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Chat directly with our team on WhatsApp. We typically respond within a few hours.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="outline"
              className="h-12 px-7 rounded-xl border-green-200 text-green-700 hover:bg-green-100 font-semibold gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
            </Button>
          </a>
        </section>

        {/* Alt tracks */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Other tracks you might explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {altTracks.map(key => {
              const t = TRACKS[key];
              return (
                <button
                  key={key}
                  onClick={() => router.push(`/quiz/result?track=${key}`)}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all text-left group"
                >
                  <span className="text-3xl">{t.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{t.duration} · ₦{(t.priceKobo / 100).toLocaleString('en-NG')}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto mt-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-400 pt-2">
            Not sure yet?{' '}
            <Link href="/quiz" className="text-indigo-600 font-semibold hover:underline">
              Retake the quiz
            </Link>
            {' '}or{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="text-green-600 font-semibold hover:underline">
              chat with us on WhatsApp
            </a>
          </p>
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-300 font-medium space-y-1">
        <p>Secquiz · Nigeria's Cybersecurity Learning Academy</p>
        <p>Built for Nigeria 🇳🇬 · Payments secured by Paystack</p>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
