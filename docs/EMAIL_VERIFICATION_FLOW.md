# Email Verification Flow Documentation

## Overview
This document describes the complete email verification flow implemented in the Kohai Store Web3 application.

## Features Implemented

### 1. **Automatic Email Modal on Page Load**
- When a user connects their wallet and has **no email** or **unverified email**, a modal automatically pops up
- Modal appears **300ms** after user data loads
- Modal is **mandatory** - cannot be closed until verification is complete

### 2. **Email Verification Status Badge**
The wallet button in the header displays the email verification status:

**Three States:**

#### ✓ Verified (Green Badge)
- User has email AND it's verified
- Badge shows: `✓ Verified`
- Green color indicates all is good

#### ⚠ Unverified (Orange Badge)
- User has email BUT it's NOT verified
- Badge shows: `⚠ Unverified`
- Clicking opens email verification modal

#### ✗ No Email (Red Badge)
- User has NO email on record
- Badge shows: `✗ No Email`
- Clicking opens email modal to add email

### 3. **Wallet Dropdown - Email Section**
When clicking the wallet address, a dropdown shows:

**If Email Verified (Green):**
```
✓ Email Verified
user@example.com
```

**If Email NOT Verified (Orange - Clickable):**
```
⚠ Verify Email
user@example.com
[Click to verify]
```

**If NO Email (Red - Clickable):**
```
✗ Add Email
Required for purchases
[Click to add email]
```

### 4. **Purchase Flow Protection**
Users **CANNOT** make purchases without verified email:

1. User tries to pay → System checks email
2. If **no email** → Shows error + Opens modal
3. If **email not verified** → Shows error + Opens modal
4. If **email verified** → Allows purchase ✅

### 5. **Mandatory Modal Features**
When modal is mandatory:
- ❌ **No close button (X)** - button is hidden
- ❌ **Cannot click outside** to dismiss
- ❌ **ESC key blocked** - won't close modal
- ⚠️ **Warning banner** - "Verification Required"
- ✅ **Only closes** after successful verification

### 6. **Development Test Button**
In development mode only:
- Orange "📧 Test Email Modal" button at bottom-left
- Manually triggers the modal for testing
- NOT visible in production

## User Flow Diagrams

### Flow 1: New User (No Email)

```
1. User connects wallet
   ↓
2. System checks user data (300ms)
   ↓
3. No email found → Modal appears
   ↓
4. User enters email → Clicks "Send Code"
   ↓
5. OTP sent to email (60s cooldown)
   ↓
6. User enters 6-digit OTP
   ↓
7. System verifies OTP
   ↓
8. ✅ Email verified → Modal closes
   ↓
9. Badge changes to "✓ Verified"
```

### Flow 2: Existing User (Email Not Verified)

```
1. User connects wallet
   ↓
2. System checks: email exists but not verified
   ↓
3. Modal appears at OTP step
   ↓
4. Option to change email OR resend code
   ↓
5. User enters OTP → Verifies
   ↓
6. ✅ Email verified → Badge updates
```

### Flow 3: Purchase Attempt Without Email

```
1. User selects product + fills form
   ↓
2. Clicks "Pay"
   ↓
3. System checks email → NOT FOUND
   ↓
4. ❌ Payment BLOCKED
   ↓
5. Error: "Please add your email address"
   ↓
6. Modal opens automatically (mandatory)
   ↓
7. User completes verification
   ↓
8. ✅ Can now purchase
```

## Visual Design

### Badge Styles

**Verified Badge:**
```
┌─────────────────────────┐
│ ✓ Verified              │  (Green: bg-green-500/20, border-green-500/30)
└─────────────────────────┘
```

**Unverified Badge:**
```
┌─────────────────────────┐
│ ⚠ Unverified            │  (Orange: bg-orange-500/20, border-orange-500/30)
└─────────────────────────┘
```

**No Email Badge:**
```
┌─────────────────────────┐
│ ✗ No Email              │  (Red: bg-red-500/20, border-red-500/30)
└─────────────────────────┘
```

### Modal States

**Email Input Screen:**
```
┌──────────────────────────────────────┐
│ Enter Your Email                  [X]│  ← Hidden if mandatory
├──────────────────────────────────────┤
│                                      │
│ ⚠️ Verification Required:            │
│ You must complete email              │
│ verification to continue...          │
│                                      │
│ 📧 Email Required for Purchases      │
│ We need your email to send order     │
│ updates, receipts, and delivery      │
│ confirmations.                       │
│                                      │
│ Email Address *                      │
│ ┌──────────────────────────────────┐ │
│ │ your@email.com                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [  Send Verification Code  ]         │
│                                      │
└──────────────────────────────────────┘
```

