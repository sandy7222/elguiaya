/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { trackVisit } from './utils/trackVisit';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { InteractiveMap } from './components/InteractiveMap';
import { FishermanDashboard } from './components/FishermanDashboard';
import { CaptainDashboard } from './components/CaptainDashboard';
import { SecurityAndTrust } from './components/SecurityAndTrust';
import { AdminPanel } from './components/AdminPanel';
import { BusinessModel } from './components/BusinessModel';
import { ProjectPhases } from './components/ProjectPhases';
import { EarlyRegistration } from './components/EarlyRegistration';
import { Footer } from './components/Footer';
import { SmartFishingAssistant } from './components/SmartFishingAssistant';
import { WhatsAppButton } from './components/WhatsAppButton';

export default function App() {
  const [selectedRoleForRegistration, setSelectedRoleForRegistration] = useState<'pescador' | 'capitan'>('pescador');

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePreRegister = (role: 'pescador' | 'capitan') => {
    setSelectedRoleForRegistration(role);
    handleScrollTo('early-registration-section');
  };

  const handleExploreMap = () => {
    handleScrollTo('interactive-map');
  };

  useEffect(() => {
    trackVisit('/');
  }, []);

  return (
    <div className="min-h-screen bg-[#0b2243] text-white font-sans overflow-x-hidden antialiased" id="app-root-container">
      
      {/* 🧭 Main Header Navbar Navigation */}
      <Navbar onScrollTo={handleScrollTo} onPreRegister={handlePreRegister} />

      {/* 🌊 Hero Intro with slowly flowing wave animations */}
      <Hero onPreRegister={handlePreRegister} onExploreMap={handleExploreMap} />

      {/* 🚀 Parallel visual walkthroughs for stakeholders */}
      <HowItWorks />

      {/* 🗺️ Interactive path tracking and distance measuring widget */}
      <InteractiveMap />

      {/* 🎣 Specific visual cockpit spaces for each target user side */}
      <FishermanDashboard />
      <CaptainDashboard />

      {/* 🛡️ Strict maritime safety protocol banners (Prefectura status) */}
      <SecurityAndTrust />

      {/* 📊 Backoffice administration systems logs & commission ledger */}
      <AdminPanel />

      {/* 💳 Mercado Pago escrow workflow visualization blocks */}
      <BusinessModel />

      {/* 🧭 Strategic national roadmap project timeline */}
      <ProjectPhases />

      {/* 🎣 Lead capture register portal for pioneer rewards list */}
      <EarlyRegistration initialRole={selectedRoleForRegistration} />

      {/* ⚓ Slogan credits and emergency maritime hotlines footer */}
      <Footer onScrollTo={handleScrollTo} />

      {/* 🤖 Floating Satellite grounded AI chatbot (Capi) */}
      <SmartFishingAssistant />

      {/* 💬 Floating WhatsApp Business contact button */}
      <WhatsAppButton />

    </div>
  );
}
