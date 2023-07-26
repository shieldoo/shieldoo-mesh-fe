import { ClientStepsProps } from "../../ClientWizardTypes";
import Step from "../../components/Step";
import DownloadStep from "./DownloadStep";
import ConfigureStep from "./ConfigureStep";
import VerifyStep from "./VerifyStep";

function Windows(props: ClientStepsProps) {
  return (
    <>
      <Step
        id={1}
        title={"Step 1: Download the client"}
        content={<DownloadStep setDone={() => props.setDone(1)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
      <Step
        id={2}
        title={"Step 2: Install the client & sign in"}
        content={<ConfigureStep setDone={() => props.setDone(2)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
      <Step
        id={3}
        title={"Step 3: Establish a connection for the first time"}
        content={<VerifyStep setDone={() => props.setDone(3)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
    </>
  );
}

export default Windows;
