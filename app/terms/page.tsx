'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = 'June 2026';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
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
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="space-y-4 mb-12">
          <span className="inline-flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 bg-orange-600 rounded-full" /> Legal
          </span>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 text-sm font-medium">Last updated: {lastUpdated}</p>
          <p className="text-slate-500 text-base leading-relaxed">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using SecAcad. By
            creating an account or purchasing a course, you agree to be bound by these Terms.
            If you do not agree, do not use SecAcad.
          </p>
        </div>

        <div className="space-y-10">

          <Section title="1. About SecAcad">
            <p>
              SecAcad is a self-paced online cybersecurity education platform operated from Lagos,
              Nigeria. We provide structured cybersecurity courses, quizzes, assignments, and
              WhatsApp mentorship support to learners across Nigeria and the diaspora.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <ul>
              <li>You must be at least 18 years old to create an account and make a purchase.</li>
              <li>You must provide accurate and complete registration information.</li>
              <li>You are responsible for maintaining the security of your password and account.</li>
              <li>You may not share your account credentials or allow others to access your account.</li>
            </ul>
          </Section>

          <Section title="3. Accounts">
            <ul>
              <li>You may register as a <strong>Learner</strong> to purchase and access courses.</li>
              <li>Super-admin accounts are restricted to SecAcad staff only.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>
                SecAcad reserves the right to suspend or terminate accounts that violate these Terms,
                engage in fraudulent activity, or misuse the platform.
              </li>
            </ul>
          </Section>

          <Section title="4. Payments">
            <ul>
              <li>All prices are displayed in Nigerian Naira (₦), inclusive of any applicable fees.</li>
              <li>Payments are processed securely by <strong>Paystack</strong>. SecAcad does not store
              your card details.</li>
              <li>All purchases are <strong>one-time payments</strong> that grant permanent access to the
              purchased course(s), subject to these Terms.</li>
              <li>Payment is required before course access is granted. Access is activated automatically
              within 60 seconds of a confirmed payment.</li>
              <li>You are responsible for any bank charges, card fees, or taxes applicable to your payment.</li>
            </ul>
          </Section>

          <Section title="5. Refund Policy">
            <p>
              Please review our{' '}
              <Link href="/refund" className="text-orange-600 font-semibold hover:underline">
                Refund Policy
              </Link>{' '}
              for full details. In summary:
            </p>
            <ul>
              <li>We offer a <strong>7-day refund window</strong> from the date of purchase if you have
              completed less than 20% of the course content.</li>
              <li>Refunds are not available once you have completed 20% or more of the course.</li>
              <li>Refund requests must be submitted via WhatsApp or email within the 7-day window.</li>
            </ul>
          </Section>

          <Section title="6. Course Access &amp; Licences">
            <ul>
              <li>
                Upon payment, SecAcad grants you a <strong>personal, non-transferable, non-exclusive
                licence</strong> to access the purchased course content for your own learning purposes.
              </li>
              <li>You may not share, resell, copy, redistribute, or make course content publicly available.</li>
              <li>You may not screen-record lessons for distribution or re-upload any content to other platforms.</li>
              <li>
                SecAcad reserves the right to update, modify, or remove course content at any time to
                maintain quality and accuracy. Material changes will be communicated via in-app notification.
              </li>
            </ul>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use SecAcad for any unlawful purpose or in violation of Nigerian law</li>
              <li>Attempt to gain unauthorised access to any part of the platform or other users&apos; data</li>
              <li>Upload or transmit malware, spam, or harmful content</li>
              <li>Impersonate SecAcad staff or other users</li>
              <li>Use our WhatsApp mentorship channel for harassment or abuse</li>
              <li>Circumvent any access controls or attempt to bypass payment</li>
              <li>Reverse-engineer, decompile, or scrape platform content or APIs</li>
            </ul>
            <p>
              Violations may result in immediate account suspension without refund and, where appropriate,
              referral to Nigerian law enforcement.
            </p>
          </Section>

          <Section title="8. Quizzes, Assignments &amp; Grades">
            <ul>
              <li>Quizzes are auto-graded. Results are final and for personal tracking only.</li>
              <li>Assignment grades are awarded by SecAcad administrators. We aim to grade within 5 working days.</li>
              <li>Grades are personal and do not constitute a formal qualification unless otherwise stated.</li>
              <li>Portfolio capstone projects remain your intellectual property. By submitting them, you grant SecAcad a non-exclusive licence to use anonymised examples for marketing purposes, unless you opt out.</li>
            </ul>
          </Section>

          <Section title="9. WhatsApp Mentorship">
            <ul>
              <li>WhatsApp mentorship is provided on a best-effort basis. Response times vary by plan tier (Standard: 48 hours, Priority: 24 hours, Elite: 1-on-1 sessions).</li>
              <li>Mentorship is for guidance on course content only. It does not constitute professional legal, financial, or career advice.</li>
              <li>SecAcad reserves the right to withdraw mentorship access from users who are abusive or disrespectful.</li>
            </ul>
          </Section>

          <Section title="10. Intellectual Property">
            <p>
              All course content, videos, quizzes, branding, and platform code are owned by SecAcad or
              its licensors and protected by Nigerian copyright law. Your purchase grants you a personal
              licence to consume the content — it does not transfer ownership.
            </p>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <p>
              SecAcad is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
              express or implied. We do not guarantee that the platform will be error-free or uninterrupted.
              We do not guarantee that completing a course will result in employment or any particular outcome.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by Nigerian law, SecAcad shall not be liable for any
              indirect, incidental, consequential, or punitive damages arising from your use of the
              platform. Our total aggregate liability to you shall not exceed the amount you paid for
              the relevant course in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="13. Governing Law &amp; Disputes">
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any dispute
              arising from these Terms shall first be resolved through good-faith negotiation. If
              unresolved after 30 days, disputes shall be referred to arbitration in Lagos, Nigeria,
              in accordance with the Arbitration and Conciliation Act (Cap A18 LFN 2004).
            </p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will be communicated via
              in-app notification at least 7 days before they take effect. Continued use after changes
              constitutes acceptance.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Contact us:
            </p>
            <ul>
              <li><strong>Email:</strong> legal@secacad.ng</li>
              <li><strong>WhatsApp:</strong> Available via the chat button on our website</li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-orange-600 transition-colors">Refund Policy</Link>
          <Link href="/" className="hover:text-orange-600 transition-colors">Back to Home</Link>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs text-center py-6 px-4">
        © {new Date().getFullYear()} SecAcad. All rights reserved. · Built for Nigeria 🇳🇬
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">{title}</h2>
      <div className="text-slate-500 leading-relaxed space-y-3 text-[15px] [&_strong]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
