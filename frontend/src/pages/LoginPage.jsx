import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      // Animated beautiful blue/midnight gradient
      background: 'linear-gradient(-45deg, #021629, #042C53, #0C447C, #093059)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
    }}>
      {/* Background Floating Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(55,138,221,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(24,95,165,0.2) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        animation: 'float-delayed 12s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(133,183,235,0.1) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        animation: 'float 14s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div className="glass" style={{
        padding: '3.5rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        {/* Logo Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--color-sky) 0%, var(--color-ocean) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 20px -5px rgba(55, 138, 221, 0.5)'
        }}>
          <Lock color="white" size={32} strokeWidth={2.5} />
        </div>
        
        <h1 style={{ 
          color: 'white', 
          marginBottom: '0.5rem', 
          fontSize: '1.85rem', 
          fontWeight: 700,
          letterSpacing: '-0.5px'
        }}>
          Welcome Back
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.95rem',
          marginBottom: '2.5rem',
          textAlign: 'center'
        }}>
          Sign in to access Template OS
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>Email or ID</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. TCF"
              required
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.border = '1px solid var(--color-sky)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500, display: 'block' }}>Password</label>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.border = '1px solid var(--color-sky)'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
          </div>
          
          {error && (
            <div style={{ 
              color: '#ffb3b3', 
              fontSize: '0.875rem', 
              textAlign: 'center', 
              background: 'rgba(229, 62, 62, 0.15)', 
              border: '1px solid rgba(229, 62, 62, 0.3)',
              padding: '0.75rem', 
              borderRadius: '8px' 
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--color-sky) 0%, var(--color-ocean) 100%)',
              color: 'white',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              marginTop: '1rem',
              opacity: loading ? 0.7 : 1,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 14px 0 rgba(55, 138, 221, 0.39)'
            }}
            onMouseOver={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(55, 138, 221, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if(!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(55, 138, 221, 0.39)';
              }
            }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In <LogIn size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
