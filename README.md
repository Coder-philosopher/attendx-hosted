# SolanaPOP: Proof of Participation Tokens

A full-stack decentralized application (dApp) built on the Solana blockchain, implementing a Proof-of-Participation (POP) token system using Solana's ZK Compression primitives. The app features a gamified achievements system, event creation, QR code-based token claims, and a modern, animated UI.

---

## Features

- **Event Creation:** Organizers can create events with details (name, description, date, max attendees).
- **Compressed Token Minting:** Uses Solana ZK Compression for gas-efficient NFT creation.
- **QR Code Generation:** Each event gets a unique QR code for attendees to claim tokens.
- **Wallet Integration:** Connect with Phantom wallet for Solana blockchain interactions.
- **Token Collection:** Users can view all their collected participation tokens.
- **Achievements & Gamification:** Earn badges and level up by creating/attending events, with animated, visually rich UI.
- **Persistent Storage:** All event, token, and achievement data is stored in MongoDB.
- **Modern UI:** Built with shadcn/ui, Tailwind CSS, Framer Motion, and Lucide icons for a beautiful, responsive experience.

## Technology Stack

### Frontend

- React (TypeScript)
- TanStack Query (data fetching/caching)
- shadcn/ui + Tailwind CSS (UI)
- Framer Motion (animations)
- Lucide React (icons)
- Wouter (routing)
- Vite (bundler)

### Backend

- Express.js (API server)
- MongoDB (data persistence)
- Mongoose (ODM)
- Drizzle ORM + Zod (schema validation)
- WebSockets (real-time updates)

### Blockchain

- Solana Web3.js (blockchain interactions)
- Solana Wallet Adapter (wallet connection)
- Helius API (ZK Compression)

## Project Structure

```
/
├── client/                # Frontend React app
│   ├── public/achievements/   # SVG badge images for achievements
│   └── src/
│       ├── components/    # UI components (UserAchievements, Navbar, etc.)
│       ├── pages/         # Main pages (Achievements, EventSuccess, etc.)
│       ├── lib/           # Utility functions and API clients
│       ├── providers/     # React context providers
│       ├── hooks/         # Custom React hooks
│       └── index.css      # Tailwind and global styles
├── server/                # Backend Express server
│   ├── mongodb-achievements.ts # Achievements schema and logic
│   ├── achievement-service.ts  # Achievement business logic
│   ├── routes.ts          # API routes
│   └── ...                # Other backend files
├── shared/                # Shared code (types, schemas)
│   └── schema.ts
├── public/                # Static assets (served at root)
│   └── achievements/      # SVG badge images
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 20.x or later
- MongoDB instance (local or remote)
- Phantom wallet browser extension
- Helius API key (for ZK Compression)

### Environment Variables

Create a `.env` file in the root with:

```
MONGODB_URI=mongodb://localhost:27017/solanapop
HELIUS_API_KEY=your_helius_api_key
DATABASE_URL=your_postgres_url (optional, for Drizzle)
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Ensure MongoDB is running and accessible via `MONGODB_URI`.
   - The app will auto-initialize default achievements and collections on first run.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will start both the backend and frontend in development mode.

## Usage Flow

### For Event Creators

1. Connect your Solana wallet.
2. Go to the "Create Event" page.
3. Fill in event details and submit.
4. A compressed NFT is minted for your event.
5. Share the event's QR code with attendees.

### For Event Attendees

1. Connect your Solana wallet.
2. Scan the event's QR code.
3. Approve the transaction to claim your token.
4. View your tokens and achievements in the "My Tokens" and "Achievements" pages.

## Achievements & Badges

- Achievements are defined in `server/mongodb-achievements.ts` and include a `badgeImageUrl` (e.g., `/achievements/event-streak.svg`).
- SVG badge images are stored in `client/public/achievements/` and are referenced directly by the frontend.
- The frontend displays badges using the path from MongoDB, ensuring images are visible as long as the SVG exists in the public directory.

## Customization & Extension

- **Adding Achievements:**  
  Add new achievement objects to the `defaultAchievements` array in `server/mongodb-achievements.ts` and place the corresponding SVG in `client/public/achievements/`.
- **UI Customization:**  
  Modify or extend components in `client/src/components/` and pages in `client/src/pages/`. The UI uses shadcn/ui, Tailwind, and Framer Motion for easy customization.
- **Blockchain Network:**  
  The app connects to Solana devnet by default. To use mainnet, update the network config in your Solana connection logic.

## Deployment

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```
2. **Build the backend:**
   ```bash
   npm run build
   ```
3. **Start in production:**
   ```bash
   npm start
   ```

## Troubleshooting

- **Achievement Images Not Visible:**  
  Ensure the SVG files exist in `client/public/achievements/` and the `badgeImageUrl` in MongoDB matches the filename (e.g., `/achievements/event-streak.svg`).
- **MongoDB Connection Issues:**  
  Check your `MONGODB_URI` and ensure MongoDB is running.
- **Wallet/Blockchain Issues:**  
  Make sure Phantom wallet is installed and connected, and your Helius API key is valid.

## License

MIT

## Acknowledgments

- Solana Foundation
- Helius API
- shadcn/ui
- Lucide Icons
- Framer Motion

## ⚠️ Demo Mode Notice & Switching to Mainnet

**Security Notice:**
> This application is currently running in demo mode. All blockchain transactions are simulated or use Solana's devnet for security and cost reasons during development and public demos. No real assets or tokens are transferred on the mainnet by default.

**How to enable real blockchain (mainnet) mode:**
1. **Switch the Solana network endpoint** from devnet to mainnet-beta in your Solana connection configuration (e.g., change `https://api.devnet.solana.com` to `https://api.mainnet-beta.solana.com`).
2. **Update your wallet adapter configuration** to use mainnet-beta.
3. **Ensure your Helius API key** (if used) is enabled for mainnet.
4. **Check all environment variables** and remove any testnet/devnet URLs or keys.
5. **Update any hardcoded program IDs or token mints** to their mainnet equivalents.
6. **Disable demo/simulated transaction logic** in your codebase.
7. **Test thoroughly** with real wallets and small amounts of SOL/tokens before going live.

*With these changes, your app will interact with the real Solana blockchain and handle real assets. Always review your code and configuration for security before deploying to mainnet!*

---

Made by [Abdullah](https://x.com/abds_dev)