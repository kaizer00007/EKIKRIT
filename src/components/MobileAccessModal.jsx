import React, { useState, useEffect } from 'react';
import { Smartphone, X, Copy, Check, Wifi, ExternalLink, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { apiClient } from '../api/client.js';

export default function MobileAccessModal({ isOpen, onClose }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  const loadInfo = async () => {
    setLoading(true);
    try {
      const info = await apiClient.getNetworkInfo();
      setNetworkInfo(info);
      
      // Prefer current origin if not localhost, otherwise use detected LAN IP
      const currentHost = window.location.hostname;
      const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
      
      let targetUrl = info.primaryUrl;
      if (!isLocalhost) {
        targetUrl = window.location.origin;
      }

      setSelectedUrl(targetUrl);
      generateQr(targetUrl);
    } catch (err) {
      console.error('Failed to load network info:', err);
      const fallbackUrl = `http://${window.location.hostname}:5000`;
      setSelectedUrl(fallbackUrl);
      generateQr(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const generateQr = async (url) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0F3460',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (e) {
      console.error('QR generation failed:', e);
    }
  };

  const handleSelectUrl = (url) => {
    setSelectedUrl(url);
    generateQr(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F3460] to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Device Interoperability</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">Open Ekikrit on Your Phone</h3>
          <p className="text-xs text-slate-300 mt-1">
            Seamless touch-first GovTech experience with bottom navigation and mobile auto-fill.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* QR Code Container */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img src={qrDataUrl} alt="Mobile QR Code" className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl" />
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                <QrCode className="w-12 h-12 animate-pulse" />
              </div>
            )}

            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Scan with Phone Camera or Google Lens
              </span>
              <p className="text-[11px] text-slate-500">
                Instant access without installing any native app.
              </p>
            </div>
          </div>

          {/* Direct URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Direct Mobile URL:</span>
              <span className="text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-sky-600" /> Same Wi-Fi Network Required
              </span>
            </label>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={selectedUrl}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0F3460] hover:bg-[#0a2342] text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Multiple IPs Selector (if computer has both Wi-Fi and Ethernet) */}
          {networkInfo?.networkUrls && networkInfo.networkUrls.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Network Interface:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {networkInfo.networkUrls.map((net, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectUrl(net.url)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedUrl === net.url
                        ? 'bg-blue-50/80 border-[#0F3460] font-bold text-[#0F3460]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{net.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{net.ip}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick 3-Step Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Quick Mobile Setup Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px]">
              <li>Connect your phone to the <strong>same Wi-Fi network</strong> as this laptop/PC (or connect phone to laptop hotspot).</li>
              <li>Point your phone camera at the QR code above or type the URL into Chrome / Safari.</li>
              <li>Ekikrit automatically activates its <strong>touch-first mobile layout</strong> with native-like bottom navigation.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
