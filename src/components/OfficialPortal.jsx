import React, { useState, useEffect } from 'react';
import { 
  Shield, UserCheck, AlertTriangle, CheckCircle2, Lock, 
  Send, Search, RefreshCw, FileText, ChevronRight, Sliders, Check, X 
} from 'lucide-react';
import { apiClient } from '../api/client.js';

export default function OfficialPortal({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('360');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedId, setSelectedId] = useState('EK-MH-849102');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hitlQueue, setHitlQueue] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [officialMessage, setOfficialMessage] = useState(null);

  const [simProfileA, setSimProfileA] = useState({ name: 'PATIL RAJESH T', dobIso: '1985-08-14', district: 'PUNE', phone: '9822019482' });
  const [simProfileB, setSimProfileB] = useState({ name: 'Rajesh Tukaram Patil', dobIso: '1985-08-14', district: 'PUNE', phone: '9822019482' });
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    loadBeneficiaries();
    loadHitlQueue();
    loadBeneficiaryProfile('EK-MH-849102');
    handleSimulateMatch();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const res = await apiClient.getBeneficiaries();
      setBeneficiaries(res.citizens || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHitlQueue = async () => {
    try {
      const res = await apiClient.getHitlQueue();
      setHitlQueue(res.queue || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBeneficiaryProfile = async (id) => {
    setLoading(true);
    setOfficialMessage(null);
    try {
      const fakeToken = btoa(JSON.stringify({ 
        role: 'official', 
        departmentId: 'dept-land-records', 
        name: currentUser?.name || 'Shri S. K. Kadam (Tehsildar)' 
      }));
      apiClient.setToken(fakeToken);

      const res = await apiClient.getCitizenRecords(id);
      setProfile(res.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestConsent = async (targetDept) => {
    try {
      await apiClient.requestConsent({
        citizenUnifiedId: selectedId,
        targetDepartment: targetDept,
        purpose: 'Cross-verification of agricultural subsidy and ceiling entitlement under Maharashtra Revenue Code',
        requestedFields: ['cardTier', 'monthlyQuotaKg', 'familyMembersCount']
      });
      setOfficialMessage({ type: 'success', text: `Consent request dispatched to citizen ${selectedId}. Once citizen approves, data will unlock live.` });
      loadBeneficiaryProfile(selectedId);
    } catch (err) {
      setOfficialMessage({ type: 'error', text: err.message });
    }
  };

  const handleResolveHitl = async (matchId, decision) => {
    try {
      await apiClient.resolveHitl({
        matchId,
        decision,
        notes: resolveNotes || (decision === 'CONFIRM' ? 'Verified demographic credentials match.' : 'Uncertain match rejected.')
      });
      setOfficialMessage({ type: 'success', text: `Entity resolution record ${matchId} successfully ${decision === 'CONFIRM' ? 'CONFIRMED & LINKED' : 'REJECTED'}.` });
      setResolvingId(null);
      setResolveNotes('');
      loadHitlQueue();
      loadBeneficiaries();
    } catch (err) {
      setOfficialMessage({ type: 'error', text: err.message });
    }
  };

  const handleSimulateMatch = async () => {
    try {
      const res = await apiClient.simulateEntityMatch(simProfileA, simProfileB);
      setSimResult(res.result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="gov-card p-6 bg-gradient-to-r from-slate-900 to-[#0F3460] text-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Official Portal — Revenue Department (MahaBhumi)</span>
          </div>
          <h2 className="text-xl font-bold mt-1">Cross-Department 360° Beneficiary & MDM Studio</h2>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as: <strong className="text-white">{currentUser?.name || 'Shri S. K. Kadam (Tehsildar)'}</strong> • Role: Official (RBAC Protected)
          </p>
        </div>

        <div className="flex bg-white/10 p-1 rounded-xl text-xs font-bold border border-white/20">
          <button
            onClick={() => setActiveSubTab('360')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === '360' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            360° Beneficiary View
          </button>
          <button
            onClick={() => setActiveSubTab('hitl')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeSubTab === 'hitl' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            HITL Triage Queue
            {hitlQueue.filter(q => q.status === 'PENDING_OFFICIAL_REVIEW').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">
                {hitlQueue.filter(q => q.status === 'PENDING_OFFICIAL_REVIEW').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'simulator' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            Match Simulator
          </button>
        </div>
      </div>

      {officialMessage && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          officialMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{officialMessage.text}</span>
          <button onClick={() => setOfficialMessage(null)} className="underline font-bold ml-4">Dismiss</button>
        </div>
      )}

      {activeSubTab === '360' && (
        <div className="space-y-6">
          <div className="gov-card p-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Beneficiary Record:</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  loadBeneficiaryProfile(e.target.value);
                }}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F3460] w-full sm:w-auto"
              >
                {beneficiaries.map(b => (
                  <option key={b.unifiedId} value={b.unifiedId}>
                    {b.canonicalName} ({b.unifiedId}) — {b.canonicalDistrict}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => loadBeneficiaryProfile(selectedId)}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Live View
            </button>
          </div>

          {profile && (
            <div className="space-y-6">
              {profile.anomalies && profile.anomalies.length > 0 && (
                <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                    <span>POTENTIAL WELFARE FRAUD / ELIGIBILITY ANOMALY FLAGGED</span>
                  </div>
                  {profile.anomalies.map(anom => (
                    <div key={anom.id} className="bg-white p-4 rounded-lg border border-rose-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-900 text-sm">{anom.title}</span>
                        <span className="gov-badge gov-badge-danger">{anom.severity} PRIORITY</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{anom.description}</p>
                      <div className="bg-slate-50 p-2.5 rounded font-mono text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                        <div>PDS Record: <strong>{anom.evidence.pdsBenefit}</strong></div>
                        <div>Land Record: <strong>{anom.evidence.landHolding}</strong></div>
                      </div>
                      <p className="text-[11px] text-rose-700 font-semibold pt-1">
                        Recommended Official Action: {anom.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="gov-card p-5 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{profile.canonicalDemographics.fullName}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Unified Citizen Reference: <strong className="text-[#0F3460]">{profile.unifiedId}</strong> • Jurisdiction: {profile.canonicalDemographics.district}, Maharashtra
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase">Entity Match Confidence</span>
                    <span className="font-mono font-bold text-emerald-700 text-base">{profile.metadata.matchConfidence}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Normalized DOB</span>
                    <strong className="font-mono text-slate-800">{profile.canonicalDemographics.dob}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Registered Mobile</span>
                    <strong className="font-mono text-slate-800">{profile.canonicalDemographics.phoneMasked}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Linked System IDs</span>
                    <strong className="text-slate-800">{profile.identifiers.length} Systems Connected</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Sources Successfully Queried</span>
                    <strong className="text-emerald-700">{profile.metadata.sourcesAvailable.length} Online</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="gov-card p-5 bg-white border-t-4 border-t-emerald-600 space-y-3">
                  <span className="gov-badge gov-badge-success mb-1">Your Department (MahaBhumi)</span>
                  <h4 className="font-bold text-xs text-slate-900">Revenue & Land Records</h4>
                  {profile.departmentRecords['dept-land-records']?.data?.domainData ? (
                    <div className="text-xs space-y-2 text-slate-700">
                      <div>Owner ID: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-land-records'].data.domainData.propertyOwnerId}</strong></div>
                      <div>Khata / Survey: <strong>{profile.departmentRecords['dept-land-records'].data.domainData.khataNo} / {profile.departmentRecords['dept-land-records'].data.domainData.surveyNo}</strong></div>
                      <div>Holding Area: <strong className="text-blue-800">{profile.departmentRecords['dept-land-records'].data.domainData.totalAreaHectares} Hectares</strong></div>
                      <div>Type: <span>{profile.departmentRecords['dept-land-records'].data.domainData.landClassification}</span></div>
                      <div>Encumbrance: <span className="font-semibold text-emerald-700">{profile.departmentRecords['dept-land-records'].data.domainData.encumbranceStatus}</span></div>
                    </div>
                  ) : <p className="text-xs text-slate-400">No record in Land Records.</p>}
                </div>

                <div className="gov-card p-5 bg-white border-t-4 border-t-amber-500 space-y-3">
                  <span className="gov-badge gov-badge-warning mb-1">Cross-Dept (Food & Civil Supplies)</span>
                  <h4 className="font-bold text-xs text-slate-900">Ration Card & Subsidies</h4>
                  {profile.departmentRecords['dept-pds']?.status === 'CONSENT_REQUIRED' ? (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-3">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>Protected by DEPA Policy</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Cross-department query blocked: Land Records officials cannot inspect PDS grain quotas without citizen authorization.
                      </p>
                      <button
                        onClick={() => handleRequestConsent('dept-pds')}
                        className="w-full py-2 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Request Access from Citizen
                      </button>
                    </div>
                  ) : profile.departmentRecords['dept-pds']?.data?.domainData ? (
                    <div className="text-xs space-y-2 text-slate-700">
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-800 font-semibold mb-2">
                        ✓ Authorized under Active DEPA Consent
                      </div>
                      <div>Ration Card: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-pds'].data.domainData.rationCardNo}</strong></div>
                      <div>Card Tier: <strong className="text-amber-800 bg-amber-50 px-1 rounded">{profile.departmentRecords['dept-pds'].data.domainData.cardTier}</strong></div>
                      <div>Monthly Quota: <strong>{profile.departmentRecords['dept-pds'].data.domainData.monthlyQuotaKg} kg</strong></div>
                      <div>Members: <strong>{profile.departmentRecords['dept-pds'].data.domainData.familyMembersCount}</strong></div>
                    </div>
                  ) : <p className="text-xs text-slate-400">No PDS record linked.</p>}
                </div>

                <div className="gov-card p-5 bg-white border-t-4 border-t-indigo-600 space-y-3">
                  <span className="gov-badge gov-badge-info mb-1">Cross-Dept (Skill Development)</span>
                  <h4 className="font-bold text-xs text-slate-900">Mahaswayam Employment</h4>
                  {profile.departmentRecords['dept-employment']?.status === 'CONSENT_REQUIRED' ? (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-3">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>Protected by DEPA Policy</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Cross-department data sharing requires active consent.
                      </p>
                      <button
                        onClick={() => handleRequestConsent('dept-employment')}
                        className="w-full py-2 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Request Access
                      </button>
                    </div>
                  ) : profile.departmentRecords['dept-employment']?.data?.domainData ? (
                    <div className="text-xs space-y-2 text-slate-700">
                      <div>Ref: <strong className="font-mono text-slate-900">{profile.departmentRecords['dept-employment'].data.domainData.applicantReference}</strong></div>
                      <div>Status: <strong className="text-indigo-800">{profile.departmentRecords['dept-employment'].data.domainData.employmentStatus}</strong></div>
                      <div>Qualification: <span>{profile.departmentRecords['dept-employment'].data.domainData.highestQualification}</span></div>
                    </div>
                  ) : <p className="text-xs text-slate-400">No Employment record linked.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {activeSubTab === 'hitl' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-[#0F3460]" />
              <h3 className="font-bold text-sm text-slate-900">Human-In-The-Loop (HITL) Master Data Management Triage</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fuzzy matching identifies candidates with 60%–84% match confidence. In accordance with government accountability principles, ambiguous matches require an official review instead of guessing automatically.
            </p>
          </div>

          <div className="space-y-6">
            {hitlQueue.map((item) => (
              <div key={item.matchId} className={`p-5 rounded-xl border-2 transition-all ${
                item.status === 'CONFIRMED' ? 'bg-emerald-50/40 border-emerald-300' :
                item.status === 'REJECTED' ? 'bg-slate-50 border-slate-300 opacity-60' :
                'bg-amber-50/30 border-amber-300'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <div>
                    <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      MATCH ID: {item.matchId}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">Reason: {item.flaggedReason}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Match Confidence: {item.confidenceScore}%
                    </span>
                    <span className={`gov-badge ${
                      item.status === 'CONFIRMED' ? 'gov-badge-success' :
                      item.status === 'REJECTED' ? 'gov-badge-danger' :
                      'gov-badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <span className="gov-badge gov-badge-info text-[10px]">Source A: {item.candidateA.sourceDept}</span>
                    <div>Name: <strong className="text-slate-900">{item.candidateA.name}</strong></div>
                    <div>DOB: <strong className="font-mono">{item.candidateA.dob || item.candidateA.dobIso}</strong></div>
                    <div>District: <span>{item.candidateA.district}</span></div>
                    {item.candidateA.phone && <div>Phone: <span className="font-mono">{item.candidateA.phone}</span></div>}
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <span className="gov-badge gov-badge-info text-[10px]">Source B: {item.candidateB.sourceDept}</span>
                    <div>Name: <strong className="text-slate-900">{item.candidateB.name}</strong></div>
                    <div>DOB: <strong className="font-mono">{item.candidateB.dob || item.candidateB.dobIso}</strong></div>
                    <div>District: <span>{item.candidateB.district}</span></div>
                    {item.candidateB.phone && <div>Phone: <span className="font-mono">{item.candidateB.phone}</span></div>}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs mb-4">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase mb-2">Similarity Breakdown</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {item.matchFactors.map((mf, i) => (
                      <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                        <div className="flex justify-between font-bold text-[11px]">
                          <span>{mf.factor}</span>
                          <span className="text-emerald-700 font-mono">{mf.score}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">{mf.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {item.status === 'PENDING_OFFICIAL_REVIEW' ? (
                  <div className="space-y-3 pt-2">
                    {resolvingId === item.matchId ? (
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-300">
                        <label className="block text-xs font-bold text-slate-700">Official Decision Audit Note:</label>
                        <input
                          type="text"
                          value={resolveNotes}
                          onChange={(e) => setResolveNotes(e.target.value)}
                          placeholder="e.g. Identity verified against physical Ration card copy."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:ring-2 focus:ring-[#0F3460]"
                        />
                        <div className="flex space-x-2 pt-1">
                          <button
                            onClick={() => handleResolveHitl(item.matchId, 'CONFIRM')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Confirm Entity Link (Generate Master ID)
                          </button>
                          <button
                            onClick={() => handleResolveHitl(item.matchId, 'REJECT')}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject Match (Separate Entities)
                          </button>
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(item.matchId)}
                        className="px-4 py-2 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Review & Take Decision →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded border border-slate-200">
                    Decision recorded by <strong>{item.resolvedBy}</strong> on {new Date(item.resolvedAt).toLocaleString()}. Note: "{item.officialNotes}"
                    {item.generatedUnifiedId && <span className="block text-emerald-700 font-bold mt-1">Generated Master ID: {item.generatedUnifiedId}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'simulator' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Interactive Fuzzy-Match Scoring Simulator</h3>
            <p className="text-xs text-slate-500">
              Test how Jaro-Winkler distance, token sort ratio, and normalized DOB calculations handle messy Maharashtra name inversions and typing variations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="font-bold text-xs text-[#0F3460]">Candidate Record A (e.g. PDS)</span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  value={simProfileA.name}
                  onChange={(e) => setSimProfileA({ ...simProfileA, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">DOB (ISO)</label>
                  <input
                    type="text"
                    value={simProfileA.dobIso}
                    onChange={(e) => setSimProfileA({ ...simProfileA, dobIso: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={simProfileA.district}
                    onChange={(e) => setSimProfileA({ ...simProfileA, district: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <span className="font-bold text-xs text-emerald-800">Candidate Record B (e.g. Land Records)</span>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  value={simProfileB.name}
                  onChange={(e) => setSimProfileB({ ...simProfileB, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">DOB (ISO)</label>
                  <input
                    type="text"
                    value={simProfileB.dobIso}
                    onChange={(e) => setSimProfileB({ ...simProfileB, dobIso: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={simProfileB.district}
                    onChange={(e) => setSimProfileB({ ...simProfileB, district: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleSimulateMatch}
              className="px-6 py-2 bg-[#0F3460] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0a2342]"
            >
              Calculate Composite Similarity Score
            </button>
          </div>

          {simResult && (
            <div className="p-5 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-sm font-bold">Composite Match Confidence Score:</span>
                <span className={`text-2xl font-extrabold font-mono ${
                  simResult.overallScore >= 85 ? 'text-emerald-400' :
                  simResult.overallScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {simResult.overallScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Name Similarity</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.nameSim}%</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">DOB Match</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.dobSim}%</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">District Proximity</span>
                  <span className="font-mono font-bold text-emerald-400">{simResult.districtSim}%</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Triage Action</span>
                  <span className="font-bold text-amber-300">
                    {simResult.overallScore >= 85 ? 'AUTO LINKED' : simResult.overallScore >= 60 ? 'ROUTE TO HITL' : 'DISJOINT'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}