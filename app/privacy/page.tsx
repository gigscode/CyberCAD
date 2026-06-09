'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-sm font-medium">Last updated: {lastUpdated}</p>
          <p className="text-slate-500 text-base leading-relaxed">
            SecAcad (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal information
            in accordance with the Nigeria Data Protection Regulation (NDPR) 2019 and the
            Nigeria Data Protection Act (NDPA) 2023. This policy explains how we collect, use,
            store, and protect your data when you use our platform at{' '}
            <span className="text-orange-600 font-semibold">secacad.ng</span>.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-10">

          <Section title="1. Who We Are">
            <p>
              SecAcad is a self-paced online cybersecurity academy built for the Nigerian market,
              operated from Lagos, Nigeria. We are a data controller under the NDPR and NDPA.
            </p>
            <p>
              For data protection enquiries, contact us via WhatsApp or email at{' '}
              <span className="text-orange-600 font-semibold">privacy@secacad.ng</span>.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect only the data necessary to provide our service:</p>
            <SubHeading>a) Account Information</SubHeading>
            <ul>
              <li>First name, last name, and email address (collected at registration)</li>
              <li>Password (stored as a cryptographic hash — we never see your raw password)</li>
              <li>Optional profile fields: avatar, bio, title, location, LinkedIn, GitHub, Twitter, website URL</li>
            </ul>
            <SubHeading>b) Learning Data</SubHeading>
            <ul>
              <li>Lessons completed, quiz scores, assignment submissions, and course progress</li>
              <li>Study streak and weekly hours (computed from your activity)</li>
              <li>WhatsApp mentorship button click logs (timestamp and course context only)</li>
            </ul>
            <SubHeading>c) Payment Data</SubHeading>
            <ul>
              <li>Paystack transaction reference, amount (in kobo), plan type, and payment status</li>
              <li>We do <strong>not</strong> store card numbers, CVVs, bank account details, or any other
              payment credentials. All payment processing is handled by Paystack (PCI DSS Level 1 compliant).</li>
            </ul>
            <SubHeading>d) Technical Data</SubHeading>
            <ul>
              <li>Session cookies for authentication (set by Supabase Auth)</li>
              <li>Sidebar state cookie (functional, not tracking)</li>
              <li>IP address and browser type (logged by our hosting provider, Vercel, for security)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <Table
              headers={['Purpose', 'Legal Basis (NDPR)']}
              rows={[
                ['Create and manage your account', 'Contract performance'],
                ['Deliver course content you have purchased', 'Contract performance'],
                ['Process and verify payments via Paystack', 'Contract performance'],
                ['Track your personal learning progress', 'Contract performance'],
                ['Send in-app notifications (grade alerts, payment confirmations)', 'Contract performance'],
                ['Grade your assignment submissions', 'Contract performance'],
                ['Respond to WhatsApp mentorship requests', 'Contract performance'],
                ['Improve platform quality and fix bugs', 'Legitimate interests'],
                ['Comply with Nigerian financial and data protection law', 'Legal obligation'],
              ]}
            />
          </Section>

          <Section title="4. Data Sharing">
            <p>We do <strong>not</strong> sell, rent, or trade your personal data. We share data only with:</p>
            <ul>
              <li>
                <strong>Supabase</strong> — our database and authentication provider. Data is stored on
                their infrastructure. See{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Supabase Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Paystack</strong> — our payment processor. They receive your email address and
                payment amount to process transactions. See{' '}
                <a href="https://paystack.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Paystack Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Cloudinary</strong> — if you upload a profile avatar. See{' '}
                <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Cloudinary Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Vercel</strong> — our hosting provider. See{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Vercel Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Law enforcement</strong> — only when required by a valid Nigerian court order or
                statutory obligation.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>We use the following cookies:</p>
            <Table
              headers={['Cookie', 'Type', 'Purpose', 'Duration']}
              rows={[
                ['supabase-auth-token', 'Essential', 'Keeps you logged in', 'Session / 1 week'],
                ['sidebar:state', 'Functional', 'Remembers sidebar open/closed', '7 days'],
              ]}
            />
            <p>
              We do <strong>not</strong> use advertising, tracking, or analytics cookies. We do not use
              Google Analytics or any third-party tracking pixels.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <ul>
              <li><strong>Account data</strong> — retained for as long as your account is active.</li>
              <li><strong>Payment records</strong> — retained for 7 years in compliance with Nigerian financial regulations (FIRS).</li>
              <li><strong>Learning data</strong> — retained for as long as your account is active.</li>
              <li><strong>Deleted accounts</strong> — personal data purged within 30 days of account deletion, except where retention is required by law.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights Under NDPR / NDPA">
            <p>As a data subject under Nigerian law, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of all personal data we hold about you</li>
              <li><strong>Correction</strong> — update inaccurate or incomplete data via your profile settings</li>
              <li><strong>Deletion</strong> — request erasure of your personal data (subject to our legal retention obligations)</li>
              <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent</strong> — where processing is consent-based, you may withdraw at any time</li>
            </ul>
            <p>
              To exercise any of these rights, send a WhatsApp message or email to{' '}
              <span className="text-orange-600 font-semibold">privacy@secacad.ng</span>. We will respond
              within 30 days as required by the NDPA.
            </p>
          </Section>

          <Section title="8. Security">
            <p>We take reasonable technical and organisational measures to protect your data, including:</p>
            <ul>
              <li>HTTPS encryption for all data in transit</li>
              <li>Row-Level Security (RLS) enforced on all database tables — no user can access another user&apos;s data</li>
              <li>Passwords hashed using bcrypt via Supabase Auth</li>
              <li>Paystack webhook payloads verified using HMAC-SHA512 signatures</li>
              <li>API secrets never exposed to the browser or committed to source control</li>
            </ul>
            <p>
              No method of transmission over the internet is 100% secure. In the event of a data breach
              that poses a risk to your rights, we will notify you and the Nigeria Data Protection Commission
              (NDPC) within 72 hours as required by law.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              SecAcad is not directed at persons under the age of 18. We do not knowingly collect
              personal data from minors. If you believe a minor has registered, contact us immediately
              and we will delete the account.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy from time to time. Material changes will be communicated via
              an in-app notification. The &ldquo;Last updated&rdquo; date at the top of this page will always
              reflect the current version. Continued use of SecAcad after changes constitutes acceptance
              of the revised policy.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              For any privacy questions, data subject requests, or complaints:
            </p>
            <ul>
              <li><strong>Email:</strong> privacy@secacad.ng</li>
              <li><strong>WhatsApp:</strong> Available via the chat button on our website</li>
              <li><strong>Regulator:</strong> You may also lodge a complaint with the{' '}
                <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">
                  Nigeria Data Protection Commission (NDPC)
                </a>
              </li>
            </ul>
          </Section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link href="/terms" className="hover:text-orange-600 transition-colors">Terms of Service</Link>
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
      <div className="text-slate-500 leading-relaxed space-y-3 text-[15px] [&_strong]:text-slate-700 [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="font-semibold text-slate-700 mt-4">{children}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-500 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
