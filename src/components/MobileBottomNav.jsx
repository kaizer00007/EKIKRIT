import React from 'react';
import { Layers, UserCheck, Shield, Settings, Smartphone } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenMobileModal }) {
  const navItems = [
    { id: 'architecture', label: 'Engine', icon: Layers },
    { id: 'citizen', label: 'Citizen', icon: UserCheck },
    { id: 'official', label: 'Official', icon: Shield },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-[#0F3460] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-[#0F3460]' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenMobileModal}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-amber-600 font-medium"
      >
        <div className="p-1 rounded-lg bg-amber-50">
          <Smartphone className="w-5 h-5 text-amber-600" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-bold">QR Sync</span>
      </button>
    </div>
  );
}
