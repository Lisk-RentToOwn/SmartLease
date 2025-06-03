import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { Address, useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

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
} from "~~/components/ui/dropdown-menu"
import { Button } from "~~/components/ui/button";
import { Dialog, DialogContent } from "~~/components/ui/dialog";
import { AddressQRCodeModal } from "./AddressQRCodeModal";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
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
  const [open, setOpen] = useState(false)

  return (
    <>

        <DropdownMenu>
            <DropdownMenuTrigger>
                <Button tabIndex={0} className="">
                    <div className="bg-secondary flex items-center">
                        <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
                    </div>
                    <span className="ml-2 mr-1">
                        {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
                    </span>
                    <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
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
                        <CopyToClipboard
                            text={checkSumAddress}
                            onCopy={() => {
                            setAddressCopied(true);
                            setTimeout(() => {
                                setAddressCopied(false);
                            }, 800);
                            }}
                        >
                            <div className="btn-sm !rounded-xl flex gap-3 py-3">
                            <DocumentDuplicateIcon
                                className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                                aria-hidden="true"
                            />
                            <span className=" whitespace-nowrap">Copy address</span>
                            </div>
                        </CopyToClipboard>
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

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        {allowedNetworks.length > 1 ? (
                            <div className={selectingNetwork ? "hidden" : ""}>
                            <button
                                className="btn-sm !rounded-xl flex gap-3 py-3"
                                type="button"
                            >
                                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
                            </button>
                            </div>
                        ) : null}
                    </DropdownMenuSubTrigger>

                    <DropdownMenuSubContent>
                        <NetworkOptions />
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem>
                <div className={selectingNetwork ? "hidden" : ""}>
                    <button
                    className="menu-item text-error btn-sm !rounded-xl flex gap-3 py-3"
                    type="button"
                    onClick={() => disconnect()}
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
