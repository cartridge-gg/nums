import { useCurrentFrame, interpolate, Sequence, AbsoluteFill } from "remotion";
import { z } from "zod";
import { GameScene } from "@/components/scenes/game";
import type { SlotProps } from "@/components/elements/slot";
import type { PowerUpProps } from "@/components/elements/power-up";
import type { StageState } from "@/components/elements/stage";
import { Game } from "@/models/game";
import { Power, PowerType } from "@/types/power";
import { Trap, TrapType } from "@/types/trap";
import { AudioProvider } from "@video/providers/audio";
import "@video/styles/tailwind.css";

export const perfectGameSchema = z.object({
	slots: z.array(z.number()).length(18),
	reward: z.number(),
	multiplier: z.number(),
	playerName: z.string(),
});

type PerfectGameProps = z.infer<typeof perfectGameSchema>;

const defaultSlots = [
	23, 67, 112, 178, 234, 312, 389, 445, 512, 567, 623, 678, 734, 789, 845, 901,
	945, 978,
];

const defaultProps: PerfectGameProps = {
	slots: defaultSlots,
	reward: 15000,
	multiplier: 2.5,
	playerName: "Player1",
};

export { defaultProps as perfectGameDefaultProps };

function buildGameState(
	slots: number[],
	filledCount: number,
	currentNumber: number,
	nextNumber: number,
	reward: number,
	multiplier: number,
): Game {
	const gameSlots = slots.map((v, i) => (i < filledCount ? v : 0));
	return new Game(
		1, // id
		false, // claimed
		multiplier, // multiplier
		filledCount, // level
		18, // slot_count
		1, // slot_min
		999, // slot_max
		currentNumber, // number
		nextNumber, // next_number
		[], // selectable_powers
		[
			new Power(PowerType.Reroll),
			new Power(PowerType.High),
			new Power(PowerType.Low),
		], // selected_powers
		[false, false, false], // enabled_powers (all used)
		Array(18).fill(false) as boolean[], // disabled_traps
		reward, // reward
		0, // over
		0, // expiration
		Array(18)
			.fill(null)
			.map(() => new Trap(TrapType.None)) as Trap[], // traps
		gameSlots, // slots
		0n, // supply
	);
}

function buildSlotProps(game: Game): SlotProps[] {
	return game.slots.map((value, i) => ({
		label: i + 2,
		value,
	}));
}

function buildPowerProps(game: Game): PowerUpProps[] {
	return game.selected_powers.map((power, i) => ({
		power,
		status: game.enabled_powers[i] ? undefined : ("used" as const),
	}));
}

function buildStages(filledCount: number): StageState[] {
	return Array.from({ length: 9 }, (_, i) => {
		const stageSlots = (i + 1) * 2;
		return {
			completed: filledCount >= stageSlots,
			breakeven: i >= 3, // breakeven at stage 4+
			gem: i === 8, // gem on last stage
			crown: false,
		};
	});
}

export const PerfectGame: React.FC<PerfectGameProps> = ({
	slots,
	reward,
	multiplier,
}) => {
	const frame = useCurrentFrame();

	// Animation timeline: fill slots one by one, accelerating
	// Total ~7s = 210 frames at 30fps
	// Slots fill from frame 10 to frame 160, then celebration
	const FILL_START = 10;
	const FILL_END = 160;
	const CELEBRATION_START = 170;

	// Calculate how many slots are filled at current frame
	// Accelerating: early slots take longer, late slots are fast
	const fillProgress = interpolate(frame, [FILL_START, FILL_END], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	// Ease-in curve so later slots fill faster
	const easedProgress = fillProgress ** 0.7;
	const filledCount = Math.min(18, Math.floor(easedProgress * 18));

	// Current number shown (the one about to be placed)
	const currentNumber =
		filledCount < 18 ? slots[filledCount] : slots[slots.length - 1];
	const nextNumber =
		filledCount < 17 ? slots[filledCount + 1] : slots[slots.length - 1];

	// Reward builds up as slots fill
	const currentReward = Math.round((filledCount / 18) * reward);

	// Build game state for current frame
	const game = buildGameState(
		slots,
		filledCount,
		filledCount < 18 ? currentNumber : 0,
		nextNumber,
		currentReward,
		multiplier,
	);

	const slotProps = buildSlotProps(game);
	const powerProps = buildPowerProps(game);
	const stages = buildStages(filledCount);

	// Celebration overlay
	const celebrationOpacity = interpolate(
		frame,
		[CELEBRATION_START, CELEBRATION_START + 15],
		[0, 1],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);

	const isComplete = filledCount >= 18;

	return (
		<AbsoluteFill
			style={{ backgroundColor: "#591FFF", fontFamily: "PixelGame, monospace" }}
		>
			<AudioProvider>
				<div
					className="dark"
					style={{
						width: "100%",
						height: "100%",
						padding: "24px 16px",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<GameScene
						game={game}
						powers={powerProps}
						slots={slotProps}
						stages={stages}
					/>

					{/* Celebration overlay after all 18 slots filled */}
					{isComplete && (
						<Sequence from={CELEBRATION_START}>
							<AbsoluteFill
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									background:
										"radial-gradient(circle at 50% 50%, rgba(89, 31, 255, 0.9) 0%, rgba(0,0,0,0.85) 100%)",
									opacity: celebrationOpacity,
									gap: 24,
								}}
							>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontWeight: 700,
										fontSize: 80,
										color: "#FFC800",
										textShadow:
											"4px 4px 0px rgba(0,0,0,0.5), 0 0 40px rgba(255, 200, 0, 0.4)",
										textAlign: "center",
									}}
								>
									PERFECT
								</div>
								<div
									style={{
										fontFamily: "PPNeueBit, sans-serif",
										fontWeight: 700,
										fontSize: 48,
										color: "#48F095",
										textShadow: "3px 3px 0px rgba(0,0,0,0.5)",
									}}
								>
									+{reward.toLocaleString()}
								</div>
								<div
									style={{
										fontFamily: "Circular-LL, sans-serif",
										fontSize: 18,
										color: "rgba(255,255,255,0.5)",
										marginTop: 16,
									}}
								>
									18/18 — 1 in 5,500
								</div>
							</AbsoluteFill>
						</Sequence>
					)}
				</div>
			</AudioProvider>
		</AbsoluteFill>
	);
};
