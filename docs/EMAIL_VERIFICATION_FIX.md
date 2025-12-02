# Email Verification Status Update Fix

## Problem
When a user switches accounts or verifies their email, the old email status was still being displayed. The system was showing cached/stale data instead of fresh information.

## Root Causes

1. **Apollo Cache** - GraphQL queries were using cached data
2. **No Refetch** - Components weren't refetching when data changed
3. **No Event System** - No way to notify all components when email was verified
4. **Stale State** - Modal state persisted across account switches

## Solutions Implemented

### 1. **Changed Apollo Fetch Policies**

#### EmailVerificationContext
```typescript
useCurrentUserQuery({
  skip: !isConnected,
  fetchPolicy: 'network-only', // Always fetch fresh from server
  notifyOnNetworkStatusChange: true,
});
```

#### WalletButton & PurchaseForm
```typescript
useCurrentUserQuery({
  skip: !isConnected,
  fetchPolicy: 'cache-and-network', // Use cache first, but fetch fresh
  notifyOnNetworkStatusChange: true,
});
```

**What this does:**
- `network-only` - Always fetches fresh data from server (EmailVerificationContext)
- `cache-and-network` - Shows cached data immediately, then fetches fresh data (WalletButton)
- `notifyOnNetworkStatusChange` - Re-renders when network status changes

### 2. **Added Global Event System**

When email is successfully verified:

```typescript
// In EmailVerificationModal.tsx
if (data?.verifyEmail?.success) {
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('email-verified'));
}
```

All components listen for this event:

```typescript
// In WalletButton.tsx & EmailVerificationContext.tsx
useEffect(() => {
  const handleEmailVerified = () => {
    refetchUserData(); // Refresh data
  };

  window.addEventListener('email-verified', handleEmailVerified);
  return () => window.removeEventListener('email-verified', handleEmailVerified);
}, [refetchUserData]);
```

### 3. **Added Refetch on Address Change**

When wallet address changes (account switch):

```typescript
useEffect(() => {
  if (isConnected && address) {
    console.log('📧 Wallet address changed, refetching user data...');
    refetchUser();
  }
}, [address, isConnected, refetchUser]);
```

### 4. **Added Refetch on Dropdown Open**

Fresh data every time the wallet dropdown is opened:

```typescript
useEffect(() => {
  if (showDropdown && isConnected) {
    refetchUserData();
  }
}, [showDropdown, isConnected, refetchUserData]);
```

### 5. **Added Apollo Cache Clearing**

Clear cache when wallet disconnects:

```typescript
// In apollo-client.ts
export function clearApolloCache() {
  if (apolloClient && typeof window !== "undefined") {
    console.log('🗑️ Clearing Apollo cache...');
    apolloClient.cache.reset();
  }
}

// In EmailVerificationContext.tsx
useEffect(() => {
  if (!isConnected) {
    // Clear cache on disconnect
    import('@/lib/apollo-client').then(({ clearApolloCache }) => {
      clearApolloCache();
    });
  }
}, [isConnected]);
```

### 6. **Reset Modal State on Account Switch**

```typescript
useEffect(() => {
  return () => {
    // Reset when address changes
    setHasShownModal(false);
    setHasCheckedInitialConnection(false);
  };
}, [address]);
```

## How It Works Now

### Scenario 1: User Verifies Email

```
1. User enters email → Verifies with OTP
   ↓
2. Modal dispatches 'email-verified' event
   ↓
3. ALL components listening receive event:
   - EmailVerificationContext → refetches user data
   - WalletButton → refetches user data
   ↓
4. Badge updates: ✗ No Email → ✓ Verified
   ↓
5. Dropdown updates: Shows verified email
```

### Scenario 2: User Switches Wallet Account

```
1. User disconnects wallet
   ↓
2. Apollo cache is cleared
   ↓
3. Modal state reset
   ↓
4. User connects different wallet
   ↓
5. Address changes detected
   ↓
6. All queries refetch with new address
   ↓
7. Fresh data for new account loaded
   ↓
8. Badge shows correct status for new account
```

### Scenario 3: User Opens Wallet Dropdown

```
1. User clicks wallet button
   ↓
2. Dropdown opens
   ↓
3. Refetch triggered automatically
   ↓
4. Latest email status fetched from server
   ↓
5. Display updated with fresh data
```

## Console Logs to Watch

When testing, you'll see these logs:

```
📧 Wallet address changed, refetching user data...
🔄 Email verified event received - refreshing user data in WalletButton
🔄 Email verified event received - refreshing user data in EmailVerificationContext
🗑️ Clearing Apollo cache...
📧 Wallet disconnected - resetting modal state and clearing cache
📧 Wallet address changed - resetting session state
```

## Files Modified

1. **`/src/contexts/EmailVerificationContext.tsx`**
   - Added `fetchPolicy: 'network-only'`
   - Added `notifyOnNetworkStatusChange`
   - Added refetch on address change
   - Added event listener for email verification
   - Added cache clearing on disconnect
   - Added state reset on address change

2. **`/src/components/WalletConnect/WalletButton.tsx`**
   - Added `fetchPolicy: 'cache-and-network'`
   - Added `notifyOnNetworkStatusChange`
   - Added refetch on address change
   - Added refetch on dropdown open
   - Added event listener for email verification

3. **`/src/components/Store/TopupProducts/PurchaseForm.tsx`**
   - Added `fetchPolicy: 'cache-and-network'`
   - Added `notifyOnNetworkStatusChange`

4. **`/src/components/Store/EmailVerification/EmailVerificationModal.tsx`**
   - Added event dispatch on successful verification

5. **`/src/lib/apollo-client.ts`**
   - Added `clearApolloCache()` helper function

## Testing the Fix

### Test 1: Email Verification Update
```
1. Connect wallet (no email)
2. Badge shows: ✗ No Email (Red)
3. Add and verify email
4. Watch console: "Email verified event received"
5. Badge updates to: ✓ Verified (Green)
6. Open dropdown → Shows verified email
✅ Status updated immediately
```

### Test 2: Account Switch
```
1. Connect Wallet A (verified email)
2. Badge shows: ✓ Verified (Green)
3. Disconnect wallet
4. Watch console: "Clearing Apollo cache"
5. Connect Wallet B (no email)
6. Badge shows: ✗ No Email (Red)
✅ Fresh data for new account
```

### Test 3: Dropdown Refresh
```
1. Connect wallet
2. Open dropdown (note email status)
3. Verify email in another tab/window
4. Close dropdown
5. Open dropdown again
6. Watch console: "refetchUserData"
7. Status shows latest data
✅ Dropdown always shows fresh data
```

## Benefits

✅ **No More Stale Data** - Always shows current status
✅ **Real-time Updates** - Changes reflect immediately
✅ **Account Switch Works** - Fresh data per account
✅ **Dropdown Accurate** - Refetches on open
✅ **Cache Cleared** - No leftover data
✅ **Event-Driven** - All components sync automatically

## Performance Impact

**Minimal** - Smart caching strategy:
- `cache-and-network` shows instant cached data, then updates
- Only refetches when needed (address change, dropdown open, event)
- Cache cleared only on disconnect
- Network requests are lightweight (CurrentUser query)

## Future Improvements

- [ ] Add polling interval for email verification status
- [ ] Add optimistic updates for faster UX
- [ ] Add cache persistence with expiration
- [ ] Add retry logic for failed refetches
- [ ] Add loading states during refetch
