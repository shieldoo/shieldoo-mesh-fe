import { InputSwitch } from "primereact/inputswitch";
import { useCallback } from "react";

import Page from "../Page";
import TopBar from "../TopBar";
import WarningContent from "../WarningContent";
import useExpertMode from "../../hooks/useExpertMode";
import useAppNavigate from "../../hooks/useAppNavigate";
import { AppRoute } from "../../AppRoute";

function EnableExpertMode({ pageName }: { pageName: string }) {
  const navigate = useAppNavigate();
  const { isExpertModeSet, toggleExpertMode } = useExpertMode();
  const onExpertMode = useCallback(toggleExpertMode, [toggleExpertMode]);
  const onBack = useCallback(() => {
    navigate(AppRoute.Home);
  }, [navigate]);

  return (
    <Page
      windowTitle={pageName}
      topBar={
        <TopBar
          size="full"
          navigationItems={[
            {
              label: "Back to Dashboard",
              icon: "fa-regular fa-th-large",
              command: onBack,
            },
          ]}
        >
          <WarningContent
            title={`Access to ${pageName} not available`}
            content="This page is only accessible in expert mode that you can turn on"
            actionContent={
              <div className="flex align-items-center justify-content-center gap-3" onClick={onExpertMode}>
                <InputSwitch checked={isExpertModeSet} />
                <span className="">Enable expert mode</span>
              </div>
            }
          />
        </TopBar>
      }
    />
  );
}

export default EnableExpertMode;
