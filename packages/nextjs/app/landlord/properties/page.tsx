'use client'

import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { Routes } from "@/app/routes"
import LandlordPropertyCard from "@/components/landlord/property-card"
import { Button } from "@/components/ui/button"
import { useLandlordProperties } from "@/hooks/property/usePropertyEvents"
import { useAccount } from "wagmi"
import PropertyCardSkeleton from "@/components/shared/property-skeleton"
import { formatDurationFromMonths } from "@/utils/formatter"
import { useEffect } from "react"

const LandlordPropertiesPage = () => {
    const {address} = useAccount()

    const {
        loading,
        properties
    } = useLandlordProperties(address)
    

    if (!address) {
        return (
        <div className="text-center py-60 p-8">
          <p className="text-muted-foreground mb-4">
            To view your landlord dashboard
          </p>
        </div>
    );} 

    console.log(properties)

    return (
        <>
       

            <main className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-[90vh]">
                <div className="mt-16 app-container">

                { loading ?
                    <div className="grid grid-cols-1 mini:grid-cols-4 gap-6 mt-16">
                        <PropertyCardSkeleton/>
                        <PropertyCardSkeleton/>
                        <PropertyCardSkeleton/>
                    </div> :

                    <>                    
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl pb-8 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">My Properties</h1>


                            <Link href={Routes.LANDLORD_CREATE} className="">
                                <Button className="p-6 bg-gradient-web3-blue hover:opacity-90 transition">
                                    <PlusIcon className=""/>
                                    <p className="font-medium">Create New Property</p>
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-2">
                            <p className="text-green-500">{properties.length} properties</p>
                        </div>

                        <div className="grid grid-cols-3 gap-7 mt-8">
                            { properties.map(p => {
                                return (
                                    <LandlordPropertyCard
                                        address={p.args.propertyAddress}
                                        duration={formatDurationFromMonths(Number(p.args.duration))}
                                        explorer_url={`https://sepolia-blockscout.lisk.com/tx/${p.txHash}`}
                                        is_occupied={false}
                                        name={p.args.name}
                                        price={`${Number(p.args.value)}`}
                                        currency={p.args.currency}
                                        property_image_url={p.args.image}
                                        start_date={`${new Date(Number(p.timestamp))}`}
                                        tenant_address=""
                                        token_id={Number(p.args.tokenId)}
                                        lease_end={formatDurationFromMonths(Number(p.args.duration))}
                                        flexible_payment={false}
                                        key={p.txHash}
                                        proprtyId={Number(p.args.propertyId)}
                                    />
                                )
                            })}
                        </div>
                    </>
                    }
                </div>
            </main>
        </>
    )
}


export default LandlordPropertiesPage