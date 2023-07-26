import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import { useRef, useState } from "react";

type MenuButtonProps = {
  text: string;
  icon: string;
  model: MenuItem[];
  className?: string;
};

function MenuButton(props: MenuButtonProps) {
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const popupMenu = useRef<Menu>(null);

  const onClick = (e: any) => {
    popupMenu.current?.toggle(e);
  };

  return (
    <div className={props.className}>
      <Menu model={props.model} className="user-dropdown-menu" popup ref={popupMenu} onHide={() => setMenuOpened(false)} onShow={() => setMenuOpened(true)} />
      <button aria-label="Create Firewall" onClick={(e) => onClick(e)} className="p-button p-component p-button-sm">
        <span className={"p-button-icon p-c p-button-icon-left " + props.icon}></span>
        <span className="p-button-label p-c">{props.text}</span>
        <span className={classNames("p-button-icon", "p-c", "p-button-icon-align-right", "pi", { "pi-chevron-up": menuOpened }, { "pi-chevron-down": !menuOpened })}></span>
      </button>
    </div>
  );
}

export default MenuButton;
