export type AccessCard = {
  name: string;
  rights: AccessRight[];
};

export type AccessRight = {
  serverName: string;
  ip: string;
  listeners: AccessRightListener[];
  description: string;
  statistic: AccessStatistic;
};

export type AccessRightListener = {
  listenPort: number;
  protocol: string;
  forwardPort: number;
  forwardHost: string;
  description: string;
  icon: string;
};

export type AccessStatistic = {
  isConnectd: boolean | null | undefined;
  isOverRestrictiveNetwork: boolean | null | undefined;
  lastContact: Date | null | undefined;
  lastContactFromNow: number | null | undefined;
};

export type AccessRightListenerType = "server" | "printer" | "nas" | "other"