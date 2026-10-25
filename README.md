# Lottie animations

Hand-authored Lottie JSON (Bodymovin format v5.7.4), shape layers only: no images, no expressions, no fonts. They render with the **light SVG player** (`lottie-web/build/player/lottie_light`). Colours come from the design tokens.

| File | Size | Frames @30fps | Loop | Use |
|---|---|---|---|---|
| `success-check.json` | 120 × 120 | 36 | No | Toast after the server confirms a reply was saved |
| `saving-dots.json` | 60 × 20 | 36 | Yes | Pending write in the top bar and choice panel |
| `call-pulse.json` | 120 × 120 | 60 | Yes | Rings around the next client's portrait while a call is waiting |
| `badge-burst.json` | 260 × 260 | 42 | No | Ring and rays behind a newly earned badge |
| `confetti.json` | 360 × 360 | 75 | No | One-shot shower over the badge hero |
| `xp-spark.json` | 48 × 48 | 30 | No | Sparkle next to the XP gained |

Rules: decorative only (`aria-hidden="true"`), never the only carrier of meaning; respect `prefers-reduced-motion` (see `docs/09_FRONTEND_SPEC.md` §7). To edit visually, import into LottieFiles or After Effects (Bodymovin); keep the canvas sizes so layouts don't shift.

The prototype embeds these same files in `design/prototype/animations.js` so it works from `file://`. Regenerate that file if you change the JSON.
