import { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";

import { AppRoute, IAppRoute } from "../AppRoute";

export function useCurrentRoute(routes: IAppRoute[]) {
  const location: any = useLocation();

  const memo = useMemo(() => {
    const flatMap: IAppRoute[] = [];
    routes.forEach(route => {
      route.path() !== AppRoute.Home && flatMap.push(route);
      route.subRoutes?.forEach(subRoute => flatMap.push(subRoute));
    });
    return flatMap;
  }, [routes]);

  const currentRoute = memo.find(route =>
    matchPath(
      {
        path: route.path(),
        end: true,
      },
      location.pathname
    )
  );

  return currentRoute;
}
