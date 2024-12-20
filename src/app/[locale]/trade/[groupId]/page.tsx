/* eslint-disable no-restricted-imports */
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useTradeStore } from '@/app/stores';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks';
import { GroupData } from '@/app/stores/tradeStore';
import { Loader } from '@/components/Loader';
import { PoolTradeHeader } from '@/components/Pool/PoolTradeHeader';
import { TradingBox } from '@/components/TradingBox';
import { PositionList } from '@/components/portfolio/PositionList/PositionList';
import TVWidget from '@/components/TVWidget/TVWidget';

export default function TradePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const side = searchParams.get('side') as 'long' | 'short';
  const { groupId } = params;

  const [initialized, groupMap] = useTradeStore((state) => [
    state.initialized,
    state.groupMap,
  ]);

  const [activeGroup, setActiveGroup] = React.useState<GroupData | null>(null);

  React.useEffect(() => {
    if (!initialized) return;

    if (!groupId) {
      router.push('/404');
      return;
    }

    const group = groupMap.get(groupId as string);
    if (!group) {
      router.push('/404');
      return;
    }

    setActiveGroup(group);
  }, [initialized, groupMap, groupId, router]);

  return (
    <div>
      {(!initialized || !activeGroup) && (
        <Loader label="Loading the dome loop..." className="mt-8" />
      )}
      {initialized && activeGroup && (
        <div className="w-full space-y-4">
          <PoolTradeHeader activeGroup={activeGroup} />
          <div className="space-y-4 rounded-xl">
            <div className="relative flex w-full">
              <div className="flex w-full flex-col-reverse gap-4 lg:flex-row">
                <div className="flex-4 w-full overflow-hidden rounded-xl border bg-background">
                  <TVWidget token={activeGroup.pool.token} />
                </div>
                <div className="flex w-full lg:ml-auto lg:max-w-sm">
                  <TradingBox activeGroup={activeGroup} side={side} />
                </div>
              </div>
            </div>
            <PositionList activeGroupId={activeGroup.groupId} />
            {/* {!isMobile && (
              <div className="pt-4">
                <PositionList activeGroupId={activeGroup.groupId} />
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
