"use client";

import {
  Circle,
  CreditCard,
  PieChartIcon,
  RefreshCw,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  CardTitle
} from "~~/components/ui/card";
import { Switch } from "~~/components/ui/switch";

export default function TenantPaymentPage() {
  useEffect(() => {
    document.title = "Tenant Payment Page";
  }, []);

  const { address } = useAccount();

  const propertyInfo = {
    propertyId: 1,
    amount: 20,
    date: new Date(2023, 5, 1),
    equity: 0.25,
    address: "123 Main Street, Apt 4B San Francisco CA 94105",
  };

  const amtInWei = parseEther(`${propertyInfo.amount}`);

  const [autoPayEnable, setAutoPayEnable] = useState(false);

  // const { writeAsync: payRent, isLoading: isPaying } = usePayRent(
  //   propertyInfo.propertyId,
  //   amtInWei
  // );

  const handlePayRent = async () => {
    // try {
    //   toast.loading("Processing payment");
    //   const tx = await payRent();

    //   toast.dismiss();
    //   toast.success("Payment completed", {
    //     duration: 500,
    //     description: "Your rent for June 2023 has been paid",
    //     action: {
    //       label: "View on Explorer",
    //       onClick: () =>
    //         window.open(
    //           `https://sepolia-blockscout.lisk.com/address/${tx.hash}`,
    //           "_blank"
    //         ),
    //     },
    //   });
    // } catch (error) {
    //   toast.dismiss();
    //   console.log("Payment fails:", error);
    //   toast.error("Payment failed");
    // }
  };

  return (
    <div className="">
      <div className="app-container mt-20 space-y-4 pb-32">
        <main className="space-y-6">
          <section>
            {/* <p className="font-semibold text-2xl">Rent Payments</p> */}
            <p className="text-slate-500 font-medium text-lg">
              Manage your rent payments and track your payment history
            </p>
          </section>

          <section className="grid grid-cols-12 gap-20">
            <div className="grid col-span-8 space-y-5">
              <Card className="space-y-3 border-none">
                <CardHeader className="border-b !py-3 bg-gradient-web3-blue text-white rounded-tr-xl rounded-tl-lg">
                  <CardTitle className="">Upcoming Rent</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <div className="mt-6">
                    <p className="font-semibold text-slate-700 text-3xl flex items-center gap-1">
                      ${propertyInfo.amount}
                      <span className=" text-[0.9rem] text-blue-500 border-none rounded-sm  bg-blue-500/10 px-4 ml-3">
                        Due in 5 days
                      </span>
                    </p>

                    <p className="text-gray-bold mt-4">
                      Due on the June 1st, 2023
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <PieChartIcon className="w-3 text-emerald-400" />
                      <p className="text-gray">
                        Earns ${propertyInfo.equity}% equity this month
                      </p>
                    </div>
                  </div>

                  <Button onClick={handlePayRent}>
                    <CreditCard />
                    <span className="text-xs">
                      {/* ${isPaying ? "Processing" : "Pay Now"} */}
                    </span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="flex border-none justify-between items-center p-6 ">
                <CardContent className=" flex space-x-2 items-center gap-2 !p-0">
                  <RefreshCw className="w-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-lg">Auto-Pay</CardTitle>
                    <CardDescription className="text-gray-700 text-base">
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

              <Card className="border-none mt-9">
                <DataTableDemo />
              </Card>
            </div>

            <div className="col-span-4 flex flex-col gap-y-8">
              <Card className="border-none">
                <CardHeader className="bg-gradient-web3-blue">
                  <CardTitle className="text-white font-medium">Rent Calender</CardTitle>
                </CardHeader>

                <CardContent className="!pb-1 ">
                  <div className="">
                    <CalendarDemo />
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

              <Card className="space-y-4 border-none">
                <CardHeader className="border-b bg-blue-200/10 !py-5">
                  <CardTitle className="">Equity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between ">
                      <p className="text-gray">Total Equity Earned</p>
                      <p className="text-dark">${propertyInfo.equity}</p>
                    </div>
                    <ProgressDemo
                      value={propertyInfo.equity}
                      className="progress-green-fill"
                    />
                  </div>
                  <p className="py-4 text-slate-800">
                    You've earned {propertyInfo.equity} equally in your property
                    through on-time rent payments. Keep it up!
                  </p>
                </CardContent>
              </Card>
              <Button asChild className="w-1/2 bg-gradient-web3-blue text-base py-5">
                <Link href="/tenant/payment/reciept">Reciept view</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
