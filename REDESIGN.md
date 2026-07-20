# Plated — Game Review & Rebuild Proposal

*A ground-up review of the current build (played + code-audited), followed by a concrete plan for
rebuilding the gameplay and graphics.*

---

## Part 1 — Honest review of what exists today

### What's actually good (worth keeping)

- **The dish/lesson data is real and thoughtful.** 8 lessons + a final exam with hand-placed,
  normalized target platings and graduated scoring zones (`src/data/dishes/`). Lesson 7's duck —
  jus path, three-point duck row, tweezed micro-greens, rotated flowers — is a genuinely composed
  plate, not placeholder data. The chef quotes and L'Institut framing have charm.
- **The best SVG ingredient art is above-amateur.** `DuckBreast`, `EggYolk`, `Quenelle`,
  `SwooshTrail` have layered gradients, specular highlights, and texture strokes.
- **PixiJS 8 is real and load-bearing.** A true WebGL canvas renders the plate; the sauce renderer
  does tapered-quad strokes with path smoothing; the particle system has actual physics
  (velocity, friction, settle detection); the quenelle renderer draws a real three-sided bezier form.
- **The gesture *detection* scaffolding is sophisticated** — drizzle break-detection, quenelle
  pause/velocity recognition, scatter containment scoring against settled particles.

### The core problem, in one playthrough

Dragging a single butter pat onto a dashed zone covering half the plate produced
**100/100, three Michelin stars, and all three breakdown bars at 100** — in six seconds.
That one moment contains every design problem in the game:

1. **The score is a single number wearing three costumes.** `gameStore.completeDish`
   (`src/stores/gameStore.ts:174-196`) sets `finalScore = precision`, sets
   `technique = precision` (the comment admits "Will be gesture-based later"), and computes
   tempo but excludes it from the score. The entire sophisticated scoring layer —
   `ScoreCalculator.calculateFinalScore` (weighted 50/30/20 + flow bonus), the whole
   `TechniqueScorer` class, the whole `FlowTracker` class — is **dead code, never called**.
   The results screen's breakdown is theater.
2. **The gameplay is tracing, not plating.** Ghost outlines show exactly where every element
   goes. There is no composition decision, ever. The "zen plating" fantasy is actually
   "drag the shape onto the dashed shape," N times, auto-advancing even on a "Missed."
3. **You cannot meaningfully fail.** The only loss state is a generous timer (30s for one
   butter pat). Bad placements score 0 and advance anyway. No tension, no skill gate, no reason
   to retry except star count.
4. **Two of eight gestures are broken at runtime.** `tweeze` has no manager and no GameScreen
   wiring — tweeze ingredients are *silently skipped* (lesson 7, final exam). `dust` is fully
   implemented (`DustManager`, `DustGesture`) but never invoked; dust ingredients fall through
   to `place` and mis-score against a zone target with no `.position`. The intended difficulty
   peak — lessons 7, 8, and the final — is mechanically hollow.
5. **Feedback teaches nothing.** Every scorer computes rich `penalties[]` arrays; the player
   sees a one-word toast ("Good.", "Missed.") and can never learn *why*.

### Why the graphics read as flat

1. **A pale plate on a pale void.** Flat `#FFFEFA` background, flat near-white plate
   (`Plate.ts` — five flat circles and a faint offset shadow). No table, no linen, no wood, no
   vignette, no light source, no shadow under food. Environment is the single biggest gap —
   fine-dining is *all* about the shot, and there is no shot.
2. **The nice art barely appears in-game.** Four parallel art pipelines render the same
   ingredient differently: detailed SVGs (tray), a ~470-line legacy CSS-gradient switch-case
   (`IngredientVisual.tsx`), flat single-path silhouettes (drag/ghost — the states you stare at
   while aiming are the *ugliest*), and procedural Pixi fills (what actually lands on the
   plate). Scattered peas are literally **tinted white squares** (`ParticleSystem.ts:143`
   admits it: "use a placeholder white texture"). The drag preview is a flat colored `div`.
3. **No materials.** Everything is flat vector fill with at most one white specular dot. No
   gloss on sauces, no soft shadows, no blur, no blend modes, no per-instance variation —
   three duck slices look stamped, not plated.
