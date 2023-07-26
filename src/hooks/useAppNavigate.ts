import { NavigateOptions, useNavigate } from "react-router-dom";
import { AppRoute } from "../AppRoute";

const useAppNavigate = () => {
  const defNavigate = useNavigate();
  return (destination: AppRoute, options?: NavigateOptions | undefined) => {
    defNavigate(destination, options);
  };
};

export default useAppNavigate;
