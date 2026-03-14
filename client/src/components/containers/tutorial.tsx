import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTutorial } from "@/context/tutorial";
import { usePractice } from "@/context/practice";
import { TutorialTooltip } from "@/components/elements/tutorial-tooltip";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetElements(selector: string): HTMLElement[] {
  const elements = document.querySelectorAll(selector);
  const visible: HTMLElement[] = [];
  for (const el of elements) {
    if (el instanceof HTMLElement && el.offsetParent !== null) {
      visible.push(el);
    }
  }
  // If none are visible, fall back to all matching elements
  if (visible.length === 0) {
    for (const el of elements) {
      if (el instanceof HTMLElement) visible.push(el);
    }
  }
  return visible;
}

function getBoundingRect(elements: HTMLElement[]): Rect | null {
  if (elements.length === 0) return null;
  let top = Infinity;
  let left = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top);
    left = Math.min(left, r.left);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  return { top, left, width: right - left, height: bottom - top };
}

const HIGHLIGHT_CLASS = "tutorial-highlight-active";

// Marching ants styles — uses CSS vars for per-corner border-radius on the ::after
const MARCH_SELECTORS = [
  `.${HIGHLIGHT_CLASS}`,
  `[data-tutorial-guided-slot]`,
  `[data-tutorial-guided-selection]`,
  `[data-tutorial-guided-power]`,
  `[data-tutorial-guided-instruction]`,
];
const MARCH_BASE = MARCH_SELECTORS.join(",\n");
const MARCH_AFTER = MARCH_SELECTORS.map((s) => `${s}::after`).join(",\n");

const INSET = 2; // px offset for the ::after pseudo-element

/**
 * Read the element's computed per-corner border-radius and set CSS variables
 * on the element with the offset added, so the ::after pseudo-element matches.
 */
function syncBorderRadius(el: HTMLElement): void {
  const cs = getComputedStyle(el);
  el.style.setProperty(
    "--tb-tl",
    `calc(${cs.borderTopLeftRadius} + ${INSET}px)`,
  );
  el.style.setProperty(
    "--tb-tr",
    `calc(${cs.borderTopRightRadius} + ${INSET}px)`,
  );
  el.style.setProperty(
    "--tb-br",
    `calc(${cs.borderBottomRightRadius} + ${INSET}px)`,
  );
  el.style.setProperty(
    "--tb-bl",
    `calc(${cs.borderBottomLeftRadius} + ${INSET}px)`,
  );
}

