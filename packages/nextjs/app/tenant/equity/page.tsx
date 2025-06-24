"use client";

import { RenToOwnAddress } from "@/constants/contract-address";
import { usePropertyInfo } from "@/hooks/property/propertyInfo";
import {
  generateTenantGrowthChartData,
  GrowthChartPoint,
  useUserSession,
} from "@/hooks/property/useTenant";
import { useTenantEquity } from "@/hooks/property/useTenant";
import { useOwnershipDate } from "@/hooks/property/useTenant";
import { useEquityGrowth } from "@/hooks/property/useTenant";
import { useTenantTokenStats } from "@/hooks/property/useTenant";
import { calculateNextPayment } from "@/hooks/property/useTenant";
import { usePropertyEvent } from "@/hooks/property/useTenant";
import { useTenantPayments } from "@/hooks/property/useTenant";
import {
  CalendarCheck,
  Copy,
  Database,
  DollarSign,
  Eye,
  History,
  Home,
  Lock,
  LockOpen,
  PieChart,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import ChartDemo from "~~/components/tenants/ChartDemo";
import MilestoneProgress from "~~/components/tenants/MilestoneDemo";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~~/components/ui/card";

const milestones = [
  {
    tier: "Bronze Tier",
    goal: "Reached 10% ownership (100 tokens)",
    unlocked: "Priority maintenance requests",
    progress: 0,
  },
  {
    tier: "Silver Tier",
    goal: "Reached 20% ownership (200 tokens)",
    unlocked: "Property improvement voting rights",
    progress: 0,
  },
  {
    tier: "Gold Tier",
    goal: "Reached 30% ownership (300 tokens)",
    unlocked: "Reduced monthly payments",
    progress: 24.8,
  },
  {
    tier: "Platinum Tier",
    goal: "Reach 50% ownership (500 tokens)",
    unlocked: "Property modification rights",
    progress: 0,
  },
];
const currentMilestone = 2;

export default function EquityGrowthPage() {
  const { address } = useAccount();
  const { propertyId } = useUserSession(address);
  const { propertyInfo } = usePropertyInfo(propertyId ?? undefined);
  const { data } = useTenantEquity(address, propertyId ?? undefined);
  const ownershipDate = useOwnershipDate(address, propertyId ?? undefined);
  const { growth } = useEquityGrowth(propertyId ?? undefined);
  const { stats, loading, error } = useTenantTokenStats(
    address,
    propertyId ?? undefined
  );
  const { info } = usePropertyEvent(propertyId ?? undefined);
  const { paymentdata } = useTenantPayments(address);

  let nextPayment;
  if (info) {
    nextPayment = calculateNextPayment(paymentdata, info);
  }
  console.log(data);

  const latest = stats.history[0];
  const tokenId = latest?.args?.tokenId?.toString();

  const contractAddress = RenToOwnAddress ?? "0x...";

  const equityValue = Number(data.equity) / 100;
  console.log(equityValue);

  const remainingEquity = !equityValue ? 0 : 100 - equityValue;

  // const fullPriceEther = Number(formatUnits(fullPriceWei, 18));

  // const [chartData, setChartData] = useState<GrowthChartPoint[]>([]);

  // useEffect(() => {
  //   console.log(chartData)
  // }, [chartData])

  // useEffect(() => {
  //   if (address && propertyInfo) {
  //     //@ts-ignore
  //     generateTenantGrowthChartData(address, propertyInfo, 1000).then(setChartData);
  //   }
  // }, [address, propertyInfo])

  return (
    <div className="pt-4 app-container">
      <header className="flex-jb-ic border-b pb-5">
        <div className="flex gap-2 items-center">
          {/* <Home className="notfi-icon !rounded-sm bg-emerald-400 text-white" /> */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Equity Growth
          </h1>
        </div>
      </header>
      <main className=" mt-10 space-y-6">
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
          <Card className="border-none">
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Current Ownership
                <PieChart className="notfi-icon bg-rd-green" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">{equityValue}%</p>
              <p className="text-gray">
                {growth ? `${growth}% from last month` : "No equity growth yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Tokens Held
                <Database className="notfi-icon bg-rd-blue" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">{stats ? stats.currentTokens : 0}</p>
              <p className="text-gray">of 100 total tokens</p>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Projected Full Ownership
                <CalendarCheck className="notfi-icon bg-rd-purple" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">
                {ownershipDate
                  ? ownershipDate.toLocaleDateString("en-US", {
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <p className="text-gray">
                Est.
                {ownershipDate
                  ? ownershipDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : " n/a"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Current Value
                <DollarSign className="notfi-icon bg-rd-green" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">
                {propertyInfo
                  ? propertyInfo.currency + " " + propertyInfo.fullPrice
                  : 0}
              </p>
              <p className="text-gray">Based on current market value</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-none shadow-lg mt-10">
            <CardHeader className="flex-jb-ic flex-row j!py-3">
              <CardTitle className="equity-hd">Equity Chart</CardTitle>
              <div className="space-x-2">
                <Button className="timeBtn-On timeBtn-styl">Monthly</Button>
                <Button className="timeBtn-Off timeBtn-styl">Quaterly</Button>
                <Button className="timeBtn-Off timeBtn-styl">Yearly</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartDemo />
            </CardContent>
          </Card>
        </section>
        <section className="space-y-4">
          <p className="equity-hd text-xl mt-20 text-slate-800">
            Equity Vesting Status
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-none">
              <CardHeader className="vest-stat-hd !pb-0">
                <CardTitle className="text-dark">Unlocked Equity</CardTitle>
                <LockOpen className="notfi-icon bg-rd-green" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="value flex items-center gap-2">
                  {stats ? stats.unlocked : 0}{" "}
                  <span className="text-gray">
                    tokens ({data ? equityValue : 0}%)
                  </span>
                </p>
                <ProgressDemo
                  value={equityValue || 0}
                  className="progress-green-fill"
                />
                <div className="flex-jb-ic">
                  <p className=" text-xs">
                    Last unlocked:{" "}
                    {nextPayment
                      ? nextPayment.lastPayment.toLocaleDateString("en-us", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "00/00/0000"}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {data ? equityValue : 0}% of your holdings
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none">
              <CardHeader className="vest-stat-hd !pb-0">
                <CardTitle className="text-dark">Locked Equity</CardTitle>
                <Lock className="notfi-icon bg-rd-red" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="value flex items-center gap-2">
                  {stats ? stats.locked : 0}
                  <span className="text-gray">
                    tokens ({remainingEquity}% )
                  </span>
                </p>
                <ProgressDemo
                  value={remainingEquity}
                  className="progress-red-fill"
                />
                <div className="flex-jb-ic">
                  <p className=" text-xs">
                    Next unlock:{" "}
                    {nextPayment
                      ? nextPayment.dueDate.toLocaleDateString("en-us", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "00/00/0000"}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {remainingEquity}% of your holdings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="">
          <Card className="border-none mt-20">
            <CardHeader>
              <CardTitle className="text-gray-500 text-lg mb-12">
                Ownership Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneProgress address={address} propertyId={propertyId!} />
            </CardContent>
          </Card>
        </section>
        <section>
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="equity-hd">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-7">
              <Card className="bg-purple-200/10 border-none">
                <CardHeader
                  className="
                !pb-1 flex-jb-ic flex-row "
                >
                  <CardTitle className="">ERC1155 Token </CardTitle>
                  <Wallet className="bg-rd-purple notfi-icon" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray">Token ID</p>
                    <p className="text-dark">
                      {tokenId ? `#${tokenId}` : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray">Smart Contract Address</p>
                    <p className="text-dark flex gap-2 items-center">
                      {contractAddress.slice(0, 6)}...
                      {contractAddress.slice(-4)}
                      <Copy
                        className="w-3 text-purple-500 cursor-pointer"
                        onClick={() =>
                          navigator.clipboard.writeText(contractAddress)
                        }
                      />
                    </p>
                  </div>

                  {latest?.txHash && (
                    <a
                      href={`https://sepolia-blockscout.lisk.com/tx/${latest?.txHash}?tab=logs`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="text-xs bg-purple-500 mt-5">
                        <Eye className="w-4 h-4 mr-1" />
                        View on Explorer
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-purple-200/10 border-none">
                <CardHeader
                  className="
                !pb-1 flex-jb-ic flex-row "
                >
                  <CardTitle className="">Transaction History</CardTitle>
                  <History className="bg-rd-blue notfi-icon" />
                </CardHeader>
                <CardContent className="space-y-2 border-none">
                  {loading ? (
                    <p className="text-gray">Loading token history...</p>
                  ) : error ? (
                    <p className="text-red-500">
                      Failed to load token history.
                    </p>
                  ) : stats.history.length === 0 ? (
                    <p className="text-gray">No token transfers yet.</p>
                  ) : (
                    stats.history
                      .slice() // shallow copy to safely reverse
                      .reverse() // latest at top
                      .map((event, idx) => {
                        const tokens = Number(event.args.amount);
                        const date = new Date(
                          event.timestamp * 1000
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <div className="flex-jb-ic" key={idx}>
                            <div>
                              <p className="text-dark">{tokens} tokens</p>
                              <p className="text-gray">{date}</p>
                            </div>
                            <Badge variant={"customGreen"}>Verified</Badge>
                          </div>
                        );
                      })
                  )}

                  <Button
                    variant={"outline"}
                    className="text-xs w-full border-gray-300"
                  >
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
