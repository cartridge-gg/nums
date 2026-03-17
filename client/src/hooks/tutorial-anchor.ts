import { useEffect, useLayoutEffect, useState } from "react";
import type { TutorialAnchor } from "@/models/tutorial";

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function anchorToId(anchor: TutorialAnchor): string {
  switch (anchor.type) {
    case "num":
      return "tutorial-num";
    case "next_num":
      return "tutorial-next-num";
    case "multiplier":
      return "tutorial-multiplier";
    case "reward":
      return "tutorial-reward";
    case "stages":
      return "tutorial-stages";
    case "slots":
      return "tutorial-slots";
    case "slot":
      return `tutorial-slot-${anchor.index}`;
    case "power":
      return `tutorial-power-${anchor.index}`;
    case "powers":
      return `tutorial-powers-${anchor.index}`;
  }
}

export function anchorId(anchor: TutorialAnchor): string {
  return anchorToId(anchor);
}

export function useTutorialAnchor(
  anchor: TutorialAnchor | undefined,
): AnchorRect | null {
  const [rect, setRect] = useState<AnchorRect | null>(null);

  useLayoutEffect(() => {
    if (!anchor) {
      setRect(null);
      return;
    }

    const id = anchorToId(anchor);

    function findVisible(id: string): Element | null {
      const all = document.querySelectorAll(`#${id}, [id="${id}"]`);
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return el;
      }
      return null;
    }

    function measure() {
      const el = findVisible(id);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    measure();

    const el = findVisible(anchorToId(anchor));
    if (!el) return;

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [anchor]);

  useEffect(() => {
    if (!anchor) return;
    const id = anchorToId(anchor);
    let retries = 0;
    const interval = setInterval(() => {
      const all = document.querySelectorAll(`#${id}, [id="${id}"]`);
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          });
          clearInterval(interval);
          return;
        }
      }
      if (++retries > 20) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [anchor?.type, (anchor as { index?: number })?.index]);

  return rect;
}
