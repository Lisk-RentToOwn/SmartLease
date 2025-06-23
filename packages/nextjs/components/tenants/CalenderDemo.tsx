"use client";

import { useUserSession } from "@/hooks/property/useTenant";
import { usePaymentCalendar } from "@/hooks/property/useTenant";
import { format } from "date-fns";
import * as React from "react";
import { useAccount } from "wagmi";
import { Calendar } from "~~/components/ui/calendar";

export function CalendarDemo() {
  const { address } = useAccount();
  const { propertyId } = useUserSession(address);
  const calendar = usePaymentCalendar(address, propertyId ?? undefined);

  // const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Calendar
      mode="multiple"
      selected={calendar.map((entry) => entry.dueDate)}
      className=" shadow-sm w-full"
      modifiers={{
        paid: calendar
          .filter((entry) => entry.status === "paid")
          .map((entry) => entry.dueDate),
        due: calendar
          .filter((entry) => entry.status === "due")
          .map((entry) => entry.dueDate),
        late: calendar
          .filter((entry) => entry.status === "future")
          .map((entry) => entry.dueDate),
      }}
      modifiersClassNames={{
        paid: "bg-emerald-400 text-white",
        due: "bg-blue-400",
        late: "bg-red-400",
      }}
    />
  );
}
