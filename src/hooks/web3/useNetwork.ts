import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";

const NETWORKS: { [k: string]: string } = {
  1: "Ethereum Main Network",
  3: "Ropsten Test Network",
  4: "Rinkeby Test Network",
  5: "Goerli Test Network",
  42: "Kovan Test Network",
  56: "Binance Smart Chain",
  1337: "Ganache",
  59140: "Linea Goerli Test Network",
  11155111: "Sepolia Test Network",
};

const targetId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
const targetNetwork = NETWORKS[targetId];

type UseNetworkResponse = {
  isLoading: boolean;
  isSupported: boolean;
  targetNetwork: string;
};

type NetworkHookFactory = CryptoHookFactory<string, UseNetworkResponse>;

export type UseNetworkHook = ReturnType<NetworkHookFactory>;

// deps -> provider, ethereum, contract (web3State)
export const hookFactory: NetworkHookFactory =
  ({ provider, isLoading }) =>
  () => {
    const { data, isValidating, ...swr } = useSWR(
      provider ? "web3/useNetwork" : null,
      async () => {
        const chainId = (await provider!.getNetwork()).chainId;

        if (!chainId) {
          throw "Cannot get network. Refresh browser or switch network."
        }

        return NETWORKS[chainId];
      },
      {
        revalidateOnFocus: false,
      },
    );

    return {
      ...swr,
      data,
      isValidating,
      targetNetwork,
      isSupported: data === targetNetwork,
      isLoading: isLoading as boolean,
    };
  };
