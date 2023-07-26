import React, { useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeParams } from "primereact/dropdown";
import { Column } from "primereact/column";
import { classNames } from "primereact/utils";

import { useUserInviteMutation, useCodeListUserAccessTemplatesQuery } from "../../api/generated";
import SidePanel from "../../components/SidePanel";
import useExpertMode from "../../hooks/useExpertMode";
import Validate from "../../Common/Utils/Validate";
import DataTable from "../../components/DataTable";

type InviteUsersDialogProps = {
  isShown: boolean;
  onDialogClosed: (isRefetchNeeded: boolean, successfulCount?: number, errorCount?: number) => void;
};

type UserToInvite = {
  index: number;
  email: string;
  isAdmin: boolean;
  note: string;
};

/**
 * Deletes invite from an array based on invite index
 * @param invites Array of invites
 * @param indexToDelete Index of an invite to delete
 */
function deleteInvite(invites: UserToInvite[], indexToDelete: number): void {
  const userToDelete = invites.find((u) => u.index === indexToDelete)!;
  const index = invites.indexOf(userToDelete);
  invites.splice(index, 1);
}

/**
 * Check if last row is not empty. If it is not, new empty invite will be added to the end
 * @param invites Array of invites
 */
function checkForEmptyRow(invites: UserToInvite[]): void {
  const lastUser = invites[invites.length - 1];
  if (invites.length === 0 || !isInviteEmpty(lastUser)) {
    invites[invites.length] = { index: invites.length === 0 ? 0 : lastUser.index + 1, email: "", isAdmin: false, note: "" };
  }
}

/**
 * Check if invite is empty
 * @param invite Invite to check
 * @returns True if invite is empty
 */
function isInviteEmpty(invite: UserToInvite): boolean {
  return invite.email === "" && invite.note === "";
}

