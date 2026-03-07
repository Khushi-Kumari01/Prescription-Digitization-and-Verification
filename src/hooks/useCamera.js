import { useRef, useState, useCallback, useEffect } from 'react';

export function useCamera() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const pctInterval = useRef(null);

  const [active,   setActive]   = useState(false);
  const [error,    setError]    = useState(null); // null | 'permission' | 'notfound' | 'iframe'
  const [pct,      setPct]      = useState(0);
  const [facingMode, setFacingMode] = useState('environment');

  const isIframe = window.self !== window.top;

  const startCamera = useCallback(async () => {
    setError(null);

    if (isIframe) { setError('iframe'); return; }
    if (!navigator.mediaDevices?.getUserMedia) { setError('notfound'); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);

      // Cycle scan % counter
      let p = 0;
      pctInterval.current = setInterval(() => {
        p = (p + 1) % 101;
        setPct(p);
      }, 70);

    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') setError('permission');
      else if (err.name === 'NotFoundError') setError('notfound');
      else setError('permission');
    }
  }, [facingMode, isIframe]);

  const stopCamera = useCallback(() => {
    clearInterval(pctInterval.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setPct(0);
  }, []);

  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (active) { stopCamera(); }
  }, [facingMode, active, stopCamera]);

  // Restart when facingMode changes and was active
  useEffect(() => {
    // handled via flipCamera calling stopCamera, then user clicks start again
  }, [facingMode]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    return c.toDataURL('image/jpeg', 0.92);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return { videoRef, canvasRef, active, error, pct, startCamera, stopCamera, flipCamera, capturePhoto, isIframe };
}
