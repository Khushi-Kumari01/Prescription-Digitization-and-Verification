import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './History.css';

export default function HistoryPage() {
  const { navigate } = useApp();
  const [search, setSearch] = useState('');
  // No dummy data — real data would come from context/storage
  const records = [];

  return (
    <div className="history-page">
      <div className="section-header">
        <div><div className="section-title">Prescription History</div><div className="section-sub">All scanned & processed prescriptions</div></div>
        <button className="btn btn-primary" onClick={() => navigate('scan')}>
          <span className="material-symbols-rounded" style={{fontSize:16}}>add</span>New Scan
        </button>
      </div>

      <div className="history-filters">
        <div className="filter-search">
          <span className="material-symbols-rounded" style={{fontSize:18,color:'var(--t3)'}}>search</span>
          <input type="text" placeholder="Search by patient, Rx ID, medicine…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="filter-select"><option>All Status</option><option>Verified</option><option>Pending</option><option>Flagged</option></select>
        <select className="filter-select"><option>All Dates</option><option>Today</option><option>This Week</option><option>This Month</option></select>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <table className="history-table">
          <thead>
            <tr><th>Patient</th><th>Rx ID</th><th>Medicines</th><th>Scanned</th><th>Status</th><th>Confidence</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} style={{padding:'56px',textAlign:'center',color:'var(--t3)'}}>
                <span className="material-symbols-rounded" style={{fontSize:48,display:'block',marginBottom:14,opacity:.25}}>history</span>
                <div style={{fontFamily:'var(--font-h)',fontSize:17,fontWeight:700,color:'var(--t1)',marginBottom:6}}>No prescriptions scanned yet</div>
                <div style={{fontSize:13.5,marginBottom:20}}>Scanned records will appear here automatically.</div>
                <button className="btn btn-primary" onClick={() => navigate('scan')}>
                  <span className="material-symbols-rounded" style={{fontSize:16}}>document_scanner</span>Start Scanning
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
