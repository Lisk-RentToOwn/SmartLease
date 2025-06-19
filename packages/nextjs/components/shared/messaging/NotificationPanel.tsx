'use client';
import { PushContextProps, usePushProtocol } from '@/context/PushContext';
  import { useEffect } from 'react';

  export default function NotificationPanel() {
    const { notifications} = usePushProtocol() as PushContextProps;


  return (
    <div className="p-4">
      
      <ul className='flex flex-col gap-y-3'>
        {notifications.map((notif, idx) => (
          <li key={idx} className="border-b py-2">
            <p className="font-medium">{notif.title}</p>
            <p className="text-sm">{notif.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
