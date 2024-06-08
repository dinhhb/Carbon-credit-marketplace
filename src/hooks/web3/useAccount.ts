import { CryptoHookFactory } from "@/types/hooks";
import { useEffect } from "react";
import useSWR from "swr";
import { useAccounts } from ".";
import { Account } from "@/types/account";
import { useRouter } from "next/navigation";

type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
  isAdmin: boolean;
  isAuditor: boolean;
};

const adminAddress: { [key: string]: boolean } = {
  "0xd24cb09d1Ab3790EA83F1E6961abA3fa26b43fD5": true,
};

const auditorAddress: { [key: string]: boolean } = {};

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps -> provider, ethereum, contract (web3State)
export const hookFactory: AccountHookFactory =
  ({ provider, ethereum, isLoading }) =>
  () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
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
      };
    });

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        console.log("Please connect to MetaMask.");
      } else if (accounts[0] !== data) {
        // if account changed
        mutate(accounts[0]);
      }
    };

    const connect = async () => {
      try {
        await ethereum?.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error(error);
      }
    };

    const { accounts } = useAccounts();
    if (accounts) {
      accounts.data?.forEach((account: Account) => {
        if (account.isAuditor) {
          auditorAddress[account.address] = true;
        }
      });
    }

    const router = useRouter();
    const currentRoute =
      typeof window !== "undefined" ? window.location.pathname : "";

    useEffect(() => {
      if (!data) return; // Wait until the account data is loaded

      if (
        currentRoute === "/" ||
        currentRoute === "/activities" ||
        currentRoute === "/my-credits" ||
        currentRoute === "/register-project"||
        currentRoute === "/retirements"
      ) {
        if (adminAddress[data]) {
          router.push("/manage-accounts");
        } else if (auditorAddress[data]) {
          router.push("/manage-projects");
        }
      } else if (currentRoute === "/manage-accounts") {
        if (auditorAddress[data]) {
          router.push("/manage-projects");
        } else if (!adminAddress[data] && !auditorAddress[data]) {
          router.push("/");
        }
      } else if (currentRoute === "/manage-projects" || currentRoute === "/manage-retirements") {
        if (adminAddress[data]) {
          router.push("/manage-accounts");
        } else if (!adminAddress[data] && !auditorAddress[data]) {
          router.push("/");
        }
      }
    }, [data, router, currentRoute]);

    return {
      ...swr,
      data,
      isValidating,
      isAdmin: !!(data && adminAddress[data]) ?? false,
      isAuditor: !!(data && auditorAddress[data]) ?? false,
      isLoading: isLoading as boolean,
      isInstalled: ethereum?.isMetaMask || false,
      mutate,
      connect,
    };
  };
