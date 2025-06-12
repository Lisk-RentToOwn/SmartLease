import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import React from "react";

interface PropertyProps {
  id: string;
  title: string;
  address: string;
  rent: number;
  equity: number;
  imageUrl: string;
  status: "Active" | "Pending" | "Fully Owned";
}

export default function PropertyCard({
  id,
  title,
  address,
  rent,
  equity,
  imageUrl,
  status,
}: PropertyProps) {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-sm text-gray-500">{address}</p>
        <p className="text-xs text-gray-400 mt-1">Token ID: #{id}</p>
        <div className="mt-3">
          <p className="text-sm text-gray-700">Current Rent</p>
          <p className="text-blue-600 font-bold">
            ${rent.toLocaleString()}/month
          </p>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-700">Your Equity</p>
          <ProgressBar percentage={equity} />
        </div>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          View Details
        </button>
      </div>
    </div>
  );
}
