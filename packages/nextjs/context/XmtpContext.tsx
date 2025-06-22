'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Web3Provider } from '@ethersproject/providers';
import type { Client, Conversation } from '@xmtp/xmtp-js';

interface XmtpContextType {
  conversations: Conversation[];
  sendMessage: (to: string, message: string) => Promise<void>;
  xmtpClient: Client | null;
}

const XmtpContext = createContext<XmtpContextType | undefined>(undefined);

export const XmtpProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    const initXMTP = async () => {
      if (!walletClient || initialized.current || typeof window === 'undefined') return;

      initialized.current = true;

      try {
        const { Client } = await import('@xmtp/xmtp-js');

        const provider = new Web3Provider(walletClient.transport);
        const signer = provider.getSigner(walletClient.account.address);

        // Use cached identity if it exists (stored in IndexedDB automatically)
        const client = await Client.create(signer, {
          env: 'dev',
          persistConversations: true, // ✅ this one is valid
        });

        setXmtpClient(client);

        const convs = await client.conversations.list();
        setConversations(convs);
      } catch (err) {
        console.error('❌ Failed to initialize XMTP:', err);
        // Optional: reset local identity cache if corrupted
        // indexedDB.deleteDatabase('xmtp'); // advanced use
      }
    };

    initXMTP();
  }, [walletClient]);

  const sendMessage = async (to: string, message: string) => {
    if (!xmtpClient) return;
    const convo = await xmtpClient.conversations.newConversation(to);
    await convo.send(message);
  };

  return (
    <XmtpContext.Provider value={{ xmtpClient, conversations, sendMessage }}>
      {children}
    </XmtpContext.Provider>
  );
};

export const useXmtp = () => {
  const context = useContext(XmtpContext);
  if (!context) throw new Error('useXmtp must be used within XmtpProvider');
  return context;
};