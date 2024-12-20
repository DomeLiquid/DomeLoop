import React from 'react';

import { PositionListItem } from './PositionListItem';
import { GroupData } from '@/app/stores/tradeStore';
import { useTradeStore } from '@/app/stores';
import {
  Table,
  TableBody,
  TableRow,
  TableHeader,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export const PositionList = ({ activeGroupId }: { activeGroupId: string }) => {
  const [portfolio] = useTradeStore((state) => [state.portfolio]);

  const portfolioCombined = React.useMemo(() => {
    if (!portfolio) return [];
    const isActiveGroupPosition = (item: GroupData) =>
      item.groupId === activeGroupId;

    const activeGroupPosition = [...portfolio.long, ...portfolio.short].find(
      isActiveGroupPosition,
    );

    const sortedLongs = portfolio.long.filter(
      (item) => !isActiveGroupPosition(item),
    );
    const sortedShorts = portfolio.short.filter(
      (item) => !isActiveGroupPosition(item),
    );

    return [
      ...(activeGroupPosition ? [activeGroupPosition] : []),
      ...sortedLongs,
      ...sortedShorts,
    ];
  }, [activeGroupId, portfolio]);

  if (!portfolio)
    return (
      <>
        <p className="pt-2 text-sm text-muted-foreground">No positions found</p>
      </>
    );

  return (
    <div className="rounded-xl">
      <Table className="min-w-[1080px] overflow-auto">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[14%]">Position</TableHead>
            <TableHead className="w-[14%]">Token</TableHead>
            <TableHead className="w-[14%]">Value</TableHead>
            <TableHead className="w-[14%]">Leverage</TableHead>
            <TableHead className="w-[14%]">Size</TableHead>
            <TableHead className="w-[14%]">Price</TableHead>
            <TableHead className="w-[14%]">Liquidation price</TableHead>
            <TableHead className="w-[14%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolio.long.length === 0 && portfolio.short.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <p className="pt-2 text-sm text-muted-foreground">
                  No positions found
                </p>
              </TableCell>
            </TableRow>
          ) : (
            // TODO: Add loading state
            <></>
          )}
          {portfolioCombined.map((group, index) => {
            return <PositionListItem key={index} group={group} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
};
