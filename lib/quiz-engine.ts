// ─── Career Path Quiz Engine ──────────────────────────────────────────────────
// Pure client-side scoring — no backend call needed during the quiz itself.
// The result page fetches the matched course from Supabase by slug.

export type TrackKey =
  | 'foundations'
  | 'ethical-hacking'
  | 'soc-blue-team'
  | 'grc'
  | 'digital-forensics'
  | 'cloud-security';

export interface Question {
  id: number;
  text: string;
  subtext?: string;
  options: Option[];
}

export interface Option {
  id: string;
  label: string;
  emoji: string;
  weights: Partial<Record<TrackKey, number>>;
}

export const TRACKS: Record<TrackKey, {
  title: string;
  tagline: string;
  description: string;
  duration: string;
  priceKobo: number;
  roles: string[];
  portfolio: string;
  icon: string;
  color: string;
  accentColor: string;
  slug: string;
}> = {
  foundations: {
    title: 'Cybersecurity Foundations',
    tagline: 'The smart place to start.',
    description:
      'Build the fundamentals every cybersecurity professional needs — networking, cryptography, threat landscapes, and security principles. Aligned with CompTIA Security+.',
    duration: '6–8 weeks',
    priceKobo: 2500000, // ₦25,000
    roles: ['IT Support with Security Focus', 'Junior Security Analyst', 'Entry-level SOC Analyst'],
    portfolio: 'A documented network security assessment on a simulated environment.',
    icon: '🛡️',
    color: 'from-slate-700 to-slate-900',
    accentColor: 'bg-slate-100 text-slate-700',
    slug: 'cybersecurity-foundations',
  },
  'ethical-hacking': {
    title: 'Ethical Hacking & Penetration Testing',
    tagline: 'Find the holes before the bad guys do.',
    description:
      'Learn to think like an attacker. Web application hacking, network exploitation, privilege escalation, and reporting — all on legal lab environments.',
    duration: '9–12 months',
    priceKobo: 9500000, // ₦95,000
    roles: ['Penetration Tester', 'Red Team Analyst', 'Bug Bounty Hunter', 'Security Consultant'],
    portfolio: 'A professional penetration test report on a provided lab target — the exact document you show employers.',
    icon: '⚔️',
    color: 'from-rose-600 to-red-800',
    accentColor: 'bg-rose-50 text-rose-700',
    slug: 'ethical-hacking',
  },
  'soc-blue-team': {
    title: 'SOC Analyst & Blue Team',
    tagline: 'Defend. Detect. Respond.',
    description:
      'Master threat detection, SIEM operations, incident response, and malware analysis. Learn to defend organisations from real-world attacks.',
    duration: '6–9 months',
    priceKobo: 7500000, // ₦75,000
    roles: ['SOC Analyst (Tier 1/2)', 'Incident Responder', 'Threat Hunter', 'Security Engineer'],
    portfolio: 'A full incident response report from a simulated attack scenario — documented chain of custody, timeline, and remediation steps.',
    icon: '🔵',
    color: 'from-blue-600 to-indigo-800',
    accentColor: 'bg-blue-50 text-blue-700',
    slug: 'soc-blue-team',
  },
  grc: {
    title: 'GRC & Compliance',
    tagline: 'Govern risk. Ensure compliance.',
    description:
      'Governance, Risk and Compliance aligned to ISO 27001, NDPR, and NIST. Perfect for professionals in audit, legal, or management moving into cybersecurity.',
    duration: '4–6 months',
    priceKobo: 5000000, // ₦50,000
    roles: ['GRC Analyst', 'Information Security Officer', 'Compliance Manager', 'Risk Analyst'],
    portfolio: 'A complete Information Security Policy + Risk Register for a fictional Nigerian fintech company.',
    icon: '📋',
    color: 'from-emerald-600 to-teal-800',
    accentColor: 'bg-emerald-50 text-emerald-700',
    slug: 'grc-compliance',
  },
  'digital-forensics': {
    title: 'Digital Forensics & DFIR',
    tagline: 'Investigate. Preserve. Report.',
    description:
      'Disk and memory forensics, malware analysis, chain of custody, and incident response. Learn to investigate breaches like a professional.',
    duration: '6–8 months',
    priceKobo: 6500000, // ₦65,000
    roles: ['Digital Forensics Analyst', 'DFIR Specialist', 'Incident Responder', 'Cyber Investigator'],
    portfolio: 'A forensics investigation report with documented evidence, timeline reconstruction, and legal-standard chain of custody.',
    icon: '🔍',
    color: 'from-violet-600 to-purple-800',
    accentColor: 'bg-violet-50 text-violet-700',
    slug: 'digital-forensics',
  },
  'cloud-security': {
    title: 'Cloud Security',
    tagline: 'Secure the cloud-first world.',
    description:
      'AWS and Azure security, IAM, Zero Trust architecture, DevSecOps, and cloud threat modelling. Built for developers and sysadmins moving into security.',
    duration: '6–9 months',
    priceKobo: 7500000, // ₦75,000
    roles: ['Cloud Security Engineer', 'DevSecOps Engineer', 'Cloud Architect', 'Security Consultant'],
    portfolio: 'A hardened cloud architecture design with documented threat model, IAM policies, and security controls.',
    icon: '☁️',
    color: 'from-cyan-600 to-blue-800',
    accentColor: 'bg-cyan-50 text-cyan-700',
    slug: 'cloud-security',
  },
};

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'What is your current background?',
    subtext: 'Be honest — the right track starts where you actually are.',
    options: [
      {
        id: 'a',
        label: 'Complete beginner — no IT experience',
        emoji: '🌱',
        weights: { foundations: 4, grc: 1 },
      },
      {
        id: 'b',
        label: 'I work in IT — support, networking, or sysadmin',
        emoji: '🖥️',
        weights: { 'soc-blue-team': 3, 'cloud-security': 2, 'ethical-hacking': 1 },
      },
      {
        id: 'c',
        label: 'I am a developer or software engineer',
        emoji: '👨‍💻',
        weights: { 'ethical-hacking': 3, 'cloud-security': 3, 'soc-blue-team': 1 },
      },
      {
        id: 'd',
        label: 'I work in audit, compliance, law, or finance',
        emoji: '📊',
        weights: { grc: 4, foundations: 1 },
      },
    ],
  },
  {
    id: 2,
    text: 'What type of work sounds most exciting to you?',
    subtext: 'Go with your gut — this tells us a lot about your career fit.',
    options: [
      {
        id: 'a',
        label: 'Breaking into systems to expose weaknesses (offensive)',
        emoji: '⚔️',
        weights: { 'ethical-hacking': 4, 'digital-forensics': 1 },
      },
      {
        id: 'b',
        label: 'Monitoring, detecting, and stopping attacks (defensive)',
        emoji: '🛡️',
        weights: { 'soc-blue-team': 4, 'cloud-security': 1 },
      },
      {
        id: 'c',
        label: 'Writing policies, managing risk, and ensuring compliance',
        emoji: '📋',
        weights: { grc: 4, foundations: 1 },
      },
      {
        id: 'd',
        label: 'Investigating incidents and recovering from breaches',
        emoji: '🔍',
        weights: { 'digital-forensics': 4, 'soc-blue-team': 2 },
      },
    ],
  },
  {
    id: 3,
    text: 'How much time can you dedicate each week?',
    subtext: 'Realistic expectations prevent frustration. There is no wrong answer.',
    options: [
      {
        id: 'a',
        label: '1–3 hours — very limited, evenings only',
        emoji: '⏱️',
        weights: { foundations: 3, grc: 2 },
      },
      {
        id: 'b',
        label: '4–7 hours — moderate, evenings and weekends',
        emoji: '📅',
        weights: { grc: 2, 'soc-blue-team': 2, 'digital-forensics': 2 },
      },
      {
        id: 'c',
        label: '8–14 hours — serious commitment, I am focused',
        emoji: '🎯',
        weights: { 'ethical-hacking': 2, 'cloud-security': 2, 'soc-blue-team': 1 },
      },
      {
        id: 'd',
        label: '15+ hours — this is my main priority right now',
        emoji: '🚀',
        weights: { 'ethical-hacking': 3, 'cloud-security': 2 },
      },
    ],
  },
  {
    id: 4,
    text: 'What is your main goal after training?',
    subtext: 'Where do you want to be in 12 months?',
    options: [
      {
        id: 'a',
        label: 'Get my first cybersecurity job',
        emoji: '💼',
        weights: { foundations: 2, 'soc-blue-team': 2, 'ethical-hacking': 1 },
      },
      {
        id: 'b',
        label: 'Move from IT or another field into a cyber role',
        emoji: '🔄',
        weights: { 'soc-blue-team': 3, 'cloud-security': 2, grc: 1 },
      },
      {
        id: 'c',
        label: 'Do freelance pentesting or bug bounty hunting',
        emoji: '🏆',
        weights: { 'ethical-hacking': 5 },
      },
      {
        id: 'd',
        label: 'Move into management, policy, or risk',
        emoji: '📈',
        weights: { grc: 4, foundations: 1 },
      },
    ],
  },
  {
    id: 5,
    text: 'What matters most to you in a course?',
    subtext: 'This helps us match you to the right teaching style.',
    options: [
      {
        id: 'a',
        label: 'A clear, structured path — tell me exactly what to do',
        emoji: '🗺️',
        weights: { foundations: 3, grc: 2 },
      },
      {
        id: 'b',
        label: 'Hands-on technical labs and real challenges',
        emoji: '🧪',
        weights: { 'ethical-hacking': 3, 'soc-blue-team': 2, 'digital-forensics': 2 },
      },
      {
        id: 'c',
        label: 'A portfolio project that proves what I can do',
        emoji: '🎨',
        weights: { 'ethical-hacking': 2, 'digital-forensics': 2, 'cloud-security': 2 },
      },
      {
        id: 'd',
        label: 'Business context — understanding the "why" behind security',
        emoji: '💡',
        weights: { grc: 3, foundations: 2 },
      },
    ],
  },
];

