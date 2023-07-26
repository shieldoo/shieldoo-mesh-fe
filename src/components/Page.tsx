import { SerializedError } from "@reduxjs/toolkit";
import { classNames } from "primereact/utils";
import React, { useCallback, useRef, useState } from "react";

import { RequestError } from "../api/graphqlBaseQueryTypes";
import { useWindowTitle } from "../hooks/useWindowTitle";
import TopBar from "./TopBar";

type Props = {
  windowTitle?: string;
  className?: string;
  children?: React.ReactNode;
  topBar?: React.ReactNode;
  errors?: (RequestError | SerializedError | undefined)[];
};

function Page({ windowTitle, className, children, topBar, errors }: Props) {
  const mainRef = useRef<any>();

  const [showScrollShadow, setShowScrollShadow] = useState(false);

  const onScroll = useCallback(() => {
    if (mainRef.current) {
      const { scrollTop } = mainRef.current;
      if (scrollTop > 1) {
        setShowScrollShadow(true);
      } else {
        setShowScrollShadow(false);
      }
    }
  }, []);

  useWindowTitle(windowTitle);

  const hasError = errors?.some(e => {
    if (e && "statusCode" in e && (e.statusCode !== 200 || e.errors.some(ee => ee.message !== undefined))) {
      // TODO: mosladil - Print in debug env only
      // console.error(e);
      return true;
    }
    return false;
  });

  return (
    <div className={classNames("page", className)}>
      {topBar || <TopBar />}
      <main ref={mainRef} onScroll={onScroll} className={classNames({ "scrollbar-active": showScrollShadow })}>
        {hasError ? <InternalError /> : children}
      </main>
    </div>
  );
}

function InternalError() {
  return (
    <div className="app-error">
      <h2>Internal Error</h2>
      <p>
        Sorry, an unknown error occurred. Please, try again later or{" "}
        <a href="https://shieldoo.io" target="_new">
          contact us
        </a>{" "}
        for help.
      </p>
    </div>
  );
}

export default Page;
