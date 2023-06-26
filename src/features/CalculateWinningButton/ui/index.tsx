import React from "react";
import { Button, useAppStore } from "../../../shared";

export const CalculateWinningButton: React.FC = () => {
  const [calculateWinningGuess] = useAppStore((state) => [
    state.calculateWinningGuess,
  ]);

  return (
    <Button
      // loading={!!wallet?.loading}
      onClick={calculateWinningGuess}
    >
      Calculate winnings
    </Button>
  );
};
