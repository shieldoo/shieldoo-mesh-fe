import { Button } from "primereact/button";
import { useRef } from "react";
import { CodeBlock } from "react-code-blocks";

import { useClipboard } from "../../hooks/useClipboard";
import { ClipboardProps } from "./ClipboardTypes";
import { classNames } from "primereact/utils";

function CommandWithClipboard(props: ClipboardProps) {
  const buttonRef = useRef<any>();
  const clipboard = useClipboard({ promoteClipboard: props.promoteClipboard });

  return (
    <>
      <span className={props.classNames}>
        <CodeBlock text={props.value} language="shell" showLineNumbers={false} />
      </span>
      <p></p>
      <Button
        ref={buttonRef}
        className="p-button-secondary"
        icon={
          <i
            className={classNames({ 'fa-beat': clipboard.promoteClipboard, 'fa-check': clipboard.isClipboardSet, 'fa-copy': !clipboard.isClipboardSet })}
          />
        }
        label="Copy to clipboard"
        onClick={() => {
          clipboard.setClipboard(props.value);
          props.onChange && props.onChange();
          buttonRef.current.blur();
        }}
      />
    </>
  );
}

export default CommandWithClipboard;
