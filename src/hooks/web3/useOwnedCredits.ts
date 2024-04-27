import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Credit } from "@/types/credit";
import { ethers } from "ethers";

type UseOwnedCreditsResponse = {};
type OwnedCreditsHookFactory = CryptoHookFactory<
  Credit[],
  UseOwnedCreditsResponse
>;

export type UseOwnedCreditsHook = ReturnType<OwnedCreditsHookFactory>;

export const hookFactory: OwnedCreditsHookFactory =
  ({ tokenContract, projectContract, marketContract }) =>
  () => {
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
          const ownerCount = await tokenContract!.getOwnerCount(i+1);
          const owners = await tokenContract!.getTokenOwners(i+1)
          const quantity = await tokenContract!.getTokenSupply(credit.tokenId);
          const quanitySold = await tokenContract!.getTokenSold(credit.tokenId);

          credits.push({
            tokenId: credit.tokenId.toNumber(),
            initialOwner: credit.initialOwner,
            approvalStatus: credit.status.toString(),   // may cause error
            pricePerCredit: parseFloat(ethers.utils.formatEther(credit.pricePerCredit)),
            isListed: credit.isListed,
            ownerCount: ownerCount.toNumber(),
            owners: owners,
            quantity: quantity.toNumber(),
            quantitySold: quanitySold.toNumber(),
            metadata
          });
        }
        
        debugger;
        return credits;
      },
    );
    return {
      data: data || [],
      ...swrRes,
    };
  };
