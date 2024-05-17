import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { useAccount, useNetwork } from "@/hooks/web3";

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { account } = useAccount();
  const { network } = useNetwork();
  const isAdmin = account.isAdmin;
  const isLoading = account.isLoading;
  const isInstalled = account.isInstalled;
  const accountData = account.data;
  const connect = account.connect;
  const networkData = network.data;
  const isSupported = network.isSupported;
  const targetNetwork = network.targetNetwork;
  const networkIsLoading = network.isLoading;

  return (
    <>
      <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
        <div className="flex w-full items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* <!-- Hamburger Toggle BTN --> */}
            <button
              aria-controls="sidebar"
              onClick={(e) => {
                e.stopPropagation();
                props.setSidebarOpen(!props.sidebarOpen);
              }}
              className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
            >
              <span className="relative block h-5.5 w-5.5 cursor-pointer">
                <span className="du-block absolute right-0 h-full w-full">
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!w-full delay-300"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "delay-400 !w-full"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!w-full delay-500"
                    }`}
                  ></span>
                </span>
                <span className="absolute right-0 h-full w-full rotate-45">
                  <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!h-0 !delay-[0]"
                    }`}
                  ></span>
                  <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && "!h-0 !delay-200"
                    }`}
                  ></span>
                </span>
              </span>
            </button>

            {!isLoading && accountData && (
              <>
                <div className="hidden flex-col items-start lg:flex">
                  <span className="text-sm font-medium text-black dark:text-white">
                    Account: {accountData}
                  </span>
                  {networkIsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : networkData !== targetNetwork ? (
                    <>
                      <span className="text-sm">Network: {networkData}</span>
                      <span className="text-sm text-danger">
                        Wrong network, please switch to {targetNetwork}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-primary">
                      Network: {networkData}
                    </span>
                  )}
                </div>
              </>
            )}

            {!isLoading && !accountData && isInstalled && (
              <>
                <div className="hidden flex-col items-start lg:flex">
                  {networkIsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : networkData !== targetNetwork ? (
                    <>
                      <span className="text-sm">Network: {networkData}</span>
                      <span className="text-sm text-danger">
                        Wrong network, please switch to {targetNetwork}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-primary">
                      Network: {networkData}
                    </span>
                  )}
                </div>
              </>
            )}

            {!isLoading && !accountData && !isInstalled && (
              <>
              <div className="hidden flex-col items-start lg:flex">
                <span className="text-sm text-danger">Metamask is not installed. Please install Metamask</span>
              </div>
            </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3 2xsm:gap-7">
            <ul className="flex items-center gap-2 2xsm:gap-4">
              {/* <!-- Dark Mode Toggler --> */}
              <DarkModeSwitcher />
              {/* <!-- Dark Mode Toggler --> */}
              {!isLoading && accountData && (
                <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white">
                  Hello {isAdmin ? "Admin" : "User"}
                </div>
              )}

              {!isLoading && !accountData && isInstalled && (
                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90"
                  onClick={() => {
                    connect();
                  }}
                >
                  Connect Wallet
                </Link>
              )}
              {!isLoading && !accountData && !isInstalled && (
                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-center font-medium text-white hover:bg-opacity-90"
                  onClick={() => {
                    window.open("https://metamask.io/download/", "_blank");
                  }}
                >
                  Install Wallet
                </Link>
              )}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
