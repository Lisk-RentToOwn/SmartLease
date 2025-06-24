import { createContext, useContext, useEffect, useState } from 'react';
import { Client, Conversation } from '@xmtp/xmtp-js';
import { useWalletClient, useAccount } from 'wagmi';
import { Web3Provider } from '@ethersproject/providers';

interface XmtpContextType {
  xmtpClient: Client | null;
  conversations: Conversation[];
  loading: boolean;
  initClient: () => Promise<void>;
}

const XmtpContext = createContext<XmtpContextType | null>(null);

export const useXmtpContext = () => {
  const ctx = useContext(XmtpContext);
  if (!ctx) throw new Error('XmtpContext not found');
  return ctx;
};

export const XmtpProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const initClient = async () => {
    if (!walletClient || !address) return;

    const provider = new Web3Provider(walletClient.transport);
    const signer = provider.getSigner(walletClient.account.address);

    setLoading(true);
    try {
      // Clean wipe - only use during development or to reset
      indexedDB.deleteDatabase('xmtp.db');
      localStorage.clear();
      sessionStorage.clear();

      const client = await Client.create(signer, {
        env: 'production',
        publishLegacyContact: false,
      });

      const isRegistered = await Client.canMessage(address);
      if (!isRegistered) throw new Error('XMTP registration failed');

      setXmtpClient(client);

      const convos = await client.conversations.list();
      const filtered = convos.filter((c) => c.context?.conversationId); // V3 only
      setConversations(filtered);
    } catch (err) {
      console.error('XMTP Init Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initClient();
  }, [walletClient, address]);

  return (
    <XmtpContext.Provider value={{ xmtpClient, conversations, loading, initClient }}>
      {children}
    </XmtpContext.Provider>
  );
};