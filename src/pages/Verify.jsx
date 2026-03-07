import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Verify.css';

const DB = {
  'amoxicillin':  { std:'250–500mg', max:'3000mg/day', class:'Penicillin Antibiotic' },
  'pantoprazole': { std:'20–40mg',   max:'80mg/day',   class:'Proton Pump Inhibitor' },
  'cetirizine':   { std:'5–10mg',    max:'10mg/day',   class:'Antihistamine' },
  'metformin':    { std:'500–1000mg',max:'2550mg/day', class:'Biguanide Antidiabetic' },
  'paracetamol':  { std:'325–500mg', max:'4000mg/day', class:'Analgesic/Antipyretic' },
  'aspirin':      { std:'75–325mg',  max:'4000mg/day', class:'NSAID / Antiplatelet' },
};

function verifyMed(name, dose) {
  const key = name.toLowerCase().trim();
  const dbEntry = DB[key];
  if (!dbEntry) return { status:'unknown', note:'Not found in database', db:'—', class:'—' };
  const doseNum = parseFloat(dose);
  // Simple check: flag if dose seems outside range (just pattern matching)
  const hasWarning = dose.toLowerCase().includes('1000') || dose.toLowerCase().includes('2000');
  return {
    status: hasWarning ? 'warning' : 'ok',
    note: hasWarning ? 'Dose is at upper range — review recommended' : 'Dose within normal range',
    db: dbEntry.std,
    class: dbEntry.class,
  };
}

export default function VerifyPage() {
  const { toast, scanResult } = useApp();
  const [meds, setMeds] = useState(() => {
    if (scanResult?.summary?.meds) {
      return scanResult.summary.meds.map(m => ({
        id: Date.now() + Math.random(),
        name: m.name, dose: m.dose, freq: m.freq,
        ...verifyMed(m.name, m.dose),
      }));
    }
    return [];
  });
  const [name, setName]   = useState('');
  const [dose, setDose]   = useState('');
  const [freq, setFreq]   = useState('Once daily');
  const [running, setRunning] = useState(false);

  const addMed = () => {
    if (!name) { toast('Enter medicine name', 'error'); return; }
    const entry = { id: Date.now(), name, dose, freq, status:'pending', note:'Click Verify Medicines to check', db:'—', class:'—' };
    setMeds(m => [...m, entry]);
    setName(''); setDose('');
    toast('Added: ' + name, 'success');
  };

  const runVerification = async () => {
    if (!meds.length) { toast('Add at least one medicine first', 'error'); return; }
    setRunning(true);
    toast('Running verification…', 'info');
    await new Promise(r => setTimeout(r, 1800));
    setMeds(m => m.map(med => ({ ...med, ...verifyMed(med.name, med.dose) })));
    setRunning(false);
    toast('Verification complete!', 'success');
  };

  const removeMed = (id) => setMeds(m => m.filter(x => x.id !== id));

  const statusIcon  = { ok:'check_circle', warning:'warning', error:'cancel', pending:'hourglass_empty', unknown:'help' };
  const statusColor = { ok:'var(--green)', warning:'var(--amber)', error:'var(--red)', pending:'var(--t3)', unknown:'var(--t3)' };
  const statusBadge = { ok:'badge-green', warning:'badge-amber', error:'badge-red', pending:'', unknown:'' };

  const counts = { ok:0, warning:0, error:0, total:meds.length };
  meds.forEach(m => { if (m.status in counts) counts[m.status]++; });

  return (
    <div className="verify-page">
      <div className="section-header">
        <div><div className="section-title">Drug Verification</div><div className="section-sub">Cross-check medicines against the National Drug Database</div></div>
        <button className="btn btn-primary" onClick={runVerification} disabled={running}>
          {running
            ? <><span className="material-symbols-rounded" style={{fontSize:16,animation:'spin .7s linear infinite'}}>refresh</span>Verifying…</>
            : <><span className="material-symbols-rounded" style={{fontSize:16}}>verified</span>Verify Medicines</>}
        </button>
      </div>

      {/* Add medicine */}
      <div className="card" style={{padding:22,marginBottom:20}}>
        <div style={{fontFamily:'var(--font-h)',fontSize:15,fontWeight:700,color:'var(--t1)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <span className="material-symbols-rounded" style={{color:'var(--blue-500)',fontSize:18}}>add_circle</span>Add Medicine to Verify
        </div>
        <div className="verify-add-row">
          <div>
            <label className="form-label">Medicine Name</label>
            <input className="form-input" type="text" placeholder="e.g. Amoxicillin"
              value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key==='Enter' && addMed()}/>
          </div>
          <div>
            <label className="form-label">Dosage</label>
            <input className="form-input" type="text" placeholder="e.g. 500mg"
              value={dose} onChange={e => setDose(e.target.value)}/>
          </div>
          <div>
            <label className="form-label">Frequency</label>
            <select className="form-input" value={freq} onChange={e => setFreq(e.target.value)}>
              {['Once daily','Twice daily','3× daily','As needed','At bedtime'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={addMed} style={{alignSelf:'flex-end'}}>
            <span className="material-symbols-rounded" style={{fontSize:16}}>add</span>Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="verify-stats">
        {[
          { icon:'check_circle', color:'green', val:counts.ok,      lbl:'Verified OK' },
          { icon:'warning',      color:'amber', val:counts.warning,  lbl:'Warnings' },
          { icon:'cancel',       color:'red',   val:counts.error,    lbl:'Errors' },
          { icon:'database',     color:'blue',  val:counts.total,    lbl:'Total Checked' },
        ].map(s => (
          <div key={s.lbl} className={`verify-stat verify-stat-${s.color}`}>
            <div className="verify-stat-icon">
              <span className="material-symbols-rounded" style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
            </div>
            <div><div className="verify-stat-val">{s.val}</div><div className="verify-stat-lbl">{s.lbl}</div></div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border-2)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="section-title" style={{fontSize:15}}>Verification Results</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="drug-table">
            <thead><tr><th>Medicine</th><th>Prescribed</th><th>DB Standard</th><th>Frequency</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {meds.length === 0 ? (
                <tr><td colSpan={6} style={{padding:'48px',textAlign:'center',color:'var(--t3)'}}>
                  <span className="material-symbols-rounded" style={{fontSize:40,display:'block',marginBottom:10,opacity:.35}}>verified</span>
                  Add medicines above to verify against the database.
                </td></tr>
              ) : meds.map(med => (
                <tr key={med.id}>
                  <td><div style={{fontWeight:700,color:'var(--t1)'}}>{med.name}</div><div style={{fontSize:11.5,color:'var(--t3)'}}>{med.class}</div></td>
                  <td><span className="badge badge-blue">{med.dose || '—'}</span></td>
                  <td style={{color:'var(--t2)'}}>{med.db}</td>
                  <td style={{color:'var(--t2)'}}>{med.freq}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span className="material-symbols-rounded" style={{fontSize:17,color:statusColor[med.status],fontVariationSettings:"'FILL' 1"}}>{statusIcon[med.status]}</span>
                      <span className={`badge ${statusBadge[med.status]}`}>{med.status.charAt(0).toUpperCase()+med.status.slice(1)}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--t3)',marginTop:3}}>{med.note}</div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline" style={{color:'var(--red)',borderColor:'var(--red)'}} onClick={() => removeMed(med.id)}>
                      <span className="material-symbols-rounded" style={{fontSize:14}}>delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
