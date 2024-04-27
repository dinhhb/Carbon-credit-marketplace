import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";
import { CarbonMarketContract } from "./CarbonMarketContract";
import { CarbonTokenContract } from "./CarbonTokenContract";
import { ProjectManagementContract } from "./ProjectManagementContract";

export type Web3Dependencies = {
  provider: providers.Web3Provider;
  tokenContract: CarbonTokenContract;
  projectContract: ProjectManagementContract;
  marketContract: CarbonMarketContract;
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
