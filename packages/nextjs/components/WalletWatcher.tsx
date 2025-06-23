'use client';

import { useCallback, useEffect, useState } from 'react';
import { Address, useAccount, useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  setUserRole,
  getUserRole,
  clearUserRole,
} from '@/lib/cookies';
import { checkUserExistsAndRole, registerUserRole} from '@/services/request/user-request';
import { RoleEnum, useGetUserRole, useSetUserRole } from '@/services/request/contract/contract-request';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { getParsedError } from '@/utils/scaffold-eth';

export function WalletWatcher() {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [hasHandled, setHasHandled] = useState(false);
  const role = typeof window !== 'undefined' ? getUserRole() : undefined;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeAsync: setRole , isLoading: isLoading } = useSetUserRole();
  const [tempRole, setTempRole] = useState("")


  const {
    data: userRole, 
    isSuccess: getRoleSuccess
  } = useGetUserRole(address as Address)

  useEffect(() => {
    if (!isConnected || !address || hasHandled) return;

    const onboard = async () => {
      const cookieRole = typeof window !== 'undefined' ? getUserRole() : undefined;
      if (cookieRole) {
        // commented out, cause i want the user to remain on any page they are, but the dashboard button takes them where they want to
        // router.push(`/${cookieRole}`);
        console.log("No data")
        setHasHandled(true);
        return;
      }

      const data = userRole;
      console.log(userRole, "hello")
      if (getRoleSuccess && userRole !== undefined && userRole !== 0) {
        setUserRole(roleEnumToString(data as RoleEnum));
        // router.push(`/${result.role}`);
      } else {
        setShowRoleModal(true);
      }

      setHasHandled(true);
    };

    onboard();
  }, [isConnected, address, hasHandled, router]);

  const roleStringToEnum = (role: string | undefined) => {
    if (role === undefined || role === null) return RoleEnum.None
    if (role === "tenant") return RoleEnum.Tenant
    if (role === "landlord") return RoleEnum.Landlord
    return RoleEnum.None
  }

  const roleEnumToString = (role: RoleEnum) => {
    if (role === RoleEnum.Tenant) return "tenant"
    else return "landlord" 
  }

  useEffect(() => {
    if (!isConnected && hasHandled) {
      clearUserRole();
      setHasHandled(false);
      setShowRoleModal(false);
      router.replace("/")
    }
  }, [isConnected, hasHandled, router]);

  const handleSelectRole = async (role: 'tenant' | 'landlord') => {
   
    if (!address) return;
    
    try {
        const tx = await setRole({ args: [roleStringToEnum(role)] }); // <== pass args here
        setTxHash(tx.hash); // wait for this tx
        setUserRole(role)
    } catch (err) {
      const error = getParsedError(err)
      toast.error(error)
    }
  };

  useWaitForTransaction({
    hash: txHash,
    confirmations: 1,
    enabled: !!txHash,
    onSuccess() {
      // console.log("Transaction confirmed!");
      
      toast.success("User role set successfully. You can proceed to your dashboard")
      setShowRoleModal(false);
      // navigate or update UI here
    },
    onError(error) {
      console.error("Tx failed to confirm", error);
    },
  });

  const renderDasboardHeader = useCallback(() => {
    console.log(role)
    return (
      <>
        { (role !== undefined && isConnected) &&
            <div  className="">
                <Button onClick={() => { router.push(`/${role}`)}} className="bg-white border-[#9765E0] border text-[#9765E0] rounded-lg py-6 hover:bg-white px-4 shadow-none">Dashbboard</Button>
            </div>
        }
        { (role === undefined && isConnected) &&
            <div className="">
                <Button onClick={() => {setShowRoleModal(true)}} className="bg-white border-[#9765E0] border text-primary rounded-lg py-6 hover:bg-white px-4 shadow-none">Select Role</Button>
            </div>
        }
      </>
    )
  }, [role, isConnected, router])


  return (
    <>
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <DialogHeader>
            <DialogTitle className='text-2xl text-slate-700 mb-3'>Please select your role to proceed</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className='w-1/2 border relative flex flex-col bg-gradient-to-r from-purple-500 to-blue-500 text-white mb-6 group-hover:scale-110 shadow-lg transition-transform duration-300 items-center gap-y-2  cursor-pointer rounded-lg py-5'  onClick={() => {setTempRole("landlord");handleSelectRole('landlord')}}>
                  <img width="96" height="96" src="https://img.icons8.com/color/96/equal-housing-opportunity.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-white">
                    Landlord
                  </p>

                  { (isLoading && tempRole === "landlord") &&
                    <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/10'>
                        <Loader className='h-10 w-10 animate-spin'/>
                    </div> 
                  }
              </div>

              <div className='w-1/2 border flex shadow-xl flex-col relative items-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300 gap-y-2 cursor-pointer rounded-lg py-5'  onClick={() => {setTempRole("tenant");handleSelectRole('tenant')}}>
                  <img width="96" height="96" src="/tenant.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-white">
                    Tenant
                  </p>

                  { (isLoading && tempRole === "tenant") &&
                    <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/10'>
                        <Loader className='h-10 w-10 animate-spin'/>
                    </div> 
                  }
              </div>             
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderDasboardHeader()}
    </>
  );
}