import * as Yup from "yup";

export enum ValidationMessage {
  REQUIRED = "Required",
  DUPLICATE_LISTEN_PORT = "Listen port is already used.",
  INVALID_IPV4_ADDRESS = "Invalid IP address",
  INVALID_PORT_RANGE = "The valid port range is 1-65535",
  INVALID_INPUT_TEXT = "Invalid input text. The allowed characters are: a-z A-Z 0-9 . -",
}

export function addCustomYupMethods() {
  Yup.addMethod(Yup.array, "unique", function (field: string, message: string) {
    return this.test("unique", message, function (array: any[] = []) {
      const uniqueData = Array.from(new Set(array.map(row => row[field])));
      const isUnique = array.length === uniqueData.length;
      if (isUnique) {
        return true;
      }
      const index = array.findIndex((row, i) => row[field] !== uniqueData[i]);
      if (array[index][field] === "") {
        return true;
      }

      return this.createError({
        path: `${this.path}.${index}.${field}`,
        message,
      });
    });
  });
  Yup.addMethod(Yup.string, "inputText", function (message: string, _mapper = (a: any) => a) {
    return this.matches(/^[0-9a-zA-Z-.]{1,256}$/, message || ValidationMessage.INVALID_INPUT_TEXT);
  });
  Yup.addMethod(Yup.string, "ipv4", function (message: string, _mapper = (a: any) => a) {
    return this.matches(
      /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/gm,
      message || ValidationMessage.INVALID_IPV4_ADDRESS
    );
  });
  Yup.addMethod(Yup.number, "port", function (message: string, _mapper = (a: any) => a) {
    return this.test("valid", message || ValidationMessage.INVALID_PORT_RANGE, value => {
      if (value !== undefined) {
        return value > 0 && value <= 65535;
      }
      return false;
    });
  });
}
