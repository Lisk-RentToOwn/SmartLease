import { Routes } from "@/app/routes";
import { TabType } from "@/components/shared/dashboard-tab-layout";
import {
  BadgeDollarSign,
  Gem,
  HomeIcon,
  LandPlotIcon,
  Mails,
  ReceiptText,
  UserRound,
} from "lucide-react";

export const LANDLORDNAV: TabType[] = [
  {
    link: Routes.LANDLORD,
    name: "Overview",
    Icon: HomeIcon,
  },
  {
    link: Routes.LANDLORD_PROPERTIES,
    name: "Properties",
    Icon: LandPlotIcon,
  },
  {
    link: Routes.LANDLORD_TENANTS,
    name: "Tenants",
    Icon: UserRound,
  },
  {
    link: Routes.LANDLORD_MESSAGING_CENTER,
    name: "Messages and Notifications",
    Icon: Mails,
  },
];

export const TENANTNAV: TabType[] = [
  {
    link: Routes.TENANT,
    name: "Overview",
    Icon: HomeIcon,
  },
  {
    link: Routes.TENANT_PAYMENT,
    name: "Payment",
    Icon: ReceiptText,
  },
  {
    link: Routes.TENANT_EQUITY,
    name: "Equity",
    Icon: BadgeDollarSign,
  },
  {
    link: Routes.TENANT_MESSAGING_CENTER,
    name: "Messages and Notifications",
    Icon: Mails,
  },
];
