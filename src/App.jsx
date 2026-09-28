import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ArchitectureView from './components/ArchitectureView.jsx';
import CitizenPortal from './components/CitizenPortal.jsx';
import OfficialPortal from './components/OfficialPortal.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import LoginModal from './components/LoginModal.jsx';
import MobileAccessModal from './components/MobileAccessModal.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import { apiClient } from './api/client.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture' | 'citizen' | 'official' | 'admin'
  const [currentUser, setCurrentUser] = useState({
    name: 'Rajesh Tukaram Patil',
    role: 'citizen',
    unifiedId: 'EK-MH-849102',
    phone: '9822019482'
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [adaptersHealth, setAdaptersHealth] = useState([
    { departmentId: 'dept-pds', healthy: true },
    { departmentId: 'dept-land-records', healthy: true },
    { departmentId: 'dept-employment', healthy: true }
  ]);

  useEffect(() => {
    refreshAdaptersHealth();
  }, []);

  const refreshAdaptersHealth = async () => {
    try {
      const res = await apiClient.getAdapters();
      if (res.adapters) {
        setAdaptersHealth(res.adapters);
      }
    } catch (err) {
      console.error('Failed to fetch adapters health:', err);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'citizen') setActiveTab('citizen');
    else if (user.role === 'official') setActiveTab('official');
    else if (user.role === 'admin') setActiveTab('admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        adaptersHealth={adaptersHealth}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
        {activeTab === 'architecture' && (
          <ArchitectureView
            onSelectCitizenTab={() => setActiveTab('citizen')}
            onSelectOfficialTab={() => setActiveTab('official')}
            onSelectAdminTab={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'citizen' && (
          <CitizenPortal
            currentUser={currentUser}
            onSwitchPersona={() => setIsLoginOpen(true)}
          />
        )}

        {activeTab === 'official' && (
          <OfficialPortal
            currentUser={currentUser}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            onRefreshGlobalHealth={refreshAdaptersHealth}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Ekikrit (एकीकृत) — Zero-Replacement Government Digital Interoperability Fabric
          </p>
          <p>
            Developed for Smart India Hackathon 2026 | Problem Statement #SIH26129 | Government of Maharashtra
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            Built on Adapter/Connector Pattern • DEPA & DPDP Act Compliant • Powered by Google Gemini AI
          </p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation (Phone/Tablet) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
      />

      {/* Mobile Connection / QR Code Modal */}
      <MobileAccessModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* Login / Persona Selection Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}