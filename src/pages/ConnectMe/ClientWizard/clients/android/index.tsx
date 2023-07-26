import { useState } from "react";
import { UserDeviceCreateMutation, useUserDeviceCreateMutation } from "../../../../../api/generated";
import { RequestError } from "../../../../../api/graphqlBaseQueryTypes";
import useToast from "../../../../../hooks/useToast";
import { ClientStepsProps } from "../../ClientWizardTypes";
import Step from "../../components/Step";
import ConfigureStep from "./ConfigureStep";
import DownloadStep from "./DownloadStep";

type UserAccessDeviceInfo = UserDeviceCreateMutation["userDeviceCreate"];

function Android(props: ClientStepsProps) {
  const [createDevice] = useUserDeviceCreateMutation();
  const [edDevice, setEdDevice] = useState<UserAccessDeviceInfo | undefined>(undefined);
  const toast = useToast();

  const actionCreate = async (accid: number, pem: string) => {
    try {
      const ret = await createDevice({
        userAccessId: accid,
        publicKey: pem,
        data: {
          deviceId: "android",
          deviceOS: "android",
          deviceOSType: "android",
          deviceSWVersion: "nebula",
          name: "android",
          contacted: new Date().toISOString(),
        },
      }).unwrap();
      toast.show({
        severity: "success",
        detail: `Your device was onboarded successfully.`,
        life: 4000,
      });
      props.setDone(1);
      setEdDevice(ret.userDeviceCreate);
    } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while creating the device";
      if (e.errors.length > 0) {
        emsg = e.errors[0].message;
      }
      toast.show({
        severity: "error",
        detail: emsg,
        life: 4000,
      });
    }
  };

  return (
    <>
      <Step
        id={1}
        title={"Step 1: Download & install the client"}
        content={<DownloadStep setDone={(a, d) => actionCreate(a, d)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
      <Step
        id={2}
        title={"Step 2: Configure the client"}
        content={<ConfigureStep data={edDevice} setDone={() => props.setDone(2)} />}
        unlocked={props.isUnlocked}
        done={props.isDone}
      />
    </>
  );
}

export default Android;
