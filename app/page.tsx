'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TRACKS } from '@/lib/quiz-engine';
import {
  ArrowRight, ShieldCheck, Target,
  Check, MessageSquare, Quote, Star, Menu, X,
  Clock, Zap, Award, Sparkles, TrendingUp, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Tracks', href: '#tracks' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const FEATURED_TRACKS = [
  { key: 'ethical-hacking',   ...TRACKS['ethical-hacking'] },
  { key: 'soc-blue-team',     ...TRACKS['soc-blue-team'] },
  { key: 'grc',               ...TRACKS['grc'] },
  { key: 'digital-forensics', ...TRACKS['digital-forensics'] },
  { key: 'cloud-security',    ...TRACKS['cloud-security'] },
  { key: 'foundations',       ...TRACKS['foundations'] },
];

const TRACK_PALETTE: Record<string, { gradient: string; lightBg: string; border: string; badge: string; price: string; iconBg: string }> = {
  'ethical-hacking':   { gradient: 'from-rose-500 to-orange-500',      lightBg: 'bg-rose-50',    border: 'border-rose-100',    badge: 'bg-rose-100 text-rose-700',    price: 'text-rose-600',    iconBg: 'bg-rose-100'    },
  'soc-blue-team':     { gradient: 'from-blue-500 to-cyan-500',       lightBg: 'bg-blue-50',  border: 'border-blue-100',  badge: 'bg-blue-100 text-blue-700', price: 'text-blue-600',  iconBg: 'bg-blue-100'  },
  'grc':               { gradient: 'from-emerald-500 to-teal-500',      lightBg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700',price:'text-emerald-600',iconBg: 'bg-emerald-100' },
  'digital-forensics': { gradient: 'from-red-600 to-fuchsia-500',   lightBg: 'bg-red-50',  border: 'border-red-100',  badge: 'bg-red-100 text-red-800',price: 'text-red-700',  iconBg: 'bg-red-100'  },
  'cloud-security':    { gradient: 'from-cyan-500 to-blue-500',         lightBg: 'bg-cyan-50',    border: 'border-cyan-100',    badge: 'bg-cyan-100 text-cyan-700',    price: 'text-cyan-600',    iconBg: 'bg-cyan-100'    },
  'foundations':       { gradient: 'from-slate-600 to-slate-800',       lightBg: 'bg-slate-50',   border: 'border-slate-200',   badge: 'bg-slate-100 text-slate-700',  price: 'text-slate-700',   iconBg: 'bg-slate-100'   },
};

type TierLabel = 'Starter' | 'Pro' | 'Elite';
const TIER_MAP: Record<TierLabel, { dot: string; chip: string; ring: string; featured: boolean }> = {
  Starter: { dot: 'bg-slate-400',  chip: 'bg-slate-50 text-slate-600 border-slate-200',                            ring: '',                          featured: false },
  Pro:     { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', ring: '', featured: false },
  Elite:   { dot: 'bg-amber-500',  chip: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200', ring: 'ring-1 ring-amber-200/80', featured: true  },
};
const getTier = (priceKobo: number): TierLabel =>
  priceKobo <= 4_000_000 ? 'Starter' : priceKobo <= 8_000_000 ? 'Pro' : 'Elite';

const TESTIMONIALS = [
  { name: 'Adaeze Okonkwo', role: 'SOC Analyst, Stanbic IBTC', location: 'Lagos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adaeze', quote: 'I was a bank teller with zero IT background. Six months after completing the SOC Analyst track, I landed a role at a top bank. SecAcad taught me real skills, not just theory.', accent: 'from-blue-500 to-cyan-500' },
  { name: 'Emeka Nwosu', role: 'Penetration Tester, Freelance', location: 'Abuja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', quote: 'The Ethical Hacking track is the real deal. The pentest report I submitted as my capstone project got me my first paying client before I even finished the course.', accent: 'from-rose-500 to-orange-500' },
  { name: 'Fatima Bello', role: 'GRC Analyst, MTN Nigeria', location: 'Kano', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', quote: 'Coming from a compliance background, the GRC track was perfectly aligned to my experience. I got a 40% salary increase after completing it.', accent: 'from-emerald-500 to-teal-500' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Take the 2-minute quiz', desc: 'Answer 5 questions about your background and goals. We match you to the right track.', icon: Target, gradient: 'from-orange-500 to-red-700', light: 'bg-orange-50' },
  { step: '02', title: 'Pay once, access forever', desc: 'Pay via Paystack in seconds. Your access is activated automatically — no approval, no waiting.', icon: Zap, gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50' },
  { step: '03', title: 'Learn at your pace', desc: 'Study when you want, as fast or slow as you need. No deadlines, no group schedules.', icon: Clock, gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50' },
  { step: '04', title: 'Graduate with a portfolio', desc: 'Every track ends with a graded capstone project — a real document to show any employer.', icon: Award, gradient: 'from-red-600 to-purple-600', light: 'bg-red-50' },
];

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(user?.role === 'super-admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '2348000000000'}?text=${encodeURIComponent('Hi, I have a question about SecAcad. Can you help?')}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-clip">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-lg shadow-orange-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sec<span className="text-orange-600">Acad</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 font-medium text-[15px] text-slate-500">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-slate-900 transition-colors">{l.label}</a>
            ))}
            <Link href="/quiz" className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Find Your Track
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-5 h-10 border-slate-200 text-slate-700 font-semibold hover:border-orange-300 hover:text-orange-600 hover:bg-white transition-colors">
                Login
              </Button>
            </Link>
            <Link href="/quiz">
              <Button className="rounded-full px-5 h-10 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-semibold shadow-md shadow-orange-200/70">
                Start Free Quiz
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl z-50">
            <div className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}
                  className="py-3 px-3 font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-50"
                  onClick={() => setIsMenuOpen(false)}>{l.label}</a>
              ))}
              <Link href="/quiz" className="py-3 px-3 font-semibold text-emerald-600 flex items-center gap-2 rounded-xl hover:bg-emerald-50"
                onClick={() => setIsMenuOpen(false)}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Find Your Track
              </Link>
              <div className="flex gap-3 pt-4">
                <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full h-12">Login</Button>
                </Link>
                <Link href="/quiz" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-full h-12 bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold">Start Quiz</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section id="home" className="relative overflow-hidden pt-14 pb-24 sm:pt-16 sm:pb-28 lg:pt-24 lg:pb-36 bg-white">
          {/* Ambient backdrop — contained inside the section */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-32 -right-24 w-[32rem] h-[32rem] bg-orange-100/50 rounded-full blur-[120px]" />
            <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] bg-red-100/50 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/3 w-[18rem] h-[18rem] bg-cyan-100/40 rounded-full blur-[80px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            <div className="space-y-7 lg:space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-sm border border-orange-100 rounded-full px-4 py-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[11px] sm:text-xs font-bold text-orange-700 uppercase tracking-widest">Nigeria's #1 Cybersecurity Academy</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-slate-900 text-balance">
                Break into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-700">
                  Cybersecurity
                </span>{' '}
                without quitting your day job.
              </h1>

              <p className="text-base sm:text-lg text-slate-500 max-w-xl leading-relaxed">
                Self-paced, Nigerian-context cybersecurity training. Pay once, learn forever.
                Graduate with a real portfolio project that proves you can do the job.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quiz">
                  <Button size="lg"
                    className="rounded-full px-8 h-14 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold text-base shadow-xl shadow-orange-200/70 gap-2 active:scale-95 transition-all">
                    Find Your Track <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline"
                    className="rounded-full px-8 h-14 border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50 hover:border-slate-300">
                    I already have an account
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                2-minute quiz — no signup required to see your result
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {[
                  { icon: <ShieldCheck className="w-4 h-4 text-orange-500" />, text: 'Nigerian-context curriculum' },
                  { icon: <Zap className="w-4 h-4 text-amber-500" />, text: 'Instant access on payment' },
                  { icon: <MessageSquare className="w-4 h-4 text-green-500" />, text: 'WhatsApp mentorship' },
                ].map(b => (
                  <div key={b.text}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-full shadow-sm text-xs sm:text-sm font-medium text-slate-600">
                    {b.icon} {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual */}
            <div className="relative hidden lg:block h-[560px]">
              <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                  alt="Nigerian cybersecurity professional"
                  fill className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating card 1 */}
              <div className="absolute -left-10 top-1/3 p-4 rounded-2xl shadow-2xl w-52 bg-white border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Latest graduate</p>
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde" alt="Tunde" className="w-10 h-10 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Tunde A.</p>
                    <p className="text-xs text-orange-600 font-semibold">SOC Analyst · Lagos</p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -right-8 bottom-1/3 p-4 rounded-2xl shadow-2xl w-48 bg-gradient-to-br from-orange-600 to-red-700 text-white border border-orange-500">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-orange-200" />
                  <span className="text-3xl font-black">1,000+</span>
                </div>
                <p className="text-xs text-orange-200 font-medium">Nigerians transitioning<br />into cybersecurity</p>
              </div>

              {/* Floating card 3 */}
              <div className="absolute right-8 top-8 p-3 rounded-xl shadow-lg w-40 bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-700 font-bold">Pay once · Learn forever</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-wrap justify-center md:justify-between items-center gap-x-6 gap-y-3 text-sm md:text-base font-semibold">
            {[
              { icon: '🎯', text: '6 Cybersecurity Tracks' },
              { icon: '⚡', text: 'Self-Paced Learning' },
              { icon: '🏆', text: 'Portfolio Projects' },
              { icon: '💬', text: 'WhatsApp Mentorship' },
              { icon: '🔒', text: 'Paystack Payments' },
            ].map(item => (
              <span key={item.text} className="inline-flex items-center gap-2 whitespace-nowrap">
                <span aria-hidden>{item.icon}</span>{item.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tracks section ───────────────────────────────────────── */}
        <section id="tracks" className="relative py-20 lg:py-28 bg-slate-50 overflow-hidden">
          {/* Ambient background ornaments */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute top-24 -left-24 w-[28rem] h-[28rem] bg-orange-100/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-24 -right-24 w-[28rem] h-[28rem] bg-red-100/40 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 space-y-14">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-orange-600 rounded-full" /> Cybersecurity Tracks
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
                Six paths. One goal:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-700 italic font-serif font-normal">
                  getting you hired.
                </span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg">
                Every track ends with a capstone project — a real deliverable you can show any employer in Nigeria.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                {(['Starter', 'Pro', 'Elite'] as TierLabel[]).map(label => (
                  <span key={label}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm">
                    <span className={cn('w-1.5 h-1.5 rounded-full', TIER_MAP[label].dot)} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
              {FEATURED_TRACKS.map(track => {
                const p = TRACK_PALETTE[track.key];
                const tierLabel = getTier(track.priceKobo);
                const tier = TIER_MAP[tierLabel];

                return (
                  <Link
                    key={track.key}
                    href={`/quiz/result?track=${track.key}`}
                    aria-label={`Explore the ${track.title} track`}
                    className="group block rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-50"
                  >
                    <Card className={cn(
                      'relative h-full overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 backdrop-blur-xl',
                      'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]',
                      'transition-all duration-500 ease-out',
                      'group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_56px_-20px_rgba(79,70,229,0.28)]',
                      tier.ring,
                    )}>
                      {tier.featured && (
                        <div className="absolute top-4 right-4 z-20">
                          <Badge className="border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-200/60 uppercase tracking-widest text-[10px] px-2.5 py-1 gap-1">
                            <Sparkles className="w-3 h-3" /> Premium
                          </Badge>
                        </div>
                      )}

                      <div className={cn('h-1.5 w-full bg-gradient-to-r transition-[height] duration-300 group-hover:h-2', p.gradient)} />

                      <div className={cn(
                        'pointer-events-none absolute inset-x-0 top-1.5 bottom-0 opacity-0 transition-opacity duration-500 group-hover:opacity-60',
                        p.lightBg,
                      )} />

                      <div className="relative z-10 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest gap-1.5', tier.chip)}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', tier.dot)} />
                            {tierLabel}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Clock className="w-3 h-3" /> {track.duration}
                          </span>
                        </div>

                        <div className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/70 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3',
                          p.iconBg,
                        )}>
                          <span aria-hidden>{track.icon}</span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-bold text-slate-900 text-[1.15rem] leading-snug tracking-tight">
                            {track.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{track.tagline}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {track.roles.slice(0, 2).map(role => (
                            <span key={role} className="text-[10px] font-semibold bg-white/70 backdrop-blur-sm border border-slate-200/70 text-slate-600 px-2.5 py-1 rounded-full">
                              {role}
                            </span>
                          ))}
                          {track.roles.length > 2 && (
                            <span className="text-[10px] font-semibold text-slate-400 px-1 py-1">
                              +{track.roles.length - 2} more
                            </span>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">One-time</p>
                            <span className={cn('text-2xl font-black tracking-tight', p.price)}>
                              ₦{(track.priceKobo / 100).toLocaleString('en-NG')}
                            </span>
                          </div>
                          <div className={cn(
                            'h-10 px-3 rounded-xl inline-flex items-center gap-1.5 bg-gradient-to-r text-white text-xs font-bold shadow-md',
                            'opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0',
                            p.gradient,
                          )}>
                            Explore <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="text-center pt-6">
              <Link href="/quiz">
                <Button size="lg"
                  className="rounded-full px-10 h-14 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-bold gap-2 shadow-xl shadow-orange-200/60 active:scale-95 transition-all">
                  Not sure which track? Take the quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-400 font-medium mt-3">5 questions · 2 minutes · instant recommendation</p>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="relative py-20 lg:py-28 bg-white overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-orange-50/60 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 space-y-12 lg:space-y-16">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-orange-600 rounded-full" /> How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
                From zero to job-ready{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-700 italic font-serif font-normal">
                  in four steps.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((step, idx) => (
                <div key={step.step}
                  className={cn(
                    'group relative rounded-[28px] p-6 bg-white/80 backdrop-blur-xl border border-slate-200/70 space-y-5',
                    'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]',
                    'transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-20px_rgba(79,70,229,0.22)]',
                  )}>
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div aria-hidden className="hidden lg:block absolute top-14 -right-3 w-6 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                  )}
                  <div className="flex items-center justify-between">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-transform duration-500 group-hover:scale-110', step.gradient)}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-5xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section id="testimonials" className="relative py-20 lg:py-28 bg-slate-50 overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute top-24 -right-24 w-[28rem] h-[28rem] bg-rose-100/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-24 -left-24 w-[28rem] h-[28rem] bg-orange-100/40 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 space-y-12 lg:space-y-14">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-orange-600 rounded-full" /> Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight text-balance">
                Real Nigerians.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-700 italic font-serif font-normal">
                  Real results.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={cn(
                  'group relative rounded-[28px] p-8 bg-white/80 backdrop-blur-xl border border-slate-200/70 overflow-hidden',
                  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]',
                  'transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_48px_-20px_rgba(79,70,229,0.22)]',
                )}>
                  <div className={cn('absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r transition-[height] duration-300 group-hover:h-2', t.accent)} />
                  <div className="space-y-5">
                    <Quote className="w-9 h-9 text-slate-200" aria-hidden />
                    <p className="text-slate-700 leading-relaxed italic text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex gap-1" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{t.name}</p>
                        <p className="text-xs text-orange-600 font-semibold truncate">{t.role}</p>
                        <p className="text-xs text-slate-400">{t.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────────────── */}
        <section id="about" className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative h-[340px] sm:h-[400px] lg:h-[440px]">
              <div className="absolute left-0 top-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-10 ring-1 ring-slate-200">
                <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                  alt="Learners studying" fill className="object-cover" />
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-20 border-4 border-white ring-1 ring-slate-200">
                <Image src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
                  alt="Professional working" fill className="object-cover" />
              </div>
              <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-30 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl border border-slate-200/70">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] sm:text-xs text-emerald-700 font-bold uppercase tracking-widest">NDPR · CBN Compliant</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Curriculum aligned to<br />Nigerian regulations</p>
              </div>
            </div>

            <div className="space-y-7 lg:space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 bg-orange-600 rounded-full" /> About SecAcad
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight text-balance">
                  Built for Nigeria.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-700 italic font-serif font-normal">
                    By Nigerians.
                  </span>
                </h2>
              </div>
              <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
                SecAcad was built because we were tired of seeing talented Nigerians pay USD prices for
                international courses that had nothing to do with our market, our regulations (NDPR, CBN),
                or our employers. Every track is designed with the Nigerian job market in mind.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  { emoji: '🎯', title: 'Our Mission', desc: 'Make world-class cybersecurity education affordable and accessible to every Nigerian who wants it.', bg: 'bg-orange-50/80 border-orange-100' },
                  { emoji: '👁️', title: 'Our Vision', desc: 'A Nigeria where every cybersecurity role is filled by a Nigerian professional trained for that exact job.', bg: 'bg-red-50/80 border-red-100' },
                ].map(item => (
                  <div key={item.title} className={cn('rounded-2xl p-5 border backdrop-blur-sm space-y-3', item.bg)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{item.emoji}</span>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/quiz">
                <Button className="rounded-full px-8 h-12 bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-700 hover:to-red-800 text-white font-semibold gap-2 shadow-lg shadow-orange-200/60 active:scale-95 transition-all">
                  Find My Track <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <section className="relative py-20 lg:py-24 bg-gradient-to-br from-orange-600 via-red-700 to-purple-700 overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div aria-hidden className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div aria-hidden className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight text-balance">
              Your cybersecurity career starts with 5 questions.
            </h2>
            <p className="text-orange-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Take the free quiz, get matched to your track, and pay once for lifetime access.
              No deadlines. No group pressure. Just progress.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/quiz" className="w-full sm:w-auto">
                <Button size="lg"
                  className="w-full sm:w-auto rounded-full px-10 h-14 bg-white text-orange-600 hover:bg-orange-50 font-bold text-base gap-2 shadow-2xl active:scale-95 transition-all">
                  Take the Free Quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost"
                  className="w-full sm:w-auto rounded-full px-8 h-14 border border-white/40 text-white hover:bg-white/15 hover:text-white font-semibold gap-2">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <section id="contact" className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Have questions?</h2>
            <p className="text-slate-500 max-w-md mx-auto text-base sm:text-lg">
              We're a WhatsApp message away. Our team typically responds within a few hours.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block pt-2">
              <Button size="lg"
                className="rounded-full px-8 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="space-y-3 text-center md:text-left max-w-sm md:max-w-xs mx-auto md:mx-0">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-md shadow-orange-500/30">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Sec<span className="text-orange-400">Acad</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nigeria's cybersecurity learning academy. Self-paced, affordable, portfolio-driven.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-3 text-sm text-slate-400 font-medium">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
            <Link href="/quiz" className="text-orange-400 hover:text-orange-300 font-semibold">Find Your Track</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <p>© {new Date().getFullYear()} SecAcad. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
            <span>Built for Nigeria 🇳🇬 · Payments by Paystack</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
