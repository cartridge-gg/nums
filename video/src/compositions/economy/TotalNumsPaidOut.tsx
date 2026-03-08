import {
	useCurrentFrame,
	useVideoConfig,
	spring,
	interpolate,
	Sequence,
} from "remotion";
import { z } from "zod";
import { SquareLayout } from "@video/components/layouts/SquareLayout";
import { CounterRollUp } from "@video/components/patterns/CounterRollUp";
import { EmotionText } from "@video/components/enhanced/EmotionText";
import { seconds } from "@video/lib/timing";
import { punch } from "@video/lib/springs";
import { colors } from "@video/lib/colors";

export const totalNumsPaidOutSchema = z.object({
	totalPaid: z.number(),
});

type TotalNumsPaidOutProps = z.infer<typeof totalNumsPaidOutSchema>;

const defaultProps: TotalNumsPaidOutProps = {
	totalPaid: 5000000,
};

export { defaultProps as totalNumsPaidOutDefaultProps };

// Token rain particle
const TOKEN_COUNT = 24;
const tokenSeeds = Array.from({ length: TOKEN_COUNT }, (_, i) => ({
	id: i,
	x: (i / TOKEN_COUNT) * 100 + Math.sin(i * 7) * 8,
	delay: (i * 3) % 40,
	speed: 2 + (i % 5) * 0.8,
	size: 14 + (i % 3) * 6,
}));

export const TotalNumsPaidOut: React.FC<TotalNumsPaidOutProps> = ({
	totalPaid,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const rainStart = seconds(0.3);
	const slamStart = seconds(1.5);
	const labelStart = seconds(3);

	// Giant number slam
	const slamProgress = spring({
		frame: Math.max(0, frame - slamStart),
		fps,
		config: punch,
	});
	const slamScale = interpolate(slamProgress, [0, 0.3, 1], [3, 1.1, 1]);
	const slamOpacity = interpolate(slamProgress, [0, 0.2], [0, 1], {
		extrapolateRight: "clamp",
	});

	// Screen shake on slam
	const shakeAmount = interpolate(
		Math.max(0, frame - slamStart),
		[0, 3, 8],
		[0, 6, 0],
		{ extrapolateRight: "clamp" },
	);
	const shakeX = Math.sin(frame * 15) * shakeAmount;
	const shakeY = Math.cos(frame * 12) * shakeAmount;

	return (
		<SquareLayout>
			<div
				style={{
					transform: `translate(${shakeX}px, ${shakeY}px)`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				{/* Token rain */}
				{frame >= rainStart &&
					tokenSeeds.map((token) => {
						const elapsed = Math.max(0, frame - rainStart - token.delay);
						const y = -50 + elapsed * token.speed * 4;
						const opacity =
							y > 1100
								? 0
								: interpolate(elapsed, [0, 10], [0, 0.7], {
										extrapolateRight: "clamp",
									});
						return (
							<div
								key={token.id}
								style={{
									position: "absolute",
									left: `${token.x}%`,
									top: y,
									width: token.size,
									height: token.size,
									borderRadius: "50%",
									backgroundColor: colors.yellow,
									opacity,
									boxShadow: `0 0 8px ${colors.yellow}`,
									transform: `rotate(${elapsed * 3}deg)`,
								}}
							/>
						);
					})}

				{/* Giant number slam */}
				<Sequence from={slamStart}>
					<div
						style={{
							transform: `scale(${slamScale})`,
							opacity: slamOpacity,
						}}
					>
						<CounterRollUp
							value={totalPaid}
							duration={seconds(2)}
							fontSize={80}
							color={colors.yellow}
						/>
					</div>
				</Sequence>

				{/* Label */}
				<Sequence from={labelStart}>
					<EmotionText
						text="PAID OUT TO PLAYERS"
						color={colors.green}
						fontSize={32}
					/>
				</Sequence>
			</div>
		</SquareLayout>
	);
};
