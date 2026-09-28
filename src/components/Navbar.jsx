import React from 'react';
import { Shield, Layers, UserCheck, Settings, AlertCircle, CheckCircle2, LogOut, ChevronDown, Smartphone } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenLogin, adaptersHealth, onQuickSwitchPersona, onOpenMobileModal }) {
  const healthyCount = adaptersHealth.filter(a => a.healthy).length;
  const totalCount = adaptersHealth.length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Gov Ribbon */}
      <div className="bg-[#0A192F] text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-amber-400">महाराष्ट्र शासन</span>
          <span className="text-slate-500">|</span>
          <span>Government of Maharashtra</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">Smart India Hackathon 2026 — PS #SIH26129</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero-Replacement Middleware Active
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('architecture')}>
            <div className="w-10 h-10 rounded-lg bg-[#0F3460] flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-amber-400/80">
              ए
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#0F3460]">Ekikrit</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">एकीकृत</span>
                <span className="text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">v2.1</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">Government Interoperability & Federated Data Fabric</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-[#0F3460] text-white shadow-sm'
                  : 'text-slate-640 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              Architecture & Live Engine
            </button>

            <button
              onClick={() => setActiveTab('citizen')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'citizen'
                  ? 'bg-[#0F3460] text-white shadow-sm'
                  : 'text-slate-640 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-sky-400" />
              Citizen Portal
            </button>

            <button
              onClick={() => setActiveTab('official')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'official'
                  ? 'bg-[#0F3460] text-white shadow-sm'
                  : 'text-slate-640 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Official 360° Portal
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[#0F3460] text-white shadow-sm'
                  : 'text-slate-640 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 text-rose-400" />
              Admin & Adapter Studio
            </button>
          </nav>

          {/* Right Status Pill & Persona Switcher */}
          <div className="flex items-center space-x-3">
            {/* Adapter Health Pill */}
            <div 
              onClick={() => setActiveTab('admin')} 
              className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                healthyCount === totalCount
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="Click to view adapter health in Admin Studio"
            >
              {healthyCount === totalCount ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className="font-mono">{healthyCount}/{totalCount}</span>
              <span className="hidden lg:inline">Adapters Active</span>
            </div>

            {/* Mobile / Phone Access Modal Trigger */}
            <button
              onClick={onOpenMobileModal}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-sm flex items-center gap-1.5 transition-all"
              title="Connect Phone via QR Code or LAN URL"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Phone Access</span>
            </button>

            {/* User Persona Profile */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F3460] text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-blue-100 text-blue-800">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="bg-[#0F3460] hover:bg-[#0a2342] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Sign In (Demo SSO)
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto space-x-2 py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activeTab === 'architecture' ? 'bg-[#0F3460] text-white' : 'text-slate-600'}`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('citizen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activeTab === 'citizen' ? 'bg-[#0F3460] text-white' : 'text-slate-600'}`}
          >
            Citizen Portal
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activeTab === 'official' ? 'bg-[#0F3460] text-white' : 'text-slate-600'}`}
          >
            Official 360°
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${activeTab === 'admin' ? 'bg-[#0F3460] text-white' : 'text-slate-600'}`}
          >
            Admin Studio
          </button>
        </div>
      </div>
    </header>
  );
}