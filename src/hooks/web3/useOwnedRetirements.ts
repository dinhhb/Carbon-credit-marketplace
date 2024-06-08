import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";
import { Retirement } from "@/types/retirement";

type UseOwnedRetirementResponse = {};

type OwnedRetirementsHookFactory = CryptoHookFactory<
  Retirement[],
  UseOwnedRetirementResponse
>;

const EMPTY_ARRAY = [] as any;

export type UseOwnedRetirementsHook = ReturnType<OwnedRetirementsHookFactory>;

export const hookFactory: OwnedRetirementsHookFactory =
  ({ retireContract }) =>
  () => {

    const { data, error, ...swrRes } = useSWR(
      retireContract ? "web3/useAllRetirements" : null,
      async () => {
        const retirements = [] as Retirement[];
        const coreRetirements = await retireContract!.getOwnedRetirements();

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
            isCertificated: retirement.isCertificated,
            metadata
          });
        }

        return retirements;
      },
    );

    // console.log("SWR data: ", data);
    if (error) console.error("Error fetching retirements: ", error);

    return {
      data: data || EMPTY_ARRAY,
      ...swrRes,
      error,
      isLoading: !data,
    };
  };
