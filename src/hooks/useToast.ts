import { ToastMessageType } from 'primereact/toast';
import { createContext, useContext } from 'react';

export interface ToastContextType {
  show(message: ToastMessageType): void;
  clear(): void;
}

export const ToastContext = createContext<ToastContextType>({
  show: () => {},
  clear: () => {},
});

const useToast = () => useContext(ToastContext);

export default useToast;
