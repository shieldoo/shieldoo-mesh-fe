import { useCallback, useState } from "react";

type Props = {
  promoteClipboard?: boolean;
};

export function useClipboard(props: Props) {
  const [promoteClipboard, setPromoteClipboard] = useState(props.promoteClipboard || false);
  const [isClipboardSet, setIsClipboardSet] = useState(false);

  const setClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    setIsClipboardSet(true);
    setPromoteClipboard(false);

    setTimeout(() => {
      setIsClipboardSet(false);
    }, 1000);
  }, []);
  return { isClipboardSet, setClipboard, promoteClipboard };
}
