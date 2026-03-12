---
name: ui-architecture
description: UI component patterns for the Nums game client — Radix primitives, elements, containers, theming, Storybook conventions. Use when creating or modifying UI components, adding storybook stories, or working with the design system.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# UI Architecture

React/TypeScript frontend in `client/src/` using Tailwind CSS, Radix UI, CVA (class-variance-authority), and Storybook.

## Component Hierarchy

```
client/src/components/
├── icons/          # SVG icon components (see ui-architecture-icon skill)
├── ui/             # Radix UI primitives (Button, Select, Tabs, etc.)
├── elements/       # Game-specific UI elements (Stat, Balance, PowerUp, etc.)
├── containers/     # Page-level compositions (Header, Games, Leaderboard, etc.)
├── animations/     # Motion components (Countup, Countdown)
└── layouts/        # Layout wrappers
```

## Shared Utilities

- **`cn()`** from `@/lib/utils` — merges Tailwind classes safely (clsx + tailwind-merge)
- **`iconVariants()`** from `@/components/icons` — CVA variants for icon sizing
- **`useAudio()`** from `@/context/audio` — sound effects for interactive components

---

# Storybook Rules (MANDATORY)

## Every component MUST have a storybook

When creating a new component, always create a `.stories.tsx` file alongside it. When modifying a component (new props, new variants, changed behavior), always update its storybook to cover the changes.

## Match existing storybook style

Before writing a storybook, **read 2-3 existing `.stories.tsx` files in the same directory** to match the exact code style. The patterns vary by component tier:

### Element storybook pattern

File: `client/src/components/elements/<component>.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "./my-component";

const meta = {
  title: "Elements/MyComponent",
  component: MyComponent,
  parameters: {
    layout: "centered",
  },
  globals: {
    backgrounds: {
      value: "dark",
    },
  },
  argTypes: {
    myProp: {
      control: "text",
      description: "Description of the prop",
    },
    variant: {
      control: "select",
      options: ["default", "secondary"],
      description: "The visual variant",
    },
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// One story per meaningful state/variant
export const Default: Story = {
  args: {
    myProp: "value",
  },
};

export const Secondary: Story = {
  args: {
    myProp: "value",
    variant: "secondary",
  },
};
```

### Container storybook pattern

Containers often need mock data or providers. Follow existing container stories for the wrapping pattern.

### Key conventions

- **`satisfies Meta<typeof Component>`** — always use `satisfies`, not `as`
- **`globals.backgrounds.value: "dark"`** — always dark background
- **`parameters.layout: "centered"`** — always centered layout
- **`argTypes`** — document every controllable prop with `control` and `description`
- **One exported story per variant/state** — name stories descriptively (`Default`, `Empty`, `Locked`, `WithError`, etc.)
- **Use `fn()` from `storybook/test`** for callback props (`onClick`, `onChange`, etc.)
- **Title format**: `"Tier/ComponentName"` (e.g., `"Elements/Stat"`, `"Containers/Header"`, `"Icons/Powers"`)

## When to update storybooks

| Change                   | Storybook Action                                                 |
| ------------------------ | ---------------------------------------------------------------- |
| New component            | Create `.stories.tsx` with all variants                          |
| New prop added           | Add `argTypes` entry + story exercising it                       |
| New variant added        | Add story for the new variant                                    |
| Prop renamed/removed     | Update `argTypes` and affected stories                           |
| Behavior change          | Verify existing stories still make sense, add new ones if needed |
| Visual change only (CSS) | No storybook change needed (visual regression is automatic)      |

---

# Component Patterns

## ForwardRef + CVA Pattern (UI primitives)

All `ui/` components follow this pattern:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const myComponentVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-classes",
      secondary: "secondary-classes",
    },
    size: {
      md: "size-md-classes",
      lg: "size-lg-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface MyComponentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      className={cn(myComponentVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
MyComponent.displayName = "MyComponent";

export { MyComponent, myComponentVariants };
```

## Element Pattern (game-specific)

Elements are simpler — they receive typed props and render game UI:

```tsx
interface MyElementProps {
  value: number;
  label: string;
  className?: string;
}

export const MyElement = ({ value, label, className }: MyElementProps) => {
  return (
    <div className={cn("base-classes", className)}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
};
```

## Audio Integration

Interactive components integrate sound via `useAudio()`:

```tsx
import { useAudio } from "@/context/audio";

const MyButton = () => {
  const { playClick } = useAudio();
  return (
    <button
      onClick={() => {
        playClick(); /* action */
      }}
    >
      Click
    </button>
  );
};
```

---

# Theming

## Design Tokens

CSS variables in `client/src/themes/default.css` — 30+ color families with 9-level opacity scales (100-900).

Game-specific colors: `purple`, `mauve`, `yellow`, `red`, `green`, `pink`, `blue`, `brown`, `black`, `gray`, `white`.
Power colors: `double`, `down`, `reroll`, `wildcard`, `swap`, `halve`, `up`, `low`, `foresight`, `high`.
Trap colors: `ribbon`, `gem`, `magnet`, `windy`, `lucky`, `slots`, `bomb`, `ufo`, `glitchbomb`.

All mapped to Tailwind utilities via `client/src/themes/preset.ts`:

```
bg-purple-100, text-yellow-200, border-red-500, etc.
```

## Fonts

| Font        | CSS Class        | Use                     |
| ----------- | ---------------- | ----------------------- |
| PixelGame   | `font-pixelgame` | Primary retro aesthetic |
| PPNeueBit   | `font-ppneuebit` | Bold secondary          |
| DMMono      | `font-dmmono`    | Monospace data          |
| Circular-LL | `font-circular`  | Modern sans-serif       |

## Custom Animations

Defined in `client/src/index.css`:

- `reward-diff` — floating text (2s)
- `shimmer-reflect` — shiny text effect (6s)
- `multiplier-fire` — fire effect (1.75s)
- `pulse-border` — pulsing outline (3s)
- `toast-progress` — progress bar (4s)

---

# UI Primitives (Radix)

All in `client/src/components/ui/`. Use CVA for variants, `forwardRef` pattern, and integrate `useAudio()` for click sounds.

| Component | File                | Variants                                                                                    |
| --------- | ------------------- | ------------------------------------------------------------------------------------------- |
| Button    | `button.tsx`        | default, destructive, outline, secondary, muted, ghost, link × sm, lg, icon, sound, balance |
| Select    | `select.tsx`        | Radix Select with audio                                                                     |
| Tabs      | `tabs.tsx`          | Radix Tabs                                                                                  |
| Carousel  | `carousel.tsx`      | Embla-based                                                                                 |
| Slider    | `slider.tsx`        | Radix Slider                                                                                |
| Toggle    | `toggle.tsx`        | Radix Toggle                                                                                |
| Dropdown  | `dropdown-menu.tsx` | Radix DropdownMenu                                                                          |
| Tooltip   | `tooltip.tsx`       | Radix Tooltip                                                                               |

---

# Dependencies

| Package                    | Purpose                      |
| -------------------------- | ---------------------------- |
| `@radix-ui/*`              | Accessible UI primitives     |
| `class-variance-authority` | Type-safe variant management |
| `tailwind-merge`           | Smart class merging          |
| `clsx`                     | Conditional classes          |
| `framer-motion`            | Animations                   |
| `embla-carousel-react`     | Carousel                     |
| `lucide-react`             | Fallback icons               |
| `sonner`                   | Toast notifications          |
| `recharts`                 | Charts                       |
| `@storybook/react-vite`    | Component documentation      |
