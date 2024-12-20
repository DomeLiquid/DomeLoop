'use client';

import { useTradeStore } from '@/app/stores';
import { useRouter } from '@/navigation';
import React from 'react';

// @ts-ignore - Safe because context hook checks for null
const TradeContext = React.createContext<>();

export const TradePovider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();
  const debounceId = React.useRef<NodeJS.Timeout | null>(null);

  const [fetchTradeState, setIsRefreshingStore] = useTradeStore((state) => [
    state.fetchTradeState,
    state.setIsRefreshingStore,
  ]);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const fetchData = () => {
      setIsRefreshingStore(true);
      fetchTradeState({});
    };

    if (debounceId.current) {
      clearTimeout(debounceId.current);
    }

    debounceId.current = setTimeout(() => {
      fetchData();

      const id = setInterval(() => {
        setIsRefreshingStore(true);
        fetchTradeState({});
      }, 50_000);

      return () => {
        clearInterval(id);
        clearTimeout(debounceId.current!);
      };
    }, 1000);

    return () => {
      if (debounceId.current) {
        clearTimeout(debounceId.current);
      }
    };
  }, []);
  return <TradeContext.Provider value={{}}>{children}</TradeContext.Provider>;
};
