'use client';

import Chat from './Chat'; // You’ll build this with XMTP

const MessageCenter = () => {

    return (
        <>      
            <div className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
                <div className='app-container'>
                    {/* <Tabs defaultValue="notifications">
                        <TabsList className="w-full justify-center">
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                        </TabsList>

                        <TabsContent value="notifications">
                            <NotificationPanel />
                        </TabsContent>

                        <TabsContent value="chat">
                            <Chat />
                        </TabsContent>
                    </Tabs> */}

                    <Chat/>
                </div>
            </div>
        </>
    );
};

export default MessageCenter;