import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { ethers } from "ethers";
import { useAccount } from ".";
import { useCallback } from "react";
import { toast } from "react-toastify";

type UseListedCreditsResponse = {
  buyCredit: (tokenId: number, amount: number, value: number) => Promise<void>;
};

type ListedCreditsHookFactory = CryptoHookFactory<
  Credit[],
  UseListedCreditsResponse
>;

const EMPTY_ARRAY = [] as any;

export type UseListedCreditsHook = ReturnType<ListedCreditsHookFactory>;

export const hookFactory: ListedCreditsHookFactory =
  ({ tokenContract, projectContract, marketContract }) =>
  () => {
    const { account } = useAccount();
    const { data, ...swrRes } = useSWR(
      marketContract ? "web3/useListedCredits" : null,
      async () => {
        const credits = [] as Credit[];
        const coreCredits = await marketContract!.getAllListedCredits();

        for (let i = 0; i < coreCredits.length; i++) {
          const credit = coreCredits[i];
          const tokenURI = await tokenContract!.uri(credit.tokenId);
          const metadataRes = await fetch(tokenURI);
          const metadata = await metadataRes.json();
          const ownerCount = await tokenContract!.getOwnerCount(credit.tokenId);
          const owners = await tokenContract!.getTokenOwners(credit.tokenId);
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

    const _marketContract = marketContract;

    const buyCredit = useCallback(
      async (tokenId: number, amount: number, value: number) => {
        try {
          console.log("Original: ", value);
          // Increase the value by a small buffer (e.g., 1%)
          const bufferValue = value * 1.01;
          console.log("Spending: ", value);
          const result = await _marketContract!.buyCredits(tokenId, amount, {
            value: ethers.utils.parseEther(bufferValue.toString()),
          });
          await toast.promise(result!.wait(), {
            pending: "Buying credit...",
            success: "Credit bought successfully!",
            error: "Failed to buy credit",
          });
        } catch (e: any) {
          alert("Failed to buy credit");
          console.log(e.message);
        }
      },
      [_marketContract],
    );

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      isLoading: !data,
      buyCredit,
    };
  };
