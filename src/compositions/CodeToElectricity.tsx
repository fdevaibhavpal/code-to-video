import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { TRANSITION_FRAMES, SCENES } from "../data/scenes";
import { DEFAULT_VOICE_ID } from "../data/useNarration";
import { Scene01Hook } from "../scenes/Scene01Hook";
import { Scene02Code } from "../scenes/Scene02Code";
import { Scene03Binary } from "../scenes/Scene03Binary";
import { Scene04Transistors } from "../scenes/Scene04Transistors";
import { Scene05Calculation } from "../scenes/Scene05Calculation";
import { Scene06Reveal } from "../scenes/Scene06Reveal";
import { Scene07CTA } from "../scenes/Scene07CTA";

export interface CodeToElectricityProps {
  /** ElevenLabs voice id to narrate with. Switch this in Studio's
   * Composition Props panel to A/B different generated voices without
   * any new API calls — see scripts/generate-narration.ts. */
  voiceId?: string;
}

// Renders each scene inside a TransitionSeries sequence using the durations
// defined in src/data/scenes.ts (each already padded by TRANSITION_FRAMES
// so the final rendered total still lands on exactly 1800 frames). Each cut
// uses a presentation suited to the story beat it connects. `voiceId` is
// forwarded to every scene so it can play its own narration + captions for
// whichever generated voice is selected.
export const CodeToElectricity: React.FC<CodeToElectricityProps> = ({
  voiceId = DEFAULT_VOICE_ID,
}) => {
  const { fps } = useVideoConfig();

  const SCENE_CONTENT: Record<(typeof SCENES)[number]["id"], React.ReactNode> =
    {
      hook: <Scene01Hook voiceId={voiceId} />,
      code: <Scene02Code voiceId={voiceId} />,
      binary: <Scene03Binary voiceId={voiceId} />,
      transistors: <Scene04Transistors voiceId={voiceId} />,
      calculation: <Scene05Calculation voiceId={voiceId} />,
      reveal: <Scene06Reveal voiceId={voiceId} />,
      cta: <Scene07CTA voiceId={voiceId} />,
    };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        translate: "3px 0px",
      }}
    >
      <TransitionSeries>
        <TransitionSeries.Sequence
          name={SCENES[0].label}
          durationInFrames={SCENES[0].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[0].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[1].label}
          durationInFrames={SCENES[1].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[1].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[2].label}
          durationInFrames={SCENES[2].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[2].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[3].label}
          durationInFrames={SCENES[3].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[3].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[4].label}
          durationInFrames={SCENES[4].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[4].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[5].label}
          durationInFrames={SCENES[5].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[5].id]}
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />
        <TransitionSeries.Sequence
          name={SCENES[6].label}
          durationInFrames={SCENES[6].durationInFrames}
          premountFor={fps}
        >
          {SCENE_CONTENT[SCENES[6].id]}
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
