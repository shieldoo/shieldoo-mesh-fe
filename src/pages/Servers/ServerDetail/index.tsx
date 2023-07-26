import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Server,
  useServerDeleteMutation,
  useServerDetailQuery,
} from "../../../api/generated";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import { AppRoute, IAppRoute } from "../../../AppRoute";
import DeleteDialog from "../../../components/DeleteDialog";
import Page from "../../../components/Page";
import WarningContent from "../../../components/WarningContent";
import useAppNavigate from "../../../hooks/useAppNavigate";
import useToast from "../../../hooks/useToast";
import CustomBar from "./CustomBar";
import ServerEditor from "../../../components/ServerEditor";
import InstallInstructions from "./InstallInstructions";
import OSAutoUpdate from "./OSAutoUpdate";

function ServerDetail() {
  const params = useParams<{ id: string }>();
  const {
    data: server,
    refetch: refetchServer,
    isError: editServerIsError,
    error: editServerError,
  } = useServerDetailQuery({ id: parseInt(params.id!) });

  const [editedServerVisible, setEditedServerVisible] =
    useState<boolean>(false);
  const [deleteServerVisible, setDeleteServerVisible] =
    useState<boolean>(false);
  const [deleteServer] = useServerDeleteMutation();
  const [errorNotFound, setErrorNotFound] = useState<boolean>(false);

  const navigate = useAppNavigate();
  const toast = useToast();

  const deviceOs = server?.server.access.deviceInfo?.deviceOSType;

  useEffect(() => {
    if (editServerIsError) {
      let e = editServerError as RequestError;
      let emsg = "An unknown error occurred while loading the server settings";
      if (e.errors.length > 0) {
        emsg = e.errors[0].message;
      }
      if (emsg === "record not found") {
        setErrorNotFound(true);
      } else {
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    } else {
      setErrorNotFound(false);
    }
  }, [editServerIsError, editServerError, toast]);

  const onEdit = useCallback(() => {
    setEditedServerVisible(true);
  }, []);
  const onEditClose = (): void => {
    refetchServer();
    setEditedServerVisible(false);
  };
  const onDelete = useCallback(() => {
    setDeleteServerVisible(true);
  }, []);

  const onDeleteCallback = async () => {
    try {
      await deleteServer({ id: server?.server.id! }).unwrap();
      toast.show({
        severity: "success",
        detail: `The user '${server?.server.name}' has been deleted successfully.`,
        life: 4000,
      });
      navigate(AppRoute.Servers);
    } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while deleting the user";
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

  return (
    <Page
      windowTitle={serverDetailRoute.title}
      className="page-entity-detail"
      topBar={
        <CustomBar
          onDelete={onDelete}
          onEdit={onEdit}
          server={server?.server as Server}
          serverNotFound={errorNotFound}
          serverStats={
            {
              connected: server?.server.access.statistics?.isConnectd,
              lastSeen: server?.server.access.statistics?.lastContactFromNow || 1000,
              lastSeenDate: server?.server.access.statistics?.lastContact,
              serverOS: server?.server.access.deviceInfo?.deviceOS || "unknown",
              serverOSType: server?.server.access.deviceInfo?.deviceOSType || "unknown",
              serverSWVersion: server?.server.access.deviceInfo?.deviceSWVersion || "unknown",
            }
          }
        />
      }
    >
      {errorNotFound ? (
        <WarningContent title="Server Not Found" content="This server does not exist." />
      ) : (
        <>
          {server?.server.serverOSAutoUpdatePolicy.osAutoUpdateEnabled && (
            <div className="content-wrapper">
              <OSAutoUpdate device={server?.server.access.deviceInfo || undefined} />
            </div>
          )}
          <div className="content-wrapper">
            <InstallInstructions deviceOs={deviceOs} />
          </div>
          <ServerEditor
            visible={editedServerVisible}
            onClose={onEditClose}
            serverId={server?.server.id!}
          />
          <DeleteDialog
            message={
              <>
                Are you sure you want to delete server <span className="font-bold">{server?.server.name}</span>?<br />
                This action can not be undone.
              </>
            }
            header="Delete Server"
            accept={onDeleteCallback}
            onHide={() => setDeleteServerVisible(false)}
            visible={deleteServerVisible}
          />
        </>
      )}
    </Page>
  );
}

const serverDetailRoute: IAppRoute = {
  path: () => AppRoute.ServerDetail,
  page: <ServerDetail />,
  title: "Server Detail",
  iconClassName: "fa-regular fa-server",
  isAdminPage: true,
  isHidden: true,
};

export default serverDetailRoute;
