import React, { useState, useEffect } from 'react';
import { 
  Building2, UtensilsCrossed, Home, Sprout, Clock, CheckCircle2, 
  ArrowRight, Shield, Layers, FileText, RefreshCw 
} from 'lucide-react';
import { apiClient } from '../api/client.js';

const ICON_MAP = {
  UtensilsCrossed: UtensilsCrossed,
  Home: Home,
  Sprout: Sprout,
  Building2: Building2
};

export default function BundleCatalog({ bundles: propBundles, onSelectBundle }) {
  const [bundles, setBundles] = useState(propBundles || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propBundles && propBundles.length > 0) {
      setBundles(propBundles);
    } else {
      loadBundles();
    }
  }, [propBundles]);

  const loadBundles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getBundles();
      setBundles(res.bundles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="font-extrabold text-base text-slate-900">Life Event & Business Event Bundles</h3>
            <span className="text-[11px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
              Goal-Based Integration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick a real-world goal instead of navigating individual department portals. Ekikrit bundles all required licenses, deduplicates overlapping form fields, and auto-fills verified data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bundles.map((b) => {
          const IconComponent = ICON_MAP[b.icon] || Building2;
          return (
            <div
              key={b.bundle_id}
              className="gov-card p-6 bg-white hover:border-[#0F3460] hover:shadow-lg transition-all duration-200 flex flex-col justify-between group border-2 border-slate-200"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F3460] group-hover:bg-[#0F3460] group-hover:text-white transition-colors flex items-center justify-center shadow-sm border border-blue-100">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {b.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-[#0F3460] transition-colors leading-tight">
                    {b.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Participating Departments */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Participating Departments ({b.services.length} Services):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(b.services.map(s => s.department_name))).map((dept, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100"
                      >
                        {dept.split('(')[0].trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Included Services List */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Bundled Licenses & Clearances:
                  </span>
                  {b.services.map((svc) => (
                    <div key={svc.service_id} className="text-xs flex items-center space-x-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{svc.service_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Est: <strong>{b.estimated_days}</strong></span>
                </div>

                <button
                  onClick={() => onSelectBundle(b.bundle_id)}
                  className="px-4 py-2 bg-[#0F3460] group-hover:bg-[#0a2342] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Apply with Auto-Fill</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}