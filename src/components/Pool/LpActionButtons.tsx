import { GroupData } from '@/app/stores/tradeStore';
import { cn } from '@/lib/utils';
import React from 'react';
import { ActionBoxDialog } from '../common/ActionBox/ActionBoxDialog';
import { ActionType } from '@/lib/mrgnlend';
import { Account } from '@/types/account';
import { IconMinus } from '@tabler/icons-react';
import { Button } from '../ui/button';
import { IconPlus } from '@tabler/icons-react';

type LpActionButtonsProps = {
  Account?: Account;
  activeGroup: GroupData;
  size?: 'sm' | 'lg';
};

export const LpActionButtons = ({
  size = 'sm',
  activeGroup,
}: LpActionButtonsProps) => {
  const lendingBank = React.useMemo(() => {
    if (
      activeGroup?.pool?.token.isActive &&
      activeGroup?.pool?.token.balanceWithLendingPosition?.position?.isLending
    )
      return [activeGroup?.pool?.token];
    const lendingBanks = activeGroup?.pool?.quoteTokens.filter(
      (group) =>
        group.isActive && group.balanceWithLendingPosition?.position?.isLending,
    );
    if (lendingBanks.length > 0) {
      return lendingBanks;
    }

    return null;
  }, [activeGroup?.pool?.quoteTokens, activeGroup?.pool?.token]);

  return (
    <div className={cn('flex w-full gap-3', size === 'sm' && 'justify-end')}>
      <ActionBoxDialog
        requestedBank={activeGroup.pool.quoteTokens[0]}
        requestedAction={ActionType.Deposit}
        requestedAccount={activeGroup.selectedAccount ?? undefined}
        activeGroupArg={activeGroup}
        isTokenSelectable={true}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn('min-w-16 gap-1', size === 'lg' && 'w-full')}
        >
          <IconPlus size={14} />
          Add
        </Button>
      </ActionBoxDialog>

      <ActionBoxDialog
        activeGroupArg={activeGroup}
        requestedBank={lendingBank ? lendingBank[0] : null}
        requestedAction={ActionType.Withdraw}
        requestedAccount={activeGroup.selectedAccount ?? undefined}
      >
        <Button
          variant="outline"
          size="sm"
          className={cn('min-w-16 gap-1', size === 'lg' && 'w-full')}
          disabled={!lendingBank}
        >
          <IconMinus size={14} />
          Withdraw
        </Button>
      </ActionBoxDialog>
    </div>
  );
};
