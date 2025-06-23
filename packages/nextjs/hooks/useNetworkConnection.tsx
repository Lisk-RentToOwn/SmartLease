import { useEffect, useState } from 'react';
import { toast } from 'sonner'; // or your toast lib

export const useNetworkStatusToast = () => {
  const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            if (!hasShown) {
                toast.error('⚠ No internet connection detected. Please check your network.');
                setHasShown(true);
            }
        };

        const handleOnline = () => {
            if (hasShown) {
                toast.success('✅ Internet connection restored.');
                setHasShown(false);
            }
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        // initial state check
        if (!navigator.onLine) handleOffline();

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [hasShown]);
};