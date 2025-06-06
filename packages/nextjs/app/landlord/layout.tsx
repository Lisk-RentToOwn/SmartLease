"use client"

import { PlusIcon } from "lucide-react"
import DashboardTabLayout from "@/components/shared/dashboard-tab-layout"
import { Button } from "@/components/ui/button"
import { LANDLORDNAV } from "@/constants/dashboard-nav"
import { Routes } from "../routes"
import Link from "next/link"

const LayoutPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <main className="bg-gray-100">
                {children}
            </main>
        </>
    )
}


export default LayoutPage