import { useEffect, useState } from 'react';
import { DecodedMessage } from '@xmtp/xmtp-js';
import { useXmtpContext } from '@/context/XmtpContext';

export const useChatMessaging = (peerAddress: string) => {
  const { xmtpClient } = useXmtpContext();
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [isPeerAvailable, setIsPeerAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!xmtpClient || !peerAddress) return;

    let mounted = true;
    const abortController = new AbortController();

    const loadConversation = async () => {
      try {
        const canMessage = await xmtpClient.canMessage(peerAddress);
        setIsPeerAvailable(canMessage);

        if (!canMessage) {
          setError('This address is not registered with XMTP V3.');
          return;
        }

        const convo = await xmtpClient.conversations.newConversation(peerAddress);
        const initialMessages = await convo.messages();
        if (!mounted) return;
        setMessages(initialMessages);

        const stream = await convo.streamMessages();

        for await (const msg of stream) {
          if (!mounted) break;
          setMessages((prev) => [...prev, msg]);
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError('Failed to load messages: ' + (e as Error).message);
          console.error('XMTP Chat Error:', e);
        }
      }
    };

    loadConversation();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [xmtpClient, peerAddress]);

  const sendMessage = async (text: string) => {
    if (!xmtpClient || !peerAddress) return;
    try {
      const canMessage = await xmtpClient.canMessage(peerAddress);
      if (!canMessage) {
        setIsPeerAvailable(false);
        setError('User is not available on XMTP V3.');
        return;
      }

      const convo = await xmtpClient.conversations.newConversation(peerAddress);
      const msg = await convo.send(text);
      setMessages((prev) => [...prev, msg]);
    } catch (e) {
      console.error('Failed to send message', e);
      setError('Message failed: ' + (e as Error).message);
    }
  };

  return { messages, sendMessage, isPeerAvailable, error };
};
