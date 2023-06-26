import { Button, useAppStore } from "../../../shared";
import React from "react";

export const StartGameButton = () => {
  const [startGame, isContractOwner, isGameStarted] = useAppStore((state) => [
    state.startGame,
    state.isContractOwner,
    state.isGameStarted,
  ]);

  return (
    <Button
      disabled={!isContractOwner || isGameStarted}
      // loading={!!wallet?.loading}
      onClick={startGame}
    >
      Start Game
    </Button>
  );
};
