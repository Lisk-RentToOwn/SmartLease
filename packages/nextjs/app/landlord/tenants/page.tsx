'use client'
import TenantTable from "@/components/landlord/tenants-table"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

const LandlordTenantPage = () => {
    return (
        <>
            <main className="min-h-[90vh]">
                <div className="mt-16 app-container">
                    <div className="">
                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl pb-8 font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Tenants</h1>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                            <p className="text-black ">Manage your tenant details</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        {/* <div className="flex space-x-3">
                            <div className="">
                                <p className="mb-1 font-medium text-gray-600">Properties</p>

                                <Select>
                                    <SelectTrigger className="w-[180px] border border-gray-400">
                                        <SelectValue placeholder="Filter properties" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="apartments">Apartment</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="">
                                <p className="mb-1 font-medium text-gray-600">Rent Status</p>

                                <Select>
                                    <SelectTrigger className="w-[180px] border border-gray-400">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div> */}

                        <TenantTable/>
                    </div>
                </div>
            </main>
        </>
    )
}


export default LandlordTenantPage