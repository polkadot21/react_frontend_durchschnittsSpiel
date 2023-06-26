import { create } from "zustand";
import Web3, { Contract } from "web3";
import ABI from "../data/GuessTheNumberGame.json";
import { toast } from "react-toastify";

export type TWallet = {
  connected: boolean;
  loading: boolean;
  accounts: string[];
};

type AppStoreState = {
  web3: Web3 | null;
  contractInstance: Contract<typeof ABI> | null;
  wallet: TWallet | null;
  isContractOwner: boolean;
  currentBlock?: number;
  startGameBlock?: number;
  endSubmissionPeriodBlock?: number;
  endRevealingPeriodBlock?: number;
  submissionPeriod: number;
  revealingPeriod: number;
  countdownTimer: number;
  isGameStarted: boolean;
  isGuessesSubmitted: boolean;
  isSaltSubmitted: boolean;
  isWinningGuessCalculated: boolean;
};

type AppStoreActions = {
  isPhase: () => boolean;
  isSubmissionPhase: () => boolean;
  isRevealPhase: () => boolean;
  isCalculateWinningPhase: () => boolean;
  init: () => Promise<void>;
  initBlocksSubscription: () => Promise<void>;
  initGamePeriods: () => Promise<void>;
  initGameSubmissionSubscription: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => void;
  startGame: () => void;
  enterGuess: (values: { guess: number; salt: number }) => Promise<void>;
  revealSaltAndGuess: (values: {
    guess: number;
    salt: number;
  }) => Promise<void>;
  calculateWinningGuess: () => Promise<void>;
  selectWinner: () => Promise<void>;
};
type AppStore = AppStoreState & AppStoreActions;