export type Answers = Record<number, string>; // questionId → optionId

export function scoreAnswers(answers: Answers): TrackKey {
  const scores: Record<TrackKey, number> = {
    foundations: 0,
    'ethical-hacking': 0,
    'soc-blue-team': 0,
    grc: 0,
    'digital-forensics': 0,
    'cloud-security': 0,
  };

  for (const [qIdStr, optionId] of Object.entries(answers)) {
    const qId = parseInt(qIdStr);
    const question = QUESTIONS.find(q => q.id === qId);
    if (!question) continue;
    const option = question.options.find(o => o.id === optionId);
    if (!option) continue;
    for (const [track, weight] of Object.entries(option.weights)) {
      scores[track as TrackKey] += weight ?? 0;
    }
  }

  // Find highest score; on tie, foundations wins (lower price, better entry point)
  let topTrack: TrackKey = 'foundations';
  let topScore = -1;

  for (const [track, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topTrack = track as TrackKey;
    }
  }

  // If score is very low (< 4 total), default to foundations
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  if (totalScore < 4) return 'foundations';

  return topTrack;
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  trackTitle: string,
  firstName?: string
): string {
  const name = firstName ? `Hi, I'm ${firstName}.` : 'Hi,';
  const message = `${name} I just completed the Secquiz career quiz and got matched to "${trackTitle}". I'd like to learn more before enrolling. Can you help?`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
