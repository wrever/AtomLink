# AtomLink Frontend | Mining Lands Tokenization Platform

> **Land Tokenization on Stellar Network**  
> *Transforming mining lands and mineral-rich territories into tradable digital tokens*

[![Stellar Network](https://img.shields.io/badge/Stellar-Network-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-FF6B35?style=for-the-badge)](https://soroban.stellar.org)

---

## 🏔️ Project Overview

AtomLink is a **next-generation land tokenization platform** that democratizes access to high-value mining lands through blockchain technology. Built on Stellar Network with Soroban smart contracts, it enables fractional ownership of previously inaccessible lands.

### Key Features
- **Mining Lands Focus**: Specialized in mineral-rich territories and mining assets
- **Fractional Ownership**: Buy as little as 1 token ($100) instead of $100K+
- **Real-time Trading**: Trade tokens 24/7 on Stellar Network
- **Ultra-low Fees**: 0.1% vs 5-10% traditional costs
- **Global Access**: Invest in mining lands from anywhere

---

## 🛠️ Technology Stack

### Frontend Architecture
```typescript
React 18 + TypeScript + Vite
├── Tailwind CSS (Modern UI/UX)
├── Framer Motion (Smooth Animations)
├── Stellar SDK (Blockchain Integration)
├── Stellar Wallets Kit (Wallet Connection)
└── SweetAlert2 (User Experience)
```

### Key Dependencies
```json
{
  "@stellar/stellar-sdk": "^12.0.0",
  "@creit.tech/stellar-wallets-kit": "^1.0.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "framer-motion": "^11.0.0"
}
```

### Smart Contracts
- **Simple Token Contract**: Deployed on Stellar Testnet
- **Token Details**: 5 XLM per token, 100,000 max supply
- **Functions**: `buy_tokens`, `get_balance`, `transfer`

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
Stellar Testnet Account
```

### Installation
```bash
# Clone the repository
git clone https://github.com/wrever/AtomLink.git
cd AtomLink/atom

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
```bash
# Create .env file
VITE_BACKEND_URL=https://atomlink.pro/backend/api
VITE_STELLAR_NETWORK=testnet
VITE_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE
```

---

## 🎯 Core Functionality

### 1. Wallet Integration
- **Stellar Wallets Kit**: Connect Freighter, Albedo, Rabet wallets
- **Account Management**: View balance and transaction history
- **Secure Signing**: Transaction signing with user's private key

### 2. Token Purchase Flow
- **Smart Contract Interaction**: Direct calls to Soroban contracts
- **Real-time Pricing**: Dynamic token pricing based on market
- **Transaction Simulation**: Pre-validate transactions before signing
- **Instant Confirmation**: Immediate feedback on successful purchases

### 3. Portfolio Management
- **Asset Dashboard**: View all tokenized mining lands
- **Balance Tracking**: Real-time token balances
- **Transaction History**: Complete audit trail
- **Performance Metrics**: ROI and investment analytics

### 4. User Experience
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion for fluid interactions
- **Error Handling**: Comprehensive error messages and recovery
- **Loading States**: Clear feedback during blockchain operations

---

## 📱 Demo Scenarios

### Scenario 1: Mining Land Tokenization
1. **Mining Company** submits $2M lithium mine for tokenization
2. **Admin reviews** documentation and approves
3. **Smart contract deploys** 10,000 tokens at $200 each
4. **Investors buy** fractional shares starting at $200
5. **Real-time trading** begins on marketplace

### Scenario 2: Fractional Investment
1. **Retail Investor** connects wallet
2. **Browses available** mining lands
3. **Purchases 5 tokens** for $1,000 total
4. **Receives instant** ownership confirmation
5. **Trades tokens** on secondary market

---

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── WalletButton.tsx
│   └── WalletInstructions.tsx
├── contexts/           # React contexts
│   └── StellarContext.tsx
├── contracts/          # Smart contract integration
│   └── stellarConfig.ts
├── pages/             # Main application pages
│   ├── Home.tsx
│   └── TerrenoDetalles.tsx
└── types/             # TypeScript type definitions
```

### Key Components
- **StellarContext**: Manages wallet connection and blockchain state
- **WalletButton**: Handles wallet connection/disconnection
- **TerrenoDetalles**: Main token purchase interface
- **Home**: Landing page with mining lands focus

### Smart Contract Integration
```typescript
// Example: Buying tokens
const result = await buyTokensSafely(
  contract,
  amount,
  pricePerToken,
  landId,
  buyerAddress
);
```

---

## 🌐 Live Demo

**Demo URL**: [https://atomlink.pro](https://atomlink.pro)

### Features to Test
1. **Connect Wallet**: Use Freighter or Albedo wallet
2. **Browse Mining Lands**: View available tokenized assets
3. **Purchase Tokens**: Buy fractional ownership
4. **View Portfolio**: Track your investments
5. **Trade Tokens**: Secondary market trading

---

## 📊 Technical Metrics

- **Transaction Speed**: <3 seconds
- **Transaction Cost**: <$0.01 (Stellar Network)
- **Load Time**: <2 seconds
- **Mobile Responsive**: 100% compatible
- **Browser Support**: Chrome, Firefox, Safari, Edge

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** for the amazing blockchain infrastructure
- **Meridian 2025 Hackathon** organizers for this incredible opportunity
- **Open Source Community** for the tools and libraries that made this possible

---

<div align="center">

### Ready to Transform Mining Lands into Digital Assets?

[![Demo](https://img.shields.io/badge/Live_Demo-View_Now-38BDF8?style=for-the-badge&logo=rocket)](https://atomlink.pro)
[![GitHub](https://img.shields.io/badge/GitHub-View_Code-181717?style=for-the-badge&logo=github)](https://github.com/wrever/AtomLink)
[![Stellar](https://img.shields.io/badge/Stellar-Network-7D00FF?style=for-the-badge&logo=stellar)](https://stellar.org)

**Built for Meridian 2025 Hackathon**

</div>
