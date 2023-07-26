import { Tooltip } from "primereact/tooltip";

export function Ellipsis({ value, maxWidth }: { value: string; maxWidth?: number }) {
  const style = maxWidth ? { maxWidth } : {};
  return (
    <div style={style} className="white-space-nowrap overflow-hidden text-overflow-ellipsis">
      {value}
    </div>
  );
}
export function EllipsisWithTooltip({
  value,
  tooltipPosition,
  maxWidth,
}: {
  value: string;
  tooltipPosition?: "left" | "right" | "top" | "bottom";
  maxWidth?: number;
}) {
  return (
    <>
      <Tooltip target=".ellipsisWithTooltip" position={tooltipPosition || "top"} showDelay={300} hideDelay={300} />
      <span className="ellipsisWithTooltip" data-pr-tooltip={value}>
        <Ellipsis value={value} maxWidth={maxWidth} />
      </span>
    </>
  );
}
