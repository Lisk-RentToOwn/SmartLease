import { Balance, isENS } from "@/components/scaffold-eth";
import { useOutsideClick } from "@/hooks/scaffold-eth";
import { getTargetNetworks } from "@/utils/scaffold-eth";
import {
    ArrowLeftOnRectangleIcon,
    ArrowTopRightOnSquareIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    DocumentDuplicateIcon,
    QrCodeIcon
} from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { getAddress } from "viem";
import { Address, useDisconnect } from "wagmi";

import { Routes } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { clearUserRole, setUserRole } from "@/lib/cookies";
import { LucideWallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddressQRCodeModal } from "./AddressQRCodeModal";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
  networkColor:string,
  chainName: string,
  chainImgUrl: string
};



export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
  chainImgUrl,
  chainName,
  networkColor
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);
  const router = useRouter()

  const [addressCopied, setAddressCopied] = useState(false);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);
  const [open, setOpen] = useState(false)

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(checkSumAddress);
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
    }, 800);
  };

  return (
    <>

        <DropdownMenu>
            <DropdownMenuTrigger className="w-full ">
                <Button tabIndex={0} className="py-6 w-full rounded-lg bg-gradient-web3-blue">
                    <LucideWallet size={23} className="text-white"/>
                    <span className="ml-2 mr-1 text-base">
                        {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
                    </span>
                    <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuItem disabled className="disabled:text-blue-600 text-blue-600">
                    <div className="flex flex-col items-center w-full border-b border-gray-300 pb-2 mr-1 text-sm">
                        <Balance address={address as Address} className="min-h-0 h-auto text-base" />
                        <span className="text-xs" style={{ color: networkColor }}>
                            {chainName}
                        </span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <div className={selectingNetwork ? "hidden" : ""}>
                    {addressCopied ? (
                <div className="btn-sm !rounded-xl flex gap-3 py-3">
                  <CheckCircleIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copy address</span>
                </div>
                    ) : (
                        // Use a button with onClick handler
                        <button
                        className="btn-sm !rounded-xl flex gap-3 py-3 w-full text-left"
                        onClick={handleCopyAddress}
                        >
                        <DocumentDuplicateIcon
                            className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                            aria-hidden="true"
                        />
                        <span className=" whitespace-nowrap">Copy address</span>
                        </button>
                    )}
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <div className={selectingNetwork ? "hidden" : ""}>
                        <label htmlFor="qrcode-modal" className="btn-sm !rounded-xl flex gap-3 py-3">
                        <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
                        <span className="whitespace-nowrap">View QR Code</span>
                        </label>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <div className={selectingNetwork ? "hidden" : ""}>
                        <button className="menu-item btn-sm !rounded-xl flex gap-3 py-3" type="button">
                        <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
                        <a
                            target="_blank"
                            href={blockExplorerAddressLink}
                            rel="noopener noreferrer"
                            className="whitespace-nowrap"
                        >
                            View on Block Explorer
                        </a>
                        </button>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <div className={selectingNetwork ? "hidden" : ""}>
                        <button
                        className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                        type="button"
                        //@ts-ignore
                        onClick={() => {
                            disconnect(); 
                            clearUserRole()
                            router.push(Routes.HOME)
                        }}
                        >
                        <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
                        </button>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <AddressQRCodeModal address={address} modalId="modalId"/>
            </DialogContent>
        </Dialog>
    </>
  );
};