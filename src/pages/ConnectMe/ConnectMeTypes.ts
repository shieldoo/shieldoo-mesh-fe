export enum ClientOs {
  Windows = "Windows",
  MacOS = "macOS",
  Linux = "Linux",
  Raspberry = "Raspberry Pi",
  Android = "Android",
  iOS = "iOS",
  Unsupported = "Unsupported",
}
export type ClientPanelProps = {
  os: ClientOs;
  note: string;
  onClick: (os: ClientOs) => void;
  isDisabled?: boolean;
  appVersion?: string;
};
export type Client = {
  os: ClientOs;
  note: string;
  isDisabled?: boolean;
  clientUrl?: string;
  serverUrl?: string;
  serverScriptUrl?: string;
  downloadSize?: string;
  clientInstall: boolean;
};
