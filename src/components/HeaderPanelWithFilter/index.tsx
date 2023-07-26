import React, {useCallback, useState} from "react";
import {Button} from "primereact/button";
import HeaderPanel from "../HeaderPanel";

type HeaderPanelProps = {
  titleText: string;
  headerContent?: React.ReactNode;
  filterContent?: React.ReactNode;
  onFilter?: () => void;
  onFilterReset?: () => void;
  showSearch?: Boolean;
  searchPlaceHolder?: string;
  onSearch?: (search: string) => void;
};

export function HeaderPanelWithFilter(props: HeaderPanelProps) {

  const [filterVisible, setFilterVisible] = useState(false);
  const toggleFilter = useCallback(() => {
    setFilterVisible(visible => !visible);
  }, []);

  const showFilterButton = (
    <div className="w-full text-right">
      <Button label={filterVisible ? "Hide Filters" : "Show Filters"}
              icon={`fa-regular ${filterVisible ? "fa-eye-slash" : "fa-eye"}`} className="p-button-text"
              onClick={toggleFilter}/>
    </div>
  )

  const filterButtons = (
    <div className="w-full text-right">
      {props.onFilter && <Button label="Filter" onClick={props.onFilter} className="p-button-primary" />}
      {props.onFilterReset &&
          <Button label="Reset" className="p-button-link" onClick={props.onFilterReset}/>}
    </div>
  )

  return (
    <>
      <HeaderPanel titleText={props.titleText}
                   showSearch={props.showSearch} searchPlaceHolder={props.searchPlaceHolder} onSearch={props.onSearch}
                   rightContent={showFilterButton}>
        {props.headerContent}
      </HeaderPanel>
      {
        filterVisible && <div className="filter-panel">
          <div className="wrapper">
            {props.filterContent}
            <div>
              {filterButtons}
            </div>
          </div>
        </div>
      }
    </>
  );
}