4. **Silence.** Zero audio assets exist. Every sound is a Web Audio oscillator beep; Howler is
   installed and never used. Synth beeps undercut the zen positioning completely.

### Architecture (why iteration stalled)

- `GameScreen.tsx` is a **1,276-line god component** with six copy-pasted per-gesture state
  machines and six duplicated "record score → advance → complete" blocks. Any loop change =
  six edits.
- Dual sources of truth (store `placedElements` vs. Pixi managers' `placedVisuals`), manual
  canvas `pointer-events` toggling to arbitrate input, a clean `useGame` hook that exists but
  is ignored, three disagreeing star-threshold tables (store: 85/70/55, ScoreCalculator:
  90/70/50, CLAUDE.md: a third model).
- Verdict: the codebase was scoped like a real game and wired like a demo. The most
  interesting 40% of the code never runs.

---

## Part 2 — The rebuild

### The design pivot: from *tracing* to *composing*

The single highest-leverage change is not graphical. The game currently asks "can you hit the
dashed outline?" A plating game should ask **"can you make this beautiful?"** Everything below
follows from that pivot.

**New core loop:**

1. **Brief** — the chef gives you a dish: components, a plateware choice, and 2–3 constraints
   ("sauce first", "odd numbers", "leave a third of the plate empty"). No ghost outlines.
2. **Plate** — you compose freely using the gesture toolkit. The medium itself is where the
   skill lives (see *physicality* below).
3. **The Pass** — the finished plate gets a beauty shot (camera move, light sweep), then a
   **critique**: a multi-dimensional score computed from real composition analysis, plus a
   written chef's note pointing at specific elements ("the quenelle crowds the sole — give it
   air"). Every plate is *the player's own*, which makes it screenshottable and shareable —
   the retention loop the current game doesn't have.

**Scoring that's real this time** — compute it from the plate model (all of this is
implementable, deterministic geometry):

| Dimension | How it's actually measured |
|---|---|
| Composition | Rule-of-thirds / focal-point placement, odd-count groupings, height variation |
| Balance | Visual-weight centroid vs. plate center; color-mass distribution |
| Negative space | % clean plate, largest empty region, rim violations |
| Technique | Per-gesture execution quality (the existing scorers, finally plugged in) |
| Adherence | Did you satisfy the brief's constraints |

An optional **AI chef critic** is now cheap and genuinely good: serialize the plate model +
final render, have a vision-capable model write the flavor-text critique in Chef Margaux's
voice. Keep the *score* deterministic (fair, replayable); use the LLM only for the prose.
This is the "AI models are way better now" dividend applied where it belongs.

**Difficulty and tension** (currently absent):

- **Tutorial mode** keeps guided targets — that's what the current game *is*, demoted to
  onboarding.
- **Service mode** — tickets arrive, plates ramp, time pressure is per-ticket not per-dish.
  Sloppy plates get sent back. This is the "game" game.
- **Zen mode** — untimed free plating, the meditative promise actually kept.
- **Daily dish** — same brief for everyone, global gallery + score. Cheap to build once the
  plate model is serializable.
- **Critic visits** as boss encounters: stricter thresholds, one attempt, the Michelin stakes
  the theme already promises.

### Make the medium physical

The second gameplay pillar: ingredients should *behave*, because continuous physical response
is what makes gestures skill-based instead of pass/fail:

- **Sauce as fluid** — stamp brush splats into a Pixi `RenderTexture`, gaussian + threshold
  (classic metaball technique) for organic pooling edges, plus a gloss shader. Speed controls
  width; stopping creates pooling; tilting a swoosh actually feathers it. All achievable in
  Pixi 8 with one custom filter.
- **Quenelle** keeps its pause-and-release recognition but the shape *forms* from your motion
  quality — a shaky arc yields a lumpy quenelle you can see.
- **Tweezers** — micro-placement with magnified view and hand-tremble, the surgeon-game
  tension moment. (Currently the gesture exists and is silently skipped.)
- **Powders/dust** — the existing `DustEmitter` is already good; wire it up and drive density
  from gesture height/speed.
