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
import { useEnsProfile } from '@/hooks/useEnsProfile';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


type DisplayConversation = {
    address: string;
    propertyName?: string;
};

export default function Chat() {
    const { address: walletAddress } = useAccount();
    const { conversations } = useXmtp();
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const { messages, sendMessage } = useChatMessaging(selectedAddress ?? "");
    const { name, avatar, loading } = useEnsProfile(walletAddress ?? "");

    const { assignments } = useTenantAssignment(walletAddress || '');

    const assignmentConversations: DisplayConversation[] = assignments.flatMap(a =>
        a.tenants.map(t => ({ address: t, propertyName: a.propertyName }))
    );

    const xmtpConversations: DisplayConversation[] = conversations.map(c => ({
        address: c.peerAddress,
    }));

    const combinedMap = new Map<string, DisplayConversation>();

    [...assignmentConversations, ...xmtpConversations].forEach(conv => {
        if (!combinedMap.has(conv.address)) {
            combinedMap.set(conv.address, conv);
        }
    });
      
    const displayConversations = Array.from(combinedMap.values());

    const grouped = messages.reduce((acc, msg) => {
        const day = format(msg.sent, "eeee, MMMM do");
        acc[day] = acc[day] || [];
        acc[day].push(msg);
        return acc;
    }, {} as Record<string, typeof messages>);

    const handleSend = () => {
        if (message.trim()) {
        sendMessage(message.trim());
        setMessage('');
        }
    };
    


    return (
        <div className='app-container pt-16'>
        <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg border min-w-full min-h-[80vh]"
        >
            {/* Sidebar */}
            <ResizablePanel defaultSize={30} className='bg-chat-sidebar-gradient'>
            <div className="flex flex-col gap-y-4 p-6 py-10 ">
                <h2 className='text-2xl font-medium text-white mb-5'>Chats</h2>
                <div className='w-full h-[0.5px] bg-white/70'></div>

                {displayConversations.map(({ address, propertyName }) => (
                   <div
                        key={address}
                        onClick={() => setSelectedAddress(address)}
                        className={`cursor-pointer py-2 px-3 rounded-md hover:bg-white/10 flex items-center gap-3 ${
                            selectedAddress === address ? "font-bold bg-white/10" : ""
                        }`}
                    >
                    {loading ? (
                        <div className="w-8 h-8 rounded-full bg-white/30 animate-pulse" />
                    ) : (
                        <img
                        src={avatar}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border border-white/30"
                        />
                    )}
                        <div className="truncate text-white">
                            <p className="text-sm truncate">
                            {name || address.slice(0, 6) + "..." + address.slice(-4)}
                            </p>
                            {propertyName && (
                            <p className="text-xs text-white/80 italic truncate">{propertyName}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Chat window */}
            <ResizablePanel defaultSize={70}>
                <div className='bg-chat-gradient w-full h-[70vh] relative'>
                    <div className='h-[60vh] p-6 space-y-2 overflow-y-auto custom-scrollbar'>
                    {messages.length > 0 ? (
                        Object.entries(grouped).map(([day, msgs]) => (
                            <div key={day}>
                              <div className="text-center text-sm text-gray-500  my-4">{day}</div>
                              <div className='flex flex-col gap-y-4'>
                                    {msgs.map((msg, i) => (
                                        <div
                                            key={msg.id}                      
                                            className=''            
                                        >
                                            <div 
                                                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                                                    msg.senderAddress === walletAddress
                                                      ? 'bg-[#00C2BA] text-white ml-auto w-max  text-end'
                                                      : 'bg-gray-300 text-slate-600 w-max text-start'
                                                  }`}
                                            >
                                                <p className='text-base'>{msg.content}</p>
                                                <span className={cn("block text-xs text-gray-500 text-left opacity-80",
                                 {"text-white/90": msg.senderAddress === walletAddress}
                                 )}>
                                                    {format(new Date(msg.sent), "hh:mm a")}
                                                    {msg.isPending && ' • Sending...'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                              </div>
                            </div>
                        ))
                    ) : (
                        <div className='w-full py-20 flex justify-center'>
                            <p className="text-gray-400 text-xl">No messages yet</p>
                        </div>
                    )}
                    </div>

                    <div className='px-20 py-6 absolute bottom-0 left-0 right-0'>
                        <div className='relative w-full'>
                            <input
                            className="border rounded-full bg-gray-200 shadow-lg focus:outline-none w-full px-6 py-4"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            />
                            <button
                            className="text-white px-4 absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={handleSend}
                            >
                            <LucideSendHorizonal className='text-slate-400' />
                            </button>
                        </div>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
        </div>
    );
}