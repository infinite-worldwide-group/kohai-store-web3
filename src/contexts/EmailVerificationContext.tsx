"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useCurrentUserQuery } from "graphql/generated/graphql";
import dynamic from "next/dynamic";

const EmailVerificationModal = dynamic(() => import("@/components/Store/EmailVerification/EmailVerificationModal"), {
  ssr: false,
});

interface EmailVerificationContextType {
  showEmailModal: boolean;
  openEmailModal: () => void;
  closeEmailModal: () => void;
}

const EmailVerificationContext = createContext<EmailVerificationContextType | undefined>(undefined);

export function EmailVerificationProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useWallet();
  const { data: currentUserData, refetch: refetchUser, loading } = useCurrentUserQuery({
    skip: !isConnected,
    fetchPolicy: 'network-only', // Always fetch fresh data from server
    notifyOnNetworkStatusChange: true, // Notify when network status changes
  });
  const [mounted, setMounted] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  const [hasCheckedInitialConnection, setHasCheckedInitialConnection] = useState(false);
  const [autoReopenTimer, setAutoReopenTimer] = useState<NodeJS.Timeout | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refetch user data when wallet address changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('📧 Wallet address changed, refetching user data...');
      refetchUser();
    }
  }, [address, isConnected, refetchUser]);

  // Listen for email verification success event
  useEffect(() => {
    const handleEmailVerified = () => {
      console.log('🔄 Email verified event received - refreshing user data in EmailVerificationContext');
      refetchUser();
      // Reset modal state so it can be shown again if needed
      setHasShownModal(false);
      setHasCheckedInitialConnection(false);

      // Clear auto-reopen timer since email is verified
      if (autoReopenTimer) {
        console.log('✅ Email verified - canceling auto-reopen timer');
        clearTimeout(autoReopenTimer);
        setAutoReopenTimer(null);
      }
    };

    window.addEventListener('email-verified', handleEmailVerified);
    return () => window.removeEventListener('email-verified', handleEmailVerified);
  }, [refetchUser, autoReopenTimer]);

  // Check if user needs email verification after connecting wallet
  useEffect(() => {
    console.log('📧 EmailVerification Check:', {
      isConnected,
      loading,
      hasUser: !!currentUserData?.currentUser,
      email: currentUserData?.currentUser?.email,
      emailVerified: currentUserData?.currentUser?.emailVerified,
      hasShownModal,
      showEmailModal,
      hasCheckedInitialConnection
    });

    // Don't check if still loading user data
    if (loading) {
      console.log('📧 Still loading user data...');
      return;
    }

    // If not connected, mark as checked
    if (!isConnected) {
      if (!hasCheckedInitialConnection) {
        setHasCheckedInitialConnection(true);
      }
      return;
    }

    if (isConnected && currentUserData?.currentUser) {
      const user = currentUserData.currentUser;

      // Mark that we've checked the initial connection
      if (!hasCheckedInitialConnection) {
        console.log('📧 First check after connection/page load');
        setHasCheckedInitialConnection(true);
      }

      // Check if user doesn't have an email OR has email but not verified
      const needsEmailVerification = !user.email || !user.emailVerified;

      console.log('📧 Needs verification?', needsEmailVerification);

      // Show modal if needed
      if (needsEmailVerification && !showEmailModal) {
        console.log('📧 Showing email modal in 10 seconds...');
        // Wait 10 seconds before first popup
        const timer = setTimeout(() => {
          console.log('📧 Opening email modal NOW!');
          setShowEmailModal(true);
          setHasShownModal(true);
        }, 10000); // 10 seconds delay

        return () => clearTimeout(timer);
      }
    } else if (isConnected && !currentUserData?.currentUser && !loading) {
      // Connected but no user data - possible auth issue
      console.warn('⚠️ Wallet connected but no user data. Check authentication.');
    }
  }, [isConnected, currentUserData, loading, showEmailModal, hasCheckedInitialConnection]);

  // Reset hasShownModal when wallet disconnects or address changes
  useEffect(() => {
    if (!isConnected) {
      console.log('📧 Wallet disconnected - resetting modal state and clearing cache');
      setHasShownModal(false);
      setShowEmailModal(false);
      setHasCheckedInitialConnection(false);

      // Clear auto-reopen timer
      if (autoReopenTimer) {
        clearTimeout(autoReopenTimer);
        setAutoReopenTimer(null);
      }

      // Import and call clearApolloCache
      import('@/lib/apollo-client').then(({ clearApolloCache }) => {
        clearApolloCache();
      });
    }
  }, [isConnected, autoReopenTimer]);

  // Reset modal state when wallet address changes (account switch)
  useEffect(() => {
    return () => {
      // Cleanup when address changes
      console.log('📧 Wallet address changed - resetting session state');
      setHasShownModal(false);
      setHasCheckedInitialConnection(false);

      // Clear timer on address change
      if (autoReopenTimer) {
        clearTimeout(autoReopenTimer);
      }
    };
  }, [address, autoReopenTimer]);

  const openEmailModal = () => {
    setShowEmailModal(true);
    // Clear any existing timer when manually opening
    if (autoReopenTimer) {
      clearTimeout(autoReopenTimer);
      setAutoReopenTimer(null);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);

    // Check if user still needs email verification
    const user = currentUserData?.currentUser;
    const needsEmailVerification = !user?.email || !user?.emailVerified;

    // If still needed, set timer to reopen after 1 minute
    if (isConnected && needsEmailVerification) {
      console.log('📧 Modal closed - will reappear in 1 minute if not verified');
      const timer = setTimeout(() => {
        console.log('⏰ 1 minute passed - reopening email modal');
        setShowEmailModal(true);
      }, 60000); // 60 seconds = 1 minute

      setAutoReopenTimer(timer);
    }
  };

  const value: EmailVerificationContextType = {
    showEmailModal,
    openEmailModal,
    closeEmailModal,
  };

  return (
    <EmailVerificationContext.Provider value={value}>
      {children}

      {/* Debug Button - Only in development */}
      {mounted && process.env.NODE_ENV === 'development' && isConnected && (
        <button
          onClick={() => {
            console.log('🧪 Manual trigger - Opening email modal');
            console.log('Current user:', currentUserData?.currentUser);
            setShowEmailModal(true);
          }}
          className="fixed bottom-4 left-4 z-50 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-orange-600"
          title="Test Email Modal (Dev Only)"
        >
          📧 Test Email Modal
        </button>
      )}

      {/* Global Email Verification Modal */}
      {showEmailModal && isConnected && (
        <EmailVerificationModal
          currentEmail={currentUserData?.currentUser?.email}
          emailVerified={currentUserData?.currentUser?.emailVerified}
          onVerified={() => {
            refetchUser();
            closeEmailModal();
          }}
          onClose={closeEmailModal}
          mandatory={true} // Force users to complete email verification
        />
      )}
    </EmailVerificationContext.Provider>
  );
}

export function useEmailVerification() {
  const context = useContext(EmailVerificationContext);
  if (context === undefined) {
    throw new Error("useEmailVerification must be used within an EmailVerificationProvider");
  }
  return context;
}
