import { eventService } from "./usePropertyEvents";
import { PropertyEvent } from "@/services/events/PropertyEvents";
import {
  CalendarMonth,
  DashboardState,
  PaymentRecord,
} from "@/types/tenant-tpes";
import {
  isCurrentMonth,
  updateDashboardOnEquityUpdate,
  updateDashboardOnPayment,
} from "@/utils/dashboardUpdates";
import { getEquityTier } from "@/utils/equityCalculation";
import { format } from "date-fns";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";

export type TenantLandlordAssignment = {
  propertyId: number;
  landlord: string;
  propertyName: string;
};

export function calculateNextPayment(
  payments: PropertyEvent[],
  property: PropertyEvent
) {
  const duration = property.args.duration;
  if (payments.length >= duration) return undefined;

  const lastPayment = payments[0]?.timestamp
    ? new Date(payments[0].timestamp * 1000)
    : new Date();

  return {
    lastPayment,
    dueDate: new Date(lastPayment.setMonth(lastPayment.getMonth() + 1)),
    amount: Number(ethers.formatUnits(property.args.value, 18)) / 12,
  };
}

// Tenant Calender Hooks
export function usePaymentCalendar(
  tenantAddress?: string,
  propertyId?: number
) {
  const [calendar, setCalendar] = useState<CalendarMonth[]>([]);

  useEffect(() => {
    if (!tenantAddress || !propertyId) {
      console.log("⚠️ Missing tenant address or propertyId");
      return;
    }

    const loadCalendar = async () => {
      try {
        console.log("📆 Generating calendar for:", {
          tenantAddress,
          propertyId,
        });

        // 1. Get property event (e.g., for duration & start date)
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "PropertyCreated",
          { propertyId },
          0,
          "latest",
          1
        );

        const property = events[0];
        if (!property || !property.timestamp) {
          console.error("❌ PropertyCreated event missing or no timestamp.");
          return;
        }

        const propertyDate = new Date(property.timestamp * 1000);
        // console.log("🏠 Property created on:", propertyDate);

        // 2. Get tenant's payments
        const payments = await eventService.getTenantPaymentHistory(
          tenantAddress,
          propertyId
        );
        // console.log("💰 Payments fetched:", payments.length);

        const firstPayment = payments.sort(
          (a, b) => a.timestamp ?? 0 - b.timestamp!
        )[0];

        if (!firstPayment || firstPayment.timestamp === undefined) {
          console.warn(
            "No valid payment timestamp found. Calendar cannot be generated."
          );
          return;
        }

        const paymentStartDate = new Date(firstPayment?.timestamp * 1000);
        // console.log("user first pay:", firstPayment);
        // console.log("paymentStartdat:", paymentStartDate);

        // 3. Build calendar
        const duration = Number(property.args.duration);
        // console.log("📅 Duration in months:", duration);

        const calendarData = Array.from({ length: duration }, (_, i) => {
          const monthDate = new Date(paymentStartDate);
          monthDate.setMonth(paymentStartDate.getMonth() + i);

          const payment = payments.find((p) => {
            const paymentDate = p.timestamp
              ? new Date(p.timestamp * 1000)
              : null;
            return (
              paymentDate &&
              paymentDate.getFullYear() === monthDate.getFullYear() &&
              paymentDate.getMonth() === monthDate.getMonth()
            );
          });

          const status = payment
            ? "paid"
            : monthDate < new Date()
            ? "due"
            : "future";

          // console.log(`📆 Month ${i + 1}:`, {
          //   month: monthDate.toLocaleDateString("default", {
          //     month: "long",
          //     year: "numeric",
          //   }),
          //   dueDate: monthDate,
          //   paymentDate: payment?.timestamp
          //     ? new Date(payment.timestamp * 1000)
          //     : null,
          //   status,
          // });

          return {
            month: monthDate.toLocaleString("default", { month: "long" }),
            dueDate: payment?.timestamp
              ? new Date(payment.timestamp * 1000)
              : new Date(monthDate),
            status,
            txHash: payment?.txHash,
          };
        });

        setCalendar(calendarData);
        // console.log("✅ Calendar data set:", calendarData);
      } catch (error) {
        console.error("❌ Failed to generate calendar:", error);
      }
    };

    loadCalendar();
  }, [tenantAddress, propertyId]);

  return calendar;
}