// Inject the highlight style once
if (typeof document !== "undefined") {
  const styleId = "tutorial-highlight-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      ${MARCH_BASE} {
        position: relative;
      }
      ${MARCH_AFTER} {
        content: "";
        position: absolute;
        inset: -${INSET}px;
        border-radius: var(--tb-tl, inherit) var(--tb-tr, inherit) var(--tb-br, inherit) var(--tb-bl, inherit);
        pointer-events: none;
        z-index: 1;
        background-image:
          linear-gradient(90deg, var(--yellow-100) 50%, transparent 50%),
          linear-gradient(0deg, var(--yellow-100) 50%, transparent 50%),
          linear-gradient(90deg, var(--yellow-100) 50%, transparent 50%),
          linear-gradient(0deg, var(--yellow-100) 50%, transparent 50%);
        background-size: 8px 2px, 2px 8px, 8px 2px, 2px 8px;
        background-repeat: repeat-x, repeat-y, repeat-x, repeat-y;
        background-position: 0 0, 100% 0, 100% 100%, 0 100%;
        animation: tutorial-march 0.4s linear infinite;
      }
      @keyframes tutorial-march {
        to {
          background-position:
            16px 0,
            100% 16px,
            calc(100% - 16px) 100%,
            0 calc(100% - 16px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export const TutorialOverlay = () => {
  const { isActive, currentStep, stepIndex, totalSteps, advance, back } =
    useTutorial();
  const { game } = usePractice();

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number>(0);
  const prevElsRef = useRef<HTMLElement[]>([]);

  // Determine if the current step is an action step (no Next button needed)
  const isActionStep =
    currentStep?.type === "set" ||
    currentStep?.type === "select" ||
    currentStep?.type === "apply";

  // Check if an action step has already been completed (e.g., slot already filled)
  const isActionCompleted = useMemo(() => {
    if (!currentStep || !game) return false;
    if (currentStep.type === "set" && currentStep.guidedIndex !== undefined) {
      // Slot already has a value placed
      return game.slots[currentStep.guidedIndex] !== 0;
    }
    if (currentStep.type === "select") {
      // Selection already made (no more selectable powers)
      return game.selectable_powers.length === 0;
    }
    if (currentStep.type === "apply" && currentStep.guidedIndex !== undefined) {
      // Power already used (disabled)
      return !game.enabled_powers[currentStep.guidedIndex];
    }
    return false;
  }, [currentStep, game]);

  // State-override steps auto-advance
  const isStateOverride = currentStep?.type === "state-override";

  const updateRect = useCallback(() => {
    if (!currentStep || !currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const els = getTargetElements(currentStep.targetSelector);
    if (els.length === 0) {
      setTargetRect(null);
      return;
    }

    els[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTargetRect(getBoundingRect(els));
  }, [currentStep]);

  // Apply/remove highlight class on target elements
  useEffect(() => {
    if (!isActive || !currentStep || !currentStep.targetSelector) {
      for (const el of prevElsRef.current) {
        el.classList.remove(HIGHLIGHT_CLASS);
      }
      prevElsRef.current = [];
      return;
    }

    const selector = currentStep.targetSelector;
    let mutationObs: MutationObserver | null = null;

    const applyHighlight = () => {
      const els = getTargetElements(selector);

      // Remove from previous elements
      for (const el of prevElsRef.current) {
        if (!els.includes(el)) {
          el.classList.remove(HIGHLIGHT_CLASS);
        }
      }

      // Add to current elements and sync border-radius for marching ants
      for (const el of els) {
        el.classList.add(HIGHLIGHT_CLASS);
        syncBorderRadius(el);
      }
      prevElsRef.current = els;

      if (els.length > 0) {
        mutationObs?.disconnect();
        mutationObs = null;
      }
    };

    applyHighlight();

    // If target not found yet, watch for DOM changes
    if (getTargetElements(selector).length === 0) {
      mutationObs = new MutationObserver(() => {
        if (getTargetElements(selector).length > 0) {
          applyHighlight();
        }
      });
      mutationObs.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      mutationObs?.disconnect();
      for (const el of prevElsRef.current) {
        el.classList.remove(HIGHLIGHT_CLASS);
      }
      prevElsRef.current = [];
    };
  }, [isActive, currentStep]);

  // Sync border-radius CSS vars on React-managed guided elements
  useEffect(() => {
    if (!isActive) return;
    const GUIDED_SELECTOR =
      "[data-tutorial-guided-slot],[data-tutorial-guided-selection],[data-tutorial-guided-power],[data-tutorial-guided-instruction]";
    const sync = () => {
      for (const el of document.querySelectorAll(GUIDED_SELECTOR)) {
        if (el instanceof HTMLElement) syncBorderRadius(el);
      }
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive || !currentStep || !currentStep.targetSelector) return;

    const selector = currentStep.targetSelector;
    let mutationObs: MutationObserver | null = null;

    const setup = () => {
      updateRect();

      const els = getTargetElements(selector);
      if (els.length > 0) {
        // Target found — observe for resize
        observerRef.current?.disconnect();
        observerRef.current = new ResizeObserver(() => {
          rafRef.current = requestAnimationFrame(updateRect);
        });
        for (const el of els) {
          observerRef.current.observe(el);
        }
        // Stop watching for DOM changes once found
        mutationObs?.disconnect();
        mutationObs = null;
      }
    };

    setup();

    // If target not found yet, watch for DOM changes (e.g., modal opening)
    const els = getTargetElements(selector);
    if (els.length === 0) {
      mutationObs = new MutationObserver(() => {
        const found = getTargetElements(selector);
        if (found.length > 0) {
          setup();
        }
      });
      mutationObs.observe(document.body, { childList: true, subtree: true });
    }

    const handleUpdate = () => {
      rafRef.current = requestAnimationFrame(updateRect);
    };
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      observerRef.current?.disconnect();
      mutationObs?.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [isActive, currentStep, updateRect]);

  // Track whether a game modal (Places, Uses, etc.) is open
  const [hasModalOpen, setHasModalOpen] = useState(false);
  useEffect(() => {
    if (!isActive) {
      setHasModalOpen(false);
      return;
    }
    const check = () =>
      setHasModalOpen(!!document.querySelector("[data-tutorial-modal]"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [isActive]);

  // State-override steps don't render UI — they are handled in the game page
  const showTooltip =
    isActive && currentStep && !isStateOverride && (targetRect || !currentStep.targetSelector);

  const isLastStep = stepIndex === totalSteps - 1;

  // Tooltip position with viewport bounds clamping
  let tooltipStyle: React.CSSProperties = {};
  if (showTooltip && targetRect) {
    const gap = 8;
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(320, viewportWidth - padding * 2);
    const estimatedTooltipHeight = 120;

    tooltipStyle.width = tooltipWidth;

    if (hasModalOpen) {
      // Position tooltip just below the modal content
      const modalEl = document.querySelector("[data-tutorial-modal]");
      // Find the actual modal card (first child of the modal container)
      const modalCard = modalEl?.firstElementChild as HTMLElement | null;
      if (modalCard) {
        const modalRect = modalCard.getBoundingClientRect();
        tooltipStyle.top = modalRect.bottom + gap;
      } else {
        tooltipStyle.bottom = padding;
      }
      tooltipStyle.left = Math.max(
        padding,
        (viewportWidth - tooltipWidth) / 2,
      );
    } else {
      const spaceBelow =
        viewportHeight - (targetRect.top + targetRect.height + gap);
      const spaceAbove = targetRect.top - gap;
      let placeBelow = currentStep!.position === "bottom";

      if (
        placeBelow &&
        spaceBelow < estimatedTooltipHeight &&
        spaceAbove > spaceBelow
      ) {
        placeBelow = false;
      } else if (
        !placeBelow &&
        spaceAbove < estimatedTooltipHeight &&
        spaceBelow > spaceAbove
      ) {
        placeBelow = true;
      }

      if (placeBelow) {
        tooltipStyle.top = Math.min(
          targetRect.top + targetRect.height + gap,
          viewportHeight - estimatedTooltipHeight - padding,
        );
      } else {
        tooltipStyle.top = Math.max(padding, targetRect.top - gap);
        tooltipStyle.transform = "translateY(-100%)";
      }

      const centerX = targetRect.left + targetRect.width / 2;
      const idealLeft = centerX - tooltipWidth / 2;
      tooltipStyle.left = Math.max(
        padding,
        Math.min(idealLeft, viewportWidth - tooltipWidth - padding),
      );
    }
  }

  if (!isActive) return null;

  return (
    <>
      {/* Tooltip */}
      {showTooltip && currentStep && (
        <div className="fixed z-[56]" style={tooltipStyle}>
          <TutorialTooltip
            title={currentStep.title}
            description={currentStep.description}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onNext={advance}
            onBack={back}
            isLastStep={isLastStep}
            isActionStep={isActionStep}
            isActionCompleted={isActionCompleted}
          />
        </div>
      )}
    </>
  );
};
