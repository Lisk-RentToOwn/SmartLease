import { ReactNode } from "react"

type LandlordDashboardCardProps = {
    title: string,
    amount: number,
    currency?: string,
    extraText?: string,
    icon?: ReactNode
}

const LandlordDashboardCard = ({amount, currency, title, extraText, icon}: LandlordDashboardCardProps) => {
    return (
        <>
            <div className="rounded-xl p-8 py-10 bg-white shadow-lg flex justify-between">
                <div className="">
                    <p className="text-gray-500 font-medium text-xl">{title}</p>
                    
                    <div className="flex items-center space-x-2 mt-4">
                        <p className="text-slate-700 font-semibold text-2xl">{amount} {currency}</p>
                        <p className="text-base text-gray-400">{extraText}</p>
                    </div>
                </div>

                {icon}
            </div>
        </>
    )
}

export default LandlordDashboardCard