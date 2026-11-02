import React from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/common/Navbar'
import { Calendar, ShieldCheck, Clock, Award, ChevronRight, HeartPulse, Activity } from 'lucide-react'

export const LandingPage: React.FC = () => {
  const specialties = [
    {
      name: 'Cardiology',
      desc: 'Heart care & hypertension',
      count: '12+ Specialists'
    },
    {
      name: 'Dermatology',
      desc: 'Skin, hair & allergy clinics',
      count: '8+ Specialists'
    },
    {
      name: 'Pediatrics',
      desc: 'Newborn care & immunization',
      count: '10+ Specialists'
    },
    {
      name: 'Orthopedics',
      desc: 'Joints, bones & arthroscopy',
      count: '6+ Specialists'
    },
    {
      name: 'Neurology',
      desc: 'Brain, nerves & migraine care',
      count: '5+ Specialists'
    },
    {
      name: 'General Medicine',
      desc: 'Family care & wellness checkups',
      count: '15+ Specialists'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section
        style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 100%)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#CCFBF1', color: '#0F766E', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <Activity size={16} /> Certified Healthcare Provider Network
          </div>

          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, maxWidth: '850px', margin: '0 auto 1.5rem', letterSpacing: '-0.03em' }}>
            Find and Book Trusted Doctors in <span style={{ color: 'var(--primary)' }}>Minutes</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Connect with verified medical specialists. Transparent fee breakdowns, guaranteed real-time availability slots, and instant digital prescriptions.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/patient/doctors" className="btn btn-primary btn-lg" style={{ minWidth: '200px' }}>Find a Doctor Now <ChevronRight size={18} /></Link>
            <Link to="/doctor/register-doctor" className="btn btn-secondary btn-lg" style={{ minWidth: '200px' }}>Join as a Doctor</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '4.5rem', textAlign: 'left' }}>
            {
              [
                {
                  icon: ShieldCheck,
                  title: 'Verified Specialists',
                  desc: '100% credentialed medical licenses verified by administration.'
                },
                {
                  icon: Calendar,
                  title: 'Instant Slot Booking',
                  desc: 'Direct slot reservation with double-booking prevention.'
                },
                {
                  icon: Clock,
                  title: '24-Hour Reschedule',
                  desc: 'Flexible booking modifications up to 24 hours prior.'
                },
                {
                  icon: HeartPulse,
                  title: 'Digital Prescriptions',
                  desc: 'Secure, private diagnosis & medication records accessible anytime.'
                }
              ].map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Icon size={22} />
                    </div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{f.title}</h4>
                    <p style={{ fontSize: '0.875rem' }}>{f.desc}</p>
                  </div>
                )
              })
            }
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Browse by Medical Specialty</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>Find the right care for your needs across our verified clinical departments.</p>
        </div>

        <div className="grid-3">
          {
            specialties.map((s, idx) => (
              <Link key={idx} to={`/patient/doctors?specialization=${encodeURIComponent(s.name)}`} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.15s ease, border-color 0.15s ease' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{s.name}</h3>
                    <Award size={18} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{s.desc}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{s.count}</span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))
          }
        </div>
      </section>

      <section style={{ marginTop: 'auto', backgroundColor: 'var(--bg-sidebar)', color: '#ffffff', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>Ready to Take Control of Your Health?</h2>
          <p style={{ color: '#94A3B8', maxWidth: '600px', margin: '0 auto 2rem' }}>Book an appointment with top-rated doctors today. Transparent pricing and simple management.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Patient Account</Link>
          <div style={{ borderTop: '1px solid #1E293B', marginTop: '3rem', paddingTop: '1.5rem', color: '#64748B', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} DocCare Connect Healthcare SaaS. All rights reserved.
          </div>
        </div>
      </section>
    </div>
  )
}
