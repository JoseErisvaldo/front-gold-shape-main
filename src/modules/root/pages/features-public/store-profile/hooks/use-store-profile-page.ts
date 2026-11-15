import { usePublicStoreQuery } from "../../storefront/queries/use-public-store-query";
import { STORE_PROFILE_MOCK } from "../constants/store-profile-mock";
import { buildMapsUrl } from "../helpers/format-address";

export function useStoreProfilePage() {
  const { data: store, isPending, isError, isFetching, refetch } = usePublicStoreQuery();

  return {
    store,
    isPending,
    isError,
    isFetching,
    refetch,
    profile: STORE_PROFILE_MOCK,
    mapsUrl: buildMapsUrl(STORE_PROFILE_MOCK.address),
  };
}
