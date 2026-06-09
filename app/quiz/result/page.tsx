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
  ShieldCheck, RefreshCw, BookOpen, Star, Zap, ChevronRight,
} from 'lucide-react';

const RESULT_PALETTE: Record<TrackKey, { hero: string; heroBg: string; accent: string; accentBorder: string; badge: string; cta: string; iconBg: string; price: string }> = {
  'ethical-hacking':   { hero: 'from-rose-500 to-orange-500',      heroBg: 'bg-rose-50',    accent: 'text-rose-700',   accentBorder: 'border-rose-200 bg-rose-50',   badge: 'bg-rose-100 text-rose-700 border-rose-200',    cta: 'from-rose-500 to-orange-500',      iconBg: 'bg-rose-100',    price: 'text-rose-600'    },
  'soc-blue-team':     { hero: 'from-orange-500 to-cyan-500',       heroBg: 'bg-orange-50',  accent: 'text-orange-700', accentBorder: 'border-orange-200 bg-orange-50', badge: 'bg-orange-100 text-orange-700 border-orange-200',  cta: 'from-orange-500 to-cyan-500',      iconBg: 'bg-orange-100',  price: 'text-orange-600'  },
  'grc':               { hero: 'from-emerald-500 to-teal-500',      heroBg: 'bg-emerald-50', accent: 'text-emerald-700',accentBorder: 'border-emerald-200 bg-emerald-50',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',cta: 'from-emerald-500 to-teal-500',     iconBg: 'bg-emerald-100', price: 'text-emerald-600' },
  'digital-forensics': { hero: 'from-red-600 to-fuchsia-500',   heroBg: 'bg-red-50',  accent: 'text-red-800', accentBorder: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-800 border-red-200',  cta: 'from-red-600 to-fuchsia-500',   iconBg: 'bg-red-100',  price: 'text-red-700'  },
  'cloud-security':    { hero: 'from-cyan-500 to-blue-500',         heroBg: 'bg-cyan-50',    accent: 'text-cyan-700',   accentBorder: 'border-cyan-200 bg-cyan-50',     badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',      cta: 'from-cyan-500 to-blue-500',        iconBg: 'bg-cyan-100',    price: 'text-cyan-600'    },
  'foundations':       { hero: 'from-slate-600 to-slate-800',       heroBg: 'bg-slate-50',   accent: 'text-slate-700',  accentBorder: 'border-slate-200 bg-slate-50',   badge: 'bg-slate-100 text-slate-700 border-slate-200',    cta: 'from-slate-600 to-slate-800',      iconBg: 'bg-slate-100',   price: 'text-slate-700'   },
};

const WHATS_INCLUDED = [
  { icon: BookOpen,      text: 'Full curriculum access (lifetime)' },
  { icon: Star,          text: 'Video lessons optimised for Nigerian bandwidth' },
  { icon: Check,         text: 'Auto-graded quizzes after every lesson' },
  { icon: Briefcase,     text: 'Written assignments with expert feedback' },
  { icon: Star,          text: 'Capstone project with professional review' },
  { icon: MessageSquare, text: 'WhatsApp mentorship support' },
  { icon: Check,         text: 'Certificate of completion' },
  { icon: Zap,           text: 'Self-paced — no deadlines, no expiry' },
];

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const trackKey = (searchParams.get('track') ?? 'foundations') as TrackKey;
  const track = TRACKS[trackKey] ?? TRACKS['foundations'];
  const palette = RESULT_PALETTE[trackKey] ?? RESULT_PALETTE['foundations'];

  const [course, setCourse] = useState<any>(null);
  const [altTracks] = useState<TrackKey[]>(
    (Object.keys(TRACKS) as TrackKey[]).filter(k => k !== trackKey).slice(0, 3)
  );

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
    <div className="min-h-screen bg-white text-slate-900">

      {/* Nav */}
      <nav className="h-16 border-b border-slate-100 flex items-center justify-between px-6 md:px-10 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-md shadow-orange-200">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">Sec<span className="text-orange-600">Acad</span></span>
        </Link>
        <button
          onClick={() => router.push('/quiz')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-slate-100"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retake quiz
        </button>
      </nav>

      {/* Hero result banner */}
      <div className={cn('relative overflow-hidden py-16 px-6 bg-gradient-to-br text-white', palette.hero)}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-3xl mx-auto text-center space-y-5 relative z-10">
          <div className="text-7xl mb-2 drop-shadow-lg">{track.icon}</div>
          <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold uppercase tracking-widest px-4 py-1.5 backdrop-blur-sm">
            ✨ Your recommended track
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow">{track.title}</h1>
          <p className="text-lg md:text-xl text-white/85 max-w-xl mx-auto leading-relaxed">{track.tagline}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {[
              { icon: Clock, text: track.duration },
              { icon: Zap, text: 'Self-paced' },
              { icon: BookOpen, text: 'Certificate included' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold border border-white/20">
                <item.icon className="w-4 h-4" /> {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-10">

        {/* Why this track */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Why this track fits you</h2>
          <p className="text-slate-600 leading-relaxed text-base">{track.description}</p>
        </section>

        {/* Roles */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Roles you'll qualify for</h2>
          <div className="flex flex-wrap gap-2.5">
            {track.roles.map(role => (
              <div key={role} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Portfolio project */}
        <section className={cn('rounded-3xl p-7 border-2 space-y-3', palette.accentBorder)}>
          <div className="flex items-center gap-2 mb-2">
            <Star className={cn('w-5 h-5', palette.accent)} />
            <h2 className={cn('text-lg font-bold', palette.accent)}>Your portfolio project</h2>
          </div>
          <p className="text-sm leading-relaxed font-medium text-slate-700">{track.portfolio}</p>
          <p className="text-xs text-slate-400 font-medium">
            You graduate with a real, employer-ready document — not just a certificate.
          </p>
        </section>

        {/* What's included */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-slate-900">What's included</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WHATS_INCLUDED.map(item => (
              <div key={item.text} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-600 font-medium leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing + CTA */}
        <section className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg bg-white">
          <div className={cn('h-1.5 w-full bg-gradient-to-r', palette.cta)} />
          <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  One-time payment · Permanent access
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900">₦{priceNaira}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs leading-relaxed">
                  Average entry-level cyber salary in Nigeria: ₦120k–₦200k/month.
                  This pays back in under 2 months.
                </p>
              </div>
              <div className="space-y-3 md:text-right shrink-0">
                <Button
                  onClick={handleEnrol}
                  size="lg"
                  className={cn(
                    'w-full md:w-auto h-14 px-10 rounded-2xl font-bold text-base gap-2 shadow-xl transition-all active:scale-95 bg-gradient-to-r text-white',
                    palette.cta
                  )}
                >
                  Enrol Now — Pay Securely <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-[11px] text-slate-400 font-medium">Powered by Paystack · Instant access on payment</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
              {['✅ Secure Paystack payment', '✅ Instant course access', '✅ No recurring fees', '✅ Nigerian Naira pricing'].map(t => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="flex flex-col md:flex-row items-center gap-5 bg-emerald-50 border border-emerald-100 rounded-3xl p-7">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-slate-900 text-base">Have questions before you enrol?</h3>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">Chat directly with our team on WhatsApp. We typically respond within a few hours.</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            <Button variant="outline" className="h-12 px-7 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold gap-2">
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
            </Button>
          </a>
        </section>

        {/* Alt tracks */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Other tracks you might explore</h2>
          <div className="grid grid-cols-1 gap-3">
            {altTracks.map(key => {
              const t = TRACKS[key];
              const p = RESULT_PALETTE[key];
              return (
                <button key={key} onClick={() => router.push(`/quiz/result?track=${key}`)}
                  className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all text-left">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0', p.iconBg)}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">{t.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{t.duration} · <span className={p.price}>₦{(t.priceKobo / 100).toLocaleString('en-NG')}</span></p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-slate-400 pt-2">
            Not sure yet?{' '}
            <Link href="/quiz" className="text-orange-600 font-semibold hover:text-orange-700">Retake the quiz</Link>
            {' '}or{' '}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:text-emerald-700">chat with us on WhatsApp</a>
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400 font-medium space-y-1 bg-slate-50">
        <p>SecAcad · Nigeria's Cybersecurity Learning Academy</p>
        <p>Built for Nigeria 🇳🇬 · Payments secured by Paystack</p>
      </footer>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
