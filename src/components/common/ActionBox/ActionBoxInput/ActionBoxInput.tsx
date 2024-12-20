import { useUiStore } from '@/app/stores';
import { useTradeStore } from '@/app/stores';
import { GroupData } from '@/app/stores/tradeStore';
import { useActionBoxStore } from '@/hooks/useActionBoxStore';
import { ActionType, ExtendedBankInfo } from '@/lib/mrgnlend';
import { Account } from '@/types/account';
import React from 'react';
import { InputAction, InputHeader } from './Components';
import { Input } from '@/components/ui/input';
import { ActionBoxTokens } from '../ActionBoxTokens';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ActionBoxInputProps = {
  walletAmount: number | undefined;
  amountRaw: string;
  maxAmount: number;
  selectedAccount: Account | null;
  showCloseBalance?: boolean;
  isDialog?: boolean;
  isTokenSelectable?: boolean;
  tokensOverride?: ExtendedBankInfo[];
  activeGroup: GroupData | null;
};

export const ActionBoxInput = ({
  walletAmount,
  maxAmount,
  showCloseBalance,
  selectedAccount,
  isDialog,
  isTokenSelectable,
  tokensOverride,
  activeGroup,
}: ActionBoxInputProps) => {
  const [isActionBoxInputFocussed, setIsActionBoxInputFocussed] = useUiStore(
    (state) => [
      state.isActionBoxInputFocussed,
      state.setIsActionBoxInputFocussed,
    ],
  );
  const [
    actionMode,
    repayMode,
    selectedBank,
    selectedRepayBank,
    amountRaw,
    repayAmountRaw,
    setAmountRaw,
    setRepayAmountRaw,
    setSelectedBank,
    setRepayBank,
    setRepayMode,
    setActionMode,
  ] = useActionBoxStore(isDialog)((state) => [
    state.actionMode,
    state.repayMode,
    state.selectedBank,
    state.selectedRepayBank,
    state.amountRaw,
    state.repayAmountRaw,
    state.setAmountRaw,
    state.setRepayAmountRaw,
    state.setSelectedBank,
    state.setRepayBank,
    state.setRepayMode,
    state.setActionMode,
  ]);

  const [isAllMode, setIsAllMode] = React.useState(false);

  const amountInputRef = React.useRef<HTMLInputElement>(null);

  const isInputDisabled = React.useMemo(() => isAllMode, [isAllMode]);

  const inputAmount = React.useMemo(() => amountRaw, [amountRaw]);

  const formatAmount = (newAmount: string) => {
    return newAmount;
  };

  const handleInputChange = React.useCallback(
    (newAmount: string) => {
      setAmountRaw(formatAmount(newAmount), maxAmount);
    },
    [setAmountRaw, maxAmount],
  );

  // Reset input state when dialog closes
  React.useEffect(() => {
    if (isDialog) {
      return () => {
        setAmountRaw('', 0);
        setIsAllMode(false);
      };
    }
  }, [isDialog, setAmountRaw]);

  // When isAllMode is true, set amount to maxAmount
  React.useEffect(() => {
    if (isAllMode) {
      setAmountRaw(maxAmount.toString(), maxAmount);
    }
  }, [isAllMode, maxAmount, setAmountRaw]);

  const showAllOption = React.useMemo(() => {
    return (
      actionMode === ActionType.Withdraw || actionMode === ActionType.Repay
    );
  }, [actionMode]);

  return (
    <>
      <InputHeader
        isDialog={isDialog}
        changeRepayType={(type) => setRepayMode(type)}
        changeActionType={(type) => setActionMode(type)}
      />
      <div className="mb-6 rounded-lg bg-accent p-2.5">
        <div className="flex items-center justify-center gap-1 text-3xl font-medium">
          <div className="w-full max-w-[162px] flex-auto">
            <ActionBoxTokens
              isDialog={isDialog}
              setRepayTokenBank={(tokenBank) => {
                setRepayBank(tokenBank);
              }}
              setTokenBank={(tokenBank) => {
                setSelectedBank(tokenBank);
              }}
              tokensOverride={tokensOverride}
              isTokenSelectable={isTokenSelectable}
              activeGroup={activeGroup}
            />
          </div>
          <div className="relative flex-1">
            <Input
              type="text"
              ref={amountInputRef}
              inputMode="decimal"
              value={inputAmount}
              disabled={isInputDisabled}
              onChange={(e) => {
                handleInputChange(e.target.value);
              }}
              onFocus={() => setIsActionBoxInputFocussed(true)}
              onBlur={() => setIsActionBoxInputFocussed(false)}
              placeholder="0"
              className="min-w-[130px] border-none bg-transparent text-right text-base font-medium shadow-none outline-none focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
        </div>
        {showAllOption && (
          <div className="mt-2 flex items-center space-x-2">
            <Checkbox
              id="all-mode"
              checked={isAllMode}
              onCheckedChange={(checked) => {
                setIsAllMode(checked as boolean);
              }}
              className="peer-disabled:border-muted-border"
            />
            <Label
              htmlFor="all-mode"
              className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {actionMode === ActionType.Withdraw
                ? 'Withdraw all'
                : 'Repay all'}
            </Label>
          </div>
        )}
        <InputAction
          walletAmount={walletAmount}
          maxAmount={maxAmount}
          isDialog={isDialog}
          onSetAmountRaw={(amount) => handleInputChange(amount)}
        />
      </div>
    </>
  );
};