//Tenant Property event
export function usePropertyEvent(propertyId?: number) {
  const [info, setInfo] = useState<PropertyEvent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("🔍 usePropertyEvent called with propertyId:", propertyId);

    if (propertyId === undefined || propertyId === null) {
      console.log(propertyId);
      console.log("id is not working");
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching PropertyCreated event for ID:", propertyId);

        const { events } = await eventService.getEvents(
          "RentToOwn",
          "PropertyCreated",
          [propertyId],
          0,
          "latest",
          1
        );

        console.log("📦 Events fetched in PropertyCreated:", events);

        const propertyEvent = events?.[0];
        console.log("📦 PropertyCreated event result:", propertyEvent);

        if (!propertyEvent || !propertyEvent.timestamp) {
          throw new Error("Property missing or invalid");
        }
        setInfo(propertyEvent);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { info, loading, error };
}

export function useTenantPayments(address?: string, propertyId?: number) {
  const [paymentdata, setPaymentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || propertyId === undefined) {
      console.warn("⚠️ useTenantPayments: Missing address or propertyId");
      return;
    }

    console.log(
      `🎯 useTenantPayments initialized for address: ${address}, propertyId: ${propertyId}`
    );

    const fetchHistory = async () => {
      try {
        console.log("📦 Fetching past payment history...");
        setLoading(true);
        const history = await eventService.getTenantPaymentHistory(
          address,
          propertyId
        );
        console.log(`📜 Past payment events fetched: ${history.length}`);
        console.log(history);

        const mapped = history.map((p, i) => {
          if (!p.timestamp) console.warn(`⚠️ Event ${i} missing timestamp`);
          return {
            date: p.timestamp ? new Date(p.timestamp * 1000) : new Date(),
            amount: Number(formatUnits(p.args.amount, 18)),
            txHash: p.txHash,
            equityEarned: 0,
            propertyId: p.args.propertyId,
            sourceEvent: p,
          };
        });

        console.log("✅ Mapped payment history:", mapped);
        setPaymentData(mapped);
      } catch (err) {
        console.error("❌ Error fetching tenant payments:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    // ✅ Listen for live RentPaid events
    const unsub = eventService.onEvent("RentToOwn", "RentPaid", (event) => {
      console.log("📡 Live event received:", event);

      if (
        event.args.tenant === address &&
        event.args.propertyId === propertyId
      ) {
        const date = event.timestamp
          ? new Date(event.timestamp * 1000)
          : new Date();

        if (!event.timestamp) {
          console.warn("⚠️ Live event missing timestamp, using current time.");
        }

        const newPayment = {
          date,
          amount: Number(ethers.formatUnits(event.args.amount, 18)).toFixed(6),
          txHash: event.txHash,
          equityEarned: 0,
          propertyId: event.args.propertyId,
          sourceEvent: event,
        };

        console.log("➕ Adding new payment to history:", newPayment);
        setPaymentData((prev) => [newPayment, ...prev]);
      } else {
        console.log("🚫 Live event does not match current tenant/property.");
      }
    });

    return () => {
      console.log("🧹 Cleaning up event listener for useTenantPayments");
      unsub();
    };
  }, [address, propertyId]);

  return { paymentdata, loading, error };
}

export function useTenantEquity(address?: string, propertyId?: number) {
  const [data, setData] = useState({
    equity: 0,
    tier: getEquityTier(0),
  });
  const [loading, setLoading] = useState(false); // Optional: simulate equity load
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !propertyId) return;

    const fetchInitialEquity = async () => {
      try {
        setLoading(true);

        //get latest equityUpdate
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "EquityUpdated",
          { tenant: address, propertyId },
          0,
          "latest",
          1
        );
        const latestEquity = events?.[0];

        if (latestEquity) {
          const current = latestEquity.args.Newequity;
          setData({ equity: current, tier: getEquityTier(current) });
        }

        //live event for equityUpdate
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialEquity();

    const unsub = eventService.onEvent(
      "RentToOwn",
      "EquityUpdated",
      (event) => {
        if (
          event.args.tenant === address &&
          event.args.propertyId === propertyId
        ) {
          const current = event.args.Newequity;
          setData({ equity: current, tier: getEquityTier(current) });
        }
      }
    );

    return () => unsub();
  }, [address, propertyId]);

  return { data, loading, error };
}

