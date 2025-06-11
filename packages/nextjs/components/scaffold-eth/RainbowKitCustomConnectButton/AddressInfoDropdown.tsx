import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { NetworkOptions } from "./NetworkOptions";
import { Balance, BlockieAvatar, isENS } from "@/components/scaffold-eth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOutsideClick } from "@/hooks/scaffold-eth";
import { getTargetNetworks } from "@/utils/scaffold-eth";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { LucideWallet } from "lucide-react";
import { useRef, useState } from "react";
import { getAddress } from "viem";
import { Address, useDisconnect } from "wagmi";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
  networkColor: string;
  chainName: string;
  chainImgUrl: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
  chainImgUrl,
  chainName,
  networkColor,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const [addressCopied, setAddressCopied] = useState(false);
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);
  const [open, setOpen] = useState(false);

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
        <DropdownMenuTrigger>
          <Button tabIndex={0} className="">
            <div className="bg-secondary flex items-center">
              <BlockieAvatar
                address={checkSumAddress}
                size={30}
                ensImage={ensAvatar}
              />
            </div>
            <span className="ml-2 mr-1">
              {isENS(displayName)
                ? displayName
                : checkSumAddress?.slice(0, 6) +
                  "..." +
                  checkSumAddress?.slice(-4)}
            </span>
            <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
          </Button>
        </DropdownMenuTrigger>
        {/* ❌ DUPLICATE: Nested DropdownMenu inside another DropdownMenu */}
        <DropdownMenu>
          {" "}
          {/* <-- This entire nested DropdownMenu should be removed */}
          <DropdownMenuTrigger>
            <Button tabIndex={0} className="py-6 rounded-lg">
              <LucideWallet size={23} className="text-white" />
              <span className="ml-2 mr-1 text-base">
                {isENS(displayName)
                  ? displayName
                  : checkSumAddress?.slice(0, 6) +
                    "..." +
                    checkSumAddress?.slice(-4)}
              </span>
              <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* ...content here is mostly duplicate of outer menu items... */}
          </DropdownMenuContent>
        </DropdownMenu>{" "}
        {/* <-- END DUPLICATE DropdownMenu */}
        <DropdownMenuContent>
          {/* ✅ Keep this DropdownMenuContent - it is the correct/outer one */}

          {/* ❌ DUPLICATE MenuItem: View on Block Explorer (already added below too) */}
          <DropdownMenuItem>
            <div className={selectingNetwork ? "hidden" : ""}>
              <button
                className="menu-item btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
              >
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

          {/* ❌ DUPLICATE MenuItem: Disconnect (already added below too) */}
          <DropdownMenuItem>
            <div className={selectingNetwork ? "hidden" : ""}>
              <button
                className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => disconnect()}
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <span>Disconnect</span>
              </button>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {allowedNetworks.length > 1 ? (
                <div className={selectingNetwork ? "hidden" : ""}>
                  <button
                    className="btn-sm !rounded-xl flex gap-3 py-3"
                    type="button"
                  >
                    <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                    <span>Switch Network</span>
                  </button>
                </div>
              ) : null}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent>
              <NetworkOptions />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* ✅ Correct version of Disconnect and View on Explorer below */}

          <DropdownMenuItem>
            <div className={selectingNetwork ? "hidden" : ""}>
              <button
                className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                type="button"
                onClick={() => disconnect()}
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
                <span>Disconnect</span>
              </button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <AddressQRCodeModal address={address} modalId="modalId" />
        </DialogContent>
      </Dialog>
    </>
  );
};
