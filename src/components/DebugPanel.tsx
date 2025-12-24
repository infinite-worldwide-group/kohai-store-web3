"use client";

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useWallet();

  const checkReownData = () => {
    console.log('========================================');
    console.log('🔍 MANUAL DEBUG CHECK');
    console.log('========================================');
    console.log('✅ Wallet Context Data:', {
      isConnected,
      address,
    });

    if (typeof window !== 'undefined') {
      console.log('\n📦 All LocalStorage Keys:');
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          console.log(`  - ${key}`);
        }
      }

      console.log('\n🔍 Reown/AppKit Storage:');
      const reownKeys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('@w3m') || key.includes('reown') || key.includes('appkit'))) {
          reownKeys.push(key);
          const value = window.localStorage.getItem(key);
          try {
            const parsed = JSON.parse(value || '{}');
            console.log(`\n📄 ${key}:`, parsed);

            // Check for email
            if (parsed.email) {
              console.log(`   ✅ EMAIL FOUND: ${parsed.email}`);
            }
            if (parsed.user?.email) {
              console.log(`   ✅ EMAIL FOUND (user.email): ${parsed.user.email}`);
            }
            if (parsed.profile?.email) {
              console.log(`   ✅ EMAIL FOUND (profile.email): ${parsed.profile.email}`);
            }
          } catch {
            console.log(`\n📄 ${key}: ${value}`);
          }
        }
      }

      if (reownKeys.length === 0) {
        console.log('   ⚠️ No Reown/AppKit data found in localStorage');
      }

      console.log('\n🔍 JWT Token:', window.localStorage.getItem('jwtToken') ? 'EXISTS' : 'NOT FOUND');
      console.log('🔍 Pending Referral Code:', window.localStorage.getItem('pendingReferralCode') || 'NONE');
    }

    console.log('========================================\n');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[100] rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 transition"
        title="Open Debug Panel"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-80 rounded-lg bg-gray-900 border border-white/10 shadow-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">🔍 Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded bg-white/5 p-3">
          <p className="text-gray-400 text-xs mb-1">Connection Status</p>
          <p className={`font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </p>
        </div>

        {address && (
          <div className="rounded bg-white/5 p-3">
            <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
            <p className="font-mono text-white text-xs break-all">
              {address}
            </p>
          </div>
        )}

        <button
          onClick={checkReownData}
          className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 font-semibold transition"
        >
          🔍 Check Reown Data
        </button>

        <div className="rounded bg-yellow-500/10 border border-yellow-500/30 p-3">
          <p className="text-yellow-300 text-xs">
            💡 Click the button above, then check your browser console (F12)
          </p>
        </div>
      </div>
    </div>
  );
}
