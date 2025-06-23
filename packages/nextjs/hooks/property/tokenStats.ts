import { eventService } from "./usePropertyEvents";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

type TokenTransaction = {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
};

type TokenStats = {
  totalHeld: number;
  unlockedTokens: number;
  lockedTokens: number;
  transactions: TokenTransaction[];
  loading: boolean;
  error: Error | null;
};

export function useTokenStats(
  userAddress?: string,
  tokenId?: number,
  propertyId?: number
): TokenStats {
  const [totalHeld, setTotalHeld] = useState(0);
  const [unlockedTokens, setUnlockedTokens] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userAddress || tokenId == null || propertyId == null) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get all token transfers
        const { events: transferEvents } = await eventService.getEvents(
          "PropertyToken",
          "TokensTransferred",
          { tokenId }
        );

        let balance = 0;
        const txHistory: TokenTransaction[] = [];

        transferEvents.forEach((e: any) => {
          const from = e.args.from.toLowerCase();
          const to = e.args.to.toLowerCase();
          const amount = Number(e.args.amount);
          const timestamp = e.timestamp ? e.timestamp * 1000 : Date.now();

          if (to === userAddress.toLowerCase()) balance += amount;
          if (from === userAddress.toLowerCase()) balance -= amount;

          if (
            from === userAddress.toLowerCase() ||
            to === userAddress.toLowerCase()
          ) {
            txHistory.push({ from, to, amount, timestamp });
          }
        });

        // 2. Get most recent equity
        const { events: equityEvents } = await eventService.getEvents(
          "RentToOwn",
          "EquityUpdated",
          { tenant: userAddress, propertyId },
          0,
          "latest",
          1
        );
        const latestEquity = equityEvents?.[0]?.args?.Newequity || 0;
        const unlocked = Math.floor((latestEquity / 100) * 1000); // 1000 = total tokens

        // 3. Set all values
        setTotalHeld(balance);
        setUnlockedTokens(unlocked);
        setTransactions(txHistory.reverse()); // most recent first
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userAddress, tokenId, propertyId]);

  const lockedTokens = Math.max(totalHeld - unlockedTokens, 0);

  return {
    totalHeld,
    unlockedTokens,
    lockedTokens,
    transactions,
    loading,
    error,
  };
}
