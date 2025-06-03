"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Logo } from "~~/components/Logo";
import { Address } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import { Routes } from "./routes";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <section className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 flex flex-col gap-2 items-center">
        <div className="flex border px-8 py-3 rounded-md justify-center items-center space-x-2">
          <p className="my-2 font-medium text-primary">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        <div className="flex items-center mt-10 space-x-5 ">
          <Link href={Routes.TENANT}>
              <Button className="py-6">Tenant Dashboard</Button>
          </Link>

          <Link href={Routes.LANDLORD}>
              <Button className="py-6">Landlord Dashboard</Button>
          </Link>
        </div>
      </div>

    </section>
  );
};

export default Home;
