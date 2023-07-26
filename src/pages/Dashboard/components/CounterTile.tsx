import Tile, { TileSize } from "./Tile";

function CounterTile({ title, count, hasWarning, onClick }: { title: string; count: number; hasWarning?: boolean, onClick: () => void }) {
  return (
    <Tile size={TileSize.Small} onClick={onClick}>
      <div className="counter-tile">
        <div className="count">
          {hasWarning && <i className="fa fa-exclamation-triangle warning" />}
          {count}
        </div>
        <div className="title">{title}</div>
      </div>
    </Tile>
  );
}

export default CounterTile;
