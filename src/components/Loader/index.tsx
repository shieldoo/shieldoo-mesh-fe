import { classNames } from "primereact/utils";

type Props = {
  size?: 'lg' | '2x' | '3x' | '4x' | '5x' | '10x';
};
function Loader(props: Props) {
  return (
    <i className={classNames("loader blue100 fa-duotone fa-pulse fa fa-spinner", `fa-${props.size}`)} />
  );
}

export default Loader;
