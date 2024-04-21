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
