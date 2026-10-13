import type { Caption } from "@remotion/captions";
import { staticFile } from "remotion";
import generatedCaptions from "./generated-captions.json";
import voiceMap from "./voice-map.json";
import { SceneId } from "./scenes";

// generated-captions.json / voice-map.json are written by
// scripts/generate-narration.ts. Shape: { [voiceId]: { [sceneId]: Caption[] } }
type GeneratedCaptions = Record<string, Partial<Record<SceneId, Caption[]>>>;

const CAPTIONS = generatedCaptions as GeneratedCaptions;
const VOICE_MAP: Record<string, string> = voiceMap;

export const DEFAULT_VOICE_NAME = "Adam";
export const DEFAULT_VOICE_ID = VOICE_MAP[DEFAULT_VOICE_NAME];

export const AVAILABLE_VOICE_NAMES = Object.keys(VOICE_MAP);

export interface SceneNarration {
  /** staticFile() path to the generated MP3, or null if not generated yet. */
  audioSrc: string | null;
  /** Word-level captions derived from ElevenLabs' own timestamps. */
  captions: Caption[];
}

// Resolves a scene's narration for the given voice. Falls back to an empty
// caption list and null audio if that (voice, scene) pair hasn't been
// generated yet — callers should treat narration as optional, never assume
// it exists (per the "don't claim narration unless an audio file is
// present" requirement).
export const getSceneNarration = (
  voiceId: string,
  sceneId: SceneId,
): SceneNarration => {
  const captions = CAPTIONS[voiceId]?.[sceneId] ?? [];
  const audioPath = `voiceover/CodeToElectricity/${voiceId}/${sceneId}.mp3`;
  const hasAudio = captions.length > 0;

  return {
    audioSrc: hasAudio ? staticFile(audioPath) : null,
    captions,
  };
};
