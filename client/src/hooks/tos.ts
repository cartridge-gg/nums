import { useCallback, useState } from "react";

const TOS_ACCEPTED_KEY = "nums-tos-accepted";

export const useTos = () => {
  const [accepted, setAccepted] = useState<boolean>(
    () => localStorage.getItem(TOS_ACCEPTED_KEY) === "true",
  );

  const accept = useCallback(() => {
    localStorage.setItem(TOS_ACCEPTED_KEY, "true");
    setAccepted(true);
  }, []);

  return { accepted, accept };
};
