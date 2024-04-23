import { Web3Dependencies } from "@/types/hooks";
import { hookFactory as createAccountHook, UseAccountHook } from "./useAccount";
import { hookFactory as createNetworkHook, UseNetworkHook } from "./useNetwork";
import { hookFactory as createListedCreditsHook, UseListedCreditsHook } from "./useListedCredits";
import { hookFactory as createOwnedCreditsHook, UseOwnedCreditsHook } from "./useOwnedCredits";


export type Web3Hooks = {
  useAccount: UseAccountHook;
  useNetwork: UseNetworkHook;
  useListedCredits: UseListedCreditsHook;
  useOwnedCredits: UseOwnedCreditsHook;
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
  };
};
