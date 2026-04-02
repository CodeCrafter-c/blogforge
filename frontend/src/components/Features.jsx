import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Brain, Layers, FileDown, XIcon, Zap } from 'lucide-react';

const features = [
  {
    icon: Globe,
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
    title: 'Real-time web research',
    description: 'Before writing a single word, our research agent searches the web via Tavily and synthesizes fresh, cited evidence — so your blogs are always accurate and up to date.',
  },
  {
    icon: Brain,
    color: 'var(--green)',
    glow: 'var(--green-glow)',
    title: 'Multi-agent pipeline',
    description: 'A router, researcher, orchestrator, and parallel writer agents work together using LangGraph — each specialized, each doing one thing exceptionally well.',
  },
  {
    icon: Layers,
    color: 'var(--amber)',
    glow: 'var(--amber-glow)',
    title: 'Parallel section writing',
    description: 'Sections are written simultaneously by multiple agents — not one at a time. A 7-section blog takes the same time as writing one section.',
  },
  {
    icon: FileDown,
    color: 'var(--pink)',
    glow: 'var(--pink-glow)',
    title: 'Export in any format',
    description: 'Download your generated blog as Markdown, PDF, or a Word document. Professional formatting included — ready to publish anywhere.',
  },
  {
    icon: XIcon,
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
    title: 'Post directly to Twitter/X',
    description: 'Share your blog summary or key insights straight to Twitter/X with one click. Turn a long-form blog into a viral thread instantly.',
  },
  {
    icon: Zap,
    color: 'var(--green)',
    glow: 'var(--green-glow)',
    title: 'Research-aware planning',
    description: 'The router agent decides if your topic needs web research before planning begins. Evergreen topics go straight to writing — no wasted API calls.',
  },
];

export default function Features() {
  return (
    <section id="features" className="section" style={{ position: 'relative' }}>

      {/* Subtle divider  glow */}
      <div className="glow-line" style={{ marginBottom: '112px' }} />

      <div className="container">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '72px' }}
        >
          <p className="section-label">What it does</p>
          <h2 className="section-title" style={{ maxWidth: '600px' }}>
            Not a blog editor.<br />An AI research team.
          </h2>
          <p className="section-sub" style={{ marginTop: '16px' }}>
            BlogForge doesn't just generate text — it researches, plans, writes, and refines
            using specialized agents that work in parallel.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {/* Card glow */}
              <div style={{
                position: 'absolute', top: '-40px', left: '-20px',
                width: '120px', height: '120px',
                background: `radial-gradient(ellipse, ${f.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div style={{
                width: '40px', height: '40px',
                background: f.color + '18',
                border: `1px solid ${f.color}30`,
                borderRadius: 'var(--r-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <f.icon size={18} color={f.color} strokeWidth={2} />
              </div>

              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '10px',
                letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-2)',
                lineHeight: 1.7,
                fontWeight: 300,
              }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}