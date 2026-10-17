import React from 'react';
import { Droplets, FileCheck, ShoppingBag, QrCode, User } from 'lucide-react';
import { getTranslation } from '../i18n/translations.js';

export function BottomNav({ activeTab, setActiveTab, lang }) {
  const tabs = [
    { id: 'plan', label: getTranslation(lang, 'tabPlan'), icon: Droplets },
    { id: 'passport', label: getTranslation(lang, 'tabPassport'), icon: FileCheck },
    { id: 'buyers', label: getTranslation(lang, 'tabBuyers'), icon: ShoppingBag },
    { id: 'card', label: getTranslation(lang, 'tabCard'), icon: QrCode },
    { id: 'profile', label: getTranslation(lang, 'tabProfile'), icon: User }
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-selected={isActive}
            role="tab"
          >
            <div className="nav-icon-wrap">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
