"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCreateOrderMutation, useAuthenticateWalletMutation, useCurrentUserQuery, useCreateGameAccountMutation, useMyGameAccountsQuery, useDeleteGameAccountMutation, TopupProductItemFragment } from "graphql/generated/graphql";
import { useWallet } from "@/contexts/WalletContext";
import dynamic from "next/dynamic";
import { IoChevronDown } from "react-icons/io5";

const EmailVerificationModal = dynamic(() => import("@/components/Store/EmailVerification/EmailVerificationModal"), {
  ssr: false,
});

interface PurchaseFormProps {
  productItem: TopupProductItemFragment;
  userInput?: any; // JSON schema from product
}

const PurchaseForm = ({ productItem, userInput }: PurchaseFormProps) => {
  const [createOrder, { error }] = useCreateOrderMutation();
  const [authenticateWallet] = useAuthenticateWalletMutation();
  const [createGameAccount] = useCreateGameAccountMutation();
  const [deleteGameAccount] = useDeleteGameAccountMutation();
  const { isConnected, address, sendTransaction, connect } = useWallet();
  const { data: currentUserData, refetch: refetchUser } = useCurrentUserQuery({
    skip: !isConnected,
    fetchPolicy: 'cache-and-network', // Use cache first, but fetch fresh data
    notifyOnNetworkStatusChange: true,
  });
  const [orderResult, setOrderResult] = useState<any>(null);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loadingSolPrice, setLoadingSolPrice] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedGameAccountId, setSelectedGameAccountId] = useState<string | null>(null);
  const [manualEntryFields, setManualEntryFields] = useState<Set<string>>(new Set());
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch ALL saved game accounts for the user (not filtered by product)
  const { data: gameAccountsData, refetch: refetchGameAccounts, loading: loadingGameAccounts } = useMyGameAccountsQuery({
    variables: {
      topupProductId: undefined, // Fetch all game accounts, not filtered by product
      approvedOnly: false,
    },
    skip: !isConnected,
    fetchPolicy: 'cache-and-network',
  });

  // Filter game accounts for this product - Memoized
  const filteredGameAccounts = useMemo(() => {
    const allAccounts = gameAccountsData?.myGameAccounts || [];
    const productId = productItem.topupProductId?.toString();

    if (!productId || allAccounts.length === 0) {
      return [];
    }

    // Only return accounts that match THIS specific product
    const matchingAccounts = allAccounts.filter(acc => acc.topupProduct?.id === productId);

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Filtering accounts:', {
        currentProductId: productId,
        totalAccounts: allAccounts.length,
        matchingAccounts: matchingAccounts.length,
        allAccountsProductIds: allAccounts.map(acc => acc.topupProduct?.id),
      });
    }

    return matchingAccounts;
  }, [gameAccountsData, productItem.topupProductId]);

  // Debug game accounts loading
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎮 Game Accounts Status:', {
        isConnected,
        productId: productItem.topupProductId,
        loading: loadingGameAccounts,
        totalAccounts: gameAccountsData?.myGameAccounts?.length || 0,
        filteredAccounts: filteredGameAccounts.length,
        accounts: filteredGameAccounts.map(acc => ({
          id: acc.id,
          accountId: acc.accountId,
          displayName: acc.displayName,
          serverId: acc.serverId,
          productId: acc.topupProduct?.id
        }))
      });
    }
  }, [gameAccountsData, loadingGameAccounts, isConnected, productItem.topupProductId, filteredGameAccounts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutside = Array.from(dropdownRefs.current.values()).every(
        ref => ref && !ref.contains(event.target as Node)
      );

      if (clickedOutside) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse user input fields from product's user_input JSONB field - Memoized for performance
  const userInputFields = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Parsing userInput ===');
      console.log('Raw userInput:', JSON.stringify(userInput, null, 2));
      console.log('Type of userInput:', typeof userInput);
      console.log('Is Array?', Array.isArray(userInput));
    }

    if (!userInput) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No userInput provided');
      }
      return [];
    }

    // If userInput is an array
    if (Array.isArray(userInput)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ userInput is array:', userInput);
      }

      const validFields = userInput.map((field, index) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Field ${index}:`, field, 'Type:', typeof field);
        }

        // Check if field is a simple string (e.g., ["Player ID", "Server"])
        if (typeof field === 'string') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Converting string "${field}" to field object`);
          }
          // Keep the original field name as-is (preserve case and spaces)
          return {
            tag: 'input',         // Default to input for strings
            name: field,          // Keep as "Player ID", "YE" etc.
            label: field,         // Same as name
            type: 'text',
            required: true,
            placeholder: `Enter ${field}`,
            options: null,
            description: '',
          };
        }

        // Check if field is an object with properties
        if (typeof field === 'object' && field !== null) {
          return {
            tag: 'input',
            name: field.name || field.key || `field_${index}`,
            label: field.label || field.name || field.key || `Field ${index}`,
            type: field.type || 'text',
            required: field.required !== false,
            placeholder: field.placeholder || `Enter ${field.label || field.name || field.key || 'value'}`,
            options: null,
            description: field.description || '',
          };
        }

        // Fallback for unknown format
        return {
          tag: 'input',
          name: `field_${index}`,
          label: `Field ${index}`,
          type: 'text',
          required: true,
          placeholder: 'Enter value',
          options: null,
          description: '',
        };
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Processed fields:', validFields);
      }
      return validFields;
    }

    // If userInput is an object with a fields property
    if (typeof userInput === 'object' && userInput.fields && Array.isArray(userInput.fields)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ userInput has fields property:', userInput.fields);
      }

      // Parse the new structure with tag and attrs
      const parsedFields = userInput.fields.map((field: any, index: number) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Parsing field ${index}:`, field);
        }

        // Check if field has tag and attrs properties (new structure)
        if (field.tag && field.attrs) {
          const { tag, attrs } = field;
          if (process.env.NODE_ENV === 'development') {
            console.log(`Field ${index} - tag: ${tag}, attrs:`, attrs);
          }

          return {
            tag: tag,                                    // "input" or "dropdown"
            name: attrs.key || attrs.name || `field_${index}`,  // Use attrs.key as storage key (e.g., "Select Server")
            label: attrs.key || attrs.name || `Field ${index}`, // Use attrs.key as label
            type: attrs.type || 'text',
            required: true,
            placeholder: attrs.placeholder || `Enter ${attrs.key || 'value'}`,
            options: attrs.datas || null,                // Dropdown options
            description: '',
          };
        }

        // Fallback to old structure (for backwards compatibility)
        return {
          tag: 'input',
          name: field.name || field.key || `field_${index}`,
          label: field.label || field.name || field.key || `Field ${index}`,
          type: field.type || 'text',
          required: field.required !== false,
          placeholder: field.placeholder || `Enter ${field.label || field.name || 'value'}`,
          options: null,
          description: field.description || '',
        };
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Parsed fields with tag/attrs:', parsedFields);
      }
      return parsedFields;
    }

    // If userInput is an object, try to convert to array
    if (typeof userInput === 'object') {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ userInput is object, converting to array');
      }
      const entries = Object.entries(userInput);
      if (process.env.NODE_ENV === 'development') {
        console.log('Object entries:', entries);
      }

      return entries.map(([key, value]: [string, any]) => {
        // Check if value is an array (dropdown options)
        if (Array.isArray(value)) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Field "${key}" is dropdown with options:`, value);
          }
          return {
            tag: 'dropdown',
            name: key,                                    // Use key as storage field name
            label: key,                                   // Use key as label
            type: 'string',
            required: true,
            placeholder: `Select ${key}`,
            options: value.map((opt: string) => ({       // Convert array to options
              text: opt,
              value: opt
            })),
            description: '',
          };
        }

        // If value is "string" or any other string value (text input)
        if (typeof value === 'string' && value.toLowerCase() === 'string') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Field "${key}" is text input`);
          }
          return {
            tag: 'input',
            name: key,
            label: key,
            type: 'text',
            required: true,
            placeholder: `Enter ${key}`,
            options: null,
            description: '',
          };
        }

        // Fallback for old structure with label/type properties
        return {
          tag: 'input',
          name: key,
          label: value?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          type: value?.type || 'text',
          required: value?.required !== false,
          placeholder: value?.placeholder || `Enter ${key.replace(/_/g, ' ')}`,
          options: null,
          description: value?.description || '',
        };
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('❌ userInput format not recognized');
    }
    return [];
  }, [userInput]); // Memoize based on userInput changes only

  // Fetch current SOL price in USD with periodic updates
  useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 2;
    const FALLBACK_PRICE = 141.89;

    const fetchSolPrice = async () => {
      // Don't show loading spinner on background refreshes
      if (retryCount === 0 && !solPrice) {
        setLoadingSolPrice(true);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        // Use Next.js API route to avoid CORS issues
        const response = await fetch('/api/sol-price', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const price = data?.price;

        if (price && typeof price === 'number') {
          setSolPrice(price);
          console.log('✅ SOL price updated:', price, 'USD');
          retryCount = 0; // Reset retry count on success
        } else {
          throw new Error('Invalid price data received');
        }
      } catch (error: any) {
        console.warn('⚠️ Failed to fetch SOL price:', error.message);

        // Retry logic
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
          setTimeout(() => fetchSolPrice(), 1000 * retryCount); // Faster backoff: 1s, 2s
        } else {
          // Use fallback price if all retries fail and no price is set
          if (!solPrice) {
            console.log('Using fallback SOL price: $' + FALLBACK_PRICE);
            setSolPrice(FALLBACK_PRICE);
          } else {
            console.log('Keeping previous SOL price:', solPrice);
          }
          retryCount = 0; // Reset for next interval
        }
      } finally {
        setLoadingSolPrice(false);
      }
    };

    // Set fallback price immediately for instant display
    setSolPrice(FALLBACK_PRICE);

    // Then fetch real price
    fetchSolPrice();

    // Set up polling to refresh SOL price every 1 minute
    const priceInterval = setInterval(() => {
      console.log('🔄 Refreshing SOL price...');
      fetchSolPrice();
    }, 60000); // 60 seconds = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(priceInterval);
  }, []);

  // Listen for wallet switch event to refetch user data
  useEffect(() => {
    const handleWalletSwitch = async (event: any) => {
      console.log('🔄 Wallet switched in PurchaseForm - refetching user data');
      console.log('Previous:', event.detail.previousAddress);
      console.log('New:', event.detail.newAddress);

      // Clear any form errors and processing state
      setFormErrors([]);
      setProcessingPayment(false);

      // Optimized: Poll for JWT token instead of fixed delay
      console.log('Waiting for backend authentication...');
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds max

      while (attempts < maxAttempts) {
        const jwtToken = window.localStorage.getItem('jwtToken');
        if (jwtToken) {
          console.log('✅ JWT token found in PurchaseForm');
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Small delay after auth
      await new Promise(resolve => setTimeout(resolve, 200));

      // Refetch user data for new wallet
      console.log('Refetching user data from network...');
      try {
        await refetchUser();
        console.log('✅ User data refetched in PurchaseForm');
      } catch (error) {
        console.error('❌ Error refetching user data in PurchaseForm:', error);
      }
    };

    window.addEventListener('wallet-switched', handleWalletSwitch);
    return () => window.removeEventListener('wallet-switched', handleWalletSwitch);
  }, [refetchUser]);

  // Convert USD to SOL - Memoized
  const convertUsdToSol = useCallback((usdAmount: number): number => {
    if (!solPrice) return 0;
    return usdAmount / solPrice;
  }, [solPrice]);

  // Detect currency from product name or default to USD - Memoized
  const productCurrency = useMemo((): string => {
    const name = (productItem.displayName || productItem.name || '').toUpperCase();

    // Malaysian Ringgit
    if (name.includes('RM') && name.includes('MY')) return 'MYR';
    if (name.includes('MYR')) return 'MYR';

    // Singapore Dollar
    if (name.includes('SGD') || (name.includes('SG') && name.includes('$'))) return 'SGD';

    // Indonesian Rupiah
    if (name.includes('IDR') || name.includes('INDONESIA')) return 'IDR';

    // Thai Baht
    if (name.includes('THB') || name.includes('THAILAND')) return 'THB';

    // Default to USD
    return 'USD';
  }, [productItem.displayName, productItem.name]);

  // Get product price in fiat currency - Memoized
  const productPriceFiat = useMemo(() => productItem.price || 0, [productItem.price]);

  // Convert fiat to USD if needed (for SOL conversion)
  // For now, assume all prices are in USD equivalent
  // TODO: Add currency conversion rates for MYR, SGD, etc.
  const productPriceUsd = productPriceFiat;

  // Calculate SOL amount for payment - Memoized
  const productPriceSol = useMemo(() => convertUsdToSol(productPriceUsd), [convertUsdToSol, productPriceUsd]);

  // Check if account exists in saved accounts (no auto-save)
  const checkAccountExists = useCallback(async (data: Record<string, string>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 checkAccountExists called with data:', data);
    }

    // Only validate if user is connected
    if (!isConnected) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Not connected, skipping check');
      }
      setValidationStatus('idle');
      setValidationMessage('');
      return;
    }

    // Check if we have enough data to validate
    const accountId = data["User ID"] || data["Player ID"] || data["UID"] || data["Account ID"];
    const serverId = data["insert server value"] || data["Server"] || data["Region"];

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Extracted from userData:', {
        accountId,
        serverId,
        allDataKeys: Object.keys(data),
        allDataValues: data
      });
    }

    if (!accountId || accountId.length < 3) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Account ID too short or missing:', accountId);
      }
      setValidationStatus('idle');
      setValidationMessage('');
      return;
    }

    // Check if this account already exists in saved accounts
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Before checking - All filtered accounts:', {
        accountIdToFind: accountId,
        accountIdType: typeof accountId,
        serverIdToFind: serverId,
        serverIdType: typeof serverId,
        filteredAccounts: filteredGameAccounts.map(acc => ({
          id: acc.id,
          accountId: acc.accountId,
          accountIdType: typeof acc.accountId,
          serverId: acc.serverId,
          serverIdType: typeof acc.serverId,
          matches: acc.accountId === accountId,
          serverMatches: !serverId || acc.serverId === serverId
        }))
      });
    }

    const existingAccount = filteredGameAccounts.find(acc => {
      const accountIdMatch = acc.accountId === accountId;
      const serverIdMatch = !serverId || acc.serverId === serverId;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Checking account ${acc.accountId}:`, {
          accountIdMatch,
          serverIdMatch,
          bothMatch: accountIdMatch && serverIdMatch
        });
      }

      return accountIdMatch && serverIdMatch;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Account search result:', {
        accountId,
        serverId,
        filteredGameAccountsCount: filteredGameAccounts.length,
        existingAccount: existingAccount ? {
          id: existingAccount.id,
          accountId: existingAccount.accountId,
          serverId: existingAccount.serverId,
          approve: existingAccount.approve
        } : null,
      });
    }

    if (existingAccount) {
      setSelectedGameAccountId(existingAccount.id);
      if (existingAccount.approve) {
        setValidationStatus('valid');
        setValidationMessage('✓ Verified account found');
      } else {
        setValidationStatus('valid');
        setValidationMessage('Account saved (pending verification)');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Account found - setting validationStatus to valid');
      }
    } else {
      // Account not found - ready to save
      setValidationStatus('idle');
      setValidationMessage('');

      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Account not found - validationStatus set to idle (button should show)');
      }
    }
  }, [isConnected, filteredGameAccounts]);

  // Manual save game account function
  const handleSaveGameAccount = useCallback(async () => {
    const accountId = userData["User ID"] || userData["Player ID"] || userData["UID"] || userData["Account ID"];
    const serverId = userData["insert server value"] || userData["Server"] || userData["Region"];
    const inGameName = userData["Character Name"] || userData["In-Game Name"];

    if (!accountId) {
      alert('Please enter an account ID first');
      return;
    }

    setValidationStatus('validating');
    setValidationMessage('Saving account...');

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Saving game account with:', {
        topupProductId: productItem.topupProductId,
        productItem,
        accountId,
        serverId,
        inGameName,
        userData
      });
    }

    try {
      const result = await createGameAccount({
        variables: {
          topupProductId: productItem.topupProductId ? parseInt(productItem.topupProductId.toString()) : undefined,
          accountId: accountId,
          serverId: serverId || undefined,
          inGameName: inGameName || undefined,
          userData: userData,
        },
      });

      if (result.data?.createGameAccount?.gameAccount) {
        setValidationStatus('valid');
        setValidationMessage('✓ Account saved successfully');
        setSelectedGameAccountId(result.data.createGameAccount.gameAccount.id);
        // Refetch to show the newly created account
        refetchGameAccounts();
      } else if (result.data?.createGameAccount?.errors) {
        setValidationStatus('invalid');
        setValidationMessage(result.data.createGameAccount.errors.join(', '));
      }
    } catch (err: any) {
      setValidationStatus('invalid');
      setValidationMessage(err.message || 'Failed to save account');
    }
  }, [userData, productItem.topupProduct?.id, createGameAccount, refetchGameAccounts]);

  // Optimize handleInputChange with useCallback and add validation check
  const handleInputChange = useCallback((fieldName: string, value: string) => {
    setUserData((prev) => {
      const newData = {
        ...prev,
        [fieldName]: value,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Input changed:', {
          fieldName,
          value,
          newData
        });
      }

      // Clear previous validation timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Reset validation status when user types
      setValidationStatus('idle');
      setValidationMessage('');

      // Check if account exists after 1 second of inactivity
      if (value.trim()) {
        validationTimeoutRef.current = setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏱️ Timeout triggered - checking account exists');
          }
          checkAccountExists(newData);
        }, 1000);
      }

      return newData;
    });
  }, [checkAccountExists]);

  // Load saved game account into form
  const handleLoadGameAccount = useCallback((accountId: string) => {
    const account = filteredGameAccounts.find(acc => acc.id === accountId);
    if (account?.userData) {
      setUserData(account.userData as Record<string, string>);
      setSelectedGameAccountId(accountId);
      // Clear manual entry mode for all fields when loading a saved account
      setManualEntryFields(new Set());
      // Set validation status for loaded account
      if (account.approve) {
        setValidationStatus('valid');
        setValidationMessage('✓ Verified account');
      } else {
        setValidationStatus('valid');
        setValidationMessage('Account loaded (pending verification)');
      }
      console.log('✅ Loaded saved game account:', accountId);
    }
  }, [filteredGameAccounts]);

  // Cleanup validation timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Delete (disable) game account
  const handleDeleteGameAccount = useCallback(async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this saved game account?')) {
      return;
    }

    try {
      const result = await deleteGameAccount({
        variables: {
          gameAccountId: parseInt(accountId),
        },
      });

      if (result.data?.deleteGameAccount?.success) {
        console.log('✅ Game account deleted');
        // Clear form if deleted account was selected
        if (selectedGameAccountId === accountId) {
          setUserData({});
          setSelectedGameAccountId(null);
          setValidationStatus('idle');
          setValidationMessage('');
        }
        // Refetch to update the list
        refetchGameAccounts();
      } else if (result.data?.deleteGameAccount?.errors) {
        alert('Failed to delete: ' + result.data.deleteGameAccount.errors.join(', '));
      }
    } catch (err: any) {
      console.error('Error deleting game account:', err);
      alert('Error deleting account: ' + err.message);
    }
  }, [deleteGameAccount, selectedGameAccountId, refetchGameAccounts]);

  // Optimize handleWalletPayment with useCallback
  const handleWalletPayment = useCallback(async () => {
    if (!isConnected || !address) {
      connect();
      return;
    }

    setProcessingPayment(true);
    setFormErrors([]);

    try {
      // STEP 1: Check email verification
      const user = currentUserData?.currentUser;
      if (!user?.email) {
        setFormErrors(['Please add your email address before making a payment.']);
        setProcessingPayment(false);
        setShowEmailModal(true);
        return;
      }

      if (!user?.emailVerified) {
        setFormErrors(['Please verify your email before making a payment.']);
        setProcessingPayment(false);
        setShowEmailModal(true);
        return;
      }

      // STEP 2: Validate user input fields BEFORE payment
      const missingFields = userInputFields
        .filter((field: any) => field.required && !userData[field.name]?.trim())
        .map((field: any) => field.label || field.name);

      if (missingFields.length > 0) {
        setFormErrors([`Please fill in required fields: ${missingFields.join(", ")}`]);
        setProcessingPayment(false);
        return;
      }

      // STEP 3: Fetch latest SOL price RIGHT before payment for maximum accuracy
      console.log('Fetching latest SOL price before payment...');
      let currentSolPrice = solPrice;
      try {
        // Use Next.js API route to avoid CORS issues
        const response = await fetch('/api/sol-price');
        const data = await response.json();
        const latestPrice = data?.price;

        if (latestPrice) {
          currentSolPrice = latestPrice;
          setSolPrice(latestPrice); // Update state with fresh price
          console.log('Using latest SOL price for payment:', latestPrice, 'USD');
        } else {
          console.warn('Could not fetch latest price, using cached price:', currentSolPrice);
        }
      } catch (error) {
        console.warn('Error fetching latest SOL price, using cached price:', error);
      }

      // STEP 4: Check if SOL price is available
      if (!currentSolPrice) {
        setFormErrors(['Please wait, loading current SOL price...']);
        setProcessingPayment(false);
        return;
      }

      // STEP 5: Check if merchant wallet is configured
      const merchantAddress = process.env.NEXT_PUBLIC_MERCHANT_WALLET;

      if (!merchantAddress || merchantAddress === 'YOUR_WALLET_ADDRESS_HERE' || merchantAddress === '') {
        setFormErrors([
          'Merchant wallet not configured.',
          'Please add NEXT_PUBLIC_MERCHANT_WALLET to .env.local',
          'For testing, you can use the "Simulate Payment" button instead.'
        ]);
        setProcessingPayment(false);
        return;
      }

      // STEP 6: Calculate SOL amount using LATEST price
      const solAmount = productPriceUsd / currentSolPrice;

      if (solAmount <= 0) {
        setFormErrors(['Invalid price calculation. Please try again.']);
        setProcessingPayment(false);
        return;
      }

      console.log('Payment details:', {
        merchantAddress,
        priceUsd: productPriceUsd,
        currency: productCurrency,
        solPrice: currentSolPrice,
        solAmount: solAmount.toFixed(9),
        from: address
      });

      // STEP 7: Send transaction and wait for confirmation
      const signature = await sendTransaction(merchantAddress, solAmount);

      if (!signature) {
        console.error('Transaction failed: No signature returned');
        setFormErrors(['Payment failed. Please try again.']);
        setProcessingPayment(false);
        return;
      }

      console.log('Transaction successful:', signature);

      // STEP 8: Automatically create order after successful payment
      try {
        // Authenticate wallet first
        console.log("Authenticating wallet before creating order:", address);
        const authResult = await authenticateWallet({
          variables: {
            walletAddress: address,
          },
        });

        if (authResult.data?.authenticateWallet?.errors && authResult.data.authenticateWallet.errors.length > 0) {
          setFormErrors(["Authentication failed: " + authResult.data.authenticateWallet.errors.join(", ")]);
          setProcessingPayment(false);
          return;
        }

        if (!authResult.data?.authenticateWallet?.token) {
          setFormErrors(["Authentication failed: No token received"]);
          setProcessingPayment(false);
          return;
        }

        // Store JWT token
        const token = authResult.data.authenticateWallet.token;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('jwtToken', token);
          console.log("JWT token stored successfully");
        }

        // Create order with transaction signature
        console.log("Creating order with transaction signature:", signature);
        console.log("User data being sent:", userData);
        const result = await createOrder({
          variables: {
            topupProductItemId: productItem.id,
            transactionSignature: signature,
            userData: Object.keys(userData).length > 0 ? userData : undefined,
          },
        });

        if (result.data?.createOrder?.errors && result.data.createOrder.errors.length > 0) {
          setFormErrors(result.data.createOrder.errors);
          setProcessingPayment(false);
        } else if (result.data?.createOrder?.order) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Order created successfully:', {
              cryptoAmount: result.data.createOrder.order.cryptoAmount,
              cryptoCurrency: result.data.createOrder.order.cryptoCurrency,
              cryptoTransaction: result.data.createOrder.order.cryptoTransaction,
              fullOrder: result.data.createOrder.order
            });
          }
          setOrderResult(result.data.createOrder.order);

          // Reset validation status after successful order
          setValidationStatus('idle');
          setValidationMessage('');

          // Automatically save game account after successful order
          if (Object.keys(userData).length > 0) {
            try {
              console.log('💾 Auto-saving game account...');

              // Extract accountId and serverId from userData
              // Common patterns: "User ID", "Player ID", "UID", "Account ID"
              const accountId = userData["User ID"] ||
                               userData["Player ID"] ||
                               userData["UID"] ||
                               userData["Account ID"] ||
                               userData[Object.keys(userData)[0]]; // Fallback to first field

              // Common patterns: "Server", "insert server value", "Region"
              const serverId = userData["insert server value"] ||
                              userData["Server"] ||
                              userData["Region"] ||
                              null;

              // Optional: In-game name if available
              const inGameName = userData["Character Name"] ||
                                userData["In-Game Name"] ||
                                null;

              // Debug logging for auto-save
              if (process.env.NODE_ENV === 'development') {
                console.log('💾 Auto-save game account details:', {
                  topupProductId: productItem.topupProductId,
                  productItem,
                  accountId,
                  serverId,
                  inGameName,
                });
              }

              const gameAccountResult = await createGameAccount({
                variables: {
                  topupProductId: productItem.topupProductId ? parseInt(productItem.topupProductId.toString()) : undefined,
                  accountId: accountId,
                  serverId: serverId || undefined,
                  inGameName: inGameName || undefined,
                  userData: userData, // Complete form data
                },
              });

              if (gameAccountResult.data?.createGameAccount?.gameAccount) {
                console.log('✅ Game account auto-saved:', gameAccountResult.data.createGameAccount.gameAccount.id);
                // Refetch game accounts to show the newly saved account
                refetchGameAccounts();
              } else if (gameAccountResult.data?.createGameAccount?.errors) {
                console.warn('⚠️ Failed to auto-save game account:', gameAccountResult.data.createGameAccount.errors);
              }
            } catch (gameAccountError) {
              console.error('Error auto-saving game account:', gameAccountError);
              // Don't fail the order if saving account fails
            }
          }

          setProcessingPayment(false);
          // Reset form
          setUserData({});
        }
      } catch (orderErr: any) {
        console.error("Error creating order:", orderErr);
        setFormErrors([orderErr.message || "Payment succeeded but order creation failed. Please contact support with transaction: " + signature]);
        setProcessingPayment(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);

      // Parse and display the error message
      const errorMessage = err.message || 'Payment failed';
      const errors = [errorMessage];

      // Add helpful tips if not already in error message
      if (!errorMessage.includes('faucet') && !errorMessage.includes('Insufficient balance')) {
        errors.push('Tip: Make sure you have enough SOL in your wallet for the transaction and gas fees.');
      }

      setFormErrors(errors);
      setProcessingPayment(false);
    }
  }, [isConnected, address, connect, userInputFields, userData, productPriceUsd, solPrice, sendTransaction, authenticateWallet, createOrder, currentUserData]);

  // Optimize simulateWalletPayment with useCallback
  const simulateWalletPayment = useCallback(async () => {
    if (!isConnected || !address) {
      setFormErrors(["Please connect your wallet first"]);
      return;
    }

    setProcessingPayment(true);
    setFormErrors([]);

    try {
      // Check email verification
      const user = currentUserData?.currentUser;
      if (!user?.email) {
        setFormErrors(['Please add your email address before making a payment.']);
        setProcessingPayment(false);
        setShowEmailModal(true);
        return;
      }

      if (!user?.emailVerified) {
        setFormErrors(['Please verify your email before making a payment.']);
        setProcessingPayment(false);
        setShowEmailModal(true);
        return;
      }

      // Validate user input fields
      const missingFields = userInputFields
        .filter((field: any) => field.required && !userData[field.name]?.trim())
        .map((field: any) => field.label || field.name);

      if (missingFields.length > 0) {
        setFormErrors([`Please fill in required fields: ${missingFields.join(", ")}`]);
        setProcessingPayment(false);
        return;
      }

      // Demo mode for testing without real blockchain
      const mockSignature = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      console.log('Simulated transaction:', mockSignature);

      // Authenticate wallet
      console.log("Authenticating wallet before creating order:", address);
      const authResult = await authenticateWallet({
        variables: {
          walletAddress: address,
        },
      });

      if (authResult.data?.authenticateWallet?.errors && authResult.data.authenticateWallet.errors.length > 0) {
        setFormErrors(["Authentication failed: " + authResult.data.authenticateWallet.errors.join(", ")]);
        setProcessingPayment(false);
        return;
      }

      if (!authResult.data?.authenticateWallet?.token) {
        setFormErrors(["Authentication failed: No token received"]);
        setProcessingPayment(false);
        return;
      }

      // Store JWT token
      const token = authResult.data.authenticateWallet.token;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('jwtToken', token);
        console.log("JWT token stored successfully");
      }

      // Create order with simulated signature
      const result = await createOrder({
        variables: {
          topupProductItemId: productItem.id,
          transactionSignature: mockSignature,
          userData: Object.keys(userData).length > 0 ? userData : undefined,
        },
      });

      if (result.data?.createOrder?.errors && result.data.createOrder.errors.length > 0) {
        setFormErrors(result.data.createOrder.errors);
        setProcessingPayment(false);
      } else if (result.data?.createOrder?.order) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Order created successfully (simulated):', result.data.createOrder.order);
        }
        setOrderResult(result.data.createOrder.order);
        setProcessingPayment(false);
        // Reset form and validation
        setUserData({});
        setValidationStatus('idle');
        setValidationMessage('');
      }
    } catch (err: any) {
      console.error('Simulation error:', err);
      setFormErrors([err.message || "Failed to create simulated order"]);
      setProcessingPayment(false);
    }
  }, [isConnected, address, userInputFields, userData, authenticateWallet, createOrder, productItem.id, currentUserData]);

  if (orderResult) {
    return (
      <div className="rounded-lg bg-green-500/10 p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-8 w-8 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-2xl font-bold text-green-400">Order Created Successfully!</h3>
        </div>

        <div className="space-y-3 rounded-lg bg-white/5 p-4">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-sm opacity-70">Order Number:</span>
            <span className="font-mono font-semibold">{orderResult.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-sm opacity-70">Fiat Amount:</span>
            <span className="font-semibold">
              {orderResult.amount} {orderResult.currency}
            </span>
          </div>
          {/* Display crypto amount - use cryptoTransaction data if top-level fields are filtered */}
          {(() => {
            const cryptoAmount = orderResult.cryptoAmount && orderResult.cryptoAmount !== "[FILTERED]"
              ? orderResult.cryptoAmount
              : orderResult.cryptoTransaction?.amount;
            const cryptoCurrency = orderResult.cryptoCurrency && orderResult.cryptoCurrency !== "[FILTERED]"
              ? orderResult.cryptoCurrency
              : orderResult.cryptoTransaction?.token;

            if (cryptoAmount && cryptoCurrency) {
              return (
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-70">Crypto Amount:</span>
                  <span className="font-mono font-semibold text-green-400">
                    {typeof cryptoAmount === 'number' ? cryptoAmount.toFixed(6) : cryptoAmount} {cryptoCurrency}
                  </span>
                </div>
              );
            }
            return null;
          })()}
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-sm opacity-70">Status:</span>
            <span className="rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold uppercase text-blue-300">
              {orderResult.status}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-sm opacity-70">Order Type:</span>
            <span className="text-sm">{orderResult.orderType}</span>
          </div>
          {orderResult.cryptoTransaction && (
            <>
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-sm font-semibold opacity-70 mb-2">Transaction Details:</h4>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm opacity-70">Network:</span>
                <span className="text-sm">{orderResult.cryptoTransaction.network}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-sm opacity-70">Token:</span>
                <span className="text-sm">{orderResult.cryptoTransaction.token}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-sm opacity-70">Signature:</span>
                <span className="font-mono text-xs break-all">
                  {orderResult.cryptoTransaction.transactionSignature}
                </span>
              </div>
            </>
          )}

          {/* Display User Input Data (Game Account Info) */}
          {orderResult.metadata && Object.keys(orderResult.metadata).length > 0 && (
            <>
              <div className="mt-4 pt-4 border-t border-white/20">
                <h4 className="text-sm font-semibold opacity-70 mb-2">Game Account Details:</h4>
              </div>
              {Object.entries(orderResult.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sm opacity-70">{key}:</span>
                  <span className="text-sm font-semibold">{String(value)}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => window.location.href = `/orders/${orderResult.id}`}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-semibold transition hover:from-blue-600 hover:to-purple-600"
          >
            View Order Details
          </button>
          <button
            onClick={() => setOrderResult(null)}
            className="w-full rounded-lg bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
          >
            Create Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-md">
      <h3 className="mb-4 text-xl font-bold">Complete Your Purchase</h3>

      {/* Product Item Details */}
      <div className="mb-6 rounded-lg bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{productItem.displayName || productItem.name}</p>
            <p className="text-sm opacity-60">Item ID: {productItem.id}</p>
          </div>
          <div className="text-right">
            {/* Always show fiat currency prominently */}
            <p className="text-2xl font-bold">
              {productCurrency === 'USD' ? '$' : productCurrency === 'MYR' ? 'RM ' : ''}
              {productPriceUsd.toFixed(2)}
              {productCurrency !== 'USD' && productCurrency !== 'MYR' ? ` ${productCurrency}` : ''}
            </p>
            {solPrice && productPriceSol > 0 && (
              <p className="text-sm opacity-70 mt-1">
                ≈ {productPriceSol.toFixed(6)} SOL
              </p>
            )}
            {loadingSolPrice && (
              <p className="text-xs opacity-50 mt-1">Loading SOL price...</p>
            )}
            {!loadingSolPrice && solPrice && (
              <p className="text-xs opacity-50 mt-1">
                1 SOL = ${solPrice.toFixed(2)} USD
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {formErrors.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <h4 className="mb-2 font-semibold text-red-300">Errors:</h4>
          <ul className="list-inside list-disc text-sm text-red-200">
            {formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Purchase Form */}
      <div className="space-y-4">
        {/* Saved Game Accounts Selector */}
        {isConnected && filteredGameAccounts.length > 0 && (
          <div className="space-y-3 rounded-lg bg-green-500/10 border border-green-500/30 p-4">
            <h4 className="text-sm font-semibold text-green-300">💾 Your Saved Accounts</h4>
            <div className="space-y-2">
              {filteredGameAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between rounded-lg p-3 transition ${
                    selectedGameAccountId === account.id
                      ? 'bg-green-500/20 ring-2 ring-green-400'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleLoadGameAccount(account.id)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {account.displayName || account.inGameName || 'Saved Account'}
                      </span>
                      {account.approve && <span className="text-xs text-green-400">✓ Verified</span>}
                    </div>
                    <div className="text-xs opacity-70 space-y-0.5 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-300">ID:</span>
                        <span className="font-mono">{account.accountId}</span>
                      </div>
                      {account.serverId && (
                        <div className="flex items-center gap-2">
                          <span className="text-purple-300">Server:</span>
                          <span>{account.serverId}</span>
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGameAccount(account.id)}
                    className="ml-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Input Fields */}
        {userInputFields.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold opacity-70">Game Account Information</h4>
              {/* Status Badge */}
              {validationStatus !== 'idle' && validationMessage && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  validationStatus === 'validating' ? 'bg-blue-500/10 text-blue-400' :
                  validationStatus === 'valid' ? 'bg-green-500/10 text-green-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {validationStatus === 'validating' && (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  {validationStatus === 'valid' && <span>✓</span>}
                  {validationStatus === 'invalid' && <span>✗</span>}
                  <span>{validationMessage}</span>
                </div>
              )}
            </div>
            {userInputFields.map((field: any, index: number) => {
              const fieldName = field.name || field.key || `field_${index}`;
              const fieldLabel = field.label || field.name || field.key || 'Field';
              const fieldType = field.type || 'text';
              const fieldPlaceholder = field.placeholder || `Enter ${fieldLabel}`;
              const fieldTag = field.tag || 'input';

              // Check if this is a Player ID / User ID / Account ID field that should show saved accounts
              const accountIdPatterns = ['Player ID', 'User ID', 'UID', 'Account ID', 'player_id', 'user_id', 'uid', 'account_id'];
              const isAccountIdField = accountIdPatterns.some(pattern =>
                fieldName.toLowerCase().includes(pattern.toLowerCase()) ||
                fieldLabel.toLowerCase().includes(pattern.toLowerCase())
              );

              // Get saved account IDs for dropdown if applicable
              const hasSavedAccounts = isAccountIdField && filteredGameAccounts.length > 0;
              const savedAccountOptions = hasSavedAccounts
                ? filteredGameAccounts.map(acc => ({
                    value: acc.accountId,
                    text: acc.displayName || acc.accountId,
                    fullData: acc
                  }))
                : [];

              // Check if this field is in manual entry mode
              const isManualEntry = manualEntryFields.has(fieldName);

              // Determine what will be rendered
              let renderType = 'input';
              if (hasSavedAccounts && !isManualEntry) {
                renderType = 'saved-accounts-dropdown';
              } else if (fieldTag === 'dropdown' && field.options && Array.isArray(field.options) && !isManualEntry) {
                renderType = 'regular-dropdown';
              }

              if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 Rendering field ${index}:`, {
                  fieldTag,
                  fieldName,
                  fieldLabel,
                  isAccountIdField,
                  hasSavedAccounts,
                  isManualEntry,
                  filteredGameAccounts: filteredGameAccounts.length,
                  savedAccountOptions: savedAccountOptions.length,
                  renderType: renderType,
                  reason: hasSavedAccounts ? 'Has saved accounts' : isManualEntry ? 'Manual entry mode' : 'No saved accounts'
                });

                // Extra debugging for account ID fields
                if (fieldName.toLowerCase().includes('id') || fieldLabel.toLowerCase().includes('id')) {
                  console.log(`🎯 ID field detected:`, {
                    fieldName,
                    fieldLabel,
                    matchedPattern: accountIdPatterns.find(pattern =>
                      fieldName.toLowerCase().includes(pattern.toLowerCase()) ||
                      fieldLabel.toLowerCase().includes(pattern.toLowerCase())
                    ),
                    willShowDropdown: hasSavedAccounts || (fieldTag === 'dropdown' && field.options),
                    accounts: filteredGameAccounts.map(acc => ({
                      id: acc.id,
                      accountId: acc.accountId,
                      displayName: acc.displayName,
                      productId: acc.topupProduct?.id
                    }))
                  });
                }
              }

              return (
                <div key={`input-${index}-${fieldName}`}>
                  <label className="mb-1 block text-sm font-medium">
                    {fieldLabel}
                    {field.required && <span className="text-red-400"> *</span>}
                  </label>

                  {/* Render custom dropdown for saved accounts OR regular select for other dropdowns */}
                  {hasSavedAccounts && !isManualEntry ? (
                    /* Custom button dropdown for saved accounts */
                    <div
                      className="relative"
                      ref={(el) => {
                        if (el) dropdownRefs.current.set(fieldName, el);
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdowns(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(fieldName)) {
                              newSet.delete(fieldName);
                            } else {
                              newSet.clear(); // Close other dropdowns
                              newSet.add(fieldName);
                            }
                            return newSet;
                          });
                        }}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/5 rounded-xl shadow hover:bg-white/10 transition-all ring-1 ring-white/20 hover:ring-white/30"
                      >
                        <div className="text-left flex-1">
                          {userData[fieldName] ? (
                            <>
                              {(() => {
                                const selectedAccount = filteredGameAccounts.find(acc => acc.accountId === userData[fieldName]);
                                if (selectedAccount) {
                                  return (
                                    <div>
                                      <div className="text-white font-medium text-sm">
                                        {selectedAccount.displayName || selectedAccount.inGameName || 'Saved Account'}
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
                                        <span className="font-mono">{selectedAccount.accountId}</span>
                                        {selectedAccount.serverId && (
                                          <span>• {selectedAccount.serverId}</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                                return <span className="text-white">{userData[fieldName]}</span>;
                              })()}
                            </>
                          ) : (
                            <span className="text-white/70">Recent Game Accounts</span>
                          )}
                        </div>
                        <IoChevronDown
                          className={`transition-transform text-white/70 flex-shrink-0 ${
                            openDropdowns.has(fieldName) ? "rotate-180" : ""
                          }`}
                          size={20}
                        />
                      </button>

                      {openDropdowns.has(fieldName) && (
                        <div className="absolute mt-2 w-full bg-gray-900 rounded-xl shadow-lg border border-white/20 p-2 z-10 max-h-64 overflow-y-auto">
                          {savedAccountOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-white/50">No saved accounts</div>
                          ) : (
                            <>
                              {savedAccountOptions.map((option: any, optIndex: number) => (
                                <button
                                  key={`saved-${fieldName}-${optIndex}`}
                                  type="button"
                                  onClick={() => {
                                    const account = filteredGameAccounts.find(acc => acc.accountId === option.value);
                                    if (account?.userData) {
                                      // Load all saved account data into the form
                                      setUserData(account.userData as Record<string, string>);
                                      setSelectedGameAccountId(account.id);
                                      console.log('✅ Loaded saved game account from dropdown:', account.id);
                                    } else {
                                      // Just set the account ID field
                                      handleInputChange(fieldName, option.value);
                                    }
                                    // Close dropdown
                                    setOpenDropdowns(new Set());
                                  }}
                                  className={`w-full text-left px-3 py-2.5 rounded-lg transition ${
                                    userData[fieldName] === option.value
                                      ? 'bg-blue-500/20 text-white'
                                      : 'hover:bg-white/10 text-white/90'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {option.fullData.displayName || option.fullData.inGameName || 'Saved Account'}
                                    </span>
                                    {option.fullData.approve && <span className="text-xs text-green-400">✓</span>}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-blue-300">ID:</span>
                                      <span className="font-mono text-white/70">{option.fullData.accountId}</span>
                                    </div>
                                    {option.fullData.serverId && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-purple-300">Server:</span>
                                        <span className="text-white/70">{option.fullData.serverId}</span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                              <div className="border-t border-white/10 my-1"></div>
                              <button
                                type="button"
                                onClick={() => {
                                  setManualEntryFields(prev => new Set(prev).add(fieldName));
                                  handleInputChange(fieldName, '');
                                  setOpenDropdowns(new Set());
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition text-blue-400 text-sm"
                              >
                                Enter manually...
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (fieldTag === 'dropdown' && field.options && Array.isArray(field.options)) && !isManualEntry ? (
                    /* Regular select dropdown for non-account fields */
                    <select
                      value={userData[fieldName] || ""}
                      onChange={(e) => handleInputChange(fieldName, e.target.value)}
                      className="w-full rounded-lg bg-white/5 px-4 py-2 text-white outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-blue-400"
                      required={field.required}
                    >
                      <option value="" disabled className="bg-gray-800">
                        {fieldPlaceholder}
                      </option>
                      {field.options.map((option: any, optIndex: number) => (
                        <option
                          key={`${fieldName}-option-${optIndex}`}
                          value={option.value}
                          className="bg-gray-800"
                        >
                          {option.text || option.value}
                        </option>
                      ))}
                    </select>
                  ) : (
                    /* Render input field */
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type={fieldType === "number" ? "number" : "text"}
                          placeholder={fieldPlaceholder}
                          value={userData[fieldName] || ""}
                          onChange={(e) => handleInputChange(fieldName, e.target.value)}
                          className={`w-full rounded-xl bg-white/5 px-4 py-3 pr-10 text-white placeholder-white/40 outline-none ring-1 transition focus:ring-2 ${
                            validationStatus === 'validating' ? 'ring-blue-400/50' :
                            validationStatus === 'valid' ? 'ring-green-400/50' :
                            validationStatus === 'invalid' ? 'ring-red-400/50' :
                            'ring-white/20 focus:ring-blue-400'
                          }`}
                          required={field.required}
                        />
                        {/* Inline validation indicator */}
                        {isAccountIdField && validationStatus !== 'idle' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validationStatus === 'validating' && (
                              <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                            )}
                            {validationStatus === 'valid' && (
                              <span className="text-green-400 text-xl">✓</span>
                            )}
                            {validationStatus === 'invalid' && (
                              <span className="text-red-400 text-xl">✗</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Validation error message */}
                      {isAccountIdField && validationStatus === 'invalid' && validationMessage && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{validationMessage}</span>
                        </p>
                      )}

                      {/* Show button to switch back to saved accounts if available */}
                      {hasSavedAccounts && isManualEntry && (
                        <button
                          type="button"
                          onClick={() => {
                            setManualEntryFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(fieldName);
                              return newSet;
                            });
                            // Clear the manual value
                            handleInputChange(fieldName, '');
                          }}
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
                        >
                          <IoChevronDown className="rotate-90" size={16} />
                          Use saved accounts instead
                        </button>
                      )}
                    </div>
                  )}

                  {field.description && (
                    <p className="mt-1 text-xs opacity-60">{field.description}</p>
                  )}
                </div>
              );
            })}

            {/* Save Account Button */}
            {(() => {
              const showButton = isConnected && Object.keys(userData).length > 0 && validationStatus !== 'valid';

              if (process.env.NODE_ENV === 'development') {
                console.log('💾 Save Button Visibility:', {
                  isConnected,
                  hasUserData: Object.keys(userData).length > 0,
                  userDataKeys: Object.keys(userData),
                  validationStatus,
                  validationMessage,
                  selectedGameAccountId,
                  showButton,
                });
              }

              return showButton ? (
                <button
                  type="button"
                  onClick={handleSaveGameAccount}
                  disabled={validationStatus === 'validating'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl border border-blue-500/50 text-blue-300 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {validationStatus === 'validating' ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Saving Account...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Account for Future Use
                  </>
                )}
              </button>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
            <p className="text-sm text-yellow-300">
              No user input fields configured for this product. Check the console for debugging info.
            </p>
          </div>
        )}

        {/* Email Verification Section - Only show if connected */}
        {isConnected && currentUserData?.currentUser && (!currentUserData.currentUser.email || !currentUserData.currentUser.emailVerified) && (
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-4">
            <h4 className="mb-2 font-semibold text-orange-300">
              📧 {!currentUserData.currentUser.email ? 'Email Required' : 'Email Verification Required'}
            </h4>
            <p className="mb-3 text-sm text-orange-200">
              {!currentUserData.currentUser.email
                ? 'Please add your email address to receive order updates and receipts.'
                : 'Please verify your email to receive order updates and receipts.'
              }
            </p>
            {currentUserData.currentUser.email ? (
              <div className="space-y-2">
                <p className="text-sm text-orange-100">
                  Current email: <span className="font-semibold">{currentUserData.currentUser.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 font-semibold text-white transition hover:from-orange-600 hover:to-red-600"
                >
                  Verify Email Now
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 font-semibold text-white transition hover:from-orange-600 hover:to-red-600"
              >
                Add & Verify Email
              </button>
            )}
          </div>
        )}

        {/* Wallet Payment Section */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
          <h4 className="mb-2 font-semibold text-blue-300">💳 Payment with Wallet</h4>

          {!isConnected ? (
            /* Not Connected */
            <>
              <p className="mb-3 text-sm text-blue-200">
                Connect your wallet to pay with crypto
              </p>
              <button
                type="button"
                onClick={connect}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
              >
                🔗 Connect Wallet to Pay
              </button>
            </>
          ) : (
            /* Connected - Ready to Pay */
            <>
              <p className="mb-2 text-sm text-blue-200">
                Wallet connected: <span className="font-mono">{address?.slice(0, 4)}...{address?.slice(-4)}</span>
              </p>
              {/* Payment Amount Display */}
              {solPrice && productPriceSol > 0 && (
                <div className="mb-3 rounded-lg bg-white/5 p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-70">Price:</span>
                    <span className="font-semibold">
                      {productCurrency === 'USD' ? '$' : productCurrency === 'MYR' ? 'RM ' : ''}
                      {productPriceUsd.toFixed(2)}
                      {productCurrency !== 'USD' && productCurrency !== 'MYR' ? ` ${productCurrency}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70">You will pay:</span>
                    <span className="font-mono font-bold text-green-400">
                      {productPriceSol.toFixed(6)} SOL
                    </span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleWalletPayment}
                disabled={processingPayment || loadingSolPrice || !solPrice}
                className="w-full rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
              >
                {processingPayment ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing Payment...
                  </span>
                ) : loadingSolPrice ? (
                  "Loading price..."
                ) : (
                  `💰 Pay ${productPriceSol.toFixed(6)} SOL`
                )}
              </button>

              {/* Test/Demo Mode */}
              <div className="mt-3 border-t border-blue-500/30 pt-3">
                <p className="mb-2 text-xs text-blue-300">Or for testing:</p>
                <button
                  type="button"
                  onClick={simulateWalletPayment}
                  disabled={processingPayment}
                  className="w-full rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/30 disabled:opacity-50"
                >
                  {processingPayment ? "Processing..." : "🧪 Simulate Payment (Demo Mode)"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-sm text-red-300">Network Error: {error.message}</p>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailModal && (
        <EmailVerificationModal
          currentEmail={currentUserData?.currentUser?.email}
          emailVerified={currentUserData?.currentUser?.emailVerified}
          onVerified={() => {
            refetchUser();
            setShowEmailModal(false);
          }}
          onClose={() => setShowEmailModal(false)}
          mandatory={true} // Force email verification before purchase
        />
      )}
    </div>
  );
};

export default PurchaseForm;
