"use client"

import { PlusIcon } from "lucide-react"
import DashboardTabLayout from "~~/components/shared/dashboard-tab-layout"
import { Button } from "~~/components/ui/button"
import { LANDLORDNAV } from "~~/constants/dashboard-nav"
import { Routes } from "../routes"
import Link from "next/link"

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <main className="app-container mt-10">
                <div className="flex justify-end items-end">
                    {/* <Link href={Routes.LANDLORD_CREATE} className="">
                        <Button className="p-6">
                            <PlusIcon className=""/>
                            <p className="font-medium">Create New Property</p>
                        </Button>
                    </Link> */}
                </div>
            </main>
        </>
    )
}


export default LayoutPage