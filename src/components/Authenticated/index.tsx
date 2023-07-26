import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { useLazyConfigQuery, useMeQuery } from "../../api/generated";
import { useDispatch } from "../../ducks";
import { logIn, selectors, setUiConfig } from "../../ducks/auth";
import { useRedirectByUrlParam } from "../../hooks/useRedirectByUrlParam";
import useToast from "../../hooks/useToast";
import Loader from "../Loader";
import Page from "../Page";
import TopBar from "../TopBar";

type Props = {
  children?: React.ReactNode;
};

const Authenticated: React.FunctionComponent<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const { isFetching, error } = useMeQuery();
  const isAuthenticated = useSelector(selectors.isLoggedIn);
  const [getConfig] = useLazyConfigQuery();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      getConfig()
        .unwrap()
        .then(config => dispatch(setUiConfig(config.config)))
        .catch(() =>
          toast.show({
            severity: "error",
            detail: "An unknown error occurred while loading the application configuration",
            life: 4000,
          })
        );
    }
  }, [dispatch, getConfig, isAuthenticated, toast]);

  useRedirectByUrlParam();

  if (isFetching) {
    return (
      <Page topBar={<TopBar size="small" hideUserMenu navigationItems={[]} />}>
        <div className="app app-loading">
          <Loader size={"10x"} />
          <h2>Please wait, application is loading...</h2>
        </div>
      </Page>
    );
  }

  if (error && "statusCode" in error && error.statusCode !== 401) {
    return (
      <Page
        topBar={
          <TopBar size="medium" hideUserMenu navigationItems={[]}>
            <div className="app app-error">
              <h2>Application Error</h2>
              <p>
                Sorry! An error occurred while loading the application. Please
                try it later or{" "}
                <a
                  href="https://shieldoo.io"
                  target="_new"
                >
                  {" "}
                  contact us
                </a>{" "}
                for help.
              </p>
            </div>
          </TopBar>
        }
      ></Page>
    );
  }

  if (!isAuthenticated) {
    dispatch(logIn());
    return (
      <Page topBar={<TopBar size="small" hideUserMenu navigationItems={[]} />}>
        <div className="app app-loading">
          <Loader size={"10x"} />
          <h2>Redirecting you to the login server...</h2>
        </div>
      </Page>
    );
  }

  return <div className="app">{children}</div>;
};

export default Authenticated;
