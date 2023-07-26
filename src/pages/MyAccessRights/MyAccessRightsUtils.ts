import { AccessRightsQuery } from "../../api/generated";
import { resolveAccessRightListenerIcon } from "../../Common/Utils/AccessRightsUtils";
import { AccessCard, AccessRightListenerType } from "./MyAccessRightsTypes";

export function convertAccessRightsQueryToAccesses(meData: AccessRightsQuery): AccessCard[]  {
   return meData.me.userAccesses.map(
        (userAccess) => {
          return {
            name: userAccess.name,
            rights: userAccess.serversForAccess
              ? userAccess.serversForAccess.map((accessServer) => {
                  const server = accessServer!;

                  return {
                    serverName: server.name,
                    ip: server.ipAddress,
                    listeners: server.listeners.map((listener) => ({
                      listenPort: listener.listenPort ?? 0,
                      protocol: listener.protocol ?? "",
                      forwardPort: listener.forwardPort ?? 0,
                      forwardHost: listener.forwardHost ?? "",
                      description: listener.description ?? "",
                      icon: resolveAccessRightListenerIcon(
                        listener.accessListenerType
                          ?.glyph as AccessRightListenerType
                      ),
                    })),
                    description: server.description ?? "",
                    statistic: {
                      isConnectd: server.statistics?.isConnectd,
                      isOverRestrictiveNetwork: server.statistics?.isOverRestrictiveNetwork,
                      lastContact: server.statistics?.lastContact,
                      lastContactFromNow: server.statistics?.lastContactFromNow,
                    }
                  };
                })
              : [],
          };
        }
      )
}