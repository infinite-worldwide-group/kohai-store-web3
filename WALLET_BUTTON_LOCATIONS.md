# 🎯 Wallet Button Locations

## Top-Right Corner on Every Page!

The wallet button appears in the **top-right corner** of your header on all pages. Here's exactly where you'll see it:

---

## 📍 Standard Header Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                        [Search]  [Connect Wallet] 👈    │
└─────────────────────────────────────────────────────────────────┘
```

### Files Modified:
- `src/components/User/Header/index.tsx`

### When Connected:
```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                    [Search]  [🟢 0x1234...5678] 👈      │
└─────────────────────────────────────────────────────────────────┘
```

Click the wallet address to see dropdown:
```
┌─────────────────────────────────────────┐
│ Wallet Address                           │
│ 0x1234...5678abcd                        │
│                                          │
│ Balance                                  │
│ 1.2345 SOL                               │
│                                          │
│ [📋 Copy Address]                        │
│ [🔌 Disconnect]                          │
└─────────────────────────────────────────┘
```

---

## 📍 Premium Header Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        [Logo Center]                             │
│                                                                  │
│              [Search]  [Connect Wallet] [🔍]   👈               │
└─────────────────────────────────────────────────────────────────┘
```

### Files Modified:
- `src/components/Premium/Header/index.tsx`

### Features:
- Shows next to search icon on mobile
- Always visible on all screen sizes
- Same dropdown functionality

---

## 📍 Purchase Form Integration

When user selects a package:

### Before Connection:
```
┌─────────────────────────────────────────┐
│  💳 Payment with Wallet                  │
│                                          │
│  Connect your wallet to pay with crypto │
│                                          │
│  [🔗 Connect Wallet to Pay]              │
└─────────────────────────────────────────┘
```

### After Connection:
```
┌─────────────────────────────────────────┐
│  💳 Payment with Wallet                  │
│                                          │
│  Wallet connected: 0x12...5678           │
│                                          │
│  [💰 Pay 0.1 SOL]                        │
│                                          │
│  ──────────────────────                 │
│  Or for testing:                         │
│  [🧪 Simulate Payment (Demo Mode)]       │
└─────────────────────────────────────────┘
```

### After Payment:
```
┌─────────────────────────────────────────┐
│  Transaction Signature                   │
│  [txn_abc123def456...] ✅                │
│                                          │
│  [Create Order]                          │
└─────────────────────────────────────────┘
```

---

## 🎨 Button States

### State 1: Not Connected
```css
🔗 Connect Wallet
```
- Blue-purple gradient
- Hover effect
- Click opens Reown modal

### State 2: Connecting
```css
⏳ Connecting...
```
- Spinner animation
- Disabled state
- Modal is open

### State 3: Connected
```css
🟢 0x1234...5678
```
- Green dot (animated pulse)
- Wallet icon
- Shortened address
- Click opens dropdown

### State 4: Dropdown Open
```
┌──────────────────────────┐
│ Wallet Address            │
│ 0x123...5678              │
│                          │
│ Balance                   │
│ 1.2345 SOL                │
│                          │
│ [📋 Copy Address]         │
│ [🔌 Disconnect]           │
└──────────────────────────┘
```

---

## 📱 Mobile Responsive

### Mobile View (< 640px):
```
┌─────────────────────────┐
│ [Logo]  [Connect] [🔍]  │
└─────────────────────────┘
```
- Hides "Wallet" text
- Shows only icon on very small screens
- Full functionality preserved

### Tablet View (640px - 768px):
```
┌────────────────────────────────────┐
│ [Logo]  [Search]  [Connect Wallet] │
└────────────────────────────────────┘
```

### Desktop View (> 768px):
```
┌─────────────────────────────────────────────┐
│ [Logo]       [Search]    [Connect Wallet]   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Where Users Click

### Header (Every Page):
1. **Connect Wallet** button → Opens Reown modal
2. **Wallet Address** (when connected) → Opens dropdown
3. **Copy Address** (in dropdown) → Copies to clipboard
4. **Disconnect** (in dropdown) → Disconnects wallet

### Product Page:
1. **Connect Wallet to Pay** → Opens Reown modal
2. **Pay [amount] SOL** → Opens wallet for approval
3. **Simulate Payment** → Fills fake signature (testing)

---

## 🔄 User Journey

```
Page Load
  ↓
See "Connect Wallet" button (top-right)
  ↓
Click button
  ↓
Reown modal opens
  ↓
Select wallet (Phantom, Solflare, etc.)
  ↓
Approve in wallet app
  ↓
Connected! ✅
  ↓
Button shows wallet address (0x12...56)
  ↓
User navigates to different pages
  ↓
Wallet stays connected! 🎉
  ↓
On product page: Can pay with wallet
  ↓
Click "Pay [amount] SOL"
  ↓
Wallet prompts for payment
  ↓
User approves
  ↓
Transaction signature auto-filled
  ↓
Order created! 🎊
```

---

## 💡 Pro Tips

1. **Persistent Connection**: Once connected, wallet stays connected across all pages until user disconnects or closes browser

2. **Mobile Support**: On mobile, tapping "Connect Wallet" will open the wallet app directly (no QR code needed)

3. **Balance Display**: Hover or click wallet address to see current SOL balance

4. **Quick Copy**: Click "Copy Address" to instantly copy wallet address to clipboard

5. **Test Mode**: Use "Simulate Payment" to test without real blockchain transactions

---

## 🎬 Quick Start

1. **Install dependencies**:
   ```bash
   npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps
   ```

2. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_MERCHANT_WALLET=your_wallet_address
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

4. **Look top-right** → See the wallet button!

---

## ✨ Visual Summary

```
Every Page Header:
┌────────────────────────────────────────────────┐
│                                    [Wallet] 👈  │
└────────────────────────────────────────────────┘
                                         ↑
                                    Always here!
                                    Click to connect!
```

**Share your Reown Project ID and let's get this working!** 🚀