export function useTenantRentStatus(payments: any[], property?: any) {
  const loading = !property || !payments;
  const error = null; // No async error here

  const data = loading
    ? undefined
    : {
        nextPayment: calculateNextPayment(payments, property),
        paidThisMonth: payments.some((p) => p.date && isCurrentMonth(p.date)),
      };

  return { data, loading, error };
}

export async function getTenantLandlordAssignments(
  tenant: string
): Promise<TenantLandlordAssignment[]> {
  if (!tenant) return [];

  // Step 1: Fetch PropertyOccupied events for the tenant
  const { events: occupiedEvents } = await eventService.getEvents(
    "RentToOwn",
    "PropertyOccupied",
    {}, // No filters here
    0,
    "latest",
    1000 // High limit to get all
  );

  console.log(occupiedEvents);
  console.log(tenant);

  const propertyIds = occupiedEvents.map((e) => Number(e.args.propertyId));

  if (!propertyIds.length) return [];

  // Step 2: Fetch all PropertyCreated events (filter by landlord optional)
  const { events: createdEvents } = await eventService.getEvents(
    "RentToOwn",
    "PropertyCreated"
  );

  // Step 3: Match landlord by propertyId
  const matched: TenantLandlordAssignment[] = propertyIds
    .map((propertyId) => {
      const created = createdEvents.find(
        (c) => Number(c.args.propertyId) === propertyId
      );
      if (!created) return null;

      return {
        propertyId,
        landlord: created.args.landlord,
        propertyName: created.args.name,
      };
    })
    .filter(Boolean) as TenantLandlordAssignment[];

  return matched;
}
//hook to read the users active rent paid, and previous rent paid, so we retrieve the address and propertyid that will be used in most components

