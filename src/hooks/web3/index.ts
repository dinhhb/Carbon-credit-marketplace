import { useHooks } from "@/components/providers/web3";

export const useAccount = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAccount();
  return {
    account: swrRes,
  };
};

export const useNetwork = () => {
  const hooks = useHooks();
  const swrRes = hooks.useNetwork();
  return {
    network: swrRes,
  };
}

export const useListedCredits = () => {
  const hooks = useHooks();
  const swrRes = hooks.useListedCredits();
  return {
    credits: swrRes,
  };
}

export const useOwnedCredits = () => {
  const hooks = useHooks();
  const swrRes = hooks.useOwnedCredits();
  return {
    credits: swrRes,
  };
}

export const useAllCredits = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAllCredits();
  return {
    credits: swrRes,
  };
}

export const useAccounts = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAccounts();
  return {
    accounts: swrRes,
  };
}

export const useAllRetirements = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAllRetirements();
  return {
    retirements: swrRes,
  };
}

export const useOwnedRetirements = () => {
  const hooks = useHooks();
  const swrRes = hooks.useOwnedRetirements();
  return {
    retirements: swrRes,
  };
}
