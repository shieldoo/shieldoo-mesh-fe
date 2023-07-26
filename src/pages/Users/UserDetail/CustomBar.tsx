import { useNavigate } from "react-router-dom";
import { AppRoute } from "../../../AppRoute";
import ProfilePortrait from "../../../components/ProfilePortrait";
import TopBar from "../../../components/TopBar";
import { selectors } from "../../../ducks/auth";
import { useSelector } from "react-redux";

type CustomBarProps = {
  onEdit: () => void;
  onDelete: () => void;
  userName: string;
  userDescription: string;
  userAccessesCount: number;
  userNotFound: boolean;
};

function CustomBar(props: CustomBarProps) {
  const config = useSelector(selectors.selectUiConfig);
  const navigate = useNavigate();
  const navigationItemsPage = config?.identityImportEnabled ? [] : [
    {
      label: "Edit",
      icon: "fa-regular fa-pencil",
      command: () => props.onEdit(),
    },
    {
      label: "Delete",
      icon: "fa-regular fa-trash",
      command: () => props.onDelete(),
    },
  ];
  const navigationBack = [
    {
      label: "Back to users",
      icon: "fa-regular fa-long-arrow-left",
      command: () => navigate(AppRoute.Users),
    },
  ];

  const filterPageItems = () => {
    if (props.userNotFound) {
      return [];
    }
    return navigationItemsPage;
  }

  const navigationItems = [...navigationBack, ...filterPageItems()];
  const tabItems = [{ label: "Access control (" + props.userAccessesCount + ")" }];

  return (
    <TopBar hideUserMenu size={props.userNotFound ? "small" : "medium"} navigationItems={navigationItems} tabItems={props.userNotFound ? [] : tabItems}>
      <div className="flex">
        <ProfilePortrait profileName={props.userName} size="xlarge" />
        <div className="ml-4">
          <div className="toolbar-text-large">{props.userName}</div>
          <div className="toolbar-text-normal">{props.userDescription}</div>
        </div>
      </div>
    </TopBar>
  );
}

export default CustomBar;
