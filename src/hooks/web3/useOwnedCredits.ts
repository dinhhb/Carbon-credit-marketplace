import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { Contract, ethers } from "ethers";
import { useAccount } from ".";
import { useCallback } from "react";
import { toast } from "react-toastify";

type UseOwnedCreditsResponse = {
  changePrice: (tokenId: number, price: number) => Promise<void>;
  delistCredits: (tokenId: number) => Promise<void>;
  listCredits: (tokenId: number, price: number) => Promise<void>;
  retireCredits: (tokenId: number, amount: number) => Promise<void>;
};

type OwnedCreditsHookFactory = CryptoHookFactory<
  Credit[],
  UseOwnedCreditsResponse
>;

const EMPTY_ARRAY = [] as any;

export type UseOwnedCreditsHook = ReturnType<OwnedCreditsHookFactory>;

export const hookFactory: OwnedCreditsHookFactory =
  ({ tokenContract, projectContract, marketContract }) =>
  () => {
    const { account } = useAccount();

    const marketContractAddress = marketContract
      ? (marketContract as unknown as Contract).address
      : undefined;

    const { data, ...swrRes } = useSWR(
      tokenContract ? "web3/useOwnedCredits" : null,
      async () => {
        const credits = [] as Credit[];
        const coreCredits = await tokenContract!.getOwnedCredits();

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

    const _tokenContract = tokenContract;
    const _marketContract = marketContract;

    const changePrice = useCallback(
      async (tokenId: number, price: number) => {
        try {
          const result2 = await _marketContract!.changePrice(
            tokenId,
            ethers.utils.parseEther(price.toString()),
          );
          await toast.promise(result2!.wait(), {
            pending: "Changing price...",
            success: "Price changed successfully!",
            error: "Failed to change price",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [_marketContract],
    );

    const delistCredits = useCallback(
      async (tokenId: number) => {
        try {
          const result = await _marketContract!.delistCredits(tokenId);
          await toast.promise(result!.wait(), {
            pending: "Delisting credit...",
            success: "Credit delisted successfully!",
            error: "Failed to delist credit",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [_marketContract],
    );

    const listCredits = useCallback(
      async (tokenId: number, price: number) => {
        try {
          const result = await _marketContract!.listCreditsForSale(
            tokenId,
            ethers.utils.parseEther(price.toString()),
          );
          await toast.promise(result!.wait(), {
            pending: "Listing credit...",
            success: "Credit listed successfully!",
            error: "Failed to list credit",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [_marketContract],
    );

    const retireCredits = useCallback(
      async (tokenId: number, amount: number) => {
        try {
          const result1 = await _tokenContract!.setApprovalForAll(
            marketContractAddress || "",
            true,
          );
          await result1?.wait();
          alert("Approval granted");
          const result2 = await _marketContract!.retireCredits(tokenId, amount);
          await toast.promise(result2!.wait(), {
            pending: "Retiring credit...",
            success: "Credit retired successfully!",
            error: "Failed to retire credit",
          });
        } catch (e: any) {
          console.log(e.message);
        }
      },
      [marketContractAddress, _tokenContract, _marketContract],
    );

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      isLoading: !data,
      changePrice,
      delistCredits,
      listCredits,
      retireCredits,
    };
  };