- Placement gets weight: a landed protein settles with a soft squash, displaces sauce at its
  boundary, and casts a contact shadow.

### Graphics: one pipeline, lit like food photography

Recommendation: **stay 2D in Pixi 8** — the game reads top-down anyway — but light it and
dress it. A 3D engine swap (three.js) would cost months and buy little for an overhead camera.

1. **One art pipeline.** Everything visible in play renders on the Pixi canvas from one asset
   source. Delete the legacy CSS art, the flat silhouettes, and the DOM drag preview. The thing
   under your finger while aiming should be the *best* version of the asset, not the worst.
2. **Environment first.** Wood/linen table surface, soft radial light pool centered on the
   plate, gentle vignette, plate with real ceramic gradient + rim shadow + ambient occlusion
   under every placed element. This is days of work and transforms every screenshot more than
   any other single investment.
3. **AI-generated painterly assets.** This is the other half of the "models are better now"
   dividend: generate high-res, style-consistent overhead ingredient renders (several variants
   per ingredient for natural repetition), plate ceramics, and table textures. Alpha-cut them
   into sprite sheets. The current SVG components become style references / fallbacks. Add
   per-instance rotation/scale/tint jitter so nothing looks stamped.
4. **Material pass.** Sauce gloss + wet specular tied to a consistent light direction,
   soft drop shadows (Pixi filters), steam wisps on hot proteins, chilled sheen on sorbet.
5. **Juice.** Placement thump with 2-frame camera dip, sauce settle animation, star reveal with
   light rays at the pass, plate-rotate inspection before serving.
6. **Real audio.** Ambient restaurant/kitchen bed, per-material foley (ceramic, sauce, tweezer
   click), one soft adaptive music layer that thins out while you're mid-gesture. Howler is
   already installed; give it actual files (licensed packs or AI-generated foley).

### Architecture for the rebuild

Keep: React shell, Zustand stores, routing, the dish-data *format*, the L'Institut content and
its unlock chain, Pixi 8.

Rebuild the game layer around one idea — **the plate is data**:

```
PlateModel (pure data: elements, transforms, sauce strokes, timestamps)
   ├── Renderer draws it        (Pixi scene = f(model) — one pipeline)
   ├── Judge scores it          (composition/balance/space/technique from geometry)
   ├── Serializer saves it      (undo, replay, share, daily-dish gallery, AI critique)
   └── GestureController mutates it (ONE state machine, data-driven per-gesture config)
```

- One `GestureController` state machine replaces the six copy-pasted `useState` machines; the
  "record → advance → complete" logic exists exactly once.
- The scoring pipeline is unified: gesture scorers feed Technique; the judge computes the rest
  from the model; one star table.
- React renders UI from the store; it never touches Pixi objects; input goes to one router
  that dispatches by the active tool. The `pointer-events` toggling hack disappears.

### Roadmap (feel first, content last)

1. **Phase 1 — Feel prototype (the bet).** One dish (Sole Meunière), no scoring: new plate +
   environment + lighting, fluid sauce, physical placement, real foley. If plating doesn't feel
   *good* here, nothing else matters. This is also where AI-generated assets get validated.
2. **Phase 2 — The Judge.** Plate model + composition scoring + the critique screen (heatmap
   overlay + per-element notes). Free-plating one dish end-to-end with a real grade.
3. **Phase 3 — Structure.** Port the 8 lessons as tutorial mode (fixing tweeze/dust for real),
   add Service mode and Zen mode, wire the progression to the unified score.
4. **Phase 4 — Retention.** Daily dish + shareable plate cards, AI critic prose, second
   restaurant (the `copenhagen` unlock already stubbed in the progress store — a Noma-style
   foraged aesthetic would contrast beautifully with L'Institut's classicism).

### If you keep only three things from this document

1. **Kill the ghost outlines outside the tutorial** — score composition, not tracing.
2. **Make sauce a fluid and give food shadows** — physicality + lighting is 80% of "drastically
   better" for both gameplay and graphics.
3. **Rebuild the game layer around a serializable PlateModel** — every future feature (undo,
   critique, sharing, daily challenges, AI judge) falls out of that one decision.
