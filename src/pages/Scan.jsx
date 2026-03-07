import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useCamera } from '../hooks/useCamera';
import './Scan.css';

const SCAN_MODES = [
  { id:'upload', icon:'📁', title:'File or Folder', desc:'PDF, image, doc or any file type' },
  { id:'camera', icon:'🔬', title:'Scan', desc:'Real-time scanner with rolling beam', badge:'● Live' },
  { id:'gallery',icon:'🖼️', title:'From Gallery', desc:'Pick an image from your library' },
];

export default function ScanPage() {
  const { navigate, toast, setScanResult } = useApp();
  const [mode, setMode]           = useState('camera');
  const [preview, setPreview]     = useState(null); // { src, name, size, type }
  const [scanning, setScanning]   = useState(false);
  const [scanStep, setScanStep]   = useState(0);
  const [sumState, setSumState]   = useState('idle'); // idle | loading | done
  const [summary, setSummary]     = useState(null);
  const fileRef    = useRef();
  const galleryRef = useRef();

  const cam = useCamera();

  const selectMode = useCallback((m) => {
    setMode(m);
    if (m === 'camera') {
      setPreview(null);
      cam.startCamera();
    } else {
      cam.stopCamera();
      if (m === 'upload')  { fileRef.current?.click(); }
      if (m === 'gallery') { galleryRef.current?.click(); }
    }
  }, [cam]);

  const handleFile = (file) => {
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const sz = file.size < 1024*1024 ? (file.size/1024).toFixed(1)+' KB' : (file.size/1024/1024).toFixed(2)+' MB';

    if (isImg) {
      const reader = new FileReader();
      reader.onload = e => {
        setPreview({ src: e.target.result, name: file.name, size: sz, type: 'image' });
        triggerAutoSummary();
      };
      reader.readAsDataURL(file);
    } else {
      setPreview({ src: null, name: file.name, size: sz, type: isPdf ? 'pdf' : 'file' });
      triggerAutoSummary();
    }
    toast('File loaded: ' + file.name, 'success');
  };

  const handleCapture = () => {
    const dataUrl = cam.capturePhoto();
    if (!dataUrl) return;
    cam.stopCamera();
    const ts = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}).replace(':','h');
    setPreview({ src: dataUrl, name: `scan_${ts}.jpg`, size: 'Captured', type: 'image' });
    triggerAutoSummary();
    toast('Photo captured!', 'success');
  };

  const clearPreview = () => {
    setPreview(null);
    setSumState('idle');
    setSummary(null);
    if (mode === 'camera') cam.startCamera();
  };

  // ── AI Summary (simulated) ──
  const triggerAutoSummary = () => {
    setSumState('loading');
    setSummary(null);
    setTimeout(() => {
      const meds = [
        { name:'Amoxicillin',  dose:'500mg', freq:'3× daily',    dur:'7 days',  note:'Take with food',      ok:true  },
        { name:'Pantoprazole', dose:'40mg',  freq:'Once daily',  dur:'10 days', note:'Before breakfast',    ok:true  },
        { name:'Cetirizine',   dose:'10mg',  freq:'At bedtime',  dur:'5 days',  note:'May cause drowsiness',ok:false },
        { name:'Metformin',    dose:'500mg', freq:'Twice daily', dur:'Ongoing', note:'With meals',          ok:true  },
      ].slice(0, 2 + Math.floor(Math.random() * 3));
      const conf = 88 + Math.floor(Math.random() * 11);
      setSummary({ meds, conf, time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}) });
      setSumState('done');
    }, 3000);
  };

  // ── Process / OCR ──
  const startScan = () => {
    if (!preview) return;
    setPreview(null);
    setScanning(true);
    setScanStep(1);
    const steps = [
      [700,  2, 'Running OCR engine…'],
      [1500, 3, 'Extracting medicine data…'],
      [2300, 4, 'Cross-verifying database…'],
      [3200, 5, null],
    ];
    steps.forEach(([delay, step, msg]) => {
      setTimeout(() => {
        setScanStep(step);
        if (!msg) {
          setScanning(false);
          setScanStep(0);
          toast('Scan complete! Medicines extracted.', 'success');
          setScanResult({ summary, time: new Date().toISOString() });
          navigate('extract');
        }
      }, delay);
    });
  };

  const copySummary = () => {
    if (!summary) return;
    const text = summary.meds.map(m => `${m.name} ${m.dose} — ${m.freq} for ${m.dur} (${m.note})`).join('\n');
    navigator.clipboard.writeText(text).then(() => toast('Summary copied!', 'success')).catch(() => toast('Copy manually', 'info'));
  };

  const downloadSelf = () => {
    toast('Download the app file and open in Chrome for full camera access', 'info');
  };

  return (
    <div className="scan-page">
      <div className="section-header">
        <div>
          <div className="section-title">Scan Prescription</div>
          <div className="section-sub">Upload, drag & drop, or capture a handwritten prescription</div>
        </div>
      </div>

      {/* Mode selector */}
      <div className="scan-opts">
        {SCAN_MODES.map(m => (
          <div key={m.id} className={`scan-opt${mode===m.id?' selected':''}`} onClick={() => selectMode(m.id)}>
            {m.badge && <div className="scan-opt-badge">{m.badge}</div>}
            <span className="scan-opt-icon">{m.icon}</span>
            <div className="scan-opt-title">{m.title}</div>
            <div className="scan-opt-desc">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Hidden inputs */}
      <input ref={fileRef}    type="file" accept="*/*"     multiple style={{display:'none'}} onChange={e => handleFile(e.target.files[0])}/>
      <input ref={galleryRef} type="file" accept="image/*"          style={{display:'none'}} onChange={e => handleFile(e.target.files[0])}/>

      <div className="scan-body">
        <div className="scan-main">

          {/* ── Camera Panel ── */}
          {mode === 'camera' && !preview && !scanning && (
            <div className="camera-panel">
              <div className="camera-viewport">
                <video ref={cam.videoRef} autoPlay playsInline muted className={`camera-video${cam.active ? ' active' : ''}`}/>

                {/* Vignette */}
                <div className="camera-vignette"/>

                {/* Scan frame */}
                {cam.active && (
                  <div className="scan-frame">
                    <div className="sf-corner sf-tl"/><div className="sf-corner sf-tr"/>
                    <div className="sf-corner sf-bl"/><div className="sf-corner sf-br"/>
                    <div className="scan-beam"/>
                    <div className="scan-trail"/>
                  </div>
                )}

                {/* HUD */}
                {cam.active && (
                  <>
                    <div className="cam-hud-top">
                      <div className="cam-scanning-badge">
                        <span className="cam-dot"/>SCANNING
                      </div>
                      <div className="cam-pct">{cam.pct}%</div>
                    </div>
                    <div className="cam-hint">📄 Place prescription flat within the frame</div>
                  </>
                )}

                {/* Start button if not started */}
                {!cam.active && !cam.error && (
                  <div className="cam-start-overlay">
                    <button className="cam-start-btn" onClick={() => cam.startCamera()}>
                      <span className="material-symbols-rounded" style={{fontSize:32}}>videocam</span>
                      <span>Start Camera</span>
                    </button>
                  </div>
                )}

                {/* Error states */}
                {cam.error === 'iframe' && (
                  <div className="cam-error">
                    <span className="material-symbols-rounded" style={{fontSize:48,color:'#FFB300',marginBottom:14}}>open_in_new</span>
                    <div className="cam-error-title">Camera needs local access</div>
                    <div className="cam-error-desc">
                      Download this file → open in Chrome/Safari → camera works fully.
                    </div>
                    <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:16}}>
                      <button className="btn btn-primary" style={{fontSize:13}} onClick={downloadSelf}>
                        <span className="material-symbols-rounded" style={{fontSize:16}}>download</span>Download App
                      </button>
                      <button className="btn btn-outline" style={{fontSize:13,background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.2)'}}
                        onClick={() => selectMode('gallery')}>
                        Use Gallery Instead
                      </button>
                    </div>
                  </div>
                )}
                {cam.error === 'permission' && (
                  <div className="cam-error">
                    <span className="material-symbols-rounded" style={{fontSize:48,color:'var(--red)',marginBottom:14}}>no_photography</span>
                    <div className="cam-error-title">Allow Camera Access</div>
                    <div className="cam-error-desc">Click the 🔒 lock icon in your browser address bar → Allow Camera</div>
                    <button className="btn btn-primary" style={{marginTop:16}} onClick={() => cam.startCamera()}>
                      <span className="material-symbols-rounded" style={{fontSize:16}}>refresh</span>Try Again
                    </button>
                  </div>
                )}
                {cam.error === 'notfound' && (
                  <div className="cam-error">
                    <span className="material-symbols-rounded" style={{fontSize:48,color:'var(--t3)',marginBottom:14}}>videocam_off</span>
                    <div className="cam-error-title">No Camera Found</div>
                    <div className="cam-error-desc">No camera detected on this device.</div>
                    <button className="btn btn-primary" style={{marginTop:16}} onClick={() => selectMode('gallery')}>
                      Use Gallery Instead
                    </button>
                  </div>
                )}

                <canvas ref={cam.canvasRef} style={{display:'none'}}/>
              </div>

              {/* Camera Controls */}
              <div className="camera-controls">
                <div className="cam-ctrl-info">
                  <span className="material-symbols-rounded" style={{fontSize:15,color:'var(--teal)'}}>document_scanner</span>
                  Auto-detecting document edges…
                </div>
                <div className="cam-ctrl-btns">
                  <button className="btn btn-sm cam-flip-btn" onClick={() => { cam.flipCamera(); setTimeout(() => cam.startCamera(), 100); }}>
                    <span className="material-symbols-rounded" style={{fontSize:15}}>flip_camera_android</span>Flip
                  </button>
                  <button className="btn btn-primary" onClick={handleCapture} disabled={!cam.active} style={{minWidth:120}}>
                    <span className="material-symbols-rounded" style={{fontSize:17}}>camera</span>Capture
                  </button>
                  <button className="btn btn-sm cam-stop-btn" onClick={cam.stopCamera}>
                    <span className="material-symbols-rounded" style={{fontSize:15}}>stop_circle</span>Stop
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Upload Dropzone ── */}
          {mode === 'upload' && !preview && !scanning && (
            <label className="dropzone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); handleFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept="*/*" multiple style={{display:'none'}} onChange={e => handleFile(e.target.files[0])}/>
              <span className="material-symbols-rounded dropzone-icon">cloud_upload</span>
              <div className="dropzone-title">Click to browse or drag & drop</div>
              <div className="dropzone-sub">PDF, image, DOCX, or any file format</div>
              <div className="dropzone-types">
                {['PDF','JPG','PNG','DOCX','+ All'].map(t => <span key={t} className="dropzone-type">{t}</span>)}
              </div>
            </label>
          )}

          {/* ── Preview ── */}
          {preview && !scanning && (
            <div className="preview-container">
              <div className="preview-header">
                <div style={{fontSize:15,fontWeight:700,color:'var(--t1)'}}>📄 Preview</div>
                <button className="btn btn-outline btn-sm" onClick={clearPreview}>
                  <span className="material-symbols-rounded" style={{fontSize:15}}>close</span>Clear
                </button>
              </div>
              <div className="card">
                <div className="preview-img-wrap">
                  {preview.type === 'image' && <img src={preview.src} alt="preview" style={{width:'100%',maxHeight:320,objectFit:'contain'}}/>}
                  {preview.type === 'pdf' && (
                    <div style={{padding:'40px',textAlign:'center'}}>
                      <span className="material-symbols-rounded" style={{fontSize:60,color:'var(--red)',display:'block',marginBottom:12}}>picture_as_pdf</span>
                      <div style={{fontFamily:'var(--font-h)',fontWeight:700,color:'var(--t1)'}}>{preview.name}</div>
                    </div>
                  )}
                  {preview.type === 'file' && (
                    <div style={{padding:'40px',textAlign:'center'}}>
                      <span className="material-symbols-rounded" style={{fontSize:60,color:'var(--blue-400)',display:'block',marginBottom:12}}>description</span>
                      <div style={{fontFamily:'var(--font-h)',fontWeight:700,color:'var(--t1)'}}>{preview.name}</div>
                    </div>
                  )}
                </div>
                <div className="preview-footer">
                  <div>
                    <div style={{fontSize:13.5,fontWeight:600,color:'var(--t1)'}}>{preview.name}</div>
                    <div style={{fontSize:12,color:'var(--t3)'}}>{preview.size} · Ready to process</div>
                  </div>
                  <button className="btn btn-primary" onClick={startScan}>
                    <span className="material-symbols-rounded" style={{fontSize:16}}>play_arrow</span>Start OCR
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Scan Loader ── */}
          {scanning && (
            <div className="card scan-loader">
              <div className="scan-pulse">
                <span className="material-symbols-rounded" style={{fontSize:36}}>document_scanner</span>
              </div>
              <div style={{fontFamily:'var(--font-h)',fontSize:17,fontWeight:700,color:'var(--t1)',marginBottom:6}}>
                {['','Uploading prescription…','Running OCR engine…','Extracting medicine data…','Cross-verifying database…'][scanStep] || 'Processing…'}
              </div>
              <div style={{fontSize:13,color:'var(--t3)',marginBottom:16}}>Please wait, this takes a few seconds</div>
              <div className="scan-progress-bar"><div className="scan-progress-fill"/></div>
              <div className="scan-steps">
                {[['Upload',1],['OCR',2],['Extract',3],['Verify',4]].map(([label,step]) => (
                  <div key={label} className={`scan-step${scanStep >= step ? ' done' : ''}`}>
                    <span className="material-symbols-rounded" style={{fontSize:14}}>
                      {scanStep >= step ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── AI Summary Sidebar ── */}
        <div className="sum-sidebar">
          {sumState === 'idle' && (
            <div className="card sum-idle">
              <div className="sum-idle-icon">
                <span className="material-symbols-rounded" style={{fontSize:26,color:'var(--blue-500)'}}>auto_awesome</span>
              </div>
              <div className="sum-idle-title">AI Summary</div>
              <div className="sum-idle-desc">Upload or scan a prescription — summary appears automatically.</div>
              <div className="sum-idle-features">
                {['Expands abbreviations','Extracts medicines & dosage','Patient-friendly language','Instant · No extra steps'].map(f => (
                  <div key={f} className="sum-idle-feat">
                    <span className="material-symbols-rounded" style={{fontSize:15,color:'var(--teal)'}}>check_circle</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {sumState === 'loading' && (
            <div className="card sum-loading">
              <div className="sum-loading-icon">
                <span className="material-symbols-rounded" style={{fontSize:22,color:'white'}}>auto_awesome</span>
              </div>
              <div style={{fontFamily:'var(--font-h)',fontSize:14,fontWeight:700,color:'var(--t1)',marginBottom:4}}>Analyzing…</div>
              <div style={{fontSize:12,color:'var(--t3)',marginBottom:14}}>Reading handwriting & extracting data</div>
              <div className="sum-loading-bar"><div className="sum-loading-fill"/></div>
            </div>
          )}

          {sumState === 'done' && summary && (
            <div className="card sum-result">
              <div className="sum-result-header">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className="material-symbols-rounded" style={{fontSize:18,color:'var(--teal)',fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
                  <span style={{fontFamily:'var(--font-h)',fontSize:13,fontWeight:700,color:'white'}}>AI Summary</span>
                </div>
                <button className="sum-copy-btn" onClick={copySummary}>
                  <span className="material-symbols-rounded" style={{fontSize:13}}>content_copy</span>Copy
                </button>
              </div>
              <div className="sum-result-body">
                <div className="sum-info-block">
                  <div className="sum-block-title">PRESCRIPTION DETAILS</div>
                  <div className="sum-info-rows">
                    <span style={{color:'var(--t3)'}}>Scanned:</span> {summary.time}<br/>
                    <span style={{color:'var(--t3)'}}>Medicines:</span> {summary.meds.length} detected<br/>
                    <span style={{color:'var(--t3)'}}>Format:</span> Handwritten Rx
                  </div>
                </div>
                {summary.meds.map((med, i) => (
                  <div key={i} className={`sum-med-card${!med.ok ? ' warn' : ''}`}>
                    <div className="sum-med-header">
                      <span style={{fontFamily:'var(--font-h)',fontSize:13,fontWeight:700,color:'var(--t1)'}}>💊 {med.name}</span>
                      <span className={`badge ${med.ok ? 'badge-green' : 'badge-amber'}`}>{med.ok ? 'OK' : 'REVIEW'}</span>
                    </div>
                    <div className="sum-med-grid">
                      <div><span className="sum-lbl">Dose:</span> {med.dose}</div>
                      <div><span className="sum-lbl">Freq:</span> {med.freq}</div>
                      <div><span className="sum-lbl">Duration:</span> {med.dur}</div>
                      <div><span className="sum-lbl">Note:</span> {med.note}</div>
                    </div>
                  </div>
                ))}
                <div className="sum-notes-block">
                  <div className="sum-block-title">📋 CLINICAL NOTES</div>
                  <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.7}}>
                    {summary.meds.length} medicine(s) identified.{' '}
                    {summary.meds.some(m => !m.ok) ? 'One item needs manual review. ' : 'No drug interactions detected. '}
                    Follow-up recommended after course completion.
                  </div>
                </div>
              </div>
              <div className="sum-result-footer">
                <span style={{fontSize:11.5,color:'var(--t3)'}}>AI Confidence</span>
                <span style={{fontSize:12,fontWeight:700,color: summary.conf >= 90 ? 'var(--green)' : summary.conf >= 75 ? 'var(--amber)' : 'var(--red)'}}>{summary.conf}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
