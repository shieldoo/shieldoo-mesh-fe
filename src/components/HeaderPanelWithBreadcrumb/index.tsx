import { Button } from "primereact/button";
import { MenuItem } from "primereact/menuitem";

type Props = {
  titleText: string;
  items: MenuItem[];
  back: () => void;
};

function HeaderPanelWithBreadcrumb(props: Props) {
  return (
    <div className="header-panel header-panel-with-breadcrumb">
      <div className="header-area flex gap-2">
        <Button
          className="p-button-secondary p-button-icon-only"
          icon={<i className="fa fa-arrow-left" />}
          onClick={props.back}
        />
        <div className="header-panel-breadcrumb">
          {props.items.map((item, index) => (
            <BreadcrumbItem key={item.label || `item-${index}`} item={item} />
          ))}
          <div className="title">{props.titleText}</div>
        </div>
      </div>
    </div>
  );
}

function BreadcrumbItem({ item }: { item: MenuItem }) {
  return (
    <>
      <span className="breadcrumb-label" onClick={e => item.command && item.command({ originalEvent: e, item: item })}>
        {item.label}
      </span>
      <span className="breadcrumb-icon fa fa-angle-right" />
    </>
  );
}

export default HeaderPanelWithBreadcrumb;
