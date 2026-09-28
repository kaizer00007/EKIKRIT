import React, { useState } from 'react';
import { X, KeyRound, Smartphone, ShieldCheck, User, Building, Wrench } from 'lucide-react';
import { apiClient } from '../api/client.js';

export const DEMO_PERSONAS = [
  {
    id: 'persona-rajesh',
    name: 'Rajesh Tukaram Patil',
    role: 'citizen',
    unifiedId: 'EK-MH-849102',
    phone: '9822019482',
    badge: 'Multi-Department Overlap + Anomaly',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Beneficiary in PDS, Land Records & Employment. Has 1 pending DEPA consent request and economic ceiling discrepancy.'
  },
  {
    id: 'persona-sunita',
    name: 'Sunita Ramesh Deshmukh',
    role: 'citizen',
    unifiedId: 'EK-MH-849103',
    phone: '9823456711',
    badge: 'Approved DEPA Consent',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Active records in all 3 systems with approved cross-department consent for rural business grant.'
  },
  {
    id: 'persona-amol',
    name: 'Amol Vitthal Shinde',
    role: 'citizen',
    unifiedId: 'EK-MH-849104',
    phone: '9765432109',
    badge: 'HITL Review Candidate',
    tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Demonstrates Unified Tracker milestones and fuzzy matching in Official Triage Queue.'
  },
  {
    id: 'persona-official-land',
    name: 'Shri S. K. Kadam (Tehsildar)',
    role: 'official',
    departmentName: 'Revenue Dept (MahaBhumi)',
    email: 'tehsildar.haveli@maharashtra.gov.in',
    badge: 'Department Official',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Inspects 360° citizen profiles. Blocked from viewing PDS data without citizen consent.'
  },
  {
    id: 'persona-admin',
    name: 'Ekikrit Integration Admin',
    role: 'admin',
    email: 'admin.ekikrit@maharashtra.gov.in',
    badge: 'System Administrator',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Manages adapters, simulates department downtime, onboards 4th system live, and uses Gemini AI.'
  }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeMode, setActiveMode] = useState('quick'); // 'quick' | 'manual'
  const [identifier, setIdentifier] = useState('9822019482');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulatedMsg, setSimulatedMsg] = useState(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (personaId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.quickLogin(personaId);
      apiClient.setToken(res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.requestOtp(identifier);
      setOtpSent(true);
      setOtp(res.simulatedOtp);
      setSimulatedMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.verifyOtp(identifier, otp);
      apiClient.setToken(res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0F3460] text-white p-5 flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Federated SSO & Identity Simulation</h3>
              <p className="text-xs text-blue-200">DigiLocker & Aadhaar Unified Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="border-b border-slate-200 bg-slate-50 p-2 flex space-x-2">
          <button
            onClick={() => setActiveMode('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'quick' ? 'bg-white shadow-sm text-[#0F3460] border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1-Click Demo Personas (Judging Fast-Track)
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeMode === 'manual' ? 'bg-white shadow-sm text-[#0F3460] border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simulated Aadhaar OTP Flow
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {activeMode === 'quick' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Select any verified citizen or official persona to evaluate Ekikrit with pre-populated multi-department data:
              </p>
              {DEMO_PERSONAS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleQuickLogin(p.id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0F3460] hover:shadow-md cursor-pointer transition-all bg-white hover:bg-blue-50/30 flex items-start justify-between group"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-[#0F3460]">{p.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.tagColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                      {p.unifiedId && <span>ID: {p.unifiedId}</span>}
                      {p.phone && <span>Mobile: {p.phone}</span>}
                      {p.departmentName && <span>Dept: {p.departmentName}</span>}
                    </div>
                  </div>
                  <button className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#0F3460] group-hover:text-white transition-colors">
                    Login →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {simulatedMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                  {simulatedMsg}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Aadhaar Number / Registered Mobile / Unified ID
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9822019482 or EK-MH-849102"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3460] focus:border-[#0F3460] outline-none font-mono"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Default test mobile is pre-filled for Citizen Rajesh Patil (9822019482).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-[#0F3460] text-white rounded-lg text-xs font-bold hover:bg-[#0a2342] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Generating Simulated OTP...' : 'Send OTP via National Gateway'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Enter 6-Digit One-Time Password (OTP)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base tracking-widest font-mono text-center focus:ring-2 focus:ring-[#0F3460] focus:border-[#0F3460] outline-none"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setOtp('123456')}
                      className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100"
                    >
                      Prefill 123456
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? 'Verifying & Generating JWT...' : 'Verify OTP & Issue Federated JWT'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline block text-center w-full"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Federated tokens carry encrypted Unified Citizen ID & RBAC claims per SIH26129 specifications.
        </div>
      </div>
    </div>
  );
}