**OTP Verification Screen:**
```
┌──────────────────────────────────────┐
│ Verify Your Email                    │
├──────────────────────────────────────┤
│                                      │
│ 📬 Check Your Email                  │
│ We sent a 6-digit verification code  │
│ to your@email.com                    │
│                                      │
│ Verification Code *                  │
│ ┌──────────────────────────────────┐ │
│ │      0  0  0  0  0  0            │ │  (Large, centered)
│ └──────────────────────────────────┘ │
│                                      │
│ [      Verify Email       ]          │
│                                      │
│ Resend Code | Change Email           │
│                                      │
└──────────────────────────────────────┘
```

## API Integration

### GraphQL Queries

**Fetch User Data:**
```graphql
query CurrentUser {
  currentUser {
    id
    email
    emailVerified
    emailVerifiedAt
    updatedAt
  }
}
```

### GraphQL Mutations

**Send Email Verification Code:**
```graphql
mutation SendEmailVerificationCode($email: String!) {
  sendEmailVerificationCode(email: $email) {
    success
    message
    errors
  }
}
```

**Verify Email with OTP:**
```graphql
mutation VerifyEmail($code: String!) {
  verifyEmail(code: $code) {
    success
    message
    errors
    user {
      id
      email
      emailVerified
      emailVerifiedAt
    }
  }
}
```

## Technical Implementation

### Files Modified

1. **`/src/contexts/EmailVerificationContext.tsx`**
   - Automatic modal trigger logic
   - Loading state handling
   - Enhanced debugging logs
   - Test button for development

2. **`/src/components/Store/EmailVerification/EmailVerificationModal.tsx`**
   - Mandatory mode support
   - ESC key blocking
   - Improved UI messaging
   - Enter key support

3. **`/src/components/Store/TopupProducts/PurchaseForm.tsx`**
   - Email validation before payment
   - Modal trigger on payment attempt
   - Clear error messages

4. **`/src/components/WalletConnect/WalletButton.tsx`**
   - Email verification badge
   - Dropdown email status
   - Click-to-verify buttons

5. **`/src/app/layout.tsx`**
   - Added EmailVerificationProvider

6. **`/graphql/fragments/User.graphql`**
   - Already includes emailVerified field

### State Management

**EmailVerificationContext State:**
```typescript
{
  showEmailModal: boolean          // Controls modal visibility
  hasShownModal: boolean           // Tracks if shown this session
  hasCheckedInitialConnection: boolean  // Initial page load check
}
```

**Modal Props:**
```typescript
{
  currentEmail?: string | null     // Pre-fill email if exists
  emailVerified?: boolean          // Skip to OTP if true
  onVerified: () => void          // Callback after success
  onClose: () => void             // Close modal callback
  mandatory?: boolean             // Prevent closing
}
```

## Debug Console Logs

When testing, watch for these console messages:

```javascript
📧 EmailVerification Check: {
  isConnected: true,
  loading: false,
  hasUser: true,
  email: null,
  emailVerified: false,
  hasShownModal: false,
  showEmailModal: false,
  hasCheckedInitialConnection: true
}
📧 Needs verification? true
📧 Showing email modal in 300ms...
📧 Opening email modal NOW!
```

## Testing Checklist

- [ ] Connect wallet → Modal appears automatically
- [ ] Modal cannot be closed (no X, ESC, backdrop click)
- [ ] Enter email → Send code → OTP received
- [ ] Enter OTP → Verify → Modal closes
- [ ] Badge changes to "✓ Verified"
- [ ] Dropdown shows verified status
- [ ] Disconnect wallet → Badge disappears
- [ ] Reconnect → No modal (already verified)
- [ ] Try to purchase without email → Blocked
- [ ] Click "Add Email" in dropdown → Modal opens
- [ ] Test button works (dev mode only)

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Security Features

1. **JWT Authentication** - Required for API calls
2. **OTP Expiration** - Codes expire after a set time
3. **Rate Limiting** - 60-second cooldown between sends
4. **Email Validation** - Must contain `@` symbol
5. **Code Validation** - Must be exactly 6 digits

## Future Enhancements

- [ ] Email change functionality
- [ ] Resend code counter/limit
- [ ] Toast notifications for success/error
- [ ] Remember device option
- [ ] Social login integration
- [ ] Email templates customization

## Support

For issues or questions:
- Check console logs for debugging
- Verify GraphQL endpoint is responding
- Check localStorage for JWT token
- Review network tab for API calls
