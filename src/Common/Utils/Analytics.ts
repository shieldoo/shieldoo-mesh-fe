// Google
let GOOGLE_TAG_ID: string = window.GOOGLE_ANALYTICS_ID;

export function event(name: string, params?: object) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

export function pageView(location: string, title?: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GOOGLE_TAG_ID, {
      page_title: title,
      page_location: location,
    });
  }
}

export function showID(){
  alert(GOOGLE_TAG_ID);
}
