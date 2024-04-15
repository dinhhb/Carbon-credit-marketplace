import { FunctionComponent } from "react";
import Link from "next/link";

type WalletbarProps = {
  isLoading: boolean;
  isInstalled: boolean;
  account: string | undefined;
  connect: () => void;
  network: string | undefined;
  isSupported: boolean;
  targetNetwork: string;
  networkIsLoading: boolean;
};

const Walletbar: FunctionComponent<WalletbarProps> = ({
  isLoading,
  isInstalled,
  account,
  connect,
  network,
  isSupported,
  targetNetwork,
  networkIsLoading,
}) => {
  if (isLoading) {
    return (
      <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white">
        Loading...
      </div>
    );
  }

  if (account) {
    return (
      <>
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {account}
          </span>
          {/* <span className="block text-sm">{network}</span>
          <span className="block text-sm">{`Is supported: ${isSupported}`}</span>
          <span className="block text-sm">Target: {targetNetwork}</span> */}
          {networkIsLoading ? (
            <span className="block text-sm">Loading...</span>
          ) : network !== targetNetwork ? (
            <>
              <span className="block text-sm">{network}</span>
              <span className="block text-sm text-danger">
                Wrong network, please switch to {targetNetwork}
              </span>
            </>
          ) : (
            <span className="block text-sm text-primary">{network}</span>
          )}
        </span>
        <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white">
          Hello user
        </div>
      </>
    );
  }

  if (isInstalled) {
    return (
      <>
        <span className="hidden text-right lg:block">
          {networkIsLoading ? (
            <span className="block text-sm">Loading...</span>
          ) : network !== targetNetwork ? (
            <>
              <span className="block text-sm">{network}</span>
              <span className="block text-sm text-danger">
                Wrong network, please switch to {targetNetwork}
              </span>
            </>
          ) : (
            <span className="block text-sm text-primary">{network}</span>
          )}
        </span>
        <Link
          href="#"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90"
          onClick={() => {
            connect();
          }}
        >
          Connect Wallet
        </Link>
      </>
    );
  } else {
    return (
      <Link
        href="#"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90"
        onClick={() => {
          window.open("https://metamask.io/download/", "_blank");
        }}
      >
        Install Wallet
      </Link>
    );
  }
};

export default Walletbar;
