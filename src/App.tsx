import { useCallback, useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toast, ToastMessageType } from "primereact/toast";

import { ToastContext } from "./hooks/useToast";
import NotFound from "./components/NotFound";
import Authenticated from "./components/Authenticated";
import Authorized from "./components/Authorized";
import { appRoutes } from "./AppRoute";
import * as Analytics from "./Common/Utils/Analytics"

function App() {
  const toast = useRef<Toast>(null);

  const show = useCallback((message: ToastMessageType) => toast.current?.show(message), [toast]);
  const clear = useCallback(() => toast.current?.clear(), [toast]);

  const location = useLocation();
  const gaSent = useRef('');
  useEffect(() => {
    if (gaSent.current !== `${location.pathname}`) {
      gaSent.current = location.pathname;
      Analytics.pageView(`app/${location.pathname}`, 'App');
    }
  }, [location]);


  return (
    <Authenticated>
      <Toast position="top-right" ref={toast} />
      <ToastContext.Provider value={{ show, clear }}>
        <Routes>
          <Route element={<Authorized routes={appRoutes} />}>
            {appRoutes.map(route => (
              <Route key={route.path()}>
                {route.subRoutes && route.subRoutes?.length > 0 ? (
                  route.subRoutes?.map(subRoute => (
                    <Route key={subRoute.path()} path={subRoute.path()} element={subRoute.page} />
                  ))
                ) : (
                  <Route path={route.path()} element={route.page} />
                )}
              </Route>
            ))}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate replace to="/404" />} />
          </Route>
        </Routes>
      </ToastContext.Provider>
    </Authenticated>
  );
}

export default App;
