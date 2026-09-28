import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, Shield, ArrowRight, ArrowLeft, Send, 
  Clock, AlertCircle, FileText, Building2, Check, Lock, Sparkles, RefreshCw 
} from 'lucide-react';
import { apiClient } from '../api/client.js';

export default function BundleApplicationModal({ isOpen, onClose, bundleId, bundle: propBundle, unifiedId, onSubmissionSuccess, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Services, 2: Form, 3: Consent, 4: Result
  const [loading, setLoading] = useState(false);
  const [schemaData, setSchemaData] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [formData, setFormData] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const targetBundleId = bundleId || propBundle?.bundle_id || propBundle?.id || (typeof propBundle === 'string' ? propBundle : null);
  const handleSuccessCallback = onSubmissionSuccess || onSuccess;

  useEffect(() => {
    if (isOpen && targetBundleId) {
      loadBundleSchema(targetBundleId);
    }
  }, [isOpen, targetBundleId, unifiedId]);

  const loadBundleSchema = async (id) => {
    setLoading(true);
    setErrorMessage(null);
    setStep(1);
    try {
      const res = await apiClient.getBundleSchema(id, unifiedId);
      setSchemaData(res);
      // Select all services by default
      const allSvcIds = (res.bundle?.services || []).map(s => s.service_id);
      setSelectedServices(allSvcIds);

      // Pre-fill form data from consolidated fields
      const initialForm = {};
      (res.consolidatedFields || []).forEach(f => {
        initialForm[f.key] = f.value || '';
      });
      setFormData(initialForm);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleService = (serviceId, mandatory) => {
    if (mandatory) return; // Cannot deselect mandatory core service
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.submitBundle(targetBundleId, {
        unifiedId,
        submissionData: formData,
        selectedServiceIds: selectedServices,
        consentContext: {
          timestamp: new Date().toISOString(),
          authorizedDepartments: schemaData.consentMatrix
            .filter(c => selectedServices.includes(c.serviceId))
            .map(c => c.departmentId)
        }
      });
      setSubmissionResult(res.application || res);
      setStep(4);
      if (handleSuccessCallback) handleSuccessCallback(res.application || res);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bundle = schemaData?.bundle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F3460] text-white p-4 sm:p-5 flex justify-between items-center relative shrink-0">
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-amber-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consolidated Application Wizard</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg mt-0.5 leading-snug">{bundle?.title || 'Loading Bundle...'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex justify-between items-center text-xs font-bold text-slate-600 shrink-0">
          <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 1 ? 'text-[#0F3460]' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#0F3460] text-white' : 'bg-slate-300'}`}>1</span>
            <span className="hidden sm:inline">Services & Docs</span>
            <span className="sm:hidden text-[11px]">Services</span>
          </div>
          <div className="w-4 sm:w-8 h-0.5 bg-slate-300"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 2 ? 'text-[#0F3460]' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#0F3460] text-white' : 'bg-slate-300'}`}>2</span>
            <span className="hidden sm:inline">Consolidated Form</span>
            <span className="sm:hidden text-[11px]">Form</span>
          </div>
          <div className="w-4 sm:w-8 h-0.5 bg-slate-300"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 3 ? 'text-[#0F3460]' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#0F3460] text-white' : 'bg-slate-300'}`}>3</span>
            <span className="hidden sm:inline">DEPA Consent</span>
            <span className="sm:hidden text-[11px]">Consent</span>
          </div>
          <div className="w-4 sm:w-8 h-0.5 bg-slate-300"></div>
          <div className={`flex items-center space-x-1 sm:space-x-2 ${step >= 4 ? 'text-emerald-700' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-300'}`}>4</span>
            <span className="hidden sm:inline">Fan-Out Status</span>
            <span className="sm:hidden text-[11px]">Status</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SERVICE SELECTION & DOCUMENTS CHECKLIST */}
          {step === 1 && schemaData && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Select Bundled Services to Include</h4>
                <p className="text-xs text-slate-500 mt-1">
                  You can uncheck optional services if you only require specific clearances. Mandatory services are pre-locked.
                </p>
              </div>

              <div className="space-y-3">
                {bundle.services.map((svc) => {
                  const isChecked = selectedServices.includes(svc.service_id);
                  return (
                    <div
                      key={svc.service_id}
                      onClick={() => toggleService(svc.service_id, svc.mandatory)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked ? 'bg-blue-50/40 border-[#0F3460]' : 'bg-white border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 text-[#0F3460] rounded border-slate-300 focus:ring-[#0F3460]"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-bold text-xs text-slate-900">{svc.service_name}</h5>
                            {svc.mandatory ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                Mandatory
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                Optional
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Department: <strong className="text-slate-700">{svc.department_name}</strong>
                          </span>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Required Docs: {svc.required_documents.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">
                        {svc.estimated_time}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Verified Documents Sidebar/Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Prerequisite Documents (Auto-Linked via DigiLocker)
                </span>
                <p className="text-[11px] text-slate-500">
                  Ekikrit has matched and pre-attached verified digital copies from your connected identity locker:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {schemaData.documentsChecklist.map((doc, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <span className="truncate pr-2 font-medium text-slate-800">{doc.documentName}</span>
                      <span className="gov-badge gov-badge-success text-[10px] shrink-0">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* STEP 2: CONSOLIDATED UNIFIED FORM (DEDUPLICATED) */}
          {step === 2 && schemaData && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Consolidated Application Form</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Overlapping fields have been merged into one question. Verified citizen data is pre-populated from your connected department records.
                </p>
              </div>

              <div className="space-y-4">
                {schemaData.consolidatedFields.map((f) => (
                  <div key={f.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                      <label className="text-xs font-bold text-slate-800">
                        {f.label} {f.required && <span className="text-rose-500">*</span>}
                      </label>
                      {f.autoFilled && f.autoFillBadge && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {f.autoFillBadge}
                        </span>
                      )}
                    </div>

                    {f.type === 'select' ? (
                      <select
                        value={formData[f.key] || ''}
                        onChange={(e) => handleInputChange(f.key, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm sm:text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0F3460]"
                      >
                        {(f.options || []).map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type || 'text'}
                        value={formData[f.key] || ''}
                        onChange={(e) => handleInputChange(f.key, e.target.value)}
                        placeholder={`Enter ${f.label}`}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm sm:text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#0F3460]"
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SINGLE CONSENT, MULTIPLE DEPARTMENTS */}
          {step === 3 && schemaData && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Department DEPA Consent Authorization</h4>
                <p className="text-xs text-slate-500 mt-1">
                  In compliance with DPDP Act 2023, each department receives only the exact fields required for its statutory clearance. Confirm routing before submission.
                </p>
              </div>

              <div className="space-y-4">
                {schemaData.consentMatrix
                  .filter(c => selectedServices.includes(c.serviceId))
                  .map((c) => (
                    <div key={c.serviceId} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Target Department:
                          </span>
                          <h5 className="font-bold text-xs text-slate-900">{c.departmentName}</h5>
                          <span className="text-[11px] text-[#0F3460] font-semibold">{c.serviceName}</span>
                        </div>
                        <span className="gov-badge gov-badge-info text-[10px]">DEPA Scoped</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <span className="text-slate-500 font-bold block text-[11px]">Fields To Be Routed:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {c.dataFieldsRouted.map((df, dfIdx) => (
                            <span key={dfIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                              {df}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 italic pt-1">{c.purpose}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center space-x-2 font-bold">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Single Consent Authorization</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  By clicking "Authorize Multi-Department Submission", you grant explicit consent for Ekikrit to fan out your verified data only to the departments listed above.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: ORCHESTRATED FAN-OUT RESULTS */}
          {step === 4 && submissionResult && (
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">Application Fan-Out Successful!</h4>
                <p className="text-xs text-slate-500">
                  Ekikrit middleware has dispatched your single consolidated submission across all relevant departments in parallel.
                </p>
                <span className="inline-block mt-2 font-mono font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-300">
                  Master Bundle Ref: {submissionResult.bundleAppId}
                </span>
              </div>

              {/* Sub-Applications Dispatch Status */}
              <div className="space-y-3 text-left pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Downstream Fan-Out Dispatch Status:
                </span>
                {submissionResult.subApplications.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex justify-between items-center text-xs ${
                      sub.status === 'SUBMITTED' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{sub.serviceName}</span>
                      <span className="text-slate-500 text-[11px]">{sub.departmentName}</span>
                      <span className="font-mono text-slate-400 text-[10px] block mt-0.5">Ref: {sub.applicationId}</span>
                    </div>
                    <div>
                      <span className={`gov-badge ${sub.status === 'SUBMITTED' ? 'gov-badge-success' : 'gov-badge-warning'}`}>
                        {sub.status === 'SUBMITTED' ? 'Submitted Live' : 'Queued (Offline Resilience)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : <div></div>}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue to Consolidated Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Review DEPA Consent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Orchestrating Fan-Out...' : 'Authorize Multi-Department Submission'}
            </button>
          )}

          {step === 4 && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0F3460] hover:bg-[#0a2342] text-white rounded-lg text-xs font-bold shadow-md"
            >
              View in Unified Tracker →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}