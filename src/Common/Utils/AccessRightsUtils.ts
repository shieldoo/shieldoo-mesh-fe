import { AccessRightListenerType } from "../../pages/MyAccessRights/MyAccessRightsTypes";

export function resolveAccessRightListenerIcon(
  listenerType?: AccessRightListenerType
): string {
  switch (listenerType) {
    case "server":
      return 'fa-server';
    case "printer":
      return 'fa-print';
    case "nas":
      return 'fa-server';
    default:
      return 'fa-mobile';
  }
}
