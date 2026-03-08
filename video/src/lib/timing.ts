export const FPS = 30;

export function seconds(n: number): number {
	return Math.round(n * FPS);
}

export function frames(n: number): number {
	return n;
}

export function beat(bpm: number, beats: number): number {
	return Math.round((beats / bpm) * 60 * FPS);
}
