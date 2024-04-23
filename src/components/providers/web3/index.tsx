import {
  FunctionComponent,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Web3State,
  createDefaultState,
  createWeb3State,
  loadContract,
} from "./utils";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { CarbonMarketContract } from "@/types/carbonMarketContract";

const pageReload = () => {
  window.location.reload();
};

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLocked = !(await ethereum._metamask.isUnlocked());
  if (isLocked) {
    pageReload();
  }
};

const setGlobalListener = (ethereum: MetaMaskInpageProvider) => {
  ethereum.on("chainChanged", pageReload);
  ethereum.on("accountsChanged", handleAccount(ethereum));
};

const removeGlobalListener = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener("chainChanged", pageReload);
  ethereum?.removeListener("accountsChanged", handleAccount);
};

interface Props {
  children: React.ReactNode;
}

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent<Props> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any,
        );
        const contract = await loadContract(
          "CarbonMarket",
          provider,
        );

        const signer = provider.getSigner();
        const signedContract = contract.connect(signer);

        setGlobalListener(window.ethereum);
        setWeb3Api(
          createWeb3State({
            ethereum: window.ethereum as any,
            provider,
            contract: signedContract as unknown as CarbonMarketContract,
            isLoading: false,
          }),
        );
      } catch (error: any) {
        console.error("Please install MetaMask");
        setWeb3Api((api) =>
          createWeb3State({ ...(api as any), isLoading: false }),
        );
      }
    }
    initWeb3();
    return () => removeGlobalListener(window.ethereum);
  }, []);

  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export function useWeb3() {
  // console.log("Web3 context:", useContext(Web3Context));
  return useContext(Web3Context);
}

export function useHooks() {
  const { hooks } = useWeb3();
  return hooks;
}

export default Web3Provider;