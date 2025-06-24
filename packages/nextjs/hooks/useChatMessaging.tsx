import { useEffect, useState } from 'react';
import { useXmtp } from '@/context/XmtpContext';
import { useAccount } from 'wagmi';

interface MessageWithMeta {
    id: string;
    content: string;
    senderAddress: string;
    sent: Date;
    isPending?: boolean;
}

export function useChatMessaging(peerAddress?: string) {
    const { xmtpClient } = useXmtp();
    const { address: selfAddress } = useAccount();
    const [messages, setMessages] = useState<MessageWithMeta[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!xmtpClient || !peerAddress) return;
        let convo: any;
        let cancel = false;
  
        const load = async () => {
            convo = await xmtpClient.conversations.newConversation(peerAddress);
            const history = await convo.messages();
    
            setMessages(prev => deduplicate([
            ...prev,
            //@ts-ignore
            ...history.map((msg) => ({
                id: msg.id,
                content: msg.content,
                senderAddress: msg.senderAddress,
                sent: msg.sent,
            }))
            ]));
    
            for await (const msg of await convo.streamMessages()) {
                if (cancel) break;
            
                setMessages(prev => {
                const match = prev.find(m =>
                    m.isPending &&
                    normalize(m.content) === normalize(msg.content) &&
                    m.senderAddress === msg.senderAddress &&
                    Math.abs(m.sent.getTime() - msg.sent.getTime()) < 10000 // 10 sec threshold
                );
            
                if (match) {
                    // Replace pending message with confirmed one
                    return [
                    ...prev.filter(m => m.id !== match.id),
                    {
                        id: msg.id,
                        content: msg.content,
                        senderAddress: msg.senderAddress,
                        sent: msg.sent,
                    }
                    ];
                }
            
                // No match — safe to append
                const alreadyExists = prev.some(m => m.id === msg.id);
                if (alreadyExists) return prev;
            
                return [...prev, {
                    id: msg.id,
                    content: msg.content,
                    senderAddress: msg.senderAddress,
                    sent: msg.sent,
                }];
                });
            }
        };
    
        load();
        return () => { cancel = true; };
    }, [xmtpClient, peerAddress]);

    const sendMessage = async (text: string) => {
        if (!xmtpClient || !peerAddress) return;
        setLoading(true);
    
        const convo = await xmtpClient.conversations.newConversation(peerAddress);
        const now = new Date();
        const tempId = `pending-${now.getTime()}`;
    
        const pendingMessage: MessageWithMeta = {
            id: tempId,
            content: text,
            senderAddress: selfAddress!,
            sent: now,
            isPending: true
        };

        setMessages(prev => [...prev, pendingMessage]);
        try {
            await convo.send(text);
        } catch (err) {
            console.error('Message send failed', err);
        } finally {
            setLoading(false);
        }
    };

    return { messages, sendMessage, loading };
}


function deduplicate(msgs: MessageWithMeta[]) {
    const seen = new Set<string>();
    return msgs.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
    });
}


function normalize(str: string) {
    return str.trim().toLowerCase();
}