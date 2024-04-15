import { CryptoHookFactory } from "@/types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
};

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps -> provider, ethereum, contract (web3State)
export const hookFactory: AccountHookFactory =
  ({ provider, ethereum, isLoading }) =>
  () => {
    const {data, mutate, isValidating, ...swr} = useSWR(
      provider ? "web3/useAccount" : null,
      async () => {
        const accounts = await provider!.listAccounts();
        const account = accounts[0];

        if (!account) {
          throw "Cannot get account. Please check your wallet.";
        }

        return account;
      },
      {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      },
    );

    useEffect(() => {
      ethereum?.on("accountsChanged", handleAccountsChanged);
      return () => {
        ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      }
    });
    

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        console.log("Please connect to MetaMask.");
      } else if (accounts[0] !== data) {       // if account changed
        mutate(accounts[0]); 
      }
    }

    const connect = async () => {
      try {
        ethereum?.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error(error);
      }
    };

    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading as boolean,
      isInstalled: ethereum?.isMetaMask  || false,
      mutate,
      connect
    };
  };
