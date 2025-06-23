'use client';

import { useXmtp } from '@/context/XmtpContext';
import { useAccount } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LucideSendHorizonal } from 'lucide-react';
import { useChatMessaging } from '@/hooks/useChatMessaging';
import { useEnsProfile } from '@/hooks/useEnsProfile';
import { format } from 'date-fns';
import { getTenantLandlordAssignments } from '@/hooks/property/useTenant';
import { cn } from '@/lib/utils';
// import { getTenantLandlordAssignments } from '@/lib/helpers/getTenantLandlordAssignments';


export default function TenantChat() {
  const { address: walletAddress } = useAccount();
  const { conversations } = useXmtp();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string | undefined>();
  const [message, setMessage] = useState('');

  const { messages, sendMessage } = useChatMessaging(selectedAddress ?? "");
  const { name, avatar, loading } = useEnsProfile(walletAddress ?? "");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 🧠 Fetch landlord address once on mount
  useEffect(() => {
    if (!walletAddress) return;

    const fetchLandlord = async () => {
      const assignments = await getTenantLandlordAssignments(walletAddress);
      if (assignments.length > 0) {
        setSelectedAddress(assignments[0].landlord);
        setPropertyName(assignments[0].propertyName);
      }
    };

    fetchLandlord();
  }, [walletAddress]);

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
    <div className='mx-auto w-full max-w-screen-xl px-5 ipad:px-12 mini:px-16 pt-16'>
        <div className='w-full bg-chat-sidebar-gradient rounded-xl mb-3'>
            {selectedAddress && (
                <div
                className={`cursor-pointer py-2 px-3 rounded-md bg-white/10 flex items-center gap-3`}
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
                    <p className="text-base truncate">
                    {name || selectedAddress.slice(0, 6) + "..." + selectedAddress.slice(-4)}
                    </p>
                    {propertyName && (
                    <p className="text-sm text-white/80 italic truncate">{propertyName}</p>
                    )}
                </div>
                </div>
            )}
        </div>

      <ResizablePanelGroup direction="horizontal" className="rounded-2xl  border-gray-200 shadow-lg border min-w-full min-h-[70vh]">
        {/* Chat window */}
        <ResizablePanel defaultSize={70} className=''>
          <div className='bg-chat-gradient w-full h-[70vh] relative'>
            <div className='h-[60vh] p-6 space-y-2 overflow-y-auto custom-scrollbar'>
              {messages.length > 0 ? (
                Object.entries(grouped).map(([day, msgs]) => (
                  <div key={day}>
                    <div className="text-center text-sm text-gray-500  my-4">{day}</div>
                    <div className='flex flex-col gap-y-4'>
                      {msgs.map((msg, i) => (
                        <div key={msg.id}>
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
                          {i === msgs.length - 1 && <div ref={bottomRef} />}
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