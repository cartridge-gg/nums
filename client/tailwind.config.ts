import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			pixel: ['PixelGame', 'monospace'],
  			ppneuebit: ['PPNeueBit', 'sans-serif'],
  			ekamai: ['Ekamai', 'sans-serif'],
  			circular: ['CircularLL', 'sans-serif'],
  		},
  		width: {
  			desktop: '432px'
  		},
  		height: {
  			desktop: '600px'
  		},
  		screens: {
  			lg: '1200px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// Shadcn colors
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			// Custom color palette
  			purple: {
  				100: 'rgba(89, 31, 255, 100%)',
  				200: 'rgba(89, 31, 255, 80%)',
  				300: 'rgba(133, 129, 255, 100%)',
  				400: 'rgba(133, 129, 255, 48%)',
  				500: 'rgba(133, 129, 255, 32%)',
  				600: 'rgba(133, 129, 255, 16%)',
  				700: 'rgba(133, 129, 255, 8%)',
  			},
  			orange: {
  				100: 'rgba(255, 200, 0, 100%)',
  				200: 'rgba(255, 200, 0, 80%)',
  			},
  			green: {
  				100: 'rgba(72, 240, 191, 100%)',
  				200: 'rgba(157, 255, 191, 48%)',
  			},
			brown: {
				100: 'rgba(75, 61, 11, 100%)',
			},
  			black: {
  				100: 'rgba(0, 0, 0, 100%)',
  				200: 'rgba(0, 0, 0, 80%)',
  				300: 'rgba(0, 0, 0, 64%)',
  				400: 'rgba(0, 0, 0, 48%)',
  				500: 'rgba(0, 0, 0, 32%)',
  				600: 'rgba(0, 0, 0, 24%)',
  				700: 'rgba(0, 0, 0, 16%)',
  				800: 'rgba(0, 0, 0, 8%)',
  			},
  			white: {
  				100: 'rgba(255, 255, 255, 100%)',
  				200: 'rgba(255, 255, 255, 80%)',
  				300: 'rgba(255, 255, 255, 64%)',
  				400: 'rgba(255, 255, 255, 48%)',
				500: 'rgba(255, 255, 255, 32%)',
				600: 'rgba(255, 255, 255, 24%)',
				700: 'rgba(255, 255, 255, 16%)',
				800: 'rgba(255, 255, 255, 8%)',
				900: 'rgba(255, 255, 255, 4%)',
  			},
  			blue: {
  				50: '#eff6ff',
  				100: '#dbeafe',
  				200: '#bfdbfe',
  				300: '#93c5fd',
  				400: '#60a5fa',
  				500: '#3b82f6',
  				600: '#2563eb',
  				700: '#1d4ed8',
  				800: '#1e40af',
  				900: '#1e3a8a',
  			},
  		}
  	}
  },
} satisfies Config;

export default config;
