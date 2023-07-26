
export function resolveDeviceTypeIcon(
  deviceOsType: string
): string {
  switch (deviceOsType) {
    case "windows":
      return 'fa-windows';
    case "darwin":
      return 'fa-apple';
    case "linux":
      return 'fa-linux';
    case "android":
      return 'fa-android';
    case "ios":
      return 'fa-apple';
    case "synology":
      return 'fa-server';
    default:
      return 'fa-mobile';
  }
}

export function resolveDeviceTypeName(deviceOsType: string): string {
  switch (deviceOsType) {
    case "windows":
      return "Windows";
    case "darwin":
      return "macOS";
    case "linux":
      return "Linux";
    case "android":
      return "Android";
    case "ios":
      return "iOS";
    case "synology":
      return "Synology NAS";
    default:
      return "unknown";
  }
}
