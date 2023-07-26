import { Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";

import { Server, useLazyServerExpertQuery, useLazyServerQuery, useSaveServerMutation } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import SidePanel from "../SidePanel";
import BasicForm from "./basic";
import ExpertForm from "./expert";
import useExpertMode from "../../hooks/useExpertMode";
import useToast from "../../hooks/useToast";
import { useValidationSchema } from "./hooks/useValidationSchema";
import { useSaveMutation } from "./hooks/useSaveMutation";
import { useServerData } from "./hooks/useServerData";
import { deepClone } from "../../Common/Utils/ParseUtils";

type ServerDialogProps = {
  visible: boolean;
  serverId: number;
  onClose: (server: Server | null) => void;
};

function ServerDialog(props: ServerDialogProps) {
  const { isExpertModeSet } = useExpertMode();
  const { getSaveServerMutationData } = useSaveMutation();

  const [editedServer, setEditedServer] = useState<Server | undefined>(undefined);
  const serverData = useServerData();
  const validationSchema = useValidationSchema();

  const toast = useToast();

  const [getBasicQuery] = useLazyServerQuery();
  const [getExpertQuery] = useLazyServerExpertQuery();

  const [saveServer] = useSaveServerMutation();
  const getServer = useCallback(() => {
    return isExpertModeSet ? getExpertQuery : getBasicQuery;
  }, [getExpertQuery, getBasicQuery, isExpertModeSet]);

  const onSave = useCallback(
    async (server: Server) => {
      try {
        const body: any = { data: getSaveServerMutationData(server) };
        const response = await saveServer(body).unwrap();
        const update = { ...server, id: response.serverSave.id };
        props.onClose(update);
        toast.show({
          severity: "success",
          detail: `Server '${server.name}' saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        console.log(ex);
        const e = ex as RequestError;
        let emsg = "An unknown error occurred while saving the server settings";
        if (e.errors?.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    },
    [getSaveServerMutationData, props, saveServer, toast]
  );
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  useEffect(() => {
    const actionGetServer = async (id: number) => {
      try {
        const response = await getServer()({ id: id }).unwrap();

        if (isExpertModeSet) {
          /* Re-map groups for Multiselect */
          const mappedGroups = (response.server as Server).access.groups.map(g => g.name);
          const copy: Server = deepClone(response.server as Server);
          copy.access.groups = mappedGroups as any;
          setEditedServer(serverData.getServerWithDefaults(copy) as Server);
        } else {
          setEditedServer(serverData.getServerWithDefaults(response.server as Server) as Server);
        }
      } catch (ex) {
        const e = ex as RequestError;
        let emsg = "An unknown error occurred while loading the server settings";
        if (e.errors.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    };

    if (props.visible) {
      if (props.serverId !== 0) {
        actionGetServer(props.serverId);
      } else {
        setEditedServer(serverData.getServerWithDefaults() as Server);
      }
    } else {
      setEditedServer(undefined);
    }
    // eslint-disable-next-line
  }, [props.visible, props.serverId, getBasicQuery, toast, getServer, isExpertModeSet]);

  return (
    <>
      <SidePanel
        title={editedServer?.id ? editedServer.name : "Create Server"}
        onClose={() => props.onClose(null)}
        visible={props.visible}
        size="small"
      >
        {editedServer && (
          <>
            <Formik
              enableReinitialize={true}
              initialValues={editedServer}
              validationSchema={validationSchema}
              onSubmit={onSave}
            >
              {({ submitForm }) => (
                <>
                  <div className="side-panel-content">
                    <Form>{isExpertModeSet ? <ExpertForm /> : <BasicForm />}</Form>
                  </div>
                  <div className="side-panel-controls">
                    <Button
                      type="submit"
                      label={editedServer.id ? "Save" : "Create"}
                      icon={editedServer.id ? "fa-regular fa-save" : "fa-regular fa-plus"}
                      className="p-button-sm"
                      onClick={submitForm}
                    />
                    <Button
                      type="button"
                      label="Cancel"
                      className="p-button-sm p-button-secondary"
                      onClick={onCancel}
                    />
                  </div>
                </>
              )}
            </Formik>
          </>
        )}
      </SidePanel>
    </>
  );
}

export default ServerDialog;
