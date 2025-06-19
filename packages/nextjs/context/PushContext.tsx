'use client';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Web3Provider } from '@ethersproject/providers';
import { fetchUserNotifications } from '@/utils/push';
import { createPushUser } from '@/lib/pushClient';

export type PushContextProps = {
    notifications: any[]
    setNotifications: Dispatch<SetStateAction<any[]>>
    user: any
}

const PushContext = createContext<PushContextProps | null>(null);

export const PushProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (!walletClient || initialized.current) return;
      initialized.current = true;

      const address = walletClient.account.address;
      const provider = new Web3Provider(walletClient.transport);
      const signer = provider.getSigner(address);

      const pushKey = `pushEnabled:${address}`;

      if (!localStorage.getItem(pushKey)) {
        const pushUser = await createPushUser(signer);
        setUser(pushUser);
        localStorage.setItem(pushKey, 'true');
      }

      const data = await fetchUserNotifications(address);
      setNotifications(data);
    };

    init();
  }, [walletClient]);

  return (
    <PushContext.Provider value={{ user, notifications, setNotifications }}>
      {children}
    </PushContext.Provider>
  );
};

export const usePushProtocol = (): PushContextProps | string => {
    const context = useContext(PushContext)

    if (!context) {
        return "usePushProtocol must be used within a PushProvider";
    }

    const {notifications, setNotifications, user} = context
    return {
        notifications,
        setNotifications,
        user
    }
};