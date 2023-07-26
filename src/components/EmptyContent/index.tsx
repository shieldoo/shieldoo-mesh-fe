function EmptyContent({
  title,
  text,
  customContent,
  iconClass,
  isDashboard,
}: {
  title: React.ReactNode;
  text: string;
  customContent?: React.ReactNode;
  iconClass: string;
  isDashboard?: boolean
}) {
  return (
    <div className={isDashboard ? "empty-content empty-content-dashboard" : "empty-content"}>
      <div className="content">
        <span className={`mt-4 icon fa ${iconClass}`} />
        <h2 className="mt-4">{title}</h2>
        <h3>{text}</h3>
        {customContent || null}
      </div>
    </div>
  );
}

export default EmptyContent;
