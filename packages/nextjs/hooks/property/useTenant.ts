import { eventService } from "./usePropertyEvents";
import { PropertyEvent } from "@/services/events/PropertyEvents";
import { CalendarMonth } from "@/types/tenant-tpes";
import { isCurrentMonth } from "@/utils/dashboardUpdates";
import { getEquityTier } from "@/utils/equityCalculation";
import { ethers } from "ethers";
import { start } from "nprogress";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

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
    if (!tenantAddress || !propertyId) return;

    const loadCalendar = async () => {
      try {
        // 1. Get property with timestamp validation
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
          console.error("Property missing timestamp");
          return;
        }
        const propertyDate = new Date(property.timestamp * 1000);

        // 2. Get payments with safe access
        const payments = await eventService.getTenantPaymentHistory(
          tenantAddress,
          propertyId
        );

        // 3. Generate calendar with safe date handling
        const duration = property.args.duration;
        const calendarData = Array.from({ length: duration }, (_, i) => {
          const monthDate = new Date(propertyDate);
          monthDate.setMonth(propertyDate.getMonth() + i);

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

          return {
            month: monthDate.toLocaleString("default", { month: "long" }),
            dueDate: payment?.timestamp
              ? new Date(payment.timestamp * 1000)
              : new Date(monthDate),
            status: payment
              ? "paid"
              : monthDate < new Date()
              ? "due"
              : "future",
            txHash: payment?.txHash,
          };
        });

        setCalendar(calendarData);
      } catch (error) {
        console.error("Failed to generate calendar:", error);
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
    if (!propertyId) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "PropertyCreated",
          { propertyId },
          0,
          "latest",
          1
        );
        const propertyEvent = events?.[0];
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

export function useTenantPayments(address?: string) {
  const [paymentdata, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch payment history for a given property ID
  const fetchPayments = async (propertyId: number) => {
    try {
      setLoading(true);
      setError(null);
      const history = await eventService.getTenantPaymentHistory(
        address!,
        propertyId
      );
      const mapped = history.map((p) => {
        const date = p.timestamp ? new Date(p.timestamp * 1000) : null;
        return {
          date,
          amount: Number(ethers.formatUnits(p.args.amount, 18)),
          txHash: p.txHash,
          equityEarned: 0,
          propertyId: p.args.propertyId,
          sourceEvent: p,
        };
      });
      setData(mapped);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address) return;

    // Initial load (optional: fetch past events to guess the most recent propertyId)
    const loadInitial = async () => {
      const recentEvents = await eventService.getEvents(
        "RentToOwn",
        "RentPaid",
        { tenant: address },
        0,
        "latest",
        1
      );
      const recent = recentEvents?.events?.[0];
      if (recent) {
        const propertyId = recent.args.propertyId;
        await fetchPayments(propertyId);
      }
    };

    loadInitial();

    // Listen for new RentPaid events
    const unsub = eventService.onEvent("RentToOwn", "RentPaid", (event) => {
      if (event.args.tenant === address) {
        const propertyId = event.args.propertyId;
        fetchPayments(propertyId);
      }
    });

    return () => unsub();
  }, [address]);

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

//hook to read the users active rent paid, and previous rent paid, so we retrieve the address and propertyid that will be used in most components

export function useUserSession(address?: string) {
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [active, setActive] = useState<boolean | null>(false);

  useEffect(() => {
    if (!address) return;

    //get lates rentpaid
    const getLatestPropertyId = async () => {
      try {
        setLoading(true);
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "RentPaid",
          { tenant: address },
          0,
          "latest",
          1
        );

        const latestPropertyId = events?.[0];

        if (latestPropertyId) {
          setPropertyId(Number(latestPropertyId.args.propertyId));
          setActive(true);
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
  const property = usePropertyEvent(propertyId); // if it's a hook

  useEffect(() => {
    const fetchOwnershipDate = async () => {
      if (!address || !propertyId || !property?.info?.args?.duration) return;

      try {
        const payments = await eventService.getTenantPaymentHistory(
          address,
          propertyId
        );
        if (!payments || payments.length === 0) return;

        const firstPayment = payments.at(-1); // the oldest payment
        const startDate = new Date(firstPayment?.timestamp! * 1000);

        const date = new Date(startDate);
        date.setMonth(date.getMonth() + property.info.args.duration);

        setOwnershipDate(date);
      } catch (err) {
        console.error("Error fetching ownership date", err);
      }
    };

    fetchOwnershipDate();
  }, [address, propertyId, property]);

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
    amount: string; // typically a string from the event log
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
    if (!address || !propertyId) return;

    const load = async () => {
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
            isTokenTransferEvent(e) &&
            e.args.to.toLowerCase() === address.toLowerCase()
        );

        const totalReceived = tenantTransfers.reduce((sum, e) => {
          const amount = Number(ethers.formatUnits(e.args.amount, 0)); // no decimals assumed
          return sum + amount;
        }, 0);

        const totalTokens = 100; // TODO: Replace with actual total if dynamic
        const unlocked = totalReceived;
        const locked = totalTokens - unlocked;

        setStats({
          currentTokens: unlocked,
          totalTokens,
          locked,
          unlocked,
          history: tenantTransfers,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [address, propertyId]);

  return { stats, loading, error };
}
