import { Web3Dependencies } from "@/types/hooks";
import { hookFactory as createAccountHook, UseAccountHook } from "./useAccount";
import { hookFactory as createNetworkHook, UseNetworkHook } from "./useNetwork";
import { hookFactory as createListedCreditsHook, UseListedCreditsHook } from "./useListedCredits";
import { hookFactory as createOwnedCreditsHook, UseOwnedCreditsHook } from "./useOwnedCredits";
import { hookFactory as createAllCreditsHook, UseAllCreditsHook } from "./useAllCredits";
import { hookFactory as createAccountsHook, UseAccountsHook } from "./useAccounts";
import { hookFactory as createAllRetiremntsHook, UseAllRetirementsHook } from "./useAllRetirements";
import { hookFactory as createOwnedRetirementsHook, UseOwnedRetirementsHook } from "./useOwnedRetirements";

export type Web3Hooks = {
  useAccount: UseAccountHook;
  useNetwork: UseNetworkHook;
  useListedCredits: UseListedCreditsHook;
  useOwnedCredits: UseOwnedCreditsHook;
  useAllCredits: UseAllCreditsHook;
  useAccounts: UseAccountsHook;
  useAllRetirements: UseAllRetirementsHook;
  useOwnedRetirements: UseOwnedRetirementsHook;
};

export type SetupHooks = {
  (d: Web3Dependencies): Web3Hooks;
};

export const setupHooks: SetupHooks = (deps) => {
  return {
    useAccount: createAccountHook(deps),
    useNetwork: createNetworkHook(deps),
    useListedCredits: createListedCreditsHook(deps),
    useOwnedCredits: createOwnedCreditsHook(deps),
    useAllCredits: createAllCreditsHook(deps),
    useAccounts: createAccountsHook(deps),
    useAllRetirements: createAllRetiremntsHook(deps),
    useOwnedRetirements: createOwnedRetirementsHook(deps),
  };
};
