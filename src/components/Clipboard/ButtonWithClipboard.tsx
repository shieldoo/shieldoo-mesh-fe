import { Button } from "primereact/button";
import { useRef } from "react";

import { useClipboard } from "../../hooks/useClipboard";
import { ClipboardProps } from "./ClipboardTypes";
import { classNames } from "primereact/utils";

function ButtonWithClipboard(props: ClipboardProps) {
  const buttonRef = useRef<any>();
  const clipboard = useClipboard({ promoteClipboard: props.promoteClipboard });

  return (
    <>
      <Button
        ref={buttonRef}
        className="p-button-secondary"
        style={{ padding: "0.2rem 0.2rem 0.4rem 0.6rem" }}
        icon={
          <i
            className={classNames({ 'fa-beat': clipboard.promoteClipboard, 'fa-check': clipboard.isClipboardSet, 'fa-copy': !clipboard.isClipboardSet })}
          />
        }
        onClick={() => {
          clipboard.setClipboard(props.value);
          props.onChange && props.onChange();
          buttonRef.current.blur();
        }}
      />
    </>
  );
}

export default ButtonWithClipboard;
