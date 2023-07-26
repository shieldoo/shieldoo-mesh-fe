import { decode as base64_decode } from "base-64";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { selectors } from "../ducks/auth";
import useRedirectParam from "./useRedirectParam";

export function useRedirectByUrlParam() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectors.isLoggedIn);
  const { isRedirectSet, redirect } = useRedirectParam();

  useEffect(() => {
    if (isAuthenticated && isRedirectSet) {
      const url = new URL(base64_decode(redirect));
      if (url.origin === window.location.origin) {
        url.pathname && navigate(url.pathname, { replace: true });
      }
    }
  }, [isAuthenticated, isRedirectSet, navigate, redirect]);
}
