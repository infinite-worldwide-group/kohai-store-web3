# Email Verification Modal - Auto-Reopen Feature

## Overview

The email verification modal has a smart timing system:
- **First appearance:** 10 seconds after wallet connection (gives users time to settle)
- **Auto-reappear:** 1 minute after closing (if not verified)

This ensures users are regularly reminded to verify their email while not being overly intrusive.

## How It Works

### User Flow

```
1. User connects wallet (no verified email)
   ↓
2. Wait 10 seconds (no popup yet)
   ↓
3. Console: "📧 Showing email modal in 10 seconds..."
   ↓
4. After 10 seconds → Modal appears with close button [X]
   ↓
5. Console: "📧 Opening email modal NOW!"
   ↓
6. User clicks [X] to close modal
   ↓
7. Modal closes, timer starts (60 seconds)
   ↓
8. Console: "📧 Modal closed - will reappear in 1 minute"
   ↓
9. User continues browsing...
   ↓
10. After 60 seconds...
   ↓
11. Console: "⏰ 1 minute passed - reopening email modal"
   ↓
12. Modal automatically pops up again!
   ↓
13. Repeat steps 6-12 until email is verified
```

### Modal Behavior

**When Modal Opens:**
```
┌──────────────────────────────────┐
│ Enter Your Email              [X]│  ← Close button always visible
├──────────────────────────────────┤
│ ⚠️ Verification Required:        │
│ Email verification is required   │
│ to make purchases.               │
│                                  │
│ This reminder will reappear in   │
│ 1 minute if not completed.       │
└──────────────────────────────────┘
```

**User Can:**
- ✅ Click [X] button to close
- ✅ Click outside modal to close
- ✅ Press ESC key to close
- ✅ Enter email and verify
- ✅ Browse site for 1 minute

**After 1 Minute:**
- Modal pops up again automatically
- Same process repeats
- Continues until email is verified

## Scenarios

### Scenario 1: User Verifies Email

```
1. User connects → Waits 10 seconds
2. Modal opens → User can close
3. User enters email
4. Receives OTP code
5. Enters OTP → Verifies
6. ✅ Email verified!
7. Console: "✅ Email verified - canceling auto-reopen timer"
8. Modal closes permanently
9. No more popups! 🎉
```

### Scenario 2: User Closes and Waits

```
1. User connects → Waits 10 seconds
2. Modal opens (first time)
3. User closes it → Timer starts (60s)
4. User browses for 30 seconds
5. Modal pops up again at 60s
6. User closes again → Timer restarts
7. After another 60s → Modal pops up
8. Continues until verified
```

### Scenario 3: User Starts Verification

```
1. Modal opens
2. User enters email
3. User closes modal before OTP
4. Timer starts (60s)
5. Modal reopens at 60s
6. Email is pre-filled!
7. User completes OTP
8. ✅ Verified
```

### Scenario 4: User Disconnects Wallet

```
1. Modal opens → User closes
2. Timer starts (60s)
3. User disconnects wallet at 30s
4. Console: "📧 Wallet disconnected"
5. Timer is cleared
6. No popup (wallet not connected)
```

### Scenario 5: User Switches Account

```
1. Account A: Modal opens → User closes
2. Timer starts
3. User switches to Account B at 30s
4. Timer is cleared
5. New timer starts for Account B
6. Account B modal appears based on its status
```

## Technical Implementation

### State Variables

```typescript
const [autoReopenTimer, setAutoReopenTimer] = useState<NodeJS.Timeout | null>(null);
```

### Close Modal Logic

```typescript
const closeEmailModal = () => {
  setShowEmailModal(false);

  // Check if user still needs verification
  const user = currentUserData?.currentUser;
  const needsEmailVerification = !user?.email || !user?.emailVerified;

  // Set timer to reopen after 1 minute
  if (isConnected && needsEmailVerification) {
    console.log('📧 Modal closed - will reappear in 1 minute');
    const timer = setTimeout(() => {
      console.log('⏰ 1 minute passed - reopening email modal');
      setShowEmailModal(true);
    }, 60000); // 60 seconds

    setAutoReopenTimer(timer);
  }
};
```

### Timer Cleanup

**On Email Verified:**
```typescript
if (autoReopenTimer) {
  console.log('✅ Email verified - canceling auto-reopen timer');
  clearTimeout(autoReopenTimer);
  setAutoReopenTimer(null);
}
```

**On Wallet Disconnect:**
```typescript
if (autoReopenTimer) {
  clearTimeout(autoReopenTimer);
  setAutoReopenTimer(null);
}
```

