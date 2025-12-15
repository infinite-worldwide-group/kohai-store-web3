import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApplyReferralCodeMutation } from 'graphql/generated/graphql';

const REFERRAL_CODE_KEY = 'pendingReferralCode';

export function useReferralCode() {
  const searchParams = useSearchParams();
  const [applyReferralCode] = useApplyReferralCodeMutation();
  const [isApplying, setIsApplying] = useState(false);

  // Capture referral code from URL on mount
  useEffect(() => {
    const refCode = searchParams?.get('ref');

    if (refCode) {
      console.log('📎 Referral code detected in URL:', refCode);

      // Store in localStorage for later use
      if (typeof window !== 'undefined') {
        localStorage.setItem(REFERRAL_CODE_KEY, refCode.toUpperCase());
        console.log('✅ Referral code saved to localStorage');
      }
    }
  }, [searchParams]);

  // Function to apply the pending referral code (call after wallet connection)
  const applyPendingReferralCode = async () => {
    if (typeof window === 'undefined') return null;

    const pendingCode = localStorage.getItem(REFERRAL_CODE_KEY);

    if (!pendingCode) {
      console.log('ℹ️ No pending referral code to apply');
      return null;
    }

    console.log('🔄 Applying pending referral code:', pendingCode);
    setIsApplying(true);

    try {
      const result = await applyReferralCode({
        variables: { code: pendingCode }
      });

      if (result.data?.applyReferralCode?.errors && result.data.applyReferralCode.errors.length > 0) {
        console.error('❌ Failed to apply referral code:', result.data.applyReferralCode.errors);
        setIsApplying(false);
        return {
          success: false,
          message: result.data.applyReferralCode.errors.join(', ')
        };
      }

      if (result.data?.applyReferralCode?.message) {
        console.log('✅ Referral code applied successfully:', result.data.applyReferralCode.message);

        // Remove from localStorage after successful application
        localStorage.removeItem(REFERRAL_CODE_KEY);

        setIsApplying(false);
        return {
          success: true,
          message: result.data.applyReferralCode.message,
          voucher: result.data.applyReferralCode.voucher
        };
      }

      setIsApplying(false);
      return null;
    } catch (error) {
      console.error('❌ Error applying referral code:', error);
      setIsApplying(false);
      return {
        success: false,
        message: 'Failed to apply referral code. Please try again.'
      };
    }
  };

  // Function to check if there's a pending code
  const hasPendingCode = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(REFERRAL_CODE_KEY);
  };

  // Function to get the pending code
  const getPendingCode = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFERRAL_CODE_KEY);
  };

  // Function to clear pending code
  const clearPendingCode = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFERRAL_CODE_KEY);
  };

  return {
    applyPendingReferralCode,
    hasPendingCode,
    getPendingCode,
    clearPendingCode,
    isApplying
  };
}
