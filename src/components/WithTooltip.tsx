import React from "react";
import { Tooltip } from "primereact/tooltip";
import { classNames } from "primereact/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
  tooltip: string;
  tooltipPosition?: "left" | "right" | "top" | "bottom";
};

function WithTooltip({ children, className, inline, tooltip, tooltipPosition }: Props) {
  return (
    <div className={classNames({ flex: !inline, "inline-flex": inline }, "align-items-center", "gap-3", className)}>
      <div className="flex-grow-1">{children}</div>
      {tooltip && (
        <div>
          <Tooltip target=".fa-info-circle" position={tooltipPosition || "bottom"} showDelay={300} hideDelay={300} />
          <i className="fa-regular fa-info-circle text-2xl cursor-pointer" data-pr-tooltip={tooltip}></i>
        </div>
      )}
    </div>
  );
}

export default WithTooltip;
