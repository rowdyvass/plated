# Plated - Development Guide

## Project Overview

Plated is a zen-like fine dining plating game where players use gestures to artfully arrange ingredients on plates and earn Michelin stars. The game combines the precision of culinary arts with relaxing, meditative gameplay.

### Tech Stack
- **React 19** - UI framework
- **PixiJS 8** - 2D WebGL rendering for gameplay
- **Howler.js** - Audio management
- **Zustand** - State management (bridges React UI and PixiJS game)
- **Framer Motion** - UI animations and transitions
- **React Router** - Navigation
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Type check with TypeScript
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, StarRating)
│   └── navigation/   # Navigation components (Header, BackButton)
├── game/
│   ├── core/         # Game.ts (main game class), Renderer.ts (PixiJS setup)
│   ├── entities/     # Plate.ts, Ingredient.ts (PixiJS containers)
│   ├── gestures/     # GestureRecognizer.ts for touch/mouse input
│   └── scoring/      # ScoreCalculator.ts for Michelin star ratings
├── audio/            # AudioManager.ts (Howler.js wrapper)
├── data/
│   ├── restaurants/  # Restaurant definitions and unlocks
│   ├── dishes/       # Dish recipes and target platings
│   └── themes/       # Color themes and design tokens
├── stores/           # Zustand stores (gameStore, progressStore)
├── screens/          # Full page components (TitleScreen, GameScreen)
├── hooks/            # Custom React hooks (useGame)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## Architecture

### React + PixiJS Integration
- **React** handles all UI: menus, buttons, overlays, scoring displays
- **PixiJS** handles gameplay: plate rendering, ingredient sprites, gestures
- **Zustand** bridges them: game state accessible from both React components and PixiJS classes

### Game Entities (PixiJS)
All game entities extend `PIXI.Container`:
```typescript
class Plate extends Container {
  // Renders circular plate with rim and shadow
}

class IngredientEntity extends Container {
  // Sprite-based ingredient with transform controls
}
```

### State Management
```typescript
// Game state (current session)
useGameStore: GameState, placedIngredients, score

// Player progress (persisted)
useProgressStore: totalStars, completedDishes, unlockedRestaurants
```

## Code Style

- **TypeScript strict mode** - No implicit any, strict null checks
- **Functional React components** - Use hooks, no class components
- **PixiJS entities** - Extend Container, implement destroy() for cleanup
- **Zustand stores** - Keep actions in the store, selectors for derived state

## Design Tokens

### Colors (L'Institut Theme)
- Background: `#FFFEFA` (foundation.100)
- Cards: `#FAF6F1` (foundation.200)
- Accent: `#B87333` (copper)
- Gold Stars: `#D4AF37`

### Typography
- Display: Cormorant Garamond (titles, headings)
- Body: Inter (UI text, buttons)

## Key Concepts

### Gestures
- `place` - Tap to place ingredient
- `swipe` - Quick directional movement (sauce streaks)
- `dot` - Short tap (sauce dots)
- `drizzle` - Slow curved movement (drizzle patterns)
- `pinch` - Scale ingredients
- `rotate` - Rotate ingredients

### Scoring (0-100, maps to 0-3 stars)
- Composition (35%) - Match target placement
- Balance (25%) - Visual weight distribution
- Technique (25%) - Gesture variety and execution
- Creativity (15%) - Intentional deviations

### Star Ratings
- 0 stars: < 50 points
- 1 star: 50-69 points
- 2 stars: 70-89 points
- 3 stars: 90+ points
