import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Tag } from "primereact/tag";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generatePath, Link, useNavigate } from "react-router-dom";

import { Server, useServerDeleteMutation, useServersQuery } from "../../api/generated";
import { wrapLinks } from "../../Common/Utils/ParseUtils";
import HeaderPanel from "../../components/HeaderPanel";
import { useDebounce } from "../../hooks/useDebounce";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import ServerEditor from "../../components/ServerEditor";
import Page from "../../components/Page";
import useToast from "../../hooks/useToast";
import { AppRoute, IAppRoute } from "../../AppRoute";
import DeleteDialog from "../../components/DeleteDialog";
import DataTable from "../../components/DataTable";
import ServerStatusTag from "../../components/ServerStatusTag";

function Servers() {
  const [searchString, setSearchString] = useState("");
  const [editedServerId, setEditedServerId] = useState<number>(0);
  const [editedServerVisible, setEditedServerVisible] = useState<boolean>(false);
  const [deleteServer] = useServerDeleteMutation();
  const { debouncedValue: debouncedSearchString } = useDebounce(searchString);
  const [appVersion, setAppVersion] = useState<string>();
  const {
    isFetching: isLoadingServers,
    data: serversData,
    refetch: refetchServers,
  } = useServersQuery({ name: "%" + debouncedSearchString + "%" });
  const toast = useToast();
  const navigate = useNavigate();

  const onSearch = useCallback((searchVal: string) => setSearchString(searchVal), [setSearchString]);
  const addServer = useCallback(() => {
    setEditedServerVisible(true);
    setEditedServerId(0);
  }, []);
  const onEditClose = (server: Server | null): void => {
    if (server && !editedServerId) {
      navigate(generatePath(AppRoute.ServerDetail, { id: server.id.toString() }));
    }
    refetchServers();
    setEditedServerVisible(false);
    setEditedServerId(0);
  };

  useEffect(() => {
    // GET request using fetch - download version number from CDN
    fetch('https://download.shieldoo.io/latest/version.txt',{mode: 'cors', cache: 'no-store'})
        .then(response => response.text())
        .then(data => setAppVersion(data.trim()));
  }, []);
  
  function ContextMenu(server: Server) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems = useMemo(() => {
      return [
        {
          label: "Detail",
          icon: "fa-regular fa-eye",
          command: () => {
            const path = generatePath(AppRoute.ServerDetail, {
              id: server.id.toString(),
            });
            navigate(path);
          },
        },
        {
          label: "Edit",
          icon: "fa-regular fa-pencil",
          command: () => {
            setEditedServerId(server.id);
            setEditedServerVisible(true);
          },
        },
        {
          label: "Delete",
          icon: "fa-regular fa-trash",
          className: "danger",
          command: () => {
            setDeleteDialogVisible(true);
          },
        },
      ];
    }, [server.id]);

    const actionDeleteServer = async () => {
      try {
        await deleteServer({ id: server.id }).unwrap();
        refetchServers();
        toast.show({
          severity: "success",
          detail: `The server '${server.name}' has been deleted successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the server";
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
      <div className="flex">
        <Menu model={menuItems} className="server-dropdown-menu" popup ref={popupMenu} />
        <Button className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={e => popupMenu.current?.toggle(e)} />
        <DeleteDialog
          message={
            <>
              Are you sure you want to delete server <span className="font-bold">{server.name}</span>?<br />
              This action can not be undone.
            </>
          }
          header="Delete Server"
          accept={actionDeleteServer}
          onHide={() => setDeleteDialogVisible(false)}
          visible={deleteDialogVisible}
        />
      </div>
    );
  }

  const nameCellContent = (server: Server) => {
    const osIcon = (() => {
      switch (server.access.deviceInfo?.deviceOSType) {
        case "windows":
          return "fa fa-windows";
        case "linux":
          return "fa fa-linux";
        case "darwin":
          return "fa fa-apple";
        default:
          return "fa-regular fa-question";
      }
    })();
    return (
      <>
        <Avatar shape="circle" className="server-list-avatar" size="normal" icon={osIcon} />
        <Link className="onclick" to={generatePath(AppRoute.ServerDetail, { id: server.id.toString() })}>
          {server.name}
        </Link>
      </>
    );
  };

  const versionContent = (server: Server) => {
    const showWarning = server.access.deviceInfo?.deviceSWVersion !== appVersion;
    return (
      <>
        {server.access.deviceInfo?.deviceSWVersion !== "" && 
          <Tag 
            severity={showWarning ? "warning" : "success"} 
            icon={showWarning ? "fa fa-regular fa-warning" : undefined}
            value={server.access.deviceInfo?.deviceSWVersion} 
          />
        }
      </>
    );
  };

  const osUpdateContent = (server: Server) => {
    return server.serverOSAutoUpdatePolicy.osAutoUpdateEnabled ? (
      <>
        {!server.access.deviceInfo?.osAutoUpdate?.lastUpdateSuccess &&
          <Tag
            severity="danger"
            icon="fa fa-regular fa-exclamation-circle"
            value="failed"
          />
        }
        {server.access.deviceInfo?.osAutoUpdate?.lastUpdateSuccess &&
          <>
            {server.access.deviceInfo?.osAutoUpdate?.securityUpdatesCount === 0 && server.access.deviceInfo?.osAutoUpdate?.otherUpdatesCount === 0 &&
              <Tag
                severity="success"
                icon="fa fa-regular fa-check-circle"
                value="ok"
              />
            }
            {server.access.deviceInfo?.osAutoUpdate?.securityUpdatesCount !== 0 &&
              <Tag
                severity="warning"
                icon="fa fa-regular fa-shield"
                value={server.access.deviceInfo?.osAutoUpdate?.securityUpdatesCount}
              />
            }
            {server.access.deviceInfo?.osAutoUpdate?.otherUpdatesCount !== 0 &&
              <Tag
                severity="warning"
                icon="fa fa-regular fa-puzzle-piece"
                value={server.access.deviceInfo?.osAutoUpdate?.otherUpdatesCount}
              />
            }
          </>
        }
      </>
    ) : ( <></> );
  };

  const serverStatusBadge = (server: Server) => {
    return ServerStatusTag({ server: server });
  };

  return (
    <Page windowTitle={serversRoute.title} className="page-servers">
      <HeaderPanel
        titleText={serversRoute.title}
        showSearch
        searchPlaceHolder="Search by server name..."
        onSearch={onSearch}
      >
        <Button label="Create" className="p-button-sm" icon="fa-regular fa-plus" onClick={addServer} />
      </HeaderPanel>
      <div className="content-wrapper">
        <DataTable
          lazy
          value={serversData?.servers}
          loading={isLoadingServers}
          responsiveLayout="stack"
          emptyMessage="No servers found"
        >
          <Column style={{ width: "2%" }} field="id" header="ID" />
          <Column style={{ width: "25%" }} field="name" header="Name" body={nameCellContent} />
          <Column style={{ width: "8%" }} field="" header="Version" body={versionContent} />
          <Column style={{ width: "10%" }} field="access.ipAddress" header="IP Address" />
          <Column
            style={{ width: "30%" }}
            field="description"
            header="Description"
            className="long-text"
            body={data => wrapLinks(data.description)}
          />
          <Column style={{ width: "8%", whiteSpace: "nowrap" }} field="" header="OS update" body={osUpdateContent} />
          <Column style={{ width: "15%", whiteSpace: "nowrap" }} field="" header="Status" body={serverStatusBadge} />
          <Column style={{ width: "2%" }} header="" body={ContextMenu}></Column>
        </DataTable>
      </div>
      <ServerEditor visible={editedServerVisible} onClose={onEditClose} serverId={editedServerId} />
    </Page>
  );
}

const serversRoute: IAppRoute = {
  path: () => AppRoute.Servers,
  page: <Servers />,
  title: "Servers",
  iconClassName: "fa-regular fa-server",
  isAdminPage: true,
};

export default serversRoute;
