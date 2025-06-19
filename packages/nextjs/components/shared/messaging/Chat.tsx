'use client';
import { useXmtp } from '@/context/XmtpContext';
import { useEffect, useState } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import { LucideSend, LucideSendHorizonal } from 'lucide-react';

export default function Chat() {
  const { conversations, sendMessage } = useXmtp();
  const [message, setMessage] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const handleSend = () => {
    if (selectedAddress && message) {
      sendMessage(selectedAddress, message);
      setMessage('');
    }
  };

  return (
        <>
            <div className='app-container pt-16 bg-white'>
                <ResizablePanelGroup
                    direction="horizontal"
                    className="rounded-lg border min-w-full min-h-[80vh]"
                >
                    <ResizablePanel defaultSize={30}>
                        <div className="flex flex-col gap-y-4 p-6 py-10">
                            <div className=''>
                                <h2 className='text-2xl font-medium text-slate-800 mb-8'>Chats</h2>
                            </div>

                            {conversations.map((conv) => (
                                <div key={conv.peerAddress} onClick={()=>{setSelectedAddress(conv.peerAddress)}}>
                                    {conv.peerAddress}
                                </div>
                            ))}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel defaultSize={70}>
                        <div className='bg-gray-100 w-full h-[80vh] overflow-y-auto relative'>
                            <div className='h-full'>

                            </div>

                            <div className='px-20 py-10 absolute bottom-0 left-0 right-0'>
                                <div className='relative w-full pb-0'>
                                    <input
                                        className="border mb-2 w-full resize-none focus:border-primary px-6 py-4"
                                        // rows={1}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />

                                    <button className="text-white px-4 absolute right-3 top-1/2 -translate-y-1/2" onClick={handleSend}>
                                        <LucideSendHorizonal className='text-primary'/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>        
        </>
    );
}