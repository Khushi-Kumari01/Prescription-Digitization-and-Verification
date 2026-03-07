import { useApp } from '../context/AppContext';
import HomePage from './Home';
import ScanPage from './Scan';
import ExtractPage from './Extract';
import VerifyPage from './Verify';
import HistoryPage from './History';
import ProfilePage from './Profile';
import './Dashboard.css';

const NAV_ITEMS = [
  { id:'home',    icon:'home',              label:'Home' },
  { id:'scan',    icon:'document_scanner',  label:'Scan Prescription', badge:'New' },
  { id:'extract', icon:'medication',        label:'Extract Medicine' },
  { id:'verify',  icon:'verified',          label:'Verification',      count:true },
  { id:'history', icon:'history',           label:'History' },
];

export default function Dashboard() {
  const { user, logout, currentPage, navigate, toast } = useApp();

  const name    = user?.name || user?.email?.split('@')[0] || 'Doctor';
  const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'DR';

  const handleLogout = () => {
    toast('See you soon, ' + name + ' 👋', 'success');
    setTimeout(() => logout(), 800);
  };

  const pageLabels = {
    home: 'Dashboard', scan: 'Scan Prescription', extract: 'Extract Medicine',
    verify: 'Verification', history: 'History', profile: 'Profile',
  };

  const pageMap = {
    home:    <HomePage />,
    scan:    <ScanPage />,
    extract: <ExtractPage />,
    verify:  <VerifyPage />,
    history: <HistoryPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="dash-wrap">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <span className="material-symbols-rounded" style={{fontSize:22,color:'white',fontVariationSettings:"'FILL' 1"}}>medical_services</span>
          </div>
          <span className="sb-brand-name">RXGuardian<span> AI</span></span>
        </div>

        <nav className="sb-nav">
          <div className="sb-nav-group">
            <div className="sb-nav-label">MAIN MENU</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`sb-item${currentPage === item.id ? ' active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span className="material-symbols-rounded sb-icon"
                  style={{fontVariationSettings: currentPage===item.id ? "'FILL' 1" : "'FILL' 0"}}>
                  {item.icon}
                </span>
                <span className="sb-label">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          <div className="sb-nav-group">
            <div className="sb-nav-label">ACCOUNT</div>
            <button className={`sb-item${currentPage === 'profile' ? ' active' : ''}`} onClick={() => navigate('profile')}>
              <span className="material-symbols-rounded sb-icon">person</span>
              <span className="sb-label">My Profile</span>
            </button>
            <button className="sb-item sb-logout" onClick={handleLogout}>
              <span className="material-symbols-rounded sb-icon">logout</span>
              <span className="sb-label">Sign Out</span>
            </button>
          </div>
        </nav>

        <div className="sb-user" onClick={() => navigate('profile')}>
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{name}</div>
            <div className="sb-user-role">{user?.role || 'Doctor'}</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-page-info">
              <div className="topbar-page-title">{pageLabels[currentPage] || 'Dashboard'}</div>
              <div className="topbar-breadcrumb">RXGuardian AI → {pageLabels[currentPage] || 'Dashboard'}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span className="material-symbols-rounded" style={{fontSize:18,color:'var(--t3)'}}>search</span>
              <input type="text" placeholder="Search prescriptions, patie…"/>
            </div>
            <button className="topbar-icon-btn">
              <span className="material-symbols-rounded">notifications</span>
              <span className="notif-dot"/>
            </button>
            <button className="topbar-icon-btn">
              <span className="material-symbols-rounded">settings</span>
            </button>
            <div className="topbar-avatar" onClick={() => navigate('profile')}>{initials}</div>
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content">
          {pageMap[currentPage] || <HomePage />}
        </main>
      </div>
    </div>
  );
}
