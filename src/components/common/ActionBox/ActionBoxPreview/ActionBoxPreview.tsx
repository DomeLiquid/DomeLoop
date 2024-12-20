import React from 'react';
import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { GroupData } from '@/app/stores/tradeStore';

import { LendingPreview } from './Components';

interface ActionBoxPreviewProps {
  selectedBank: ExtendedBankInfo | null;
  activeGroup: GroupData | null;
  actionMode: ActionType;
  amount: number;
  // slippageBps: number;
  isEnabled: boolean;
  // repayWithCollatOptions?: RepayWithCollatOptions;
  // addAdditionalsPopup: (actions: ActionMethod[]) => void;
  children: React.ReactNode;
}

export const ActionBoxPreview = ({
  selectedBank,
  activeGroup,
  actionMode,
  amount,
  // slippageBps,
  isEnabled,
  // repayWithCollatOptions,
  // addAdditionalsPopup,
  children,
}: ActionBoxPreviewProps) => {
  const isInLendingMode = React.useMemo(
    () =>
      actionMode === ActionType.Borrow ||
      actionMode === ActionType.Deposit ||
      actionMode === ActionType.Repay ||
      actionMode === ActionType.Withdraw,
    [actionMode],
  );

  return (
    <>
      {isInLendingMode && (
        <LendingPreview
          selectedBank={selectedBank}
          activeGroup={activeGroup}
          actionMode={actionMode}
          isEnabled={isEnabled}
          amount={amount}
          // repayWithCollatOptions={repayWithCollatOptions}
          // addAdditionalsPopup={addAdditionalsPopup}
        >
          {children}
        </LendingPreview>
      )}
    </>
  );
};