export function useUserSession(address?: string) {
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [active, setActive] = useState<boolean | null>(false);

  useEffect(() => {
    if (!address) {
      console.log("no address detected");
      return;
    }

    //get lates rentpaid
    const getLatestPropertyId = async () => {
      try {
        setLoading(true);
        // console.log("🔍 Fetching RentPaid events for:", address);
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "RentPaid",
          [null, address],
          0,
          "latest",
          1
        );
        // console.log("📦 Events fetched:", events);

        const latestPropertyId = events?.[0];
        // console.log("🧾 Latest event args:", latestPropertyId);

        if (latestPropertyId) {
          setPropertyId(Number(latestPropertyId.args.propertyId));
          // console.log(
          //   "✅ Setting propertyId to:",
          //   latestPropertyId.args.propertyId
          // );
          setActive(true);
        } else {
          console.warn("⚠️ No valid RentPaid event found");
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getLatestPropertyId();

    //read live events
    const unsub = eventService.onEvent("RentToOwn", "RentPaid", (event) => {
      if (event.args.tenant === address) {
        setPropertyId(Number(event.args.propertyId));
      }
    });

    return () => unsub();
  }, [address]);

  return { address, propertyId, loading, error, active };
}

//to calculate full ownership date
export function useOwnershipDate(address?: string, propertyId?: number) {
  const [ownershipDate, setOwnershipDate] = useState<Date | undefined>();
  const { info } = usePropertyEvent(propertyId); // assumes this hook gives the property info

  useEffect(() => {
    const fetchOwnershipDate = async () => {
      console.log("🏠 Starting fetchOwnershipDate...");
      if (!address) {
        console.warn("⚠️ No tenant address provided.");
        return;
      }

      if (!propertyId) {
        console.warn("⚠️ No propertyId provided.");
        return;
      }

      if (!info?.args?.duration) {
        console.warn("⚠️ Property data is missing or has no duration.");
        return;
      }

      try {
        console.log("📥 Fetching payment history...");
        const payments = await eventService.getTenantPaymentHistory(
          address,
          propertyId
        );
        // console.log("📊 Payments fetched:", payments.length);

        if (!payments || payments.length === 0) {
          console.warn("⚠️ No payment history found for tenant.");
          return;
        }

        const firstPayment = payments.at(-1); // oldest payment
        // console.log("📅 First payment found:", firstPayment);

        if (!firstPayment?.timestamp) {
          console.warn("⏱️ First payment has no timestamp.");
          return;
        }

        const startDate = new Date(firstPayment.timestamp * 1000);
        const duration = Number(info.args.duration);
        // console.log(
        //   `📆 Start date: ${startDate}, Duration: ${duration} months`
        // );

        const date = new Date(startDate);
        date.setMonth(date.getMonth() + duration);

        console.log("✅ Calculated ownership date:", date);
        setOwnershipDate(date);
      } catch (err) {
        console.error("❌ Error fetching ownership date", err);
      }
    };

    fetchOwnershipDate();
  }, [address, propertyId, info]);

  return ownershipDate;
}

//used to get the days until payment needs to be made
export function getDaysUntilDue(dueDate?: Date): string {
  if (!dueDate) return "No due date available";

  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `Due ${Math.abs(diffDays)} day(s) ago`;
  if (diffDays === 0) return `Due today`;
  if (diffDays === 1) return `Due tomorrow`;
  return `Due in ${diffDays} days`;
}

//equity growth calculated monthly
export function useEquityGrowth(propertyId?: number) {
  const [distribution, setDistribution] = useState<
    { month: string; equity: number }[]
  >([]);

  useEffect(() => {
    if (!propertyId) return;

    const fetch = async () => {
      const data = await eventService.getEquityDistribution(propertyId);
      setDistribution(data);
    };

    fetch();
  }, [propertyId]);

  const currentMonth = new Date().getMonth();
  const thisMonthEquity = distribution[currentMonth]?.equity || 0;
  const lastMonthEquity = distribution[currentMonth - 1]?.equity || 0;

  const growth =
    lastMonthEquity === 0
      ? null
      : (((thisMonthEquity - lastMonthEquity) / lastMonthEquity) * 100).toFixed(
          1
        );

  return { growth };
}

//token statistics
export interface TokenTransferEvent extends PropertyEvent {
  args: {
    from: string;
    to: string;
    amount: string;
    tokenId: number;
  };
  timestamp: number;
}

interface TokenStats {
  currentTokens: number;
  totalTokens: number;
  locked: number;
  unlocked: number;
  history: TokenTransferEvent[];
}

// ✅ Type guard for TokenTransferEvent
function isTokenTransferEvent(event: any): event is TokenTransferEvent {
  return (
    event &&
    event.args &&
    typeof event.args.from === "string" &&
    typeof event.args.to === "string" &&
    typeof event.args.amount === "string" &&
    typeof event.args.tokenId === "number"
  );
}

export function useTenantTokenStats(address?: string, propertyId?: number) {
  const [stats, setStats] = useState<TokenStats>({
    currentTokens: 0,
    totalTokens: 0,
    locked: 0,
    unlocked: 0,
    history: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !propertyId) {
      console.warn(
        "Missing address or propertyId. Skipping token stats fetch."
      );
      return;
    }

    const load = async () => {
      console.log("🔄 Fetching token stats for:", { address, propertyId });
      setLoading(true);
      try {
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "TokensTransferred",
          { propertyId }
        );

        // ✅ Filter only events that are valid TokenTransferEvents and match the address
        const tenantTransfers = events.filter(
          (e): e is TokenTransferEvent =>
            e.args.to.toLowerCase() === address.toLowerCase()
        );
        console.log(tenantTransfers);

        const totalReceived = tenantTransfers.reduce((sum, e) => {
          const amount = Number(ethers.formatUnits(e.args.amount, 0)); // assumes 0 decimals
          return sum + amount;
        }, 0);
        // console.log("📊 Total tokens received:", totalReceived);

        const totalTokens = 100; // Static for now
        const unlocked = totalReceived;
        const locked = totalTokens - unlocked;

        const finalStats: TokenStats = {
          currentTokens: unlocked,
          totalTokens,
          locked,
          unlocked,
          history: tenantTransfers,
        };

        // console.log("📈 Final token stats:", finalStats);
        setStats(finalStats);
      } catch (err) {
        console.error("❌ Error loading token stats:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
        console.log("✅ Token stats fetch complete.");
      }
    };

    load();
  }, [address, propertyId]);

  return { stats, loading, error };
}

//to get the payment history
export function useTenantPaymentHistory(address?: string, propertyId?: number) {
  const [events, setEvents] = useState<PropertyEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || propertyId === undefined) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await eventService.getTenantPaymentHistory(
          address,
          propertyId
        );
        setEvents(history);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [address, propertyId]);

  return { events, loading, error };
}

