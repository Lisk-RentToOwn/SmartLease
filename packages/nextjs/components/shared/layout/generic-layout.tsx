import { Routes } from "@/app/routes"
import { AppSidebar, SideTabListType } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface GenericLayoutProps {
    sideMenu: SideTabListType[],
    children: ReactNode
}


export default function GenericLayout({children, sideMenu}:GenericLayoutProps) {
    const path = usePathname()

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar 
                tabs={sideMenu}
                props={{}}
            />

            <SidebarInset>
                <header className="h-20 flex justify-between shrink-0 items-center  px-4 z-10 sticky top-0 bg-white border-b">
                    <div className="flex gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />

                        <Breadcrumb>
                            <BreadcrumbList>
                                { sideMenu.map(menu => {
                                    if (menu.url === path) return (
                                        <BreadcrumbItem className="hidden md:block text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                                            <Link href={menu.url}>
                                                {menu.title}
                                            </Link>
                                        </BreadcrumbItem>
                                    )
                                })}
                                {/* <BreadcrumbSeparator className="hidden md:block" />


                                <BreadcrumbItem>
                                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                </BreadcrumbItem> */}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    
                    { path.includes(Routes.LANDLORD) &&
                        <Link href={Routes.LANDLORD_CREATE} className="">
                            <Button className="p-6 bg-gradient-web3-blue">
                                <PlusIcon className=""/>
                                <p className="font-medium">Create New Property</p>
                            </Button>
                        </Link>
                    }
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
