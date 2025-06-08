import {
  UserRound,
  Wallet,
  PieChartIcon,
  CreditCard,
  HelpCircle,
  HardDriveDownload,
  RefreshCw,
  Car,
  Circle,
} from "lucide-react";
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

export const metadata = { title: "Tenant Payment Page" };

export default function TenantPaymentPage() {
  return (
    <div className="min-h-screen min-w-full px-[8rem] py-4 space-y-4">
      <header className="flex justify-between items-center">
        <div className="flex gap-3 items-center ">
          <p className="text-gray-bold">Smart Wallet Connected</p>
          <div className="flex gap-1 items-center border bg-emerald-400/10 px-2 rounded-xl">
            <Wallet className="w-[0.9rem] text-emerald-400" />
            <span className="text-[0.8rem] text-emerald-400">0x71C...8F3e</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 items-center">
          <NotificationBell />
          <UserRound className="w-6 bg-blue-500 text-white rounded-full p-1 ml-1" />
          <p className="text-dark">Alex Johnson</p>
        </div>
      </header>
      <main className="space-y-6">
        <section>
          <p className="font-semibold text-xl">Rent Payments</p>
          <p className="text-gray-bold">
            Manage your rent payments and track your payment history
          </p>
        </section>
        <section className="grid grid-cols-[auto_auto] gap-20">
          <div className="grid grid-rows-[auto_auto_auto] space-y-5">
            <Card className="space-y-3">
              <CardHeader className="border-b !py-3 bg-blue-200/20">
                <CardTitle className="text-sm">Upcoming Rent</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div>
                  <p className="font-semibold text-[1.2rem] flex items-center gap-1">
                    $1,850.00
                    <span className=" text-[0.6rem] text-blue-500 border-none rounded-sm  bg-blue-500/10 p-1">
                      Due in 5 days
                    </span>
                  </p>
                  <p className="text-gray-bold mt-0.5">
                    Due on the June 1st, 2023
                  </p>
                  <div className="flex items-center gap-1">
                    <PieChartIcon className="w-3 text-emerald-400" />
                    <p className="text-gray">Earns 0.25% equity this month</p>
                  </div>
                </div>
                <Button>
                  <CreditCard />
                  <span className="text-xs">Pay Now</span>
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
                checked={true}
                className="data-[state=checked]:bg-emerald-400"
              />
            </Card>
            <Card>
              <DataTableDemo />
            </Card>
          </div>
          <div className="grid grid-rows-[auto_auto] gap-5">
            <Card className="w-calend">
              <CardHeader className="bg-blue-200/10">
                <CardTitle>Rent Calender</CardTitle>
              </CardHeader>
              <CardContent className="!pb-1 ">
                <div className="[&>*]:grid grid-cols-1">
                  <CalendarDemo />
                </div>
                <div className=" grid grid-cols-3 border-t pt-3">
                  <div className=".info-color-div">
                    <Circle
                      className="w-4 text-[rgb(0,121,201)]"
                      fill="rgb(0, 121, 201)"
                    />
                    <p className="text-gray-bold">Due Date</p>
                  </div>
                  <div className=".info-color-div">
                    <Circle
                      className="w-4 text-[rgb(49,209,52)]"
                      fill="rgb(49, 209, 52)"
                    />
                    <p className="text-gray-bold">Paid</p>
                  </div>
                  <div className=".info-color-div">
                    <Circle
                      className="w-4 text-[rgb(244,109,6)]"
                      fill="rgb(244, 109, 6)"
                    />
                    <p className="text-gray-bold">Late</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="space-y-4 w-calend">
              <CardHeader className="border-b bg-blue-200/10 !py-5">
                <CardTitle>Equity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between ">
                    <p className="text-gray">Total Equity Earned</p>
                    <p className="text-dark">1.25%</p>
                  </div>
                  <ProgressDemo value={1.25} className="progress-green-fill" />
                </div>
                <p className="text-gray-bold">
                  You've earned 1.25% equally in your property through on-time
                  <br />
                  rent payments. Keep it up!
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
