import { interpolate } from "remotion";
import { colors } from "./colors";

export interface Particle {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	color: string;
	rotation: number;
	rotationSpeed: number;
	opacity: number;
}

function seededRandom(seed: number): () => number {
	let s = seed;
	return () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

export function confettiBurst(
	count: number,
	centerX: number,
	centerY: number,
	seed = 42,
): Particle[] {
	const rand = seededRandom(seed);
	const confettiColors = [
		colors.yellow,
		colors.green,
		colors.pink,
		colors.blue,
		colors.purple,
		colors.mauve,
	];
	return Array.from({ length: count }, (_, i) => {
		const angle = rand() * Math.PI * 2;
		const speed = 3 + rand() * 8;
		return {
			id: i,
			x: centerX,
			y: centerY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 4,
			size: 4 + rand() * 6,
			color: confettiColors[Math.floor(rand() * confettiColors.length)],
			rotation: rand() * 360,
			rotationSpeed: (rand() - 0.5) * 20,
			opacity: 1,
		};
	});
}

export function getParticleAtFrame(
	particle: Particle,
	frame: number,
	startFrame: number,
	duration: number,
	gravity = 0.3,
): { x: number; y: number; rotation: number; opacity: number; size: number } {
	const elapsed = Math.max(0, frame - startFrame);
	const progress = Math.min(1, elapsed / duration);
	const x = particle.x + particle.vx * elapsed;
	const y =
		particle.y + particle.vy * elapsed + 0.5 * gravity * elapsed * elapsed;
	const rotation = particle.rotation + particle.rotationSpeed * elapsed;
	const opacity = interpolate(
		progress,
		[0, 0.7, 1],
		[particle.opacity, particle.opacity, 0],
		{
			extrapolateRight: "clamp",
		},
	);
	return { x, y, rotation, opacity, size: particle.size };
}

export function embers(
	count: number,
	width: number,
	height: number,
	seed = 99,
): Particle[] {
	const rand = seededRandom(seed);
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		x: rand() * width,
		y: height + rand() * 20,
		vx: (rand() - 0.5) * 0.5,
		vy: -(1 + rand() * 2),
		size: 2 + rand() * 3,
		color:
			interpolate(rand(), [0, 0.5, 1], [0, 0.5, 1]) > 0.5
				? colors.yellow
				: colors.red,
		rotation: rand() * 360,
		rotationSpeed: (rand() - 0.5) * 5,
		opacity: 0.6 + rand() * 0.4,
	}));
}
