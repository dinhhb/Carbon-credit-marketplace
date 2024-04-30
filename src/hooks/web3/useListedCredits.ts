import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { ethers } from "ethers";
import { useAccount } from ".";
import { useCallback } from "react";

type UseListedCreditsResponse = {
  buyCredit: (tokenId: number, value: number) => Promise<void>;
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

    const _marketContract = marketContract;

    const buyCredit = useCallback(async (tokenId: number, value: number) => {
      try {
        const result = await _marketContract!.buyCredits(tokenId, value, {
          value: ethers.utils.parseEther(value.toString()),
        });
        result?.wait();
        alert("Credit bought successfully");
      } catch (e: any) {
        console.log(e.message);
      }
    }, [_marketContract]);

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      buyCredit,
    };
  };
