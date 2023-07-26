export function useWindowTitle(pageName?: string) {
  const appName = "Shieldoo";
  document.title = pageName ? `${pageName} | ${appName}` : appName;
}
