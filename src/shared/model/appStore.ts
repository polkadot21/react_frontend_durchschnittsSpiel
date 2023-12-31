import { create } from "zustand";
import Web3, { Contract, NonPayableCallOptions } from "web3";
// import ABI from "../data/GuessTheNumberGame.json";
import { toast } from "react-toastify";
import { log } from "util";

const ABI = [{"anonymous":false,"inputs":[],"name":"AllGuessesSubmitted","type":"event"},{"anonymous":false,"inputs":[],"name":"AllSaltsSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"GuessSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"PlayerDropsOut","type":"event"},{"anonymous":false,"inputs":[],"name":"VariableReset","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"winningGuess","type":"uint256"}],"name":"WinningGuessCalculated","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"activeAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"activeRevealedGuesses","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"calculateWinningGuess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"droppedOutPlayerAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_hashedGuess","type":"bytes32"}],"name":"enterGuess","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"guessesOfActivePlayers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isWinningGuessCalculated","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"maxGuess","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minGuess","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minNumPlayers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"numPlayers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownersPercentFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"participationFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"playerAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"playerGuesses","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"playerRevealedGuesses","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"playerSalts","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"resetVariables","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"revealPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_guess","type":"uint256"},{"internalType":"uint256","name":"_salt","type":"uint256"}],"name":"revealSaltAndGuess","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"revealedAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"selectWinner","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"startBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"startGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"submissionPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"winningAddresses","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"winningGuess","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]

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
  isSubmissionPeriod: boolean;
  endSubmissionPeriodBlock?: number;
  isRevealingPeriod: boolean;
  endRevealingPeriodBlock?: number;
  submissionPeriod: number;
  revealingPeriod: number;
  countdownTimer: number;
  finishGamePlayers: string[];
  minNumPlayers: number;
  isGameStarted: boolean;
  isGuessesSubmitted: boolean;
  isSaltSubmitted: boolean;
  isWinningGuessCalculated: boolean;
  checkWinnersActive: boolean;
  winners: Map<number, string>;
};

type AppStoreActions = {
  init: () => Promise<void>;
  initBlocksSubscription: () => Promise<void>;
  initGamePeriods: () => Promise<void>;
  setStartGameBlocks: (startGameBlock: number | bigint) => void;
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
  getWinners: () => Promise<void>;
};
type AppStore = AppStoreState & AppStoreActions;

export const useAppStore = create<AppStore>()((set, get) => ({
  web3: null,
  contractInstance: null,
  wallet: null,
  isContractOwner: false,
  currentBlock: undefined,
  startGameBlock: undefined,
  isSubmissionPeriod: false,
  endSubmissionPeriodBlock: undefined,
  isRevealingPeriod: false,
  endRevealingPeriodBlock: undefined,
  submissionPeriod: 0,
  revealingPeriod: 0,
  countdownTimer: 0,
  finishGamePlayers: [],
  minNumPlayers: 0,
  isGameStarted: false,
  isGuessesSubmitted: false,
  isSaltSubmitted: false,
  isWinningGuessCalculated: false,
  period: null,
  checkWinnersActive: false,
  winners: new Map<number, string>(),
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
      const submissionPeriod = await contractInstance?.methods
        .submissionPeriod()
        .call();
      const revealPeriod = await contractInstance?.methods
        .revealPeriod()
        .call();
      const minNumPlayers = await contractInstance?.methods[
        "minNumPlayers"
      ]().call();

      set({
        currentBlock: Number(latestBlockNumber),
        submissionPeriod: Number(submissionPeriod),
        revealingPeriod: Number(revealPeriod),
        minNumPlayers: Number(minNumPlayers),
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
      await get().getWinners();
      if (get().winners.size) set({ checkWinnersActive: true });
      await get().initGamePeriods();
      await get().initBlocksSubscription();
      await get().initGameSubmissionSubscription();
    }
  },
  initBlocksSubscription: async () => {
    const contractInstance = get().contractInstance;
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

      subscription?.on("data", async (transaction) => {
        const currentBlock = Number(transaction.number);
        const endSubmissionPeriodBlock = get().endSubmissionPeriodBlock;
        const endRevealingPeriodBlock = get().endRevealingPeriodBlock;
        const isGuessesSubmitted = get().isGuessesSubmitted;
        const isWinningGuessCalculated = get().isWinningGuessCalculated;
        set({ currentBlock });
        if (currentBlock === endSubmissionPeriodBlock)
          set({ isSubmissionPeriod: false });
        if (currentBlock === endRevealingPeriodBlock)
          set({
            isRevealingPeriod: false,
            isGameStarted:
              isGuessesSubmitted || isWinningGuessCalculated || false,
          });
        try {
          const pastStartedEvents = await contractInstance?.getPastEvents(
            "allEvents",
            {
              fromBlock: currentBlock - 1,
              toBlock: currentBlock,
            }
          );
          if (pastStartedEvents?.length) {
            pastStartedEvents.forEach((eventLog: any) => {
              if (eventLog?.event) {
                switch (eventLog.event) {
                  case "GameStarted": {
                    get().setStartGameBlocks(eventLog.blockNumber);
                    set({ isGameStarted: true });
                    break;
                  }
                  case "AllGuessesSubmitted": {
                    set({
                      isGuessesSubmitted: true,
                    });
                    break;
                  }
                  case "WinningGuessCalculated": {
                    set({
                      isGuessesSubmitted: false,
                      isWinningGuessCalculated: true,
                    });
                    break;
                  }
                  default:
                    break;
                }
              }
            });
          }
        } catch (error) {
          console.log("Blocks subscription error", error);
        }
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
          get().setStartGameBlocks(lastEvent?.returnValues.timestamp);
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  setStartGameBlocks: (startBlock) => {
    const startGameBlock = Number(startBlock);
    const submissionPeriod = get().submissionPeriod;
    const revealingPeriod = get().revealingPeriod;
    const endSubmissionPeriodBlock = startGameBlock + submissionPeriod;
    const endRevealingPeriodBlock =
      startGameBlock + submissionPeriod + revealingPeriod;

    set({
      startGameBlock,
      endSubmissionPeriodBlock,
      endRevealingPeriodBlock,
    });
  },
  initGameSubmissionSubscription: async () => {
    const contract = get().contractInstance;
    const allGuessesSubmittedSubscription =
      await contract?.events.AllGuessesSubmitted();

    allGuessesSubmittedSubscription?.on("data", async (eventLog) => {
      if (eventLog.returnValues.player) {
        toast.success("The guess is submitted");
        set({ isGuessesSubmitted: true });
        await allGuessesSubmittedSubscription.unsubscribe();
      }
    });
    allGuessesSubmittedSubscription?.on("error", (error) => {
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
    await get().winners.clear();
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
      } catch (error: any) {
        toast.error(error?.message);
      }
    }
  },
  calculateWinningGuess: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        const calculated = contract?.methods.calculateWinningGuess().send({
          from: get().wallet?.accounts[0],
          gas: "5000000",
        });
        await toast.promise(calculated, {
          pending: "Waiting for calculating winnings",
        });
        const winningGuessCalculatedSubscription =
          await contract?.events.WinningGuessCalculated();
        winningGuessCalculatedSubscription?.on("data", async (eventLog) => {
          toast.success("The winning guess is calculated");
          set({ isGuessesSubmitted: false, isWinningGuessCalculated: true });
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
        const selectWinner = contract?.methods
          .selectWinner()
          .send({ from: get().wallet?.accounts[0] });

        selectWinner.then(async (data) => {
          toast.success("The winner is selected");
          set({
            isWinningGuessCalculated: false,
            isGameStarted: false,
            checkWinnersActive: true,
          });
          setTimeout(() => get().getWinners(), 10000);
        });

        await toast.promise(selectWinner, {
          pending: "Waiting for a winner selecting",
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  },
  getWinners: async () => {
    const contract = get().contractInstance;
    if (contract) {
      try {
        let i = 0;
        while (true) {
          try {
            const address: string = await contract.methods
              // @ts-ignore
              .winningAddresses(i)
              .call();

            set(() => {
              const winners = new Map();
              winners.set(i, address);
              return {
                winners,
              };
            });

            i++;
          } catch (error) {
            console.error(error);
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
}));
