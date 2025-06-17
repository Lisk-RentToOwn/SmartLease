"use client";

import DropdownFilter from "@/components/DropdownFilter";
import { PropertyCard, PropertyType } from "@/components/PropertyCard";
import EmptyContent from "@/components/shared/empty-content";
import TablePagination from "@/components/shared/pagination-custom";
import PropertyCardSkeleton from "@/components/shared/property-skeleton";
import { useAvailableProperties } from "@/hooks/property/usePropertyEvents";
import { useAccount } from "wagmi";


// propertyId, amt
export default function BrowsePropertiesPage() {
  const {isConnected, address} = useAccount()

  const {
    properties,
    loading,
    page,
    setPage,
    totalPages,
    totalProperties
  } = useAvailableProperties({
    itemsPerPage: 12,
    liveUpdates: true
  });

  return (
    <div className="bg-gray-100">
      <div className="app-container min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 mt-20">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-green-600 text-lg">
              Available Properties found ({totalProperties})
            </p>
          </div>
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

        <div className="mb-10">
          {/* {mockProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              status={toStatus(property.status)}
            />
          ))} */}

      {loading ? (
          <div className="grid grid-cols-1 mini:grid-cols-4 gap-6">
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
          </div>
      ) : (
        <>
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {properties.map(property => (
                <PropertyCard 
                  key={`${property.args.propertyId}-${property.blockNumber}`}
                  data={property.args as PropertyType}
                />
              ))}
            </div>
              
            <div className="flex justify-between items-center mt-10">
              <TablePagination
                  currentPage={page}
                  itemsPerpage={12}
                  setpage={setPage}
                  total={totalPages}
              />
            </div>
          </>
          
          {properties.length === 0 && (
            <EmptyContent 
              className=""
            />
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
