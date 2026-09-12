import Link from 'next/link';
import { Zap, FileText, MessageSquare, BookOpen, Shield, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">DocMind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100">
          <Zap className="w-3.5 h-3.5" />
          Powered by Moss — sub-10ms semantic search
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Ask anything about
          <br />
          <span className="text-brand-600">your documents</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your PDFs, notes, and specs. Ask natural-language questions.
          Get instant, <span className="text-slate-700 font-medium">cited answers</span> in under 2 seconds —
          no keyword search, no waiting.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition shadow-lg shadow-brand-200"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition text-base"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs text-slate-400 mt-6">
          Built for YC Fall 2026 × Moss Hackathon · No credit card required
        </p>
      </section>

      {/* ── Latency demo banner ─────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 text-white text-center">
          <div>
            <p className="text-4xl font-extrabold">&lt; 10ms</p>
            <p className="text-brand-200 text-sm mt-1">Retrieval latency</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-brand-500" />
          <div>
            <p className="text-4xl font-extrabold">&lt; 2s</p>
            <p className="text-brand-200 text-sm mt-1">End-to-end answer</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-brand-500" />
          <div>
            <p className="text-4xl font-extrabold">100%</p>
            <p className="text-brand-200 text-sm mt-1">Grounded citations</p>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
          <p className="text-slate-500 text-lg">Three steps. Under 2 seconds.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <FileText className="w-6 h-6 text-brand-600" />,
              title: 'Upload your documents',
              desc: 'Drag & drop PDFs, text files, or markdown. DocMind chunks and indexes them instantly via Moss.',
            },
            {
              step: '02',
              icon: <MessageSquare className="w-6 h-6 text-brand-600" />,
              title: 'Ask in plain English',
              desc: 'Type any question. DocMind finds the most relevant passages in under 10ms using semantic search.',
            },
            {
              step: '03',
              icon: <BookOpen className="w-6 h-6 text-brand-600" />,
              title: 'Get cited answers',
              desc: 'Receive a grounded answer with exact source citations — document name and the relevant excerpt.',
            },
          ].map((item) => (
            <div key={item.step} className="relative bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <span className="absolute top-6 right-6 text-5xl font-black text-slate-100 select-none">
                {item.step}
              </span>
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything you need</h2>
            <p className="text-slate-500 text-lg">Built for speed, built for accuracy.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-brand-600" />,
                title: 'Instant Semantic Search',
                desc: 'Moss delivers sub-10ms retrieval without a vector database. No embedding wait time.',
              },
              {
                icon: <BookOpen className="w-5 h-5 text-brand-600" />,
                title: 'Source Citations',
                desc: 'Every answer shows exactly which document and section it came from. No hallucinations.',
              },
              {
                icon: <FileText className="w-5 h-5 text-brand-600" />,
                title: 'Multi-format Upload',
                desc: 'PDF, TXT, and Markdown supported. Drag & drop or click to upload.',
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-brand-600" />,
                title: 'Chat History',
                desc: 'All your conversations are saved. Come back anytime and continue where you left off.',
              },
              {
                icon: <Shield className="w-5 h-5 text-brand-600" />,
                title: 'Private & Secure',
                desc: 'JWT authentication ensures your documents are only accessible to you.',
              },
              {
                icon: <Zap className="w-5 h-5 text-brand-600" />,
                title: 'Smart Tools (MCP)',
                desc: 'One-click "Summarize this doc" and "Extract action items" — no prompt engineering needed.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Who it&apos;s for</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              emoji: '🎓',
              title: 'Students',
              points: [
                'Ask questions from lecture notes',
                'Revise from textbooks instantly',
                'Find exact quotes for essays',
              ],
            },
            {
              emoji: '💼',
              title: 'Freelancers & Job Seekers',
              points: [
                'Query contracts and agreements',
                'Reference job specs quickly',
                'Compare multiple resumes',
              ],
            },
            {
              emoji: '🏢',
              title: 'Small Teams',
              points: [
                'Search across PRDs and specs',
                'Extract action items from notes',
                'Onboard faster with doc Q&A',
              ],
            },
          ].map((u) => (
            <div key={u.title} className="bg-white rounded-2xl p-8 border border-slate-200">
              <div className="text-4xl mb-4">{u.emoji}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-4">{u.title}</h3>
              <ul className="space-y-2">
                {u.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to talk to your documents?
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            Upload in seconds. Get answers instantly. Free to try.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-bold px-8 py-4 rounded-xl text-base transition shadow-xl"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-700">DocMind</span>
          </div>
          <p className="text-sm text-slate-400">
            Built by Ankit Singh · YC Fall 2026 × Moss Hackathon
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/login" className="hover:text-slate-600 transition">Sign In</Link>
            <Link href="/register" className="hover:text-slate-600 transition">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
