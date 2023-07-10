import React, { useEffect, useMemo } from "react";
import "./App.css";
import { Button } from "../shared/ui/Button";
import { useAppStore } from "../shared";
import {
  CalculateWinningButton,
  MetamaskButton,
  SelectWinnerButton,
  StartGameButton,
} from "../features";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CountdownTimer } from "../features";
import { GuessForm } from "../widgets";

function App() {
  const [
    init,
    wallet,
    isContractOwner,
    isGuessesSubmitted,
    isWinningGuessCalculated,
    currentBlock,
    endSubmissionPeriodBlock,
    endRevealingPeriodBlock,
    revealingPeriod,
    isGameStarted,
  ] = useAppStore((state) => [
    state.init,
    state.wallet,
    state.isContractOwner,
    state.isGuessesSubmitted,
    state.isWinningGuessCalculated,
    state.currentBlock,
    state.endSubmissionPeriodBlock,
    state.endRevealingPeriodBlock,
    state.revealingPeriod,
    state.isGameStarted,
  ]);

  const isSubmittingPhaseActive = useMemo<boolean>(() => {
    if (!endSubmissionPeriodBlock || !currentBlock) return false;
    return endSubmissionPeriodBlock - currentBlock > 0;
  }, [endSubmissionPeriodBlock, currentBlock]);

  const isRevealPhaseActive = useMemo<boolean>(() => {
    if (!endRevealingPeriodBlock || !currentBlock) return false;
    return (
      endRevealingPeriodBlock - currentBlock > 0 &&
      endRevealingPeriodBlock - currentBlock <= revealingPeriod
    );
  }, [endRevealingPeriodBlock, currentBlock, revealingPeriod]);

  const blocks = useMemo<number>(() => {
    if (isSubmittingPhaseActive && endSubmissionPeriodBlock && currentBlock)
      return endSubmissionPeriodBlock - currentBlock > 0
        ? endSubmissionPeriodBlock - currentBlock
        : 0;
    if (isRevealPhaseActive && endRevealingPeriodBlock && currentBlock)
      return endRevealingPeriodBlock - currentBlock > 0
        ? endRevealingPeriodBlock - currentBlock
        : 0;
    return 0;
  }, [
    isSubmittingPhaseActive,
    endSubmissionPeriodBlock,
    currentBlock,
    isRevealPhaseActive,
    endRevealingPeriodBlock,
  ]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <header className="flex justify-end items-center px-6">
        <MetamaskButton />
      </header>
      <body className="container">
        <h1>Guessing game</h1>
        <div className="rules">
          <p>Long time ago in the Ethereum universe...</p>
          <p>
            Only the master jedi can start the game, but every padavan can play.
            To join the quest, connect your wallet with Metamask. If the game
            has started, enter your guess and your salt, a mysterious number
            that makes your guess secure.
          </p>
          <p>
            Every player has one hour to submit the guess, and after that, one
            hour to reveal it. The force will be strong with the one who guesses
            right. The winner gets the prize, minus the master jedi's fee. May
            the force be with you.
          </p>
        </div>

        <div>
          <h3>Winners</h3>
          <ul>
            <li>Winner 1</li>
          </ul>
        </div>

        {isContractOwner &&
          !isSubmittingPhaseActive &&
          !isRevealPhaseActive &&
          !isGameStarted && <StartGameButton />}

        {isContractOwner &&
          !isSubmittingPhaseActive &&
          !isRevealPhaseActive &&
          isGuessesSubmitted && <CalculateWinningButton />}
        {/*{isContractOwner && <CalculateWinningButton />}*/}
        {isContractOwner && isWinningGuessCalculated && <SelectWinnerButton />}
        {/*{isContractOwner && isWinningGuessCalculated && <SelectWinnerButton />}*/}
        {isSubmittingPhaseActive && (
          <div id="submissionTitle">SUBMISSION PHASE IS OPEN</div>
        )}
        {isRevealPhaseActive && (
          <div id="revealTitle">REVEAL PHASE IS OPEN</div>
        )}

        {(isSubmittingPhaseActive || isRevealPhaseActive) && (
          <CountdownTimer blocks={blocks} />
        )}

        {wallet?.accounts.length &&
          (isSubmittingPhaseActive || isRevealPhaseActive) && (
            <GuessForm isSubmittingPhase={isSubmittingPhaseActive} />
          )}
      </body>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
