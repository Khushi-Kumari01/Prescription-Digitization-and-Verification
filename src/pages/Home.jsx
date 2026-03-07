import { useApp } from '../context/AppContext';
import './Home.css';

export default function HomePage() {
  const { user, navigate } = useApp();
  const name = user?.name || user?.email?.split('@')[0] || 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="home-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="welcome-greeting">
            <span className="greeting-dot"/>
            {today} · {greeting}
          </div>
          <div className="welcome-name">Welcome back, <span>Dr. {name.replace(/^Dr\.?\s*/i,'')}</span> 👋</div>
          <div className="welcome-desc">Your dashboard is ready. Scan a prescription to get started.</div>
          <div className="welcome-actions">
            <button className="welcome-btn-primary" onClick={() => navigate('scan')}>
              <span className="material-symbols-rounded" style={{fontSize:17}}>document_scanner</span>
              Scan Prescription
            </button>
            <button className="welcome-btn-outline" onClick={() => navigate('history')}>
              <span className="material-symbols-rounded" style={{fontSize:17}}>history</span>
              View History
            </button>
          </div>
        </div>
        <div className="welcome-visual">
          <div className="banner-card">
            <div className="banner-card-label">Session Scans</div>
            <div className="banner-card-val">0 <span>/ ∞</span></div>
            <div className="banner-card-sub">Start scanning to see stats</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { icon:'description',    cls:'blue',   label:'Total Prescriptions', val:'0', change:'+0 this session' },
          { icon:'check_circle',   cls:'teal',   label:'Verified Today',      val:'0', change:'None yet' },
          { icon:'warning',        cls:'amber',  label:'Flagged Issues',      val:'0', change:'All clear' },
          { icon:'analytics',      cls:'purple', label:'OCR Accuracy',        val:'—', change:'Run a scan first' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon stat-icon-${s.cls}`}>
              <span className="material-symbols-rounded" style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
            </div>
            <div className="stat-body">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-change">{s.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="home-grid">
        {/* Quick Actions */}
        <div>
          <div className="section-header">
            <div><div className="section-title">Quick Actions</div><div className="section-sub">Jump into your most-used tools</div></div>
          </div>
          <div className="quick-grid">
            {[
              { page:'scan',    icon:'document_scanner', color:'blue',   title:'Scan Prescription',  desc:'Upload or capture a handwritten or printed prescription.' },
              { page:'extract', icon:'medication',       color:'teal',   title:'Extract Medicines',  desc:'AI extracts drug names, dosage and frequency.' },
              { page:'verify',  icon:'verified',         color:'amber',  title:'Drug Verification',  desc:'Cross-check against the national drug database.' },
              { page:'history', icon:'history',          color:'purple', title:'View History',       desc:'Browse all previously scanned prescriptions.' },
            ].map(q => (
              <div className="quick-card" key={q.page} onClick={() => navigate(q.page)}>
                <div className={`quick-icon quick-icon-${q.color}`}>
                  <span className="material-symbols-rounded" style={{fontSize:26}}>{q.icon}</span>
                </div>
                <div className="quick-title">{q.title}</div>
                <div className="quick-desc">{q.desc}</div>
                <span className="material-symbols-rounded quick-arrow">arrow_forward</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="section-header">
            <div><div className="section-title">Recent Activity</div><div className="section-sub">Last actions</div></div>
          </div>
          <div className="card" style={{overflow:'hidden'}}>
            <div className="empty-state" style={{padding:'40px 24px'}}>
              <span className="material-symbols-rounded" style={{fontSize:42,opacity:.3,display:'block',marginBottom:10}}>history</span>
              <div style={{fontSize:13.5,color:'var(--t3)'}}>No activity yet. Start by scanning a prescription.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