export const useAppStore = create<AppStore>()((set, get) => ({
  web3: null,
  contractInstance: null,
  wallet: null,
  isContractOwner: false,
  currentBlock: undefined,
  startGameBlock: undefined,
  endSubmissionPeriodBlock: undefined,
  endRevealingPeriodBlock: undefined,
  submissionPeriod: 0,
  revealingPeriod: 0,
  countdownTimer: 0,
  isGameStarted: false,
  isGuessesSubmitted: false,
  isSaltSubmitted: false,
  isWinningGuessCalculated: false,
  isPhase: () => get().isSubmissionPhase() || get().isRevealPhase(),
  isSubmissionPhase: () => {
    const currentBlock = get().currentBlock;
    const endSubmissionPeriodBlock = get().endSubmissionPeriodBlock;

    if (!endSubmissionPeriodBlock || !currentBlock) return false;

    return endSubmissionPeriodBlock - currentBlock > 0;
  },
  isRevealPhase: () => {
    const currentBlock = get().currentBlock;
    const endRevealingPeriodBlock = get().endRevealingPeriodBlock;

    if (!endRevealingPeriodBlock || !currentBlock) return false;

    return endRevealingPeriodBlock - currentBlock > 0;
  },
  isCalculateWinningPhase: () => !get().isPhase(),
  period: null,
  init: async () => {
    if (window.ethereum) {
      // create WEB3 instance
      const web3 = new Web3(window.ethereum);
      set({ web3 });
      // create contract instance
      const contractInstance = new web3.eth.Contract(
        ABI,
        process.env.REACT_APP_CONTRACT_ADDRESS
      );
      if (contractInstance) set({ contractInstance });

      // Get the latest block number
      const latestBlockNumber = await web3.eth.getBlockNumber();
      const submissionPeriod = await get()
        .contractInstance?.methods.submissionPeriod()
        .call();
      const revealPeriod = await get()
        .contractInstance?.methods.revealPeriod()
        .call();

      set({
        currentBlock: Number(latestBlockNumber),
        submissionPeriod: Number(submissionPeriod),
        revealingPeriod: Number(revealPeriod),
      });

      if (localStorage.getItem("wallet")) {
        const contractOwner: string | undefined = await get()
          .contractInstance?.methods.owner()
          .call();
        const wallet = JSON.parse(localStorage.getItem("wallet") as string);
        set((state) => ({
          wallet: {
            ...wallet,
            loading: false,
          },
          isContractOwner: wallet.accounts[0] === contractOwner,
        }));
      }

      await get().initGamePeriods();
      await get().initBlocksSubscription();
      await get().initGameSubmissionSubscription();
    }
  },
  initBlocksSubscription: async () => {
    const web3 = get().web3;
    try {
      const subscription = await web3?.eth.subscribe(
        "newBlockHeaders",
        (error: any, result: any) => {
          if (error) {
            toast.error(error.message);
          }
        }
      );

      subscription?.on("data", function (transaction) {
        set({ currentBlock: Number(transaction.number) });
      });
      subscription?.on("error", (error: any) => {
        throw error;
      });
    } catch (error: any) {
      toast.error(error?.message);
    }
  },
  initGamePeriods: async () => {
    const contractInstance = get().contractInstance;
    const web3 = get().web3;
    const submissionPeriod = get().submissionPeriod;
    const revealingPeriod = get().revealingPeriod;

    if (contractInstance && submissionPeriod && revealingPeriod) {
      try {
        const latestBlock = await web3?.eth.getBlockNumber();
        const latestBlockNumber = Number(latestBlock);
        const pastStartedEvents = await contractInstance.getPastEvents(
          // @ts-ignore
          "GameStarted",
          {
            fromBlock: latestBlockNumber - submissionPeriod - revealingPeriod,
            toBlock: latestBlockNumber,
          }
        );

        if (pastStartedEvents.length) {
          const lastEvent: any =
            pastStartedEvents[pastStartedEvents.length - 1];
          const startGameBlock = Number(lastEvent?.returnValues.timestamp);
          const endSubmissionPeriodBlock = startGameBlock + submissionPeriod;
          const endRevealingPeriodBlock =
            startGameBlock + submissionPeriod + revealingPeriod;

          set({
            startGameBlock,
            endSubmissionPeriodBlock,
            endRevealingPeriodBlock,
          });
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  initGameSubmissionSubscription: async () => {
    const contract = get().contractInstance;
    const guessSubmittedSubscription = await contract?.events.GuessSubmitted();

    guessSubmittedSubscription?.on("data", async (eventLog) => {
      console.log("eventLog", eventLog);
      if (eventLog.returnValues.player) toast.success("The guess is submitted");

      set({ isGuessesSubmitted: true });

      await guessSubmittedSubscription.unsubscribe();
    });
    guessSubmittedSubscription?.on("error", (error) => {
      console.log("Error when subscribing: ", error);
      throw error;
    });
  },
  connect: async () => {
    const web3 = get().web3;
    set({
      wallet: {
        connected: false,
        loading: true,
        accounts: [],
      },
    });
    if (web3) {
      try {
        await window.ethereum.enable();
        // get user metamask accounts
        const accounts = await web3.eth.getAccounts();
        //
        const contract = get().contractInstance;
        if (contract) {
          try {
            const contractOwner: string | undefined = await get()
              .contractInstance?.methods.owner()
              .call();
            if (contractOwner)
              set({ isContractOwner: accounts[0] === contractOwner });
          } catch (error) {
            throw error;
          }
        }
        set((state) => {
          const wallet = {
            ...(state.wallet as TWallet),
            connected: true,
            accounts,
          };
          localStorage.setItem("wallet", JSON.stringify(wallet));
          return { wallet };
        });
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        set((state) => ({
          wallet: {
            ...(state.wallet as TWallet),
            loading: false,
          },
        }));
      }
    } else {
      toast.info("Web3 is not available");
    }
  },
  disconnect: () => {
    set({ wallet: null, isContractOwner: false });
    localStorage.removeItem("wallet");
  },
  startGame: async () => {
    set({ isGameStarted: true });
    const gasPrice = await get().web3?.eth.getGasPrice();
    const contract = get().contractInstance;
    const gasEstimation = await contract?.methods
      .startGame()
      .estimateGas({ from: get().wallet?.accounts[0] });
    if (contract) {
      try {
        const startGame = contract?.methods.startGame().send({
          from: get().wallet?.accounts[0],
          gas: Number(gasEstimation).toString(),
          gasPrice: (Number(gasPrice) * 1000).toString(),
        });

        startGame
          .then((data) => {
            const startGameBlock = Number(data.blockNumber);
            const submissionPeriod = get().submissionPeriod;
            const revealingPeriod = get().revealingPeriod;
            const endSubmissionPeriodBlock = startGameBlock + submissionPeriod;
            const endRevealingPeriodBlock =
              endSubmissionPeriodBlock + revealingPeriod;
            set({
              startGameBlock,
              endSubmissionPeriodBlock,
              endRevealingPeriodBlock,
            });
            toast.success("The game is started");
          })
          .catch((error) => {
            toast.error(error?.message);
            set({ isGameStarted: false });
          });

        await toast.promise(startGame, {
          pending: "Waiting for the game to start",
        });
        set({ isGameStarted: false });
      } catch (error: any) {
        set({ isGameStarted: false });
        console.log("ERROR", error);
        toast.error(error.message);
      }
    }
  },
  enterGuess: async (values) => {
    const { guess, salt } = values;
    const web3 = get().web3;
    const encodedSalt = web3?.utils.soliditySha3(salt);

    const contract = get().contractInstance;
    if (contract && guess && encodedSalt) {
      const hashedFullGuess = web3?.utils.soliditySha3(guess, encodedSalt);

      try {
        const fee: BigInt | undefined = await contract?.methods
          .participationFee()
          .call();
        const TXOptions = {
          from: get().wallet?.accounts[0],
          gas: 5000000,
          value: fee,
        };
        const enterGuess = contract?.methods
          // @ts-ignore
          .enterGuess(hashedFullGuess)
          // @ts-ignore
          .send(TXOptions);

        enterGuess.catch((error: any) => toast.error(error?.message));

        await toast.promise(enterGuess, {
          pending: "Waiting for the guess enter",
          success: "The guess is saved",
        });

        // const guessSubmittedSubscription =
        //   await contract?.events.GuessSubmitted();
        //
        // guessSubmittedSubscription?.on("data", async (eventLog) => {
        //   toast.success("The guess is submitted");
        //
        //   set({ isGuessesSubmitted: true });
        //
        //   await guessSubmittedSubscription.unsubscribe();
        // });
        // guessSubmittedSubscription.on("error", (error) => {
        //   throw error;
        //   console.log("Error when subscribing: ", error);
        // });
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  revealSaltAndGuess: async (values) => {
    const { guess, salt } = values;
    const contract = get().contractInstance;
    if (contract) {
      const TXOptions = {
        from: get().wallet?.accounts[0],
        gas: 5000000,
      };
      try {
        const revealSaltAndGuess = contract?.methods
          // @ts-ignore
          .revealSaltAndGuess(guess, salt)
          // @ts-ignore
          .send(TXOptions);

        revealSaltAndGuess
          .then((data) => {
            toast.success("Transaction sent");
          })
          .catch((error) => toast.error(error?.message));

        await toast.promise(revealSaltAndGuess, {
          pending: "Waiting for the guess ans salt revealed",
          success: "Guess and salt are successfully revealed",
        });

        // const allGuessesSubmittedSubscription =
        //   await contract?.events.AllGuessesSubmitted();
        // const allSaltSubmittedSubscription =
        //   await contract?.events.AllGuessesSubmitted();
        //
        // allGuessesSubmittedSubscription?.on("data", async (eventLog) => {
        //   toast.success("All guesses are submitted");
        //
        //   set({ isGuessesSubmitted: true });
        //
        //   await allGuessesSubmittedSubscription.unsubscribe();
        // });
        // allGuessesSubmittedSubscription.on("error", (error) => {
        //   throw error;
        // });
        //
        // allSaltSubmittedSubscription?.on("data", async (eventLog) => {
        //   toast.success("All salt is submitted");
        //
        //   set({ isSaltSubmitted: true });
        //
        //   await allSaltSubmittedSubscription.unsubscribe();
        // });
        // allSaltSubmittedSubscription.on("error", (error) => {
        //   throw error;
        // });
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  calculateWinningGuess: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        await contract?.methods.calculateWinningGuess().send({
          from: get().wallet?.accounts[0],
          gas: "5000000",
        });
        const winningGuessCalculatedSubscription =
          await contract?.events.WinningGuessCalculated();
        winningGuessCalculatedSubscription?.on("data", async (eventLog) => {
          toast.success("The winning guess is calculated");
          console.log("The winning guess is calculated");

          set({ isWinningGuessCalculated: true });

          await winningGuessCalculatedSubscription.unsubscribe();
        });
        winningGuessCalculatedSubscription.on("error", (error) => {
          throw error;
        });
      } catch (error: any) {
        console.log("ERROR", error);
        toast.error(error.message);
      }
    }
  },
  selectWinner: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        await contract?.methods
          .selectWinner()
          .send({ from: get().wallet?.accounts[0] });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  },
}));
