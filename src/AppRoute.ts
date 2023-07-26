import connectMeRoute from "./pages/ConnectMe";
import homeRoute from "./pages/Home";
import settingsLogsRoute from "./pages/System";
import networkRoute from "./pages/Users";

export enum AppRoute {
  Home = "/",
  ConnectMe = "/connect-me",
  Installations = "/connect-me",
  Users = "/users",
  UsersInvited = "/users?invited=:invited",
  UserDetail = "/users/:id",
  Groups = "/expert/groups",
  UserAccessTemplates = "/expert/useraccesstemplates",
  Devices = "/devices",
  AccessRights = "/access-rights",
  Servers = "/servers",
  ServerDetail = "/servers/:id",
  Firewall = "/expert/firewall",
  SettingsLogs = "/system",
  TelemetryLogs = "/expert/telemetry-logs",
  SecurityLogs = "/expert/security-logs",
  Help = "/help",
}
export interface IAppRoute {
  title: string;
  iconClassName?: string;
  path: () => AppRoute;
  page: JSX.Element;
  subRoutes?: IAppRoute[];
  isAdminPage?: boolean;
  isExpertMode?: boolean;
  isHidden?: boolean;
}

export const appRoutes: IAppRoute[] = [
  homeRoute,
  connectMeRoute,
  networkRoute,
  settingsLogsRoute,
];