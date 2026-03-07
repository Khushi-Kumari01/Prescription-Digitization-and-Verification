import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Profile.css';

export default function ProfilePage() {
  const { user, login, toast, logout } = useApp();
  const [form, setForm] = useState({
    name: '', role: '', email: '', phone: '', hospital: '', regno: '', bio: ''
  });
  const [original, setOriginal] = useState({});

  useEffect(() => {
    if (!user) return;
    const saved = {};
    try { Object.assign(saved, JSON.parse(localStorage.getItem('ms_profile_' + user.email) || '{}')); } catch {}
    const initialForm = { name: user.name||'', role: user.role||'', email: user.email||'', phone: saved.phone||'', hospital: saved.hospital||'', regno: saved.regno||'', bio: saved.bio||'' };
    setForm(initialForm);
    setOriginal(initialForm);
  }, [user]);

  const saveProfile = () => {
    if (!form.name) { toast('Name cannot be empty', 'error'); return; }
    const updated = { ...user, ...form };
    localStorage.setItem('ms_profile_' + user.email, JSON.stringify(form));
    login(updated, true);
    setOriginal(form);
    toast('Profile saved!', 'success');
  };

  const resetProfile = () => {
    setForm(original);
    toast('Changes discarded', 'info');
  };

  const name    = user?.name || '—';
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'DR';
  const joined  = user?.loginTime ? new Date(user.loginTime).toLocaleDateString('en-IN',{month:'long',year:'numeric'}) : 'Mar 2026';

  return (
    <div className="profile-page">
      <div className="section-header">
        <div><div className="section-title">My Profile</div><div className="section-sub">Manage your account and preferences</div></div>
      </div>

      <div className="profile-cover"/>

      <div className="card profile-card">
        <div className="profile-avatar-zone">
          <div className="profile-avatar">{initials}</div>
        </div>
        <div className="profile-info-row">
          <div>
            <div className="profile-name">{name}</div>
            <div className="profile-title">{user?.role || 'Doctor'}</div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <span className="badge badge-green">Active</span>
              <span className="badge badge-blue">Pro Plan</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => {}}>
            <span className="material-symbols-rounded edit-icon">edit</span>
            Edit Profile
          </button>
        </div>

        <div className="profile-stats-row">
          {[['0','Prescriptions'],['0','Verified'],['—','Accuracy'],[joined,'Member Since']].map(([v,l]) => (
            <div key={l} className="profile-stat">
              <div className="profile-stat-val">{v}</div>
              <div className="profile-stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card profile-form-card">
        <div className="pf-row">
          <div className="pf-field"><label className="form-label">Specialization</label><input className="form-input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="Doctor"/></div>
        </div>
        <div className="pf-row">
          <div className="pf-field"><label className="form-label">Email Address</label><input className="form-input" value={form.email} readOnly style={{opacity:.7,cursor:'not-allowed'}}/></div>
        </div>
        <div className="pf-row">
          <div className="pf-field"><label className="form-label">Phone Number</label><input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91700471622"/></div>
        </div>
        <div className="pf-row">
          <div className="pf-field"><label className="form-label">Hospital / Clinic</label><input className="form-input" value={form.hospital} onChange={e=>setForm(f=>({...f,hospital:e.target.value}))} placeholder="Your hospital or clinic name"/></div>
        </div>
        <div className="pf-row">
          <div className="pf-field"><label className="form-label">Registration No.</label><input className="form-input" value={form.regno} onChange={e=>setForm(f=>({...f,regno:e.target.value}))} placeholder="e.g. MCI-2024-XXXXX"/></div>
        </div>
        <div className="pf-field full"><label className="form-label">Bio</label><input className="form-input" value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Brief professional bio..."/></div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={saveProfile}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>save</span>Save Changes
          </button>
          <button className="btn btn-outline" onClick={resetProfile}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>restart_alt</span>Reset
          </button>
          <button className="btn btn-outline btn-danger" onClick={() => { toast('Logging out…','info'); setTimeout(logout,800); }}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>lock</span>Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
