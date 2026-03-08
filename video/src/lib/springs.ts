import type { SpringConfig } from "remotion";

export const dramatic: SpringConfig = {
	mass: 2,
	damping: 15,
	stiffness: 80,
	overshootClamping: false,
};

export const punch: SpringConfig = {
	mass: 1,
	damping: 8,
	stiffness: 300,
	overshootClamping: false,
};

export const breathe: SpringConfig = {
	mass: 1,
	damping: 30,
	stiffness: 40,
	overshootClamping: false,
};

export const whip: SpringConfig = {
	mass: 1,
	damping: 20,
	stiffness: 400,
	overshootClamping: false,
};

export const float: SpringConfig = {
	mass: 1,
	damping: 200,
	stiffness: 30,
	overshootClamping: false,
};
