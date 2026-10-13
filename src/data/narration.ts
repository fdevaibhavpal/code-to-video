// The spoken script for each scene — the single source of truth for both
// the ElevenLabs narration audio and the on-screen captions. Captions are
// NOT hand-timed; scripts/generate-narration.ts sends this exact text to
// ElevenLabs, gets back character-level timestamps for the audio it
// generated, and derives src/data/captions.ts from those timestamps so the
// captions are provably in sync with what's actually spoken.
//
// Keep each line short enough to comfortably fit inside its scene's
// duration at a natural speaking pace (~14-15 characters/second).

import { SceneId } from "./scenes";

export const NARRATION_SCRIPT: Record<SceneId, string> = {
  hook: "Wait, what actually happens here?",
  code: "Your code looks simple. Your computer sees none of that.",
  binary: "Every number becomes ones and zeros.",
  transistors: "Billions of tiny switches, flipping in nanoseconds.",
  calculation: "Logic gates do the math.",
  reveal: "That's it. That's electricity becoming an answer.",
  cta: "Follow for more of how things really work.",
};
