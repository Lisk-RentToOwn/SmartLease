import * as React from "react"
import { GalleryVerticalEnd, LucideProps } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { RainbowKitCustomConnectButton } from "./scaffold-eth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Routes } from "@/app/routes"


export type SideTabListType = {
    title: string,
    url: string,
    items: {
        title: string,
        url: string
    }[],
    icon:  React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
}


type AppSideBarProps =  {
    tabs: SideTabListType[],
    props: React.ComponentProps<typeof Sidebar>
}

export function AppSidebar({ tabs, ...props }: AppSideBarProps) {
    const path=  usePathname()

    const data = {
        navMain: [...tabs]
    }
    return (
        <Sidebar variant="floating" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <img
                            src={'/logo-light_preview.png'}
                            alt="logo"
                            className="h-16 w-max"
                        />
                    </SidebarMenuButton>
                </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <div className="w-full px-5 mt-2 mb-6">
                <div className="h-[0.5px] bg-gray-200 w-full"></div>
            </div>

            <SidebarContent className="">
                <SidebarGroup>
                <SidebarMenu className="gap-4">
                    {data.navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={cn("py-6 text-lg transition-colors", {"text-white bg-gradient-web3-blue hover:bg-green-500/70 hover:text-white": (path === item.url) || ((path === Routes.LANDLORD_CREATE || path.includes(Routes.LANDLORD_PROPERTIES)) && item.url === Routes.LANDLORD_PROPERTIES)})}>
                            <Link href={item.url} className={cn("font-medium flex items-center")}>
                                <div className={cn("bg-gray-200 p-3 rounded-xl transition-colors", {"bg-transparent": (path === item.url) || ((path === Routes.LANDLORD_CREATE || path.includes(Routes.LANDLORD_PROPERTIES)) && item.url === Routes.LANDLORD_PROPERTIES)})}>
                                    {<item.icon size={20}/>}
                                </div>
                                {item.title}
                            </Link>
                        </SidebarMenuButton>

                        {item.items?.length ? (
                            <SidebarMenuSub className="ml-0 border-l-0 px-3">
                                {item.items.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                    {/* check later */}
                                    <SidebarMenuSubButton asChild isActive={false}>
                                    <a href={item.url}>{item.title}</a>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        ) : null}
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {/* <WalletWatcher /> */}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <RainbowKitCustomConnectButton />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
