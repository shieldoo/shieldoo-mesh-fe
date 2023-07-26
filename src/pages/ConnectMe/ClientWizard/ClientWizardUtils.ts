import { clients } from "../ConnectMeData";
import { ClientOs } from "../ConnectMeTypes";

export function getClientByOs(clientOs: ClientOs) {
  const client = clients.find(c => c.os === clientOs);
  if (!client) {
    throw new Error(`Unable to find a client for the '${clientOs}' operating system`);
  }
  return client;
}

export function parseFilenameFromUrl(url: string | undefined) {
  const path = url?.split("/");
  return path ? path[path.length - 1] : "";
}
