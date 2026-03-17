import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTutorial } from "@/context/tutorial";
import { useTutorialAnchor } from "@/hooks/tutorial-anchor";
import { Tutorial } from "./tutorial";

const PANEL_GAP = 8;
const PANEL_MAX_WIDTH = 424;
const VIEWPORT_PADDING = 8;

export const TutorialAnchorPortal = () => {
  const { data, isActive, isPaused, next, skip } = useTutorial();
  const rect = useTutorialAnchor(
    isActive && data?.anchor ? data.anchor : undefined,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(300);

  useLayoutEffect(() => {
    if (panelRef.current) {
      const h = panelRef.current.offsetHeight;
      if (h > 0) setPanelHeight(h);
    }
  });

  useEffect(() => {
    if (!isActive || isPaused || !data?.anchor) return;
    const anchor = data.anchor;
    if (anchor.type !== "powers") return;

    const targetIndex = (anchor as { type: "powers"; index: number }).index;
    const els = document.querySelectorAll<HTMLElement>(
      "[id^='tutorial-powers-']",
    );

    for (const el of els) {
      const idx = parseInt(el.id.replace("tutorial-powers-", ""), 10);
      if (idx !== targetIndex) {
        el.dataset.tutorialDisabled = "true";
        el.style.pointerEvents = "none";
        el.style.opacity = "0.4";
      }
    }

    return () => {
      for (const el of els) {
        delete el.dataset.tutorialDisabled;
        el.style.pointerEvents = "";
        el.style.opacity = "";
      }
    };
  }, [isActive, isPaused, data?.anchor]);

  if (!isActive || isPaused || !data?.anchor || !rect) return null;

  const panelWidth = Math.min(
    PANEL_MAX_WIDTH,
    window.innerWidth - VIEWPORT_PADDING * 2,
  );

  const spaceBelow =
    window.innerHeight -
    VIEWPORT_PADDING -
    (rect.top + rect.height + PANEL_GAP);
  const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_PADDING;
  const placeAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;

  const top = placeAbove
    ? rect.top - PANEL_GAP - panelHeight
    : rect.top + rect.height + PANEL_GAP;

  const idealLeft = rect.left + rect.width / 2 - panelWidth / 2;
  const left = Math.max(
    VIEWPORT_PADDING,
    Math.min(idealLeft, window.innerWidth - panelWidth - VIEWPORT_PADDING),
  );

  return createPortal(
    <>
      <svg
        className="pointer-events-none"
        style={{
          position: "fixed",
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          zIndex: 9999,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          className="fill-none stroke-[2] stroke-yellow-100 animate-[marching-ants_0.5s_linear_infinite]"
          x={1}
          y={1}
          width={rect.width + 6}
          height={rect.height + 6}
          rx="8"
          ry="8"
          strokeDasharray="8,8"
        />
      </svg>
      <div
        ref={panelRef}
        className="pointer-events-auto"
        style={{
          position: "fixed",
          top,
          left,
          width: panelWidth,
          zIndex: 9999,
        }}
      >
        <Tutorial
          {...data}
          onPrimary={next}
          onSecondary={data.secondaryLabel ? skip : undefined}
          className="w-full shadow-xl"
        />
      </div>
    </>,
    document.body,
  );
};
