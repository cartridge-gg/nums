import { Composition, Folder } from "remotion";
import { FPS, seconds } from "@video/lib/timing";

import {
	PerfectGame,
	perfectGameSchema,
	perfectGameDefaultProps,
} from "./compositions/gameplay/PerfectGame";

// Mobile-first: iPhone dimensions
const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;

// Story format for social
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Folder name="Gameplay">
				<Composition
					id="PerfectGame"
					component={PerfectGame}
					schema={perfectGameSchema}
					defaultProps={perfectGameDefaultProps}
					width={MOBILE_WIDTH}
					height={MOBILE_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
				<Composition
					id="PerfectGame-Story"
					component={PerfectGame}
					schema={perfectGameSchema}
					defaultProps={perfectGameDefaultProps}
					width={STORY_WIDTH}
					height={STORY_HEIGHT}
					fps={FPS}
					durationInFrames={seconds(7)}
				/>
			</Folder>
		</>
	);
};
