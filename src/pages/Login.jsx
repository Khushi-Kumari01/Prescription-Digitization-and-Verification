import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Login.css';

export default function LoginPage() {
  const { login, toast } = useApp();
  const [screen, setScreen]     = useState('login'); // login | signup | forgot | otp | newpw
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [pwStrength, setPwStrength] = useState(0);

  // Form fields
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname]   = useState('');
  const [remember, setRemember] = useState(false);
  const [otp, setOtp]       = useState(['','','','','','']);
  const [newPw, setNewPw]   = useState('');

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8)      s++;
    if (/[A-Z]/.test(pw))    s++;
    if (/[0-9]/.test(pw))    s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const handleLogin = async () => {
    if (!email || !password) { toast('Please fill all fields', 'error'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast('Enter a valid email', 'error'); return; }
    if (password.length < 6) { toast('Password too short', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    // Check saved accounts
    let accounts = [];
    try { accounts = JSON.parse(localStorage.getItem('ms_accounts') || '[]'); } catch {}
    const found = accounts.find(a => a.email === email && a.password === password);
    const userData = found || {
      email, name: email.split('@')[0],
      role: 'Doctor', hospital: '', initials: email[0].toUpperCase()
    };
    login(userData, remember);
    toast('Welcome back, ' + (userData.name || 'Doctor') + ' 👋', 'success');
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!fname || !email || !password) { toast('Please fill all fields', 'error'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { toast('Enter a valid email', 'error'); return; }
    if (password.length < 8) { toast('Password must be at least 8 characters', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const userData = { email, name: fname, role: 'Doctor', hospital: '', password, initials: fname[0].toUpperCase() };
    let accounts = [];
    try { accounts = JSON.parse(localStorage.getItem('ms_accounts') || '[]'); } catch {}
    accounts.push(userData);
    localStorage.setItem('ms_accounts', JSON.stringify(accounts));
    login(userData, true);
    toast('Account created! Welcome, ' + fname + ' 🎉', 'success');
    setLoading(false);
  };

  const handleGoogle = () => {
    const userData = { email: 'doctor@gmail.com', name: 'Dr. User', role: 'Doctor', hospital: '', initials: 'DU' };
    login(userData, true);
    toast('Signed in with Google ✓', 'success');
  };

  const handleOTP = (val, idx) => {
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus();
  };

  const otpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`otp-${idx-1}`)?.focus();
  };

  const strengthLabel = ['','Weak','Fair','Good','Strong'];
  const strengthColor = ['','#FF4757','#FFB300','#00B4D8','#00C853'];

  return (
    <div className="auth-wrap">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="al-orb al-orb-1"/>
        <div className="al-orb al-orb-2"/>
        <div className="al-orb al-orb-3"/>

        <div className="al-brand">
          <div className="al-brand-icon">
            <span className="material-symbols-rounded" style={{fontSize:24,color:'white',fontVariationSettings:"'FILL' 1"}}>medical_services</span>
          </div>
          <span className="al-brand-name">RXGuardian<span> AI</span></span>
        </div>

        <div className="al-hero">
          <div className="al-label"><span className="al-dot"/>AI-Powered Healthcare</div>
          <h1 className="al-title">Scan. Extract.<br/><em>Verify.</em></h1>
          <p className="al-desc">Transform handwritten prescriptions into structured, verified medical data — instantly.</p>
          <div className="al-stats">
            {[['99.2%','OCR Accuracy'],['4.2s','Avg Scan Time'],['500K+','Prescriptions']].map(([v,l]) => (
              <div className="al-stat" key={l}>
                <div className="al-stat-val">{v}</div>
                <div className="al-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="al-trust">
          {['HIPAA Compliant','256-bit Encrypted','ISO 27001'].map(t => (
            <div className="al-trust-item" key={t}>
              <span className="material-symbols-rounded" style={{fontSize:14}}>verified</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-box">

          {/* ── LOGIN ── */}
          {screen === 'login' && (
            <div className="auth-screen">
              <div className="auth-screen-top">
                <h2>Welcome back</h2>
                <p>Sign in to your account · <a onClick={() => setScreen('signup')}>Create account</a></p>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrap">
                  <input className="form-input" type="email" placeholder="doctor@hospital.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
                  <button className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                    <span className="material-symbols-rounded">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="auth-row">
                <label className="remember-label">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>
                  Remember me
                </label>
                <a className="forgot-link" onClick={() => setScreen('forgot')}>Forgot password?</a>
              </div>

              <button className={`btn-main${loading ? ' loading' : ''}`} onClick={handleLogin} disabled={loading}>
                <span className="btn-text">Sign In →</span>
              </button>

              <p className="auth-footer">Don't have an account? <a onClick={() => setScreen('signup')}>Sign up free</a></p>
            </div>
          )}

          {/* ── SIGNUP ── */}
          {screen === 'signup' && (
            <div className="auth-screen">
              <div className="auth-screen-top">
                <span className="screen-tag">Create Account</span>
                <h2>Get started free</h2>
                <p>Already have an account? <a onClick={() => setScreen('login')}>Sign in</a></p>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <input className="form-input" type="text" placeholder="Dr. Full Name"
                    value={fname} onChange={e => setFname(e.target.value)}/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrap">
                  <input className="form-input" type="email" placeholder="doctor@hospital.com"
                    value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={password} onChange={e => { setPassword(e.target.value); setPwStrength(calcStrength(e.target.value)); }}/>
                  <button className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                    <span className="material-symbols-rounded">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {password && (
                  <div className="pw-meter">
                    <div className="pw-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="pw-bar" style={{background: i <= pwStrength ? strengthColor[pwStrength] : 'var(--border)'}}/>
                      ))}
                    </div>
                    <span style={{color: strengthColor[pwStrength], fontSize:11.5}}>{strengthLabel[pwStrength]}</span>
                  </div>
                )}
              </div>

              <button className={`btn-main${loading ? ' loading' : ''}`} onClick={handleSignup} disabled={loading}>
                <span className="btn-text">Create Account →</span>
              </button>

              <p className="auth-footer">Already have an account? <a onClick={() => setScreen('login')}>Sign in</a></p>
            </div>
          )}

          {/* ── FORGOT ── */}
          {screen === 'forgot' && (
            <div className="auth-screen">
              <button className="btn-back" onClick={() => setScreen('login')}>
                <span className="material-symbols-rounded" style={{fontSize:16}}>arrow_back</span> Back to login
              </button>
              <div className="auth-screen-top">
                <span className="screen-tag">Reset Password</span>
                <h2>Forgot password?</h2>
                <p>Enter your email to receive a 6-digit reset code.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="input-wrap">
                  <input className="form-input" type="email" placeholder="doctor@hospital.com"
                    value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
              </div>
              <button className="btn-main" onClick={() => { if(!email){toast('Enter email','error');return;} toast('OTP sent to '+email,'success'); setScreen('otp'); }}>
                <span className="btn-text">Send Reset Code →</span>
              </button>
            </div>
          )}

          {/* ── OTP ── */}
          {screen === 'otp' && (
            <div className="auth-screen">
              <button className="btn-back" onClick={() => setScreen('forgot')}>
                <span className="material-symbols-rounded" style={{fontSize:16}}>arrow_back</span> Back
              </button>
              <div className="auth-screen-top">
                <span className="screen-tag">Verify OTP</span>
                <h2>Check your email</h2>
                <p>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>
              <div className="otp-grid">
                {otp.map((v, i) => (
                  <input key={i} id={`otp-${i}`} className="otp-input" type="text" maxLength={1}
                    value={v} onChange={e => handleOTP(e.target.value, i)} onKeyDown={e => otpKeyDown(e, i)}/>
                ))}
              </div>
              <button className="btn-main" style={{marginTop:8}} onClick={() => {
                if (otp.join('').length < 6) { toast('Enter complete OTP', 'error'); return; }
                setScreen('newpw');
              }}>
                <span className="btn-text">Verify Code →</span>
              </button>
            </div>
          )}

          {/* ── NEW PASSWORD ── */}
          {screen === 'newpw' && (
            <div className="auth-screen">
              <div className="auth-screen-top">
                <span className="screen-tag">New Password</span>
                <h2>Set new password</h2>
                <p>Choose a strong password for your account.</p>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <span className="material-symbols-rounded input-icon">lock</span>
                  <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
                    value={newPw} onChange={e => setNewPw(e.target.value)}/>
                  <button className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                    <span className="material-symbols-rounded">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <button className="btn-main" onClick={() => {
                if (newPw.length < 8) { toast('Min 8 characters', 'error'); return; }
                toast('Password reset! Please sign in.', 'success');
                setScreen('login');
              }}>
                <span className="btn-text">Reset Password →</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
