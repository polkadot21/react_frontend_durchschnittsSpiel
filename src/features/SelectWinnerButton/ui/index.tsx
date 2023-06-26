import React from "react";
import { Button, useAppStore } from "../../../shared";

export const SelectWinnerButton: React.FC = () => {
  const [selectWinner] = useAppStore((state) => [state.selectWinner]);

  return (
    <Button
      // loading={!!wallet?.loading}
      onClick={selectWinner}
    >
      Select winner
    </Button>
  );
};
