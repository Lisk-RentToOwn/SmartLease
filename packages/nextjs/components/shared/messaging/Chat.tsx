'use client';

import { useXmtp } from '@/context/XmtpContext';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LucideSendHorizonal } from 'lucide-react';
import { useChatMessaging } from '@/hooks/useChatMessaging';
// import { useTenantAssignment } from '@/hooks/property/useTenantAssignment';
import { useTenantAssignment } from '@/hooks/property/usePropertyEvents';

export default function Chat() {
  const { address: walletAddress } = useAccount();
  const { conversations } = useXmtp();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useChatMessaging(selectedAddress);

  const { assignments } = useTenantAssignment(walletAddress || '');
  const tenantAddresses = assignments.flatMap(a => a.tenants);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const displayConversations = [...new Set([
    ...conversations.map(c => c.peerAddress),
    ...tenantAddresses
  ])];

  return (
    <div className='app-container pt-16 bg-white'>
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg border min-w-full min-h-[80vh]"
      >
        {/* Sidebar */}
        <ResizablePanel defaultSize={30} className='bg-chat-sidebar-gradient'>
          <div className="flex flex-col gap-y-4 p-6 py-10 ">
            <h2 className='text-2xl font-medium text-white mb-5'>Chats</h2>
            <div className='w-full h-[0.5px] bg-white/70'></div>

            {displayConversations.map(addr => (
              <div
                key={addr}
                onClick={() => setSelectedAddress(addr)}
                className={`text-white cursor-pointer ${selectedAddress === addr ? "font-bold" : ""}`}
              >
                {addr}
              </div>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Chat window */}
        <ResizablePanel defaultSize={70}>
          <div className='bg-chat-gradient w-full h-[80vh] overflow-y-auto relative'>
            <div className='h-full p-6 space-y-2'>
              {messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-lg px-4 py-2 rounded-lg text-sm ${
                      msg.senderAddress === walletAddress
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-white text-black'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              ) : (
                <div className='w-full py-20 flex justify-center'>
                    <p className="text-gray-400 text-xl">No messages yet</p>
                </div>
              )}
            </div>

            <div className='px-20 py-10 absolute bottom-0 left-0 right-0 bg-white/30 backdrop-blur-md'>
              <div className='relative w-full'>
                <input
                  className="border rounded-full bg-white/60 backdrop-blur-md border-teal-700 focus:outline-none w-full px-6 py-4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button className="text-white px-4 absolute right-3 top-1/2 -translate-y-1/2" onClick={handleSend}>
                  <LucideSendHorizonal className='text-primary' />
                </button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}