// Generates ElevenLabs narration audio + word-accurate captions for one or
// more named voices, so Remotion Studio's Composition Props panel can
// switch between whichever voices have been generated so far — with zero
// extra API calls for voices already on disk.
//
// ElevenLabs has no "re-voice this audio" API: every distinct voice is a
// separate TTS call. To avoid paying for voices you may never use, this
// script only generates voices you explicitly pass with --voice, and skips
// any (voice, scene) pair that's already on disk unless --force is given.
// Run it again later with a different --voice to add that voice without
// touching what's already generated.
//
// Usage:
//   node --env-file=.env --experimental-strip-types scripts/generate-narration.ts --voice Adam
//   node --env-file=.env --experimental-strip-types scripts/generate-narration.ts --voice Adam --voice Rachel
//
// Output layout:
//   public/voiceover/CodeToElectricity/<voiceId>/<sceneId>.mp3
//   src/data/generated-captions.json   (word-level Caption[] per voice per scene,
//                                        derived from ElevenLabs' own character
//                                        timestamps — not hand-typed)

// This script runs via Node's native TS stripping, which requires strict
// ESM resolution (explicit file extensions) incompatible with the
// project's bundler-style tsconfig — so it can't `import` from src/
// without breaking `tsc` there. NARRATION_SCRIPT below is a literal copy
// of src/data/narration.ts's export; keep the two in sync by hand if the
// script changes (it's the single source of truth — this is a read-only
// mirror for a script that reads it once, not a second place to edit it).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";

type SceneId =
  | "hook"
  | "code"
  | "binary"
  | "transistors"
  | "calculation"
  | "reveal"
  | "cta";

const NARRATION_SCRIPT: Record<SceneId, string> = {
  hook: "Wait, what actually happens here?",
  code: "Your code looks simple. Your computer sees none of that.",
  binary: "Every number becomes ones and zeros.",
  transistors: "Billions of tiny switches, flipping in nanoseconds.",
  calculation: "Logic gates do the math.",
  reveal: "That's it. That's electricity becoming an answer.",
  cta: "Follow for more of how things really work.",
};

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error(
    "ELEVENLABS_API_KEY is not set. Add it to .env (ELEVENLABS_API_KEY=...) first.",
  );
  process.exit(1);
}

// Name -> voice lookup happens against the account's actual voice library,
// never hardcoded IDs (premade voice IDs are account/library dependent).
const voiceArgs: string[] = [];
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === "--voice" && process.argv[i + 1]) {
    voiceArgs.push(process.argv[i + 1]);
  }
}
if (voiceArgs.length === 0) {
  console.error(
    "No --voice given. Example: --voice Adam (pass --voice multiple times for several voices).",
  );
  process.exit(1);
}
const REQUESTED_VOICE_NAMES = voiceArgs;

const FORCE = process.argv.includes("--force");

const OUTPUT_DIR = "public/voiceover/CodeToElectricity";
const CAPTIONS_OUTPUT = "src/data/generated-captions.json";

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

interface AlignmentResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

interface WordCaption {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: null;
}

