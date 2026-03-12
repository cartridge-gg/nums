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

# Git Hygiene (MANDATORY)

## Always pull before branching

Before creating a new feature branch, **always pull and rebase the base branch** to ensure you start from the latest state. Stale branches cause merge conflicts and wasted effort.

```bash
# CORRECT: Always do this before creating a feature branch
git checkout main && git pull --rebase origin main && git checkout -b feat/my-feature

# WRONG: Creating a branch from a stale main
git checkout -b feat/my-feature  # main might be behind origin
```

---

# Barrel Export Rule (MANDATORY)

## Every new component MUST be exported from its directory's `index.ts`

Every component directory has a barrel `index.ts` file that re-exports all components. When creating a new component, **always add an export line** to the directory's `index.ts`. A component that isn't exported is invisible to the rest of the app.

### Export pattern

```ts
// client/src/components/elements/index.ts
export * from "./my-new-component";
```

### Where to export

| Component tier | Barrel file                                       |
| -------------- | ------------------------------------------------- |
| elements       | `client/src/components/elements/index.ts`         |
| containers     | `client/src/components/containers/index.ts`       |
| icons          | `client/src/components/icons/<category>/index.ts` |
| animations     | `client/src/components/animations/index.ts`       |
| ui             | `client/src/components/ui/` (individual imports)  |

### Checklist (BLOCKING — component is NOT done without these)

- [ ] Component file created (`my-component.tsx`)
- [ ] Export added to directory `index.ts` (`export * from "./my-component"`)
- [ ] Storybook file created (`my-component.stories.tsx`)
- [ ] `pnpm format` and `pnpm lint:check` pass (see Validation section)

---

# Validation Rules (MANDATORY)

## Always format and lint after every change

After **every modification** to `client/` files, run:

```bash
pnpm format
pnpm lint:check
```

- **`pnpm format`** — auto-fixes formatting (Prettier). Run first.
- **`pnpm lint:check`** — reports lint errors (ESLint). Fix any errors before moving on.

This applies to ALL client changes: new components, prop updates, import changes, storybook files — everything. No exceptions. Do NOT batch these to the end; run them after each logical change.

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
  title: "Elements/My Component",
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

// Keep it minimal — one Default story with representative data is enough
export const Default: Story = {
  args: {
    myProp: "value",
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
- **Keep stories minimal** — one `Default` story with representative mixed data is usually sufficient. Storybook controls (`argTypes`) let users explore other states interactively. Only add extra stories for **distinct CVA variants** (e.g. `variant: "secondary"`), not for different data permutations.
- **Use `fn()` from `storybook/test`** for callback props (`onClick`, `onChange`, etc.)
- **Title format**: `"Tier/Component Name"` — use spaces for compound names (e.g., `"Elements/Game Icon"`, `"Containers/Game Over"`, `"Elements/Staking Reward"`)

## When to update storybooks

| Change                   | Storybook Action                                               |
| ------------------------ | -------------------------------------------------------------- |
| New component            | Create `.stories.tsx` with one `Default` story                 |
| New CVA variant added    | Add one story for the new variant                              |
| New prop added           | Add `argTypes` entry (no new story needed — controls cover it) |
| Prop renamed/removed     | Update `argTypes` and affected stories                         |
| Behavior change          | Verify existing stories still make sense                       |
| Visual change only (CSS) | No storybook change needed (visual regression is automatic)    |

---

# Component Patterns

## Universal CVA Pattern (MANDATORY for all tiers)

**Every component** across elements, containers, animations, and covers MUST use `cva` + `VariantProps` + `cn()`. This is the universal pattern — no exceptions, even with a single `default` variant. Consistency and extensibility are non-negotiable.

### Standard pattern (elements, containers)

```tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export interface MyComponentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {
  // custom props
}

const myComponentVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "default-classes",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const MyComponent = ({
  variant,
  className,
  ...props
}: MyComponentProps) => {
  return (
    <div className={cn(myComponentVariants({ variant, className }))} {...props}>
      {/* content */}
    </div>
  );
};
```

### ForwardRef pattern (ui primitives only)

`ui/` components additionally use `forwardRef` and named exports:

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

### Exceptions (do NOT use as precedent)

These components intentionally skip CVA because they are not styled components:

| Component                                           | Reason                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `ui/` Radix wrappers (select, tabs, dropdown, etc.) | Thin forwardRef wrappers around Radix primitives, no custom variants  |
| `og/*`                                              | OG image generation — uses inline `React.CSSProperties`, not Tailwind |
| `elements/toaster.tsx`                              | Sonner config wrapper, not a styled component                         |
| `elements/sound-controls.tsx`                       | Logic-only utility, no styled output                                  |

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
