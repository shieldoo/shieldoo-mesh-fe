import { ClientStepsProps } from "../../ClientWizardTypes";
import Step from "../../components/Step";
import DownloadStep from "./DownloadStep";
import VerifyStep from "./VerifyStep";

function Linux(props: ClientStepsProps) {
  return (
    <>
      <Step
        id={1}
        title={"Step 1: Download & install the Shieldoo client"}
        content={<DownloadStep setDone={() => props.setDone(1)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
      <Step
        id={2}
        title={"Step 2: Establish a connection for the first time"}
        content={<VerifyStep setDone={() => props.setDone(2)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
    </>
  );
}

export default Linux;
