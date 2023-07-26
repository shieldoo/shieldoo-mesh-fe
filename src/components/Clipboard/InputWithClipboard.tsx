import { useCallback } from "react";
import { classNames } from "primereact/utils";
import { InputText } from "primereact/inputtext";

import { useClipboard } from "../../hooks/useClipboard";
import { ClipboardProps } from "./ClipboardTypes";

function InputWithClipboard(props: ClipboardProps) {
  const clipboard = useClipboard({ promoteClipboard: props.promoteClipboard });

  const handleClipboard = useCallback(() => {
    clipboard.setClipboard(props.value);
    props.onChange && props.onChange();
  }, [clipboard, props]);

  return (
    <>
      <span className="p-input-icon-right">
        <i
          className={classNames("fa", { "fa-beat": clipboard.promoteClipboard, "fa-check": clipboard.isClipboardSet, "fa-copy": !clipboard.isClipboardSet })}
          onClick={handleClipboard}
        />
        <InputText width={500} value={props.value} onClick={handleClipboard} />
      </span>
    </>
  );
}

export default InputWithClipboard;
