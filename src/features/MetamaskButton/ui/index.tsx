import React from "react";
import { Button, useAppStore } from "../../../shared";

export const MetamaskButton: React.FC = () => {
  const [connect, disconnect, wallet] = useAppStore((state) => [
    state.connect,
    state.disconnect,
    state.wallet,
  ]);

  return (
    <div className="flex justify-center flex-col">
      <Button
        loading={!!wallet?.loading}
        onClick={() => (!wallet?.connected ? connect() : disconnect())}
      >
        <i className="fas fa-wallet mr-2"></i>
        {!wallet?.connected ? "Connect Metamask" : "Disconnect MetaMask"}
      </Button>
    </div>
  );
};
