"use client";

import { usePropertyInfo } from "@/hooks/property/propertyInfo";
import { useTenantPayments } from "@/hooks/property/useTenant";
import { useUserSession } from "@/hooks/property/useTenant";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useAccount } from "wagmi";
import { Button } from "~~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~~/components/ui/table";

// Define the Payment type based on the table in the image
export type Payment = {
  date: string;
  amount: number;
  status: "completed";
  equityEarned: string;
  transaction: string;
};

// Define the columns to match the table in the image
export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="text-dark">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = amount.toLocaleString("en-US", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      });

      const { address } = useAccount();
      const { propertyId } = useUserSession(address);
      const { propertyInfo } = usePropertyInfo(propertyId ?? undefined);
      return (
        <div className="text-dark">
          {propertyInfo.currency} {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize text-green-800 font-semibold bg-green-100 rounded-full px-2 py-1 inline-block">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "equityEarned",
    header: "Equity Earned",
    cell: ({ row }) => (
      <div className="font-semibold text-emerald-400">
        {row.getValue("equityEarned")}
      </div>
    ),
  },
  {
    accessorKey: "transaction",
    header: "Transaction",
    cell: ({ row }) => <div>{row.getValue("transaction")}</div>,
  },
];

export default function DataTableDemo() {
  const { address } = useAccount();
  const { propertyId } = useUserSession(address);
  const {
    paymentdata: paymentData,
    loading,
    error,
  } = useTenantPayments(address, propertyId ?? undefined);

  const mappedPayments: Payment[] = React.useMemo(() => {
    return paymentData.map((p) => ({
      date:
        p.date?.toLocaleDateString("en-us", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }) ?? "N/A",
      amount: p.amount,
      status: "completed",
      equityEarned: "+0.25%", // static for now
      transaction: `${p.txHash.slice(0, 6)}....${p.txHash.slice(-4)}`,
    }));
  }, [paymentData]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data: mappedPayments,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div className="w-full bg-gray-50   rounded-lg">
      <div className="flex items-center rounded-tl-lg rounded-tr-lg justify-between p-4 bg-gradient-web3-blue">
        <p className="text-xl font-semibold text-white">Payment History</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-gray-300  font-semibold flex items-center gap-1"
            >
              All Time <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className=" border border-gray-200 pl-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-gray-600 font-medium text-sm py-3"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-gray-700 text-sm py-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No Payments made yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-3 px-4 text-gray-bold">
        Showing {table.getRowModel().rows.length} of{" "}
        {table.getPrePaginationRowModel().rows.length} payments
      </div>
    </div>
  );
}

export { Table };
