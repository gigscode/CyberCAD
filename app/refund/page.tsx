'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Refund Policy</h1>
          <p className="text-slate-400 text-sm font-medium">Last updated: {lastUpdated}</p>
          <p className="text-slate-500 text-base leading-relaxed">
            We want you to be confident in your purchase. This policy explains when and how you can
            request a refund for a SecAcad course.
          </p>
        </div>

        <div className="space-y-10">

          <Section title="1. Our 7-Day Refund Guarantee">
            <p>
              If you are not satisfied with your course purchase, you may request a full refund
              within <strong>7 calendar days</strong> of the payment date, provided you have completed
              <strong> less than 20%</strong> of the course content (lessons watched + quizzes attempted).
            </p>
            <p>
              This policy exists because our courses provide immediate, permanent access to digital
              content. Once a significant portion of the content has been consumed, a refund is no
              longer available.
            </p>
          </Section>

          <Section title="2. Eligibility Criteria">
            <p>A refund will be approved if <strong>all</strong> of the following are true:</p>
            <ul>
              <li>The refund request is submitted within 7 calendar days of your payment date</li>
              <li>You have completed less than 20% of the course (measured by lessons completed)</li>
              <li>The request is submitted by the account holder who made the purchase</li>
              <li>You have not previously received a refund for the same course</li>
            </ul>
            <p>Refunds are <strong>not</strong> available if:</p>
            <ul>
              <li>More than 7 days have passed since payment</li>
              <li>You have completed 20% or more of the course content</li>
              <li>The purchase was made under a promotional price or free access code</li>
              <li>Your account has been suspended for violating our Terms of Service</li>
            </ul>
          </Section>

          <Section title="3. How to Request a Refund">
            <p>
              To request a refund, contact us within the 7-day window using one of the following:
            </p>
            <ul>
              <li>
                <strong>WhatsApp:</strong> Send a message via the chat button on our website. Include
                your registered email address, the course name, and your reason for the refund.
              </li>
              <li>
                <strong>Email:</strong> Send a request to{' '}
                <span className="text-orange-600 font-semibold">refunds@secacad.ng</span> with the
                subject line &ldquo;Refund Request — [Course Name]&rdquo;.
              </li>
            </ul>
            <p>
              We will verify your eligibility (payment date and progress percentage) and respond
              within <strong>2 business days</strong>.
            </p>
          </Section>

          <Section title="4. Refund Processing">
            <ul>
              <li>Approved refunds are processed via <strong>Paystack</strong> back to your original payment method.</li>
              <li>Processing time is typically <strong>3–10 business days</strong> depending on your bank.</li>
              <li>Once a refund is approved, your course access will be revoked immediately.</li>
              <li>SecAcad is not responsible for delays caused by your bank or card issuer.</li>
            </ul>
          </Section>

          <Section title="5. Technical Issues">
            <p>
              If you are unable to access your course due to a technical fault on our side, please
              contact us immediately via WhatsApp. We will resolve the issue or offer a refund
              regardless of the 7-day window if the fault is confirmed to be on our end.
            </p>
          </Section>

          <Section title="6. Chargebacks">
            <p>
              We ask that you contact us before initiating a chargeback with your bank. Unauthorised
              chargebacks will result in immediate account suspension while the dispute is investigated.
              We will respond to all chargeback disputes with full payment documentation.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be communicated via in-app
              notification. The policy in effect at the time of your purchase applies to that purchase.
            </p>
          </Section>

          <Section title="8. Contact">
            <ul>
              <li><strong>Email:</strong> refunds@secacad.ng</li>
              <li><strong>WhatsApp:</strong> Available via the chat button on our website</li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-orange-600 transition-colors">Terms of Service</Link>
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
