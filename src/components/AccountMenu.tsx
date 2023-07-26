/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { classNames } from "primereact/utils";
import { Button } from "primereact/button";
import ProfilePortrait from "./ProfilePortrait";

type Props = {
  isAdministrator: boolean;
  isExpertModeSet: boolean;
  userName?: string;
  onLogout?: () => void;
  onExpertMode?: () => void;
};

function AccountMenu({
  isExpertModeSet,
  isAdministrator,
  userName,
  onExpertMode,
  onLogout,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [visible, setMenuVisible] = useState(false);

  const onMenuToggle = useCallback(
    (event: any) => {
      if (!visible) {
        let buttonRef = event.target as HTMLElement | null;
        while (buttonRef && buttonRef.tagName !== "BUTTON") {
          buttonRef = buttonRef.parentElement;
        }
        triggerRef.current = buttonRef as HTMLButtonElement | null;
      }

      setMenuVisible(!visible);
    },
    [setMenuVisible, visible]
  );
  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (
        menuRef.current &&
        !(
          menuRef.current.contains(event.target as Node) ||
          triggerRef.current?.contains(event.target as Node)
        )
      ) {
        setMenuVisible(false);
      }
    },
    [setMenuVisible]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={classNames("account-menu", { "account-menu-active": visible })}
    >
      <div className="user" onClick={onMenuToggle}>
        <div className="greeting">
          <span className="user-name">{userName}</span>
        </div>
        <div className="user-role">
          {getUserRole(isAdministrator, isExpertModeSet)}
        </div>
      </div>
      <Button className="p-button-text" onClick={onMenuToggle}>
        <ProfilePortrait profileName={userName || ""} size="large" />
        <i
          className={classNames("fa", "fa-chevron-down", { reversed: visible })}
        ></i>
      </Button>
      <div className="account-menu-container" style={{ position: "relative" }}>
        {visible && (
          <div
            className="p-menu p-component p-menu-overlay"
            style={{ top: "3.8rem", right: "-0.7rem", width: "22rem" }}
            ref={menuRef}
          >
            <ul className="p-menu-list" role="menu">
              <AccountMenuItem text="My Account" disabled />
              {isAdministrator && (
                <AccountMenuItem
                  text="Expert Mode"
                  checked={isExpertModeSet}
                  onClick={onExpertMode}
                />
              )}
              <li className="p-menu-separator" role="separator" />
              <AccountMenuItem text="Sign Out" onClick={onLogout} />
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function getUserRole(isAdministrator: boolean, isExpertModeSet: boolean) {
  if (isAdministrator) {
    if (isExpertModeSet) {
      return "Admin | Expert";
    }
    return "Admin";
  }
  return "User";
}

type AccountMenuItemProps = {
  checked?: boolean;
  disabled?: boolean;
  text: string;
  onClick?: () => void;
};

function AccountMenuItem({
  checked,
  disabled,
  text,
  onClick,
}: AccountMenuItemProps) {
  return (
    <li className="p-menuitem" role="none">
      <a
        href="#"
        className={classNames("p-menuitem-link", { "p-disabled": disabled })}
        role="menuitem"
        aria-disabled={disabled}
        onClick={onClick}
      >
        <span className="p-menuitem-text">{text}</span>
        {checked !== undefined && (
          <InputSwitch className="ml-8" checked={checked} />
        )}
      </a>
    </li>
  );
}

export default AccountMenu;
