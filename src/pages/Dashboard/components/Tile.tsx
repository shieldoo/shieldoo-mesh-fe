import { classNames } from "primereact/utils";
import { useState } from "react";

export enum TileSize {
  Small = "small",
  Large = "large",
}

function Tile({
  size,
  children,
  onClick,
  className,
}: {
  size: TileSize;
  children: JSX.Element;
  onClick?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={classNames("tile", size, { "tile-active": hover && onClick }, className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {onClick && (
        <div className="tile-arrow">
          <i className="fa fa-arrow-right" />
        </div>
      )}
      <div
        className={classNames("tile-content", {
          "tile-content-small": size === TileSize.Small,
        })}
      >
        {children}
      </div>
    </div>
  );
}

export default Tile;