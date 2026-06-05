'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Tracks', href: '/#tracks' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'Contact', href: '/#contact' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'super-admin' ? '/admin' : '/dashboard');
    } else if (!isAuthenticated && !user) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Soft Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-lg shadow-orange-200">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sec<span className="text-orange-600">quiz</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7 font-medium text-[15px] text-slate-500">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-slate-900 transition-colors">{l.label}</Link>
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
                <Link key={l.href} href={l.href}
                  className="py-3 px-3 font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-50"
                  onClick={() => setIsMenuOpen(false)}>{l.label}</Link>
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

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-md space-y-8">

        {/* Login Card */}
        <Card className="bg-white border-slate-100 shadow-2xl rounded-[32px] overflow-hidden p-2">
          <CardHeader className="space-y-1 md:p-8 p-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Enter your credentials to access your workspace portal</CardDescription>
          </CardHeader>
          <CardContent className="md:p-8 p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-100 h-12 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-orange-500/10 focus:border-orange-500/50 rounded-2xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Password
                  </label>
                  <button type="button" className="text-[10px] font-bold text-orange-600 hover:text-orange-700 uppercase tracking-widest transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-slate-50 border-slate-100 h-12 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 focus:ring-orange-500/10 focus:border-orange-500/50 rounded-2xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 transition-all active:scale-95 group mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>

            {/* Sign up link */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500 font-medium">New to SecQuiz? </span>
              <Link href="/register" className="text-orange-600 font-bold hover:text-orange-700 transition-colors">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        {/* <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] pt-4">
          Protected by Enterprise Shield Architecture
        </p> */}
        </div>
      </div>
    </div>
  );
}
