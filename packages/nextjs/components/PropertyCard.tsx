import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import React, { useEffect } from "react";
import { Badge } from "./ui/badge";
import { currencyPairFormatter, formatDurationFromMonths, priceFormatter } from "@/utils/formatter";
import { useSmartRentPayment } from "@/hooks/property/use-smartpayment";
import { LiskSepoliaAddress, RenToOwnAddress } from "@/constants/contract-address";
import { Loader } from "lucide-react";
import { formatUnits } from "viem";

export type PropertyType = {
    city: string
    currency: string
    duration:bigint
    image:string
    landlord:string
    name:string
    propertyAddress:string
    propertyId:BigInt
    state:string
    tokenId:BigInt
    value: bigint
    zipCode:string
}


export const PropertyCard = React.memo(function PropertyCard({ data}:{data :PropertyType}) {
    const rentAmountHumanReadable = formatUnits(data.value/data.duration, 18);

    const {
        error,
        executePayment,
        isApproving,
        isLoading,
        isPaying,
    } = useSmartRentPayment({
        paymentTokenAddress: LiskSepoliaAddress,
        propertyId: Number(data.propertyId),
        rentContractAddress: RenToOwnAddress,
        rentFiatAmount: +rentAmountHumanReadable,
        tokenDecimals: 18
    });


    return (
        <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="relative h-48 w-full">
            <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover"
            />
            {/* <div className="absolute top-2 right-2">
                <StatusBadge status={status} />
            </div> */}
            </div>
            <div className="p-4">
            <h2 className="font-semibold text-lg">{data.name}</h2>
            <p className="text-sm text-gray-500">{data.propertyAddress}</p>
            <Badge className="text-sm hover:bg-amber-300/40 bg-amber-300/40 text-gray-400 mt-1">Token ID: #{Number(data.tokenId)}</Badge>
            <div className="mt-3 flex items-center space-x-2">
                <p className="text-sm text-gray-700">Current Rent</p>
                <p className="text-blue-600 font-semibold text-lg">
                 {(+rentAmountHumanReadable).toFixed(9)} {data.currency}
                {/* {((Number(data.value)/Number(data.duration)))} */}
                </p>
            </div>
            <div className="mt-1 flex space-x-1">
                <p className="">Duration</p>
                <p className="">{formatDurationFromMonths(Number(data.duration))}</p>
            </div>
            <button onClick={executePayment} disabled={isApproving || isPaying} className="mt-4 disabled:bg-primary/50 w-full bg-blue-600 flex items-center justify-center space-x-2 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                { (isApproving || isPaying) &&
                    <Loader className="h-7 7 animate-spin"/>
                }
                <p className="">
                    {isApproving ? "Approving..." : 
                        isPaying ? "Processing Payment..." : 
                        (!isApproving && isPaying) ? "Approve Tokens" : "Pay Rent"}
                </p>
            </button>
            </div>
        </div>
    );
});