'use client';

import { useAccount } from "wagmi";
import Chat from "./Chat";


const MessageCenter = () => {

    return (
        <>      
            <div className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
                <div className='app-container'>
                    <Chat/>
                </div>
            </div>
        </>
    );
};

export default MessageCenter;