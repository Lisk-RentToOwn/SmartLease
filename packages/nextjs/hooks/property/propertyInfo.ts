import { usePropertyEvent } from "./useTenant";
import { formatUnits } from "viem";

export function usePropertyInfo(propertyId?: number) {
  const { info, loading, error } = usePropertyEvent(propertyId);
  const obj = { ...(info?.args || {}) };

  const fullPriceWei = obj[3] || 0;
  const fullPriceEther = Number(formatUnits(fullPriceWei, 18));
  const term = Number(obj[4]);

  const propertyInfo = {
    tokenId: Number(obj[2]) || 0,
    fullPrice: Number(fullPriceEther.toFixed(6)),
    monthlyPrice: Number((fullPriceEther / term).toFixed(6)) || "0.00",
    term,
    name: obj[5] || 0,
    image: obj[6],
    street: obj[7],
    city: obj[8],
    state: obj[9],
    currency: obj[11],
  };

  return { propertyInfo, loading, error };
}
