import { useMemo } from "react";

export function useGreeting() {
  const time = new Date().getHours();
  const greeting = useMemo(() => {
    if (time < 12) {
      return "Good morning";
    } else if (time < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }, [time]);

  return { greeting };
}