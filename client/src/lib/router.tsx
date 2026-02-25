import {
  Link as RouterLink,
  Navigate as RouterNavigate,
  useLocation,
  useNavigate,
  type LinkProps,
  type NavigateProps,
  type To,
} from "react-router-dom";

/**
 * Merges current search params into the destination for internal navigation.
 * External URLs (http/https) and destinations with explicit search are unchanged.
 */
function mergeSearch(to: To, currentSearch: string): To {
  if (!currentSearch) return to;

  if (typeof to === "string") {
    if (to.startsWith("http://") || to.startsWith("https://")) return to;
    const [pathname, existingSearch] = to.split("?");
    return existingSearch ? to : `${pathname}${currentSearch}`;
  }

  const pathname = typeof to === "object" ? to.pathname ?? "" : "";
  if (
    typeof pathname === "string" &&
    (pathname.startsWith("http://") || pathname.startsWith("https://"))
  )
    return to;
  if (typeof to === "object" && to.search) return to;
  return typeof to === "object" ? { ...to, search: currentSearch } : to;
}

export interface LinkPropsWithSearch extends Omit<LinkProps, "to"> {
  to: To;
}

/**
 * Link that preserves search params when navigating to internal routes.
 */
export function Link({ to, ...props }: LinkPropsWithSearch) {
  const { search } = useLocation();
  const mergedTo = mergeSearch(to, search);
  return <RouterLink to={mergedTo} {...props} />;
}

/**
 * Navigate component that preserves search params when redirecting to internal routes.
 */
export function Navigate({ to, ...props }: NavigateProps) {
  const { search } = useLocation();
  const mergedTo = mergeSearch(to, search);
  return <RouterNavigate to={mergedTo} {...props} />;
}

/**
 * Navigate function that preserves search params when navigating to internal routes.
 */
export function usePreserveSearchNavigate() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return (to: To | number, options?: { replace?: boolean; state?: object }) => {
    if (typeof to === "number") {
      navigate(to);
      return;
    }
    const mergedTo = mergeSearch(to, search);
    navigate(mergedTo, options);
  };
}
