import { classNames } from "primereact/utils";
import Tile, { TileSize } from "./Tile";

type HeaderTileProps = {
  icon: string;
  title: string;
  text: string;
  onClick?: () => void;
};

function HeaderTile(props: HeaderTileProps) {
  return (
    <Tile size={TileSize.Small} onClick={props.onClick} className="tiles-header-tile">
      <div className="header-tile">
        <div className="icon-container">
          <i className={classNames("icon", "fa", props.icon)} />
        </div>
        <div className="title">{props.title}</div>
        <div className="text">{props.text}</div>
      </div>
    </Tile>
  );
}

export default HeaderTile;
