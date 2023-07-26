type Props = {
  title: string;
  onClose?: () => void;
};

function SidePanelHeader(props: Props) {
  return (
    <div className="side-panel-header">
      <div className="title">
        <h2>{props.title}</h2>
      </div>
      <div className="action fa fa-regular fa-times fa-2x" onClick={props.onClose}></div>
    </div>
  );
}

export default SidePanelHeader;
