import { usePropertyEvent } from "./useTenant";

export function usePropertyInfo(propertyId?: number) {
  const { info, loading, error } = usePropertyEvent(propertyId);
  const obj = { ...(info?.args || {}) };

  const fullPrice = Number(obj[3]);
  const duration = Number(obj[4]);

  const propertyInfo = {
    tokenId: Number(obj[0]),
    fullPrice: fullPrice ?? 0,
    monthlyPrice: Intl.NumberFormat("en-us").format(fullPrice / duration || 0),
    duration,
    name: obj[5],
    image: obj[6],
    town: obj[7],
    city: obj[8],
    currency: obj[11],
  };

  return { propertyInfo, loading, error };
}
