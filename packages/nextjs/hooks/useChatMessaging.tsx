import { useEffect, useState } from 'react';
import { useXmtp } from '@/context/XmtpContext';

export function useChatMessaging(peerAddress: string | null) {
  const { xmtpClient } = useXmtp();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!peerAddress || !xmtpClient) return;

      const canMessage = await xmtpClient.canMessage(peerAddress);
      if (!canMessage) return;

      const convo = await xmtpClient.conversations.newConversation(peerAddress);
      setConversation(convo);

      const msgs = await convo.messages();
      setMessages(msgs);

      const stream = await convo.streamMessages();
      for await (const msg of stream) {
        setMessages(prev => [...prev, msg]);
      }
    };

    loadMessages();
  }, [peerAddress, xmtpClient]);

  const sendMessage = async (content: string) => {
    if (!conversation) return;
    await conversation.send(content);
    setMessages(prev => [...prev, {
      content,
      //@ts-ignore
      senderAddress: xmtpClient.address
    }]);
  };

  return { messages, sendMessage };
}