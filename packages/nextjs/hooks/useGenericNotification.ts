import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Abi, Address, decodeEventLog } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';



async function notifyViaApi({ title, body, recipient }: { title: string; body: string; recipient: string }) {
    try {
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, recipient }),
      });
    } catch (err) {
      console.error('Failed to send push via API', err);
    }
}

interface EventListenerOptions {
  contractAddress: Address;
  abi: Abi;
  eventName: string;
  filterByUser?: boolean;
  onEvent: (eventData: any) => void;
  push?: {
    title: string;
    bodyTemplate: (args: any) => string;
  };
}

export const useContractEventListener = ({
    contractAddress,
    abi,
    eventName,
    filterByUser = false,
    onEvent,
    push,
}: EventListenerOptions) => {
    const { address: connectedAddress } = useAccount();
    const publicClient = usePublicClient();

    useEffect(() => {
        if (!publicClient || !connectedAddress) return;

        const abiEvent = abi.find(
        (item): item is Extract<typeof item, { type: 'event'; name: string }> =>
            item.type === 'event' && 'name' in item && item.name === eventName
        );

        if (!abiEvent) {
            console.warn(`Event ${eventName} not found in ABI`);
            return;
        }

        const unwatch = publicClient.watchEvent({
        address: contractAddress,
        event: abiEvent,
        onLogs: logs => {
            logs.forEach(log => {
            try {
                const decoded = decodeEventLog({
                abi,
                data: log.data,
                topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
                });

                const args = decoded.args;

                if (
                filterByUser &&
                !Object.values(args).some(
                    val =>
                    typeof val === 'string' &&
                    val.toLowerCase() === connectedAddress.toLowerCase()
                )
                ) {
                return;
                }

                toast.success(`${eventName} event received.`);

                if (push) {
                    notifyViaApi({
                      title: push.title,
                      body: push.bodyTemplate(args),
                      recipient: connectedAddress,
                    });
                }

                onEvent(args);
            } catch (err) {
                console.warn(`Failed to decode ${eventName}:`, err);
            }
            });
        },
        });

        return () => unwatch?.();
    }, [contractAddress, abi, eventName, publicClient, connectedAddress]);
};