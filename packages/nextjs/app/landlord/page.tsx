import Link from "next/link"
import LandlordDashboardCard from "~~/components/landlord/propertyy-card"
import { Button } from "~~/components/ui/button"
import { Routes } from "../routes"
import { PlusIcon } from "lucide-react"
import DashboardpropertyTable from "~~/components/landlord/dashboard-properties-table"
import { RentAnalysisChart } from "~~/components/landlord/rent-analysis-chart"

const LandlordPage = () => {
    return (
        <>
            <main className="min-h-[80vh] app-container mt-10">
                <div className="grid grid-cols-3 gap-8">
                    <LandlordDashboardCard
                        amount={24350}
                        title="Total Rent Collected"
                        currency="$"
                        extraText="this month"
                    />

                    <LandlordDashboardCard
                        amount={12}
                        title="Properties Managed"
                        currency="$"
                        extraText="active properties"
                    />

                    <LandlordDashboardCard
                        amount={8}
                        title="Active tenants"
                        currency="$"
                        extraText="tenants"
                    />
                </div>

                <div className="mt-16">
                    <div className="flex justify-between items-center">
                        <p className="text-xl font-semibold">Properties</p>

                        <Link href={Routes.LANDLORD_CREATE} className="">
                            <Button className="p-6">
                                <PlusIcon className=""/>
                                <p className="font-medium">Create New Property</p>
                            </Button>
                        </Link>
                    </div>

                    <div className="">
                        <DashboardpropertyTable/>
                    </div>

                    <div className="mt-16">
                        <div className="bg-white p-6 rounded-md">
                            <div className="p-5">
                                <p className="text-xl font-semibold text-gray-600">Rent Collection Analysis</p>
                            </div>
                            <RentAnalysisChart/>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}


export default LandlordPage