import { PropertyEvent } from "@/services/events/PropertyEvents";
import { DashboardState, PaymentRecord } from "@/types/tenant-tpes";
import { ethers } from "ethers";

// utils/dashboardUpdates.ts
import { 
  calculateFullOwnershipDate, 
  getEquityTier

} from "./equityCalculation";

export function updateDashboardOnEquityUpdate(
  prev: DashboardState | undefined,
  event: PropertyEvent
): DashboardState {
  if (!prev || !prev.property) {
    throw new Error("Dashboard state not properly initialized");
  }

  // FIX: divide emitted equity (e.g. 526) by 100 to get 5.26%
  const newEquity = Number(event.args.newEquity) / 100;
  const propertyDuration = Number(prev.property.args.duration);

  return {
    ...prev,
    equity: {
      current: newEquity,
      nextVesting: calculateNextVesting(prev.paymentHistory || [], propertyDuration),
      fullOwnership: calculateFullOwnershipDate(prev.paymentHistory || [], propertyDuration),
      tier: getEquityTier(newEquity),
    },
  };
}

export function updateDashboardOnPayment(
  prev: DashboardState | undefined,
  event: PropertyEvent
): DashboardState {
  if (!prev || !prev.property) {
    throw new Error("Dashboard state not properly initialized");
  }

  // Create safe payment record
  const paymentDate = new Date(event.timestamp! * 1000);
  const paymentAmount = Number(ethers.formatUnits(event.args.amount, 18));

  const newPayment: PaymentRecord = {
    date: paymentDate,
    amount: paymentAmount,
    txHash: event.txHash,
    equityEarned: calculateEquityForPayment(paymentAmount, prev.property),
    propertyId: event.args.propertyId,
  };

  // Update payment history
  const updatedPayments = [newPayment, ...(prev.paymentHistory || [])];

  console.log("📆 Payment date:", paymentDate.toISOString());
console.log("📅 Today:", new Date().toISOString());
// console.log("✅ Paid this month?", 
const t = isCurrentMonth(paymentDate);

  return {
    ...prev,
    paymentHistory: updatedPayments,
    equity: {
      ...prev.equity, // preserve existing equity from EquityUpdated
      nextVesting: calculateNextVesting(updatedPayments, Number(prev.property.args.duration)),
      fullOwnership: calculateFullOwnershipDate(updatedPayments, Number(prev.property.args.duration)),
    },
    rent: {
      ...prev.rent,
      paidThisMonth: t
    },
  };
}
/**
 * Calculate equity earned from a single payment
 */
function calculateEquityForPayment(
  amount: number, 
  property: PropertyEvent
): number {
  const propertyValue = Number(ethers.formatUnits(property.args.value, 18));
  return (amount / propertyValue) * 100;
} 

export function isCurrentMonth(date: Date): boolean {
  const now = new Date();

  
  return date.getFullYear() === now.getFullYear() && 
         date.getMonth() === now.getMonth();
}

function calculateNextVesting(payments: PaymentRecord[], duration: number): Date | undefined {
  if (payments.length >= duration) return undefined;
  const lastPayment = payments[0]?.date || new Date();

  const nextMonth = new Date(lastPayment); // clone the date
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return nextMonth;
}

function getTotalEquityFromPayments(
  payments: PaymentRecord[],
  property: PropertyEvent
): number {
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const fullPrice = Number(ethers.formatUnits(property.args.value, 18));
  return Math.min(100, (totalPaid / fullPrice) * 100);
}

