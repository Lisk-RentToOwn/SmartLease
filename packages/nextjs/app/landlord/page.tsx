'use client'
import DashboardpropertyTable, { NewProperty } from "@/components/landlord/dashboard-properties-table"
import LandlordDashboardCard from "@/components/landlord/propertyy-card"
import { RentAnalysisChart } from "@/components/landlord/rent-analysis-chart"
import DashboardSkeleton from "@/components/shared/dashboar-skeleton"
import { Button } from "@/components/ui/button"
import { useLandlordDashboard } from "@/hooks/property/usePropertyEvents"
import { LucideCircleDollarSign, LucideLandmark, LucideUserRound, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { Routes } from "../routes"
import NotificationPanel from "@/components/shared/messaging/NotificationPanel"

const LandlordPage = () => {
    const {address} = useAccount()

    const {
        loading,
        recentProperties,
        totalProperties,
        totalRentCollected,
        totalTenants
      } = useLandlordDashboard(address)

      if (!address) {
          return (
          <div className="text-center py-60 p-8">
            <p className="text-muted-foreground mb-4">
              To view your landlord dashboard
            </p>
          </div>
        );} 
        

    return (
        <>
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <main className="min-h-[80vh] app-container mt-10 mb-12">

                    { loading ?
                        <DashboardSkeleton/> :

                        <div className="">
                            {/* <h1 className="text-4xl pb-8 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Dashboard</h1> */}

                            <div className="grid grid-cols-3 gap-8">
                                <LandlordDashboardCard
                                    amount={+(totalRentCollected.toFixed(6))}
                                    title="Total Rent Collected"
                                    extraText="this month"
                                    icon={
                                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <LucideCircleDollarSign/>
                                        </div>
                                    }
                                    currency="LSK"
                                />

                                <LandlordDashboardCard
                                    amount={totalProperties}
                                    title="Properties Managed"
                                    extraText="active properties"
                                    icon={
                                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <LucideLandmark/>
                                        </div>
                                    }
                                />

                                <LandlordDashboardCard
                                    amount={totalTenants}
                                    title="Active tenants"
                                    extraText="tenants"
                                    icon={
                                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-green-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <LucideUserRound/>
                                        </div>
                                    }
                                />
                            </div>

                            <div className="flex mt-16 justify-between items-center">
                                <p className="text-xl font-semibold">Properties</p>                                
                            </div>

                            <div className="">
                                <DashboardpropertyTable 
                                    //@ts-ignore
                                    allData={recentProperties as NewProperty}/>
                            </div>

                        </div>
                    }

                    <div className="mt-16 grid grid-cols-12 gap-x-8">
                        <div className="bg-white shadow-md p-6 rounded-xl col-span-8">
                            <div className="p-5">
                                <p className="text-xl font-semibold text-gray-600">Rent Collection Analysis</p>
                            </div>
                            <div className="border border-gray-300 p-4 rounded-md">
                                <RentAnalysisChart/>
                            </div>
                        </div>

                        <div className="col-span-4 p-5 bg-white rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold">Notifications</h2>
                            <NotificationPanel/>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}


export default LandlordPage