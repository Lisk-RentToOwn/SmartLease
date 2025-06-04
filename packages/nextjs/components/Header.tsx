"use client";

import React, { ReactNode, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Bars3Icon, BugAntIcon, HomeIcon } from "@heroicons/react/24/outline";
import {
  DappConsoleButton,
  FaucetButton,
  RainbowKitCustomConnectButton,
  SuperchainFaucetButton,
} from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { cn } from "~~/lib/utils";
import DashboardTabLayout from "./shared/dashboard-tab-layout";
import { LANDLORDNAV, TENANTNAV } from "~~/constants/dashboard-nav";
import { TenantRoutes, Landlordoutes } from "~~/constants/user-type-routes";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={cn(
                "relative flex text-slate-800 items-center justify-between px-4 py-2 text-sm transition-colors duration-200",
                isActive ? "rounded-full text-white bg-primary/80" : "text-slate-400",
              )}
            >
              {icon}
              {label}
            </Link>
          </li>
        );
      })}
    </>
  );
};


/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );
  const path = usePathname()


  const GeneralHeader = () => {
    return (
      <>
         <div className=" flex items-center space-x-3 py-5">
          <div className="lg:hidden dropdown" ref={burgerMenuRef}>
            <label
              tabIndex={0}
              className={`ml-1 bg-secondary ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
              onClick={() => {
                setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
              }}
            >
              <Bars3Icon className="h-1/2" />
            </label>
            {isDrawerOpen && (
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                onClick={() => {
                  setIsDrawerOpen(false);
                }}
              >
                <HeaderMenuLinks />
              </ul>
            )}
          </div>
  
          <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks />
          </ul>
        </div>
      </>
    )
  }

  const getHeaderType = (): ReactNode => {
    //@ts-ignore
    if (TenantRoutes.includes(path)) 
        return (
          <DashboardTabLayout
              tabList={TENANTNAV}
          />);
          //@ts-ignore
    if (Landlordoutes.includes(path))
      return (
        <DashboardTabLayout
            tabList={LANDLORDNAV}
        />);
    return <GeneralHeader/>
  };
  

  return (
    <header className="sticky top-0  z-20 px-0 sm:px-2 border-b border-gray-300 bg-white">
      <div className="flex items-end justify-between app-container">
          {getHeaderType()}

          <div className="mr-4 flex items-center py-5">
            <RainbowKitCustomConnectButton />
            {/* <FaucetButton /> */}
          </div>
      </div>
    </header>
  );
};
