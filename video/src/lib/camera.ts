import { interpolate } from "remotion";

interface CameraState {
	x: number;
	y: number;
	scale: number;
	rotation: number;
}

export function shake(
	frame: number,
	startFrame: number,
	duration: number,
	intensity = 5,
): CameraState {
	const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));
	const decay = 1 - progress;
	const shakeX = Math.sin(frame * 1.1) * intensity * decay;
	const shakeY = Math.cos(frame * 1.3) * intensity * decay;
	const shakeRot = Math.sin(frame * 0.9) * (intensity * 0.1) * decay;
	return { x: shakeX, y: shakeY, scale: 1, rotation: shakeRot };
}

export function zoomTo(
	frame: number,
	startFrame: number,
	duration: number,
	targetScale: number,
): CameraState {
	const scale = interpolate(
		frame,
		[startFrame, startFrame + duration],
		[1, targetScale],
		{
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		},
	);
	return { x: 0, y: 0, scale, rotation: 0 };
}

export function drift(frame: number, speed = 0.3, amplitude = 3): CameraState {
	const x = Math.sin(frame * speed * 0.02) * amplitude;
	const y = Math.cos(frame * speed * 0.015) * amplitude * 0.5;
	return { x, y, scale: 1, rotation: 0 };
}

export function slam(
	frame: number,
	startFrame: number,
	duration: number,
	scale = 1.15,
): CameraState {
	if (frame < startFrame) return { x: 0, y: 0, scale: 1, rotation: 0 };
	const progress = Math.min(1, (frame - startFrame) / duration);
	const slamScale = interpolate(progress, [0, 0.15, 1], [1, scale, 1], {
		extrapolateRight: "clamp",
	});
	return { x: 0, y: 0, scale: slamScale, rotation: 0 };
}

export function combineCameras(...cameras: CameraState[]): CameraState {
	return cameras.reduce(
		(acc, cam) => ({
			x: acc.x + cam.x,
			y: acc.y + cam.y,
			scale: acc.scale * cam.scale,
			rotation: acc.rotation + cam.rotation,
		}),
		{ x: 0, y: 0, scale: 1, rotation: 0 },
	);
}

export function cameraToTransform(cam: CameraState): string {
	return `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rotation}deg)`;
}
