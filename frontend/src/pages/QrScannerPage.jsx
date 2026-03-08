import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/Toast';

const QrScannerPage = () => {
  const toast = useToast();
  const [payload, setPayload] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('qr'); // qr | code
  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);

  const checkIn = async () => {
    try {
      const body = mode === 'code'
        ? { room_code: roomCode.trim() }
        : { qr_payload: payload };
      const { data } = await api.post('/qr/checkin', body);
      toast.push({ type: 'success', title: 'Checked-in', message: data.message });
    } catch (err) {
      toast.push({ type: 'error', title: 'Failed', message: err.response?.data?.message || err.message });
    }
  };

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  const start = async () => {
    if (!supported) return;
    if (scanning) return;
    try {
      setScanning(true);
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const tick = async () => {
        if (!videoRef.current || !detectorRef.current) return;
        if (!scanning) return;
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes?.length) {
            const raw = barcodes[0].rawValue || '';
            setPayload(raw);
            toast.push({ type: 'info', title: 'QR detected', message: 'Payload captured. Tap Check In.' });
            stop();
            return;
          }
        } catch {
          // ignore
        }
        window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    } catch (err) {
      toast.push({ type: 'error', title: 'Camera error', message: err.message });
      setScanning(false);
    }
  };

  const stop = () => {
    setScanning(false);
    detectorRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="space-y-4">
      <Card className="glass">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">QR Scanner</div>
        <div className="text-sm text-gray-500 dark:text-white/70">Scan QR or enter the 6-character room code.</div>
      </Card>

      <Card className="glass space-y-3">
        <div className="flex items-center gap-2">
          <Button variant={mode === 'qr' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('qr')}>QR</Button>
          <Button variant={mode === 'code' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('code')}>Code</Button>
        </div>

        {mode === 'qr' && supported ? (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden glass-soft">
              <video ref={videoRef} className="w-full aspect-[4/3] object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-48 w-48 border-2 border-teal-400/70 rounded-2xl animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!scanning ? (
                <Button variant="secondary" onClick={start}>Start Camera</Button>
              ) : (
                <Button variant="secondary" onClick={stop}>Stop</Button>
              )}
              <Button onClick={checkIn} disabled={!payload}>Check In</Button>
            </div>
          </div>
        ) : mode === 'qr' ? (
          <div className="text-sm text-gray-600 dark:text-white/70">
            Camera QR scanning is not supported in this browser. Use manual payload input below.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-white/70">
              Enter the 6-character code displayed in the room. The code changes periodically.
            </div>
            <input
              className="input"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
            />
            <Button onClick={checkIn} disabled={roomCode.trim().length !== 6}>Check In</Button>
          </div>
        )}

        {mode === 'qr' && (
          <textarea className="input" rows={4} placeholder="Paste scanned QR payload" value={payload} onChange={(e) => setPayload(e.target.value)} />
        )}
      </Card>
    </div>
  );
};

export default QrScannerPage;
