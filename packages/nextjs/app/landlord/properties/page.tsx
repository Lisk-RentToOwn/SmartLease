import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { Routes } from "~~/app/routes"
import LandlordPropertyCard from "~~/components/landlord/property-card"
import { Button } from "~~/components/ui/button"

const LandlordPropertiesPage = () => {
    return (
        <>
            <main className="bg-gray-100 min-h-[90vh]">
                <div className="mt-16 app-container">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-2xl text-slate-700">My Properties</p>

                        <Link href={Routes.LANDLORD_CREATE} className="">
                            <Button className="p-6">
                                <PlusIcon className=""/>
                                <p className="font-medium">Create New Property</p>
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2">
                        <p className="font-medium text-black ">6 properties,</p>
                        <p className="text-green-500">4 occupied</p>
                    </div>

                    <div className="grid grid-cols-3 gap-7 mt-8">
                        <LandlordPropertyCard
                            address="No 20 wall  street 12 Avenue"
                            duration="6 years"
                            explorer_url="htps://google.com"
                            is_occupied={false}
                            name="Owklane City"
                            price="1233333"
                            currency="$"
                            property_image_url="https://shadcnblocks.com/images/block/placeholder-dark-1.svg"
                            start_date="12th Jan, 2024"
                            tenant_address="0X13939393"
                            token_id={23}
                            lease_end="Dec 2023"
                            flexible_payment={false}
                        />

                        <LandlordPropertyCard
                            address="No 20 wall  street 12 Avenue"
                            duration="6 years"
                            explorer_url="htps://google.com"
                            is_occupied={true}
                            name="Owklane City"
                            price="1233333"
                            currency="$"
                            property_image_url="https://shadcnblocks.com/images/block/placeholder-dark-1.svg"
                            start_date="12th Jan, 2024"
                            tenant_address="0X13939393"
                            token_id={23}
                            lease_end="Dec 2023"
                            flexible_payment={true}
                        />


                        <LandlordPropertyCard
                            address="No 20 wall  street 12 Avenue"
                            duration="6 years"
                            explorer_url="htps://google.com"
                            is_occupied={false}
                            name="Owklane City"
                            price="1233333"
                            currency="$"
                            property_image_url="https://shadcnblocks.com/images/block/placeholder-dark-1.svg"
                            start_date="12th Jan, 2024"
                            tenant_address="0X13939393"
                            token_id={23}
                            lease_end="Dec 2023"
                            flexible_payment={false}
                        />


                        <LandlordPropertyCard
                            address="No 20 wall  street 12 Avenue"
                            duration="6 years"
                            explorer_url="htps://google.com"
                            is_occupied={true}
                            name="Owklane City"
                            price="1233333"
                            currency="$"
                            property_image_url="https://shadcnblocks.com/images/block/placeholder-dark-1.svg"
                            start_date="12th Jan, 2024"
                            tenant_address="0X13939393"
                            token_id={23}
                            lease_end="Dec 2023"
                            flexible_payment={true}
                        />
                    </div>
                </div>
            </main>
        </>
    )
}


export default LandlordPropertiesPage