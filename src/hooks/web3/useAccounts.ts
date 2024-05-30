import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { Account } from "@/types/account";
import { ethers } from "ethers";

type UseAccountsResponse = {
  registerAuditor: (address: string) => Promise<void>;
  registerUser: (address: string, totalCredits: number) => Promise<void>;
  removeAccount: (address: string) => Promise<void>;
};

type AccountsHookFactory = CryptoHookFactory<Account[], UseAccountsResponse>;

const EMPTY_ARRAY = [] as any;

export type UseAccountsHook = ReturnType<AccountsHookFactory>;

export const hookFactory: AccountsHookFactory =
  ({ tokenContract, accountContract, projectContract, marketContract }) =>
  () => {

    const { data, ...swrRes } = useSWR(
      accountContract ? "web3/useAccounts" : null,
      async () => {
        const accounts = [] as Account[];
        const coreAccounts = await accountContract!.getAllAccounts();

        for (let i = 0; i < coreAccounts.length; i++) {
          const account = coreAccounts[i];

          accounts.push({
            address: account.addr,
            totalCredits: account.totalCredits.toNumber(),
            totalRetire: account.totalRetire.toNumber(),
            isAuditor: account.isAuditor,
            registerdAt: account.registeredAt.toNumber(),
          });
        }

        // debugger;
        return accounts;
      },
    );

    const _accountContract = accountContract;

    const registerAuditor = useCallback(
      async (address: string) => {
        try {
          const checksummedAddress = ethers.utils.getAddress(address);
          const result = await _accountContract!.registerAccount(
            checksummedAddress,
            0,
            true,
          );
          await toast.promise(result!.wait(), {
            pending: "Registering account...",
            success: "Account registered",
            error: "Failed to register account",
          });
        } catch (e: any) {
          if (e.code === 'INVALID_ARGUMENT') {
            alert(`Error: Invalid address: ${e.reason || e.message}`);
          } 
          console.log(e.message);
        }
      },
      [_accountContract],
    );

    const registerUser = useCallback(
      async (address: string, totalCredits: number) => {
        try {
          const checksummedAddress = ethers.utils.getAddress(address);
          const result = await _accountContract!.registerAccount(
            checksummedAddress,
            totalCredits,
            false,
          );
          await toast.promise(result!.wait(), {
            pending: "Registering account...",
            success: "Account registered",
            error: "Failed to register account",
          });
        } catch (e: any) {
          if (e.code === 'INVALID_ARGUMENT') {
            alert(`Error: Invalid address: ${e.reason || e.message}`);
          }
          console.log(e.message);
        }
      },
      [_accountContract],
    );

    const removeAccount = useCallback(
      async (address: string) => {
        try {
          const checksummedAddress = ethers.utils.getAddress(address);
          const result = await _accountContract!.removeAccount(checksummedAddress);
          await toast.promise(result!.wait(), {
            pending: "Removing account...",
            success: "Account removed",
            error: "Failed to remove account",
          });
        } catch (e: any) {
          if (e.code === 'INVALID_ARGUMENT') {
            alert(`Error: Invalid address: ${e.reason || e.message}`);
          }
          console.log(e.message);
        }
      },
      [_accountContract],
    );

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      isLoading: !data,
      registerAuditor,
      registerUser,
      removeAccount,
    };
  };
