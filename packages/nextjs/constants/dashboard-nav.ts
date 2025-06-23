import { Routes } from "@/app/routes";
import { SideTabListType } from "@/components/app-sidebar";
import { TabType } from "@/components/shared/dashboard-tab-layout";
import { ChatBubbleLeftEllipsisIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/20/solid";
import {
  BadgeDollarSign,
  Gem,
  HomeIcon,
  LandPlotIcon,
  Mails,
  MessageCircle,
  ReceiptText,
  UserRound,
} from "lucide-react";

export const LANDLORDNAV: SideTabListType[] = [
  {
    url: Routes.LANDLORD,
    title: "Overview",
    icon: HomeIcon,
    items: []
  },
  {
    url: Routes.LANDLORD_PROPERTIES,
    title: "Properties",
    icon: LandPlotIcon,
    items: [
        // {
        //     title: "Create Property",
        //     url: Routes.LANDLORD_CREATE
        // }
    ]
  },
  {
    url: Routes.LANDLORD_TENANTS,
    title: "Tenants",
    icon: UserRound,
    items: []
  },
  {
    url: Routes.LANDLORD_MESSAGING_CENTER,
    title: "Chat",
    icon: MessageCircle,
    items: []
  },
];

export const TENANTNAV: SideTabListType[] = [
  {
    url: Routes.TENANT,
    title: "Overview",
    icon: HomeIcon,
    items: []
  },
  {
    url: Routes.TENANT_PAYMENT,
    title: "Payment",
    icon: ReceiptText,
    items: []
  },
  {
    url: Routes.TENANT_EQUITY,
    title: "Equity",
    icon: BadgeDollarSign,
    items: []
  },
  {
    url: Routes.TENANT_MESSAGING_CENTER,
    title: "Chat",
    icon: MessageCircle,
    items: []
  },
];
