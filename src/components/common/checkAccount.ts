import { useAccount } from "@/hooks/web3";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const CheckAccount = () => {
  const { account } = useAccount();
  const router = useRouter();
  const currentRoute = window.location.pathname;

  useEffect(() => {
    if (!account) return; // Wait until the account data is loaded

    if (
      currentRoute === "/" ||
      currentRoute === "/activities" ||
      currentRoute === "/my-credits" ||
      currentRoute === "/register-project"
    ) {
      if (account.isAdmin) {
        console.log("Redirecting to manage accounts...");
        console.log(account);
        router.push("/manage-accounts");
      } else if (account.isAuditor) {
        router.push("/manage-projects");
      }
    } else if (currentRoute === "/manage-accounts") {
      if (account.isAuditor) {
        router.push("/manage-projects");
      } else if (!account.isAdmin && !account.isAuditor) {
        console.log("Redirecting to home page...");
        console.log(account);
        router.push("/");
      }
    } else if (currentRoute === "/manage-projects") {
      if (account.isAdmin) {
        router.push("/manage-accounts");
      } else if (!account.isAuditor && !account.isAdmin) {
        router.push("/");
      }
    }
  }, [account, router, currentRoute]);

  return null;
};
