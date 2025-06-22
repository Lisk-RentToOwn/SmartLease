"use client";

import { usePropertyInfo } from "@/hooks/property/propertyInfo";
import { usePropertyEvent } from "@/hooks/property/useTenant";
import { useTenantPayments } from "@/hooks/property/useTenant";
import { useTenantEquity } from "@/hooks/property/useTenant";
import { useUserSession } from "@/hooks/property/useTenant";
import { calculateNextPayment } from "@/hooks/property/useTenant";
import { getDaysUntilDue } from "@/hooks/property/useTenant";
import { timeStamp } from "console";
import {
  UserRound,
  Wallet,
  PieChartIcon,
  CreditCard,
  RefreshCw,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther } from "viem";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { CalendarDemo } from "~~/components/tenants/CalenderDemo";
import DataTableDemo from "~~/components/tenants/DataTableDemo";
import NotificationBell from "~~/components/tenants/NotificationBell";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~~/components/ui/card";
import { Switch } from "~~/components/ui/switch";

export default function TenantPaymentPage() {
  useEffect(() => {
    document.title = "Tenant Payment Page";
  }, []);

  const { address } = useAccount();
  const { propertyId, active } = useUserSession(address);
  const { data } = useTenantEquity(address, propertyId ?? undefined);
  const { propertyInfo } = usePropertyInfo(propertyId ?? undefined);
  const { info } = usePropertyEvent(propertyId ?? undefined);
  const { paymentdata } = useTenantPayments(address);

  let nextPayment;
  if (info) {
    nextPayment = calculateNextPayment(paymentdata, info);
  }

  const recieptInfo = {
    propertyId: 1,
    amount: 20,
    date: new Date(2023, 5, 1),
    equity: 0.25,
    address: "123 Main Street, Apt 4B San Francisco CA 94105",
  };
  const [autoPayEnable, setAutoPayEnable] = useState(false);

  return (
    <div className="bg-gray-100">
      <div className="app-container mt-20 space-y-4 pb-32">
        <header className="flex justify-between items-center">
          <div className="flex gap-3 items-center "></div>
          <div className="flex justify-end gap-2 items-center">
            <NotificationBell />
            <UserRound className="w-6 bg-blue-500 text-white rounded-full p-1 ml-1" />
            <p className="text-dark">Alex Johnson</p>
          </div>
        </header>

        <main className="space-y-6 ">
          <section>
            <p className="font-semibold text-2xl">Rent Payments</p>
            <p className="text-gray-bold font-normal text-lg">
              Manage your rent payments and track your payment history
            </p>
          </section>

          <section className="grid lg:grid-cols-12 gap-20">
            <div className="grid col-span-8 space-y-5">
              <Card className="space-y-3">
                <CardHeader className="border-b !py-3 bg-blue-200/20">
                  <CardTitle className="text-sm">Upcoming Rent</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <div>
                    <p className="font-semibold text-[1.2rem] flex items-center gap-1">
                      ${propertyInfo.monthlyPrice}
                      <span className=" text-[0.6rem] text-blue-500 border-none rounded-sm  bg-blue-500/10 p-1">
                        {getDaysUntilDue(nextPayment?.dueDate)}
                      </span>
                    </p>
                    <p className="text-gray-bold mt-0.5">
                      Due on the{" "}
                      {active ? (
                        nextPayment?.dueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      ) : (
                        <span> N/A</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <PieChartIcon className="w-3 text-emerald-400" />
                      <p className="text-gray">
                        Earns {data.equity || 0}% equity this month
                      </p>
                    </div>
                  </div>
                  <Button>
                    <CreditCard />
                    <span className="text-xs">${"Pay Now"}</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex justify-between items-center p-6 ">
                <CardContent className=" flex items-center gap-2 !p-0">
                  <RefreshCw className="w-4 text-blue-400" />
                  <div>
                    <CardTitle className="text-dark">Auto-Pay</CardTitle>
                    <CardDescription className="text-gray-bold">
                      Automatically pay rent on the 1st of each month
                    </CardDescription>
                  </div>
                </CardContent>
                <Switch
                  checked={autoPayEnable}
                  onCheckedChange={setAutoPayEnable}
                  className="data-[state=checked]:bg-emerald-400"
                />
              </Card>

              <Card>
                <DataTableDemo />
              </Card>
            </div>

            <div className="col-span-4 flex flex-col gap-y-8">
              <Card className="">
                <CardHeader className="bg-blue-200/10 ">
                  <CardTitle>Rent Calender</CardTitle>
                </CardHeader>

                <CardContent className="!pb-1 ">
                  <div className="">
                    {address ? (
                      <CalendarDemo />
                    ) : (
                      <p className="text-gray-bold text-center">
                        Please connect your wallet to view your Calender
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3 flex justify-center space-x-3">
                    <div className=".info-color-div flex items-center space-x-1 py-3">
                      <Circle
                        className="w-4 text-[rgb(0,121,201)]"
                        fill="rgb(0, 121, 201)"
                      />
                      <p className="text-gray-bold">Due Date</p>
                    </div>

                    <div className=".info-color-div flex items-center space-x-1">
                      <Circle
                        className="w-4 text-[rgb(49,209,52)]"
                        fill="rgb(49, 209, 52)"
                      />
                      <p className="text-gray-bold">Paid</p>
                    </div>

                    <div className=".info-color-div space-x-1 items-center flex">
                      <Circle
                        className="w-4 text-[rgb(244,109,6)]"
                        fill="rgb(244, 109, 6)"
                      />
                      <p className="text-gray-bold">Late</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="space-y-4">
                <CardHeader className="border-b bg-blue-200/10 !py-5">
                  <CardTitle>Equity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between ">
                      <p className="text-gray">Total Equity Earned</p>
                      <p className="text-dark">{data.equity || 0}%</p>
                    </div>
                    <ProgressDemo
                      value={data.equity || 0}
                      className="progress-green-fill"
                    />
                  </div>
                  <p className="text-gray-bold">
                    You've earned {data.equity || 0}% equally in your property
                    through on-time
                    <br />
                    rent payments. Keep it up!
                  </p>
                </CardContent>
              </Card>
              <Button asChild className="w-1/2">
                <Link href="/tenant/payment/reciept">Reciept view</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
