import { RentToOwnABI } from "@/abi/RentToOwn";
import { RenToOwnAddress } from "@/constants/contract-address";
import { Address, useContractWrite } from "wagmi";
import { genericContractRequestRentToOwn } from "./generic";


export function useCreateProperty({
    // value: number,
    // duration: number,
    // paymentType: "fixed" | "flexible",
    // name: string,
    // image: string,
    // propertyAddr: string,
    // city: string,
    // state: string,
    // zipCode: string,
    // currency: string
}) { 
    return useContractWrite({
        ...genericContractRequestRentToOwn,
        functionName: "createProperty",
        args: [

        ]
    })
}