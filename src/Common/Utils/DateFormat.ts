export default class DateFormat {
  static toReadableString = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }
    const d = new Date(value);
    let formattedString = d.toLocaleDateString("en-CA");
    formattedString += " " + d.toLocaleTimeString("en-CA", { hour12: false }).substring(0, 5);
    return formattedString;
  };
}
