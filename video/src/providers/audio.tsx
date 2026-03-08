import type React from "react";
import { createContext, useContext } from "react";

interface AudioContextType {
	isMuted: boolean;
	toggleMute: () => void;
	volume: number;
	setVolume: (v: number) => void;
	playPositive: () => void;
	playNegative: () => void;
	playReplay: () => void;
	playClick: () => void;
	playSlots: () => void;
	playReroll: () => void;
	playUfo: () => void;
	playWindy: () => void;
	playMagnet: () => void;
	playBomb: () => void;
}

const noop = () => {};

const AudioContext = createContext<AudioContextType>({
	isMuted: true,
	toggleMute: noop,
	volume: 0,
	setVolume: noop,
	playPositive: noop,
	playNegative: noop,
	playReplay: noop,
	playClick: noop,
	playSlots: noop,
	playReroll: noop,
	playUfo: noop,
	playWindy: noop,
	playMagnet: noop,
	playBomb: noop,
});

export const useAudio = () => useContext(AudioContext);

export function AudioProvider({ children }: { children: React.ReactNode }) {
	return (
		<AudioContext.Provider
			value={{
				isMuted: true,
				toggleMute: noop,
				volume: 0,
				setVolume: noop,
				playPositive: noop,
				playNegative: noop,
				playReplay: noop,
				playClick: noop,
				playSlots: noop,
				playReroll: noop,
				playUfo: noop,
				playWindy: noop,
				playMagnet: noop,
				playBomb: noop,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}
