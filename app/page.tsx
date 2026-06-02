'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
  'soc-blue-team':     { gradient: 'from-indigo-500 to-cyan-500',       lightBg: 'bg-indigo-50',  border: 'border-indigo-100',  badge: 'bg-indigo-100 text-indigo-700',price: 'text-indigo-600',  iconBg: 'bg-indigo-100'  },
  'grc':               { gradient: 'from-emerald-500 to-teal-500',      lightBg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700',price:'text-emerald-600',iconBg: 'bg-emerald-100' },
  'digital-forensics': { gradient: 'from-violet-500 to-fuchsia-500',   lightBg: 'bg-violet-50',  border: 'border-violet-100',  badge: 'bg-violet-100 text-violet-700',price: 'text-violet-600',  iconBg: 'bg-violet-100'  },
  'cloud-security':    { gradient: 'from-cyan-500 to-blue-500',         lightBg: 'bg-cyan-50',    border: 'border-cyan-100',    badge: 'bg-cyan-100 text-cyan-700',    price: 'text-cyan-600',    iconBg: 'bg-cyan-100'    },
  'foundations':       { gradient: 'from-slate-600 to-slate-800',       lightBg: 'bg-slate-50',   border: 'border-slate-200',   badge: 'bg-slate-100 text-slate-700',  price: 'text-slate-700',   iconBg: 'bg-slate-100'   },
};

