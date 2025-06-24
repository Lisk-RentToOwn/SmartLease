import { PaymentRecord } from "@/types/tenant-tpes";

export function calculateFullOwnershipDate(
  payments: PaymentRecord[],
  propertyDuration: number
): Date | undefined {
  if (payments.length === 0) return undefined;

  const oldestPayment = payments[payments.length - 1]; // oldest = last

  // FIX: clone the date before mutating
  const base = new Date(oldestPayment.date);
  base.setMonth(base.getMonth() + propertyDuration);
  return base;
}
  
  /**
   * Determine equity tier based on percentage
   */
  export function getEquityTier(equityPercentage: number): {
    name: string;
    color: string;
    progress: number;
  } {
    const tiers = [
      { threshold: 0, name: "Bronze", color: "#cd7f32" },
      { threshold: 25, name: "Silver", color: "#c0c0c0" },
      { threshold: 50, name: "Gold", color: "#ffd700" },
      { threshold: 75, name: "Platinum", color: "#e5e4e2" }
    ];
  
    // Find the highest tier the user has reached
    const tier = tiers.reduce((currentTier, nextTier) => {
      return equityPercentage >= nextTier.threshold ? nextTier : currentTier;
    }, tiers[0]);
  
    return {
      ...tier,
      progress: equityPercentage
    };
  }