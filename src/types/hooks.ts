import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";
import { CarbonMarketContract } from "./carbonMarketContract";

export type Web3Dependencies = {
  provider: providers.Web3Provider;
  contract: CarbonMarketContract;
  ethereum: MetaMaskInpageProvider;
  isLoading: boolean;
};

export type CryptoHookFactory<Data = any, Response = any, Params = any> = {
  (d: Partial<Web3Dependencies>): CrytoHandlerHook<Data, Response, Params>;
};

export type CrytoHandlerHook<Data = any, Response = any, Params = any> = (
  params?: Params,
) => CrytoSWRResponse<Data, Response>;

export type CrytoSWRResponse<Data = any, Response = any> = SWRResponse<Data> & Response;

// export type CryptoHookFactory<Data = any, Params = any> = {
//   (d: Partial<Web3Dependencies>): (params: Params) => SWRResponse<Data>;
// };
