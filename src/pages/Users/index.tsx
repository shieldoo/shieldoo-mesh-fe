import { useEffect, useState } from "react";
import { generatePath, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";

import HeaderPanel from "../../components/HeaderPanel";
import InviteUsersDialog from "./InviteUsersDialog";
import UserListTable, { ListedUser } from "./UserListTable";
import { useUsersQuery, UserSaveMutation } from "../../api/generated";
import { useDebounce } from "../../hooks/useDebounce";
import Page from "../../components/Page";
import useToast from "../../hooks/useToast";
import EditUserDialog from "./UserEditDialog";
import useExpertMode from "../../hooks/useExpertMode";
import { AppRoute, IAppRoute } from "../../AppRoute";
import MenuButton from "../../components/MenuButton";
import { InputSwitch } from "primereact/inputswitch";
import userDetailRoute from "./UserDetail";
import groupsRoute from "../ExpertMode/Groups";
import serversRoute from "../Servers/Servers";
import firewallsRoute from "../ExpertMode/Firewalls";
import userAccessTemplatesRoute from "../ExpertMode/UserAccessesTemplates";
import serverDetailRoute from "../Servers/ServerDetail";
import { selectors } from "../../ducks/auth";
import { useSelector } from "react-redux";

type User = UserSaveMutation["userSave"];

function Users() {
  const [inviteUsersOpened, setInviteUsersOpened] = useState<boolean>(false);
  const [invitedUsers, setInvitedUsers] = useState<boolean>(false);
  const [editUserOpened, setEditUserOpened] = useState<boolean>(false);
  const [listedUsers, setListedUsers] = useState<ListedUser[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const { debouncedValue, isDebouncing } = useDebounce(searchString);
  const { isFetching: isFetchingUsers, data: userData, refetch: refetchUsers } = useUsersQuery({ search: "%" + debouncedValue + "%", origin: invitedUsers ? "invited" : null });
  const toast = useToast();
  const { isExpertModeSet } = useExpertMode();
  const navigate = useNavigate();
  const config = useSelector(selectors.selectUiConfig);

  const [params] = useSearchParams();
  useEffect(() => {
    if (params.get("invited") === "true") {
      setInvitedUsers(true);
    }
  }, [params]);

  useEffect(() => {
    const list: ListedUser[] = userData
      ? userData.users.map((val) => {
          return { ...val, groups: val.userAccesses.length > 0 ? val.userAccesses.flatMap((ac) => ac.name).join(", ") : "-" };
        })
      : [];
    setListedUsers(list);
  }, [userData]);

  const inviteUsersButtonClick = () => {
    setInviteUsersOpened(true);
  };

  const createUserButtonClick = () => {
    setEditUserOpened(true);
  };

  const closeUserEditDialog = (user: User | null) => {
    if (user) {
      refetchUsers();
      // transition to user detail page
      navigate(generatePath(AppRoute.UserDetail, { id: user.id.toString() }));
    }
    setEditUserOpened(false);
  };

  const closeUsersInviteDialog = (isRefetchNeeded: boolean, successfulCount?: number, errorCount?: number) => {
    setInviteUsersOpened(false);

    if (isRefetchNeeded) {
      refetchUsers();
    }

    if (errorCount! && errorCount > 0) {
      errorHandler(`Failed to invite ${errorCount} users`);
    }

    if (successfulCount && successfulCount > 0) {
      toast.show({
        severity: "success",
        detail: `Sent ${successfulCount} invitations successfully`,
        life: 4000,
      });
    }
  };

  const rowModified = (modifiedUser: Partial<ListedUser>) => {
    refetchUsers();
    toast.show({
      severity: "success",
      detail: `User '${modifiedUser.name}' has been saved successfully`,
      life: 4000,
    });
  };

  const errorHandler = (errorMessage: string) => {
    toast.show({
      severity: "error",
      detail: errorMessage,
      life: 4000,
    });
  };

  const rowDeleted = () => {
    refetchUsers();
    toast.show({
      severity: "success",
      detail: `User has been deleted successfully`,
      life: 4000,
    });
  };

  const inviteItems = [
    { label: "Single user", command: createUserButtonClick },
    { label: "Multiple users", command: inviteUsersButtonClick },
  ];

  return (
    <Page windowTitle={usersRoute.title} className="page-users">
      <HeaderPanel titleText={usersRoute.title} showSearch searchPlaceHolder="Search by name, email ..." onSearch={(searchVal) => setSearchString(searchVal)}>
        {(isExpertModeSet && !config?.identityImportEnabled) && <MenuButton text="Invite" icon="fa-regular fa-user-plus" model={inviteItems} />}
        {(!isExpertModeSet && !config?.identityImportEnabled) && <Button label="Invite Users" className="p-button-sm" icon="fa-regular fa-user-plus" onClick={inviteUsersButtonClick} />}
        {!config?.identityImportEnabled &&
          <div
          className="flex"
          onClick={() => {
            setInvitedUsers(!invitedUsers);
          }}
        >
          <InputSwitch className="ml-8" checked={invitedUsers} />
          <span className="toggle-button-label">Invited</span>
        </div>
      }
      </HeaderPanel>
      <div className="content-wrapper">
        <UserListTable users={listedUsers} loading={isFetchingUsers || isDebouncing} onRowModified={rowModified} onRowDeleted={rowDeleted} errorHandler={errorHandler} />
      </div>
      <InviteUsersDialog isShown={inviteUsersOpened} onDialogClosed={closeUsersInviteDialog} />
      <EditUserDialog visible={editUserOpened} userId={undefined} onClose={closeUserEditDialog} />
    </Page>
  );
}

const usersRoute: IAppRoute = {
  path: () => AppRoute.Users,
  page: <Users />,
  title: "Users",
  iconClassName: "fa-regular fa-users",
  isAdminPage: true,
};

const networkRoute: IAppRoute = {
  path: () => AppRoute.Users,
  page: <></>,
  title: "Network",
  iconClassName: "fa-regular fa-globe",
  isAdminPage: true,
  subRoutes: [usersRoute, userDetailRoute, serversRoute, serverDetailRoute, groupsRoute, firewallsRoute, userAccessTemplatesRoute],
};

export default networkRoute;
