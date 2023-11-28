import { useCallback } from "react";

import { AccessListenerData, Server, ServerData } from "../../../api/generated";
import useExpertMode from "../../../hooks/useExpertMode";
import { useGroups } from "./useGroups";

export function useSaveMutation() {
  const { isExpertModeSet } = useExpertMode();
  const { getIdsFromNames } = useGroups();

  const getIdOrUndefined = (id: number): number | undefined => {
    return (id > 0) ? id : undefined
  }
  const getSaveBasicMutationData = useCallback((server: Server): ServerData => {
    return {
      id: getIdOrUndefined(server.id),
      name: server.name,
      allowAutoUpdate: server.allowAutoUpdate,
      description: server.description,
    };
  }, []);
  const getSaveExpertMutationData = useCallback(
    (server: Server): ServerData => {
      return {
        id: getIdOrUndefined(server.id),
        name: server.name,
        allowAutoUpdate: server.allowAutoUpdate,
        description: server.description,
        access: {
          ipAddress: server.access?.ipAddress,
          additionalHostnames: server.access?.additionalHostnames || [],
          groupsIds: getIdsFromNames(server.access?.groups || []),
          fwConfigId: server.access?.fwConfig?.id,
          validTo: new Date(server.access?.validTo),
          listeners: server.access?.listeners.map(listener => {
            return {
              accessListenerTypeId: listener.accessListenerType?.id,
              description: listener.description,
              forwardHost: listener.forwardHost,
              forwardPort: listener.forwardPort,
              listenPort: listener.listenPort,
              protocol: listener.protocol
            } as AccessListenerData
          }) || [],
          punchBack: server.access?.punchBack || false,
          restrictiveNetwork: server.access?.restrictiveNetwork || false,
        },
        osAutoUpdatePolicy: {
          osAutoUpdateEnabled: server.serverOSAutoUpdatePolicy?.osAutoUpdateEnabled || false,
          osAutoUpdateHour: server.serverOSAutoUpdatePolicy?.osAutoUpdateHour || 0,
          restartAfterUpdate: server.serverOSAutoUpdatePolicy?.restartAfterUpdate || false,
          securityAutoUpdateEnabled: server.serverOSAutoUpdatePolicy?.securityAutoUpdateEnabled || false,
          allAutoUpdateEnabled: server.serverOSAutoUpdatePolicy?.allAutoUpdateEnabled || false,
        },
      };
    },
    [getIdsFromNames]
  );
  const getSaveServerMutationData = useCallback(
    (server: Server): ServerData => {
      return isExpertModeSet ? getSaveExpertMutationData(server) : getSaveBasicMutationData(server);
    },
    [getSaveBasicMutationData, getSaveExpertMutationData, isExpertModeSet]
  );

  return { getSaveServerMutationData };
}
