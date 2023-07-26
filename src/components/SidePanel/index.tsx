import React from "react";
import { classNames } from "primereact/utils";

import SidePanelHeader from "./SidePanelHeader";

type Props = {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  visible?: boolean;
  size?: "x-small" | "small" | "medium" | "wide";
};

function SidePanel(props: Props) {
  return (
    <aside
      className={classNames("side-panel", props.size || "small", props.className, { "side-visible": props.visible })}
    >
      <div className="side-panel-wrapper">
        <div className="side-panel-content-container">
          <SidePanelHeader title={props.title || ""} onClose={props.onClose} />
          {props.children}
        </div>
      </div>
    </aside>
  );
}

export default SidePanel;
