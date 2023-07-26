export type ClientStepsProps = {
  isUnlocked: (id: number) => boolean;
  isDone: (id: number) => boolean;
  setDone: (id: number) => void;
};
