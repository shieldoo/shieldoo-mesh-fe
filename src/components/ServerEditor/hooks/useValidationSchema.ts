import { useSelector } from "react-redux";
import * as Yup from "yup";

import { selectors } from "../../../ducks/auth";
import useExpertMode from "../../../hooks/useExpertMode";
import DateFormat from "../../../Common/Utils/DateFormat";
import { addCustomYupMethods, ValidationMessage } from "../../../Common/Yup/ValidationUtils";

type ValidationSchemaProps = {
  maxCertificateValidity: string;
};

addCustomYupMethods();

const basicSchema = Yup.object().shape({
  name: Yup.string()
    //@ts-ignore
    .inputText()
    .required(ValidationMessage.REQUIRED),
  description: Yup.string().max(256),
});

const expertSchema = (props: ValidationSchemaProps) =>
  basicSchema.shape({
    access: Yup.object({
      ipAddress: Yup.string()
        //@ts-ignore
        .ipv4(),
      fwConfig: Yup.object({
        id: Yup.number().required(ValidationMessage.REQUIRED),
      }),
      validTo: Yup.string()
        .required("Enter a date or change to subscription lifetime")
        .test("min", "Date must be in the future", value => {
          const date = new Date(value as string);
          if (date.getTime() < new Date().getTime()) {
            return false;
          }
          return true;
        })
        .test("max", `Maximum valid date is ${DateFormat.toReadableString(props.maxCertificateValidity)}`, value => {
          const date = new Date(value as string);
          if (date.getTime() > new Date(props.maxCertificateValidity).getTime()) {
            return false;
          }
          return true;
        }),
      listeners: Yup.array()
        .of(
          Yup.object({
            accessListenerType: Yup.object({
              id: Yup.number().required(ValidationMessage.REQUIRED),
            }),
            listenPort: Yup.number()
              //@ts-ignore
              .port(),
            protocol: Yup.string().required(ValidationMessage.REQUIRED),
            forwardHost: Yup.string().required(ValidationMessage.REQUIRED),
            forwardPort: Yup.number()
              //@ts-ignore
              .port(),
          })
        )
        //@ts-ignore
        .unique("listenPort", ValidationMessage.DUPLICATE_LISTEN_PORT),
    }),
  });

export function useValidationSchema() {
  const { isExpertModeSet } = useExpertMode();
  const config = useSelector(selectors.selectUiConfig);


  return isExpertModeSet
    ? expertSchema({
        maxCertificateValidity: config?.maxCertificateValidity,
      })
    : basicSchema;
}
