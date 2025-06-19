import { RenToOwnAddress } from "@/constants/contract-address";
import { useContractEventListener } from "./useGenericNotification";
import { RentToOwnABI } from "@/abi/RentToOwn";

export const useRentPaidNotification = () => {
    useContractEventListener({
        contractAddress: RenToOwnAddress,
        //@ts-ignore
        abi: RentToOwnABI,
        eventName: 'RentPaid',
        filterByUser: true,
        push: {
        title: 'Rent Payment Received',
            bodyTemplate: (args) => `You paid ${args.amount} towards property ${args.name}`,
        },
        onEvent: (args) => {
            console.log('RentPaid event', args);
        // optionally update local UI state here
        },
    });
};
