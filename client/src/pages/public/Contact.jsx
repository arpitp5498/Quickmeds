import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to our support desk.', 'success');
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Contact QuickMeds Support</h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Have questions or need assistance with your pharmacy partnership or order?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Phone size={20} color="var(--primary-600)" style={{ marginTop: '2px' }} />
            <div>
              <h5 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>24/7 Urgent Helpline</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>+91 1800-QUICKMEDS / +91 98110 00000</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Mail size={20} color="var(--primary-600)" style={{ marginTop: '2px' }} />
            <div>
              <h5 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Email Inquiries</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>support@quickmeds.in / partners@quickmeds.in</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <MapPin size={20} color="var(--primary-600)" style={{ marginTop: '2px' }} />
            <div>
              <h5 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Headquarters</h5>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                QuickMeds Health Tech, Connaught Place, New Delhi 110001
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color="var(--secondary-600)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Message Received!</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Our support team will respond to your registered email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input
                label="Your Name"
                placeholder="Full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Message / Query"
                as="textarea"
                rows={4}
                placeholder="How can we assist you?"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button type="submit" variant="primary" fullWidth icon={Send}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
