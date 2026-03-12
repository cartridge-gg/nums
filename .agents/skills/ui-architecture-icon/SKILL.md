---
name: ui-architecture-icon
description: Add SVG icons to the Nums game client — convert SVG, create component, export, update storybook. Use when adding, modifying, or removing icon components.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Adding an Icon

## Step 1: Identify the Category

| Category   | Location          | Pattern                                              | When to Use          |
| ---------- | ----------------- | ---------------------------------------------------- | -------------------- |
| `regulars` | `icons/regulars/` | Simple, no variants                                  | General UI icons     |
| `powers`   | `icons/powers/`   | File-based variants (`.regular`, `.lock`, `.used`)   | Game power icons     |
| `traps`    | `icons/traps/`    | File-based variants (`.regular`, `.shadow`, `.used`) | Game trap icons      |
| `states`   | `icons/states/`   | Prop-based variants (`solid` / `line`)               | Toggle/nav icons     |
| `exotics`  | `icons/exotics/`  | Simple, no variants                                  | Logos, special icons |
| `effects`  | `icons/effects/`  | Simple, no variants                                  | Visual effects       |

## Step 2: Create the Icon Component

### Template for `regulars` / `exotics` (simple icon)

File: `client/src/components/icons/<category>/<icon-name>.tsx`

```tsx
import { forwardRef, memo } from "react";
import { iconVariants, type IconProps } from "..";

export const MyIconIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {/* SVG paths here */}
      </svg>
    ),
  ),
);

MyIconIcon.displayName = "MyIconIcon";
```

### Template for `powers` / `traps` (file-based variants)

Create 3 files per icon: `<name>.regular.tsx`, `<name>.lock.tsx`, `<name>.used.tsx`

Each file uses the same template above but with different SVG content and component names:

- `<name>.regular.tsx` → `export const MyIconIcon = ...`
- `<name>.lock.tsx` → `export const MyIconLockedIcon = ...`
- `<name>.used.tsx` → `export const MyIconUsedIcon = ...`

### Template for `states` (prop-based variants)

```tsx
import { forwardRef, memo } from "react";
import { iconVariants, type StateIconProps } from "..";

export const MyIconIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "solid":
              return <path d="..." fill="currentColor" />;
            case "line":
              return <path d="..." fill="currentColor" />;
          }
        })()}
      </svg>
    ),
  ),
);

MyIconIcon.displayName = "MyIconIcon";
```

## Step 3: Convert SVG for React

When pasting SVG from a design tool:

1. **Keep** the `<svg>` wrapper with `width="24" height="24" viewBox="0 0 24 24" fill="none"`
2. **Replace** the `<svg>` attributes with the template's (className, ref, etc.)
3. **Convert** kebab-case attributes to camelCase:
   - `fill-rule` → `fillRule`
   - `clip-rule` → `clipRule`
   - `flood-opacity` → `floodOpacity`
   - `color-interpolation-filters` → `colorInterpolationFilters`
   - `filter-units` → `filterUnits`
   - `stroke-width` → `strokeWidth`
   - `stroke-linecap` → `strokeLinecap`
   - `stroke-linejoin` → `strokeLinejoin`
4. **Replace** hardcoded fill colors with `fill="currentColor"` (so color inherits from CSS)
5. **Remove** unnecessary `<defs>` blocks (filters, gradients) unless they are referenced by paths via `filter="url(#...)"` or `fill="url(#...")"`
6. **Remove** `xmlns:xlink` and other unnecessary namespace attributes

## Step 4: Export from Index

Add to `client/src/components/icons/<category>/index.ts`:

```ts
export * from "./<icon-name>";
// For file-based variants:
export * from "./<icon-name>.regular";
export * from "./<icon-name>.lock";
export * from "./<icon-name>.used";
```

Keep the exports **sorted alphabetically** by file name.

## Step 5: Update Storybook

Edit `client/src/components/icons/<category>/index.stories.tsx`.

**IMPORTANT**: Before editing, read the existing storybook file to match the exact code style.

### For `regulars` / `exotics` — add to the icons array:

```tsx
const regularIcons = [
  // ... existing icons (alphabetical)
  { name: "MyIconIcon", component: Icons.MyIconIcon },
];
```

### For `powers` / `traps` — add to the variant array:

```tsx
const powers = [
  // ... existing powers
  {
    name: "MyIcon",
    color: "text-mycolor-100",
    normal: Icons.MyIconIcon,
    locked: Icons.MyIconLockedIcon,
    used: Icons.MyIconUsedIcon,
  },
];
```

### For `states` — add to the state icons array:

```tsx
const stateIcons = [
  // ... existing state icons
  { name: "MyIconIcon", component: Icons.MyIconIcon },
];
```

---

## Naming Conventions

| What               | Convention               | Example                                 |
| ------------------ | ------------------------ | --------------------------------------- |
| File (simple)      | `kebab-case.tsx`         | `laurel.tsx`                            |
| File (variant)     | `kebab-case.variant.tsx` | `boost-high.regular.tsx`                |
| Component          | `PascalCaseIcon`         | `LaurelIcon`                            |
| Component (locked) | `PascalCaseLockedIcon`   | `BoostHighLockedIcon`                   |
| Component (used)   | `PascalCaseUsedIcon`     | `BoostHighUsedIcon`                     |
| displayName        | Same as component        | `LaurelIcon.displayName = "LaurelIcon"` |

## Icon Size Tokens

```ts
const size = {
  "4xs": "h-1 w-1",
  "3xs": "h-2 w-2",
  "2xs": "h-3 w-3",
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6", // DEFAULT
  lg: "h-8 w-8",
  xl: "h-12 w-12",
  "2xl": "h-14 w-14",
  "3xl": "h-16 w-16",
};
```

## Type Definitions

```ts
// client/src/components/icons/types.ts
import type { VariantProps } from "class-variance-authority";
import type { SVGProps } from "react";
import type { iconVariants } from ".";

// For icons WITHOUT variant prop
export type IconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
>;

// For icons WITH variant prop (solid/line)
export type StateIconProps = Omit<
  SVGProps<SVGSVGElement> & VariantProps<typeof iconVariants>,
  "variant"
> & { variant: "solid" | "line" };
```

## Checklist

- [ ] File created at correct path with correct naming
- [ ] `memo()` + `forwardRef<SVGSVGElement, IconProps>()` wrapping
- [ ] `iconVariants({ size, className })` for className
- [ ] `ref={forwardedRef}` on `<svg>`
- [ ] `{...props}` spread on `<svg>`
- [ ] `fill="currentColor"` on paths (not hardcoded colors)
- [ ] SVG attributes in camelCase (no kebab-case)
- [ ] Unnecessary `<defs>` removed
- [ ] `displayName` set
- [ ] Export added to category `index.ts` (alphabetical order)
- [ ] Storybook entry added to category `index.stories.tsx`
