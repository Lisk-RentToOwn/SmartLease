'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  setUserRole,
  getUserRole,
  clearUserRole,
} from '@/lib/cookies';
import { checkUserExistsAndRole, registerUserRole} from '@/services/request/user-request';

export function WalletWatcher() {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [hasHandled, setHasHandled] = useState(false);
  const role = getUserRole()

  useEffect(() => {
    if (!isConnected || !address || hasHandled) return;

    const onboard = async () => {
      const cookieRole = getUserRole();
      if (cookieRole) {
        router.push(`/${cookieRole}`);
        setHasHandled(true);
        return;
      }

      const result = await checkUserExistsAndRole(address);
      if (result.exists) {
        setUserRole(result.role!);
        router.push(`/${result.role}`);
      } else {
        setShowRoleModal(true);
      }

      setHasHandled(true);
    };

    onboard();
  }, [isConnected, address, hasHandled, router]);

  useEffect(() => {
    if (!isConnected && hasHandled) {
      clearUserRole();
      setHasHandled(false);
      setShowRoleModal(false);
      router.push('/');
    }
  }, [isConnected, hasHandled, router]);

  const handleSelectRole = async (role: 'tenant' | 'landlord') => {
    if (!address) return;
    await registerUserRole(address, role);
    setUserRole(role);
    setShowRoleModal(false);
    router.push(`/${role}`);
  };

  const renderDasboardHeader = useCallback(() => {
    return (
      <>
        { (role !== undefined && isConnected) &&
            <div className="">
                <Button className="bg-white border-primary border text-primary rounded-lg py-6 hover:bg-white px-4 shadow-none">Dashbboard</Button>
            </div>
        }
        { (role === undefined && isConnected) &&
            <div className="">
                <Button onClick={() => {setShowRoleModal(true)}} className="bg-white border-primary border text-primary rounded-lg py-6 hover:bg-white px-4 shadow-none">Select Role</Button>
            </div>
        }
      </>
    )
  }, [role, address])


  return (
    <>
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className='text-xl mb-3'>Please select your role to proceed</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className='w-1/2 border flex flex-col items-center gap-y-2 border-gray-300 hover:border-primary cursor-pointer rounded-lg py-5'  onClick={() => handleSelectRole('landlord')}>
                  <img width="96" height="96" src="https://img.icons8.com/color/96/equal-housing-opportunity.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-blue-600">
                    Landlord
                  </p>
              </div>

              <div className='w-1/2 border flex flex-col items-center gap-y-2 border-gray-300 hover:border-primary cursor-pointer rounded-lg py-5'  onClick={() => handleSelectRole('tenant')}>
                  <img width="96" height="96" src="/tenant.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-blue-600">
                    Tenant
                  </p>
              </div>             
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderDasboardHeader()}
    </>
  );
}