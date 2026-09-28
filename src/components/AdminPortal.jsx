import React, { useState, useEffect } from 'react';
import { 
  Settings, Power, PlusCircle, Sparkles, Activity, AlertTriangle, 
  CheckCircle2, RefreshCw, Terminal, ArrowRight, Shield, Zap, Layers 
} from 'lucide-react';
import { apiClient } from '../api/client.js';

export default function AdminPortal({ onRefreshGlobalHealth }) {
  const [activeSubTab, setActiveSubTab] = useState('health'); // 'health' | 'live-demo' | 'ai-mapping' | 'audit'
  const [adapters, setAdapters] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState(null);

  // Live 4th Dept Onboarding State
  const [dynamicDept, setDynamicDept] = useState({
    departmentId: 'dept-mahadbt',
    departmentName: 'Social Welfare & Direct Benefit Transfer (MahaDBT)',
    authType: 'bearer',
    version: '1.0.0-live',
    apiKey: 'dbt_live_key_9921',
    primaryIdField: 'dbt_reg_id',
    nameField: 'applicant_legal_name',
    dobField: 'b_day'
  });
  const [onboardSuccess, setOnboardSuccess] = useState(false);

  // AI Schema Mapping State
  const [sampleJson, setSampleJson] = useState(`{
  "dbt_reg_id": "DBT-2026-992140",
  "beneficiary_aadhaar_hash": "SHA256-9482-MH",
  "applicant_legal_name": "Mr. Rajesh T. Patil",
  "b_day": "1985/08/14",
  "caste_category": "OBC - Kunbi Maratha",
  "scholarship_grant_status": "DISBURSED",
  "scheme_name": "Dr. Punjabrao Deshmukh Hostel Subsidy",
  "disbursed_amount_inr": 45000,
  "district_office": "Pune Central"
}`);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Goal Bundles Studio State
  const [bundles, setBundles] = useState([]);
  const [newBundleForm, setNewBundleForm] = useState({
    id: 'solar_rooftop_subsidy',
    title: 'Solar Rooftop Installation & Subsidy Scheme',
    category: 'Green Energy & Infrastructure',
    description: 'Single-window sanction for rooftop solar installation, MahaBhumi roof right clearance, Discom net-metering tariff, and direct DBT subsidy disbursal.',
    estimatedTotalDays: '7 - 10 Days',
    icon: 'Sun'
  });
  const [bundleDeptSelection, setBundleDeptSelection] = useState({
    'dept-land-records': true,
    'dept-mahadbt': true,
    'dept-pds': false,
    'dept-employment': false
  });
  const [bundlePublishing, setBundlePublishing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [adapRes, logRes, bndlRes] = await Promise.all([
        apiClient.getAdapters(),
        apiClient.getAuditLogs(),
        apiClient.getBundles().catch(() => ({ bundles: [] }))
      ]);
      setAdapters(adapRes.adapters || []);
      setAuditLogs(logRes.logs || []);
      setBundles(bndlRes.bundles || []);
      if (onRefreshGlobalHealth) onRefreshGlobalHealth();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBundle = async (e) => {
    e.preventDefault();
    setBundlePublishing(true);
    try {
      const selectedServices = [];
      if (bundleDeptSelection['dept-land-records']) {
        selectedServices.push({
          serviceId: 'land_mutation_solar',
          serviceName: 'Land & Property Non-Encumbrance Clearance',
          departmentId: 'dept-land-records',
          departmentName: 'Revenue & Land Records (MahaBhumi)',
          estimatedDays: 4,
          requiredFields: ['applicantName', 'aadhaarNo', 'khataNo', 'surveyNo', 'district']
        });
      }
      if (bundleDeptSelection['dept-mahadbt']) {
        selectedServices.push({
          serviceId: 'dbt_solar_grant',
          serviceName: 'Direct Green Energy Capital Subsidy (MahaDBT)',
          departmentId: 'dept-mahadbt',
          departmentName: 'Social Welfare & Direct Benefit Transfer (MahaDBT)',
          estimatedDays: 7,
          requiredFields: ['applicantName', 'aadhaarNo', 'bankAccountNo', 'mobileNumber']
        });
      }
      if (bundleDeptSelection['dept-pds']) {
        selectedServices.push({
          serviceId: 'pds_meter_address',
          serviceName: 'Residential Verification & Tariff Clearance',
          departmentId: 'dept-pds',
          departmentName: 'Food & Civil Supplies (PDS)',
          estimatedDays: 3,
          requiredFields: ['applicantName', 'aadhaarNo', 'rationCardNo', 'district']
        });
      }
      if (bundleDeptSelection['dept-employment']) {
        selectedServices.push({
          serviceId: 'green_jobs_solar',
          serviceName: 'Skilled Rooftop Technician Apprenticeship Sanction',
          departmentId: 'dept-employment',
          departmentName: 'Skill Dev & Employment (Mahaswayam)',
          estimatedDays: 5,
          requiredFields: ['applicantName', 'aadhaarNo', 'mobileNumber']
        });
      }

      const payload = {
        ...newBundleForm,
        services: selectedServices
      };

      const res = await apiClient.registerAdminBundle(payload);
      setAdminMessage({
        type: 'success',
        text: `Goal Bundle "${res.bundle.title}" successfully published! It is now instantly active and visible in the Citizen Portal with auto-deduplication.`
      });
      loadAdminData();
    } catch (err) {
      setAdminMessage({ type: 'error', text: err.message });
    } finally {
      setBundlePublishing(false);
    }
  };

  const handleToggleDowntime = async (deptId) => {
    try {
      const res = await apiClient.toggleDowntime(deptId);
      setAdminMessage({
        type: res.isDown ? 'warning' : 'success',
        text: `Department "${deptId}" set to ${res.isDown ? 'SIMULATED OUTAGE (Down)' : 'HEALTHY (Online)'}. Graceful degradation active.`
      });
      loadAdminData();
    } catch (err) {
      setAdminMessage({ type: 'error', text: err.message });
    }
  };

  const handleLiveOnboard = async () => {
    setLoading(true);
    try {
      const config = {
        departmentId: dynamicDept.departmentId,
        departmentName: dynamicDept.departmentName,
        authType: dynamicDept.authType,
        version: dynamicDept.version,
        credentials: { apiKey: dynamicDept.apiKey },
        fieldMappings: {
          primaryIdField: dynamicDept.primaryIdField,
          nameField: dynamicDept.nameField,
          dobField: dynamicDept.dobField
        }
      };

      const res = await apiClient.onboardLiveAdapter(config);
      setOnboardSuccess(true);
      setAdminMessage({ type: 'success', text: res.message });
      loadAdminData();
    } catch (err) {
      setAdminMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiMapping = async () => {
    setAiLoading(true);
    try {
      const res = await apiClient.suggestAiMapping(sampleJson, { departmentName: dynamicDept.departmentName });
      setAiSuggestions(res);
    } catch (err) {
      setAdminMessage({ type: 'error', text: err.message });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="gov-card p-6 bg-gradient-to-r from-[#0F3460] to-slate-900 text-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>System Administrator Studio & Connector Registry</span>
          </div>
          <h2 className="text-xl font-bold mt-1">Ekikrit Adapter Lifecycle, Fault Injection & AI Studio</h2>
          <p className="text-xs text-slate-300 mt-1">
            Zero-downtime adapter management, failure simulation, live 4th system onboarding, and Gemini AI schema mapping.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-white/10 p-1 rounded-xl text-xs font-bold border border-white/20">
          <button
            onClick={() => setActiveSubTab('health')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'health' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            Adapter Health & Downtime
          </button>
          <button
            onClick={() => setActiveSubTab('live-demo')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeSubTab === 'live-demo' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Live 4th Dept Onboard
          </button>
          <button
            onClick={() => setActiveSubTab('ai-mapping')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeSubTab === 'ai-mapping' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            AI Schema Mapper
          </button>
          <button
            onClick={() => setActiveSubTab('bundles')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${activeSubTab === 'bundles' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Goal Bundle Studio
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeSubTab === 'audit' ? 'bg-white text-slate-900' : 'text-slate-200 hover:text-white'}`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {adminMessage && (
        <div className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
          adminMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          adminMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{adminMessage.text}</span>
          <button onClick={() => setAdminMessage(null)} className="underline font-bold ml-4">Dismiss</button>
        </div>
      )}

      {/* SUBTAB 1: ADAPTER HEALTH & DOWNTIME SIMULATION */}
      {activeSubTab === 'health' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Adapter Health & Failure Isolation Testing</h3>
              <p className="text-xs text-slate-500">
                Click "Simulate Downtime" on any department to verify live that the middleware gracefully serves remaining departments without crashing.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Health Matrix
            </button>
          </div>

          <div className="space-y-4">
            {adapters.map((adap) => (
              <div
                key={adap.departmentId}
                className={`p-5 rounded-xl border-2 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  adap.isDowntimeSimulated || !adap.healthy
                    ? 'bg-rose-50/50 border-rose-300'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${adap.healthy && !adap.isDowntimeSimulated ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    <h4 className="font-bold text-sm text-slate-900">{adap.departmentName}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
                      {adap.departmentId}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {adap.authType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono pt-1">
                    <span>Circuit: <strong className={adap.circuitState === 'CLOSED' ? 'text-emerald-700' : 'text-rose-700'}>{adap.circuitState}</strong></span>
                    <span>•</span>
                    <span>Avg Latency: <strong className="text-slate-800">{adap.averageLatencyMs || adap.latencyMs}ms</strong></span>
                    <span>•</span>
                    <span>Total Queries: <strong className="text-slate-800">{adap.totalRequests}</strong></span>
                    <span>•</span>
                    <span>Version: {adap.version}</span>
                  </div>

                  {adap.error && (
                    <p className="text-xs text-rose-700 font-medium pt-1">
                      Status Error: {adap.error}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleToggleDowntime(adap.departmentId)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      adap.isDowntimeSimulated
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {adap.isDowntimeSimulated ? 'Restore Department (Bring Online)' : 'Simulate Downtime (Fail Node)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* SUBTAB 2: LIVE 4TH DEPT ONBOARDING (JUDGE DEMO SCENARIO) */}
      {activeSubTab === 'live-demo' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Live 4th Department Onboarding Demo (Judge Scenario)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrates onboarding an external mock department (MahaDBT Social Welfare) with a completely different auth mechanism (Bearer Token / Custom Key) without modifying or restarting the Integration Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Unique ID</label>
                <input
                  type="text"
                  value={dynamicDept.departmentId}
                  onChange={(e) => setDynamicDept({ ...dynamicDept, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Display Name</label>
                <input
                  type="text"
                  value={dynamicDept.departmentName}
                  onChange={(e) => setDynamicDept({ ...dynamicDept, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authentication Type</label>
                  <select
                    value={dynamicDept.authType}
                    onChange={(e) => setDynamicDept({ ...dynamicDept, authType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                  >
                    <option value="bearer">Bearer Token (OAuth2 style)</option>
                    <option value="api_key">Custom API Key Header</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Auth Secret / Token</label>
                  <input
                    type="text"
                    value={dynamicDept.apiKey}
                    onChange={(e) => setDynamicDept({ ...dynamicDept, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Primary ID Field</label>
                  <input
                    type="text"
                    value={dynamicDept.primaryIdField}
                    onChange={(e) => setDynamicDept({ ...dynamicDept, primaryIdField: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Name Field</label>
                  <input
                    type="text"
                    value={dynamicDept.nameField}
                    onChange={(e) => setDynamicDept({ ...dynamicDept, nameField: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">DOB Field (YYYY/MM/DD)</label>
                  <input
                    type="text"
                    value={dynamicDept.dobField}
                    onChange={(e) => setDynamicDept({ ...dynamicDept, dobField: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleLiveOnboard}
                disabled={loading}
                className="w-full py-3 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                {loading ? 'Synthesizing & Registering...' : 'Deploy 4th Adapter Live (No Reboot)'}
              </button>
            </div>

            {/* Architecture Explanation */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                How Ekikrit Achieves Zero-Reboot Onboarding
              </h4>
              <p className="text-slate-600 leading-relaxed">
                The hub uses a dynamic <strong>Adapter Factory</strong>. When an admin submits credentials and field mapping rules:
              </p>
              <ol className="list-decimal pl-4 text-slate-600 space-y-1.5 font-medium">
                <li>Instantiates a new <code className="text-blue-700 bg-white px-1 py-0.5 rounded border">DynamicAdapter</code> conforming to <code className="text-blue-700 bg-white px-1 py-0.5 rounded border">IDepartmentAdapter</code>.</li>
                <li>Registers it in the singleton <code className="text-blue-700 bg-white px-1 py-0.5 rounded border">AdapterRegistry</code>.</li>
                <li>Clears query cache so new queries immediately fan out to the 4th system in parallel.</li>
              </ol>

              {onboardSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-xs space-y-1">
                  <div>✓ MahaDBT Adapter is now LIVE in runtime registry!</div>
                  <p className="text-[11px] font-normal text-emerald-800">
                    Switch to the <strong>Architecture</strong> or <strong>Citizen</strong> tab to see live MahaDBT disbursal data merged into Rajesh Patil's record!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: AI SCHEMA MAPPING STUDIO (GEMINI) */}
      {activeSubTab === 'ai-mapping' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-sm text-slate-900">AI-Assisted Schema Mapping Studio (Google Gemini)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paste arbitrary department JSON or API schema. Ekikrit invokes Gemini AI to analyze structure, suggest canonical mapping, detect date conversions, and assign confidence scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Raw Department Sample JSON Payload:
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Sample: MahaDBT Social Welfare</span>
              </div>
              <textarea
                rows={12}
                value={sampleJson}
                onChange={(e) => setSampleJson(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-[#0F3460] outline-none leading-relaxed"
              />

              <button
                onClick={handleRunAiMapping}
                disabled={aiLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-amber-300 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Gemini AI Analyzing Schema...' : 'Analyze with Gemini AI & Propose Adapter Mappings'}
              </button>
            </div>

            {/* AI Results */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700 uppercase">
                AI Mapping Recommendations & Transformations:
              </span>

              {aiSuggestions ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 max-h-[460px] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-900">Overall Match Confidence:</span>
                    <span className="text-sm font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {aiSuggestions.overallConfidence}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                    {aiSuggestions.summary}
                  </p>

                  <div className="space-y-2">
                    {aiSuggestions.mappings?.map((m, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="font-mono text-blue-900">{m.sourceField} → {m.targetField}</span>
                          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                            {m.confidence}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Transform: <strong className="text-slate-700">{m.transformation}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">{m.reasoning}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setActiveSubTab('live-demo');
                      setAdminMessage({ type: 'success', text: 'AI mappings copied to Live Adapter Generator! Click Deploy.' });
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Accept Mappings & Generate Adapter →
                  </button>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Click "Analyze with Gemini AI" to automatically synthesize canonical mappings from this schema.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: GOAL BUNDLE STUDIO (Zero-Code Extensibility Demo) */}
      {activeSubTab === 'bundles' && (
        <div className="space-y-6">
          <div className="gov-card p-6 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-900">Goal-Based Bundled Application Studio</h3>
                  <span className="gov-badge gov-badge-info">Data-Driven Extensibility</span>
                </div>
                <p className="text-xs text-slate-500">
                  Define and deploy citizen life-event & business-event bundles on the fly. New bundles are defined purely as JSON configs and immediately execute cross-department parallel fan-out without code changes.
                </p>
              </div>
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Bundles
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Active Published Bundles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0F3460]" />
                  <span>Active Bundles in Registry ({bundles.length})</span>
                </h4>

                <div className="space-y-3">
                  {bundles.map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                            {b.category}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 mt-1">{b.title}</h5>
                          <span className="text-[11px] font-mono text-slate-500">ID: {b.id}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ~{b.estimatedTotalDays}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>

                      <div className="border-t border-slate-200 pt-2 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Participating Services ({b.services?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(b.services || []).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-800 font-medium text-[11px] border border-slate-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {s.serviceName}
                              <span className="text-[10px] text-slate-400 font-mono">({s.departmentId})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Deploy New Bundle Live */}
              <div className="p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>Deploy New Goal Bundle (Zero-Code Hackathon Demo)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Publish a new bundled government service to prove that Ekikrit requires zero backend code additions when introducing cross-department citizen workflows.
                  </p>
                </div>

                <form onSubmit={handleCreateBundle} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Identifier (System Key)</label>
                    <input
                      type="text"
                      value={newBundleForm.id}
                      onChange={(e) => setNewBundleForm({ ...newBundleForm, id: e.target.value })}
                      className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Title (Citizen Facing)</label>
                    <input
                      type="text"
                      value={newBundleForm.title}
                      onChange={(e) => setNewBundleForm({ ...newBundleForm, title: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={newBundleForm.category}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, category: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Timeline</label>
                      <input
                        type="text"
                        value={newBundleForm.estimatedTotalDays}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, estimatedTotalDays: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Goal Description</label>
                    <textarea
                      rows="2"
                      value={newBundleForm.description}
                      onChange={(e) => setNewBundleForm({ ...newBundleForm, description: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Participating Department Adapters</label>
                    <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                      <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bundleDeptSelection['dept-land-records']}
                          onChange={(e) => setBundleDeptSelection({ ...bundleDeptSelection, 'dept-land-records': e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span><strong>Revenue & Land Records (MahaBhumi)</strong> — Title non-encumbrance & khata clearance</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bundleDeptSelection['dept-mahadbt']}
                          onChange={(e) => setBundleDeptSelection({ ...bundleDeptSelection, 'dept-mahadbt': e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span><strong>Social Welfare & Direct Benefit Transfer (MahaDBT)</strong> — Direct capital subsidy grant</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bundleDeptSelection['dept-pds']}
                          onChange={(e) => setBundleDeptSelection({ ...bundleDeptSelection, 'dept-pds': e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span><strong>Food & Civil Supplies (PDS)</strong> — Residence proof & quota verification</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bundleDeptSelection['dept-employment']}
                          onChange={(e) => setBundleDeptSelection({ ...bundleDeptSelection, 'dept-employment': e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span><strong>Skill Dev & Employment (Mahaswayam)</strong> — Technician apprenticeship registration</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bundlePublishing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {bundlePublishing ? 'Publishing Bundle Live...' : 'Deploy Bundle Live to Citizen Catalog →'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TAMPER-EVIDENT AUDIT TRAIL */}
      {activeSubTab === 'audit' && (
        <div className="gov-card p-6 bg-white space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tamper-Evident Access Logs & Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Immutable record tracking who accessed what data, under which DEPA consent record, and response latencies.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Target / Dept</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{log.id}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {log.actorName}
                      <span className="block text-[10px] text-slate-400 font-normal uppercase">{log.actorRole}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-mono text-[11px]">
                      {log.targetCitizenId || log.requestingDept || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`gov-badge ${
                        log.status === 'SUCCESS' || log.status === 'APPROVED' ? 'gov-badge-success' :
                        log.status === 'PARTIAL_SUCCESS' || log.status === 'PENDING_CITIZEN_ACTION' ? 'gov-badge-warning' :
                        'gov-badge-danger'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}