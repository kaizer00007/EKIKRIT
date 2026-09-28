import React, { useState, useEffect } from 'react';
import { 
  User, CheckCircle2, Clock, ShieldCheck, AlertCircle, 
  ExternalLink, FileText, ChevronRight, XCircle, RefreshCw, KeyRound, Building2,
  Layers, Sparkles, ChevronDown, ChevronUp, PackageCheck, AlertTriangle
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import BundleCatalog from './BundleCatalog.jsx';
import BundleApplicationModal from './BundleApplicationModal.jsx';

export default function CitizenPortal({ currentUser, onSwitchPersona }) {
  const [unifiedId, setUnifiedId] = useState(currentUser?.unifiedId || 'EK-MH-849102');
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [bundleApplications, setBundleApplications] = useState([]);
  const [consents, setConsents] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('bundles'); // 'bundles' | 'tracker' | 'consent' | 'profile'
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [expandedBundleIds, setExpandedBundleIds] = useState({});

  useEffect(() => {
    if (currentUser?.unifiedId) {
      setUnifiedId(currentUser.unifiedId);
    }
  }, [currentUser]);

  useEffect(() => {
    loadCitizenData(unifiedId);
  }, [unifiedId]);

  const loadCitizenData = async (id) => {
    setLoading(true);
    setMessage(null);
    try {
      const [recRes, appRes, conRes, bundleRes] = await Promise.all([
        apiClient.getCitizenRecords(id),
        apiClient.getCitizenApplications(id),
        apiClient.getCitizenConsents(id),
        apiClient.getCitizenBundleApplications(id).catch(() => ({ applications: [] }))
      ]);
      setProfile(recRes.profile);
      setApplications(appRes.tracker?.applications || []);
      const combinedBundles = bundleRes.applications || appRes.tracker?.bundleApplications || [];
      setBundleApplications(combinedBundles);
      // Expand all bundle cards by default for demo clarity
      const initialExpanded = {};
      combinedBundles.forEach(b => { initialExpanded[b.id] = true; });
      setExpandedBundleIds(initialExpanded);
      setConsents(conRes.consents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConsent = async (consentId) => {
    setActionLoading(true);
    try {
      await apiClient.approveConsent(consentId);
      setMessage({ type: 'success', text: 'Consent APPROVED successfully. Target department can now inspect authorized data.' });
      loadCitizenData(unifiedId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDenyConsent = async (consentId) => {
    setActionLoading(true);
    try {
      await apiClient.denyConsent(consentId);
      setMessage({ type: 'info', text: 'Consent request DENIED.' });
      loadCitizenData(unifiedId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId) => {
    setActionLoading(true);
    try {
      await apiClient.revokeConsent(consentId);
      setMessage({ type: 'warning', text: 'Active consent REVOKED immediately. Cross-department access is now terminated.' });
      loadCitizenData(unifiedId);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingConsents = consents.filter(c => c.status === 'PENDING');
  const activeConsents = consents.filter(c => c.status === 'APPROVED');
  const pastConsents = consents.filter(c => c.status === 'DENIED' || c.status === 'REVOKED');

  return (
    <div className="space-y-6 pb-12">
      {/* Citizen Header & Persona Switcher */}
      <div className="gov-card p-6 border-l-4 border-l-[#0F3460] bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F3460] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-amber-400">
            {profile?.canonicalDemographics.fullName?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{profile?.canonicalDemographics.fullName || 'Loading Profile...'}</h2>
              <span className="gov-badge gov-badge-success">Aadhaar Linked & Verified</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono mt-1">
              <span>Unified ID: <strong className="text-slate-800">{unifiedId}</strong></span>
              <span>•</span>
              <span>DOB: <strong className="text-slate-800">{profile?.canonicalDemographics.dob}</strong></span>
              <span>•</span>
              <span>Mobile: <strong className="text-slate-800">{profile?.canonicalDemographics.phoneMasked}</strong></span>
              <span>•</span>
              <span>District: <strong className="text-slate-800">{profile?.canonicalDemographics.district}, MH</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Citizen Switcher for Demo */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
          <label className="text-xs font-bold text-slate-500 uppercase">Demo Citizen:</label>
          <select
            value={unifiedId}
            onChange={(e) => setUnifiedId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F3460]"
          >
            <option value="EK-MH-849102">Rajesh Tukaram Patil (Pending Consent & Anomaly)</option>
            <option value="EK-MH-849103">Sunita Ramesh Deshmukh (Active Consent)</option>
            <option value="EK-MH-849104">Amol Vitthal Shinde (Application Tracker)</option>
          </select>
        </div>
      </div>

      {/* Action / Alert Message Toast */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between animate-in fade-in ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          message.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          message.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-bold ml-4">Dismiss</button>
        </div>
      )}

      {/* Subtabs: Bundles vs Tracker vs Consent Manager vs Profile */}
      <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 pt-3 rounded-t-xl gap-4 md:gap-6 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveSubTab('bundles')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'bundles'
              ? 'border-[#0F3460] text-[#0F3460]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>🎯 Goal-Based Bundles</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Featured
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'tracker'
              ? 'border-[#0F3460] text-[#0F3460]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Unified Application Tracker ({applications.length + bundleApplications.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('consent')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap relative ${
            activeSubTab === 'consent'
              ? 'border-[#0F3460] text-[#0F3460]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DEPA Consent Manager</span>
          {pendingConsents.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
              {pendingConsents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'border-[#0F3460] text-[#0F3460]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Connected Department Records ({Object.keys(profile?.departmentRecords || {}).length})</span>
        </button>
      </div>

      {/* TAB 0: GOAL-BASED LIFE/BUSINESS EVENT BUNDLES (Feature Addition) */}
      {activeSubTab === 'bundles' && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200">
          <BundleCatalog
            onSelectBundle={(bundle) => {
              setSelectedBundle(bundle);
              setIsBundleModalOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 1: UNIFIED APPLICATION TRACKER (Priority 5 + Hierarchical Bundles) */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 space-y-8">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Unified Multi-Department Status Tracker</h3>
              <p className="text-xs text-slate-500">
                Single consolidated view tracking all applications across Food & Civil Supplies, Revenue / MahaBhumi, and Skill Development.
              </p>
            </div>

            {/* SECTION A: GOAL-BASED BUNDLED APPLICATIONS */}
            {bundleApplications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <span>Goal-Based Bundled Applications ({bundleApplications.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Multi-department parallel fan-out orchestrations</span>
                </div>

                <div className="space-y-4">
                  {bundleApplications.map((bApp) => {
                    const isExpanded = expandedBundleIds[bApp.id] !== false;
                    const childResults = bApp.results || [];
                    const offlineCount = childResults.filter(r => r.status === 'QUEUED_OFFLINE').length;
                    const approvedCount = childResults.filter(r => r.status === 'APPROVED').length;

                    return (
                      <div key={bApp.id} className="rounded-xl border-2 border-emerald-200 bg-emerald-50/20 overflow-hidden shadow-sm transition-all">
                        {/* Parent Bundle Header Bar */}
                        <div 
                          onClick={() => setExpandedBundleIds(prev => ({ ...prev, [bApp.id]: !isExpanded }))}
                          className="p-5 bg-gradient-to-r from-emerald-50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-emerald-50/80 transition-colors border-b border-emerald-100"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#0F3460] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                Parent Bundle
                              </span>
                              <span className="text-xs font-mono font-semibold text-slate-600">ID: {bApp.id}</span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">Submitted: {new Date(bApp.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                              {bApp.bundleTitle}
                              <span className="text-xs font-normal text-slate-500">({childResults.length} Sub-Applications)</span>
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 self-end md:self-auto">
                            {offlineCount > 0 ? (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                {offlineCount} Queued Offline
                              </span>
                            ) : (
                              <span className="gov-badge gov-badge-success">
                                {approvedCount === childResults.length ? 'ALL APPROVED' : `${approvedCount}/${childResults.length} CONFIRMED`}
                              </span>
                            )}

                            <button className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Child Sub-Applications Hierarchy */}
                        {isExpanded && (
                          <div className="p-5 space-y-3 bg-white">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Sub-Applications Dispatched Across Independent Department Systems:
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              {childResults.map((child, cIdx) => (
                                <div key={cIdx} className={`p-4 rounded-xl border transition-all ${
                                  child.status === 'QUEUED_OFFLINE' 
                                    ? 'bg-amber-50/60 border-amber-300' 
                                    : child.status === 'APPROVED'
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200'
                                }`}>
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#0F3460]">{child.departmentName}</span>
                                        <span className="text-xs text-slate-300">•</span>
                                        <span className="text-[11px] font-mono text-slate-500">Ref: {child.applicationId}</span>
                                      </div>
                                      <h5 className="font-bold text-sm text-slate-900">{child.serviceName}</h5>
                                    </div>

                                    <div>
                                      {child.status === 'QUEUED_OFFLINE' ? (
                                        <span className="px-2.5 py-1 bg-amber-200 text-amber-900 border border-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                                          QUEUED_OFFLINE
                                        </span>
                                      ) : child.status === 'APPROVED' ? (
                                        <span className="gov-badge gov-badge-success">APPROVED</span>
                                      ) : (
                                        <span className="gov-badge gov-badge-info">SUBMITTED (IN_REVIEW)</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Department message or offline queue resilience notice */}
                                  {child.status === 'QUEUED_OFFLINE' ? (
                                    <div className="mt-3 p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                      <div>
                                        <strong>Resilient Offline Queue Active:</strong> {child.message || 'Department adapter temporarily unavailable. Ekikrit has safely queued your application with DEPA consent. Automatic delivery will resume when connection restores.'}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
                                      <span>{child.message}</span>
                                      <span className="text-[11px] text-slate-400 font-mono">Est: ~{child.estimatedDays} days</span>
                                    </div>
                                  )}

                                  {/* 3-Step Mini Progress Pipeline */}
                                  <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70">
                                    <div className="text-[10px] flex items-center gap-1 font-semibold text-emerald-700">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>1. Fan-out Dispatched</span>
                                    </div>
                                    <div className={`text-[10px] flex items-center gap-1 font-semibold ${
                                      child.status === 'QUEUED_OFFLINE' ? 'text-amber-700' : 'text-emerald-700'
                                    }`}>
                                      {child.status === 'QUEUED_OFFLINE' ? (
                                        <>
                                          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                          <span>2. Queued in Buffer</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>2. Ingested by Legacy Dept</span>
                                        </>
                                      )}
                                    </div>
                                    <div className={`text-[10px] flex items-center gap-1 font-semibold ${
                                      child.status === 'APPROVED' ? 'text-emerald-700' : 'text-slate-400'
                                    }`}>
                                      {child.status === 'APPROVED' ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          <span>3. Decision Approved</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span>3. In Scrutiny</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION B: INDIVIDUAL DEPARTMENT APPLICATIONS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Single Department Applications ({applications.length})</span>
              </h4>

              {applications.length === 0 && bundleApplications.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No active applications currently tracked for this citizen.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#0F3460]">{app.departmentName}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-mono font-semibold text-slate-600">ID: {app.id}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mt-0.5">{app.serviceName}</h4>
                        </div>
                        <span className={`gov-badge ${
                          app.currentStatus === 'APPROVED' || app.currentStatus === 'DISBURSED_SCHEDULED' || app.currentStatus === 'DISBURSED'
                            ? 'gov-badge-success'
                            : 'gov-badge-warning'
                        }`}>
                          Stage: {app.currentStatus}
                        </span>
                      </div>

                      {/* Step Timeline */}
                      <div className="relative pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {app.steps.map((step, sIdx) => (
                            <div key={sIdx} className="bg-white p-3 rounded-lg border border-slate-200 relative space-y-1">
                              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Step {sIdx + 1} Cleared</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                              <span className="text-[10px] text-slate-400 block font-mono">{step.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                        <span>Submitted: {app.submittedDate}</span>
                        <span>Last Activity: {app.lastUpdatedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* TAB 2: DEPA CONSENT MANAGER (Priority 4) */}
      {activeSubTab === 'consent' && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 space-y-8">
          <div>
            <h3 className="font-bold text-sm text-slate-900">DEPA / Account-Aggregator Consent Manager</h3>
            <p className="text-xs text-slate-500">
              In accordance with DPDP Act 2023, government departments cannot inspect your records in other departments without your explicit, time-bound approval.
            </p>
          </div>

          {/* Pending Consent Requests */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending Consent Requests Awaiting Your Approval ({pendingConsents.length})
            </h4>

            {pendingConsents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 text-center">
                No pending consent requests. All external access requests have been addressed.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingConsents.map((consent) => (
                  <div key={consent.consentId} className="p-5 rounded-xl border-2 border-amber-300 bg-amber-50/40 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          REF: {consent.consentId}
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 mt-1">
                          {consent.requestingDepartmentName} requests access to your {consent.targetDepartmentName} records
                        </h5>
                      </div>
                      <span className="text-xs font-mono text-amber-800">
                        Expires: {new Date(consent.validUntil).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs space-y-2">
                      <div>
                        <span className="text-slate-500 font-bold block text-[11px]">Official Purpose Stated:</span>
                        <p className="text-slate-800 italic">"{consent.purpose}"</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[11px]">Granular Data Fields Requested:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {consent.requestedFields.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        onClick={() => handleApproveConsent(consent.consentId)}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                      >
                        Approve Data Sharing
                      </button>
                      <button
                        onClick={() => handleDenyConsent(consent.consentId)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Consents */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active Consents Granted by You ({activeConsents.length})
            </h4>

            {activeConsents.length === 0 ? (
              <p className="text-xs text-slate-500">No active consent authorizations.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeConsents.map((c) => (
                  <div key={c.consentId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="gov-badge gov-badge-success mb-1">Active Authorization</span>
                        <h5 className="font-bold text-xs text-slate-900">{c.requestingDepartmentName}</h5>
                        <p className="text-[11px] text-slate-500">Reading: {c.targetDepartmentName}</p>
                      </div>
                      <button
                        onClick={() => handleRevokeConsent(c.consentId)}
                        disabled={actionLoading}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Revoke Access
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                      "{c.purpose}"
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Approved: {new Date(c.approvedAt || c.createdAt).toLocaleDateString()}</span>
                      <span>Valid until: {new Date(c.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / Revoked Consents Audit */}
          {pastConsents.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Consent History & Revocations
              </h4>
              <div className="space-y-2">
                {pastConsents.map((c) => (
                  <div key={c.consentId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{c.requestingDepartmentName}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-slate-500">{c.purpose}</span>
                    </div>
                    <span className={`gov-badge ${c.status === 'REVOKED' ? 'gov-badge-danger' : 'bg-slate-200 text-slate-700'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CONNECTED DEPARTMENT RECORDS */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Department Records Linked via Ekikrit</h3>
            <p className="text-xs text-slate-500">
              Real-time live data queried through each department's specialized adapter connector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PDS */}
            {profile?.departmentRecords?.['dept-pds']?.data?.domainData && (
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F3460]">Food & Civil Supplies (PDS)</span>
                  <span className="gov-badge gov-badge-info">OAuth2 Connected</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>Ration Card No: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-pds'].data.domainData.rationCardNo}</strong></div>
                  <div>Card Category: <strong className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{profile.departmentRecords['dept-pds'].data.domainData.cardTier}</strong></div>
                  <div>Family Members: <strong>{profile.departmentRecords['dept-pds'].data.domainData.familyMembersCount}</strong></div>
                  <div>Monthly Quota: <strong>{profile.departmentRecords['dept-pds'].data.domainData.monthlyQuotaKg} kg</strong></div>
                  <div>Assigned Fair Price Shop: <span className="font-mono">{profile.departmentRecords['dept-pds'].data.domainData.fairPriceShopId}</span></div>
                </div>
              </div>
            )}

            {/* Land Records */}
            {profile?.departmentRecords?.['dept-land-records']?.data?.domainData && (
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Revenue (MahaBhumi)</span>
                  <span className="gov-badge gov-badge-success">HMAC Connected</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>Owner Property Ref: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-land-records'].data.domainData.propertyOwnerId}</strong></div>
                  <div>Khata / Survey No: <strong>{profile.departmentRecords['dept-land-records'].data.domainData.khataNo} / {profile.departmentRecords['dept-land-records'].data.domainData.surveyNo}</strong></div>
                  <div>Holding Area: <strong className="text-blue-700">{profile.departmentRecords['dept-land-records'].data.domainData.totalAreaHectares} Hectares</strong></div>
                  <div>Classification: <span>{profile.departmentRecords['dept-land-records'].data.domainData.landClassification}</span></div>
                  <div>Encumbrance: <span className="text-emerald-700 font-semibold">{profile.departmentRecords['dept-land-records'].data.domainData.encumbranceStatus}</span></div>
                </div>
              </div>
            )}

            {/* Employment */}
            {profile?.departmentRecords?.['dept-employment']?.data?.domainData && (
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-800">Skill Dev (Mahaswayam)</span>
                  <span className="gov-badge gov-badge-info">API Key Connected</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>Applicant Ref: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-employment'].data.domainData.applicantReference}</strong></div>
                  <div>Employment Status: <strong className="text-indigo-800">{profile.departmentRecords['dept-employment'].data.domainData.employmentStatus}</strong></div>
                  <div>Qualification: <span>{profile.departmentRecords['dept-employment'].data.domainData.highestQualification}</span></div>
                  <div>Annual Declared Income: <span>Rs. {profile.departmentRecords['dept-employment'].data.domainData.annualDeclaredIncomeInr?.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            )}

            {/* MahaDBT (4th Live System) */}
            {profile?.departmentRecords?.['dept-mahadbt']?.data?.domainData && (
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800">Social Welfare (MahaDBT)</span>
                  <span className="gov-badge gov-badge-warning">Dynamic Onboarded</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div>Scheme: <strong className="text-slate-900">{profile.departmentRecords['dept-mahadbt'].data.domainData.schemeTitle}</strong></div>
                  <div>Disbursed Grant: <strong className="text-emerald-700">Rs. {profile.departmentRecords['dept-mahadbt'].data.domainData.disbursedAmountInr?.toLocaleString('en-IN')}</strong></div>
                  <div>Status: <span className="font-bold text-emerald-800">{profile.departmentRecords['dept-mahadbt'].data.domainData.grantStatus}</span></div>
                  <div>Disbursal Date: <span>{profile.departmentRecords['dept-mahadbt'].data.domainData.disbursalDate}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Guided Goal-Based Bundle Application */}
      <BundleApplicationModal
        isOpen={isBundleModalOpen}
        onClose={() => setIsBundleModalOpen(false)}
        bundle={selectedBundle}
        unifiedId={unifiedId}
        onSuccess={(result) => {
          setMessage({
            type: 'success',
            text: `Bundle "${result.bundleTitle}" successfully submitted! Tracking ID: ${result.bundleApplicationId}. All ${result.results?.length || 0} departmental applications dispatched.`
          });
          loadCitizenData(unifiedId);
          setActiveSubTab('tracker');
        }}
      />
    </div>
  );
}