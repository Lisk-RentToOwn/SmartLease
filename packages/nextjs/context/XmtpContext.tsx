
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Web3Provider } from '@ethersproject/providers';
import { Client } from '@xmtp/xmtp-js';

interface XmtpContextType {
  conversations: any[];
  sendMessage: (to: string, message: string) => Promise<void>;
  xmtpClient: Client | null;
}

const XmtpContext = createContext<XmtpContextType | undefined>(undefined);

export const XmtpProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: walletClient } = useWalletClient();
    const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const initialized = useRef(false);

    useEffect(() => {
        const init = async () => {
            if (!walletClient || initialized.current) return;
            initialized.current = true;
        
            const provider = new Web3Provider(walletClient.transport);
            const signer = provider.getSigner(walletClient.account.address);
            const cacheKey = `xmtpEnabled:${walletClient.account.address}`;
        
            try {
                const shouldInit = !!localStorage.getItem(cacheKey);
        
                if (!shouldInit) {
                    // First-time setup — will trigger signature
                    const client = await Client.create(signer, { env: 'dev' });
                    setXmtpClient(client);
                    localStorage.setItem(cacheKey, 'true');
            
                    const convs = await client.conversations.list();
                    setConversations(convs);
                    return;
                }

                // Cached client — silent reinit
                const client = await Client.create(signer, { env: 'dev' });
                setXmtpClient(client);
                const convs = await client.conversations.list();
                setConversations(convs);
        
            } catch (err) {
                console.error('Failed to initialize XMTP:', err);
            }
        };

        init();
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