**On Account Switch:**
```typescript
if (autoReopenTimer) {
  clearTimeout(autoReopenTimer);
}
```

## Console Messages

Watch for these logs:

### Normal Flow
```
📧 Modal closed - will reappear in 1 minute if not verified
⏰ 1 minute passed - reopening email modal
```

### Email Verified
```
✅ Email verified - canceling auto-reopen timer
```

### Wallet Disconnected
```
📧 Wallet disconnected - resetting modal state
```

## Key Features

### ✅ User-Friendly
- 10-second delay before first popup (not intrusive)
- Always can close modal
- Not forced to verify immediately
- Regular gentle reminders (every 1 minute)

### ✅ Effective
- Modal reappears until verified
- Can't forget to verify
- Purchase protection still active

### ✅ Smart Cleanup
- Timer canceled when verified
- Timer cleared on disconnect
- Timer reset on account switch
- No memory leaks

### ✅ Persistent Reminder
- Works across sessions
- Reappears every minute
- Stops only when verified

## Configuration

### Initial Delay (First Popup)

To change the initial delay in `/src/contexts/EmailVerificationContext.tsx`:

```typescript
const timer = setTimeout(() => {
  setShowEmailModal(true);
}, 10000); // Change this value
```

Examples:
- 5 seconds: `5000`
- 15 seconds: `15000`
- 30 seconds: `30000`

### Reopen Delay (After Close)

To change the reopen delay in `/src/contexts/EmailVerificationContext.tsx`:

```typescript
const timer = setTimeout(() => {
  setShowEmailModal(true);
}, 60000); // Change this value
```

Examples:
- 30 seconds: `30000`
- 2 minutes: `120000`
- 5 minutes: `300000`

## Testing Checklist

- [ ] Connect wallet without verified email
- [ ] Console: "📧 Showing email modal in 10 seconds..."
- [ ] Wait 10 seconds
- [ ] Console: "📧 Opening email modal NOW!"
- [ ] Modal appears with close button visible
- [ ] Click [X] → Modal closes
- [ ] Click outside → Modal closes (test separately)
- [ ] Press ESC → Modal closes (test separately)
- [ ] Console: "📧 Modal closed - will reappear in 1 minute"
- [ ] Wait 60 seconds
- [ ] Console: "⏰ 1 minute passed - reopening email modal"
- [ ] Modal pops up automatically
- [ ] Close and wait again → Repeats
- [ ] Verify email → Timer canceled
- [ ] Console: "✅ Email verified - canceling auto-reopen timer"
- [ ] Disconnect wallet → Timer cleared
- [ ] Switch account → Timer reset

## Edge Cases Handled

### 1. Multiple Timers
- Only one timer runs at a time
- New close clears old timer
- New timer starts fresh

### 2. Fast Close/Open
- Manually opening clears timer
- Prevents duplicate timers
- Clean state management

### 3. Verification During Timer
- Timer is immediately canceled
- No popup after verification
- Clean completion

### 4. Disconnect During Timer
- Timer is cleared
- No popup after disconnect
- Proper cleanup

### 5. Account Switch During Timer
- Old timer is cleared
- New timer for new account
- Independent tracking

## Benefits

### For Users
✅ **Freedom** - Can close anytime
✅ **Reminders** - Won't forget to verify
✅ **Control** - Not forced immediately
✅ **Clear** - Know it will reappear

### For Business
✅ **Compliance** - Email collection maintained
✅ **Conversion** - Regular reminders increase verification
✅ **UX Balance** - Not too pushy, not too passive
✅ **Protection** - Still blocks purchases without verification

## Purchase Protection

**Important:** Even though users can close the modal:

❌ **Cannot make purchases** without verification
❌ **Payment is blocked** at checkout
❌ **Modal opens again** on purchase attempt
✅ **Users are protected** from proceeding without email

## Files Modified

1. **`/src/components/Store/EmailVerification/EmailVerificationModal.tsx`**
   - Removed timer countdown UI
   - Close button always visible
   - Simplified mandatory notice

2. **`/src/contexts/EmailVerificationContext.tsx`**
   - Added `autoReopenTimer` state
   - Implemented 60-second auto-reopen
   - Timer cleanup on various events

## Future Enhancements

- [ ] Configurable reopen delay
- [ ] Increase delay on repeated closes (1min, 2min, 5min)
- [ ] Snackbar notification: "Modal will reopen in 1 minute"
- [ ] Remember dismissed count (localStorage)
- [ ] Different delays based on user behavior
- [ ] "Don't remind me for X minutes" option
