import { Composition } from "remotion";
import { CodeToElectricity } from "./compositions/CodeToElectricity";
import {
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./data/scenes";
import { DEFAULT_VOICE_ID } from "./data/useNarration";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CodeToElectricity"
        component={CodeToElectricity}
        durationInFrames={VIDEO_DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          voiceId: DEFAULT_VOICE_ID,
        }}
      />
    </>
  );
};