export async function buildTenantDashboard(
  property: PropertyEvent,
  address: string
): Promise<DashboardState> {
  const propertyId = property.args.propertyId;

  let dashboardState: DashboardState = {
    property,
    equity: {
      current: 0,
      tier: { name: "Bronze", color: "#cd7f32", progress: 0 },
    },
    rent: {
      paidThisMonth: false,
    },
    paymentHistory: [],
  };

  // ✅ Tenant-specific payment history (correct method)
  const history = await eventService.getTenantPaymentHistory(
    address,
    propertyId
  );
  console.log("Tenant payment history", address, propertyId, history);

  for (const event of history) {
    dashboardState = updateDashboardOnPayment(dashboardState, event);
  }

  // ✅ All equity updates for this property (applied globally)
  const { events: equityEvents } = await eventService.getEvents(
    "RentToOwn",
    "EquityUpdated",
    { propertyId: BigInt(propertyId) }, // safe
    0,
    "latest"
  );

  for (const event of equityEvents) {
    dashboardState = updateDashboardOnEquityUpdate(dashboardState, event);
  }

  return dashboardState;
}

export interface GrowthChartPoint {
  name: string; // e.g. "Jan"
  actualGrowth: number | null;
  projectedGrowth: number;
  marketValue: number;
}

async function getTenantPayments(
  tenant: string,
  propertyId: number
): Promise<PaymentRecord[]> {
  const { events } = await eventService.getEvents(
    "RentToOwn",
    "RentPaid",
    { propertyId, tenant },
    0,
    "latest"
  );

  return events.map((e) => {
    const amount = Number(ethers.formatUnits(e.args.amount, 18));
    return {
      //@ts-ignore
      date: new Date(e.timestamp * 1000),
      amount,
      txHash: e.txHash,
      equityEarned: 0, // we’ll calculate real equity later
      propertyId: Number(e.args.propertyId),
    };
  });
}

function formatChartData(
  payments: PaymentRecord[],
  fullPrice: number,
  duration: number,
  marketRatePerToken: number = 1
): GrowthChartPoint[] {
  const now = new Date();
  const data: GrowthChartPoint[] = [];

  // Sort payments oldest → newest
  const sorted = [...payments].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  for (let i = 0; i < duration; i++) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - (duration - 1) + i,
      1
    );
    const label = format(monthDate, "MMM");

    const payment = sorted.find(
      (p) =>
        p.date.getMonth() === monthDate.getMonth() &&
        p.date.getFullYear() === monthDate.getFullYear()
    );

    const totalPaidUpToThisMonth = sorted
      .filter((p) => p.date <= monthDate)
      .reduce((acc, p) => acc + p.amount, 0);

    const equityPercentage = (totalPaidUpToThisMonth / fullPrice) * 100;
    const projectedPercentage = ((i + 1) / duration) * 100;

    data.push({
      name: label,
      actualGrowth: payment ? Number(equityPercentage.toFixed(2)) : null,
      projectedGrowth: Number(projectedPercentage.toFixed(2)),
      marketValue: Number((equityPercentage * marketRatePerToken).toFixed(2)),
    });
  }

  return data;
}

/**
 * Main function to call from your dashboard/hook
 */
export async function generateTenantGrowthChartData(
  tenantAddress: string,
  propertyEvent: PropertyEvent,
  marketRatePerToken = 1
): Promise<GrowthChartPoint[]> {
  const propertyId = Number(propertyEvent.args.propertyId);
  const duration = Number(propertyEvent.args.duration);
  const fullPrice = Number(ethers.formatUnits(propertyEvent.args.value, 18));

  const payments = await getTenantPayments(tenantAddress, propertyId);

  return formatChartData(payments, fullPrice, duration, marketRatePerToken);
}
