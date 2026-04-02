import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'For individuals exploring AI blog generation.',
    color: 'var(--border)',
    cta: 'Get started for free',
    ctaClass: 'btn-ghost',
    features: [
      '5 blog generations per month',
      'Markdown export',
      'Web research (closed book topics)',
      'Blog history',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 9, yearly: 7 },
    description: 'For writers who need power, speed, and polish.',
    color: 'var(--blue)',
    cta: 'Upgrade to Pro',
    ctaClass: 'btn-blue',
    highlight: true,
    features: [
      'Unlimited blog generations',
      'PDF + Word export',
      'Full web research (open book + hybrid)',
      'Post directly to Twitter/X',
      'AI image generation per blog',
      'Priority support',
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="section" style={{ position: 'relative' }}>

      <div className="glow-line" style={{ marginBottom: '112px' }} />

      <div className="container" style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '56px', textAlign: 'center' }}
        >
          <p className="section-label">Pricing</p>
          <h2 className="section-title">Simple, honest pricing</h2>
          <p className="section-sub" style={{ margin: '16px auto 0' }}>
            Start free. Upgrade when your blogs need to go further.
          </p>

          {/* Toggle */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            marginTop: '32px',
            padding: '6px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-full)',
            fontSize: '14px',
            color: 'var(--text-2)',
          }}>
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: '8px 20px', borderRadius: 'var(--r-full)', border: 'none',
                background: !yearly ? 'var(--surface-2)' : 'transparent',
                color: !yearly ? 'var(--text)' : 'var(--text-2)',
                fontSize: '14px', fontWeight: 500, cursor: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: '8px 20px', borderRadius: 'var(--r-full)', border: 'none',
                background: yearly ? 'var(--surface-2)' : 'transparent',
                color: yearly ? 'var(--text)' : 'var(--text-2)',
                fontSize: '14px', fontWeight: 500, cursor: 'none',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              Yearly
              <span style={{
                padding: '2px 8px', background: 'var(--green)',
                color: '#fff', borderRadius: 'var(--r-full)',
                fontSize: '11px', fontWeight: 600,
              }}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid-2">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: '36px',
                borderRadius: 'var(--r-xl)',
                background: plan.highlight ? 'var(--surface)' : 'var(--bg-2)',
                border: `1px solid ${plan.highlight ? 'var(--blue)' : 'var(--border)'}`,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: plan.highlight ? 'var(--shadow-glow-blue)' : 'none',
              }}
            >
              {/* Highlight glow */}
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: '-60px', right: '-40px',
                  width: '200px', height: '200px',
                  background: 'radial-gradient(ellipse, rgba(79,142,247,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Popular badge */}
              {plan.highlight && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px',
                  background: 'rgba(79,142,247,0.15)',
                  border: '1px solid rgba(79,142,247,0.3)',
                  borderRadius: 'var(--r-full)',
                  fontSize: '11px', fontWeight: 600,
                  color: 'var(--blue)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                }}>
                  <Sparkles size={10} />
                  Most popular
                </div>
              )}

              {/* Plan name */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px', fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
              }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 300, marginBottom: '28px' }}>
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '28px' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '52px', fontWeight: 800,
                  color: 'var(--text)', lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  ${yearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span style={{ fontSize: '15px', color: 'var(--text-3)', marginBottom: '8px' }}>
                  /mo
                </span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {plan.features.map((feat, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: plan.highlight ? 'rgba(79,142,247,0.15)' : 'var(--surface)',
                      border: `1px solid ${plan.highlight ? 'rgba(79,142,247,0.3)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2px',
                    }}>
                      <Check size={10} color={plan.highlight ? 'var(--blue)' : 'var(--text-2)'} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-2)', fontWeight: 400, lineHeight: 1.5 }}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button className={`btn ${plan.ctaClass}`} style={{ width: '100%', padding: '14px' }}>
                {plan.cta}
              </button>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}