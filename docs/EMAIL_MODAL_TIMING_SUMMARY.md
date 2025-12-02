# Email Modal Timing - Quick Reference

## Timing Overview

| Event | Delay | Behavior |
|-------|-------|----------|
| **First Popup** | 10 seconds | After wallet connection |
| **Reopen** | 60 seconds | After user closes modal |
| **Continuous** | Every 60s | Until email verified |

## Visual Timeline

```
User Connects Wallet
        ↓
   [Wait 10s]  ← User can browse freely
        ↓
   Modal Pops Up (First Time)
        ↓
   User Closes [X]
        ↓
   [Wait 60s]  ← User can browse freely
        ↓
   Modal Pops Up (Again)
        ↓
   User Closes [X]
        ↓
   [Wait 60s]  ← User can browse freely
        ↓
   Modal Pops Up (Again)
        ↓
   ... Continues until verified ...
```

## User Experience

### On First Connect
```
0:00  User connects wallet
0:10  Modal appears ← First popup
0:15  User closes modal
1:15  Modal appears ← Second popup (60s after close)
1:20  User closes modal
2:20  Modal appears ← Third popup (60s after close)
...   Continues every 60s until verified
```

### Quick Verification
```
0:00  User connects wallet
0:10  Modal appears
0:15  User enters email
0:30  User receives OTP
0:45  User verifies email ✅
      No more popups!
```

## Configuration

**Change Initial Delay (10 seconds):**
```typescript
// In EmailVerificationContext.tsx
setTimeout(() => {
  setShowEmailModal(true);
}, 10000); // ← Change this (milliseconds)
```

**Change Reopen Delay (60 seconds):**
```typescript
// In EmailVerificationContext.tsx
setTimeout(() => {
  setShowEmailModal(true);
}, 60000); // ← Change this (milliseconds)
```

## Common Delays Reference

| Duration | Milliseconds |
|----------|--------------|
| 5 seconds | 5000 |
| 10 seconds | 10000 |
| 15 seconds | 15000 |
| 30 seconds | 30000 |
| 1 minute | 60000 |
| 2 minutes | 120000 |
| 5 minutes | 300000 |

## Console Logs Timeline

```
[0s]   📧 EmailVerification Check: { needsVerification: true }
[0s]   📧 Showing email modal in 10 seconds...
[10s]  📧 Opening email modal NOW!

       [User closes modal]

[10s]  📧 Modal closed - will reappear in 1 minute if not verified
[70s]  ⏰ 1 minute passed - reopening email modal

       [User closes modal again]

[70s]  📧 Modal closed - will reappear in 1 minute if not verified
[130s] ⏰ 1 minute passed - reopening email modal

       [User verifies email]

[150s] ✅ Email verified - canceling auto-reopen timer
       No more popups!
```

## Key Points

✅ **10-second grace period** - Users aren't bombarded immediately
✅ **60-second reminders** - Regular but not annoying
✅ **Always closeable** - Users have control
✅ **Persistent until verified** - Ensures completion
✅ **Clean cancellation** - Stops when verified

## Benefits

### For Users
- Not interrupted immediately on connect
- Can browse freely for 10 seconds
- Regular reminders prevent forgetting
- Can close anytime

### For Business
- Higher verification rates (persistent reminders)
- Better UX (not too aggressive)
- Email collection maintained
- Purchase protection active

## Quick Test

1. Connect wallet → Count 10 seconds → Modal appears ✓
2. Close modal → Count 60 seconds → Modal appears ✓
3. Verify email → Modal stops appearing ✓
