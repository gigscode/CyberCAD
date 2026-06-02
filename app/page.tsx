'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TRACKS } from '@/lib/quiz-engine';
import {
  ArrowRight, ArrowUpRight, ShieldCheck, Target, Eye,
  Check, MessageSquare, Quote, Star, Menu, X,
  Search, BookOpen, Clock, Zap, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const FEATURED_TRACKS = [
  TRACKS['ethical-hacking'],
  TRACKS['soc-blue-team'],
  TRACKS['grc'],
  TRACKS['digital-forensics'],
  TRACKS['cloud-security'],
  TRACKS['foundations'],
];

const TESTIMONIALS = [
  {
    name: 'Adaeze Okonkwo',
    role: 'SOC Analyst, Stanbic IBTC',
    location: 'Lagos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adaeze',
    quote:
      'I was a bank teller with zero IT background. Six months after completing the SOC Analyst track, I landed a role at a top bank. Secquiz taught me real skills, not just theory.',
  },
  {
    name: 'Emeka Nwosu',
    role: 'Penetration Tester, Freelance',
    location: 'Abuja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka',
    quote:
      'The Ethical Hacking track is the real deal. The pentest report I submitted as my capstone project got me my first paying client before I even finished the course.',
  },
  {
    name: 'Fatima Bello',
    role: 'GRC Analyst, MTN Nigeria',
    location: 'Kano',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    quote:
      'Coming from a compliance background, the GRC track was perfectly aligned to my experience. I got a 40% salary increase after completing it.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Take the 2-minute quiz',
    desc: 'Answer 5 questions about your background and goals. We match you to the right cybersecurity track — no guesswork.',
    icon: Target,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    step: '02',
    title: 'Pay once, access forever',
    desc: 'Pay via Paystack in seconds. Your course access is activated automatically — no approval, no waiting.',
    icon: Zap,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    step: '03',
    title: 'Learn at your pace',
    desc: 'Study when you want, as fast or slow as you need. No deadlines, no group schedules. Quit your day job? Optional.',
    icon: Clock,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    step: '04',
    title: 'Graduate with a portfolio',
    desc: 'Every track ends with a capstone project graded by our team. You leave with a professional document to show employers.',
    icon: Award,
    color: 'bg-violet-50 text-violet-600',
  },
];

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(user?.role === 'super-admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, description, level, duration, price_kobo')
        .eq('is_published', true)
        .eq('is_public', true)
        .ilike('name', searchQuery ? `%${searchQuery}%` : '%');
      setCourses(data ?? []);
    };
    fetchCourses();
  }, [searchQuery]);

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

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 md:h-20 flex items-center justify-between py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sec<span className="text-indigo-600">quiz</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7 font-medium text-[15px] text-slate-600">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className="hover:text-indigo-600 transition-colors py-1">
                {l.label}
              </a>
            ))}
            <Link href="/quiz"
              className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Find Your Track
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline"
                className="rounded-full px-5 h-10 border-slate-200 text-slate-700 font-semibold hover:border-indigo-300 hover:text-indigo-600">
                Login
              </Button>
            </Link>
            <Link href="/quiz">
              <Button className="rounded-full px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200">
                Start Free Quiz
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl border border-slate-200">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl z-50">
            <div className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}
                  className="py-3 px-2 font-medium text-slate-700 border-b border-slate-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}>
                  {l.label}
                </a>
              ))}
              <Link href="/quiz"
                className="py-3 px-2 font-semibold text-emerald-600 flex items-center gap-2 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Find Your Track
              </Link>
              <div className="flex gap-3 pt-4">
                <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full h-12">Login</Button>
                </Link>
                <Link href="/quiz" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full rounded-full h-12 bg-indigo-600 text-white">Start Quiz</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section id="home" className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-50/60 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50/40 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                  Nigeria's #1 Cybersecurity Academy
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
                Break into{' '}
                <span className="text-indigo-600">Cybersecurity</span>
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
                    className="rounded-full px-8 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-200/50 gap-2">
                    Find Your Track <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline"
                    className="rounded-full px-8 h-14 border-slate-200 text-slate-700 font-semibold text-base hover:bg-slate-50">
                    I already have an account
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-slate-400 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                2-minute quiz — no signup required to see your result
              </p>

              {/* Trust badges */}
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

            {/* Right — hero image + floating cards */}
            <div className="relative hidden lg:block h-[580px]">
              <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                  alt="Nigerian cybersecurity professional"
                  fill className="object-cover object-center"
                />
              </div>
              {/* Floating card 1 */}
              <Card className="absolute -left-10 top-1/3 p-4 rounded-2xl shadow-xl border-none w-52 bg-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Latest graduate</p>
                <div className="flex items-center gap-3">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde" alt="Tunde"
                    className="w-10 h-10 rounded-full bg-slate-100" />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Tunde A.</p>
                    <p className="text-xs text-indigo-600 font-semibold">SOC Analyst · Lagos</p>
                  </div>
                </div>
              </Card>
              {/* Floating card 2 */}
              <Card className="absolute -right-8 bottom-1/3 p-4 rounded-2xl shadow-xl border-none w-48 bg-white">
                <div className="text-2xl font-bold text-indigo-600 mb-0.5">1,000+</div>
                <p className="text-xs text-slate-500 font-medium">Nigerians transitioning<br/>into cybersecurity</p>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Stats strip ────────────────────────────────────── */}
        <div className="bg-indigo-600 text-white py-5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-4 text-sm md:text-base font-bold">
            {[
              '6 Cybersecurity Tracks',
              'Self-Paced Learning',
              'Portfolio Projects Included',
              'WhatsApp Mentorship',
              'Paystack Payments',
            ].map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                {i > 0 && <span className="text-indigo-300 hidden sm:inline">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tracks section ─────────────────────────────────── */}
        <section id="tracks" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-14">
            <div className="text-center space-y-4">
              <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> Cybersecurity Tracks
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Six paths. One goal:{' '}
                <span className="text-indigo-600 italic font-serif font-normal">getting you hired.</span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Every track ends with a capstone project — a real deliverable you can show any employer in Nigeria.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_TRACKS.map(track => (
                <Link key={track.slug} href={`/quiz/result?track=${
                  Object.entries(TRACKS).find(([, v]) => v.slug === track.slug)?.[0] ?? 'foundations'
                }`}>
                  <Card className="h-full p-6 rounded-[28px] border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-4xl">{track.icon}</span>
                      <div className={cn('text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full', track.accentColor)}>
                        {track.duration}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium">{track.tagline}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        ₦{(track.priceKobo / 100).toLocaleString('en-NG')}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center space-y-4 pt-6">
              <Link href="/quiz">
                <Button size="lg"
                  className="rounded-full px-10 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-xl shadow-indigo-100">
                  Not sure which track? Take the quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-400 font-medium">
                5 questions · 2 minutes · instant recommendation
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
            <div className="text-center space-y-4">
              <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> How It Works
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                From zero to job-ready
                <br />
                <span className="text-indigo-600 italic font-serif font-normal">in four steps.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map(step => (
                <div key={step.step} className="relative space-y-5 p-6 rounded-[28px] bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', step.color)}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className="text-5xl font-black text-slate-100">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ──────────────────────────────────────────── */}
        <section id="about" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[480px]">
              <div className="absolute left-0 top-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-10">
                <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                  alt="Learners studying" fill className="object-cover" />
              </div>
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 rounded-3xl overflow-hidden shadow-2xl z-20 border-8 border-slate-50">
                <Image src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop"
                  alt="Professional working" fill className="object-cover" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full" /> About Secquiz
                </span>
                <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Built for Nigeria.
                  <br />
                  <span className="text-indigo-500 italic font-serif font-normal">By Nigerians.</span>
                </h2>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Secquiz was built because we were tired of seeing talented Nigerians pay USD prices for
                international courses that had nothing to do with our market, our regulations (NDPR, CBN),
                or our employers. Every track is designed with the Nigerian job market in mind.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">🎯</div>
                    <h3 className="font-bold text-slate-900">Our Mission</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Make world-class cybersecurity education affordable and accessible to every Nigerian who wants it.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">👁️</div>
                    <h3 className="font-bold text-slate-900">Our Vision</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    A Nigeria where every cybersecurity role is filled by a Nigerian professional trained for that exact job.
                  </p>
                </div>
              </div>
              <Link href="/quiz">
                <Button className="rounded-full px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2">
                  Find My Track <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section id="testimonials" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-14">
            <div className="text-center space-y-4">
              <span className="text-indigo-600 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-indigo-600 rounded-full" /> Testimonials
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Real Nigerians.{' '}
                <span className="text-indigo-600 italic font-serif font-normal">Real results.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <Card key={i} className="p-8 rounded-[28px] border border-slate-100 hover:shadow-xl transition-all duration-300 relative group bg-slate-50/50 hover:bg-white">
                  <Quote className="absolute top-6 right-6 w-10 h-10 text-indigo-100 group-hover:text-indigo-200 transition-colors" />
                  <div className="space-y-6 relative z-10">
                    <p className="text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        <p className="text-xs text-indigo-600 font-semibold">{t.role}</p>
                        <p className="text-xs text-slate-400">{t.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────── */}
        <section className="py-20 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
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
                  className="rounded-full px-10 h-14 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-base gap-2 shadow-xl">
                  Take the Free Quiz <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline"
                  className="rounded-full px-8 h-14 border-white/40 text-white hover:bg-white/10 font-semibold gap-2">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Contact ────────────────────────────────────────── */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900">Have questions?</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              We're a WhatsApp message away. Our team typically responds within a few hours.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg"
                className="mt-4 rounded-full px-8 h-12 bg-green-500 hover:bg-green-600 text-white font-semibold gap-2 shadow-lg shadow-green-200">
                <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
              </Button>
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
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
            <Link href="/quiz" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
              Find Your Track
            </Link>
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
