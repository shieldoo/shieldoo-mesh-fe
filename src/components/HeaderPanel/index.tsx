import React, { useState } from "react";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

type HeaderPanelProps = {
  titleText: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
  showSearch?: Boolean;
  searchPlaceHolder?: string;
  onSearch?: (search: string) => void;
};

function HeaderPanel(props: HeaderPanelProps) {
  const [search, setSearch] = useState("");
  const left = (
    <>
      <h2 className="mr-4">{props.titleText}</h2>
      {props.children}
    </>
  );

  const searchInput = (
    <span className="p-inputgroup">
          <span className="p-inputgroup-addon">
            <i className={classNames("icon fa fa-search", {"icon-active": search})} />
          </span>
          <InputText
            className="p-inputtext-sm block"
            placeholder={props.searchPlaceHolder}
            value={search}
            id="headerpanelsearch"
            name="search"
            onChange={(e) => {
              if (props.onSearch) {
                setSearch(e.target.value);
                props.onSearch(e.target.value);
              }
            }}
          />
        </span>
  )

  const right = (
    <>
      {props.showSearch && searchInput}
      {props.rightContent}
    </>
  );

  return (
    <div className="header-panel">
      <Toolbar left={left} right={right} />
    </div>
  );
}

export default HeaderPanel;
