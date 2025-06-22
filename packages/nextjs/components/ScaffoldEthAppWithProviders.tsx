"use client";

import { Header } from "@/components/Header";
import { BlockieAvatar } from "@/components/scaffold-eth";
import { ProgressBar } from "@/components/scaffold-eth/ProgressBar";
import { PushProvider } from "@/context/PushContext";
import { XmtpProvider } from "@/context/XmtpContext";
import { wagmiConfig } from "@/services/web3/wagmiConfig";
import { appChains } from "@/services/web3/wagmiConnectors";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { WagmiConfig } from "wagmi";
import GenericLayout from "./shared/layout/generic-layout";
import { usePathname } from "next/navigation";
import { LANDLORDNAV, TENANTNAV } from "@/constants/dashboard-nav";
import { useNetworkStatusToast } from "@/hooks/useNetworkConnection";


const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  useNetworkStatusToast()

  const getHeaderType = ( ): ReactNode => {
    //@ts-ignore
    if (path.startsWith("/tenant"))
      return <GenericLayout children={children} sideMenu={TENANTNAV}/>;
    //@ts-ignore
    if (path.startsWith("/landlord"))
      return <GenericLayout children={children} sideMenu={LANDLORDNAV}/>
    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="relative flex flex-col flex-1">{children}</main>
        </div>
    );
  };

  return (
    <>
      {getHeaderType()}
      <Toaster />
    </>
  );
};

export const ScaffoldEthAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <ProgressBar />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={
          mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()
        }
      >
        <PushProvider>
          <XmtpProvider>
            <ScaffoldEthApp>{children}</ScaffoldEthApp>;
          </XmtpProvider>
        </PushProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
