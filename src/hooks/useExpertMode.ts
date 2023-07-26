import { useLocalStorage } from "usehooks-ts";
import useToast from "./useToast";

export const EXPERT_MODE = "expertMode";

const useExpertMode = () => {
  const [value, setValue] = useLocalStorage(EXPERT_MODE, false);
  const toast = useToast();

  const toggleExpertMode = () => {
    toast.show({
      severity: "success",
      detail: `${value ? "Disabling" : "Enabling"} expert mode`,
      life: 4000,
    });
    setValue((prev) => !prev);
  };

  const enableExpertMode = () => setValue(true);
  const disableExpertMode = () => setValue(false);

  return {
    enableExpertMode,
    disableExpertMode,
    toggleExpertMode,
    isExpertModeSet: value,
  };
};

export default useExpertMode;