const TESTIMONIALS = [
  { name: 'Adaeze Okonkwo', role: 'SOC Analyst, Stanbic IBTC', location: 'Lagos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adaeze', quote: 'I was a bank teller with zero IT background. Six months after completing the SOC Analyst track, I landed a role at a top bank. Secquiz taught me real skills, not just theory.', accent: 'bg-indigo-600' },
  { name: 'Emeka Nwosu', role: 'Penetration Tester, Freelance', location: 'Abuja', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka', quote: 'The Ethical Hacking track is the real deal. The pentest report I submitted as my capstone project got me my first paying client before I even finished the course.', accent: 'bg-rose-500' },
  { name: 'Fatima Bello', role: 'GRC Analyst, MTN Nigeria', location: 'Kano', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima', quote: 'Coming from a compliance background, the GRC track was perfectly aligned to my experience. I got a 40% salary increase after completing it.', accent: 'bg-emerald-500' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Take the 2-minute quiz', desc: 'Answer 5 questions about your background and goals. We match you to the right track.', icon: Target, gradient: 'from-indigo-500 to-violet-600', light: 'bg-indigo-50' },
  { step: '02', title: 'Pay once, access forever', desc: 'Pay via Paystack in seconds. Your access is activated automatically — no approval, no waiting.', icon: Zap, gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50' },
  { step: '03', title: 'Learn at your pace', desc: 'Study when you want, as fast or slow as you need. No deadlines, no group schedules.', icon: Clock, gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-50' },
  { step: '04', title: 'Graduate with a portfolio', desc: 'Every track ends with a graded capstone project — a real document to show any employer.', icon: Award, gradient: 'from-violet-500 to-purple-600', light: 'bg-violet-50' },
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
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '2348000000000'}?text=${encodeURIComponent('Hi, I have a question about Secquiz. Can you help?')}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sec<span className="text-indigo-600">quiz</span>
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

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="rounded-full px-5 h-10 border-slate-200 text-slate-700 font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                Login
              </Button>
            </Link>
            <Link href="/quiz">
              <Button className="rounded-full px-5 h-10 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-200">
                Start Free Quiz
              </Button>
            </Link>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                  <Button className="w-full rounded-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold">Start Quiz</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section id="home" className="relative overflow-hidden pt-16 pb-28 lg:pt-24 lg:pb-36 bg-white">
          {/* Soft background blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-100 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 opacity-60" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4 opacity-50" />
            <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-100 rounded-full blur-[60px] opacity-40" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-full px-4 py-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Nigeria's #1 Cybersecurity Academy</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-slate-900">
                Break into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Cybersecurity
                </span>
                <br />without quitting
                <br />your day job.
              </h1>

              <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                Self-paced, Nigerian-context cybersecurity training. Pay once, learn forever.
                Graduate with a real portfolio project that proves you can do the job.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quiz">
                  <Button size="lg"
                    className="rounded-full px-8 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-xl shadow-indigo-200/70 gap-2 active:scale-95 transition-all">
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

              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />, text: 'Nigerian-context curriculum' },
                  { icon: <Zap className="w-4 h-4 text-amber-500" />, text: 'Instant access on payment' },
                  { icon: <MessageSquare className="w-4 h-4 text-green-500" />, text: 'WhatsApp mentorship' },
                ].map(b => (
                  <div key={b.text}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm text-sm font-medium text-slate-600">
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
                    <p className="text-xs text-indigo-600 font-semibold">SOC Analyst · Lagos</p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -right-8 bottom-1/3 p-4 rounded-2xl shadow-2xl w-48 bg-gradient-to-br from-indigo-600 to-violet-600 text-white border border-indigo-500">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-200" />
                  <span className="text-3xl font-black">1,000+</span>
                </div>
                <p className="text-xs text-indigo-200 font-medium">Nigerians transitioning<br />into cybersecurity</p>
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
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-wrap justify-between items-center gap-4 text-sm md:text-base font-semibold">
            {[
              { icon: '🎯', text: '6 Cybersecurity Tracks' },
              { icon: '⚡', text: 'Self-Paced Learning' },
              { icon: '🏆', text: 'Portfolio Projects' },
              { icon: '💬', text: 'WhatsApp Mentorship' },
              { icon: '🔒', text: 'Paystack Payments' },
            ].map((item, i) => (
              <span key={item.text} className="flex items-center gap-2">
                {i > 0 && <span className="text-indigo-300 hidden sm:inline">·</span>}
                <span>{item.icon}</span>{item.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tracks section ───────────────────────────────────────── */}
        <section id="tracks" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-14">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> Cybersecurity Tracks
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Six paths. One goal:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic font-serif font-normal">
                  getting you hired.
                </span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Every track ends with a capstone project — a real deliverable you can show any employer in Nigeria.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURED_TRACKS.map(track => {
                const p = TRACK_PALETTE[track.key];
                return (
                  <Link key={track.key} href={`/quiz/result?track=${track.key}`}>
                    <div className={cn(
                      'group relative h-full rounded-[28px] overflow-hidden cursor-pointer border bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
                      p.border
                    )}>
                      {/* Gradient top bar */}
                      <div className={cn('h-1.5 w-full bg-gradient-to-r', p.gradient)} />

                      {/* Hover tint */}
                      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300', p.lightBg)} style={{ opacity: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.4')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                      />

                      <div className="p-6 space-y-5">
                        <div className="flex items-start justify-between">
                          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110', p.iconBg)}>
                            {track.icon}
                          </div>
                          <div className={cn('text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full', p.badge)}>
                            {track.duration}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
                            style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>
                            {track.title}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{track.tagline}</p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {track.roles.slice(0, 2).map(role => (
                            <span key={role} className="text-[10px] font-semibold bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">One-time</p>
                            <span className={cn('text-xl font-black', p.price)}>
                              ₦{(track.priceKobo / 100).toLocaleString('en-NG')}
                            </span>
                          </div>
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r transition-all duration-300 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0',
                            p.gradient
                          )}>
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center pt-6">
              <Link href="/quiz">
                <Button size="lg"
                  className="rounded-full px-10 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold gap-2 shadow-xl shadow-indigo-200/60 active:scale-95 transition-all">
                  Not sure which track? Take the quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-400 font-medium mt-3">5 questions · 2 minutes · instant recommendation</p>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> How It Works
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                From zero to job-ready
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic font-serif font-normal">
                  in four steps.
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOW_IT_WORKS.map((step, idx) => (
                <div key={step.step}
                  className="group relative rounded-[28px] p-6 bg-white border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-5">
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-14 -right-3 w-6 h-px bg-gradient-to-r from-slate-200 to-transparent z-10" />
                  )}
                  <div className="flex items-center justify-between">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg', step.gradient)}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-5xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────── */}
        <section id="testimonials" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-14">
            <div className="text-center space-y-4">
              <span className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> Testimonials
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Real Nigerians.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic font-serif font-normal">
                  Real results.
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="group relative rounded-[28px] p-8 bg-white border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={cn('absolute top-0 left-0 right-0 h-1.5', t.accent)} />
                  <div className="space-y-6">
                    <Quote className="w-8 h-8 text-slate-100" />
                    <p className="text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-indigo-600 font-semibold">{t.role}</p>
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
        <section id="about" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[440px]">
              <div className="absolute left-0 top-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-10 ring-1 ring-slate-200">
                <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                  alt="Learners studying" fill className="object-cover" />
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-20 border-4 border-white ring-1 ring-slate-200">
                <Image src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
                  alt="Professional working" fill className="object-cover" />
              </div>
              <div className="absolute bottom-8 left-8 z-30 p-4 rounded-2xl bg-white shadow-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-bold uppercase tracking-widest">NDPR · CBN Compliant</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Curriculum aligned to<br />Nigerian regulations</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full" /> About Secquiz
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Built for Nigeria.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 italic font-serif font-normal">
                    By Nigerians.
                  </span>
                </h2>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Secquiz was built because we were tired of seeing talented Nigerians pay USD prices for
                international courses that had nothing to do with our market, our regulations (NDPR, CBN),
                or our employers. Every track is designed with the Nigerian job market in mind.
              </p>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { emoji: '🎯', title: 'Our Mission', desc: 'Make world-class cybersecurity education affordable and accessible to every Nigerian who wants it.', bg: 'bg-indigo-50 border-indigo-100' },
                  { emoji: '👁️', title: 'Our Vision', desc: 'A Nigeria where every cybersecurity role is filled by a Nigerian professional trained for that exact job.', bg: 'bg-violet-50 border-violet-100' },
                ].map(item => (
                  <div key={item.title} className={cn('rounded-2xl p-5 border space-y-3', item.bg)}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/quiz">
                <Button className="rounded-full px-8 h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-200/60 active:scale-95 transition-all">
                  Find My Track <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────── */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Your cybersecurity career
              <br />starts with 5 questions.
            </h2>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto">
              Take the free quiz, get matched to your track, and pay once for lifetime access.
              No deadlines. No group pressure. Just progress.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/quiz">
                <Button size="lg"
                  className="rounded-full px-10 h-14 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-base gap-2 shadow-2xl active:scale-95 transition-all">
                  Take the Free Quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="ghost"
                  className="rounded-full px-8 h-14 border border-white/40 text-white hover:bg-white/15 font-semibold gap-2">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Have questions?</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              We're a WhatsApp message away. Our team typically responds within a few hours.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg"
                className="mt-4 rounded-full px-8 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Sec<span className="text-indigo-400">quiz</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Nigeria's cybersecurity learning academy. Self-paced, affordable, portfolio-driven.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-slate-400 font-medium">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
            ))}
            <Link href="/quiz" className="text-indigo-400 hover:text-indigo-300 font-semibold">Find Your Track</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Secquiz. All rights reserved.</p>
          <p>Built for Nigeria 🇳🇬 · Powered by Supabase · Payments by Paystack · Deployed on Vercel</p>
        </div>
      </footer>
    </div>
  );
}
