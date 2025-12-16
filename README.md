# Tower Defense Game

A highly engaging tower defense game built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multiple Tower Types**: Choose from 4 different tower types, each with unique stats:
  - Basic Tower: Balanced stats for general defense
  - Sniper Tower: Long-range with high damage but slow fire rate
  - Cannon Tower: Heavy hitting with moderate range
  - Laser Tower: Rapid fire with continuous damage

- **Enemy Variety**: Fight against 4 enemy types:
  - Basic: Standard enemy
  - Fast: Quick but weak
  - Tank: Slow but very high health
  - Boss: Extremely tough with high rewards

- **Wave System**: Progressively challenging waves with increasing difficulty
- **Strategic Gameplay**: Plan your tower placement on a winding path
- **Real-time Action**: Smooth animations and projectile physics
- **Score Tracking**: Compete for high scores

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd tower_defense
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## How to Play

1. **Start the Game**: The game begins automatically with Wave 1
2. **Place Towers**:
   - Click on a tower type in the shop (if you have enough gold)
   - Click on a green buildable tile to place the tower
   - You cannot place towers on the brown path
3. **Defend Your Base**:
   - Enemies spawn and follow the path
   - Towers automatically shoot at enemies in range
   - Destroy enemies before they reach the end
4. **Earn Gold**: Defeating enemies earns gold to buy more towers
5. **Survive Waves**: Complete waves to progress to harder challenges
6. **Game Over**: The game ends when your health reaches zero

## Game Controls

- **Mouse Click**: Select and place towers
- **Pause Button**: Pause/resume the game
- **Restart Button**: Start a new game

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas for game rendering
- **State Management**: React Hooks (useState, useEffect, useCallback)

## Deployment

### Deploy to Vercel

The easiest way to deploy this game is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Your game will be live in minutes!

Alternatively, using the Vercel CLI:

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

## Project Structure

\`\`\`
tower_defense/
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components
│   ├── Game.tsx         # Main game component
│   ├── GameCanvas.tsx   # Canvas rendering
│   └── GameUI.tsx       # UI components
├── lib/                 # Game logic
│   ├── constants.ts     # Game constants and config
│   └── gameUtils.ts     # Utility functions
└── types/              # TypeScript types
    └── game.ts         # Game type definitions
\`\`\`

## License

MIT
