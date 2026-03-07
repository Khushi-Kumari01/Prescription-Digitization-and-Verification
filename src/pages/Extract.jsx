import { useApp } from '../context/AppContext';
import './Extract.css';

export default function ExtractPage() {
  const { navigate, scanResult } = useApp();

  if (!scanResult) {
    return (
      <div className="extract-page">
        <div className="section-header">
          <div><div className="section-title">Extract Medicine</div><div className="section-sub">OCR-extracted medicines from scanned prescriptions</div></div>
          <button className="btn btn-primary" onClick={() => navigate('scan')}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>document_scanner</span>New Scan
          </button>
        </div>
        <div className="card" style={{padding:'64px',textAlign:'center'}}>
          <span className="material-symbols-rounded" style={{fontSize:52,color:'var(--blue-200)',display:'block',marginBottom:16}}>medication</span>
          <div style={{fontFamily:'var(--font-h)',fontSize:18,fontWeight:700,marginBottom:8}}>No prescriptions scanned yet</div>
          <div style={{fontSize:14,color:'var(--t3)',marginBottom:24}}>Scan a prescription to extract and view medicines here</div>
          <button className="btn btn-primary" onClick={() => navigate('scan')}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>document_scanner</span>Go to Scan
          </button>
        </div>
      </div>
    );
  }

  const { summary } = scanResult;
  return (
    <div className="extract-page">
      <div className="section-header">
        <div><div className="section-title">Extract Medicine</div><div className="section-sub">OCR results from your last scan</div></div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-outline" onClick={() => navigate('verify')}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>verified</span>Verify Now
          </button>
          <button className="btn btn-primary" onClick={() => navigate('scan')}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>add</span>New Scan
          </button>
        </div>
      </div>

      <div className="extract-grid">
        {summary?.meds?.map((med, i) => (
          <div key={i} className={`extract-card${!med.ok ? ' flagged' : ''}`}>
            <div className="extract-card-top">
              <div className="extract-med-icon">💊</div>
              <div>
                <div className="extract-med-name">{med.name}</div>
                <div className="extract-med-dose">{med.dose}</div>
              </div>
              <span className={`badge ${med.ok ? 'badge-green' : 'badge-amber'}`} style={{marginLeft:'auto'}}>
                {med.ok ? '✓ Verified' : '⚠ Review'}
              </span>
            </div>
            <div className="extract-med-details">
              <div className="extract-detail"><span>Frequency</span><strong>{med.freq}</strong></div>
              <div className="extract-detail"><span>Duration</span><strong>{med.dur}</strong></div>
              <div className="extract-detail"><span>Instructions</span><strong>{med.note}</strong></div>
            </div>
            <div className="extract-card-footer">
              <button className="btn btn-sm btn-outline" onClick={() => navigate('verify')}>
                <span className="material-symbols-rounded" style={{fontSize:14}}>fact_check</span>Verify
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="extract-footer-bar">
        <span style={{color:'var(--t3)',fontSize:13}}>AI Confidence: <strong style={{color: summary?.conf >= 90 ? 'var(--green)' : 'var(--amber)'}}>{summary?.conf}%</strong></span>
        <button className="btn btn-primary" onClick={() => navigate('verify')}>
          <span className="material-symbols-rounded" style={{fontSize:16}}>verified</span>Verify All Medicines
        </button>
      </div>
    </div>
  );
}
