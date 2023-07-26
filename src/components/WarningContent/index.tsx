import { classNames } from "primereact/utils";

function WarningContent({
  title,
  content,
  actionContent,
  type = "warning",
}: {
  title: React.ReactNode;
  content: React.ReactNode;
  actionContent?: React.ReactNode;
  type?: "warning" | "error";
}) {
  return (
    <div className="warning-content">
      <div className="content">
        <span
          className={classNames("icon fa-regular", {
            "fa-warning icon-warning": type === "warning",
            "fa-exclamation-triangle icon-error": type === "error",
          })}
        />
        <div className="title">{title}</div>
        {content}
        <div className="action">{actionContent || null}</div>
      </div>
    </div>
  );
}

export default WarningContent;