const fetchVoices = async (): Promise<ElevenLabsVoice[]> => {
  const res = await fetch("https://api.elevenlabs.io/v2/voices?page_size=100", {
    headers: { "xi-api-key": API_KEY! },
  });
  if (!res.ok) {
    throw new Error(`Failed to list voices: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { voices: ElevenLabsVoice[] };
  return data.voices;
};

const resolveVoices = (
  all: ElevenLabsVoice[],
  names: string[],
): Record<string, string> => {
  const resolved: Record<string, string> = {};
  const missing: string[] = [];
  for (const name of names) {
    // Account voice names often look like "Adam - Dominant, Firm" — match
    // on the leading name segment (before " - ") case-insensitively.
    const match = all.find(
      (v) => v.name.split(" - ")[0].trim().toLowerCase() === name.toLowerCase(),
    );
    if (!match) {
      missing.push(name);
      continue;
    }
    resolved[name] = match.voice_id;
  }
  if (missing.length > 0) {
    throw new Error(
      `Voice(s) not found in your ElevenLabs account/library: ${missing.join(", ")}. ` +
        `Available: ${all.map((v) => v.name).join(", ")}`,
    );
  }
  return resolved;
};

// Splits ElevenLabs' character-level alignment into word-level Caption[]
// entries by grouping characters between whitespace boundaries. A word's
// startMs is its first character's start time; endMs is its last
// character's end time — both measured against the actual generated audio.
const alignmentToWordCaptions = (
  alignment: AlignmentResponse["alignment"],
): WordCaption[] => {
  const { characters, character_start_times_seconds, character_end_times_seconds } =
    alignment;

  const words: WordCaption[] = [];
  let current: { text: string; startMs: number; endMs: number } | null = null;

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    const startMs = character_start_times_seconds[i] * 1000;
    const endMs = character_end_times_seconds[i] * 1000;

    if (ch.trim() === "") {
      if (current) {
        words.push({
          text: current.text,
          startMs: current.startMs,
          endMs: current.endMs,
          timestampMs: (current.startMs + current.endMs) / 2,
          confidence: null,
        });
        current = null;
      }
      continue;
    }

    if (!current) {
      current = { text: ch, startMs, endMs };
    } else {
      current.text += ch;
      current.endMs = endMs;
    }
  }
  if (current) {
    words.push({
      text: current.text,
      startMs: current.startMs,
      endMs: current.endMs,
      timestampMs: (current.startMs + current.endMs) / 2,
      confidence: null,
    });
  }

  return words;
};

const generateOne = async (
  voiceName: string,
  voiceId: string,
  sceneId: SceneId,
  text: string,
): Promise<{ wordCaptions: WordCaption[]; durationSeconds: number }> => {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3 },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `TTS failed for ${voiceName}/${sceneId}: ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as AlignmentResponse;
  const audioBuffer = Buffer.from(data.audio_base64, "base64");

  const voiceDir = `${OUTPUT_DIR}/${voiceId}`;
  mkdirSync(voiceDir, { recursive: true });
  writeFileSync(`${voiceDir}/${sceneId}.mp3`, audioBuffer);

  const wordCaptions = alignmentToWordCaptions(data.alignment);
  const durationSeconds =
    data.alignment.character_end_times_seconds[
      data.alignment.character_end_times_seconds.length - 1
    ] ?? 0;

  return { wordCaptions, durationSeconds };
};

const main = async () => {
  console.log("Fetching voice library...");
  const allVoices = await fetchVoices();
  const voiceMap = resolveVoices(allVoices, REQUESTED_VOICE_NAMES);
  console.log(
    "Resolved voices:",
    Object.entries(voiceMap)
      .map(([n, id]) => `${n}=${id}`)
      .join(", "),
  );

  const existingCaptions: Record<string, Record<string, unknown>> = existsSync(
    CAPTIONS_OUTPUT,
  )
    ? JSON.parse(readFileSync(CAPTIONS_OUTPUT, "utf-8"))
    : {};

  const sceneIds = Object.keys(NARRATION_SCRIPT) as SceneId[];
  const report: { voice: string; scene: string; seconds: number }[] = [];

  for (const [voiceName, voiceId] of Object.entries(voiceMap)) {
    existingCaptions[voiceId] = existingCaptions[voiceId] ?? {};

    for (const sceneId of sceneIds) {
      const audioPath = `${OUTPUT_DIR}/${voiceId}/${sceneId}.mp3`;
      const alreadyDone =
        !FORCE && existsSync(audioPath) && existingCaptions[voiceId][sceneId];

      if (alreadyDone) {
        console.log(`Skip (exists): ${voiceName}/${sceneId}`);
        continue;
      }

      console.log(`Generating: ${voiceName}/${sceneId}...`);
      const { wordCaptions, durationSeconds } = await generateOne(
        voiceName,
        voiceId,
        sceneId,
        NARRATION_SCRIPT[sceneId],
      );
      existingCaptions[voiceId][sceneId] = wordCaptions;
      report.push({ voice: voiceName, scene: sceneId, seconds: durationSeconds });
    }
  }

  mkdirSync("src/data", { recursive: true });
  writeFileSync(CAPTIONS_OUTPUT, JSON.stringify(existingCaptions, null, 2));

  // Human-readable voice name -> id map so the composition props dropdown
  // can show names instead of raw IDs. Merge with whatever voices were
  // resolved in previous runs so adding one voice never drops another.
  const VOICE_MAP_PATH = "src/data/voice-map.json";
  const existingVoiceMap: Record<string, string> = existsSync(VOICE_MAP_PATH)
    ? JSON.parse(readFileSync(VOICE_MAP_PATH, "utf-8"))
    : {};
  const mergedVoiceMap = { ...existingVoiceMap, ...voiceMap };
  writeFileSync(VOICE_MAP_PATH, JSON.stringify(mergedVoiceMap, null, 2));

  console.log("\nDone. Generated/updated:");
  for (const r of report) {
    console.log(`  ${r.voice}/${r.scene}: ${r.seconds.toFixed(2)}s`);
  }
  if (report.length === 0) {
    console.log("  (nothing — all audio already existed; use --force to regenerate)");
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
