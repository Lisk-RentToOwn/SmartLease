"use client";

import DropdownFilter from "@/components/DropdownFilter";
import PropertyCard from "@/components/PropertyCard";
import React, { useState } from "react";

const mockProperties = [
  {
    id: "12342",
    title: "Sunset Apartments #304",
    address: "1234 Wilshire Blvd, Los Angeles, CA 90001",
    rent: 2450,
    equity: 34,
    imageUrl: "/images/property1.jpg",
    status: "Active",
  },
  {
    id: "22591",
    title: "Parkview Townhouse",
    address: "567 Park Lane, Seattle, WA 98101",
    rent: 3200,
    equity: 12,
    imageUrl: //image url here,
    status: "Pending",
  },
  // more mock items as needed to be added here
];

export default function BrowsePropertiesPage() {
  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-gray-500 text-sm">
            Manage your rental properties and track your equity growth
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          Select Property
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <DropdownFilter
          label="Filter"
          options={["All Properties", "Active", "Pending", "Owned"]}
        />
        <DropdownFilter
          label="Sort by"
          options={["Highest Equity", "Lowest Rent"]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  );
}
