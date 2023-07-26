import { useSelector } from "react-redux";
import { AccessListener, Server } from "../../../api/generated";
import { selectors } from "../../../ducks/auth";
import useExpertMode from "../../../hooks/useExpertMode";

export function useServerData() {
  const { isExpertModeSet } = useExpertMode();
  const config = useSelector(selectors.selectUiConfig);

  const getServerWithDefaults = (server?: Server) => {
    const baseStruct = {
      id: 0,
      name: "",
      allowAutoUpdate: false,
      description: "",
    };

    if (isExpertModeSet) {
      (baseStruct as any).access = {
        ipAddress: "",
        punchBack: false,
        restrictiveNetwork: false,
        validTo: config?.maxCertificateValidity,
        description: "",
        listeners: [],
        fwConfig: {
          id: undefined,
        },
      };
    }
    const result = {...baseStruct, ...server }
    return result;
  };
  const getListenerWithDefaults = (listener?: AccessListener) => {
    const baseStruct = {
      accessListenerType: { id: "", glyph: "", name: "" },
      listenPort: undefined,
      protocol: "",
      forwardPort: undefined,
      forwardHost: "",
      description: "",
    };
    const result = {...baseStruct, ...listener }
    return result;
  };


  return { getServerWithDefaults, getListenerWithDefaults };
}
