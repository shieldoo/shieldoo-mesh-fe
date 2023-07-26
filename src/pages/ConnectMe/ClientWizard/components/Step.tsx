import { classNames } from "primereact/utils";

type Props = {
  id: number;
  title: string;
  content: React.ReactNode;
  unlocked: (id: number) => boolean;
  done: (id: number) => boolean;
};

function Step(props: Props) {
  const isUnlocked = props.unlocked(props.id);
  const isDone = props.done(props.id);
  return (
    <div
      className={classNames("shadow-container", "step-container", {
        "step-completed": isUnlocked && isDone,
      })}
    >
      <div className="state">
        <StepStatus isUnlocked={isUnlocked} isDone={isDone} />
      </div>
      <div className="step">
        <div className="title">{props.title}</div>
        {isUnlocked && <div className="content">{props.content}</div>}
      </div>
    </div>
  );
}

function StepStatus({ isUnlocked, isDone }: { isUnlocked: boolean; isDone: boolean }) {
  if (!isUnlocked) {
    return <i className="fa fa-lock fa-2x" />;
  }
  if (isDone) {
    return (
      <i
        className={classNames("fa", "fa-2x", "fa-check-circle", "fa-duotone", {
          "state-completed": isUnlocked && isDone,
        })}
      />
    );
  }
  return <i className="fa fa-circle fa-2x" />;
}

export default Step;
