import { useCallback, useState } from "react";

import Windows from "./clients/windows";
import Linux from "./clients/linux";
import MacOs from "./clients/macos";
import { ClientOs } from "../ConnectMeTypes";
import IOS from "./clients/ios";
import Android from "./clients/android";

type Props = {
  clientOs: ClientOs;
};

function ClientWizardContent(props: Props) {
  const [currentStep, updateCurrentStep] = useState(1);
  const unlockNextStep = useCallback(
    (id: number) => {
      if (id >= currentStep) {
        updateCurrentStep(id + 1);
      }
    },
    [currentStep]
  );
  const isUnlocked = useCallback(
    (id: number) => {
      return currentStep >= id;
    },
    [currentStep]
  );
  const isDone = useCallback(
    (id: number) => {
      return currentStep > id;
    },
    [currentStep]
  );

  return (
    <div className="client-wizard">
      {props.clientOs === ClientOs.Windows && (
        <Windows isUnlocked={isUnlocked} isDone={isDone} setDone={unlockNextStep} />
      )}
      {props.clientOs === ClientOs.Linux && <Linux isUnlocked={isUnlocked} isDone={isDone} setDone={unlockNextStep} />}
      {props.clientOs === ClientOs.MacOS && <MacOs isUnlocked={isUnlocked} isDone={isDone} setDone={unlockNextStep} />}
      {props.clientOs === ClientOs.iOS && <IOS isUnlocked={isUnlocked} isDone={isDone} setDone={unlockNextStep} />}
      {props.clientOs === ClientOs.Android && (
        <Android isUnlocked={isUnlocked} isDone={isDone} setDone={unlockNextStep} />
      )}
    </div>
  );
}

export default ClientWizardContent;
