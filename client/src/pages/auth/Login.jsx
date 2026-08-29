import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, User, Store, Bike, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Direct to role dashboard
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'PHARMACY') navigate('/pharmacy');
      else if (user.role === 'DELIVERY_PARTNER') navigate('/delivery');
      else navigate(from === '/login' ? '/dashboard' : from);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
        Sign In to QuickMeds
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Access your medicine orders, prescriptions, or partner dashboard.
      </p>

      <form onSubmit={handleLogin}>
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. rahul@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginBottom: '1.25rem'
          }}
        >
          <Link
            to="/forgot-password"
            style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 500 }}
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} icon={LogIn}>
          Sign In
        </Button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}
      >
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
