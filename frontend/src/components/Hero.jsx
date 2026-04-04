import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Globe, FileText } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const AgentStep = ({ icon: Icon, label, color, delay }) => (
  <motion.div
    {...fadeUp(delay)}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      fontSize: '13px',
      color: 'var(--text-2)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    <div style={{
      width: '24px', height: '24px',
      background: color + '18',
      borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={13} color={color} strokeWidth={2.5} />
    </div>
    {label}
    <motion.div
      style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, marginLeft: 'auto' }}
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, delay: Math.random() * 1 }}
    />
  </motion.div>
);

export default function Hero({onGetStarted}) {
  //     const {signOut}=useClerk()
  //     async function ForceLogout() {
  //       console.log("hi")
  //     await signOut(); // 🔥 THIS WAS MISSING 
  //  }
  return (
    <section style={{ padding: '160px 0 100px', position: 'relative', overflow: 'hidden' }}>
        {/* <button onClick={() => ForceLogout()}>
      Force Logout Clerk
    </button> */}
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px',
        background: 'radial-gradient(ellipse at center, rgba(79,142,247,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(62,207,142,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <div className="badge" style={{ marginBottom: '32px' }}>
              <div className="badge-dot" />
              Powered by Qwen 2.5 + LangGraph
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(44px, 6vw, 80px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: 'var(--text)',
              marginBottom: '28px',
              maxWidth: '860px',
            }}
          >
            Research. Write. Publish.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--blue) 0%, var(--green) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              On autopilot.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.2)}
            style={{
              fontSize: '20px',
              color: 'var(--text-2)',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: '560px',
              marginBottom: '44px',
            }}
          >
            BlogForge uses a multi-agent AI pipeline to research the web, plan structure,
            and write high-quality technical blogs — in minutes, not hours.
          </motion.p>

          {/* CTA row */}
          <motion.div
            {...fadeUp(0.3)}
            style={{ display: 'flex', gap: '14px', marginBottom: '80px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <button className="btn btn-primary" style={{ padding: '15px 32px', fontSize: '16px', gap: '8px' }} onClick={onGetStarted}>
              Generate your first blog
              <ArrowRight size={16} />
            </button>
            <button className="btn btn-ghost" style={{ padding: '15px 32px', fontSize: '16px' }}>
              See how it works
            </button>
          </motion.div>

          {/* Agent pipeline visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%', maxWidth: '860px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: '32px',
              position: 'relative',
            }}
          >
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28ca41' }} />
              <div style={{
                flex: 1, height: '28px', background: 'var(--bg-3)',
                borderRadius: 'var(--r-sm)', marginLeft: '12px',
                display: 'flex', alignItems: 'center', paddingLeft: '12px',
                fontSize: '12px', color: 'var(--text-3)',
              }}>
                blogforge.app/generate
              </div>
            </div>

            {/* Input */}
            <div style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '24px',
            }}>
              <span style={{ fontSize: '14px', color: 'var(--text-2)', flex: 1 }}>
                Write a blog on the State of Multimodal LLMs in 2026
              </span>
              <motion.div
                style={{
                  padding: '8px 16px', background: 'var(--blue)',
                  borderRadius: 'var(--r-full)', fontSize: '13px',
                  color: '#fff', fontWeight: 600,
                }}
                animate={{ boxShadow: ['0 0 0px rgba(79,142,247,0)', '0 0 20px rgba(79,142,247,0.4)', '0 0 0px rgba(79,142,247,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Generate
              </motion.div>
            </div>

            {/* Agent steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <AgentStep icon={Globe}     label="Researching web"    color="var(--blue)"  delay={0.5} />
              <AgentStep icon={FileText}  label="Planning sections"  color="var(--amber)" delay={0.65} />
              <AgentStep icon={Zap}       label="Writing in parallel" color="var(--green)" delay={0.8} />
              <AgentStep icon={ArrowRight} label="Assembling blog"   color="var(--pink)"  delay={0.95} />
            </div>

            {/* Progress bar */}
            <div style={{ marginTop: '24px', height: '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--blue), var(--green))', borderRadius: '2px' }}
                initial={{ width: '0%' }}
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}