function InviteUsersDialog(props: InviteUsersDialogProps) {
  const [userInvite] = useUserInviteMutation();
  const [usersToInvite, setUsersToInvite] = useState<UserToInvite[]>([]);
  const [userAccessTemplate, setUserAccessTemplate] = useState<number | undefined>(undefined);
  const {data: optTemplates} = useCodeListUserAccessTemplatesQuery();
  const { isExpertModeSet } = useExpertMode();

  /**
   * Edits invite and updates data
   * @param userIndex Index of InvitedUser which will be edited
   * @param editFunction Function where properties of InvitedUser can be modified
   */
  const editRow = (userIndex: number, editFunction: (user: UserToInvite) => void) => {
    const _users: UserToInvite[] = [...usersToInvite];
    const userToEdit = _users.find((u) => u.index === userIndex)!;
    editFunction(userToEdit);

    if (isInviteEmpty(userToEdit) && _users.length > 1) {
      deleteInvite(_users, userToEdit.index);
    }

    checkForEmptyRow(_users);
    setUsersToInvite(_users);
  };

  useEffect(() => {
    if (props.isShown) {
      setUsersToInvite([{ index: 0, email: "", isAdmin: false, note: "" }]);
      setUserAccessTemplate(undefined);
    }
  }, [props.isShown]);

  const isTemplateInvalid = (): boolean => {
    return userAccessTemplate === undefined && isExpertModeSet;
  };

  const handleOnChangeTemplate = useCallback(
    (event: DropdownChangeParams) => {
      setUserAccessTemplate(parseInt(event.target.value));
    },
    [setUserAccessTemplate]
  );

  const templateDropDown = <Dropdown id="templates" name="templates" placeholder="Select" className={classNames("w-full", { "p-invalid": isTemplateInvalid() })} onChange={handleOnChangeTemplate} value={userAccessTemplate} options={optTemplates?.codelistUserAccessTemplates} optionLabel="name" optionValue="id" />;

  const emailInputCell = (userToInvite: UserToInvite) => {
    let isEmailInvalid = userToInvite.email !== "" && !Validate.validateEmail(userToInvite.email);

    return (
      <InputText
        value={userToInvite.email}
        className={classNames("p-inputtext-sm", { "p-invalid": isEmailInvalid })}
        onChange={(e) => {
          editRow(userToInvite.index, (user: UserToInvite) => {
            user.email = e.target.value;
          });
        }}
      />
    );
  };

  const adminInputCell = (userToInvite: UserToInvite) => {
    return (
      <Dropdown
        value={userToInvite.isAdmin}
        options={[
          { label: "Yes", value: true },
          { label: "No", value: false },
        ]}
        onChange={(e) => {
          editRow(userToInvite.index, (user: UserToInvite) => {
            user.isAdmin = e.value;
          });
        }}
      />
    );
  };

  const noteInputCell = (userToInvite: UserToInvite) => {
    return (
      <InputText
        value={userToInvite.note}
        className="p-inputtext-sm"
        onChange={(e) => {
          editRow(userToInvite.index, (user: UserToInvite) => {
            user.note = e.target.value;
          });
        }}
      />
    );
  };

  const deleteButtonCell = (userToInvite: UserToInvite) => {
    return (
      <div className="flex">
        <Button
          disabled={usersToInvite.length <= 1 || isInviteEmpty(userToInvite)}
          icon="fa-regular fa-times"
          className="p-button-text p-button-danger"
          onClick={() => {
            const _users: UserToInvite[] = [...usersToInvite];
            deleteInvite(_users, userToInvite.index);
            checkForEmptyRow(_users);
            setUsersToInvite(_users);
          }}
        />
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <>
        <div className="side-panel-controls-split-left">
          <div>
            <i className="fa fa-info-circle"></i> Upon sending the invitation, the users will be automatically notified via email.
          </div>
        </div>
        <div className="side-panel-controls-split-right">
          <Button className="bright" label="Invite" disabled={usersToInvite.length <= 1 || isTemplateInvalid()} onClick={performInvites} />
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={() => props.onDialogClosed(false)} />
        </div>
      </>
    );
  };

  /**
   * Sends invite to all users stored in usersToInvite state
   * @param finishedCallback Callback invoked after all requests have been processed
   */
  const inviteUsers = (finishedCallback?: (counter: { successful: number; errors: number }) => void) => {
    const counter = {total: 0, successful: 0, errors: 0};

    for (let i = 0; i < usersToInvite.length - 1; i++) {
      let userToInvite = usersToInvite[i];
      userInvite({
        data: {
          name: userToInvite.email.split("@")[0].replace(/[0-9]/g, ""),
          roles: userToInvite.isAdmin ? ["ADMINISTRATOR"] : [],
          upn: userToInvite.email,
          userAccessTemplateId: userAccessTemplate,
          description: userToInvite.note,
        },
      }).then((response) => {
        if ("error" in response) {
          counter.errors++;
        } else {
          counter.successful++;
        }

        counter.total++;
        if (counter.total >= usersToInvite.length - 1) {
          finishedCallback?.(counter);
        }
      });
    }
  };

  const performInvites = () => {
    inviteUsers((counter) => {
      props.onDialogClosed(true, counter.successful, counter.errors);
    });
  };

  return (
    <>
      <SidePanel title="Invite Users" onClose={() => props.onDialogClosed(false)} visible={props.isShown}>
        <>
          <div className="side-panel-content side-panel-content-section">
            {isExpertModeSet && (
              <>
                <h3>Access Rights</h3>
                <p>You must assign at least one access right to the each user to let them access your network. After sending the invitation, you can assign more rights to them or create new ones.</p>
                <div className="field">
                  <label htmlFor="templates" className="block">
                    Available access card templates
                  </label>
                  {templateDropDown}
                </div>
                <h3>User(s)</h3>
              </>
            )}
            <div className="invite-users-dialog">
              <DataTable value={usersToInvite}>
                <Column field="email" header="Email" body={emailInputCell} />
                <Column field="isAdmin" header="Admin" body={adminInputCell} style={{ width: "7em" }} />
                <Column field="note" header="Note (optional)" body={noteInputCell} />
                <Column field="actions" body={deleteButtonCell} style={{ width: "2rem", textAlign: "right" }} />
              </DataTable>
            </div>
          </div>
          <div className="side-panel-controls-split">{renderFooter()}</div>
        </>
      </SidePanel>
    </>
  );
}

export default InviteUsersDialog;
