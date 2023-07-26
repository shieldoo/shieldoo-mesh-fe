import { Client, ClientOs } from "./ConnectMeTypes";

export const clients: Client[] = [
  {
    os: ClientOs.Windows,
    note: "Requires Windows 10 or later",
    clientUrl: "https://download.shieldoo.io/latest/windows-amd64-shieldoo-mesh-setup.exe",
    serverUrl: "https://download.shieldoo.io/latest/windows-amd64-shieldoo-mesh-svc-setup.exe",
    downloadSize: "17 MB",
    clientInstall: true,
  },
  {
    os: ClientOs.Linux,
    note: "Multiple supported versions",
    clientUrl: "https://download.shieldoo.io/latest/linux-amd64-install.sh",
    serverUrl: "https://download.shieldoo.io/latest/linux-amd64-shieldoo-mesh-svc-setup.tar.gz",
    serverScriptUrl: "https://download.shieldoo.io/latest/linux-amd64-install-svc.sh",
    clientInstall: true,
  },
  {
    os: ClientOs.Raspberry,
    note: "Multiple supported versions",
    clientUrl: "",
    serverUrl: "https://download.shieldoo.io/latest/linux-arm7-shieldoo-mesh-svc-setup.tar.gz",
    serverScriptUrl: "https://download.shieldoo.io/latest/linux-arm7-install-svc.sh",
    clientInstall: false,
  },
  {
    os: ClientOs.MacOS,
    note: "Requires macOS High Sierra 10.13 or later",
    clientUrl: "https://download.shieldoo.io/latest/darwin-x64-shieldoo-mesh-setup.pkg",
    serverUrl: "https://download.shieldoo.io/latest/darwin-x64-shieldoo-mesh-svc-setup.pkg",
    downloadSize: "28 MB",
    clientInstall: true,
  },
  {
    os: ClientOs.Android,
    note: "Requires Android 7.1 and up",
    clientUrl: "https://play.google.com/store/apps/details?id=net.defined.mobile_nebula",
    serverUrl: "",
    downloadSize: "27 MB",
    clientInstall: true,
  },
  {
    os: ClientOs.iOS,
    note: "Requires iOS 14 or later",
    clientUrl: "https://apps.apple.com/cz/app/mobile-nebula/id1509587936",
    serverUrl: "",
    downloadSize: "55 MB",
    clientInstall: true,
  },
];
