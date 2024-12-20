import React from 'react';

import { ActionType, ExtendedBankInfo, RepayType } from '@/lib/mrgnlend';
import { LendingModes } from '@/types/type';
import { Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface InputHeaderActionProps {
  actionType: ActionType;
  bank: ExtendedBankInfo | null;
  isDialog?: boolean;
  repayType: RepayType;

  changeRepayType: (repayType: RepayType) => void;
  changeActionType: (actionType: ActionType) => void;
}

interface ToggleObject {
  toggles: { value: string; text: string }[];
  action: (value: any) => void;
  value: string;
}

export const InputHeaderActionLeft = ({
  actionType,
  bank,
  isDialog,
  repayType,

  changeRepayType,
  changeActionType,
}: InputHeaderActionProps) => {
  const isSolBank = React.useMemo(() => bank?.token.symbol === 'SOL', [bank]);

  const titleText = React.useMemo(() => {
    const actionTitles: { [key in ActionType]?: string } = {
      [ActionType.Borrow]: 'You borrow',
      [ActionType.Deposit]: 'You supply',
      [ActionType.Withdraw]: 'You withdraw',
      [ActionType.Repay]: '',
      // [ActionType.MintLST]: isSolBank ? "You stake" : "You swap",
      // [ActionType.UnstakeLST]: "You unstake",
    };

    return actionTitles[actionType] || '';
  }, [actionType, isSolBank]);

  const toggleObject = React.useMemo(() => {
    if (
      !isDialog &&
      (actionType === ActionType.Borrow || actionType === ActionType.Deposit)
    ) {
      return {
        toggles: [
          { value: ActionType.Deposit, text: LendingModes.LEND },
          { value: ActionType.Borrow, text: LendingModes.BORROW },
        ],
        action: (value: any) => {
          if (value) changeActionType(value);
        },
        value: actionType,
      } as ToggleObject;
    }

    if (actionType === ActionType.Repay) {
      return {
        toggles: [
          { value: RepayType.RepayRaw, text: 'Repay' },
          // {
          //   value: RepayType.RepayCollat,
          //   text: (
          //     <div className="flex items-center gap-2">
          //       <Sparkles size={16} /> Collateral Repay
          //     </div>
          //   ),
          // },
        ],
        action: (value: any) => {
          if (value) changeRepayType(value);
        },
        value: repayType,
      } as ToggleObject;
    }

    return titleText;
  }, [
    isDialog,
    actionType,
    titleText,
    changeActionType,
    repayType,
    changeRepayType,
  ]);

  return (
    <>
      {/* Lending page header */}
      {typeof toggleObject !== 'string' ? (
        <div>
          <ToggleGroup
            type="single"
            className="bg-background"
            value={toggleObject.value}
            onValueChange={toggleObject.action}
          >
            {toggleObject.toggles.map((toggle, idx) => (
              <ToggleGroupItem
                key={idx}
                value={toggle.value}
                aria-label={toggle.value}
                className="capitalize"
              >
                {toggle.text}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : (
        <span className="text-sm font-normal text-muted-foreground">
          {toggleObject}
        </span>
      )}
    </>
  );
};
