import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { Contract, ethers } from "ethers";
import { useAccount } from ".";

type UseOwnedCreditsResponse = {
  listCredit: (tokenId: number, price: number) => Promise<void>;
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

    const tokenContractAddress = tokenContract ? (tokenContract as unknown as Contract).address : undefined;
    // console.log(tokenContractAddress);

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

    const listCredit = async (tokenId: number, price: number) => {
      try {
        const result1 = await tokenContract?.setApprovalForAll(tokenContractAddress || "", true);
        await result1?.wait();
        alert("Approval granted");
        const result2 = await marketContract?.listCreditsForSale(
          tokenId,
          ethers.utils.parseEther(price.toString()),
        );
        result2?.wait();
        alert("Credit has been listed");
      } catch (e: any) {
        console.log(e.message);
      }
    };

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      listCredit,
    };
  };
