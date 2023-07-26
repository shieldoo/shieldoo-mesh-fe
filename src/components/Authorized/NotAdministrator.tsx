import { Button } from "primereact/button";
import { useCallback } from "react";

import { AppRoute } from "../../AppRoute";
import Page from "../Page";
import TopBar from "../TopBar";
import WarningContent from "../WarningContent";
import useAppNavigate from "../../hooks/useAppNavigate";

function NotAdministrator({ pageName }: { pageName: string }) {
  const navigate = useAppNavigate();
  const onButtonClick = useCallback(() => navigate(AppRoute.Home), [navigate]);

  return (
    <Page
      windowTitle={pageName}
      topBar={
        <TopBar size="full" navigationItems={[]}>
          <WarningContent
            title={`Access to ${pageName} not available`}
            content="This page is only accessible in expert mode which is not available to you.
            Please proceed by clicking on button bellow."
            actionContent={<Button label={"Go to Home"} onClick={onButtonClick} />}
          />
        </TopBar>
      }
    />
  );
}

export default NotAdministrator;
