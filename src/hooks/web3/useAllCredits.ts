import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { Contract, ethers } from "ethers";
import { useAccount } from ".";
import { useCallback } from "react";
import { toast } from "react-toastify";

type UseAllCreditsResponse = {
  approveProject: (tokenId: number) => Promise<void>;
  declineProject: (tokenId: number) => Promise<void>;
};

type AllCreditsHookFactory = CryptoHookFactory<Credit[], UseAllCreditsResponse>;

const EMPTY_ARRAY = [] as any;

export type UseAllCreditsHook = ReturnType<AllCreditsHookFactory>;

export const hookFactory: AllCreditsHookFactory =
  ({ tokenContract, projectContract, marketContract }) =>
  () => {
    const { account } = useAccount();

    const marketContractAddress = marketContract
      ? (marketContract as unknown as Contract).address
      : undefined;

    const { data, ...swrRes } = useSWR(
      tokenContract ? "web3/useAllCredits" : null,
      async () => {
        const credits = [] as Credit[];
        const coreCredits = await tokenContract!.getAllCredits();

        for (let i = 0; i < coreCredits.length; i++) {
          const credit = coreCredits[i];
          const tokenURI = await tokenContract!.uri(credit.tokenId);
          const metadataRes = await fetch(tokenURI);
          const metadata = await metadataRes.json();
          const ownerCount = await tokenContract!.getOwnerCount(i + 1);
          const owners = await tokenContract!.getTokenOwners(i + 1);
          const quantity = await tokenContract!.getTokenSupply(credit.tokenId);
          const quanitySold = await tokenContract!.getTokenSold(credit.tokenId);
          const quantityOwned = await tokenContract!.balanceOf(
            account.data || "",
            credit.tokenId,
          );

          credits.push({
            tokenId: credit.tokenId.toNumber(),
            initialOwner: credit.initialOwner,
            approvalStatus: credit.status.toString(), // may cause error
            pricePerCredit: parseFloat(
              ethers.utils.formatEther(credit.pricePerCredit),
            ),
            isListed: credit.isListed,
            ownerCount: ownerCount.toNumber(),
            owners: owners,
            quantity: quantity.toNumber(),
            quantitySold: quanitySold.toNumber(),
            metadata,
            quantityOwned: quantityOwned.toNumber(),
          });
        }

        // debugger;
        return credits;
      },
    );

    const _projectContract = projectContract;

    const approveProject = useCallback(
      async (tokenId: number) => {
        // console.log(marketContractAddress);
        try {
          const result2 = await _projectContract!.approveProject(tokenId);
          await toast.promise(result2!.wait(), {
            pending: "Approving project...",
            success: "Project approved",
            error: "Failed to approve project",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [_projectContract],
    );

    const declineProject = useCallback(
      async (tokenId: number) => {
        try {
          const result2 = await _projectContract!.declineProject(tokenId);
          await toast.promise(result2!.wait(), {
            pending: "Declining project...",
            success: "Project declined",
            error: "Failed to decline project",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [_projectContract],
    );

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      approveProject,
      declineProject,
    };
  };
