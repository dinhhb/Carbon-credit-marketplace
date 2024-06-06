import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { useAccount } from ".";
import { Retirement } from "@/types/retirement";

type UseAllRetirementsResponse = {};

type AllRetirementsHookFactory = CryptoHookFactory<
  Retirement[],
  UseAllRetirementsResponse
>;

const EMPTY_ARRAY = [] as any;

export type UseAllRetirementsHook = ReturnType<AllRetirementsHookFactory>;

export const hookFactory: AllRetirementsHookFactory =
  ({ retireContract }) =>
  () => {

    const { data, ...swrRes } = useSWR(
      retireContract ? "web3/useAllRetirements" : null,
      async () => {
        const retirements = [] as Retirement[];
        const coreRetirements = await retireContract!.getAllRetirements();

        for (let i = 0; i < coreRetirements.length; i++) {
          const retirement = coreRetirements[i];
          const retirementURI = await retireContract!.tokenURI(retirement.tokenId);
          const metadataRes = await fetch(retirementURI);
          const metadata = await metadataRes.json();

          retirements.push({
            retirementId: retirement.tokenId.toNumber(),
            amount: retirement.amount.toNumber(),
            owner: retirement.owner,
            projectId: retirement.projectId.toNumber(),
            time: retirement.timestamp.toNumber(),
            metadata
          });
        }

        // debugger;
        return retirements;
      },
    );

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      isLoading: !data,
    };
  };
