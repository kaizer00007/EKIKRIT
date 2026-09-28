import React, { useState, useEffect } from 'react';
import { Layers, Shield, ArrowRight, Play, CheckCircle2, AlertTriangle, RefreshCw, Lock, Sparkles, Database } from 'lucide-react';
import { apiClient } from '../api/client.js';

export default function ArchitectureView({ onSelectCitizenTab, onSelectOfficialTab, onSelectAdminTab }) {
  const [selectedCitizen, setSelectedCitizen] = useState('EK-MH-849102');
  const [callerRole, setCallerRole] = useState('citizen');
  const [callerDept, setCallerDept] = useState('hub-citizen-direct');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adapters, setAdapters] = useState([]);

  useEffect(() => {
    loadAdapters();
    runLiveQuery('EK-MH-849102', 'citizen', 'hub-citizen-direct');
  }, []);

  const loadAdapters = async () => {
    try {
      const res = await apiClient.getAdapters();
      setAdapters(res.adapters || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runLiveQuery = async (cId = selectedCitizen, role = callerRole, dept = callerDept) => {
    setLoading(true);
    try {
      // Set simulated token role in client
      const fakeToken = btoa(JSON.stringify({ role, departmentId: dept, name: role === 'official' ? 'Tehsildar Kadam' : 'Citizen' }));
      apiClient.setToken(fakeToken);

      const res = await apiClient.getCitizenRecords(cId);
      setQueryResult(res.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole, newDept) => {
    setCallerRole(newRole);
    setCallerDept(newDept);
    runLiveQuery(selectedCitizen, newRole, newDept);
  };

  const handleCitizenChange = (cId) => {
    setSelectedCitizen(cId);
    runLiveQuery(cId, callerRole, callerDept);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Presentation Header */}
      <div className="bg-gradient-to-r from-[#0F3460] to-[#16213E] rounded-2xl text-white p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-wide border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            SMART INDIA HACKATHON 2026 — PS #SIH26129
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Ekikrit (एकीकृत): Zero-Replacement Interoperability Middleware
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Independent Maharashtra departments run siloed portals with mismatched date formats, unique IDs, and divergent auth. 
            <strong className="text-white"> Ekikrit solves this without rewriting or consolidating legacy databases</strong> using a federated 
            <strong className="text-amber-400"> Adapter/Connector Pattern</strong>, DEPA citizen consent enforcement, and real-time query brokering.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Federated (No Data Duplication)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              DEPA Consent Gatekeeper
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Dynamic 4th System Onboarding
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Query Engine (Top Judge Demo Tool) */}
      <div className="gov-card p-6 border-2 border-[#0F3460]/20 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">Live Integration Hub Query Broker</h2>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                GET /citizen/:unifiedId/records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dispatches parallel asynchronous queries across all connected adapters, normalizes mismatched dates & formats, and verifies DEPA consent live.
            </p>
          </div>

          <button
            onClick={() => runLiveQuery()}
            disabled={loading}
            className="px-4 py-2 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Brokering Query...' : 'Execute Live Query'}
          </button>
        </div>

        {/* Live Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Unified Citizen Profile
            </label>
            <select
              value={selectedCitizen}
              onChange={(e) => handleCitizenChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0F3460]"
            >
              <option value="EK-MH-849102">Rajesh Tukaram Patil (EK-MH-849102) — Multi-system + Anomaly</option>
              <option value="EK-MH-849103">Sunita Ramesh Deshmukh (EK-MH-849103) — Approved Consent Record</option>
              <option value="EK-MH-849104">Amol Vitthal Shinde (EK-MH-849104) — In Review / Tracker</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Simulate Caller Identity & DEPA Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('citizen', 'hub-citizen-direct')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  callerRole === 'citizen'
                    ? 'bg-[#0F3460] text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Citizen Self-Query (Full Access)
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('official', 'dept-land-records')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  callerRole === 'official'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Land Records Official (DEPA Enforced)
              </button>
            </div>
          </div>
        </div>

        {/* Live Query Results Pane */}
        {queryResult ? (
          <div className="space-y-6">
            {/* Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs">
              <div className="flex items-center space-x-4">
                <span>Latency: <strong className="text-emerald-400">{queryResult.metadata.totalLatencyMs}ms</strong></span>
                <span>Active Adapters: <strong className="text-sky-400">{queryResult.metadata.activeAdaptersCount}</strong></span>
                <span>Sources OK: <strong className="text-emerald-400">{queryResult.metadata.sourcesAvailable.length}</strong></span>
                {queryResult.metadata.sourcesConsentBlocked.length > 0 && (
                  <span className="text-amber-300">Consent Blocked: <strong>{queryResult.metadata.sourcesConsentBlocked.length}</strong></span>
                )}
                {queryResult.metadata.sourcesUnavailable.length > 0 && (
                  <span className="text-rose-400">Offline: <strong>{queryResult.metadata.sourcesUnavailable.length}</strong></span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                Match Confidence: <span className="text-amber-400 font-bold">{queryResult.metadata.matchConfidence}%</span>
              </div>
            </div>

            {/* Cross-Department Anomaly Banner if detected */}
            {queryResult.anomalies && queryResult.anomalies.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>CROSS-DEPARTMENT WELFARE ANOMALY DETECTED BY MIDDLEWARE</span>
                </div>
                {queryResult.anomalies.map(anom => (
                  <div key={anom.id} className="text-xs text-rose-700 bg-white/80 p-3 rounded-lg border border-rose-200 space-y-1">
                    <p className="font-bold text-rose-900">{anom.title}</p>
                    <p className="leading-relaxed">{anom.description}</p>
                    <p className="text-[11px] text-rose-600 font-medium">Action: {anom.recommendedAction}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Department Adapter Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PDS Card */}
              {renderDeptAdapterCard(
                'dept-pds',
                'Food & Civil Supplies (PDS)',
                'OAuth2 Client Credentials',
                queryResult.departmentRecords['dept-pds'],
                'beneficiary_id, ration_no',
                'DD-MM-YYYY ("14-08-1985")'
              )}

              {/* Land Records Card */}
              {renderDeptAdapterCard(
                'dept-land-records',
                'Revenue Dept (MahaBhumi)',
                'HMAC-SHA256 Signed Header',
                queryResult.departmentRecords['dept-land-records'],
                'citizen_uid, 7-12 property_id',
                'ISO 8601 ("1985-08-14T00:00Z")'
              )}

              {/* Employment Card */}
              {renderDeptAdapterCard(
                'dept-employment',
                'Skill Dev (Mahaswayam)',
                'API Key (X-Department-Key)',
                queryResult.departmentRecords['dept-employment'],
                'applicant_ref, aadhar_no',
                'Unix Timestamp (492825600)'
              )}

              {/* Dynamic 4th Dept Card (if onboarded) */}
              {queryResult.departmentRecords['dept-mahadbt'] && renderDeptAdapterCard(
                'dept-mahadbt',
                'Social Welfare (MahaDBT) [4th Live Dept]',
                'Dynamic Bearer API Key',
                queryResult.departmentRecords['dept-mahadbt'],
                'dbt_reg_id',
                'YYYY/MM/DD ("1985/08/14")'
              )}
            </div>

            {/* Canonical Synthesized Profile */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Normalized Canonical Record Synthesized by Ekikrit
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Unified Citizen ID</span>
                  <span className="font-mono font-bold text-slate-800">{queryResult.unifiedId}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Canonical Name</span>
                  <span className="font-bold text-slate-800">{queryResult.canonicalDemographics.fullName}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Canonical DOB (ISO 8601)</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                    {queryResult.canonicalDemographics.dob}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                  <span className="text-slate-400 block text-[10px] uppercase">Jurisdiction</span>
                  <span className="font-bold text-slate-800">{queryResult.canonicalDemographics.district}, MH</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Architectural Explanatory Cards for Hackathon Judges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gov-card p-5 space-y-2 border-t-4 border-t-blue-600">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3>The Adapter / Connector Pattern</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every department integrates through its own decoupled connector fulfilling <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">IDepartmentAdapter</code>.
            The central hub never executes SQL on department databases directly.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 pt-1">
            <li>Encapsulates native auth protocols</li>
            <li>Normalizes messy dates to ISO 8601</li>
            <li>Circuit breaker isolates timeouts</li>
          </ul>
        </div>

        <div className="gov-card p-5 space-y-2 border-t-4 border-t-emerald-600">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3>DEPA Citizen Consent Engine</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Complies with India's DPDP Act and DEPA standard. Even authorized government officials cannot inspect another department's records without active, purpose-specific consent.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 pt-1">
            <li>Time-bound consent tokens</li>
            <li>Granular field authorization</li>
            <li>1-click revocation by citizen</li>
          </ul>
        </div>

        <div className="gov-card p-5 space-y-2 border-t-4 border-t-amber-600">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3>AI Schema Onboarding (Gemini)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Onboard new departments in minutes instead of weeks of manual XML/JSON schema mapping. Admins paste sample payloads; Gemini AI suggests mapping with confidence scores.
          </p>
          <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 pt-1">
            <li>Automatic date & identifier detection</li>
            <li>Dynamic adapter synthesis</li>
            <li>Zero server reboot required</li>
          </ul>
        </div>
      </div>
    </div>
  );

  function renderDeptAdapterCard(deptId, deptName, authType, recordData, nativeIds, nativeDob) {
    if (!recordData) {
      return (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
          {deptName} (Not queried)
        </div>
      );
    }

    const isConsentBlocked = recordData.status === 'CONSENT_REQUIRED';
    const isError = recordData.status === 'ERROR' || recordData.status === 'UNAVAILABLE';
    const isSuccess = recordData.status === 'SUCCESS';

    return (
      <div className={`p-4 rounded-xl border transition-all ${
        isConsentBlocked ? 'bg-amber-50/70 border-amber-300' :
        isError ? 'bg-rose-50/70 border-rose-300' :
        'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-xs text-slate-900 leading-tight">{deptName}</h4>
            <span className="text-[10px] text-slate-500 font-mono block">Auth: {authType}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isSuccess ? 'bg-emerald-100 text-emerald-800' :
            isConsentBlocked ? 'bg-amber-200 text-amber-900 font-bold' :
            'bg-rose-100 text-rose-800'
          }`}>
            {recordData.status}
          </span>
        </div>

        {isConsentBlocked ? (
          <div className="space-y-2 py-2">
            <div className="flex items-center space-x-1.5 text-amber-800 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>DEPA Consent Protection Active</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed bg-white/80 p-2.5 rounded border border-amber-200">
              {recordData.message}
            </p>
            <p className="text-[10px] text-slate-500 italic">
              Switch to Citizen Portal to approve pending consent.
            </p>
          </div>
        ) : isError ? (
          <div className="space-y-1 py-2 text-xs text-rose-700">
            <div className="flex items-center space-x-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Adapter Degraded / Offline</span>
            </div>
            <p className="text-[11px] bg-white p-2 rounded border border-rose-200">{recordData.error}</p>
            <p className="text-[10px] text-slate-500">Hub gracefully isolated this failure without crashing.</p>
          </div>
        ) : (
          <div className="space-y-2 text-xs text-slate-700 pt-1">
            <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[11px] space-y-1">
              <div className="text-slate-400 text-[10px] uppercase">Proprietary Schema Details</div>
              <div>Native IDs: <strong className="text-slate-800">{nativeIds}</strong></div>
              <div>Native DOB: <strong className="text-slate-800">{nativeDob}</strong></div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Transformed Domain Data</span>
              {recordData.data?.domainData && (
                <div className="text-[11px] space-y-0.5 font-medium">
                  {deptId === 'dept-pds' && (
                    <>
                      <div>Ration Card: <strong className="font-mono">{recordData.data.domainData.rationCardNo}</strong></div>
                      <div>Tier: <strong className="text-amber-700 bg-amber-50 px-1 rounded">{recordData.data.domainData.cardTier}</strong> ({recordData.data.domainData.monthlyQuotaKg}kg quota)</div>
                      <div>Status: <strong className="text-emerald-700">{recordData.data.domainData.applicationStatus}</strong></div>
                    </>
                  )}
                  {deptId === 'dept-land-records' && (
                    <>
                      <div>Property Ref: <strong className="font-mono">{recordData.data.domainData.propertyOwnerId}</strong></div>
                      <div>Land Area: <strong className="text-blue-800">{recordData.data.domainData.totalAreaHectares} Ha</strong> ({recordData.data.domainData.landClassification})</div>
                      <div>Encumbrance: <strong className="text-slate-700">{recordData.data.domainData.encumbranceStatus}</strong></div>
                    </>
                  )}
                  {deptId === 'dept-employment' && (
                    <>
                      <div>Applicant Ref: <strong className="font-mono">{recordData.data.domainData.applicantReference}</strong></div>
                      <div>Status: <strong className="text-indigo-800">{recordData.data.domainData.employmentStatus}</strong></div>
                      <div>Qualification: <span>{recordData.data.domainData.highestQualification}</span></div>
                    </>
                  )}
                  {deptId === 'dept-mahadbt' && (
                    <>
                      <div>Scheme: <span>{recordData.data.domainData.schemeTitle}</span></div>
                      <div>Disbursed: <strong className="text-emerald-700">Rs. {recordData.data.domainData.disbursedAmountInr?.toLocaleString('en-IN')}</strong></div>
                      <div>Status: <strong className="text-emerald-800">{recordData.data.domainData.grantStatus}</strong></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}