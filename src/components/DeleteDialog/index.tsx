import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";

type DeleteDialogProps = {
  message: React.ReactNode;
  header: string;
  accept?: () => void;
  onHide?: () => void;
  visible: boolean;
};

function DeleteDialog(props: DeleteDialogProps) {
  const accept = () => {
    props.accept && props.accept();
    props.onHide && props.onHide();
  };

  const reject = () => {
    props.onHide && props.onHide();
  };

  const footer = (
    <>
      <Button label="Delete" className="p-button p-button-primary-danger" onClick={accept} autoFocus />
      <Button label="Cancel" className="ml-3 p-button-sm p-button-text " onClick={reject} />
    </>
  );

  return <ConfirmDialog footer={footer} message={props.message} header={props.header} accept={props.accept} onHide={props.onHide} visible={props.visible} />;
}

export default DeleteDialog;
