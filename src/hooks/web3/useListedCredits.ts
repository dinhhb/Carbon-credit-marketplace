import { CryptoHookFactory } from "@/types/hooks";
import useSWR from "swr";

type UseListedCreditsResponse = {}
type ListedCreditsHookFactory = CryptoHookFactory<any, UseListedCreditsResponse>

export type UseListedCreditsHook = ReturnType<ListedCreditsHookFactory>

export const hookFactory: ListedCreditsHookFactory = ({contract}) => () => {
    const {data, ...swrRes} = useSWR(
        contract ? "web3/useListedCredits": null,
        async () => {
            const credits = [] as any;
            return credits;
    }
    )
    return {
        data: data || [],
        ...swrRes
    };
}