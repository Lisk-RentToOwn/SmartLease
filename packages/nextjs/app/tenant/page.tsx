"use client";

import { Routes } from "../routes";
import { usePropertyInfo } from "@/hooks/property/propertyInfo";
import { usePropertyEvent } from "@/hooks/property/useTenant";
import { useUserSession } from "@/hooks/property/useTenant";
import { useTenantEquity } from "@/hooks/property/useTenant";
import { calculateNextPayment } from "@/hooks/property/useTenant";
import { useTenantPayments } from "@/hooks/property/useTenant";
import { useOwnershipDate } from "@/hooks/property/useTenant";
import {
  Bell,
  Wallet,
  Moon,
  Gift,
  PieChart,
  Gem,
  Lock,
  Ribbon,
  Medal,
  CalendarRange,
  EllipsisVertical,
  Car,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~~/components/ui/card";
import { Switch } from "~~/components/ui/switch";

export default function TenantDashboard() {
  const { address } = useAccount();
  const { paymentdata } = useTenantPayments(address);
  const { propertyId, active } = useUserSession(address);
  const { info, loading, error } = usePropertyEvent(propertyId ?? undefined);
  const { data } = useTenantEquity(address, propertyId ?? undefined);
  const ownershipDate = useOwnershipDate(address, propertyId ?? undefined);

  let nextPayment;
  if (info) {
    nextPayment = calculateNextPayment(paymentdata, info);
  }

  const obj = { ...(info?.args || {}) };

  const fullPriceWei = obj[3] || 0;
  const fullPriceEther = Number(formatUnits(fullPriceWei, 18));
  const term = Number(obj[4]);

  const propertyInfo = {
    tokenId: Number(obj[2]) || 0,
    fullPrice: Number(fullPriceEther.toFixed(6)),
    monthlyPrice: Number((fullPriceEther / term).toFixed(6)) || "0.00",
    term,
    name: obj[5] || 0,
    image: obj[6],
    street: obj[7],
    city: obj[8],
    state: obj[9],
    currency: obj[11],
  };
  console.log(propertyId, address, info, propertyInfo);

  const router = useRouter();
  const handleBrowseClick = () => {
    router.push(Routes.BROWSE_PROPERTIES);
  };

  return (
    <div className="">
      <div className="app-container mt-16 pb-20">
        <header className="flex justify-between mb-5 border-b">
          <h1 className="text-black font-semibold text-3xl">
            Tenant Dashboard
          </h1>
        </header>

        <main className="space-y-6">
          <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
            <Card className="">
              <CardHeader className="flex flex-row justify-between">
                <div>
                  <CardTitle className="mb-1 text-xl">
                    Property Summary
                  </CardTitle>
                  <CardDescription className="text-[0.8rem]">
                    Token ID: {propertyInfo.tokenId ?? "Unavailable"}
                  </CardDescription>
                </div>
                {!active ? (
                  <Badge className="h-7  rounded-3xl " variant={"customGray"}>
                    Inactive
                  </Badge>
                ) : (
                  <Badge className="h-7 bg-blue-500 rounded-3xl ">Active</Badge>
                )}
              </CardHeader>

              <CardContent className="flex-ic flex-col gap-2">
                {!active ? (
                  <>
                    <p className="text-center text-gray">
                      {" "}
                      You haven't started your rent-to-own journey. Browse
                      available properties to get started.
                    </p>
                    <Button onClick={handleBrowseClick}>View properties</Button>
                  </>
                ) : loading ? (
                  <p className="text-dark text-center text-2xl flex-jb-ic">
                    Loading your properties details...⏳
                  </p>
                ) : (
                  <div className="flex gap-5 w-full">
                    <Image
                      src={propertyInfo.image}
                      alt="Building"
                      className="w-fit border rounded-xl"
                      width={150}
                      height={100}
                    />
                    <div className="flex flex-col gap-10 w-full">
                      <div className="grid grid-cols-2  gap-20">
                        <div className="space-y-4">
                          <p className="text-gray text-base ">
                            Address <br />
                            <span className="text-dark text-lg">
                              {propertyInfo.street}, {propertyInfo.city} <br />
                              {propertyInfo.state}
                            </span>
                          </p>
                          <p className="text-gray text-lg">
                            Equity Earned <br />{" "}
                            <span className="text-emerald-500  font-semibold">
                              12.5%
                            </span>
                          </p>
                        </div>
                        <div className="space-y-8">
                          <p className="text-gray">
                            Monthly Rent <br />{" "}
                            <span className="text-dark text-xl">
                              {propertyInfo.currency}{" "}
                              {propertyInfo.monthlyPrice}
                            </span>
                          </p>
                          <p className="text-gray">
                            Next Vesting Date <br />{" "}
                            {!active ? (
                              <span className="text-dark">
                                Not determined yet
                              </span>
                            ) : (
                              <span className="text-dark text-xl">
                                {nextPayment?.dueDate.toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}{" "}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between ">
                          <p className="text-gray text-base">
                            Vesting Progress
                          </p>
                          <p className="text-dark">12.5% of 100%</p>
                        </div>

                        <ProgressDemo
                          value={12.5}
                          className="progress-green-fill"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Equity Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative ">
                  <div
                    className="radial-progress absolute left-1/2 top-1/2 -translate-x-1/2 
                    text-blue-50 "
                    style={
                      {
                        "--value": 100,
                        "--size": "9rem",
                        "--thickness": "0.8rem",
                      } as React.CSSProperties
                    }
                  ></div>
                  <div
                    className="radial-progress text-emerald-500 absolute -translate-x-1/2 left-1/2 top-1/2 flex flex-col items-center"
                    style={
                      {
                        "--value": data.equity || 0,
                        "--size": "9rem",
                        "--thickness": "0.8rem",
                      } as React.CSSProperties
                    }
                  >
                    <h1 className="text-darkColor font-bold text-xl leading-none">
                      {" "}
                      {data.equity || 0}%
                    </h1>
                    <p className="text-gray leading-none">Equity Earned</p>
                  </div>
                </div>
                <div className="mt-[9.5rem] space-y-4">
                  <p className="text-gray text-lg">
                    Next Unlock <br />
                    {!active ? (
                      <span className="text-dark">Not determined yet</span>
                    ) : (
                      <span className="text-dark">
                        +1.5% on{" "}
                        {nextPayment?.dueDate.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                      </span>
                    )}
                  </p>
                  <p className="text-grayColor text-sm">
                    Full ownership projected by <br />
                    <span className="text-blue-500 text-small font-semibold">
                      {!active ? (
                        <p>No date has been set</p>
                      ) : (
                        ownershipDate?.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })
                      )}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="!p-0">
              <CardHeader className="space-y-3 !pb-3 ">
                <CardTitle className="text-xl text-slate-600">Rent Payment</CardTitle>
                <CardDescription className="flex gap-2 items-center text-sm text-red-500 border-0 rounded-sm p-3 font-bold bg-red-300/20">
                  <CalendarRange className="w-3" />
                  <div className=" space-y-1">
                    <p className="leading-none">Rent Due</p>
                    <p className="leading-none">
                      {nextPayment?.dueDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) || "No date yet"}
                    </p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <p className="text-gray">Amount Due</p>
                <p className="text-dark mb-2">
                  {propertyInfo?.currency || ""}
                  {propertyInfo?.monthlyPrice ?? "0.00"}
                </p>
                <div className="flex justify-between">
                  <div
                    className="flex items-center mb-3
                  "
                  >
                    <span className="text-gray">Gasless Transactions</span>
                    <Switch className="scale-75" />
                  </div>
                  <div
                    className="flex items-center
                  "
                  >
                    <span className="text-gray">AutoPay</span>
                    <Switch className="scale-75" />
                  </div>
                </div>

              {/* <CardContent className="pt-5">
                <p className="text-gray">Amount Due</p>
                <p className="text-2xl font-medium text-slate-800 mb-5 mt-1">400.00 LSK</p>
                <Button className="w-full text-sm py-6 bg-gradient-web3-blue">Pay Now</Button> */}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-3 !pb-3 ">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-slate-600">Rewards & Badges</CardTitle>
                  <p className="text-blue-500 text-sm">View All</p>
                </div>
                <CardDescription className="border-0 rounded-sm bg-blue-300/20 flex p-3 gap-2 items-center ">
                  <Medal
                    className="border-none rounded-full p-2 bg-blue-300/30 w-8 h-8 text-gray-100"
                    fill="rgb(20, 130, 199)"
                  />
                  <div>
                    <p className="text-sm">On-time Payment Streak</p>
                    <p className="text-blue-500 font-bold text-[1rem]">
                      12 <span className="text-gray font-normal">months</span>
                    </p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Card className="mini-card border-none">
                    <Ribbon className="mini-card-icon bg-rd-green" />
                    <p className="mini-card-p ">Punctual Payer</p>
                  </Card>
                  <Card className="mini-card border-none">
                    <Gem
                      className="mini-card-icon bg-purple-400/25 text-gray-300"
                      fill="rgb(132, 50, 220)"
                    />
                    <p className="mini-card-p">Equity Builder</p>
                  </Card>
                  <Card className="mini-card border-none">
                    <Lock className="mini-card-icon bg-rd-gray" />
                    <p className=" text-gray-400 mt-1">Locked</p>
                  </Card>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-500">Next reward in 16 days</p>
                  <p className="text-sm text-blue-500">
                    Complete 3 more on-time payments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Notifications</CardTitle>
                  <EllipsisVertical className="w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="nofti-ul">
                  <Bell className="notfi-icon bg-rd-red" />
                  <li>
                    <p className="text-dark">Rent due Reminder</p>
                    <p className="text-gray nofti-p">
                      Your rent of $2,400 is due in 5 days <br />
                      <span className="font-normal">2 hours ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul">
                  <PieChart className="notfi-icon bg-rd-green " />
                  <li>
                    <p className="text-dark">Equity Update</p>
                    <p className=" text-gray nofti-p ">
                      You've earned 1.5% more equity this month <br />
                      <span className="nofti-span">2 days ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul">
                  <Wallet className="notfi-icon bg-rd-blue" />
                  <li>
                    <p className="text-dark">Wallet Connected</p>
                    <p className=" text-gray nofti-p ">
                      Your smart wallet was successfully connected <br />
                      <span className="nofti-span">5 days ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul ">
                  <Gift className="notfi-icon bg-rd-purple" />
                  <li>
                    <p className="text-dark">Reward Earned</p>
                    <p className=" text-gray nofti-p ">
                      You've earned the "Punctual Payer" badge
                      <br />
                      <span className="nofti-span">1 week ago</span>
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
