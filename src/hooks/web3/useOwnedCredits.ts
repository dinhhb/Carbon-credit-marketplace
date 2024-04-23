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
  ({ contract }) =>
  () => {
    const { data, ...swrRes } = useSWR(
      contract ? "web3/useOwnedCredits" : null,
      async () => {

        const credits = [] as Credit[];
        const coreCredits = await contract!.getOwnedCredits();

        for (let i = 0; i < coreCredits.length; i++) {
          const credit = coreCredits[i];
          const tokenURI = await contract!.uri(credit.tokenId);
          const metadataRes = await fetch(tokenURI);
          const metadata = await metadataRes.json();

          credits.push({
            tokenId: credit.tokenId.toNumber(),
            initialOwner: credit.initialOwner,
            approvalStatus: credit.status.toString(),   // may cause error
            pricePerCredit: parseFloat(ethers.utils.formatEther(credit.pricePerCredit)),
            isListed: credit.isListed,
            metadata
          });
        }
        
        // debugger;
        return credits;
      },
    );
    return {
      data: data || [],
      ...swrRes,
    };
  };
