import { Button } from "primereact/button";
import { useCallback } from "react";
import { useSelector } from "react-redux";

import { AppRoute } from "../../AppRoute";
import Page from "../Page";
import TopBar from "../TopBar";
import WarningContent from "../WarningContent";
import { selectors } from "../../ducks/auth";
import useAppNavigate from "../../hooks/useAppNavigate";

function NotFound() {
  const isAdministrator = useSelector(selectors.isAdministrator);
  const navigate = useAppNavigate();
  const onButtonClick = useCallback(() => navigate(AppRoute.Home), [navigate]);

  return (
    <Page
      windowTitle="Not Found"
      topBar={
        <TopBar size="full" navigationItems={[]}>
          <WarningContent
            title={`Page not found...`}
            type="error"
            content={
              <>
                Looks like that you are trying to access something what is not here anymore...
                <br />
                Please proceed by clicking on button below.
              </>
            }
            actionContent={
              <Button
                icon={isAdministrator && "fa-regular fa-th-large"}
                label={isAdministrator ? "Go to Dashboard" : "Go to Home"}
                onClick={onButtonClick}
              />
            }
          />
        </TopBar>
      }
    />
  );
}

export default NotFound;
